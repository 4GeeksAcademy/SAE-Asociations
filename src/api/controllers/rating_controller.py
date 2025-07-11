from flask_jwt_extended import get_jwt_identity
from api.services.rating_service import RatingService


def check_can_rate(association_id):
    """Verificar si el usuario actual puede valorar una asociación"""
    try:
        current_user_id = get_jwt_identity()
        
        if not current_user_id:
            return {
                "success": False,
                "message": "Usuario no autenticado"
            }, 401
        
        can_rate = RatingService.can_user_rate_association(current_user_id, association_id)
        
        # Obtener eventos no valorados para mostrar información adicional
        unrated_events = RatingService.get_unrated_events_for_user(current_user_id, association_id)
        
        result = {
            "success": True,
            "can_rate": can_rate,
            "already_rated": not can_rate,  # Si no puede valorar, significa que no hay eventos sin valorar
            "unrated_events": [event.serialize() for event in unrated_events],
            "message": "Verificación completada"
        }
        
        return result
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Error al verificar permisos: {str(e)}"
        }, 500


def get_association_ratings(association_id):
    """Obtener todas las valoraciones de una asociación"""
    try:
        ratings = RatingService.get_association_ratings(association_id)
        summary = RatingService.get_rating_summary(association_id)
        
        return {
            "success": True,
            "summary": summary,
            "ratings": [rating.serialize() for rating in ratings]
        }
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Error al obtener valoraciones: {str(e)}"
        }, 500


def create_rating(rating_data):
    """Crear nueva valoración para un evento específico"""
    try:
        current_user_id = get_jwt_identity()
        
        if not current_user_id:
            return {
                "success": False,
                "message": "Usuario no autenticado"
            }, 401
        
        association_id = rating_data.get('association_id')
        event_id = rating_data.get('event_id')
        rating_value = rating_data.get('rating')
        comment = rating_data.get('comment')
        
        # Validaciones
        if not association_id:
            return {
                "success": False,
                "message": "ID de asociación requerido"
            }, 400
        
        if not event_id:
            return {
                "success": False,
                "message": "ID de evento requerido"
            }, 400
        
        if not rating_value or not (1 <= rating_value <= 5):
            return {
                "success": False,
                "message": "Valoración debe ser entre 1 y 5"
            }, 400
        
        # Verificar si puede valorar este evento específico
        can_rate = RatingService.can_user_rate_event(current_user_id, event_id)
        
        if not can_rate:
            return {
                "success": False,
                "message": "No puedes valorar este evento (no fuiste voluntario, no ha terminado, o ya lo valoraste)"
            }, 403
        
        # Crear valoración
        new_rating = RatingService.create_rating(
            rating=rating_value,
            user_id=current_user_id,
            association_id=association_id,
            event_id=event_id,
            comment=comment
        )
        
        return {
            "success": True,
            "message": "Valoración creada exitosamente",
            "rating": new_rating.serialize()
        }
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Error al crear valoración: {str(e)}"
        }, 500


def update_rating(rating_id, rating_data):
    """Actualizar valoración existente"""
    try:
        current_user_id = get_jwt_identity()
        
        if not current_user_id:
            return {
                "success": False,
                "message": "Usuario no autenticado"
            }, 401
        
        # Verificar que la valoración existe y pertenece al usuario
        existing_rating = RatingService.get_user_rating_for_event(current_user_id, rating_data.get('event_id'))
        
        if not existing_rating or existing_rating.id != rating_id:
            return {
                "success": False,
                "message": "Valoración no encontrada o no autorizada"
            }, 404
        
        rating_value = rating_data.get('rating')
        comment = rating_data.get('comment')
        
        # Validaciones
        if not rating_value or not (1 <= rating_value <= 5):
            return {
                "success": False,
                "message": "Valoración debe ser entre 1 y 5"
            }, 400
        
        # Actualizar valoración
        updated_rating = RatingService.update_rating(
            rating_id=rating_id,
            rating=rating_value,
            comment=comment
        )
        
        return {
            "success": True,
            "message": "Valoración actualizada exitosamente",
            "rating": updated_rating.serialize()
        }
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Error al actualizar valoración: {str(e)}"
        }, 500 