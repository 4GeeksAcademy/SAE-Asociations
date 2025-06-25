from flask import Blueprint, request, jsonify
from ..controllers.association_controller import (
    get_all_associations,
    get_association_by_id,
    filter_associations_post
)

association_bp = Blueprint('associations', __name__)

# Obtener todas las asociaciones
@association_bp.route('/', methods=['GET'])
def get_all_endpoint():
    result = get_all_associations()
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

# Obtener asociación por ID
@association_bp.route('/<int:association_id>', methods=['GET'])
def get_by_id_endpoint(association_id):
    result = get_association_by_id(association_id)
    status_code = 200 if result.get('success') else result.get('status', 400)
    return jsonify(result), status_code

# Filtrar asociaciones
@association_bp.route('/filter', methods=['POST'])
def filter_endpoint():
    filter_data = request.get_json()
    
    if not filter_data:
        return jsonify({
            "success": False,
            "message": "Se requiere los criterios de filtrado"
        }), 400
    
    result = filter_associations_post(filter_data)
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code