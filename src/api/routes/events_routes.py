from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..models import db, Event 
from datetime import datetime
from ..schemas.event_schema import check_event_data
from sqlalchemy import desc

events_bp = Blueprint("events", __name__)


@events_bp.route("/", methods=["GET"])
@jwt_required(optional=True)
def get_all_events():
    """Obtener todos los eventos disponibles."""
    claims = get_jwt()
    
    association_id_param = request.args.get('association_id')

    if association_id_param:
        try:
            association_id = int(association_id_param)
            if claims and claims.get('role') == 'association':
                association_data = claims.get('association')
                if association_data and association_data['id'] == association_id:
                    events = Event.query.filter_by(association_id=association_id).all()
                else:
                    events = Event.query.filter_by(association_id=association_id, is_active=True).all()
            else:
                events = Event.query.filter_by(association_id=association_id, is_active=True).all()
        except ValueError:
            return jsonify({"error": "ID de asociación inválido."}), 400
    else:
        events = Event.query.filter_by(is_active=True).all()
    
    return jsonify([event.serialize() for event in events]), 200


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
        return validation_error_response

    association_data = claims.get('association')
    if not association_data:
        return jsonify({"error": "Error de autenticación: Datos de asociación no encontrados."}), 401 

    try:
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
        print(f"Error al crear evento: {e}") 
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

    try:
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
        return jsonify({"error": "El formato de la fecha es inválido."}), 422
    except Exception as e:
        print(f"Error al actualizar evento: {e}") 
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
        print(f"Error al desactivar evento: {e}") 
        return jsonify({"error": "Error interno del servidor al desactivar el evento."}), 500
