import React from "react";
import { Link } from "react-router-dom";

export const AssociationCard = ({ association }) => {
    return (
        <div className="card h-100 shadow-sm">
            <img
                src={association.image_url || 'https://placehold.co/400x200/6c757d/ffffff?text=Asociación'}
                className="card-img-top"
                alt={association.name}
                style={{ height: '200px', objectFit: 'cover' }}
            />
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{association.name}</h5>
                <p className="card-text flex-grow-1">
                    {association.description?.length > 100
                        ? `${association.description.substring(0, 100)}...`
                        : association.description
                    }
                </p>
                <div className="mt-auto">
                    <small className="text-muted d-block mb-2">
                        <i className="bi bi-envelope me-1"></i>
                        {association.contact_email}
                    </small>
                    <Link to={`/association/${association.id}`} className="btn btn-primary w-100">
                        Ver detalle
                    </Link>
                </div>
            </div>
        </div>
    );
}; 