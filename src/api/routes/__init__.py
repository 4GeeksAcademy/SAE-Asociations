from flask import Blueprint
from .auth_routes import auth_bp

# Create the main blueprint
api = Blueprint('api', __name__)

# Register the auth blueprint with the correct URL prefix
api.register_blueprint(auth_bp, url_prefix='/auth')
