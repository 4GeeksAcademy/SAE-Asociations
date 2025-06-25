import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/${id}`);
        const data = await res.json();
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    fetchEvent();
  }, [id]);

  if (!event) return <p>Cargando evento...</p>;

  return (
    <div className="container mt-4">
      <h2>{event.title}</h2>
      <img src={event.image_url} className="img-fluid mb-3" />
      <p><strong>Fecha:</strong> {new Date(event.date).toLocaleString()}</p>
      <p>{event.description}</p>
    </div>
  );
};