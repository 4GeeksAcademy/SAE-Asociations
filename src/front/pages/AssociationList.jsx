import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AssociationCard } from "../components/AssociationCard.jsx";
import authService from "../services/authService";
import NotificationModal from '../components/NotificationModal';
import useNotification from '../hooks/useNotification';
import '../styles/event-list.css'; // Reutilizar los estilos de event-list

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

export const AssociationList = () => {
    const [associations, setAssociations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [statistics, setStatistics] = useState({});
    const { notification, hideNotification, showSuccess, showError } = useNotification();

    const getAssociations = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/associations/`);
            const data = await res.json();

            if (data.success) {
                setAssociations(data.associations || []);
            } else {
                setError('Error al cargar las asociaciones');
            }
        } catch (error) {
            console.error("Error fetching associations:", error);
            setError('Error de conexión al cargar las asociaciones');
        } finally {
            setLoading(false);
        }
    };

    const getStatistics = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/associations/statistics`);
            const data = await res.json();

            if (data.success) {
                setStatistics(data.statistics || {});
            }
        } catch (error) {
            console.error("Error fetching statistics:", error);
            // No mostramos error aquí porque las estadísticas no son críticas
        }
    };

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        getAssociations();
        getStatistics();
    }, []);

    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="event-list-container d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border loading-spinner" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando asociaciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="event-list-container">
                <div className="container">
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="event-list-container">
            <div className="container">
                <div className="event-list-header d-flex justify-content-between align-items-center">
                    <h2 className="event-list-title">
                        Asociaciones
                    </h2>

                    <div className="event-list-actions">
                        {user?.role === 'volunteer' ? (
                            <button
                                className="btn btn-outline-association"
                                onClick={() => navigate("/register/association")}
                                title="Regístrate como asociación para poder crear eventos"
                            >
                                <i className="bi bi-building me-2"></i>
                                Registrar asociación
                            </button>
                        ) : user?.role === 'association' ? (
                            <button
                                className="btn btn-association"
                                onClick={() => navigate("/event/creation")}
                                title="Crear un nuevo evento"
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Crear evento
                            </button>
                        ) : (
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => navigate("/login")}
                            >
                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                Iniciar sesión
                            </button>
                        )}
                    </div>
                </div>

                <div className="row g-4">
                    {associations.length === 0 ? (
                        <div className="col-12">
                            <div className="no-events-message">
                                <i className="bi bi-building display-4 d-block mb-3 text-muted"></i>
                                <h4 className="text-muted">No se encontraron asociaciones</h4>
                                <p className="text-muted mb-0">
                                    No hay asociaciones registradas en este momento
                                </p>
                            </div>
                        </div>
                    ) : (
                        associations.map(association => (
                            <div className="col-md-6 col-lg-4" key={association.id}>
                                <AssociationCard
                                    association={association}
                                    statistics={statistics[association.id] || { active_events_count: 0, total_volunteers: 0 }}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
            <NotificationModal
                show={notification.show}
                onClose={hideNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                confirmText={notification.confirmText}
                cancelText={notification.cancelText}
                onConfirm={notification.onConfirm}
                showCancel={notification.showCancel}
            />
        </div>
    );
}; 