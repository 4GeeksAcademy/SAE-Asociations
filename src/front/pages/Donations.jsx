import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

const Donations = () => {
    const [donations, setDonations] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
        fetchDonations();
        fetchStatistics();
    }, []);

    const fetchDonations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/donations`, {
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`
                }
            });
            const data = await response.json();
            setDonations(data.donations || []);
        } catch (error) {
            console.error('Error fetching donations:', error);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/donations/statistics`);
            const data = await response.json();
            setStatistics(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-warning">
                    <h4>Debes iniciar sesión para ver las donaciones</h4>
                    <p>Para acceder al centro de donaciones, primero debes autenticarte en el sistema.</p>
                    <Link to="/login" className="btn btn-primary">Iniciar Sesión</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-3 py-md-5">
            {/* Hero Section */}
            <div className="row justify-content-center">
                <div className="col-12 col-md-10 col-lg-8 text-center">
                    <h1 className="display-5 display-md-4 fw-bold mb-4">
                        <i className="bi bi-heart-fill text-danger me-3"></i>
                        Centro de Donaciones
                    </h1>
                    <p className="lead mb-4 mb-md-5">
                        Apoya a las asociaciones que están creando un impacto positivo.
                        <span className="d-none d-md-inline"> Tu contribución marca la diferencia.</span>
                    </p>

                    <div className="d-flex justify-content-center gap-3 flex-wrap flex-sm-nowrap">
                        <Link to="/donate/association" className="btn btn-primary btn-lg w-100 w-sm-auto">
                            <i className="bi bi-building me-2"></i>
                            <span className="d-none d-sm-inline">Donar a </span>Asociación
                        </Link>
                        <Link to="/donate/event" className="btn btn-outline-primary btn-lg w-100 w-sm-auto">
                            <i className="bi bi-calendar-event me-2"></i>
                            <span className="d-none d-sm-inline">Donar a </span>Evento
                        </Link>
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="row mt-4 mt-md-5 mb-4 mb-md-5">
                <div className="col-12 text-center">
                    <h2 className="h2 h1-md mb-3 mb-md-4">Impacto de la Comunidad</h2>
                    <div className="row justify-content-center g-3">
                        <div className="col-6 col-md-3">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center p-3">
                                    <h3 className="text-primary mb-1">{statistics.total_count || 0}</h3>
                                    <p className="text-muted small mb-0">Donaciones</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center p-3">
                                    <h3 className="text-success mb-1">€{statistics.total_amount || 0}</h3>
                                    <p className="text-muted small mb-0">Recaudado</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Donaciones Recientes */}
            <div className="row mt-4 mt-md-5">
                <div className="col-12">
                    <h2 className="h3 mb-4">Donaciones Recientes</h2>
                    {donations.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-heart text-muted" style={{ fontSize: '3rem' }}></i>
                            <p className="text-muted mt-3">Aún no hay donaciones. ¡Sé el primero en contribuir!</p>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {donations.slice(0, 6).map((donation) => (
                                <div key={donation.id} className="col-12 col-md-6 col-lg-4">
                                    <div className="card h-100 border-0 shadow-sm">
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 className="card-title text-success mb-0">
                                                    €{donation.amount}
                                                </h5>
                                                <span className={`badge ${donation.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                                                    {donation.status}
                                                </span>
                                            </div>

                                            <p className="text-muted small mb-2">
                                                <i className="bi bi-person me-1"></i>
                                                {donation.donor?.name || 'Donante anónimo'}
                                            </p>

                                            <p className="text-muted small mb-2">
                                                <i className="bi bi-building me-1"></i>
                                                {donation.association?.name || 'Asociación'}
                                            </p>

                                            {donation.event && (
                                                <p className="text-muted small mb-2">
                                                    <i className="bi bi-calendar-event me-1"></i>
                                                    {donation.event.title}
                                                </p>
                                            )}

                                            {donation.description && (
                                                <p className="card-text small text-muted">
                                                    "{donation.description}"
                                                </p>
                                            )}

                                            <small className="text-muted">
                                                {new Date(donation.created_at).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tipos de Donación */}
            <div className="row mt-4 mt-md-5 g-4">
                <div className="col-12 col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body text-center p-3 p-md-4">
                            <div className="mb-3">
                                <i className="bi bi-building text-primary" style={{ fontSize: '2rem' }}></i>
                            </div>
                            <h3 className="card-title h5 h4-md">Donación Directa</h3>
                            <p className="card-text text-muted small">
                                Apoya directamente a una asociación para sus necesidades generales.
                            </p>
                            <Link to="/donate/association" className="btn btn-outline-primary btn-sm">
                                Donar Ahora
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body text-center p-3 p-md-4">
                            <div className="mb-3">
                                <i className="bi bi-calendar-event text-success" style={{ fontSize: '2rem' }}></i>
                            </div>
                            <h3 className="card-title h5 h4-md">Donación por Evento</h3>
                            <p className="card-text text-muted small">
                                Contribuye a un evento específico organizado por una asociación.
                            </p>
                            <Link to="/donate/event" className="btn btn-outline-success btn-sm">
                                Ver Eventos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Donations; 