from ..models import Donation, User, Association, Event, db
from ..models.donation import DonationStatus
from typing import List, Optional
import os

class DonationService:
    
    @staticmethod
    def create_donation(amount: float, donor_id: int, association_id: int, 
                       event_id: Optional[int] = None, description: Optional[str] = None) -> Donation:
        """Crear una nueva donación"""
        
        # Validar que existen usuario y asociación
        donor = User.query.get(donor_id)
        if not donor:
            raise ValueError(f"Usuario con id {donor_id} no encontrado")
        
        association = Association.query.get(association_id)
        if not association:
            raise ValueError(f"Asociación con id {association_id} no encontrada")
        
        # Validar evento si se proporciona
        if event_id:
            event = Event.query.get(event_id)
            if not event:
                raise ValueError(f"Evento con id {event_id} no encontrado")
        
        # Crear donación
        donation = Donation(
            amount=amount,
            donor_id=donor_id,
            association_id=association_id,
            event_id=event_id,
            description=description
        )
        
        db.session.add(donation)
        db.session.commit()
        
        return donation
    
    @staticmethod
    def create_stripe_checkout_url(donation: Donation, success_url: str, cancel_url: str) -> str:
        """Crear URL de checkout de Stripe (simulado por ahora)"""
        
        # Por ahora simulamos - luego integraremos Stripe real
        fake_stripe_url = f"https://checkout.stripe.com/pay/fake_session_{donation.id}"
        
        # Guardar "session ID" fake
        donation.stripe_session_id = f"cs_fake_{donation.id}"
        db.session.commit()
        
        return fake_stripe_url
    
    @staticmethod
    def complete_donation_by_session_id(session_id: str) -> Optional[Donation]:
        """Completar donación cuando Stripe confirma pago"""
        donation = Donation.query.filter_by(stripe_session_id=session_id).first()
        
        if donation:
            donation.complete_donation()
            db.session.commit()
            return donation
        
        return None
    
    @staticmethod
    def get_donations_by_user(user_id: int) -> List[Donation]:
        """Obtener donaciones hechas por un usuario"""
        return Donation.query.filter_by(donor_id=user_id).order_by(Donation.created_at.desc()).all()
    
    @staticmethod
    def get_donations_by_association(association_id: int) -> List[Donation]:
        """Obtener donaciones recibidas por una asociación"""
        return Donation.query.filter_by(association_id=association_id).order_by(Donation.created_at.desc()).all()
    
    @staticmethod
    def get_donations_by_event(event_id: int) -> List[Donation]:
        """Obtener donaciones hechas a través de un evento"""
        return Donation.query.filter_by(event_id=event_id).order_by(Donation.created_at.desc()).all()
    
    @staticmethod
    def get_all_donations() -> List[Donation]:
        """Obtener todas las donaciones"""
        return Donation.query.order_by(Donation.created_at.desc()).all()
    
    @staticmethod
    def get_donation_statistics(association_id: Optional[int] = None) -> dict:
        """Obtener estadísticas de donaciones"""
        
        query = Donation.query.filter_by(status=DonationStatus.COMPLETED)
        
        if association_id:
            query = query.filter_by(association_id=association_id)
        
        donations = query.all()
        
        total_amount = sum(d.amount for d in donations)
        total_count = len(donations)
        
        return {
            'total_amount': float(total_amount),
            'total_count': total_count,
            'average_amount': float(total_amount / total_count) if total_count > 0 else 0,
            'currency': 'EUR'
        } 