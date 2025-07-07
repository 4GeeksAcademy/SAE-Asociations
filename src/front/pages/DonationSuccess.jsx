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
            <div className="container py-5 text-center">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Verificando donación...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0">
                        <div className="card-body text-center p-5">
                            {/* Icono de éxito */}
                            <div className="mb-4">
                                <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle" style={{ width: '80px', height: '80px' }}>
                                    <i className="bi bi-check-lg" style={{ fontSize: '2.5rem' }}></i>
                                </div>
                            </div>

                            {/* Título principal */}
                            <h1 className="h3 text-success mb-3">¡Donación Exitosa!</h1>

                            {/* Mensaje de agradecimiento */}
                            <p className="text-muted mb-4">
                                Tu donación ha sido procesada exitosamente. Gracias por tu generosidad y por apoyar esta causa.
                            </p>

                            {/* Detalles de la donación */}
                            {donationData && (
                                <div className="card bg-light mb-4">
                                    <div className="card-body">
                                        <h5 className="card-title text-success">Detalles de la Donación</h5>
                                        <div className="row text-start">
                                            <div className="col-6">
                                                <strong>Monto:</strong>
                                            </div>
                                            <div className="col-6">
                                                €{donationData.amount}
                                            </div>
                                            <div className="col-6">
                                                <strong>Asociación:</strong>
                                            </div>
                                            <div className="col-6">
                                                {donationData.association?.name || 'No especificada'}
                                            </div>
                                            {donationData.event && (
                                                <>
                                                    <div className="col-6">
                                                        <strong>Evento:</strong>
                                                    </div>
                                                    <div className="col-6">
                                                        {donationData.event.title}
                                                    </div>
                                                </>
                                            )}
                                            <div className="col-6">
                                                <strong>Fecha:</strong>
                                            </div>
                                            <div className="col-6">
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

                            {/* Mensaje adicional */}
                            <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                <small>
                                    Recibirás un email de confirmación con los detalles de tu donación.
                                </small>
                            </div>

                            {/* Botones de acción */}
                            <div className="d-flex gap-3 justify-content-center">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handleGoHome}
                                >
                                    <i className="bi bi-house me-2"></i>
                                    Ir al Inicio
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleViewAssociations}
                                >
                                    <i className="bi bi-building me-2"></i>
                                    Ver Asociaciones
                                </button>
                            </div>

                            {/* Link adicional */}
                            <div className="mt-4">
                                <Link to="/associations" className="text-decoration-none">
                                    <i className="bi bi-building me-1"></i>
                                    Ver más asociaciones para apoyar
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationSuccess; 