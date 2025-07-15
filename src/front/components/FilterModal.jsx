import React, { useState, useEffect } from "react";

export const FilterModal = ({ show, onClose, onApplyFilters, initialFilters }) => {
    // Estado interno para los filtros, inicializado desde la prop initialFilters
    const [currentFilters, setCurrentFilters] = useState(initialFilters);

    // Actualiza el estado interno cuando la prop initialFilters cambia (ej. cuando el modal se abre con filtros previos)
    useEffect(() => {
        setCurrentFilters(initialFilters);
    }, [initialFilters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onApplyFilters(currentFilters); // Pasa los filtros al componente padre
        onClose(); // Cierra el modal
    };

    if (!show) {
        return null; // No renderiza si no es visible
    }

    return (
        // El div principal del modal. Usamos un estilo en línea para mostrarlo/ocultarlo.
        // El onClick en el div principal permite cerrar el modal al hacer clic fuera del contenido.
        <div 
            className="modal" 
            tabIndex="-1" 
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
            aria-labelledby="filterModalLabel" 
            aria-hidden={!show}
            onClick={onClose} 
        >
            {/* Contenido del modal. El onClick de aquí previene que el modal se cierre al hacer clic DENTRO del contenido. */}
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}> 
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="filterModalLabel">Filtrar Eventos</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* Filtro por Ciudad */}
                            <div className="mb-3">
                                <label htmlFor="cityFilter" className="form-label">Ciudad:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="cityFilter"
                                    name="city" // <-- Coincide con el nombre del parámetro en el backend
                                    value={currentFilters.city}
                                    onChange={handleChange}
                                    placeholder="Ej: Lleida"
                                />
                            </div>

                            {/* Filtro por Ordenación de Fecha */}
                            <div className="mb-3">
                                <label htmlFor="dateSortFilter" className="form-label">Fecha:</label>
                                <select
                                    className="form-select"
                                    id="dateSortFilter"
                                    name="sort_by_date" // <-- Coincide con el nombre del parámetro en el backend
                                    value={currentFilters.sort_by_date}
                                    onChange={handleChange}
                                >
                                    <option value="newest">Más recientes</option>
                                    <option value="oldest">Más antiguos</option>
                                </select>
                            </div>

                            {/* Filtro por Tipo de Evento */}
                            <div className="mb-3">
                                <label htmlFor="eventTypeFilter" className="form-label">Tipo de Evento:</label>
                                <select
                                    className="form-select"
                                    id="eventTypeFilter"
                                    name="event_type" // <-- Coincide con el nombre del parámetro en el backend
                                    value={currentFilters.event_type}
                                    onChange={handleChange}
                                >
                                    <option value="">Todos los tipos</option>
                                    <option value="Medio Ambiente">Medio Ambiente</option>
                                    <option value="Educación">Educación</option>
                                    <option value="Salud">Salud</option>
                                    <option value="Comunidad">Comunidad</option>
                                    <option value="Animales">Animales</option>
                                    <option value="Deporte">Deporte</option>
                                    <option value="Cultura">Cultura</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                            <button type="submit" className="btn btn-primary">Aplicar Filtros</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};