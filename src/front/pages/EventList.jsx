import React, { useEffect, useState } from "react";
import { EventCard } from "../components/EventCard.jsx";

export const EventList = () => {
    const [events, setEvents] = useState([]);

    const getEvents = async () => {
        try {
            const res = await fetch("");
            const data = await res.json();
            setEvents(data);  
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    useEffect(() => {
        getEvents();
    }, []);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Eventos disponibles</h2>
                <button className="btn btn-success"onClick={() => navigate("/create-event")}>Crear evento</button>
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