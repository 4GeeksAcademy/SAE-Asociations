import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RatingDisplay from "../components/RatingDisplay";
import RatingList from "../components/RatingList";
import RatingForm from "../components/RatingForm";
import '../styles/event-list.css'; // Reutilizar los estilos modernos

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

export const AssociationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [association, setAssociation] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [associationStats, setAssociationStats] = useState({ active_events_count: 0, total_volunteers: 0 });
    const [donations, setDonations] = useState([]);
    const [showAllDonations, setShowAllDonations] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estado para el tamaño de pantalla
    const [isMobile, setIsMobile] = useState(false);

    // Función para determinar cuántas donaciones mostrar según el tamaño de pantalla
    const getDonationsToShow = () => {
        return isMobile ? 3 : 8;
    };

    // Detectar cambios en el tamaño de pantalla
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // Verificar tamaño inicial
        checkScreenSize();

        // Escuchar cambios de tamaño
        window.addEventListener('resize', checkScreenSize);

        // Cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Estados para rating
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [unratedEvents, setUnratedEvents] = useState([]);
    const [existingRating, setExistingRating] = useState(null);
    const [refreshRatings, setRefreshRatings] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');

    // Función para verificar si hay una imagen válida
    const hasValidImage = (imageUrl) => {
        return imageUrl && imageUrl.trim() !== '';
    };

    // Función para generar la imagen de fallback
    const getFallbackImage = () => {
        const initial = association?.name?.charAt(0) || 'A';
        return `https://placehold.co/400x300/4dabf7/ffffff?text=${initial}`;
    };

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

        const fetchAssociationStats = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/associations/statistics`);
                const data = await res.json();

                if (data.success) {
                    const stats = data.statistics || {};
                    setAssociationStats(stats[id] || { active_events_count: 0, total_volunteers: 0 });
                }
            } catch (error) {
                console.error("Error fetching association statistics:", error);
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
        fetchAssociationStats();
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
            <div className="event-list-container d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border loading-spinner" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando información de la asociación...</p>
                </div>
            </div>
        );
    }

    if (error || !association) {
        return (
            <div className="event-list-container">
                <div className="container">
                    <div className="alert alert-danger" role="alert">
                        {error || 'Asociación no encontrada'}
                    </div>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate('/associations')}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Volver a asociaciones
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="event-list-container">
            <div className="container">
                {/* Header con breadcrumb */}
                <div className="event-list-header d-flex justify-content-between align-items-center">
                    <div>
                        <nav aria-label="breadcrumb" className="mb-3">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <button
                                        className="btn btn-link p-0 text-decoration-none"
                                        onClick={() => navigate('/associations')}
                                    >
                                        <i className="bi bi-arrow-left me-1"></i>
                                        Asociaciones
                                    </button>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    {association.name}
                                </li>
                            </ol>
                        </nav>
                        <h2 className="event-list-title mb-0">{association.name}</h2>
                    </div>
                </div>

                {/* Información principal de la asociación */}
                <div className="row mb-5">
                    <div className="col-lg-8">
                        <div className="association-detail-card">
                            <div className="association-detail-header">
                                <div className="association-detail-avatar">
                                    <img
                                        src={hasValidImage(association.image_url) ? association.image_url : getFallbackImage()}
                                        className="association-detail-image"
                                        alt={association.name}
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = getFallbackImage();
                                        }}
                                    />
                                </div>
                                <div className="association-detail-info">
                                    <h3 className="association-detail-name">{association.name}</h3>
                                    <p className="association-detail-description">{association.description}</p>
                                    <div className="association-detail-cif">
                                        <i className="bi bi-building text-association me-2"></i>
                                        <span className="text-muted">CIF: {association.cif}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="association-detail-stats">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="bi bi-calendar-event text-association"></i>
                                </div>
                                <div className="stat-content">
                                    <h4 className="stat-value">{associationStats.active_events_count}</h4>
                                    <p className="stat-label">Eventos activos</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="bi bi-people text-volunteer"></i>
                                </div>
                                <div className="stat-content">
                                    <h4 className="stat-value">{associationStats.total_volunteers}</h4>
                                    <p className="stat-label">Voluntarios</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating Display */}
                <div className="mb-5">
                    <RatingDisplay
                        associationId={parseInt(id)}
                        onRateClick={handleRateClick}
                    />
                </div>

                {/* Información de contacto */}
                <div className="row mb-5">
                    <div className="col-12">
                        <h3 className="section-title">
                            <i className="bi bi-envelope text-association me-2"></i>
                            Información de contacto
                        </h3>
                        <div className="contact-cards">
                            <div className="contact-card">
                                <div className="contact-icon">
                                    <i className="bi bi-envelope-fill text-association"></i>
                                </div>
                                <div className="contact-content">
                                    <h5>Email</h5>
                                    <a href={`mailto:${association.contact_email}`} className="contact-link">
                                        {association.contact_email}
                                    </a>
                                </div>
                            </div>

                            {association.contact_phone && (
                                <div className="contact-card">
                                    <div className="contact-icon">
                                        <i className="bi bi-telephone-fill text-volunteer"></i>
                                    </div>
                                    <div className="contact-content">
                                        <h5>Teléfono</h5>
                                        <a href={`tel:${association.contact_phone}`} className="contact-link">
                                            {association.contact_phone}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {association.website_url && (
                                <div className="contact-card">
                                    <div className="contact-icon">
                                        <i className="bi bi-globe text-primary"></i>
                                    </div>
                                    <div className="contact-content">
                                        <h5>Sitio web</h5>
                                        <a
                                            href={association.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="contact-link"
                                        >
                                            Visitar sitio web
                                            <i className="bi bi-box-arrow-up-right ms-1"></i>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Redes Sociales */}
                            {(association.facebook_url || association.instagram_url || association.twitter_url) && (
                                <div className="contact-card social-card">
                                    <div className="contact-icon">
                                        <i className="bi bi-share text-warning"></i>
                                    </div>
                                    <div className="contact-content">
                                        <h5>Redes Sociales</h5>
                                        <div className="social-links">
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
                            )}
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="row mb-5">
                    <div className="col-12">
                        <h3 className="section-title">
                            <i className="bi bi-heart text-danger me-2"></i>
                            ¿Cómo puedes ayudar?
                        </h3>
                        <div className="action-cards">
                            <div className="action-card">
                                <div className="action-icon">
                                    <i className="bi bi-heart-fill text-danger"></i>
                                </div>
                                <div className="action-content">
                                    <h5>Hacer una donación</h5>
                                    <p>Apoya directamente la causa de esta asociación</p>
                                    <button
                                        className="btn btn-volunteer"
                                        onClick={() => navigate(`/donate/association/${association.id}`)}
                                    >
                                        <i className="bi bi-heart me-2"></i>
                                        Donar ahora
                                    </button>
                                </div>
                            </div>
                            <div className="action-card">
                                <div className="action-icon">
                                    <i className="bi bi-people-fill text-association"></i>
                                </div>
                                <div className="action-content">
                                    <h5>Ver eventos</h5>
                                    <p>Participa en eventos organizados por esta asociación</p>
                                    <button
                                        className="btn btn-association"
                                        onClick={() => navigate(`/event/list?association_id=${id}`)}
                                    >
                                        <i className="bi bi-calendar-check me-2"></i>
                                        Ver eventos
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas de donaciones */}
                {statistics && (
                    <div className="row mb-5">
                        <div className="col-12">
                            <h3 className="section-title">
                                <i className="bi bi-graph-up text-success me-2"></i>
                                Estadísticas de donaciones
                            </h3>
                            <div className="stats-cards">
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <i className="bi bi-currency-euro text-success"></i>
                                    </div>
                                    <div className="stat-content">
                                        <h4 className="stat-value">€{statistics.total_amount?.toFixed(2) || '0.00'}</h4>
                                        <p className="stat-label">Total recaudado</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <i className="bi bi-people text-association"></i>
                                    </div>
                                    <div className="stat-content">
                                        <h4 className="stat-value">{statistics.total_count || 0}</h4>
                                        <p className="stat-label">Donaciones recibidas</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <i className="bi bi-clock-history text-info"></i>
                                    </div>
                                    <div className="stat-content">
                                        {statistics.last_donation ? (
                                            <>
                                                <h4 className="stat-value">€{statistics.last_donation.amount.toFixed(2)}</h4>
                                                <p className="stat-label">{statistics.last_donation.donor_name}</p>
                                                <small className="text-muted">
                                                    {new Date(statistics.last_donation.date).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </small>
                                            </>
                                        ) : (
                                            <>
                                                <h4 className="stat-value">-</h4>
                                                <p className="stat-label">Sin donaciones</p>
                                            </>
                                        )}
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
                            <h3 className="section-title mb-0">
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
                            <div className="no-content-message">
                                <i className="bi bi-heart text-muted"></i>
                                <h4 className="text-muted">Sin donaciones</h4>
                                <p className="text-muted">Esta asociación aún no ha recibido donaciones.</p>
                                <p className="text-muted">¡Sé el primero en apoyarlos!</p>
                            </div>
                        ) : (
                            <>
                                <div className="donations-grid">
                                    {(showAllDonations ? donations : donations.slice(0, getDonationsToShow())).map((donation) => (
                                        <div key={donation.id} className="donation-card">
                                            <div className="donation-header">
                                                <h5 className="donation-amount">€{donation.amount}</h5>
                                                <span className={`donation-status ${donation.status}`}>
                                                    {donation.status === 'completed' ? 'Completada' :
                                                        donation.status === 'pending' ? 'Pendiente' :
                                                            'Fallida'}
                                                </span>
                                            </div>

                                            <div className="donation-content">
                                                <p className="donor-name">
                                                    <i className="bi bi-person me-1"></i>
                                                    {donation.donor?.first_name && donation.donor?.last_name
                                                        ? `${donation.donor.first_name} ${donation.donor.last_name}`
                                                        : donation.donor?.name || 'Donante anónimo'
                                                    }
                                                </p>

                                                {donation.event && (
                                                    <p className="event-name">
                                                        <i className="bi bi-calendar-event me-1"></i>
                                                        {donation.event.title}
                                                    </p>
                                                )}

                                                {donation.description && (
                                                    <p className="donation-description">
                                                        <i className="bi bi-chat-quote me-1"></i>
                                                        "{donation.description}"
                                                    </p>
                                                )}

                                                <div className="donation-footer">
                                                    <small className="donation-date">
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
                                                        <small className="payment-method">
                                                            <i className="bi bi-credit-card me-1"></i>
                                                            Stripe
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {donations.length > getDonationsToShow() && (
                                    <div className="text-center mt-4">
                                        <button
                                            className="btn btn-outline-association"
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
                                                    Ver todas las donaciones ({donations.length - getDonationsToShow()} más)
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
        </div>
    );
}; 