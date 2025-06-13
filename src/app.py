"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from api.utils import APIException, generate_sitemap
from api.models import db
# Ya no importamos ma (Marshmallow) - usamos validación simple 4Geeks
from api.routes import api
# from api.admin import setup_admin
from api.commands import setup_commands

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///./database.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)
# Ya no inicializamos ma (Marshmallow)

# add the admin
# setup_admin(app)

# add the admin
setup_commands(app)

# Create database tables
with app.app_context():
    db.create_all()
    print("Database tables created successfully!")

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Endpoint removido - era redundante con /api/hello en routes.py

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    return jsonify({
        "message": "SAE Associations API",
        "frontend_url": "http://localhost:3000",
        "api_endpoints": {
            "auth_test": "/api/auth/test",
            "register_user": "/api/auth/register/user",
            "register_association": "/api/auth/register/association",
            "login": "/api/auth/login"
        }
    })

# In development, don't serve static files - let Vite handle the frontend
# In production, serve static files
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if ENV == "development":
        # In development, return 404 for non-API routes
        return jsonify({"error": "Not found - Frontend should be served by Vite on port 3000"}), 404
    else:
        # In production, serve static files
        if not os.path.isfile(os.path.join(static_file_dir, path)):
            path = 'index.html'
        response = send_from_directory(static_file_dir, path)
        response.cache_control.max_age = 0  # avoid cache memory
        return response


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=PORT, debug=True)
