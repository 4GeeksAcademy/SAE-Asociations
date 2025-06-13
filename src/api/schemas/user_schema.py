import re
from flask import jsonify

def validate_email(email):
    """Validar formato de email - función simple 4Geeks"""
    return re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email) is not None

def validate_user_data(data):
    """Validar datos de usuario - versión simplificada 4Geeks"""
    errors = {}
    
    # Email
    if not data.get('email'):
        errors['email'] = 'Email es obligatorio'
    elif not validate_email(data['email']):
        errors['email'] = 'Email inválido'
    
    # Password
    if not data.get('password'):
        errors['password'] = 'Contraseña es obligatoria'
    elif len(data['password']) < 6:
        errors['password'] = 'Contraseña debe tener al menos 6 caracteres'
    
    # Name
    if not data.get('name') or len(data['name'].strip()) == 0:
        errors['name'] = 'Nombre es obligatorio'
    elif len(data['name']) > 100:
        errors['name'] = 'Nombre muy largo'
    
    # Lastname
    if not data.get('lastname') or len(data['lastname'].strip()) == 0:
        errors['lastname'] = 'Apellido es obligatorio'
    elif len(data['lastname']) > 100:
        errors['lastname'] = 'Apellido muy largo'
    
    # Phone (opcional)
    if data.get('phone') and len(data['phone']) > 20:
        errors['phone'] = 'Teléfono muy largo'
    
    return errors

def validate_user_registration(data):
    """Validar registro de usuario - versión simplificada"""
    errors = validate_user_data(data)
    
    # Confirmar password
    if data.get('password') != data.get('confirmPassword'):
        errors['confirmPassword'] = 'Las contraseñas deben coincidir'
    
    return errors

# Funciones helper para usar en Flask - más simple
def check_user_data(data):
    """Función simple para usar en endpoints"""
    errors = validate_user_data(data)
    if errors:
        return jsonify({'error': 'Datos inválidos', 'details': errors}), 400
    return None  # Sin errores

def check_user_registration(data):
    """Función simple para registro"""
    errors = validate_user_registration(data)
    if errors:
        return jsonify({'error': 'Datos inválidos', 'details': errors}), 400
    return None  # Sin errores 