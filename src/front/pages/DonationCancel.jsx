import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const DonationCancel = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [donationId, setDonationId] = useState(null);

    useEffect(() => {
        const urlDonationId = searchParams.get('donation_id');
        if (urlDonationId) {
            setDonationId(urlDonationId);
        }
    }, [searchParams]);

    const handleRetryPayment = () => {
        // Redirigir de vuelta a las asociaciones para intentar de nuevo
        navigate('/associations');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0">
                        <div className="card-body text-center p-5">
                            {/* Icono de cancelación */}
                            <div className="mb-4">
                                <div className="d-inline-flex align-items-center justify-content-center bg-warning text-white rounded-circle" style={{ width: '80px', height: '80px' }}>
                                    <i className="bi bi-x-lg" style={{ fontSize: '2.5rem' }}></i>
                                </div>
                            </div>

                            {/* Título principal */}
                            <h1 className="h3 text-warning mb-3">Donación Cancelada</h1>

                            {/* Mensaje informativo */}
                            <p className="text-muted mb-4">
                                Tu donación ha sido cancelada y no se ha procesado ningún pago.
                                Puedes intentar nuevamente cuando lo desees.
                            </p>

                            {/* Información adicional */}
                            <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                <small>
                                    No se ha realizado ningún cargo a tu método de pago.
                                    {donationId && (
                                        <span> (ID de referencia: {donationId})</span>
                                    )}
                                </small>
                            </div>

                            {/* Razones comunes */}
                            <div className="card bg-light mb-4">
                                <div className="card-body">
                                    <h6 className="card-title mb-3">Razones comunes para cancelar:</h6>
                                    <ul className="list-unstyled text-start small">
                                        <li className="mb-2">
                                            <i className="bi bi-dot text-muted me-2"></i>
                                            Quieres revisar la información antes de proceder
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-dot text-muted me-2"></i>
                                            Necesitas cambiar el método de pago
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-dot text-muted me-2"></i>
                                            Prefieres donar a una asociación diferente
                                        </li>
                                        <li className="mb-2">
                                            <i className="bi bi-dot text-muted me-2"></i>
                                            Quieres ajustar el monto de la donación
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="d-flex gap-3 justify-content-center mb-4">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleRetryPayment}
                                >
                                    <i className="bi bi-arrow-clockwise me-2"></i>
                                    Intentar de Nuevo
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handleGoHome}
                                >
                                    <i className="bi bi-house me-2"></i>
                                    Ir al Inicio
                                </button>
                            </div>

                            {/* Links adicionales */}
                            <div className="d-flex gap-4 justify-content-center">
                                <Link to="/associations" className="text-decoration-none">
                                    <i className="bi bi-building me-1"></i>
                                    Ver Asociaciones
                                </Link>
                                <Link to="/event/list" className="text-decoration-none">
                                    <i className="bi bi-calendar-event me-1"></i>
                                    Ver Eventos
                                </Link>
                            </div>

                            {/* Mensaje motivacional */}
                            <div className="mt-4 p-3 bg-light rounded">
                                <small className="text-muted">
                                    <i className="bi bi-heart me-2"></i>
                                    Tu apoyo significa mucho para nuestras asociaciones.
                                    Cada donación, sin importar el monto, hace la diferencia.
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationCancel; 