import re
from flask import jsonify
from datetime import datetime

# Función de ayuda para validar URLs
def validate_url(url):
    """Validate URL format"""
    return url.startswith('http://') or url.startswith('https://')

def validate_event_data(data):
    """Validate event creation data"""
    errors = {}

    # Validar 'title' (obligatorio, string, max 200)
    if not data.get('title'):
        errors['title'] = 'El título del evento es obligatorio.'
    elif not isinstance(data['title'], str):
        errors['title'] = 'El título debe ser una cadena de texto.'
    elif len(data['title']) > 200:
        errors['title'] = 'El título debe tener un máximo de 200 caracteres.'

    # Validar 'description' (opcional, string, max 1000)
    if data.get('description') is not None and not isinstance(data['description'], str):
        errors['description'] = 'La descripción debe ser una cadena de texto.'
    elif data.get('description') is not None and len(data['description']) > 1000:
        errors['description'] = 'La descripción debe tener un máximo de 1000 caracteres.'
    
    # Validar 'image_url' (opcional, formato URL o null/vacío)
    # Si image_url está presente y no está vacío, validamos que sea una URL válida
    if data.get('image_url'): # Solo validamos si hay algo en image_url
        if not isinstance(data['image_url'], str):
            errors['image_url'] = 'La URL de la imagen debe ser una cadena de texto.'
        elif not validate_url(data['image_url']):
            errors['image_url'] = 'La URL de la imagen no es válida (debe empezar con http:// o https://).'
    # Si image_url es "" (cadena vacía), se permite, ya que el modelo lo permite.
    # Si es null, también se permite.

    # Validar 'date' (obligatorio, formato ISO datetime-local)
    if not data.get('date'):
        errors['date'] = 'La fecha y hora del evento son obligatorias.'
    elif not isinstance(data['date'], str):
        errors['date'] = 'La fecha y hora deben ser una cadena de texto.'
    else:
        try:
            # Intentar convertir la fecha para validar el formato
            # El formato de datetime-local es YYYY-MM-DDTHH:MM
            datetime.fromisoformat(data['date']) 
        except ValueError:
            errors['date'] = 'El formato de fecha y hora no es válido. Debe ser YYYY-MM-DDTHH:MM.'

    return errors

def check_event_data(data):
    """Validate event data and return error response if invalid"""
    errors = validate_event_data(data)
    if errors:
        # Devuelve un 422 para indicar que los datos no son procesables
        return jsonify({'error': 'Por favor, corrige los siguientes errores:', 'details': errors}), 422 
    return None