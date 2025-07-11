from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..models import db, EventVolunteer,Event
from datetime import datetime, timezone


volunteers_bp = Blueprint("volunteers", __name__)


@volunteers_bp.route("/<int:event_id>/join", methods=["POST"])
@jwt_required()
def join_event(event_id):
    """Apuntarse a un evento (solo voluntarios)"""
    current_user_id = get_jwt_identity()
    claims = get_jwt()

    # Verificar que el usuario sea un voluntario
    if claims.get('role') != 'volunteer':
        return jsonify({"error": "Solo los voluntarios pueden apuntarse a eventos"}), 403

    volunteer_id = current_user_id

    # Obtener el evento para verificar la capacidad
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"message": "Evento no encontrado"}), 404

    # Verificar si el evento ya está lleno
    if event.max_volunteers is not None and len(event.event_volunteers) >= event.max_volunteers:
        return jsonify({"message": "Este evento ha alcanzado su número máximo de voluntarios"}), 400

    existing = EventVolunteer.query.filter_by(
        event_id=event_id, volunteer_id=volunteer_id
    ).first()

    if existing:
        return jsonify({"message": "Ya estás apuntado a este evento"}), 400

    ev = EventVolunteer(
        event_id=event_id,
        volunteer_id=volunteer_id,
        joined_at=datetime.now(timezone.utc)
    )
    
    db.session.add(ev)
    db.session.commit()

    return jsonify({
        "message": "Te has apuntado correctamente al evento",
        "volunteer_info": {
            "user_id": current_user_id,
            "name": claims.get('name'),
            "email": claims.get('email')
        }
    }), 201


@volunteers_bp.route("/<int:event_id>/leave", methods=["DELETE"])
@jwt_required()
def leave_event(event_id):
    """Desapuntarse de un evento (solo voluntarios)"""
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    # Verificar que el usuario sea un voluntario
    if claims.get('role') != 'volunteer':
        return jsonify({"error": "Solo los voluntarios pueden desapuntarse de eventos"}), 403

    volunteer_id = current_user_id

    ev = EventVolunteer.query.filter_by(
        event_id=event_id, volunteer_id=volunteer_id
    ).first()

    if not ev:
        return jsonify({"message": "No estabas apuntado a este evento"}), 404

    db.session.delete(ev)
    db.session.commit()
    
    return jsonify({
        "message": "Te has desapuntado correctamente del evento",
        "volunteer_info": {
            "user_id": current_user_id,
            "name": claims.get('name'),
            "email": claims.get('email')
        }
    }), 200