from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..models import db, Event
from datetime import datetime
from ..schemas.event_schema import check_event_data

events_bp = Blueprint("events", __name__)


@events_bp.route("/", methods=["GET"])
def get_all_events():
    """Obtener todos los eventos disponibles."""
    events = Event.query.all()
    return jsonify([event.serialize() for event in events]), 200


@events_bp.route("/<int:event_id>", methods=["GET"])
def get_event(event_id):
    """Obtener los detalles de un evento específico por su ID."""
    event = Event.query.get(event_id)
    if not event:
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
        # Esto ya devuelve un 422 con los errores detallados
        return validation_error_response

    # Obtener ID de la asociación del token JWT
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
        # Esto captura errores de formato de fecha si se intenta actualizar con un valor inválido
        return jsonify({"error": "El formato de la fecha es inválido."}), 422
    except Exception as e:
        print(f"DEBUG: Error inesperado al actualizar evento: {e}") 
        return jsonify({"error": "Error interno del servidor al actualizar el evento."}), 500


@events_bp.route("/<int:event_id>", methods=["DELETE"])
@jwt_required()
def delete_event(event_id):
    """Eliminar un evento (solo la asociación propietaria)."""
    claims = get_jwt()

    # Verificar rol de usuario
    if claims.get('role') != 'association':
        return jsonify({"error": "Permiso denegado. Solo las asociaciones pueden eliminar eventos."}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento no encontrado."}), 404

    # Verificar permisos de propietario
    association_data = claims.get('association')
    if not association_data or event.association_id != association_data['id']:
        return jsonify({"error": "Permiso denegado. No eres el propietario de este evento."}), 403

    db.session.delete(event)
    db.session.commit()

    return jsonify({
        "message": "Evento eliminado con éxito."
    }), 200