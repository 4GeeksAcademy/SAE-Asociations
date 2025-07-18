from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..models import db, Event
from datetime import datetime
from ..schemas.event_schema import check_event_data
from sqlalchemy import desc, asc

events_bp = Blueprint("events", __name__)


@events_bp.route("/", methods=["GET"])
@jwt_required(optional=True)
def get_all_events(): 
    """Obtener todos los eventos disponibles con filtros sencillos."""
    
    # Obtener los parámetros de consulta de la URL (si no existen, serán None)
    association_id_param = request.args.get('association_id')
    city_filter = request.args.get('city')
    event_type_filter = request.args.get('event_type')
    sort_by_date = request.args.get('sort_by_date') # No ponemos 'newest' por defecto aquí. Lo gestionará el frontend.

    # 1. Iniciar la consulta base: Solo eventos activos
    query = Event.query.filter_by(is_active=True)

    # 2. Aplicar filtro por ID de asociación si está presente y es válido
    if association_id_param:
        try:
            association_id = int(association_id_param)
            query = query.filter_by(association_id=association_id)
        except ValueError:
            # Si el ID de asociación no es un número, devolvemos un error.
            return jsonify({"error": "ID de asociación inválido."}), 400

    # 3. Aplicar filtro de ciudad si está presente y no está vacío
    if city_filter:
        query = query.filter(Event.city.ilike(f"%{city_filter}%"))

    # 4. Aplicar filtro de tipo de evento si está presente y no está vacío
    # Asumimos una coincidencia exacta para el tipo de evento.
    if event_type_filter:
        query = query.filter(Event.event_type == event_type_filter)

    # 5. Aplicar ordenación por fecha si está presente
    if sort_by_date == 'newest':
        query = query.order_by(desc(Event.date)) # Más recientes primero
    elif sort_by_date == 'oldest':
        query = query.order_by(asc(Event.date)) # Más antiguos primero

    # 6. Ejecutar la consulta
    events = query.all()

    # 7. Serializar los resultados
    serialized_events = [event.serialize() for event in events]

    # 8. Devolver la respuesta
    if not serialized_events:
        return jsonify({"message": "No se encontraron eventos con los criterios seleccionados.", "events": []}), 200
    else:
        # Si hay eventos, se devuelve el array de eventos directamente
        return jsonify(serialized_events), 200


@events_bp.route("/<int:event_id>", methods=["GET"])
@jwt_required(optional=True)
def get_event(event_id):
    """Obtener los detalles de un evento específico por su ID."""
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento no encontrado."}), 404
    
    if not event.is_active:
        claims = get_jwt()
        if not claims or claims.get('role') != 'association':
            return jsonify({"error": "Evento no encontrado."}), 404
        
        association_data = claims.get('association')
        if not association_data or event.association_id != association_data['id']:
            return jsonify({"error": "Evento no encontrado."}), 404
    
    return jsonify(event.serialize()), 200


@events_bp.route("/", methods=["POST"])
@jwt_required()
def create_event():
    """Crear un nuevo evento (solo asociaciones)."""
    claims = get_jwt()

    if claims.get('role') != 'association':
        return jsonify({"error": "Permiso denegado. Solo las asociaciones pueden crear eventos."}), 403

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Formato de petición JSON inválido."}), 400

    validation_error_response = check_event_data(data)
    if validation_error_response:
        # Esto ya devuelve un 422 con los errores detallados
        return validation_error_response

    association_data = claims.get('association')
    if not association_data:
        # Este caso es poco probable si el token está bien generado para una asociación
        return jsonify({"error": "Error de autenticación: Datos de asociación no encontrados."}), 401

    try:

        max_volunteers_value = data.get("max_volunteers")
        if max_volunteers_value == "": # Si el frontend envía un string vacío
            max_volunteers_value = None
        elif max_volunteers_value is not None:
            max_volunteers_value = int(max_volunteers_value) 

        # Crear la instancia del evento
        new_event = Event(
            title=data["title"],
            description=data.get("description"),
            image_url=data.get("image_url"),
            date=datetime.fromisoformat(data["date"]),
            city=data["city"],
            address=data.get("address"),
            event_type=data.get("event_type"),
            association_id=association_data['id'],
            max_volunteers=max_volunteers_value
        )

        db.session.add(new_event)
        db.session.commit()

        return jsonify({
            "message": "Evento creado con éxito.",
            "event": new_event.serialize()
        }), 201

    except Exception as e:
        # Captura cualquier otro error inesperado durante la creación o el commit
        return jsonify({"error": "Error interno del servidor al crear el evento."}), 500


@events_bp.route("/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    """Actualizar un evento (solo la asociación propietaria)."""
    claims = get_jwt()

    if claims.get('role') != 'association':
        return jsonify({"error": "Permiso denegado. Solo las asociaciones pueden actualizar eventos."}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento no encontrado."}), 404

    association_data = claims.get('association')
    if not association_data or event.association_id != association_data['id']:
        return jsonify({"error": "Permiso denegado. No eres el propietario de este evento."}), 403

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Formato de petición JSON inválido."}), 400

    # Revalidar los datos que llegan en la actualización
    validation_error_response = check_event_data(data)
    if validation_error_response:
        return validation_error_response

    try:
        event.title = data.get("title", event.title)
        event.description = data.get("description", event.description)
        event.image_url = data.get("image_url", event.image_url)
        event.city = data.get("city", event.city)
        event.address = data.get("address", event.address)
        event.event_type = data.get("event_type", event.event_type) 

        if data.get("date"):
            event.date = datetime.fromisoformat(data["date"])

        if "max_volunteers" in data:  # Solo si el campo está presente en la petición PUT
                max_volunteers_value = data.get("max_volunteers")
                if max_volunteers_value == "":  # Si el frontend envía un string vacío
                    event.max_volunteers = None
                elif max_volunteers_value is not None:
                    # Ya se ha validado en check_event_data que si no es None/"" es convertible a int
                    event.max_volunteers = int(max_volunteers_value)
                else:  # Si se envía explícitamente null desde el JSON
                    event.max_volunteers = None


        db.session.commit()

        return jsonify({
            "message": "Evento actualizado con éxito.",
            "event": event.serialize()
        }), 200

    except ValueError:
        return jsonify({"error": "El formato de la fecha es inválido."}), 422
    except Exception as e:
        return jsonify({"error": "Error interno del servidor al actualizar el evento."}), 500


@events_bp.route("/<int:event_id>/deactivate", methods=["PATCH"])
@jwt_required()
def deactivate_event(event_id):
    """Desactivar un evento (solo la asociación propietaria)."""
    claims = get_jwt()

    if claims.get('role') != 'association':
        return jsonify({"error": "Permiso denegado. Solo las asociaciones pueden desactivar eventos."}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento no encontrado."}), 404

    association_data = claims.get('association')
    if not association_data or event.association_id != association_data['id']:
        return jsonify({"error": "Permiso denegado. No eres el propietario de este evento."}), 403

    if not event.is_active:
        return jsonify({"error": "El evento ya está desactivado."}), 400

    try:
        event.is_active = False
        db.session.commit()

        return jsonify({
            "message": "Evento desactivado con éxito.",
            "event": event.serialize()
        }), 200

    except Exception as e:
        return jsonify({"error": "Error interno del servidor al desactivar el evento."}), 500
