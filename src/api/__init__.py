from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from .models import db
from .routes.auth_routes import auth_bp
import os

def create_app():
    app = Flask(__name__)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///test.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    CORS(app)
    db.init_app(app)
    Migrate(app, db)
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    return app
