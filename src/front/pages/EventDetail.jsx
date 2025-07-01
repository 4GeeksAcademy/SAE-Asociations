import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authService from "../services/authService";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    const fetchEvent = async () => {
      try {
        const token = authService.getToken();
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}/api/events/${id}`, { headers });
        if (!res.ok) {
          throw new Error('Evento no encontrado');
        }
        const data = await res.json();
        setEvent(data);
      } catch (error) {
        console.error("Error fetching event:", error);
        alert('Evento no encontrado');
        navigate('/event/list');
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const handleDeactivateEvent = async () => {
    if (!window.confirm('¿Estás seguro de que quieres desactivar este evento? Los voluntarios ya no podrán verlo ni apuntarse.')) {
      return;
    }

    try {
      const token = authService.getToken();
      const res = await fetch(`${API_BASE_URL}/api/events/${id}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        alert('Evento desactivado correctamente');
        // Actualizar el evento para mostrar el nuevo estado
        const updatedEvent = await res.json();
        setEvent(updatedEvent.event);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'No se pudo desactivar el evento'}`);
      }
    } catch (error) {
      console.error("Error deactivating event:", error);
      alert('Error de conexión al desactivar el evento');
    }
  };

  if (!event) return <p>Cargando evento...</p>;

  // Verificar si el usuario actual es la asociación propietaria del evento
  const canDeactivate = user &&
    user.role === 'association' &&
    user.association &&
    user.association.id === event.association_id &&
    event.is_active;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h2>{event.title}</h2>
            {!event.is_active && (
              <span className="badge bg-warning text-dark fs-6">Evento Inactivo</span>
            )}
          </div>

          {event.image_url && (
            <img
              src={event.image_url}
              className="img-fluid mb-3 rounded"
              alt={event.title}
              style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
            />
          )}

          <div className="mb-3">
            <p><strong>Fecha:</strong> {new Date(event.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Organizado por:</strong> {event.association_name}</p>
          </div>

          <div className="mb-4">
            <h4>Descripción</h4>
            <p>{event.description}</p>
          </div>

          {canDeactivate && (
            <div className="alert alert-warning">
              <h5><i className="bi bi-exclamation-triangle me-2"></i>Gestión del evento</h5>
              <p className="mb-2">Como organizador de este evento, puedes desactivarlo si es necesario.
                Una vez desactivado, los voluntarios ya no podrán verlo ni apuntarse.</p>
              <button
                className="btn btn-danger"
                onClick={handleDeactivateEvent}
              >
                <i className="bi bi-trash me-2"></i>
                Desactivar evento
              </button>
            </div>
          )}

          {!event.is_active && user && user.role === 'association' && user.association && user.association.id === event.association_id && (
            <div className="alert alert-info">
              <h5><i className="bi bi-info-circle me-2"></i>Evento desactivado</h5>
              <p className="mb-0">Este evento está desactivado y solo es visible para ti como organizador.
                Los voluntarios no pueden verlo ni apuntarse.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};