from flask import Blueprint, request, current_app, jsonify
from ..controllers.auth_controller import AuthController
from ..schemas.user_schema import check_user_data
from ..schemas.association_schema import check_association_registration

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
            "POST /api/auth/login"
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
