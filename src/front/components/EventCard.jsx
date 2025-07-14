import React from "react"
import { Link } from "react-router-dom";

export const EventCard = ({ event, user, onDeactivate }) => {
    const canDeactivate = user &&
        user.role === 'association' &&
        user.association &&
        user.association.id === event.association_id &&
        event.is_active;

    // Función para verificar si hay una imagen válida
    const hasValidImage = (imageUrl) => {
        return imageUrl && imageUrl.trim() !== '';
    };

    // Función para generar la imagen de fallback de la asociación
    const getAssociationFallbackImage = () => {
        const initial = event.association_name?.charAt(0) || 'A';
        return `https://placehold.co/40x40/4dabf7/ffffff?text=${initial}`;
    };

    // Función para generar la imagen de fallback del evento
    const getEventFallbackImage = () => {
        return 'https://placehold.co/400x200/6c757d/ffffff?text=Evento';
    };

    return (
        <div className="event-card">
            <div className="event-header position-relative">
                <img
                    src={hasValidImage(event.image_url) ? event.image_url : getEventFallbackImage()}
                    className="event-image"
                    alt={event.title}
                    loading="lazy"
                    onError={(e) => {
                        // Si la imagen falla, mostrar el fallback
                        e.target.src = getEventFallbackImage();
                    }}
                />
                <Link
                    to={`/event/detail/${event.id}`}
                    className="btn-icon btn-view-green btn-view-float"
                    title="Ver detalle"
                    style={{ position: 'absolute', top: 10, left: 10 }}
                >
                    <i className="bi bi-search"></i>
                </Link>
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
                <div className="event-info">
                    <h5 className="event-title mb-0" title={event.title} style={{ display: 'inline-block' }}>
                        {event.title}
                    </h5>
                    <div className="event-info-compact">
                        <div className="info-item">
                            <i className="bi bi-calendar-event"></i>
                            <span className="info-value">
                                {new Date(event.date).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short'
                                })}
                            </span>
                        </div>
                        <div className="info-item">
                            <i className="bi bi-people"></i>
                            <span className="info-value">
                                {event.Volunteers_count || 0}
                                {event.max_volunteers ? ` / ${event.max_volunteers}` : ''}
                            </span>
                        </div>
                    </div>
                </div>
                <p className="event-description">
                    {event.description?.length > 100
                        ? `${event.description.substring(0, 100)}...`
                        : event.description || 'Sin descripción disponible'
                    }
                </p>

                <div className="event-association">
                    <div className="association-info">
                        <div className="association-avatar-small">
                            <img
                                src={hasValidImage(event.association_image_url) ? event.association_image_url : getAssociationFallbackImage()}
                                className="avatar-small"
                                alt={event.association_name}
                                loading="lazy"
                                onError={(e) => {
                                    // Si la imagen falla, mostrar el fallback
                                    e.target.src = getAssociationFallbackImage();
                                }}
                            />
                        </div>
                        <div className="association-details">
                            <span className="text-truncate text-association" title={event.association_name}>
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