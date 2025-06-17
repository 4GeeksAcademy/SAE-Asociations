from flask import Blueprint
from .events_routes import events_bp

api = Blueprint('api', __name__)

api.register_blueprint(events_bp, url_prefix='/event')