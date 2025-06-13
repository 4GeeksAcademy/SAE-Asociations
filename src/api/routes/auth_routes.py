from flask import Blueprint, request, jsonify
from ..controllers.auth_controller import AuthController
from ..schemas.user_schema import check_user_registration, validate_user_data
from ..schemas.association_schema import check_association_registration

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'API is working!', 'status': 'success'}), 200

@auth_bp.route('/register/user', methods=['POST'])
def register_user():
    data = request.get_json()
    
    # Validar datos usando funciones simples 4Geeks
    validation_error = check_user_registration(data)
    if validation_error:
        return validation_error
    
    # Si no hay errores, procesar registro
    return AuthController.register_user(data)

@auth_bp.route('/register/association', methods=['POST'])
def register_association():
    data = request.get_json()
    
    # Validar datos usando funciones simples 4Geeks
    validation_error = check_association_registration(data)
    if validation_error:
        return validation_error
    
    # Si no hay errores, procesar registro
    return AuthController.register_association(data)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validar solo email y password para login
    errors = {}
    if not data.get('email'):
        errors['email'] = 'Email es obligatorio'
    if not data.get('password'):
        errors['password'] = 'Contraseña es obligatoria'
    
    if errors:
        return jsonify({'error': 'Datos inválidos', 'details': errors}), 400
    
    # Si no hay errores, procesar login
    return AuthController.login(data) 