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

    return (
        <div className="event-card d-flex flex-column h-100">
            <div className="event-header position-relative">
                <img
                    src={hasValidImage(event.image_url) ? event.image.url : getEventFallbackImage()}
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

            <div className="event-body d-flex flex-column flex-grow-1 p-3">
                {/* Título del evento con Link y clases para el estilo */}
                <h5 className="event-title mb-3">
                    <Link
                        to={`/event/detail/${event.id}`}
                        className="event-title-link" // Clase específica para el Link del título
                        title={event.title}
                    >
                        <span className="d-flex align-items-center">
                            <i className="bi bi-search event-title-icon" style={{ marginRight: '0.5rem' }}></i>
                            {event.title}
                        </span>
                    </Link>
                </h5>

                {/* Contenedor principal para la descripción (izquierda) y las categorías (derecha) */}
                <div className="d-flex justify-content-between align-items-start flex-grow-1 mb-3">
                    {/* Contenido de la izquierda: Descripción */}
                    <p className="event-description mb-0 me-3 flex-grow-1">
                        {event.description?.length > 100
                            ? `${event.description.substring(0, 100)}...`
                            : event.description || 'Sin descripción disponible'
                        }
                    </p>

                    {/* Contenido de la derecha: Categorías apiladas verticalmente */}
                    <div className="event-info-compact d-flex flex-column gap-2 flex-shrink-0">
                        <div className="info-item d-flex align-items-center">
                            <i className="bi bi-calendar-event me-1"></i>
                            <span className="info-value text-nowrap">
                                {new Date(event.date).toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short'
                                })}
                            </span>
                        </div>
                        {event.city && (
                            <div className="info-item d-flex align-items-center">
                                <i className="bi bi-geo-alt me-1"></i>
                                <span className="info-value text-nowrap">{event.city}</span>
                            </div>
                        )}
                        {event.event_type && (
                            <div className="info-item d-flex align-items-center">
                                <i className="bi bi-tag me-1"></i>
                                <span className="info-value text-nowrap">{event.event_type}</span>
                            </div>
                        )}
                        <div className="info-item d-flex align-items-center">
                            <i className="bi bi-people me-1"></i>
                            <span className="info-value text-nowrap">
                                {event.Volunteers_count || 0}
                                {event.max_volunteers ? ` / ${event.max_volunteers}` : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Información de la asociación - Empujada al final */}
                <div className="event-association mt-auto pt-3 border-top">
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