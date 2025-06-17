from datetime import datetime, timedelta
import jwt
from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash
from ..models import User, db

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        return generate_password_hash(password)
    
    @staticmethod
    def check_password(user: User, password: str) -> bool:
        return check_password_hash(user.password, password)
    
    @staticmethod
    def generate_token(user: User) -> dict:
        user_role = 'association' if user.association else 'volunteer'
        
        payload = {
            'user_id': user.id,
            'email': user.email,
            'role': user_role,
            'exp': datetime.utcnow() + timedelta(hours=2)
        }
        
        token = jwt.encode(
            payload,
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        
        user_data = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'lastname': user.lastname,
            'phone': user.phone,
            'role': user_role
        }
        
        if user.association:
            user_data['association'] = {
                'id': user.association.id,
                'name': user.association.name,
                'cif': user.association.cif
            }
        
        return {
            'token': token,
            'user': user_data
        }
    
    @staticmethod
    def create_user(email: str, password: str, name: str = None, lastname: str = None, phone: str = None) -> User:
        hashed_password = AuthService.hash_password(password)
        
        user = User(
            email=email,
            password=hashed_password,
            name=name,
            lastname=lastname,
            phone=phone
        )
        
        db.session.add(user)
        db.session.commit()
        
        return user
    
    @staticmethod
    def get_user_by_email(email: str) -> User:
        return User.query.filter_by(email=email).first() 