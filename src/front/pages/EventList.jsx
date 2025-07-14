import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EventCard } from "../components/EventCard.jsx";
import { useLocation } from "react-router-dom";
import authService from "../services/authService";
import NotificationModal from '../components/NotificationModal';
import useNotification from '../hooks/useNotification';
import '../styles/event-list.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filteredByAssociation, setFilteredByAssociation] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { association_id } = useParams();
    const { notification, hideNotification, showSuccess, showError, showConfirm } = useNotification();

    const getEvents = async (associationId = null) => {
        try {
            setLoading(true);
            let url = `${API_BASE_URL}/api/events/`;

            if (associationId) {
                url += `?association_id=${associationId}`;
            }

            const token = authService.getToken();
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(url, { headers });
            if (!res.ok) {
                throw new Error('Error al cargar eventos');
            }

            const data = await res.json();
            setEvents(data);
            setError('');
        } catch (error) {
            console.error("Error fetching events:", error);
            setError(error.message);
        }
        finally {
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
                        getEvents(association_id);
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

        // Si hay un association_id en la URL, usarlo
        if (association_id) {
            setFilteredByAssociation(association_id);
            getEvents(association_id);
        } else {
            // Si no hay association_id, revisar si hay uno en los query params (para mantener compatibilidad)
            const queryParams = new URLSearchParams(location.search);
            const queryAssociationId = queryParams.get('association_id');

            if (queryAssociationId) {
                setFilteredByAssociation(queryAssociationId);
                getEvents(queryAssociationId);
            } else {
                setFilteredByAssociation(null);
                getEvents();
            }
        }
    }, [location.search, association_id]);

    const handleClearFilter = () => {
        navigate('/event/list');
    };

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
                <div className="event-list-header d-flex justify-content-between align-items-center">
                    <h2 className="event-list-title">
                        {filteredByAssociation
                            ? "Eventos de la asociación"
                            : "Eventos disponibles"}
                    </h2>

                    <div className="event-list-actions">
                        {filteredByAssociation && (
                            <button
                                className="btn btn btn-outline-primary me-2"
                                onClick={handleClearFilter}
                            >
                                <i className="bi bi-grid-3x3-gap me-2"></i>
                                Ver todos los eventos
                            </button>
                        )}

                        {user?.role === 'association' ? (
                            <button
                                className="btn btn-association"
                                onClick={() => navigate("/event/creation")}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Crear evento
                            </button>
                        ) : user?.role === 'volunteer' ? (
                            <button
                                className="btn btn-outline-association"
                                onClick={() => navigate("/register/association")}
                                title="Regístrate como asociación para poder crear eventos"
                            >
                                <i className="bi bi-building me-2"></i>
                                Registrar asociación
                            </button>
                        ) : (
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => navigate("/login")}
                            >
                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                Iniciar sesión
                            </button>
                        )}
                    </div>
                </div>

                <div className="row g-4">
                    {events.length === 0 ? (
                        <div className="col-12">
                            <div className="no-events-message">
                                <i className="bi bi-calendar-x display-4 d-block mb-3 text-muted"></i>
                                <h4 className="text-muted">No se encontraron eventos</h4>
                                <p className="text-muted mb-0">
                                    {filteredByAssociation
                                        ? "Esta asociación aún no ha publicado eventos"
                                        : "No hay eventos disponibles en este momento"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        events.map(event => (
                            <div className="col-md-6 col-lg-4" key={event.id}>
                                <EventCard
                                    event={event}
                                    user={user}
                                    onDeactivate={handleDeactivateEvent}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
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