from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import all models here
from .user import User
from .association import Association 