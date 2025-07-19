from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services import comment_service
from ..schemas.comment_schema import CommentSchema
from ..models.event_volunteers import EventVolunteer
from ..models.events import Event
from ..models.user import User
from ..models import db
from ..models.comment import Comment

comment_bp = Blueprint('comment', __name__)
comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)

@comment_bp.route('/events/<int:event_id>/comments', methods=['POST'])
@jwt_required()
def post_comment(event_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    # Validar entrada
    if not data or 'content' not in data or not data['content'].strip():
        return jsonify({"msg": "Content is required"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    event = Event.query.get(event_id)
    if not event:
        return jsonify({"msg": "Event not found"}), 404

    # Comprobar si el usuario es voluntario del evento
    is_volunteer = db.session.query(EventVolunteer).filter_by(event_id=event_id, volunteer_id=user_id).first() is not None
    # Comprobar si el usuario es la asociación creadora del evento (y tiene rol 'association')
    is_association_creator = (user.role == 'association' and event.association_id == user.association_id)

    if not (is_volunteer or is_association_creator):
        return jsonify({"msg": "Unauthorized to comment"}), 403

    comment = comment_service.create_comment(user_id, event_id, data['content'].strip())
    return comment_schema.jsonify(comment), 201


@comment_bp.route('/events/<int:event_id>/comments', methods=['GET'])
def get_comments(event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"msg": "Event not found"}), 404

    comments = comment_service.get_comments_by_event(event_id)
    return comments_schema.jsonify(comments), 200

@comment_bp.route('/events/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    content = data.get('content', '').strip()

    if not content:
        return jsonify({"error": "El contenido es obligatorio"}), 400

    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"error": "Comentario no encontrado"}), 404

    if comment.user_id != user_id:
        return jsonify({"error": "No tienes permiso para editar este comentario"}), 403

    comment.content = content
    try:
        db.session.commit()
        return jsonify(comment.serialize()), 200
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar comentario"}), 500


@comment_bp.route('/events/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = get_jwt_identity()
    comment = Comment.query.get(comment_id)

    if not comment:
        return jsonify({"error": "Comentario no encontrado"}), 404

    if comment.user_id != user_id:
        return jsonify({"error": "No tienes permiso para eliminar este comentario"}), 403

    try:
        db.session.delete(comment)
        db.session.commit()
        return jsonify({"msg": "Comentario eliminado correctamente"}), 200
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar comentario"}), 500
