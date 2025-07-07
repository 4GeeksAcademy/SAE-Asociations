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

    # Validar 'image_url' (opcional, formato URL o null/vacío)
    # Si image_url está presente y no está vacío, validamos que sea una URL válida
    if data.get('image_url'): # Solo validamos si hay algo en image_url
        if not isinstance(data['image_url'], str):
            errors['image_url'] = 'La URL de la imagen debe ser una cadena de texto.'
        elif not validate_url(data['image_url']):
            errors['image_url'] = 'La URL de la imagen no es válida (debe empezar con http:// o https://).'

    # Validar 'date' (obligatorio, formato ISO datetime-local)
    if not data.get('date'):
        errors['date'] = 'La fecha y hora del evento son obligatorias.'
    elif not isinstance(data['date'], str):
        errors['date'] = 'La fecha y hora deben ser una cadena de texto.'
    else:
        try:
            datetime.fromisoformat(data['date']) 
        except ValueError:
            errors['date'] = 'El formato de fecha y hora no es válido. Debe ser YYYY-MM-DDTHH:MM.'

    if 'max_volunteers' in data: 
        max_v = data['max_volunteers']
        if max_v is not None and max_v != "": # Permitimos que sea None o string vacío del frontend
            try:
                max_v = int(max_v) # Intentamos convertir a entero
                if max_v < 0:
                    errors['max_volunteers'] = 'El número máximo de voluntarios no puede ser negativo.'
            except (ValueError, TypeError): # Si no se puede convertir a int
                errors['max_volunteers'] = 'El número máximo de voluntarios debe ser un número entero válido o dejarse en blanco.'
    return errors

def check_event_data(data):
    """Validate event data and return error response if invalid"""
    errors = validate_event_data(data)
    if errors:
        # Devuelve un 422 para indicar que los datos no son procesables
        return jsonify({'error': 'Por favor, corrige los siguientes errores:', 'details': errors}), 422 
    return None