import React from "react"
import { Link } from "react-router-dom";

export const EventCard = ({ event, user, onDeactivate }) => {
    const canDeactivate = user &&
        user.role === 'association' &&
        user.association &&
        user.association.id === event.association_id &&
        event.is_active;

    const hasValidImage = (imageUrl) => {
        return imageUrl && imageUrl.trim() !== '';
    };

    const getAssociationFallbackImage = () => {
        const initial = event.association_name?.charAt(0) || 'A';
        return `https://placehold.co/40x40/4dabf7/ffffff?text=${initial}`;
    };

    const getEventFallbackImage = () => {
        return 'https://placehold.co/400x200/6c757d/ffffff?text=Evento';
    };

    const getTruncatedTitle = (title) => {
        if (!title) return '';

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        let maxLength = 20; // Límite por defecto para la mayoría de pantallas

        // Solo para dispositivos MUY específicos y problemáticos
        if (screenWidth === 360 && screenHeight === 740) {
            // Samsung S8+ exacto
            maxLength = 16;
        } else if (screenWidth === 344 && screenHeight === 882) {
            // Z Fold exacto  
            maxLength = 16;
        } else if (screenWidth >= 1024 && screenWidth <= 1366) {
            // Solo tablets grandes/iPad Pro
            maxLength = 25;
        }

        return title.length > maxLength
            ? `${title.substring(0, maxLength)}...`
            : title;
    };

    return (
        <div className="event-card d-flex flex-column h-100">
            <div className="event-header position-relative">
                <img
                    src={hasValidImage(event.image_url) ? event.image_url : getEventFallbackImage()}
                    className="event-image"
                    alt={event.title}
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = getEventFallbackImage();
                    }}
                />

                {canDeactivate && (
                    <button
                        className="btn-icon btn-power-float"
                        onClick={() => onDeactivate(event.id)}
                        title="Desactivar evento"
                        style={{ position: 'absolute', top: 10, right: 10, color: '#e74c3c', background: 'rgba(255,255,255,0.95)', border: '1.5px solid #e74c3c' }}
                    >
                        <i className="bi bi-power"></i>
                    </button>
                )}
                {!event.is_active && (
                    <div className="event-status-badge">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Inactivo
                    </div>
                )}
            </div>

            <div className="event-body">
                <div className="d-flex justify-content-between align-items-start">
                    {/* Título y descripción */}
                    <div className="d-flex flex-column flex-grow-1">
                        <h5 className="event-title">
                            <Link
                                to={`/event/detail/${event.id}`}
                                className="event-title-link"
                                title={event.title}
                            >
                                <i className="bi bi-search event-title-icon"></i>
                                {getTruncatedTitle(event.title)}
                            </Link>
                        </h5>

                        {/* Descripción */}
                        <p className="event-description">
                            {event.description?.length > 75
                                ? `${event.description.substring(0, 75)}...`
                                : event.description || 'Sin descripción disponible'
                            }
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="event-stats-inline">
                        <div className="stat-inline">
                            <i className="bi bi-calendar-event"></i>
                            <span className="stat-value-inline">
                                {new Date(event.date).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short'
                                })}
                            </span>
                        </div>
                        {event.city && (
                            <div className="stat-inline">
                                <i className="bi bi-geo-alt"></i>
                                <span className="stat-value-inline">{event.city}</span>
                            </div>
                        )}
                        {event.event_type && (
                            <div className="stat-inline">
                                <i className="bi bi-tag"></i>
                                <span className="stat-value-inline">{event.event_type}</span>
                            </div>
                        )}
                        <div className="stat-inline">
                            <i className="bi bi-people"></i>
                            <span className="stat-value-inline">
                                {event.Volunteers_count || 0}
                                {event.max_volunteers ? ` / ${event.max_volunteers}` : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Información de la asociación */}
                <div className="event-association border-top pt-2">
                    <div className="association-info d-flex align-items-center">
                        <div className="association-avatar-small me-2">
                            <img
                                src={hasValidImage(event.association_image_url) ? event.association_image_url : getAssociationFallbackImage()}
                                className="avatar-small rounded-circle"
                                alt={event.association_name}
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src = getAssociationFallbackImage();
                                }}
                            />
                        </div>
                        <div className="association-details">
                            <span className="text-truncate text-association d-block" title={event.association_name}>
                                {event.association_name}
                            </span>
                            <small className="text-muted d-block">Organiza este evento</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}