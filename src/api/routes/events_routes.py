from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..models import db, Event 
from datetime import datetime
from ..schemas.event_schema import check_event_data

events_bp = Blueprint("events", __name__)


@events_bp.route("/", methods=["GET"])
@jwt_required(optional=True)
def get_all_events():
    """Obtener todos los eventos disponibles."""
    claims = get_jwt()
    
    # Si es una asociación, mostrar todos sus eventos (activos e inactivos)
    if claims and claims.get('role') == 'association':
        association_data = claims.get('association')
        if association_data:
            # Mostrar todos los eventos de la asociación (activos e inactivos)
            events = Event.query.filter_by(association_id=association_data['id']).all()
        else:
            # Si hay error en los datos de la asociación, mostrar solo activos
            events = Event.query.filter_by(is_active=True).all()
    else:
        # Para usuarios normales y no autenticados, mostrar solo eventos activos
        events = Event.query.filter_by(is_active=True).all()
    
    return jsonify([event.serialize() for event in events]), 200


@events_bp.route("/<int:event_id>", methods=["GET"])
@jwt_required(optional=True)
def get_event(event_id):
    """Obtener los detalles de un evento específico por su ID."""
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento no encontrado."}), 404
    
    # Si el evento está inactivo, solo permitir acceso a la asociación propietaria
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

    # Verificar rol de usuario
    if claims.get('role') != 'association':
        return jsonify({"error": "Permiso denegado. Solo las asociaciones pueden crear eventos."}), 403

    # Obtener y validar el JSON. `silent=True` evita errores si el body no es JSON válido.
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Formato de petición JSON inválido."}), 400

    # Validar datos del evento con el esquema definido
    validation_error_response = check_event_data(data)
    if validation_error_response:
        return validation_error_response # Esto ya devuelve un 422 con los errores detallados

    # Obtener ID de la asociación del token JWT
    association_data = claims.get('association')
    if not association_data:
        # Este caso es poco probable si el token está bien generado para una asociación
        return jsonify({"error": "Error de autenticación: Datos de asociación no encontrados."}), 401 

    try:
        # Crear la instancia del evento
        new_event = Event(
            title=data["title"],
            description=data.get("description"),
            image_url=data.get("image_url"),
            date=datetime.fromisoformat(data["date"]),
            association_id=association_data['id']
        )

        db.session.add(new_event)
        db.session.commit()

        return jsonify({
            "message": "Evento creado con éxito.",
            "event": new_event.serialize()
        }), 201

    except Exception as e:
        # Captura cualquier otro error inesperado durante la creación o el commit
        # El `print` es útil para la depuración en los logs del servidor
        print(f"DEBUG: Error inesperado al crear evento: {e}") 
        return jsonify({"error": "Error interno del servidor al crear el evento."}), 500


@events_bp.route("/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    """Actualizar un evento (solo la asociación propietaria)."""
    claims = get_jwt()

    # Verificar rol de usuario
    if claims.get('role') != 'association':
        return jsonify({"error": "Permiso denegado. Solo las asociaciones pueden actualizar eventos."}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento no encontrado."}), 404

    # Verificar permisos de propietario
    association_data = claims.get('association')
    if not association_data or event.association_id != association_data['id']:
        return jsonify({"error": "Permiso denegado. No eres el propietario de este evento."}), 403

    # Obtener y validar el JSON de la petición
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Formato de petición JSON inválido."}), 400

    try:
        # Actualizar campos del evento si están presentes en la petición
        event.title = data.get("title", event.title)
        event.description = data.get("description", event.description)
        event.image_url = data.get("image_url", event.image_url)

        if data.get("date"):
            event.date = datetime.fromisoformat(data["date"])

        db.session.commit()

        return jsonify({
            "message": "Evento actualizado con éxito.",
            "event": event.serialize()
        }), 200

    except ValueError:
        # Esto captura errores de formato de fecha si se intenta actualizar con un valor inválido
        return jsonify({"error": "El formato de la fecha es inválido."}), 422
    except Exception as e:
        print(f"DEBUG: Error inesperado al actualizar evento: {e}") 
        return jsonify({"error": "Error interno del servidor al actualizar el evento."}), 500


@events_bp.route("/<int:event_id>/deactivate", methods=["PATCH"])
@jwt_required()
def deactivate_event(event_id):
    """Desactivar un evento (solo la asociación propietaria)."""
    claims = get_jwt()

    # Verificar rol de usuario
    if claims.get('role') != 'association':
        return jsonify({"error": "Permiso denegado. Solo las asociaciones pueden desactivar eventos."}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento no encontrado."}), 404

    # Verificar permisos de propietario
    association_data = claims.get('association')
    if not association_data or event.association_id != association_data['id']:
        return jsonify({"error": "Permiso denegado. No eres el propietario de este evento."}), 403

    # Verificar si ya está desactivado
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
        print(f"DEBUG: Error inesperado al desactivar evento: {e}") 
        return jsonify({"error": "Error interno del servidor al desactivar el evento."}), 500