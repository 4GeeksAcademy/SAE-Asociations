from flask import Blueprint, request, jsonify
from .models import db, EventVolunteer
from datetime import datetime, timezone

volunteers_bp = Blueprint("volunteers", __name__)

@volunteers_bp.route("/<int:event_id>/join", methods=["POST"])
def join_event(event_id):
    data = request.get_json()
    volunteer_id = data.get("volunteer_id")

    if not volunteer_id:
        return jsonify({"error": "Falta volunteer_id"}), 400

    existing = EventVolunteer.query.filter_by(
        event_id=event_id, volunteer_id=volunteer_id
    ).first()

    if existing:
        return jsonify({"message": "Ya estás apuntado"}), 400

    ev = EventVolunteer(event_id=event_id, volunteer_id=volunteer_id, joined_at=datetime.now(timezone.utc))
    db.session.add(ev)
    db.session.commit()

    return jsonify({"message": "Apuntado correctamente"}), 201


@volunteers_bp.route("/<int:event_id>/leave", methods=["DELETE"])
def leave_event(event_id):
    data = request.get_json()
    volunteer_id = data.get("volunteer_id")

    ev = EventVolunteer.query.filter_by(
        event_id=event_id, volunteer_id=volunteer_id
    ).first()

    if not ev:
        return jsonify({"message": "No estabas apuntado"}), 404

    db.session.delete(ev)
    db.session.commit()
    return jsonify({"message": "Desapuntado correctamente"}), 200