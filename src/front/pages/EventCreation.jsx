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
        <div className="container mt-4">
            <div className="d-flex align-items-center mb-4">
                <h2 className="mb-0">
                    <i className="bi bi-calendar-plus me-2 text-success"></i>
                    Crear nuevo evento
                </h2>
            </div>
            <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Creando como:</strong> {user?.association?.name}
            </div>
            <EventForm />
        </div>
    );
};