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
        errors['email'] = 'El email es obligatorio'
    elif not validate_email(data['email']):
        errors['email'] = 'Por favor, introduce un email válido (ejemplo: usuario@dominio.com)'
    
    # Password validation
    if not data.get('password'):
        errors['password'] = 'La contraseña es obligatoria'
    elif len(data['password']) < 8:
        errors['password'] = 'La contraseña debe tener al menos 8 caracteres con letras y números'
    elif not re.search(r'[A-Za-z]', data['password']):
        errors['password'] = 'La contraseña debe contener al menos una letra'
    elif not re.search(r'\d', data['password']):
        errors['password'] = 'La contraseña debe contener al menos un número'
    
    # Name validation
    if not data.get('name'):
        errors['name'] = 'El nombre es obligatorio'
    elif len(data['name']) > 100:
        errors['name'] = 'El nombre debe tener máximo 100 caracteres'
    
    # Lastname validation
    if not data.get('lastname'):
        errors['lastname'] = 'El apellido es obligatorio'
    elif len(data['lastname']) > 100:
        errors['lastname'] = 'El apellido debe tener máximo 100 caracteres'
    
    # Phone validation (optional)
    if data.get('phone') and len(data['phone']) > 20:
        errors['phone'] = 'El teléfono debe tener máximo 20 caracteres'
    
    return errors

def validate_user_registration(data):
    """Validar registro de usuario"""
    errors = validate_user_data(data)
    
    # Confirmar password
    if data.get('password') != data.get('confirmPassword'):
        errors['confirmPassword'] = 'Las contraseñas deben coincidir exactamente'
    
    return errors

def check_user_data(data):
    """Validate user data and return error response if invalid"""
    errors = validate_user_data(data)
    if errors:
        return jsonify({'error': 'Por favor, corrige los siguientes errores:', 'details': errors}), 400
    return None

def check_user_registration(data):
    """Validate user registration and return error response if invalid"""
    errors = validate_user_registration(data)
    if errors:
        return jsonify({'error': 'Por favor, corrige los siguientes errores:', 'details': errors}), 400
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