from ..models import Donation, User, Association, Event, db
from ..models.donation import DonationStatus
from typing import List, Optional
import os
import stripe
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configurar Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

if not stripe.api_key:
    raise ValueError("STRIPE_SECRET_KEY no configurada en variables de entorno")

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
        """Crear URL de checkout de Stripe"""
        
        # Crear sesión de pago con Stripe
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': f'Donación a {donation.association.name}',
                        'description': donation.description or 'Donación para una buena causa',
                    },
                    'unit_amount': int(donation.amount * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url + f'?donation_id={donation.id}',
            cancel_url=cancel_url + f'?donation_id={donation.id}',
            metadata={
                'donation_id': str(donation.id),
                'donor_id': str(donation.donor_id),
                'association_id': str(donation.association_id)
            }
        )
        
        donation.stripe_session_id = checkout_session.id
        donation.stripe_payment_intent_id = checkout_session.payment_intent
        db.session.commit()
        
        return checkout_session.url
    
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
    def process_stripe_webhook(payload: bytes, signature: str) -> Optional[dict]:
        """Procesar webhook de Stripe"""
        
        # Webhook signing secret
        webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        
        if not webhook_secret:
            print("STRIPE_WEBHOOK_SECRET no configurado")
            return None
            
        try:
            # Verificar la signature del webhook
            event = stripe.Webhook.construct_event(payload, signature, webhook_secret)
            
            # Procesar eventos de pago completado
            if event['type'] == 'checkout.session.completed':
                session = event['data']['object']
                session_id = session['id']
                
                donation = DonationService.complete_donation_by_session_id(session_id)
                
                if donation:
                    return {
                        'status': 'success',
                        'donation_id': donation.id,
                        'message': 'Donación completada exitosamente'
                    }
                else:
                    return {
                        'status': 'error',
                        'message': 'Donación no encontrada'
                    }
                    
            # Procesar pagos fallidos
            elif event['type'] == 'payment_intent.payment_failed':
                payment_intent = event['data']['object']
                donation = Donation.query.filter_by(
                    stripe_payment_intent_id=payment_intent['id']
                ).first()
                
                if donation:
                    donation.status = DonationStatus.FAILED
                    db.session.commit()
                    return {
                        'status': 'success',
                        'message': 'Donación marcada como fallida'
                    }
            
            return {'status': 'ignored', 'event_type': event['type']}
            
        except ValueError as e:
            return {'status': 'error', 'message': f'Payload inválido: {e}'}
        except stripe.error.SignatureVerificationError as e:
            return {'status': 'error', 'message': f'Signature inválida: {e}'}
    
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