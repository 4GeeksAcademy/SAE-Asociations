from flask import Blueprint, request, jsonify
from ..controllers.association_controller import (
    get_all_associations,
    get_association_by_id,
    filter_associations_post
)
from ..models import Event, EventVolunteer, db
from sqlalchemy import func

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

# Obtener estadísticas de asociaciones
@association_bp.route('/statistics', methods=['GET'])
def get_associations_statistics():
    try:
        # Obtener estadísticas de eventos activos por asociación
        active_events_stats = db.session.query(
            Event.association_id,
            func.count(Event.id).label('active_events_count')
        ).filter(Event.is_active == True).group_by(Event.association_id).all()
        
        # Obtener estadísticas de voluntarios totales por asociación
        volunteers_stats = db.session.query(
            Event.association_id,
            func.count(EventVolunteer.volunteer_id.distinct()).label('total_volunteers')
        ).join(EventVolunteer, Event.id == EventVolunteer.event_id).group_by(Event.association_id).all()
        
        # Convertir a diccionario para fácil acceso
        stats = {}
        for assoc_id, count in active_events_stats:
            stats[assoc_id] = {'active_events_count': count, 'total_volunteers': 0}
        
        for assoc_id, count in volunteers_stats:
            if assoc_id in stats:
                stats[assoc_id]['total_volunteers'] = count
            else:
                stats[assoc_id] = {'active_events_count': 0, 'total_volunteers': count}
        
        return jsonify({
            "success": True,
            "statistics": stats
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error al obtener estadísticas: {str(e)}"
        }), 500

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