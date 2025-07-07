from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..services.donation_service import DonationService

donation_bp = Blueprint('donation', __name__)


@donation_bp.route('/create', methods=['POST'])
@jwt_required()
def create_donation():
    """
    Crear donación y obtener link de pago
    Body: {
        "amount": 25.00,
        "association_id": 1,
        "event_id": 2,  // opcional
        "description": "Donación para ayudar",  // opcional
        "success_url": "http://tu-frontend/donation-success",  // URL completa del frontend
        "cancel_url": "http://tu-frontend/donation-cancel"  // URL completa del frontend
    }
    """
    try:
        # JWT: Obtener información del usuario autenticado
        current_user_id = get_jwt_identity()
        
        data = request.get_json()
        
        if not data or not isinstance(data, dict):
            return jsonify({'error': 'Invalid request data'}), 400
            
        amount = data.get('amount')
        association_id = data.get('association_id')
        
        if not amount or not association_id:
            return jsonify({
                'error': 'amount y association_id son requeridos'
            }), 400
        
        try:
            amount = float(amount)
            if amount <= 0 or amount > 10000:
                return jsonify({'error': 'Monto debe estar entre 0.01 y 10,000 EUR'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Monto debe ser un número válido'}), 400
        
        donation = DonationService.create_donation(
            amount=amount,
            donor_id=current_user_id,
            association_id=int(association_id),
            event_id=data.get('event_id'),
            description=data.get('description', '').strip()[:500]
        )
        
        # Las URLs deben venir del frontend (que sabe su propia URL)
        success_url = data.get('success_url')
        cancel_url = data.get('cancel_url')
        
        if not success_url or not cancel_url:
            return jsonify({'error': 'success_url y cancel_url son requeridas'}), 400
        
        checkout_url = DonationService.create_stripe_checkout_url(
            donation,
            success_url,
            cancel_url
        )
        
        return jsonify({
            'message': 'Donación creada exitosamente',
            'donation_id': donation.id,
            'checkout_url': checkout_url,
            'status': 'pending',
            'donor_id': current_user_id
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@donation_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    """
    Webhook de Stripe para confirmar pagos automáticamente
    """
    try:
        stripe_signature = request.headers.get('Stripe-Signature')
        if not stripe_signature:
            return jsonify({'error': 'Missing stripe signature'}), 400
        
        payload = request.get_data()
        
        # Procesar webhook
        result = DonationService.process_stripe_webhook(payload, stripe_signature)
        
        if result:
            if result['status'] == 'success':
                return jsonify(result), 200
            elif result['status'] == 'error':
                return jsonify(result), 400
            else:  # ignored
                return jsonify({'status': 'received'}), 200
        
        return jsonify({'status': 'received', 'message': 'Webhook recibido'}), 200
        
    except Exception as e:
        print(f"Webhook error: {e}")
        return jsonify({'error': 'Webhook processing failed'}), 400

@donation_bp.route('', methods=['GET'])
def get_donations():
    """
    Obtener donaciones con filtros opcionales
    Query params:
    - user_id: donaciones de un usuario específico
    - association_id: donaciones recibidas por una asociación  
    - event_id: donaciones hechas a través de un evento
    - status: filtrar por estado (pending, completed, failed)
    
    Ejemplo: GET /api/donations?association_id=1&status=completed
    """
    try:
        user_id = request.args.get('user_id', type=int)
        association_id = request.args.get('association_id', type=int)
        event_id = request.args.get('event_id', type=int)
        status = request.args.get('status')
        if user_id:
            donations = DonationService.get_donations_by_user(user_id)
        elif association_id:
            donations = DonationService.get_donations_by_association(association_id)
        elif event_id:
            donations = DonationService.get_donations_by_event(event_id)
        else:
            donations = DonationService.get_all_donations()
        
        if status:
            donations = [d for d in donations if d.status.value == status]
        
        return jsonify({
            'donations': [d.serialize() for d in donations],
            'count': len(donations),
            'filters_applied': {
                'user_id': user_id,
                'association_id': association_id,
                'event_id': event_id,
                'status': status
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@donation_bp.route('/statistics', methods=['GET'])
def get_donation_statistics():
    """
    Obtener estadísticas de donaciones
    Query params:
    - association_id: estadísticas de una asociación específica
    
    Ejemplo: GET /api/donations/statistics?association_id=1
    """
    try:
        association_id = request.args.get('association_id', type=int)
        
        stats = DonationService.get_donation_statistics(association_id)
        
        return jsonify({
            **stats,
            'association_id': association_id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 