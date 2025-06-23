from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..services.donation_service import DonationService

donation_bp = Blueprint('donation', __name__)

@donation_bp.route('/info', methods=['GET'])
def donation_info():
    """Endpoint de información del sistema de donaciones"""
    return jsonify({
        "message": "Sistema de Donaciones SAE funcionando",
        "endpoints": [
            "POST /api/donations/create - Crear donación y obtener link de pago",
            "POST /api/donations/webhook - Webhook de Stripe (automático)",
            "GET /api/donations - Ver donaciones con filtros",
            "GET /api/donations/statistics - Estadísticas de donaciones"
        ]
    }), 200

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
        "success_url": "https://miapp.com/success",
        "cancel_url": "https://miapp.com/cancel"
    }
    """
    try:
        # JWT: Obtener información del usuario autenticado
        current_user_id = get_jwt_identity()
        
        data = request.get_json()
        
        # SEGURIDAD: Validaciones robustas
        if not data or not isinstance(data, dict):
            return jsonify({'error': 'Invalid request data'}), 400
            
        amount = data.get('amount')
        association_id = data.get('association_id')
        
        if not amount or not association_id:
            return jsonify({
                'error': 'amount y association_id son requeridos'
            }), 400
        
        # SEGURIDAD: Validar rangos
        try:
            amount = float(amount)
            if amount <= 0 or amount > 10000:  # Límite académico razonable
                return jsonify({'error': 'Monto debe estar entre 0.01 y 10,000 EUR'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Monto debe ser un número válido'}), 400
        
        # 1. Crear donación en BD
        donation = DonationService.create_donation(
            amount=amount,  # Ya validado arriba
            donor_id=current_user_id,  # De JWT
            association_id=int(association_id),
            event_id=data.get('event_id'),
            description=data.get('description', '').strip()[:500]  # SEGURIDAD: Limitar descripción
        )
        
        # 2. Crear checkout URL de Stripe  
        checkout_url = DonationService.create_stripe_checkout_url(
            donation,
            data.get('success_url', 'http://localhost:3000/donation-success'),
            data.get('cancel_url', 'http://localhost:3000/donation-cancel')
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
        # SEGURIDAD: Verificar que viene de Stripe (básico)
        stripe_signature = request.headers.get('Stripe-Signature')
        if not stripe_signature:
            return jsonify({'error': 'Missing stripe signature'}), 400
        
        # Por ahora simulamos - luego validaremos signature de Stripe
        data = request.get_json()
        
        # SEGURIDAD: Validar estructura del webhook
        if not data or not isinstance(data, dict):
            return jsonify({'error': 'Invalid webhook data'}), 400
        
        # Simular confirmación de pago
        if data.get('session_id'):
            donation = DonationService.complete_donation_by_session_id(data['session_id'])
            if donation:
                return jsonify({'status': 'donation_completed'}), 200
        
        return jsonify({'status': 'received'}), 200
        
    except Exception as e:
        # SEGURIDAD: No exponer detalles del error
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
        # Obtener filtros de query params
        user_id = request.args.get('user_id', type=int)
        association_id = request.args.get('association_id', type=int)
        event_id = request.args.get('event_id', type=int)
        status = request.args.get('status')
        
        # Aplicar filtros según lo que se solicite
        if user_id:
            donations = DonationService.get_donations_by_user(user_id)
        elif association_id:
            donations = DonationService.get_donations_by_association(association_id)
        elif event_id:
            donations = DonationService.get_donations_by_event(event_id)
        else:
            donations = DonationService.get_all_donations()
        
        # Filtrar por status si se especifica
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