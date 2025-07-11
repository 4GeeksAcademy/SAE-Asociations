import React from "react"
import { Link } from "react-router-dom";

export const EventCard = ({ event, user, onDeactivate }) => {
    // Verificar si el usuario actual es la asociación propietaria del evento
    const canDeactivate = user &&
        user.role === 'association' &&
        user.association &&
        user.association.id === event.association_id &&
        event.is_active;

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
                <small className="text-muted mb-3">
                    <i className="bi bi-building me-1"></i>
                    {event.association_name}
                </small>
                <div className="d-flex gap-2 mt-auto">
                    <Link to={`/event/detail/${event.id}`} className="btn btn-primary flex-grow-1">
                        Ver detalle
                    </Link>
                    {canDeactivate && (
                        <button
                            className="btn btn-outline-danger"
                            onClick={() => onDeactivate(event.id)}
                            title="Desactivar evento"
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}