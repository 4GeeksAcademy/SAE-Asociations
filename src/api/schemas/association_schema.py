import re
from flask import jsonify

def validate_email(email):
    """Validate email format"""
    return re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email) is not None

def validate_url(url):
    """Validate URL format"""
    return re.match(r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:\w*))?)?$', url) is not None

def validate_cif(cif):
    """Validate Spanish CIF format"""
    # Spanish CIF format: Letter + 8 digits OR Letter + 7 digits + Letter/Digit
    # Examples: A12345674, B1234567H, G12345678
    if not cif:
        return False
    
    cif = cif.upper().strip()
    
    # Basic format check: starts with letter, followed by 7-8 digits, optionally ending with letter
    pattern = r'^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$'
    return re.match(pattern, cif) is not None

def validate_phone(phone):
    """Validate phone number format"""
    if not phone:
        return True  # Optional field
    
    # Remove spaces, dashes, parentheses
    clean_phone = re.sub(r'[\s\-\(\)]', '', phone)
    
    # Spanish phone format: 9 digits starting with 6, 7, 8, or 9
    # International format: +34 followed by 9 digits
    pattern = r'^(\+34)?[6789]\d{8}$'
    return re.match(pattern, clean_phone) is not None

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
    elif len(data['cif']) > 30:  # Updated from 20 to 30
        errors['cif'] = 'El CIF debe tener máximo 30 caracteres'
    elif not validate_cif(data['cif']):
        errors['cif'] = 'El CIF no es válido (ejemplo: A12345674)'
    
    if not data.get('description'):
        errors['description'] = 'La descripción es obligatoria'
    elif len(data['description']) > 2000:  # Updated from 1000 to 2000
        errors['description'] = 'La descripción debe tener máximo 2000 caracteres'
    
    if not data.get('contact_email'):
        errors['contact_email'] = 'El email de contacto es obligatorio'
    elif not validate_email(data['contact_email']):
        errors['contact_email'] = 'Por favor, introduce un email de contacto válido'
    elif len(data['contact_email']) > 120:  # Added length validation
        errors['contact_email'] = 'El email de contacto debe tener máximo 120 caracteres'
    
    # Optional fields
    if data.get('image_url') and not validate_url(data['image_url']):
        errors['image_url'] = 'La URL de la imagen no es válida (debe empezar con http:// o https://)'
    
    if data.get('website_url') and len(data['website_url']) > 200:
        errors['website_url'] = 'La URL del sitio web debe tener máximo 200 caracteres'
    elif data.get('website_url') and not validate_url(data['website_url']):
        errors['website_url'] = 'La URL del sitio web no es válida (debe empezar con http:// o https://)'
    
    if data.get('contact_phone') and not validate_phone(data['contact_phone']):
        errors['contact_phone'] = 'El teléfono de contacto no es válido (ejemplo: 612345678 o +34612345678)'
    
    # New social media fields validation
    if data.get('facebook_url') and len(data['facebook_url']) > 200:
        errors['facebook_url'] = 'La URL de Facebook debe tener máximo 200 caracteres'
    elif data.get('facebook_url') and not validate_url(data['facebook_url']):
        errors['facebook_url'] = 'La URL de Facebook no es válida (debe empezar con http:// o https://)'
    
    if data.get('instagram_url') and len(data['instagram_url']) > 200:
        errors['instagram_url'] = 'La URL de Instagram debe tener máximo 200 caracteres'
    elif data.get('instagram_url') and not validate_url(data['instagram_url']):
        errors['instagram_url'] = 'La URL de Instagram no es válida (debe empezar con http:// o https://)'
    
    if data.get('twitter_url') and len(data['twitter_url']) > 200:
        errors['twitter_url'] = 'La URL de Twitter/X debe tener máximo 200 caracteres'
    elif data.get('twitter_url') and not validate_url(data['twitter_url']):
        errors['twitter_url'] = 'La URL de Twitter/X no es válida (debe empezar con http:// o https://)'
    
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
    elif len(data['cif']) > 30:  # Updated from 20 to 30
        errors['cif'] = 'El CIF debe tener máximo 30 caracteres'
    elif not validate_cif(data['cif']):
        errors['cif'] = 'El CIF no es válido (ejemplo: A12345674)'
    
    if not data.get('description'):
        errors['description'] = 'La descripción es obligatoria'
    elif len(data['description']) > 2000:  # Updated from 1000 to 2000
        errors['description'] = 'La descripción debe tener máximo 2000 caracteres'
    
    if not data.get('contact_email'):
        errors['contact_email'] = 'El email de contacto es obligatorio'
    elif not validate_email(data['contact_email']):
        errors['contact_email'] = 'Por favor, introduce un email de contacto válido'
    elif len(data['contact_email']) > 120:  # Added length validation
        errors['contact_email'] = 'El email de contacto debe tener máximo 120 caracteres'
    
    # Optional fields validation
    if data.get('contact_phone') and not validate_phone(data['contact_phone']):  # Updated from 15 to 20
        errors['contact_phone'] = 'El teléfono de contacto no es válido (ejemplo: 612345678 o +34612345678)'
    
    if data.get('website_url') and len(data['website_url']) > 200:
        errors['website_url'] = 'La URL del sitio web debe tener máximo 200 caracteres'
    
    if data.get('social_media_url') and len(data['social_media_url']) > 200:
        errors['social_media_url'] = 'La URL de redes sociales debe tener máximo 200 caracteres'
        
    # New social media fields validation
    if data.get('facebook_url') and len(data['facebook_url']) > 200:
        errors['facebook_url'] = 'La URL de Facebook debe tener máximo 200 caracteres'
    
    if data.get('instagram_url') and len(data['instagram_url']) > 200:
        errors['instagram_url'] = 'La URL de Instagram debe tener máximo 200 caracteres'
    
    if data.get('twitter_url') and len(data['twitter_url']) > 200:
        errors['twitter_url'] = 'La URL de Twitter/X debe tener máximo 200 caracteres'
    
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