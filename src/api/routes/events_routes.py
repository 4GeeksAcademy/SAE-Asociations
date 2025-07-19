from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy.exc import IntegrityError
from ..models import db
from ..models.events import Event
from ..models.event_volunteers import EventVolunteer
from ..models.comment import Comment  

events_bp = Blueprint('events', __name__)

@events_bp.route("/", methods=["GET"])
def list_events():
    association_id = request.args.get("association_id", type=int)
    query = Event.query.filter_by(is_active=True)
    if association_id:
        query = query.filter_by(association_id=association_id)
    events = query.all()
    events_data = [event.serialize() for event in events]
    return jsonify(events_data), 200


@events_bp.route('/<int:event_id>/volunteer', methods=['POST'])
@jwt_required()
def join_event_as_volunteer(event_id):
    user_id = get_jwt_identity()

    event = Event.query.get(event_id)
    if not event or not event.is_active:
        return jsonify({"error": "Evento no encontrado o no activo."}), 404

    existing = EventVolunteer.query.filter_by(event_id=event_id, volunteer_id=user_id).first()
    if existing:
        return jsonify({"msg": "Ya estás apuntado a este evento."}), 200

    if event.max_volunteers is not None:
        current_volunteers = EventVolunteer.query.filter_by(event_id=event_id).count()
        if current_volunteers >= event.max_volunteers:
            return jsonify({"error": "El evento ha alcanzado el máximo de voluntarios."}), 403

    try:
        new_volunteer = EventVolunteer(event_id=event_id, volunteer_id=user_id)
        db.session.add(new_volunteer)
        db.session.commit()
        return jsonify({"msg": "Apuntado como voluntario con éxito."}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Ya estás apuntado a este evento."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error interno al apuntarte al evento: {str(e)}"}), 500


@events_bp.route("/<int:event_id>/comments", methods=["POST"])
@jwt_required()
def add_comment(event_id):
    user_id = get_jwt_identity()
    content = request.json.get("content", "").strip()

    if not content:
        return jsonify({"error": "El contenido del comentario es obligatorio."}), 400

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento no encontrado."}), 404

    # Solo voluntarios o asociaciones creadoras pueden comentar
    is_volunteer = EventVolunteer.query.filter_by(event_id=event_id, volunteer_id=user_id).first() is not None
    claims = get_jwt()
    is_association_creator = False
    if claims.get("role") == "association":
        assoc = claims.get("association")
        is_association_creator = assoc and assoc.get("id") == event.association_id

    if not is_volunteer and not is_association_creator:
        return jsonify({"error": "No tienes permiso para comentar en este evento."}), 403

    try:
        comment = Comment(user_id=user_id, event_id=event_id, content=content)
        db.session.add(comment)
        db.session.commit()
        return jsonify(comment.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error interno al agregar comentario: {str(e)}"}), 500


@events_bp.route("/<int:event_id>", methods=["GET"])
@jwt_required(optional=True)
def get_event(event_id):
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Evento no encontrado."}), 404

    claims = get_jwt()
    user_id = get_jwt_identity() if claims else None
    user_role = claims.get('role') if claims else None

    # Verificar acceso a evento inactivo
    if not event.is_active:
        if user_role != 'association':
            return jsonify({"error": "Evento no encontrado."}), 404
        association_data = claims.get('association') if claims else None
        if not association_data or association_data.get('id') != event.association_id:
            return jsonify({"error": "Evento no encontrado."}), 404

    event_data = event.serialize()

    # Comentarios ordenados por fecha descendente
    comments = sorted(event.comments, key=lambda c: c.created_at, reverse=True)
    event_data['comments'] = [c.serialize() for c in comments]

    # Verificar si el usuario puede comentar
    is_volunteer = False
    is_association_creator = False

    if user_id:
        is_volunteer = EventVolunteer.query.filter_by(event_id=event_id, volunteer_id=user_id).first() is not None
        if user_role == 'association':
            association_data = claims.get('association') if claims else None
            is_association_creator = association_data and association_data.get('id') == event.association_id

    event_data['user_can_comment'] = is_volunteer or is_association_creator
    event_data['current_user_id'] = user_id  # para uso en el frontend

    return jsonify(event_data), 200

@events_bp.route("/comments/<int:comment_id>", methods=["PUT"])
@jwt_required()
def update_comment(comment_id):
    user_id = get_jwt_identity()
    new_content = request.json.get("content")

    if not new_content:
        return jsonify({"error": "El contenido del comentario es obligatorio."}), 400

    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"error": "Comentario no encontrado."}), 404

    if comment.user_id != user_id:
        return jsonify({"error": "No tienes permiso para editar este comentario."}), 403

    comment.content = new_content
    db.session.commit()

    return jsonify(comment.serialize()), 200

@events_bp.route("/comments/<int:comment_id>", methods=["DELETE"])
@jwt_required()
def delete_comment(comment_id):
    user_id = get_jwt_identity()

    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"error": "Comentario no encontrado."}), 404

    if comment.user_id != user_id:
        return jsonify({"error": "No tienes permiso para eliminar este comentario."}), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"msg": "Comentario eliminado con éxito."}), 200
