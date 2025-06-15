from functools import wraps
from flask import request, jsonify
import jwt
from flask import current_app
from ..models import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token is in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token is missing'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Decode token
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({'message': 'Invalid token'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(current_user, *args, **kwargs):
            # Check if user has association for 'association' role
            is_association = current_user.association is not None
            user_role = 'association' if is_association else 'volunteer'
            
            if user_role != role:
                return jsonify({'message': 'Unauthorized access'}), 403
                
            return f(current_user, *args, **kwargs)
        return decorated_function
    return decorator 