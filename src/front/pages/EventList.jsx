import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventCard } from "../components/EventCard.jsx";

export const EventList = () => {
    const [events, setEvents] = useState([]);

    const getEvents = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/events/`);
            const data = await res.json();
            setEvents(data);  
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    useEffect(() => {
        getEvents();
    }, []);

    const navigate = useNavigate();

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Eventos disponibles</h2>
                <button className="btn btn-success"onClick={() => navigate("/event/creation")}>Crear evento</button>
            </div>
            <div className="row">
                {events.map(event => (
                    <div className="col-md-4" key={event.id}>
                        <EventCard event={event} />
                    </div>
                ))}
            </div>
        </div>
    );
};