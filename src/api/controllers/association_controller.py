# Base de datos simulada
associations_db = [
    {"id": 1, "name": "Asociación Animalista", "type": "animales", "location": "Madrid"},
    {"id": 2, "name": "Green Earth", "type": "medio ambiente", "location": "Barcelona"},
    {"id": 3, "name": "Help Children", "type": "infancia", "location": "Valencia"},
    {"id": 4, "name": "Save the Ocean", "type": "medio ambiente", "location": "Bilbao"}
]

def get_all_associations():
    try:
        return {
            "success": True,
            "count": len(associations_db),
            "associations": associations_db
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error al obtener asociaciones: {str(e)}"
        }

def get_association_by_id(association_id):
    try:
        # Buscar asociación por ID
        association = next((a for a in associations_db if a["id"] == association_id), None)
        
        if association:
            return {
                "success": True,
                "association": association
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
        # Extrae parámetros del filtro
        filter_types = filter_data.get('types', [])
        location = filter_data.get('location', '')
        min_id = filter_data.get('min_id', 0)
        
        # Aplica filtros
        filtered = associations_db.copy()
        
        if filter_types:
            filter_types_lower = [t.lower() for t in filter_types]
            filtered = [a for a in filtered if a['type'].lower() in filter_types_lower]
        
        if location:
            location_lower = location.lower()
            filtered = [a for a in filtered if location_lower in a['location'].lower()]
        
        if min_id:
            filtered = [a for a in filtered if a['id'] >= min_id]
        
        # Ordenar resultados
        if 'sort' in filter_data:
            sort_field = filter_data['sort']
            reverse = filter_data.get('reverse', False)
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