from ..models.comment import Comment
from api.models import db

def create_comment(user_id, event_id, content):
    comment = Comment(user_id=user_id, event_id=event_id, content=content)
    db.session.add(comment)
    db.session.commit()
    # Cargar la relación user para que esté disponible en la respuesta
    db.session.refresh(comment)
    return comment

def get_comments_by_event(event_id):
    return Comment.query.filter_by(event_id=event_id).order_by(Comment.created_at.desc()).all()


