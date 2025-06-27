from api.models.association import Association
from api.services.association_service import AssociationService

def get_all_associations():
    try: 
        associations = AssociationService.get_all_associations()
        # Serializar las asociaciones para que sean JSON-compatible
        serialized_associations = [association.serialize() for association in associations]
        return {
            "success": True,
            "count": len(serialized_associations),
            "associations": serialized_associations
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error al obtener asociaciones: {str(e)}"
        }

def get_association_by_id(association_id):
    try:
        association = AssociationService.get_association_by_id(association_id)
        
        if association:
            return {
                "success": True,
                "association": association.serialize()  # Serializar el objeto
            }
        else:
            return {
                "success": False,
                "message": f"Asociación con ID {association_id} no encontrada"
            }, 404
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Error al buscar asociación: {str(e)}"
        }, 500

def filter_associations_post(filter_data):
    try:
        # Obtener todas las asociaciones de la base de datos real
        associations = AssociationService.get_all_associations()
        filtered = [association.serialize() for association in associations]
        
        # Extrae parámetros del filtro
        filter_types = filter_data.get('types', [])
        location = filter_data.get('location', '')
        min_id = filter_data.get('min_id', 0)
        
        # Aplicar filtros si existen
        if filter_types:
            # Nota: Necesitaríamos un campo 'type' en el modelo Association
            pass  # Por ahora no filtramos por tipo
        
        if location:
            # Filtrar por ubicación si existe en el modelo
            location_lower = location.lower()
            # Esto requeriría un campo location en Association
            pass  # Por ahora no filtramos por ubicación
        
        if min_id:
            filtered = [a for a in filtered if a['id'] >= min_id]
        
        # Ordenar resultados
        if 'sort' in filter_data:
            sort_field = filter_data['sort']
            reverse = filter_data.get('reverse', False)
            if sort_field in ['id', 'name']:  # Solo campos que existen
                filtered.sort(key=lambda x: x.get(sort_field, ''), reverse=reverse)
        
        return {
            "success": True,
            "count": len(filtered),
            "filters_applied": filter_data,
            "associations": filtered
        }
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Error al filtrar asociaciones: {str(e)}"
        }