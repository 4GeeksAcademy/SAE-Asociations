from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, User
from ..services.auth_service import AuthService

user_bp = Blueprint('user', __name__, url_prefix='/api/user')

@user_bp.put('/profile')
@jwt_required()
def update_profile():
    """
    PUT /api/user/profile
    Body JSON: { name?, lastname?, phone? }
    Actualiza el nombre, apellido y teléfono del usuario autenticado.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    data = request.get_json() or {}
    user.name     = data.get('name', user.name)
    user.lastname = data.get('lastname', user.lastname)
    user.phone    = data.get('phone', user.phone)

    db.session.commit()
    return jsonify({'msg': 'Perfil actualizado correctamente'}), 200


@user_bp.put('/password')
@jwt_required()
def change_password():
    """
    PUT /api/user/password
    Body JSON: { current_password, new_password }
    Cambia la contraseña del usuario autenticado, tras verificar la actual.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    data = request.get_json() or {}
    current = data.get('current_password')
    new_pw  = data.get('new_password')

    if not current or not new_pw:
        return jsonify({'error': 'Faltan datos de contraseña'}), 400

    # Verificar contraseña actual
    if not AuthService.check_password(user, current):
        return jsonify({'error': 'Contraseña actual incorrecta'}), 400

    # Hashear y guardar la nueva
    user.password = AuthService.hash_password(new_pw)
    db.session.commit()
    return jsonify({'msg': 'Contraseña actualizada correctamente'}), 200
