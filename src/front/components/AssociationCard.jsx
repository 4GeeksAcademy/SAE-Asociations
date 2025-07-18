import React from "react";
import { Link } from "react-router-dom";

export const AssociationCard = ({ association, statistics }) => {
    // Función para verificar si hay una imagen válida
    const hasValidImage = (imageUrl) => {
        return imageUrl && imageUrl.trim() !== '';
    };

    // Función para generar la imagen de fallback
    const getFallbackImage = () => {
        const initial = association.name?.charAt(0) || 'A';
        return `https://placehold.co/150x150/4dabf7/ffffff?text=${initial}`;
    };

    return (
        <div className="association-card">
            <div className="association-header">
                <div className="association-avatar">
                    <img
                        src={hasValidImage(association.image_url) ? association.image_url : getFallbackImage()}
                        className="avatar-image"
                        alt={association.name}
                        loading="lazy"
                        onError={(e) => {
                            // Si la imagen falla, mostrar el fallback
                            e.target.src = getFallbackImage();
                        }}
                    />
                </div>
                <div className="association-info">
                    <h5 className="association-name" title={association.name}>
                        {association.name}
                    </h5>
                </div>
            </div>

            <div className="association-body">
                <div className="association-content">
                    <p className="association-description">
                        {association.description?.length > 200
                            ? `${association.description.substring(0, 200)}...`
                            : association.description || 'Sin descripción disponible'
                        }
                    </p>

                    <div className="association-stats-inline">
                        <div className="stat-inline">
                            <i className="bi bi-calendar-event text-association"></i>
                            <span className="stat-value-inline">{statistics.active_events_count || 0}</span>
                        </div>
                        <div className="stat-inline">
                            <i className="bi bi-people text-volunteer"></i>
                            <span className="stat-value-inline">{statistics.total_volunteers || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="association-actions">
                    <Link
                        to={`/association/${association.id}`}
                        className="btn btn-outline-association"
                    >
                        <i className="bi bi-eye me-2"></i>
                        Ver perfil
                    </Link>
                    <Link
                        to={`/event/list?association_id=${association.id}`}
                        className="btn btn-volunteer"
                    >
                        <i className="bi bi-calendar-check me-2"></i>
                        Ver eventos
                    </Link>
                </div>
            </div>
        </div>
    );
}; 