import re
from flask import jsonify

def validate_email(email):
    """Validate email format"""
    return re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email) is not None

def validate_user_data(data):
    """Validate user registration data"""
    errors = {}
    
    # Email validation
    if not data.get('email'):
        errors['email'] = 'Email es obligatorio'
    elif not validate_email(data['email']):
        errors['email'] = 'Email inválido'
    
    # Password validation
    if not data.get('password'):
        errors['password'] = 'Contraseña es obligatoria'
    elif len(data['password']) < 6:
        errors['password'] = 'Contraseña muy corta'
    
    # Name validation
    if not data.get('name'):
        errors['name'] = 'Nombre es obligatorio'
    elif len(data['name']) > 100:
        errors['name'] = 'Nombre muy largo'
    
    # Lastname validation
    if not data.get('lastname'):
        errors['lastname'] = 'Apellido es obligatorio'
    elif len(data['lastname']) > 100:
        errors['lastname'] = 'Apellido muy largo'
    
    # Phone validation (optional)
    if data.get('phone') and len(data['phone']) > 20:
        errors['phone'] = 'Teléfono muy largo'
    
    return errors

def validate_user_registration(data):
    """Validar registro de usuario"""
    errors = validate_user_data(data)
    
    # Confirmar password
    if data.get('password') != data.get('confirmPassword'):
        errors['confirmPassword'] = 'Las contraseñas deben coincidir'
    
    return errors

def check_user_data(data):
    """Validate user data and return error response if invalid"""
    errors = validate_user_data(data)
    if errors:
        return jsonify({'error': 'Datos inválidos', 'details': errors}), 400
    return None

def check_user_registration(data):
    """Validate user registration and return error response if invalid"""
    errors = validate_user_registration(data)
    if errors:
        return jsonify({'error': 'Datos inválidos', 'details': errors}), 400
    return None

# Create a schema object for compatibility with imports
class UserSchema:
    def __init__(self):
        pass
    
    def validate(self, data):
        return validate_user_data(data)
    
    def validate_registration(self, data):
        return validate_user_registration(data)

# Create instance for imports
user_schema = UserSchema()  