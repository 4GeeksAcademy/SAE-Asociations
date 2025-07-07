from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, create_refresh_token
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
        
        # Create additional claims for the JWT token
        additional_claims = {
            'user_id': user.id,
            'email': user.email,
            'name': user.name,
            'lastname': user.lastname,
            'phone': user.phone,
            'profile_image': user.profile_image,
            'role': user_role
        }
        
        # Add association data if user is an association
        if user.association:
            additional_claims['association'] = {
                'id': user.association.id,
                'name': user.association.name,
                'cif': user.association.cif,
                'image_url': user.association.image_url
            }
        
        # Create tokens with Flask-JWT-Extended
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(identity=str(user.id))
        
        user_data = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'lastname': user.lastname,
            'phone': user.phone,
            'profile_image': user.profile_image,
            'role': user_role
        }
        
        if user.association:
            user_data['association'] = {
                'id': user.association.id,
                'name': user.association.name,
                'cif': user.association.cif,
                'image_url': user.association.image_url
            }
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user_data
        }
    
    @staticmethod
    def create_user(email: str, password: str, name: str = None, lastname: str = None, phone: str = None, profile_image: str = None, commit: bool = True) -> User:
        hashed_password = AuthService.hash_password(password)
        
        user = User(
            email=email,
            password=hashed_password,
            name=name,
            lastname=lastname,
            phone=phone,
            profile_image=profile_image
        )
        
        db.session.add(user)
        if commit:
            db.session.commit()
        
        return user
    
    @staticmethod
    def get_user_by_email(email: str) -> User:
        return User.query.filter_by(email=email).first() 