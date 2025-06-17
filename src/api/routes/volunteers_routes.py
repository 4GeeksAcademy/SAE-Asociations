from flask import Blueprint, request, jsonify
from ..models import db, EventVolunteer
from datetime import datetime, timezone
from ..middleware.auth_middleware import token_required, role_required


volunteers_bp = Blueprint("volunteers", __name__)

@volunteers_bp.route("/<int:event_id>/join", methods=["POST"])
@token_required
@role_required("volunteer")
def join_event(current_user,event_id):
    
    volunteer_id = current_user.id

    if not volunteer_id:
        return jsonify({"error": "Falta volunteer_id"}), 400

    existing = EventVolunteer.query.filter_by(
        event_id=event_id, volunteer_id=volunteer_id
    ).first()

    if existing:
        return jsonify({"message": "Ya estás apuntado"}), 400

    ev = EventVolunteer(
        event_id=event_id,
        volunteer_id=volunteer_id,
        joined_at=datetime.now(timezone.utc)
        )
    
    db.session.add(ev)
    db.session.commit()

    return jsonify({"message": "Apuntado correctamente"}), 201


@volunteers_bp.route("/<int:event_id>/leave", methods=["DELETE"])
@token_required
@role_required("volunteer")
def leave_event(current_user,event_id):

    volunteer_id = current_user.id

    ev = EventVolunteer.query.filter_by(
        event_id=event_id, volunteer_id=volunteer_id
    ).first()

    if not ev:
        return jsonify({"message": "No estabas apuntado"}), 404

    db.session.delete(ev)
    db.session.commit()
    
    return jsonify({"message": "Desapuntado correctamente"}), 200