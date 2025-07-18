import React from "react"
import { Link } from "react-router-dom";

export const EventCard = ({ event, user, onDeactivate }) => {
    const canDeactivate = user &&
        user.role === 'association' &&
        user.association &&
        user.association.id === event.association_id &&
        event.is_active;


    const formattedDate = new Date(event.date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long', // 'long' para el nombre completo del mes (ej: "julio")
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="card h-100">
            <img
                src={event.image_url || 'https://placehold.co/400x200/6c757d/ffffff?text=Evento'}
                className="card-img-top"
                alt={event.title}
                style={{ height: '200px', objectFit: 'cover' }}
            />
            <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title">{event.title}</h5>
                    {!event.is_active && (
                        <span className="badge bg-warning text-dark">Inactivo</span>
                    )}
                </div>
                <p className="card-text flex-grow-1">{event.description}</p>
                <ul className="list-unstyled small text-muted mb-3">
                    <li>
                        <i className="bi bi-calendar-event me-2"></i>
                        Fecha: {formattedDate}
                    </li>
                    {event.city && (
                        <li>
                            <i className="bi bi-geo-alt me-2"></i>
                            Ciudad: {event.city}
                        </li>
                    )}
                    {event.event_type && (
                        <li>
                            <i className="bi bi-tag me-2"></i>
                            Tipo: {event.event_type}
                        </li>
                    )}
                    <li>
                        <i className="bi bi-building me-2"></i>
                        Organiza: {event.association_name}
                    </li>
                </ul>
                
                <div className="d-flex gap-2 mt-auto">
                    <Link to={`/event/detail/${event.id}`} className="btn btn-primary flex-grow-1">
                        Ver detalle
                    </Link>
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