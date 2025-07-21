import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import authService from '../services/authService.js';
import NotificationModal from '../components/NotificationModal';
import useNotification from '../hooks/useNotification';
import '../styles/event-list.css'; // Reutilizar los estilos

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

export const EventDetail = () => {
    const { store } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [userIsRegistered, setUserIsRegistered] = useState(false)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { notification, hideNotification, showSuccess, showError, showWarning, showConfirm } = useNotification();

    // Función para verificar si hay una imagen válida
    const hasValidImage = (imageUrl) => {
        return imageUrl && imageUrl.trim() !== '';
    };

    // Función para generar la imagen de fallback
    const getFallbackImage = () => {
        return 'https://placehold.co/800x400/4dabf7/ffffff?text=Evento';
    };

    // Función para obtener los detalles del evento del backend
    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/events/${id}`);
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Error al cargar evento:", errorData);
                showError('Error al cargar evento', errorData.error || 'No se pudo cargar el evento.');
                setEvent(null);
                return;
            }
            const eventData = await res.json();
            setEvent(eventData);

            // Verificar si el usuario actual está registrado
            if (store.user && eventData.volunteers) {
                const isUserRegistered = eventData.volunteers.some(
                    (volunteer) => volunteer.id === store.user.id
                );
                setUserIsRegistered(isUserRegistered);
            } else {
                setUserIsRegistered(false);
            }
        } catch (error) {
            console.error("Error al obtener detalles del evento:", error);
            showError('Error de conexión', 'Hubo un problema al cargar los detalles del evento.');
            setEvent(null);
        } finally {
            setLoading(false);
        }
    };

    // Función para que un voluntario se apunte a un evento
    const handleJoinEvent = async () => {
        const currentUser = authService.getCurrentUser();

        if (!currentUser || currentUser.association) {
            showWarning('Acceso denegado', 'Debes iniciar sesión como voluntario para apuntarte.');
            return;
        }

        // Verificar si el evento está lleno
        const maxVolunteers = event.max_volunteers;
        const currentVolunteers = event.volunteers?.length || 0;

        if (maxVolunteers && currentVolunteers >= maxVolunteers) {
            showWarning('Evento lleno', 'Este evento ya está lleno.');
            return;
        }

        try {
            const token = authService.getToken();
            const response = await fetch(`${API_BASE_URL}/api/volunteers/${id}/join`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('¡Te has apuntado!', data.message);
                fetchEventDetails();
            } else {
                showError('Error al apuntarse', data.message || 'Error desconocido');
            }
        } catch (error) {
            console.error("Error al unirse al evento:", error);
            showError('Error de conexión', 'Hubo un error al intentar apuntarse al evento.');
        }
    };

    // Función para que un voluntario se desapunte de un evento
    const handleLeaveEvent = async () => {
        const currentUser = authService.getCurrentUser();

        if (!currentUser || currentUser.association) {
            showWarning('Acceso denegado', 'Debes iniciar sesión como voluntario para desapuntarte.');
            return;
        }

        try {
            const token = authService.getToken();
            const response = await fetch(`${API_BASE_URL}/api/volunteers/${id}/leave`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Te has desapuntado', data.message);
                fetchEventDetails();
            } else {
                showError('Error al desapuntarse', data.message || 'Error desconocido');
            }
        } catch (error) {
            console.error("Error al desapuntarse del evento:", error);
            showError('Error de conexión', 'Hubo un error al intentar desapuntarse del evento.');
        }
    };

    // Función para desactivar evento (solo para asociaciones)
    const handleDeactivateEvent = async () => {
        const currentUser = authService.getCurrentUser();

        if (!currentUser || currentUser.role !== 'association') {
            showWarning('Acceso denegado', 'Solo las asociaciones pueden desactivar eventos.');
            return;
        }

        if (currentUser.association?.id !== event.association_id) {
            showWarning('Acceso denegado', 'Solo la asociación que creó el evento puede desactivarlo.');
            return;
        }

        showConfirm(
            '¿Desactivar evento?',
            '¿Estás seguro de que quieres desactivar este evento? Los voluntarios ya no podrán verlo ni apuntarse.',
            async () => {
                try {
                    const token = authService.getToken();
                    const response = await fetch(`${API_BASE_URL}/api/events/${id}/deactivate`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        showSuccess('Evento desactivado', 'El evento ha sido desactivado correctamente');
                        fetchEventDetails(); // Recargar para mostrar el estado actualizado
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
        fetchEventDetails();
    }, [id, store.user?.id]);

    if (loading) {
        return (
            <div className="event-list-container d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border loading-spinner" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando evento...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="event-list-container">
                <div className="container">
                    <div className="alert alert-danger" role="alert">
                        {error || 'No se pudo cargar el evento'}
                    </div>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate("/event/list")}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Volver a eventos
                    </button>
                </div>
            </div>
        );
    }

    // Variables de ayuda para el renderizado condicional
    const currentVolunteers = parseInt(event.Volunteers_count) || 0;
    const maxVolunteers = parseInt(event.max_volunteers) || null;
    const isEventFull = maxVolunteers !== null && currentVolunteers >= maxVolunteers;
    const availableSlots = maxVolunteers !== null ? maxVolunteers - currentVolunteers : null;

    return (
        <div className="event-list-container event-detail-layout">
            <div className="container">
                {/* Header */}
                <div className="event-list-header d-flex justify-content-between align-items-center mb-4">
                    <h2 className="event-list-title">
                        Detalles del Evento
                    </h2>
                    <div className="event-list-actions">
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate("/event/list")}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Volver a eventos
                        </button>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Columna izquierda - Detalles principales */}
                    <div className="col-lg-8">
                        <div className="event-detail-card">
                            <div className="event-detail-header">
                                <img
                                    src={hasValidImage(event.image_url) ? event.image_url : getFallbackImage()}
                                    className="event-detail-image"
                                    alt={event.title}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = getFallbackImage();
                                    }}
                                />
                                {!event.is_active && (
                                    <div className="event-status-badge">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        Inactivo
                                    </div>
                                )}
                            </div>
                            <div className="event-detail-body">
                                <div className="event-detail-info">
                                    <h3 className="event-detail-title">{event.title}</h3>
                                    <p className="event-detail-description">
                                        {event.description || 'No hay descripción disponible para este evento.'}
                                    </p>
                                </div>

                                <div className="event-detail-meta">
                                    <div className="meta-item">
                                        <i className="bi bi-calendar-event text-association"></i>
                                        <div className="meta-content">
                                            <span className="meta-label">Fecha y Hora</span>
                                            <span className="meta-value">
                                                {new Date(event.date).toLocaleString('es-ES', {
                                                    dateStyle: 'full',
                                                    timeStyle: 'short'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="meta-item">
                                        <i className="bi bi-building text-association"></i>
                                        <div className="meta-content">
                                            <span className="meta-label">Organizado por</span>
                                            <span className="meta-value">
                                                <Link
                                                    to={`/association/${event.association_id}`}
                                                    className="text-decoration-none text-association"
                                                    style={{ fontWeight: '600' }}
                                                >
                                                    {event.association_name || 'Asociación desconocida'}
                                                </Link>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="meta-item">
                                        <i className="bi bi-geo-alt text-association"></i>
                                        <div className="meta-content">
                                            <span className="meta-label">Ubicación</span>
                                            <span className="meta-value">
                                                {event.city}
                                                {event.address && (
                                                    <>
                                                        <br />
                                                        <small className="text-muted" style={{ fontSize: '0.85em' }}>
                                                            {event.address}
                                                        </small>
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="meta-item">
                                        <i className="bi bi-tag text-association"></i>
                                        <div className="meta-content">
                                            <span className="meta-label">Categoría</span>
                                            <span className="meta-value">
                                                {event.event_type || 'Sin categoría'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha - Detalles de voluntariado */}
                    <div className="col-lg-4">
                        <div className="event-detail-sidebar">
                            <div className="sidebar-section">
                                <h5 className="sidebar-title">
                                    <i className="bi bi-people text-volunteer me-2"></i>
                                    Detalles de Voluntariado
                                </h5>

                                {/* Información de capacidad */}
                                <div className="capacity-info">
                                    <div className="capacity-header">
                                        <span className="capacity-label">Voluntarios apuntados</span>
                                        <span className="capacity-value">
                                            {currentVolunteers}
                                            {maxVolunteers !== null ? ` / ${maxVolunteers}` : ''}
                                        </span>
                                    </div>

                                    {/* Barra de progreso */}
                                    {maxVolunteers !== null && (
                                        <div className="progress-container">
                                            <div className="progress-bar-bg">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{
                                                        width: `${(currentVolunteers / maxVolunteers) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Estado del evento */}
                                    {event.max_volunteers !== null && (
                                        <div className={`status-indicator ${isEventFull ? 'status-full' : 'status-available'}`}>
                                            <i className={`bi ${isEventFull ? 'bi-exclamation-triangle' : 'bi-check-circle'}`}></i>
                                            <span>
                                                {isEventFull
                                                    ? "¡Evento lleno!"
                                                    : `${availableSlots} plazas disponibles`
                                                }
                                            </span>
                                        </div>
                                    )}

                                    {event.max_volunteers === null && (
                                        <div className="status-indicator status-unlimited">
                                            <i className="bi bi-infinity"></i>
                                            <span>Sin límite de voluntarios</span>
                                        </div>
                                    )}
                                </div>

                                {/* Botones de acción */}
                                {store.isAuthenticated && store.user?.role === 'volunteer' && (
                                    <div className="action-buttons">
                                        {userIsRegistered ? (
                                            <button
                                                className="btn btn-outline-danger w-100"
                                                onClick={handleLeaveEvent}
                                            >
                                                <i className="bi bi-person-dash me-2"></i>
                                                Desapuntarse
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-volunteer w-100"
                                                onClick={handleJoinEvent}
                                                disabled={isEventFull}
                                            >
                                                <i className="bi bi-person-plus me-2"></i>
                                                {isEventFull ? "Evento Lleno" : "Apuntarse al Evento"}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Botón para desactivar evento (solo para asociaciones) */}
                                {store.isAuthenticated &&
                                    store.user?.role === 'association' &&
                                    store.user?.association?.id === event.association_id &&
                                    event.is_active && (
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-danger w-100"
                                                onClick={handleDeactivateEvent}
                                            >
                                                <i className="bi bi-x-circle me-2"></i>
                                                Desactivar Evento
                                            </button>
                                        </div>
                                    )}

                                {/* Mensajes informativos */}
                                {!store.isAuthenticated && (
                                    <div className="info-message">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Inicia sesión como voluntario para apuntarte.
                                    </div>
                                )}

                                {store.isAuthenticated && store.user?.role === 'association' && (
                                    <div className="info-message">
                                        <i className="bi bi-info-circle me-2"></i>
                                        Las asociaciones no pueden apuntarse a eventos.
                                    </div>
                                )}

                                {/* Lista de voluntarios */}
                                <div className="volunteers-section">
                                    <h6 className="volunteers-title">
                                        <i className="bi bi-people-fill text-volunteer me-2"></i>
                                        Voluntarios Apuntados
                                    </h6>

                                    {event.volunteers && event.volunteers.length > 0 ? (
                                        <div className="volunteers-list">
                                            {event.volunteers.map((volunteer) => (
                                                <div key={volunteer.id} className="volunteer-item">
                                                    <div className="volunteer-avatar">
                                                        {volunteer.profile_image ? (
                                                            <img
                                                                src={volunteer.profile_image}
                                                                alt={`${volunteer.name} ${volunteer.lastname}`}
                                                                className="volunteer-image"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'block';
                                                                }}
                                                            />
                                                        ) : (
                                                            <i className="bi bi-person-circle"></i>
                                                        )}
                                                    </div>
                                                    <div className="volunteer-info">
                                                        <span className="volunteer-name">
                                                            {volunteer.name} {volunteer.lastname}
                                                        </span>
                                                        <small className="volunteer-date">
                                                            Se apuntó el {new Date(volunteer.joined_at).toLocaleDateString('es-ES')}
                                                        </small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-volunteers">
                                            <i className="bi bi-people text-muted"></i>
                                            <p className="text-muted">Aún no hay voluntarios apuntados</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
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