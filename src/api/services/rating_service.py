from typing import Optional, List
from sqlalchemy import and_, func
from datetime import datetime, timedelta
from ..models import Rating, EventVolunteer, Event, db


class RatingService:
    
    @staticmethod
    def can_user_rate_association(user_id: int, association_id: int) -> bool:
        """Verificar si el usuario puede valorar la asociación (tiene eventos terminados donde fue voluntario)"""
        # Buscar eventos terminados de la asociación donde el usuario fue voluntario
        # Usar hora de España (UTC+2) en lugar de UTC
        spain_now = datetime.now() + timedelta(hours=2)
        finished_events = db.session.query(EventVolunteer).join(Event).filter(
            and_(
                EventVolunteer.volunteer_id == user_id,
                Event.association_id == association_id,
                Event.date < spain_now  # Evento ya terminó (hora España)
            )
        ).all()
        
        # Verificar si hay al menos un evento terminado sin valorar
        for event_volunteer in finished_events:
            event_id = event_volunteer.event_id
            # Verificar si ya valoró este evento específico
            existing_rating = Rating.query.filter_by(
                user_id=user_id,
                event_id=event_id
            ).first()
            
            if not existing_rating:
                return True  # Hay al menos un evento sin valorar
        
        return False
    
    @staticmethod
    def get_user_finished_events_for_association(user_id: int, association_id: int) -> List[Event]:
        """Obtener eventos terminados de una asociación donde el usuario fue voluntario"""
        # Usar hora de España (UTC+2) en lugar de UTC
        spain_now = datetime.now() + timedelta(hours=2)
        finished_events = db.session.query(Event).join(EventVolunteer).filter(
            and_(
                EventVolunteer.volunteer_id == user_id,
                Event.association_id == association_id,
                Event.date < spain_now  # Evento ya terminó (hora España)
            )
        ).all()
        
        return finished_events
    
    @staticmethod
    def get_unrated_events_for_user(user_id: int, association_id: int) -> List[Event]:
        """Obtener eventos terminados que el usuario no ha valorado"""
        finished_events = RatingService.get_user_finished_events_for_association(user_id, association_id)
        unrated_events = []
        
        for event in finished_events:
            existing_rating = Rating.query.filter_by(
                user_id=user_id,
                event_id=event.id
            ).first()
            
            if not existing_rating:
                unrated_events.append(event)
        
        return unrated_events
    
    @staticmethod
    def user_already_rated_event(user_id: int, event_id: int) -> bool:
        """Verificar si el usuario ya valoró un evento específico"""
        existing_rating = Rating.query.filter_by(
            user_id=user_id,
            event_id=event_id
        ).first()
        
        return existing_rating is not None
    
    @staticmethod
    def create_rating(
        rating: float,
        user_id: int,
        association_id: int,
        event_id: int,
        comment: Optional[str] = None,
        commit: bool = True
    ) -> Rating:
        """Crear nueva valoración para un evento específico"""
        new_rating = Rating(
            rating=rating,
            user_id=user_id,
            association_id=association_id,
            event_id=event_id,
            comment=comment
        )
        
        db.session.add(new_rating)
        if commit:
            db.session.commit()
        
        return new_rating
    
    @staticmethod
    def get_association_ratings(association_id: int) -> List[Rating]:
        """Obtener todas las valoraciones de una asociación"""
        return Rating.query.filter_by(association_id=association_id).order_by(Rating.created_at.desc()).all()
    
    @staticmethod
    def get_rating_summary(association_id: int) -> dict:
        """Obtener resumen de valoraciones (promedio y total)"""
        ratings = Rating.query.filter_by(association_id=association_id).all()
        
        if not ratings:
            return {
                "average_rating": 0.0,
                "total_ratings": 0
            }
        
        total_rating = sum(r.rating for r in ratings)
        average_rating = total_rating / len(ratings)
        
        return {
            "average_rating": round(average_rating, 1),
            "total_ratings": len(ratings)
        }
    
    @staticmethod
    def get_user_rating_for_event(user_id: int, event_id: int) -> Optional[Rating]:
        """Obtener la valoración específica de un usuario para un evento"""
        return Rating.query.filter_by(
            user_id=user_id,
            event_id=event_id
        ).first()
    
    @staticmethod
    def update_rating(
        rating_id: int,
        rating: float,
        comment: Optional[str] = None,
        commit: bool = True
    ) -> Optional[Rating]:
        """Actualizar valoración existente"""
        existing_rating = Rating.query.get(rating_id)
        
        if not existing_rating:
            return None
        
        existing_rating.rating = rating
        if comment is not None:
            existing_rating.comment = comment
        
        if commit:
            db.session.commit()
        
        return existing_rating
    
    @staticmethod
    def can_user_rate_event(user_id: int, event_id: int) -> bool:
        """Verificar si el usuario puede valorar un evento específico"""
        # Verificar que el evento existe
        event = Event.query.get(event_id)
        if not event:
            return False
        
        # Verificar que el evento ya terminó (usar hora España)
        spain_now = datetime.now() + timedelta(hours=2)
        if event.date >= spain_now:
            return False
        
        # Verificar que el usuario fue voluntario en este evento
        volunteer_participation = EventVolunteer.query.filter_by(
            volunteer_id=user_id,
            event_id=event_id
        ).first()
        
        if not volunteer_participation:
            return False
        
        # Verificar que no ha valorado este evento específico
        existing_rating = Rating.query.filter_by(
            user_id=user_id,
            event_id=event_id
        ).first()
        
        return existing_rating is None 