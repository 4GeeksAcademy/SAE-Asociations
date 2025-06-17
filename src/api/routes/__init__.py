from flask import Blueprint
from .events_routes import events_bp
from .volunteers_routes import volunteers_bp

api = Blueprint('api', __name__)

api.register_blueprint(events_bp, url_prefix='/event')
api.register_blueprint(volunteers_bp, url_prefix="/volunteers")
