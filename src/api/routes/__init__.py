from flask import Blueprint
from flask_cors import CORS
from .auth_routes import auth_bp
from .user_routes import user_bp
from .association_routes import association_bp
from .events_routes import events_bp
from .volunteers_routes import volunteers_bp
from .donation_routes import donation_bp
from .rating_routes import rating_bp
from .password_reset_routes import password_reset_bp

api = Blueprint('api', __name__)

# Allow CORS requests to this API (siguiendo patrón academia)
CORS(api)

# Register all blueprints with their respective URL prefixes
api.register_blueprint(auth_bp, url_prefix='/auth')
api.register_blueprint(user_bp, url_prefix='/user')
api.register_blueprint(association_bp, url_prefix='/associations')
api.register_blueprint(events_bp, url_prefix='/events')
api.register_blueprint(volunteers_bp, url_prefix='/volunteers')
api.register_blueprint(donation_bp, url_prefix='/donations')
api.register_blueprint(rating_bp, url_prefix='/ratings')
api.register_blueprint(password_reset_bp, url_prefix='')

