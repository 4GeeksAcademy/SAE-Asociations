from flask import Blueprint, jsonify, request
from .models import db, Event

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


