from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..controllers.rating_controller import (
    check_can_rate,
    get_association_ratings,
    create_rating,
    update_rating
)

rating_bp = Blueprint('ratings', __name__)

# Verificar si el usuario puede valorar una asociación
@rating_bp.route('/can-rate/<int:association_id>', methods=['GET'])
@jwt_required()
def check_can_rate_endpoint(association_id):
    result = check_can_rate(association_id)
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result), 200

# Obtener todas las valoraciones de una asociación
@rating_bp.route('/association/<int:association_id>', methods=['GET'])
def get_association_ratings_endpoint(association_id):
    result = get_association_ratings(association_id)
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result), 200

# Crear nueva valoración
@rating_bp.route('/', methods=['POST'])
@jwt_required()
def create_rating_endpoint():
    rating_data = request.get_json()
    
    if not rating_data:
        return jsonify({
            "success": False,
            "message": "Datos de valoración requeridos"
        }), 400
    
    result = create_rating(rating_data)
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result), 201

# Actualizar valoración existente
@rating_bp.route('/<int:rating_id>', methods=['PUT'])
@jwt_required()
def update_rating_endpoint(rating_id):
    rating_data = request.get_json()
    
    if not rating_data:
        return jsonify({
            "success": False,
            "message": "Datos de valoración requeridos"
        }), 400
    
    result = update_rating(rating_id, rating_data)
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result), 200 