import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

export const AssociationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [association, setAssociation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAssociation = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE_URL}/api/associations/${id}`);
                const data = await res.json();

                if (data.success) {
                    setAssociation(data.association);
                } else {
                    setError('Asociación no encontrada');
                }
            } catch (error) {
                console.error("Error fetching association:", error);
                setError('Error al cargar la asociación');
            } finally {
                setLoading(false);
            }
        };

        fetchAssociation();
    }, [id]);

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando información de la asociación...</p>
            </div>
        );
    }

    if (error || !association) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    {error || 'Asociación no encontrada'}
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/associations')}
                >
                    Volver a asociaciones
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <button
                            className="btn btn-link p-0 text-decoration-none"
                            onClick={() => navigate('/associations')}
                        >
                            Asociaciones
                        </button>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {association.name}
                    </li>
                </ol>
            </nav>

            {/* Header */}
            <div className="row mb-5">
                <div className="col-lg-8">
                    <h1 className="display-4 mb-3">{association.name}</h1>
                    <p className="lead text-muted mb-4">{association.description}</p>

                    {/* CIF */}
                    <div className="mb-3">
                        <small className="text-muted">
                            <strong>CIF:</strong> {association.cif}
                        </small>
                    </div>
                </div>
                <div className="col-lg-4">
                    <img
                        src={association.image_url || 'https://via.placeholder.com/400x300?text=Asociación'}
                        alt={association.name}
                        className="img-fluid rounded shadow"
                    />
                </div>
            </div>

            {/* Información de contacto */}
            <div className="row mb-5">
                <div className="col-12">
                    <h3 className="mb-4">Información de contacto</h3>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        <i className="bi bi-envelope-fill text-primary me-2"></i>
                                        Email
                                    </h5>
                                    <p className="card-text">
                                        <a href={`mailto:${association.contact_email}`} className="text-decoration-none">
                                            {association.contact_email}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {association.contact_phone && (
                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <i className="bi bi-telephone-fill text-success me-2"></i>
                                            Teléfono
                                        </h5>
                                        <p className="card-text">
                                            <a href={`tel:${association.contact_phone}`} className="text-decoration-none">
                                                {association.contact_phone}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {association.website_url && (
                            <div className="col-md-6 mt-3">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <i className="bi bi-globe text-info me-2"></i>
                                            Sitio web
                                        </h5>
                                        <p className="card-text">
                                            <a
                                                href={association.website_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-decoration-none"
                                            >
                                                Visitar sitio web
                                                <i className="bi bi-box-arrow-up-right ms-1"></i>
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {association.social_media_url && (
                            <div className="col-md-6 mt-3">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <i className="bi bi-share text-warning me-2"></i>
                                            Redes sociales
                                        </h5>
                                        <p className="card-text">
                                            <a
                                                href={association.social_media_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-decoration-none"
                                            >
                                                Seguir en redes sociales
                                                <i className="bi bi-box-arrow-up-right ms-1"></i>
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Acciones */}
            <div className="row mb-5">
                <div className="col-12">
                    <h3 className="mb-4">¿Cómo puedes ayudar?</h3>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card border-primary">
                                <div className="card-body text-center">
                                    <i className="bi bi-heart-fill text-danger mb-3" style={{ fontSize: '2rem' }}></i>
                                    <h5 className="card-title">Hacer una donación</h5>
                                    <p className="card-text">Apoya directamente la causa de esta asociación</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/donate/association')}
                                    >
                                        Donar ahora
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-success">
                                <div className="card-body text-center">
                                    <i className="bi bi-people-fill text-success mb-3" style={{ fontSize: '2rem' }}></i>
                                    <h5 className="card-title">Ver eventos</h5>
                                    <p className="card-text">Participa en eventos organizados por esta asociación</p>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => navigate('/event/list')}
                                    >
                                        Ver eventos
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 