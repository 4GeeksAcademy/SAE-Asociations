import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

const DonationSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [donationId, setDonationId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [donationData, setDonationData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const urlDonationId = searchParams.get('donation_id');
        if (urlDonationId) {
            setDonationId(urlDonationId);
            fetchDonationDetails(urlDonationId);
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    const fetchDonationDetails = async (id) => {
        try {
            const token = authService.getToken();

            // Primero intentar completar la donación automáticamente
            if (token) {
                try {
                    const completeResponse = await fetch(`${API_BASE_URL}/api/donations/complete/${id}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (completeResponse.ok) {
                        const completeData = await completeResponse.json();
                        // Donación completada exitosamente
                    } else {
                        const errorData = await completeResponse.json();
                        console.warn('No se pudo completar la donación automáticamente:', errorData);
                    }
                } catch (completeError) {
                    console.error('Error al completar donación automáticamente:', completeError);
                }
            }

            // Luego obtener los detalles de la donación
            const response = await fetch(`${API_BASE_URL}/api/donations?donation_id=${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.donations && data.donations.length > 0) {
                    setDonationData(data.donations[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching donation details:', error);
            setError('Error al cargar los detalles de la donación');
        } finally {
            setLoading(false);
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewAssociations = () => {
        navigate('/associations');
    };

    if (loading) {
        return (
            <div className="donation-page">
                <div className="container py-5 text-center">
                    <div className="loading-container">
                        <div className="loading-spinner">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                        <p className="loading-text mt-3">Verificando donación...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="donation-page success-page">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="donation-card success-card">
                            <div className="card-header-gradient success-gradient">
                                <div className="success-icon-container">
                                    <div className="success-icon">
                                        <i className="bi bi-check-circle-fill"></i>
                                    </div>
                                    <div className="success-particles">
                                        <div className="particle"></div>
                                        <div className="particle"></div>
                                        <div className="particle"></div>
                                        <div className="particle"></div>
                                    </div>
                                </div>
                                <h1 className="success-title">¡Donación Exitosa!</h1>
                                <p className="success-subtitle">
                                    Tu generosidad marca la diferencia
                                </p>
                            </div>

                            <div className="donation-card-body">
                                {/* Mensaje de agradecimiento */}
                                <div className="thank-you-section">
                                    <div className="thank-you-icon">
                                        <i className="bi bi-heart-fill"></i>
                                    </div>
                                    <p className="thank-you-message">
                                        Gracias por tu apoyo. Tu donación ha sido procesada exitosamente
                                        y ayudará a crear un impacto positivo en nuestra comunidad.
                                    </p>
                                </div>

                                {/* Detalles de la donación */}
                                {donationData && (
                                    <div className="donation-details-card">
                                        <div className="details-header">
                                            <div className="details-icon">
                                                <i className="bi bi-receipt"></i>
                                            </div>
                                            <h3 className="details-title">Detalles de tu Donación</h3>
                                        </div>
                                        <div className="details-content">
                                            <div className="detail-row">
                                                <div className="detail-label">
                                                    <i className="bi bi-currency-euro"></i>
                                                    Monto
                                                </div>
                                                <div className="detail-value amount-value">
                                                    €{donationData.amount}
                                                </div>
                                            </div>
                                            <div className="detail-row">
                                                <div className="detail-label">
                                                    <i className="bi bi-building"></i>
                                                    Asociación
                                                </div>
                                                <div className="detail-value">
                                                    {donationData.association?.name || 'No especificada'}
                                                </div>
                                            </div>
                                            {donationData.event && (
                                                <div className="detail-row">
                                                    <div className="detail-label">
                                                        <i className="bi bi-calendar-event"></i>
                                                        Evento
                                                    </div>
                                                    <div className="detail-value">
                                                        {donationData.event.title}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="detail-row">
                                                <div className="detail-label">
                                                    <i className="bi bi-clock"></i>
                                                    Fecha
                                                </div>
                                                <div className="detail-value">
                                                    {new Date(donationData.created_at).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mensaje informativo */}
                                <div className="info-banner">
                                    <div className="info-icon">
                                        <i className="bi bi-envelope-check"></i>
                                    </div>
                                    <div className="info-content">
                                        <h4>Confirmación enviada</h4>
                                        <p>Recibirás un email con todos los detalles de tu donación</p>
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="action-buttons">
                                    <button
                                        type="button"
                                        className="btn btn-primary action-btn primary-btn"
                                        onClick={handleViewAssociations}
                                    >
                                        <i className="bi bi-building"></i>
                                        Ver Más Asociaciones
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary action-btn secondary-btn"
                                        onClick={handleGoHome}
                                    >
                                        <i className="bi bi-house"></i>
                                        Ir al Inicio
                                    </button>
                                </div>

                                {/* Enlaces adicionales */}
                                <div className="additional-links">
                                    <Link to="/event/list" className="additional-link">
                                        <div className="link-content">
                                            <div className="link-icon">
                                                <i className="bi bi-calendar-event"></i>
                                            </div>
                                            <div className="link-text">
                                                <h5>Descubre Eventos</h5>
                                                <p>Participa como voluntario</p>
                                            </div>
                                            <div className="link-arrow">
                                                <i className="bi bi-arrow-right"></i>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                {/* Mensaje motivacional final */}
                                <div className="motivation-card">
                                    <div className="motivation-content">
                                        <div className="motivation-icon">
                                            <i className="bi bi-heart-pulse"></i>
                                        </div>
                                        <div className="motivation-text">
                                            <h4>Tu impacto importa</h4>
                                            <p>Cada donación ayuda a construir un mundo mejor. Juntos creamos cambios positivos en nuestra comunidad.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationSuccess; 