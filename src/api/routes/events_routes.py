from flask import Blueprint, jsonify, request
from ..models import db, Event
from datetime import datetime, timezone
from ..middleware.auth_middleware import token_required, role_required


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
@token_required
@role_required("association")
def create_event(current_user):
    data = request.get_json()
    
    if not current_user.association:
            return jsonify({"error": "No se encontró la asociación del usuario"}), 400

    new_event = Event(
        title = data["title"],
        description = data.get("description"),
        image_url = data.get("image_url"),
        date = datetime.fromisoformat(data["date"]),
        association_id = current_user.association.id
    )

    db.session.add(new_event)
    db.session.commit()

    return jsonify(new_event.serialize()),201

@events_bp.route("/<int:event_id>", methods=["PUT"])
@token_required
@role_required("association")
def update_event(current_user,event_id):
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Evento no encontrado"}), 404

    data = request.get_json() #El JSON que fue enviado por el cliente
    event.title = data.get("title", event.title)
    event.description = data.get("description", event.description)
    event.image_url = data.get("image_url", event.image_url)
    
    if data.get("date"):
        event.date = datetime.fromisoformat(data["date"])

    db.session.commit()

    return jsonify(event.serialize()), 200

@events_bp.route("/<int:event_id>", methods=["DELETE"])
@token_required
@role_required("association")
def delete_event(current_user,event_id):
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Evento no encontrado"}), 404
    
    if event.association_id != current_user.association.id:
        return jsonify({"error": "No tienes permiso para eliminar este evento"}), 403

    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": "Evento eliminado"}), 200