import re
from flask import jsonify

def validate_email(email):
    """Validar formato de email - función simple 4Geeks"""
    return re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email) is not None

def validate_url(url):
    """Validar URL básica"""
    return url.startswith(('http://', 'https://')) and '.' in url

def validate_association_data(data):
    """Validar datos de asociación - versión simplificada 4Geeks"""
    errors = {}
    
    # Campos obligatorios
    if not data.get('name'):
        errors['name'] = 'Nombre es obligatorio'
    elif len(data['name']) > 200:
        errors['name'] = 'Nombre muy largo'
    
    if not data.get('cif'):
        errors['cif'] = 'CIF es obligatorio'
    elif len(data['cif']) > 20:
        errors['cif'] = 'CIF muy largo'
    
    if not data.get('description'):
        errors['description'] = 'Descripción es obligatoria'
    elif len(data['description']) > 1000:
        errors['description'] = 'Descripción muy larga'
    
    if not data.get('contact_email'):
        errors['contact_email'] = 'Email de contacto es obligatorio'
    elif not validate_email(data['contact_email']):
        errors['contact_email'] = 'Email inválido'
    
    # Campos opcionales
    if data.get('image_url') and not validate_url(data['image_url']):
        errors['image_url'] = 'URL de imagen inválida'
    
    if data.get('website_url') and not validate_url(data['website_url']):
        errors['website_url'] = 'URL de sitio web inválida'
    
    if data.get('contact_phone') and len(data['contact_phone']) > 20:
        errors['contact_phone'] = 'Teléfono muy largo'
    
    return errors

def validate_association_registration(data):
    """Validar registro completo (usuario + asociación)"""
    errors = {}
    
    # Datos del usuario
    if not data.get('email'):
        errors['email'] = 'Email es obligatorio'
    elif not validate_email(data['email']):
        errors['email'] = 'Email inválido'
    
    if not data.get('password'):
        errors['password'] = 'Contraseña es obligatoria'
    elif len(data['password']) < 6:
        errors['password'] = 'Contraseña muy corta'
    
    if data.get('password') != data.get('confirmPassword'):
        errors['confirmPassword'] = 'Las contraseñas deben coincidir'
    
    if not data.get('name'):
        errors['name'] = 'Nombre es obligatorio'
    elif len(data['name']) > 100:
        errors['name'] = 'Nombre muy largo'
    
    if not data.get('lastname'):
        errors['lastname'] = 'Apellido es obligatorio'
    elif len(data['lastname']) > 100:
        errors['lastname'] = 'Apellido muy largo'
    
    # Datos de la asociación
    if not data.get('association_name'):
        errors['association_name'] = 'Nombre de asociación es obligatorio'
    elif len(data['association_name']) > 200:
        errors['association_name'] = 'Nombre de asociación muy largo'
    
    if not data.get('cif'):
        errors['cif'] = 'CIF es obligatorio'
    elif len(data['cif']) > 20:
        errors['cif'] = 'CIF muy largo'
    
    if not data.get('description'):
        errors['description'] = 'Descripción es obligatoria'
    elif len(data['description']) > 1000:
        errors['description'] = 'Descripción muy larga'
    
    if not data.get('contact_email'):
        errors['contact_email'] = 'Email de contacto es obligatorio'
    elif not validate_email(data['contact_email']):
        errors['contact_email'] = 'Email de contacto inválido'
    
    return errors

def check_association_data(data):
    """Función simple para endpoints de asociación"""
    errors = validate_association_data(data)
    if errors:
        return jsonify({'error': 'Datos inválidos', 'details': errors}), 400
    return None

def check_association_registration(data):
    """Función simple para registro de asociación"""
    errors = validate_association_registration(data)
    if errors:
        return jsonify({'error': 'Datos inválidos', 'details': errors}), 400
    return None 