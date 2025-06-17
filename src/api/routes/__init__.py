from flask import Blueprint
from flask_cors import CORS
from .auth_routes import auth_bp

# Create the main blueprint
api = Blueprint('api', __name__)

# Allow CORS requests to this API (siguiendo patrón academia)
CORS(api)

# Register the auth blueprint with the correct URL prefix
api.register_blueprint(auth_bp, url_prefix='/auth')
