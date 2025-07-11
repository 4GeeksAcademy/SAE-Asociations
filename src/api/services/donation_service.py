from ..models import Donation, User, Association, Event, db
from ..models.donation import DonationStatus
from typing import List, Optional
import os
import stripe

# Configurar Stripe dinámicamente en cada uso
def _ensure_stripe_configured():
    stripe.api_key = os.getenv('STRIPE_SECRET_KEY')  # Configurar cada vez
    if not stripe.api_key:
        raise ValueError("STRIPE_SECRET_KEY no configurada en variables de entorno")

def _get_donation_metadata(donation: Donation) -> dict:
    """Generar metadatos consistentes para Stripe"""
    return {
        'donation_id': str(donation.id),
        'association_id': str(donation.association_id),
        'donor_id': str(donation.donor_id)
    }

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
        db.session.flush()  # Obtener ID sin commit final
        
        return donation
    
    @staticmethod
    def create_stripe_price_object(donation: Donation) -> str:
        """Crear Price Object de Stripe para la donación"""
        
        # Crear Product y Price en una sola operación más simple
        metadata = _get_donation_metadata(donation)
        price = stripe.Price.create(
            unit_amount=int(donation.amount * 100),
            currency='eur',
            product_data={
                'name': f'Donación a {donation.association.name}',
                'metadata': metadata
            },
            metadata=metadata
        )
        
        return price.id
    
    @staticmethod
    def create_stripe_checkout_url(donation: Donation, success_url: str, cancel_url: str) -> str:
        """Crear URL de checkout de Stripe usando Price Objects"""
        
        # Verificar configuración de Stripe
        _ensure_stripe_configured()
        
        # Crear Price Object para esta donación
        price_id = DonationService.create_stripe_price_object(donation)
        
        # Crear sesión de pago con Stripe
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': 1}],
            mode='payment',
            success_url=success_url + f'?donation_id={donation.id}',
            cancel_url=cancel_url + f'?donation_id={donation.id}',
            metadata=_get_donation_metadata(donation)
        )
        
        # Actualizar donación con información de Stripe y hacer commit final
        donation.stripe_session_id = checkout_session.id
        db.session.commit()  # Commit final con toda la información
        
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
                # Para pagos fallidos, necesitaríamos otra forma de identificar la donación
                # Por ahora, simplemente logeamos el evento
                print(f"Payment failed for payment_intent: {event['data']['object']['id']}")
                return {
                    'status': 'success',
                    'message': 'Pago fallido procesado'
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
        
        donations = query.order_by(Donation.created_at.desc()).all()
        
        total_amount = sum(d.amount for d in donations)
        total_count = len(donations)
        
        # Obtener información de la última donación
        last_donation = donations[0] if donations else None
        last_donation_info = None
        
        if last_donation:
            last_donation_info = {
                'amount': float(last_donation.amount),
                'date': last_donation.created_at.isoformat() if last_donation.created_at else None,
                'donor_name': (
                    last_donation.donor.association.name if last_donation.donor.association 
                    else f"{last_donation.donor.name} {last_donation.donor.lastname}".strip()
                ) if last_donation.donor else 'Donante anónimo'
            }
        
        return {
            'total_amount': float(total_amount),
            'total_count': total_count,
            'last_donation': last_donation_info,
            'currency': 'EUR'
        } 