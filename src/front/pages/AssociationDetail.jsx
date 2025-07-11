import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RatingDisplay from "../components/RatingDisplay";
import RatingList from "../components/RatingList";
import RatingForm from "../components/RatingForm";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

export const AssociationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [association, setAssociation] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [donations, setDonations] = useState([]);
    const [showAllDonations, setShowAllDonations] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados para rating
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [unratedEvents, setUnratedEvents] = useState([]);
    const [existingRating, setExistingRating] = useState(null);
    const [refreshRatings, setRefreshRatings] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
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

        const fetchStatistics = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/donations/statistics?association_id=${id}`);
                const data = await res.json();
                setStatistics(data);
            } catch (error) {
                console.error("Error fetching statistics:", error);
            }
        };

        const fetchDonations = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/donations?association_id=${id}`);
                const data = await res.json();
                setDonations(data.donations || []);
            } catch (error) {
                console.error("Error fetching donations:", error);
            }
        };

        fetchAssociation();
        fetchStatistics();
        fetchDonations();
    }, [id]);

    const handleRatingSubmitted = (rating, isNewRating) => {
        setRefreshRatings(prev => prev + 1);
        setExistingRating(null);
        setUnratedEvents([]);

        // Mostrar mensaje de éxito personalizado
        const message = !isNewRating
            ? '¡Valoración actualizada exitosamente!'
            : '¡Valoración enviada exitosamente! Gracias por tu feedback.';

        setSuccessMessage(message);

        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
    };

    const handleModalClose = (isNewRating) => {
        // Primero cerramos el modal
        setShowRatingForm(false);

        // Si es una valoración nueva, programamos el scroll
        if (isNewRating) {
            // Esperamos a que el modal se haya cerrado completamente y el DOM se haya actualizado
            setTimeout(() => {
                const ratingsSection = document.getElementById('ratings-section');
                if (ratingsSection) {
                    const firstRatingCard = ratingsSection.querySelector('.card');
                    if (firstRatingCard) {
                        firstRatingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 500);
        }
    };

    const handleSuccessModalClose = () => {
        setSuccessMessage('');
    };

    const handleRateClick = (unratedEvents) => {
        setUnratedEvents(unratedEvents);
        setExistingRating(null);
        setShowRatingForm(true);
    };

    const handleEditRating = (rating) => {
        setExistingRating(rating);
        setUnratedEvents([]);
        setShowRatingForm(true);
    };

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
                        src={association.image_url || 'https://placehold.co/400x300/6c757d/ffffff?text=Asociación'}
                        alt={association.name}
                        className="img-fluid rounded shadow"
                    />
                </div>
            </div>

            {/* Rating Display - Justo después del header */}
            <RatingDisplay
                associationId={parseInt(id)}
                onRateClick={handleRateClick}
            />

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

                        {/* Redes Sociales */}
                        {(association.facebook_url || association.instagram_url || association.twitter_url) && (
                            <div className="col-12 mt-3">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <i className="bi bi-share text-warning me-2"></i>
                                            Redes Sociales
                                        </h5>
                                        <div className="d-flex gap-3 flex-wrap">
                                            {association.facebook_url && (
                                                <a
                                                    href={association.facebook_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-outline-primary btn-sm"
                                                >
                                                    <i className="bi bi-facebook me-1"></i>
                                                    Facebook
                                                </a>
                                            )}
                                            {association.instagram_url && (
                                                <a
                                                    href={association.instagram_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-outline-danger btn-sm"
                                                >
                                                    <i className="bi bi-instagram me-1"></i>
                                                    Instagram
                                                </a>
                                            )}
                                            {association.twitter_url && (
                                                <a
                                                    href={association.twitter_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-outline-info btn-sm"
                                                >
                                                    <i className="bi bi-twitter-x me-1"></i>
                                                    Twitter/X
                                                </a>
                                            )}
                                        </div>
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
                                        onClick={() => navigate(`/donate/association/${association.id}`)}
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
                                        onClick={() => navigate(`/event/list?association_id=${id}`)}
                                    >
                                        Ver eventos
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas de donaciones */}
            {statistics && (
                <div className="row mb-5">
                    <div className="col-12">
                        <h3 className="mb-4">Estadísticas de donaciones</h3>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="card border-success h-100">
                                    <div className="card-body text-center">
                                        <i className="bi bi-currency-euro text-success mb-3" style={{ fontSize: '2.5rem' }}></i>
                                        <h4 className="card-title text-success">
                                            €{statistics.total_amount.toFixed(2)}
                                        </h4>
                                        <p className="card-text text-muted">Total recaudado</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-primary h-100">
                                    <div className="card-body text-center">
                                        <i className="bi bi-people text-primary mb-3" style={{ fontSize: '2.5rem' }}></i>
                                        <h4 className="card-title text-primary">
                                            {statistics.total_count}
                                        </h4>
                                        <p className="card-text text-muted">Donaciones recibidas</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-info h-100">
                                    <div className="card-body text-center">
                                        <i className="bi bi-clock-history text-info mb-3" style={{ fontSize: '2.5rem' }}></i>
                                        {statistics.last_donation ? (
                                            <>
                                                <h4 className="card-title text-info">
                                                    €{statistics.last_donation.amount.toFixed(2)}
                                                </h4>
                                                <p className="card-text text-muted small">
                                                    {statistics.last_donation.donor_name}
                                                </p>
                                                <p className="card-text text-muted small">
                                                    {new Date(statistics.last_donation.date).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <h4 className="card-title text-info">
                                                    -
                                                </h4>
                                                <p className="card-text text-muted">Sin donaciones</p>
                                            </>
                                        )}
                                        <p className="card-text text-muted font-weight-bold">Última donación</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {statistics.total_count === 0 && (
                            <div className="text-center mt-4">
                                <p className="text-muted">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Esta asociación aún no ha recibido donaciones. ¡Sé el primero en apoyarlos!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lista de Donaciones */}
            <div className="row mb-5">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0">
                            <i className="bi bi-heart-fill text-danger me-2"></i>
                            Donaciones recibidas
                        </h3>
                        {donations.length > 0 && (
                            <span className="badge bg-secondary">
                                {donations.length} {donations.length === 1 ? 'donación' : 'donaciones'}
                            </span>
                        )}
                    </div>

                    {donations.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-heart text-muted" style={{ fontSize: '3rem' }}></i>
                            <p className="text-muted mt-3">Esta asociación aún no ha recibido donaciones.</p>
                            <p className="text-muted">¡Sé el primero en apoyarlos!</p>
                        </div>
                    ) : (
                        <>
                            <div className="row g-3">
                                {(showAllDonations ? donations : donations.slice(0, 6)).map((donation) => (
                                    <div key={donation.id} className="col-12 col-md-6 col-lg-4">
                                        <div className="card h-100 border-0 shadow-sm">
                                            <div className="card-body p-3">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h5 className="card-title text-success mb-0">
                                                        €{donation.amount}
                                                    </h5>
                                                    <span className={`badge ${donation.status === 'completed'
                                                        ? 'bg-success'
                                                        : donation.status === 'pending'
                                                            ? 'bg-warning text-dark'
                                                            : 'bg-danger'
                                                        }`}>
                                                        {donation.status === 'completed' ? 'Completada' :
                                                            donation.status === 'pending' ? 'Pendiente' :
                                                                'Fallida'}
                                                    </span>
                                                </div>

                                                <p className="text-muted small mb-2">
                                                    <i className="bi bi-person me-1"></i>
                                                    {donation.donor?.first_name && donation.donor?.last_name
                                                        ? `${donation.donor.first_name} ${donation.donor.last_name}`
                                                        : donation.donor?.name || 'Donante anónimo'
                                                    }
                                                </p>

                                                {donation.event && (
                                                    <p className="text-muted small mb-2">
                                                        <i className="bi bi-calendar-event me-1"></i>
                                                        {donation.event.title}
                                                    </p>
                                                )}

                                                {donation.description && (
                                                    <p className="card-text small text-muted mb-2">
                                                        <i className="bi bi-chat-quote me-1"></i>
                                                        "{donation.description}"
                                                    </p>
                                                )}

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">
                                                        <i className="bi bi-calendar3 me-1"></i>
                                                        {new Date(donation.created_at).toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </small>

                                                    {donation.stripe_session_id && (
                                                        <small className="text-muted">
                                                            <i className="bi bi-credit-card me-1"></i>
                                                            Stripe
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {donations.length > 6 && (
                                <div className="text-center mt-4">
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => setShowAllDonations(!showAllDonations)}
                                    >
                                        {showAllDonations ? (
                                            <>
                                                <i className="bi bi-chevron-up me-2"></i>
                                                Mostrar menos
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-chevron-down me-2"></i>
                                                Ver todas las donaciones ({donations.length - 6} más)
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}


                </div>
            </div>

            {/* Lista de Valoraciones */}
            <div className="row mb-5" id="ratings-section">
                <div className="col-12">
                    <RatingList
                        associationId={parseInt(id)}
                        refreshTrigger={refreshRatings}
                        onEditRating={handleEditRating}
                    />
                </div>
            </div>

            {/* Modal de Éxito */}
            {successMessage && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-body text-center p-4">
                                <div className="mb-3">
                                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                                </div>
                                <h5 className="mb-3">{successMessage}</h5>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleSuccessModalClose}
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Valoración */}
            <RatingForm
                show={showRatingForm}
                onClose={handleModalClose}
                associationId={parseInt(id)}
                unratedEvents={unratedEvents}
                existingRating={existingRating}
                onRatingSubmitted={handleRatingSubmitted}
            />
        </div>
    );
}; 