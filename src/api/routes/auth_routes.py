from flask import Blueprint, request, current_app, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..controllers.auth_controller import AuthController
from ..schemas.user_schema import check_user_data
from ..schemas.association_schema import check_association_registration
from ..models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/info', methods=['GET'])
def api_info():
    """Endpoint de información de la API"""
    return jsonify({
        "message": "SAE Associations API funcionando correctamente",
        "status": "ok",
        "endpoints": [
            "POST /api/auth/register/user",
            "POST /api/auth/register/association", 
            "POST /api/auth/login",
            "GET /api/auth/profile (JWT required)",
            "POST /api/auth/refresh (Refresh token required)"
        ]
    }), 200

@auth_bp.route('/register/user', methods=['POST'])
def register_user():
    data = request.get_json()
    
    # Validate input data
    validation_error = check_user_data(data)
    if validation_error:
        return validation_error
    
    return AuthController.register_user(data)


@auth_bp.route('/register/association', methods=['POST'])
def register_association():
    data = request.get_json()
    
    # Validate input data
    validation_error = check_association_registration(data)
    if validation_error:
        return validation_error
    
    return AuthController.register_association(data)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    return AuthController.login(data)


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Endpoint para obtener el perfil del usuario autenticado"""
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    # Puedes acceder a todos los datos del JWT directamente
    return jsonify({
        'user_id': current_user_id,
        'email': claims.get('email'),
        'name': claims.get('name'),
        'lastname': claims.get('lastname'),
        'phone': claims.get('phone'),
        'role': claims.get('role'),
        'association': claims.get('association')  # Solo si es asociación
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Endpoint para refrescar el access token"""
    from flask_jwt_extended import create_access_token
    current_user_id = get_jwt_identity()
    
    # Obtener usuario para regenerar claims
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'message': 'Usuario no encontrado'}), 404
    
    # Regenerar token con datos actualizados
    from ..services.auth_service import AuthService
    auth_data = AuthService.generate_token(user)
    
    return jsonify({
        'access_token': auth_data['access_token'],
        'message': 'Token renovado exitosamente'
    }), 200
