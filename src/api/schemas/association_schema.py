import re
from flask import jsonify

def validate_email(email):
    """Validate email format"""
    return re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email) is not None

def validate_url(url):
    """Validate URL format"""
    return re.match(r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:\w*))?)?$', url) is not None

def validate_association_data(data):
    """Validate association data"""
    errors = {}
    
    # Required fields
    if not data.get('name'):
        errors['name'] = 'El nombre de la asociación es obligatorio'
    elif len(data['name']) > 200:
        errors['name'] = 'El nombre debe tener máximo 200 caracteres'
    
    if not data.get('cif'):
        errors['cif'] = 'El CIF es obligatorio'
    elif len(data['cif']) > 20:
        errors['cif'] = 'El CIF debe tener máximo 20 caracteres'
    
    if not data.get('description'):
        errors['description'] = 'La descripción es obligatoria'
    elif len(data['description']) > 1000:
        errors['description'] = 'La descripción debe tener máximo 1000 caracteres'
    
    if not data.get('contact_email'):
        errors['contact_email'] = 'El email de contacto es obligatorio'
    elif not validate_email(data['contact_email']):
        errors['contact_email'] = 'Por favor, introduce un email de contacto válido'
    
    # Optional fields
    if data.get('image_url') and not validate_url(data['image_url']):
        errors['image_url'] = 'La URL de la imagen no es válida (debe empezar con http:// o https://)'
    
    if data.get('website_url') and not validate_url(data['website_url']):
        errors['website_url'] = 'La URL del sitio web no es válida (debe empezar con http:// o https://)'
    
    if data.get('contact_phone') and len(data['contact_phone']) > 20:
        errors['contact_phone'] = 'El teléfono de contacto debe tener máximo 20 caracteres'
    
    return errors

def validate_association_registration(data):
    """Validate complete registration data (user + association)"""
    errors = {}
    
    # User data validation
    if not data.get('email'):
        errors['email'] = 'El email es obligatorio'
    elif not validate_email(data['email']):
        errors['email'] = 'Por favor, introduce un email válido (ejemplo: usuario@dominio.com)'
    
    if not data.get('password'):
        errors['password'] = 'La contraseña es obligatoria'
    elif len(data['password']) < 8:
        errors['password'] = 'La contraseña debe tener al menos 8 caracteres con letras y números'
    elif not re.search(r'[A-Za-z]', data['password']):
        errors['password'] = 'La contraseña debe contener al menos una letra'
    elif not re.search(r'\d', data['password']):
        errors['password'] = 'La contraseña debe contener al menos un número'
    
    if data.get('password') != data.get('confirmPassword'):
        errors['confirmPassword'] = 'Las contraseñas deben coincidir exactamente'
    
    if not data.get('name'):
        errors['name'] = 'El nombre es obligatorio'
    elif len(data['name']) > 100:
        errors['name'] = 'El nombre debe tener máximo 100 caracteres'
    
    if not data.get('lastname'):
        errors['lastname'] = 'El apellido es obligatorio'
    elif len(data['lastname']) > 100:
        errors['lastname'] = 'El apellido debe tener máximo 100 caracteres'
    
    # Association data validation
    if not data.get('association_name'):
        errors['association_name'] = 'El nombre de la asociación es obligatorio'
    elif len(data['association_name']) > 200:
        errors['association_name'] = 'El nombre de la asociación debe tener máximo 200 caracteres'
    
    if not data.get('cif'):
        errors['cif'] = 'El CIF es obligatorio'
    elif len(data['cif']) > 20:
        errors['cif'] = 'El CIF debe tener máximo 20 caracteres'
    
    if not data.get('description'):
        errors['description'] = 'La descripción es obligatoria'
    elif len(data['description']) > 1000:
        errors['description'] = 'La descripción debe tener máximo 1000 caracteres'
    
    if not data.get('contact_email'):
        errors['contact_email'] = 'El email de contacto es obligatorio'
    elif not validate_email(data['contact_email']):
        errors['contact_email'] = 'Por favor, introduce un email de contacto válido'
    
    return errors

def check_association_data(data):
    """Validate association data and return error response if invalid"""
    errors = validate_association_data(data)
    if errors:
        return jsonify({'error': 'Por favor, corrige los siguientes errores:', 'details': errors}), 400
    return None

def check_association_registration(data):
    """Validate association registration and return error response if invalid"""
    errors = validate_association_registration(data)
    if errors:
        return jsonify({'error': 'Por favor, corrige los siguientes errores:', 'details': errors}), 400
    return None 