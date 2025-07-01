import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventCard } from "../components/EventCard.jsx";
import authService from "../services/authService";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const EventList = () => {
    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null);

    const getEvents = async () => {
        try {
            const token = authService.getToken();
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_BASE_URL}/api/events/`, { headers });
            const data = await res.json();
            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleDeactivateEvent = async (eventId) => {
        if (!window.confirm('¿Estás seguro de que quieres desactivar este evento? Los voluntarios ya no podrán verlo ni apuntarse.')) {
            return;
        }

        try {
            const token = authService.getToken();
            const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/deactivate`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                // Actualizar la lista de eventos
                getEvents();
                alert('Evento desactivado correctamente');
            } else {
                const error = await res.json();
                alert(`Error: ${error.error || 'No se pudo desactivar el evento'}`);
            }
        } catch (error) {
            console.error("Error deactivating event:", error);
            alert('Error de conexión al desactivar el evento');
        }
    };

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        getEvents();
    }, []);

    const navigate = useNavigate();

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Eventos disponibles</h2>
                <button className="btn btn-success" onClick={() => navigate("/event/creation")}>Crear evento</button>
            </div>
            <div className="row">
                {events.map(event => (
                    <div className="col-md-4" key={event.id}>
                        <EventCard
                            event={event}
                            user={user}
                            onDeactivate={handleDeactivateEvent}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};