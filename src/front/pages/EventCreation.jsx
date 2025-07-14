import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventForm } from "../components/EventForm";
import authService from "../services/authService";

export const EventCreation = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);

        // Si no está autenticado, redirigir al login
        if (!currentUser) {
            navigate('/login');
            return;
        }

        // Si es voluntario, redirigir a registro de asociación
        if (currentUser.role === 'volunteer') {
            navigate('/register/association');
            return;
        }

        // Si no es asociación, redirigir a la lista de eventos
        if (currentUser.role !== 'association') {
            navigate('/event/list');
            return;
        }
    }, [navigate]);

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    // Solo mostrar el formulario si es una asociación
    if (user?.role !== 'association') {
        return null; // Se manejará con la redirección en useEffect
    }

    return (
        <div className="event-creation-bg py-5 min-vh-100 d-flex align-items-center justify-content-center">
            <div className="event-creation-card shadow-lg p-4 p-md-5 rounded-4 w-100" style={{ maxWidth: 600, background: 'white' }}>
                <div className="d-flex align-items-center mb-4 gap-3">
                    <div className="event-creation-icon d-flex align-items-center justify-content-center rounded-circle bg-association" style={{ width: 56, height: 56 }}>
                        <i className="bi bi-calendar-plus text-white" style={{ fontSize: 32 }}></i>
                    </div>
                    <div>
                        <h2 className="mb-0 fw-bold text-association">Crear nuevo evento</h2>
                        <div className="small text-muted">Publica un evento para tu asociación</div>
                    </div>
                </div>
                <div className="event-creation-banner d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ background: 'linear-gradient(90deg, #4dabf7 0%, #1976d2 100%)', color: 'white' }}>
                    <div className="d-flex align-items-center justify-content-center rounded-circle bg-white" style={{ width: 44, height: 44 }}>
                        <i className="bi bi-building text-association" style={{ fontSize: 24 }}></i>
                    </div>
                    <div>
                        <div className="fw-semibold">Creando como:</div>
                        <div className="fw-bold">{user?.association?.name}</div>
                    </div>
                </div>
                <EventForm />
            </div>
            <style>{`
                .event-creation-bg {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                }
                .bg-association {
                    background: linear-gradient(135deg, #4dabf7 0%, #1976d2 100%) !important;
                }
                .text-association {
                    color: #1976d2 !important;
                }
                @media (max-width: 767px) {
                    .event-creation-card {
                        padding: 1.5rem !important;
                        border-radius: 1.25rem !important;
                    }
                    .event-creation-banner {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};