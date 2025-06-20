from flask import Blueprint
from flask_cors import CORS
from .auth_routes import auth_bp
from .events_routes import events_bp
from .volunteers_routes import volunteers_bp

api = Blueprint('api', __name__)

# Allow CORS requests to this API (siguiendo patrón academia)
CORS(api)

# Register all blueprints with their respective URL prefixes
api.register_blueprint(auth_bp, url_prefix='/auth')
api.register_blueprint(events_bp, url_prefix='/events')
api.register_blueprint(volunteers_bp, url_prefix='/volunteers')