"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from api.commands import setup_commands
from api.admin import setup_admin
from api.routes import api
from api.models import db
from api.utils import APIException, generate_sitemap
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_jwt_extended import JWTManager
from datetime import timedelta
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

# Initialize CORS
CORS(app)

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///database.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT configuration with Flask-JWT-Extended
app.config['SECRET_KEY'] = os.getenv(
    'SECRET_KEY', 'dev-secret-key-for-development-only')
app.config['JWT_SECRET_KEY'] = os.getenv(
    'JWT_SECRET_KEY', app.config['SECRET_KEY'])
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)

# Initialize JWT Manager
jwt = JWTManager(app)

MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Auto-run migrations on startup for free tier compatibility
if ENV == "production":
    try:
        import os
        # Change to project root where migrations folder exists
        original_cwd = os.getcwd()
        project_root = os.path.dirname(original_cwd)
        os.chdir(project_root)
        print(f"🔄 Changed directory to: {os.getcwd()}")
        print(f"📁 Migrations folder exists: {os.path.exists('migrations')}")
        
        with app.app_context():
            from flask_migrate import upgrade
            upgrade()
            print("✅ Database migrations completed successfully")
        
        # Change back to original directory
        os.chdir(original_cwd)
    except Exception as e:
        print(f"⚠️ Migration warning: {str(e)}")
        # Change back to original directory even if there's an error
        try:
            os.chdir(original_cwd)
        except:
            pass

# add the admin
setup_admin(app)
# add the admin
setup_commands(app)


# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response





# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
