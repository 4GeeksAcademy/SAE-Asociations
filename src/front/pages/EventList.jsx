import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EventCard } from "../components/EventCard.jsx";
import { useLocation } from "react-router-dom";
import authService from "../services/authService";
import NotificationModal from '../components/NotificationModal';
import useNotification from '../hooks/useNotification';
import { FilterModal } from "../components/FilterModal";
import '../styles/event-list.css'; // Asegúrate de que este archivo CSS exista y contenga los estilos

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filteredByAssociation, setFilteredByAssociation] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { association_id } = useParams(); // Obtiene association_id de la URL de React Router
    const { notification, hideNotification, showSuccess, showError, showConfirm } = useNotification();

    /* Estado para los filtros */
    const [appliedFilters, setAppliedFilters] = useState({
        city: '',
        event_type: '',
        sort_by_date: 'newest' // Valor por defecto para la ordenación
    });

    /* Visibilidad del modal de filtros */
    const [showFilterModal, setShowFilterModal] = useState(false);

    /* Abrir y cerrar modal de filtros */
    const handleOpenFilterModal = () => setShowFilterModal(true);
    const handleCloseFilterModal = () => setShowFilterModal(false);

    const handleApplyFilters = (filtersFromModal) => {
        setAppliedFilters(filtersFromModal); // Actualiza los filtros aplicados
        handleCloseFilterModal(); // Cierra el modal después de aplicar
    };

    const getEvents = async (currentAssociationId = null, currentFilters = appliedFilters) => {
        try {
            setLoading(true);
            setError(''); // Limpia errores anteriores

            let url = `${API_BASE_URL}/api/events`;
            const queryParams = new URLSearchParams();

            // Añadir association_id si está presente (de los parámetros de la URL o query param)
            if (currentAssociationId) {
                queryParams.append('association_id', currentAssociationId);
            }

            // Añadir filtros desde el estado `appliedFilters`
            if (currentFilters.city) {
                queryParams.append('city', currentFilters.city);
            }
            if (currentFilters.event_type) {
                queryParams.append('event_type', currentFilters.event_type);
            }
            if (currentFilters.sort_by_date) {
                queryParams.append('sort_by_date', currentFilters.sort_by_date);
            }

            // Construir la URL final con los query parameters
            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const token = authService.getToken();
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(url, { headers });

            if (res.ok) {
                const data = await res.json();
                // Si el backend devuelve un array vacío, o si está dentro de 'events'
                const eventsData = Array.isArray(data) ? data : data.events || [];

                // Aplicar ordenación en el frontend si es necesario, aunque el backend debería manejar sort_by_date
                // const sortedEvents = eventsData.sort((a, b) => {
                //     if (currentFilters.sort_by_date === 'newest') {
                //         return new Date(b.date) - new Date(a.date);
                //     } else if (currentFilters.sort_by_date === 'oldest') {
                //         return new Date(a.date) - new Date(b.date);
                //     }
                //     return 0;
                // });
                setEvents(eventsData); // Asumimos que el backend ya ordena si se le pasa sort_by_date
                setError('');
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Error al cargar eventos');
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            setError(error.message);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivateEvent = async (eventId) => {
        showConfirm(
            '¿Desactivar evento?',
            '¿Estás seguro de que quieres desactivar este evento? Los voluntarios ya no podrán verlo ni apuntarse.',
            async () => {
                try {
                    const token = authService.getToken();
                    const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/deactivate`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        // Recargar eventos después de la desactivación
                        getEvents(association_id, appliedFilters);
                        showSuccess('Evento desactivado', 'El evento ha sido desactivado correctamente');
                    } else {
                        const errorData = await response.json();
                        showError('Error al desactivar', errorData.error || 'No se pudo desactivar el evento');
                    }
                } catch (error) {
                    console.error("Error deactivating event:", error);
                    showError('Error de conexión', 'Error de conexión al desactivar el evento');
                }
            }
        );
    };

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    // useEffect principal para cargar eventos cuando cambian las dependencias relevantes
    useEffect(() => {
        let currentAssocId = null;
        if (association_id) {
            currentAssocId = association_id;
            setFilteredByAssociation(association_id);
        } else {
            const queryParams = new URLSearchParams(location.search);
            const queryAssociationId = queryParams.get('association_id');

            if (queryAssociationId) {
                currentAssocId = queryAssociationId;
                setFilteredByAssociation(queryAssociationId);
            } else {
                setFilteredByAssociation(null);
            }
        }
        // Llamada a getEvents con los parámetros correctos
        getEvents(currentAssocId, appliedFilters);

    }, [location.search, association_id, appliedFilters]); // Dependencias: cambios en la URL, parámetros de ruta, y filtros aplicados

    // Limpiar filtros y redirigir (si es necesario)
    const handleClearMainFilters = () => {
        setAppliedFilters({
            city: '',
            event_type: '',
            sort_by_date: 'newest' // Vuelve al valor por defecto
        });
        // Si estás en una URL de asociación, puedes querer volver a /event/list
        // o simplemente recargar los eventos de esa asociación sin filtros adicionales
        if (association_id) {
            // Si el association_id está en la URL, se recargará automáticamente al cambiar appliedFilters
            // Si quieres remover el association_id de la URL, usa navigate
            // navigate('/event/list');
        }
    };

    // Determinar si alguno de los filtros principales está activo
    const areMainFiltersActive = appliedFilters.city !== '' ||
        appliedFilters.event_type !== '' ||
        appliedFilters.sort_by_date !== 'newest';


    if (loading) {
        return (
            <div className="event-list-container d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border loading-spinner" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando eventos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="event-list-container">
                <div className="container">
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="event-list-container">
            <div className="container">
                <div className="event-list-header d-flex justify-content-between align-items-center flex-wrap">
                    <h2 className="event-list-title">
                        {filteredByAssociation
                            ? "Eventos de la asociación" // Puedes añadir lógica para obtener el nombre de la asociación si lo tienes
                            : "Eventos disponibles"}
                    </h2>

                    <div className="event-list-actions d-flex gap-2 align-items-center flex-wrap justify-content-end mt-2 mt-md-0">
                        {areMainFiltersActive && (
                            <button
                                className="btn btn-outline-secondary flex-grow-1 flex-md-grow-0"
                                onClick={handleClearMainFilters}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                Quitar filtros
                            </button>
                        )}
                        <button
                            className="btn btn-outline-secondary d-flex align-items-center flex-grow-1 flex-md-grow-0"
                            onClick={handleOpenFilterModal}
                            title="Filtrar Eventos"
                        >
                            <i className="bi bi-funnel me-1"></i>
                            <span className="d-none d-sm-inline">Filtros</span>
                            <i className="bi bi-chevron-down ms-1"></i>
                        </button>

                        {/* Botón de crear evento / registrar asociación / iniciar sesión */}
                        {user?.role === 'association' ? (
                            <button
                                className="btn btn-association flex-grow-1 flex-md-grow-0"
                                onClick={() => navigate("/event/creation")}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Crear evento
                            </button>
                        ) : user?.role === 'volunteer' ? (
                            <button
                                className="btn btn-association flex-grow-1 flex-md-grow-0"
                                onClick={() => navigate("/register/association")}
                                title="Regístrate como asociación para poder crear eventos"
                            >
                                <i className="bi bi-building me-2"></i>
                                Registrar asociación
                            </button>
                        ) : (
                            <button
                                className="btn btn-outline-primary flex-grow-1 flex-md-grow-0"
                                onClick={() => navigate("/login")}
                            >
                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                Iniciar sesión
                            </button>
                        )}
                    </div>
                </div>

                {events.length === 0 && !loading && !error ? (
                    <div className="col-12 mt-4">
                        <div className="no-events-message text-center">
                            <i className="bi bi-calendar-x display-4 d-block mb-3 text-muted"></i>
                            <h4 className="text-muted">No se encontraron eventos</h4>
                            <p className="text-muted mb-0">
                                {filteredByAssociation
                                    ? "Esta asociación aún no ha publicado eventos con los criterios seleccionados."
                                    : "No hay eventos disponibles en este momento con los criterios seleccionados."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mt-4">
                        {events.map(event => (
                            <div className="col" key={event.id}>
                                <EventCard
                                    event={event}
                                    user={user}
                                    onDeactivate={handleDeactivateEvent}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <FilterModal
                show={showFilterModal}
                onClose={handleCloseFilterModal}
                onApplyFilters={handleApplyFilters}
                initialFilters={appliedFilters}
            />
            <NotificationModal
                show={notification.show}
                onClose={hideNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                confirmText={notification.confirmText}
                cancelText={notification.cancelText}
                onConfirm={notification.onConfirm}
                showCancel={notification.showCancel}
            />
        </div>
    );
};