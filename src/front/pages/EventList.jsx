import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventCard } from "../components/EventCard.jsx";
import { useLocation } from "react-router-dom";
import { Button } from "bootstrap";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState ('');
    const [filteredByAssociation, setFilteredByAssociation] = useState(null);
    const location = useLocation();
    const navigate = useNavigate ();

    const getEvents = async (associationId = null) => {
        try {
            setLoading(true);
            let url = `${API_BASE_URL}/api/events/`;

            if (associationId) {
                url += `?association_id=${associationId}`;
            }

            const res = await fetch(`${API_BASE_URL}/api/events/`);
            if (!res.ok) {
                throw new Error('Eror al cargar eventos');
            }

            const data = await res.json();
            setEvents(data);
            setError('');  
        } catch (error) {
            console.error("Error fetching events:", error);
            setError(error.message);
        }
        finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        //obtener el parámetro de la URL 
        const queryParams = new URLSearchParams(location.search);
        const associationId = queryParams.get('association_id');

        if (associationId) {
            setFilteredByAssociation(associationId);
            getEvents(associationId);
        } else {
            setFilteredByAssociation(null);
            getEvents();
        }
    }, [location.search]); //Se ejecuta cuando cambia la URL 

    const handleClearFilter = () => {
        navigate ('/event/list'); //Quita el filtro
    };

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando eventos...</p>
            </div>
        );
     }
    
    if (error){
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        )
    }
    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    {filteredByAssociation
                    ? `Eventos de la asociación`
                    : "Eventos disponibles"}
                </h2>

                <div>
                    {filteredByAssociation && (
                        <button
                            className="btn btn-outline-secondary me-2"
                            onClick={handleClearFilter}
                        >
                            Ver todos los eventos
                        </button>
                    )}
                    <button 
                        className="btn btn-success"
                        onClick={() => navigate("/event/creation")}
                    >
                        Crear evento
                    </button>
                </div>
            </div>

            <div className="row">
                {events.length === 0 ? (
                    <div className="col-12">
                        <div className="alert alert-info">
                            No se encontraron eventos
                        </div>
                    </div>
                ): (
                events.map(event => (
                    <div className="col-md-4" key={event.id}>
                        <EventCard event={event} />
                    </div>
                ))
            )}
            </div>
        </div>
    );
};