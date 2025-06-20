from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..models import db, Event, User
from datetime import datetime


events_bp = Blueprint("events", __name__)

@events_bp.route("/events", methods=["GET"])
def get_all_events():
    events = Event.query.all()
    return jsonify([event.serialize() for event in events]), 200

@events_bp.route("/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    return jsonify(event.serialize()), 200


@events_bp.route("/events", methods=["POST"])
@jwt_required()
def create_event():
    """Crear un nuevo evento (solo asociaciones)"""
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    # Verificar que el usuario sea una asociación
    if claims.get('role') != 'association':
        return jsonify({"error": "Solo las asociaciones pueden crear eventos"}), 403
    
    data = request.get_json()
    
    # Obtener association_id del JWT
    association_data = claims.get('association')
    if not association_data:
        return jsonify({"error": "No se encontró la asociación del usuario"}), 400

    new_event = Event(
        title = data["title"],
        description = data.get("description"),
        image_url = data.get("image_url"),
        date = datetime.fromisoformat(data["date"]),
        association_id = association_data['id']
    )

    db.session.add(new_event)
    db.session.commit()

    return jsonify({
        "message": "Evento creado exitosamente",
        "event": new_event.serialize(),
        "created_by": {
            "user_id": current_user_id,
            "association": association_data['name']
        }
    }), 201

@events_bp.route("/<int:event_id>", methods=["PUT"])
@jwt_required()
def update_event(event_id):
    """Actualizar un evento (solo la asociación propietaria)"""
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    # Verificar que el usuario sea una asociación
    if claims.get('role') != 'association':
        return jsonify({"error": "Solo las asociaciones pueden actualizar eventos"}), 403
    
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento no encontrado"}), 404
    
    # Verificar que la asociación sea propietaria del evento
    association_data = claims.get('association')
    if not association_data or event.association_id != association_data['id']:
        return jsonify({"error": "No tienes permiso para actualizar este evento"}), 403

    data = request.get_json()
    event.title = data.get("title", event.title)
    event.description = data.get("description", event.description)
    event.image_url = data.get("image_url", event.image_url)
    
    if data.get("date"):
        event.date = datetime.fromisoformat(data["date"])

    db.session.commit()

    return jsonify({
        "message": "Evento actualizado exitosamente",
        "event": event.serialize(),
        "updated_by": {
            "user_id": current_user_id,
            "association": association_data['name']
        }
    }), 200

@events_bp.route("/<int:event_id>", methods=["DELETE"])
@jwt_required()
def delete_event(event_id):
    """Eliminar un evento (solo la asociación propietaria)"""
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    # Verificar que el usuario sea una asociación
    if claims.get('role') != 'association':
        return jsonify({"error": "Solo las asociaciones pueden eliminar eventos"}), 403
        
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento no encontrado"}), 404
    
    # Verificar que la asociación sea propietaria del evento
    association_data = claims.get('association')
    if not association_data or event.association_id != association_data['id']:
        return jsonify({"error": "No tienes permiso para eliminar este evento"}), 403

    db.session.delete(event)
    db.session.commit()

    return jsonify({
        "message": "Evento eliminado exitosamente",
        "deleted_by": {
            "user_id": current_user_id,
            "association": association_data['name']
        }
    }), 200