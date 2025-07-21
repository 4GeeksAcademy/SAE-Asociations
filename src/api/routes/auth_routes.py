from flask import Blueprint, request, current_app, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from ..controllers.auth_controller import AuthController
from ..schemas.user_schema import check_user_data
from ..schemas.association_schema import check_association_registration
from ..models import User, db
from ..services.auth_service import AuthService

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
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': 'Usuario no encontrado'}), 404
        
        # Siempre devolver los datos actuales de la base de datos
        response = {
            'user_id': user.id,
            'email': user.email,
            'name': user.name,
            'lastname': user.lastname,
            'phone': user.phone,
            'profile_image': user.profile_image,
            'role': 'association' if user.association else 'volunteer'
        }

        # Si es una asociación, incluir sus datos
        if user.association:
            response['association'] = {
                'id': user.association.id,
                'name': user.association.name,
                'cif': user.association.cif,
                'image_url': user.association.image_url
            }

        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener perfil: {str(e)}'}), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Endpoint para refrescar el access token"""
    current_user_id = get_jwt_identity()
    
    # Obtener usuario para regenerar claims
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'message': 'Usuario no encontrado'}), 404
    
    # Regenerar token con datos actualizados
    auth_data = AuthService.generate_token(user)
    
    return jsonify({
        'access_token': auth_data['access_token'],
        'message': 'Token renovado exitosamente'
    }), 200


@auth_bp.route('/update-profile-image', methods=['PATCH'])
@jwt_required()
def update_profile_image():
    """Actualizar imagen de perfil del usuario"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'profile_image' not in data:
        return jsonify({"error": "URL de imagen requerida"}), 400
    
    image_url = data['profile_image']
    
    # Validar que la URL sea de Cloudinary (opcional)
    if image_url and not image_url.startswith('https://res.cloudinary.com/'):
        return jsonify({"error": "Solo se permiten imágenes de Cloudinary"}), 400
    
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        user.profile_image = image_url
        db.session.commit()
        
        return jsonify({
            "message": "Imagen de perfil actualizada correctamente",
            "profile_image": image_url
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error interno del servidor"}), 500


@auth_bp.route('/validate', methods=['GET'])
@jwt_required()
def validate_token():
    """Endpoint para validar si el token JWT es válido"""
    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        
        # Verificar que el usuario aún existe en la base de datos
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({
                'valid': False,
                'message': 'Usuario no encontrado'
            }), 404
        
        return jsonify({
            'valid': True,
            'user_id': current_user_id,
            'email': claims.get('email', user.email),
            'role': claims.get('role', 'volunteer'),
            'message': 'Token válido'
        }), 200
        
    except Exception as e:
        return jsonify({
            'valid': False,
            'message': 'Token inválido',
            'error': str(e)
        }), 401
