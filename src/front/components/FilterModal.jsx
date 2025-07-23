import React, { useState, useEffect } from "react";

export const FilterModal = ({ show, onClose, onApplyFilters, initialFilters }) => {

    const [currentFilters, setCurrentFilters] = useState(
        JSON.parse(JSON.stringify(initialFilters))
    );

    useEffect(() => {
        setCurrentFilters(JSON.parse(JSON.stringify(initialFilters)));
    }, [initialFilters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Recargar la página
        onApplyFilters(currentFilters); // Pasa los filtros al componente padre
        onClose(); // Cierra el modal
    };

    if (!show) {
        return null; // No renderiza si no es visible
    }

    return (
        <div
            className="filter-modal-overlay"
            onClick={onClose}
        >
            <div className="filter-modal-dialog" onClick={e => e.stopPropagation()}>
                <div className="filter-modal-content">
                    <div className="filter-modal-header">
                        <div className="filter-modal-title-section">
                            <div className="filter-modal-icon">
                                <i className="bi bi-funnel-fill"></i>
                            </div>
                            <h5 className="filter-modal-title">Filtrar Eventos</h5>
                        </div>
                        <button
                            type="button"
                            className="filter-modal-close"
                            onClick={onClose}
                            aria-label="Cerrar"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="filter-modal-body">
                            {/* Filtro por Ciudad */}
                            <div className="filter-group">
                                <label htmlFor="cityFilter" className="filter-label">
                                    <i className="bi bi-geo-alt-fill me-2"></i>
                                    Ciudad
                                </label>
                                <input
                                    type="text"
                                    className="filter-input"
                                    id="cityFilter"
                                    name="city"
                                    value={currentFilters.city}
                                    onChange={handleChange}
                                    placeholder="Ej: Jaén, Madrid, Barcelona..."
                                />
                            </div>

                            {/* Filtro por Tipo de Evento */}
                            <div className="filter-group">
                                <label htmlFor="eventTypeFilter" className="filter-label">
                                    <i className="bi bi-tag-fill me-2"></i>
                                    Tipo de Evento
                                </label>
                                <select
                                    className="filter-select"
                                    id="eventTypeFilter"
                                    name="event_type"
                                    value={currentFilters.event_type}
                                    onChange={handleChange}
                                >
                                    <option value="">Todos los tipos</option>
                                    <option value="Medio Ambiente">🌱 Medio Ambiente</option>
                                    <option value="Educación">📚 Educación</option>
                                    <option value="Salud">🏥 Salud</option>
                                    <option value="Comunidad">🏘️ Comunidad</option>
                                    <option value="Animales">🐾 Animales</option>
                                    <option value="Deporte">⚽ Deporte</option>
                                    <option value="Cultura">🎭 Cultura</option>
                                    <option value="Otro">📝 Otro</option>
                                </select>
                            </div>

                            {/* Filtro por Ordenación de Fecha */}
                            <div className="filter-group">
                                <label htmlFor="dateSortFilter" className="filter-label">
                                    <i className="bi bi-calendar-event-fill me-2"></i>
                                    Ordenar por Fecha
                                </label>
                                <select
                                    className="filter-select"
                                    id="dateSortFilter"
                                    name="sort_by_date"
                                    value={currentFilters.sort_by_date}
                                    onChange={handleChange}
                                >
                                    <option value="newest">📅 Más recientes</option>
                                    <option value="oldest">📆 Más antiguos</option>
                                </select>
                            </div>
                        </div>

                        <div className="filter-modal-footer">
                            <button
                                type="button"
                                className="filter-btn filter-btn-secondary"
                                onClick={onClose}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="filter-btn filter-btn-primary"
                            >
                                <i className="bi bi-check-circle me-2"></i>
                                Aplicar Filtros
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};