import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const EventDetail = () => {
  const {store} = useGlobalReducer();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [userIsRegistered, setUserIsRegistered] =useState(false)
  

  // Función para obtener los detalles del evento del backend
    const fetchEventDetails = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/events/${id}`);
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Error al cargar evento:", errorData);
                alert(`Error: ${errorData.error || "No se pudo cargar el evento."}`);
                setEvent(null); // Limpiar el evento en caso de error
                return;
            }
            const eventData = await res.json();
            setEvent(eventData);

            // Verificar si el usuario actual está registrado después de cargar el evento
            // Solo si hay un usuario logueado y el evento tiene la lista de voluntarios
            if (store.user && eventData.volunteers) {
                const isUserRegistered = eventData.volunteers.some(
                    (volunteer) => volunteer.id === store.user.id
                );
                setUserIsRegistered(isUserRegistered);
            } else {
                setUserIsRegistered(false); // Si no hay usuario o no hay voluntarios en el evento
            }
        } catch (error) {
            console.error("Error al obtener detalles del evento:", error);
            alert("Hubo un problema al cargar los detalles del evento.");
            setEvent(null); // Limpiar el evento en caso de error de red
        }
    };

    // Función para que un voluntario se apunte a un evento
    const handleJoinEvent = async () => {
        // Validaciones básicas antes de enviar la petición
        if (!store.isAuthenticated || store.user?.role !== 'volunteer') {
            alert("Debes iniciar sesión como voluntario para apuntarte.");
            return;
        }
        
        // Verificar si el evento ya está lleno (doble verificación, también se valida en backend)
        if (event.max_volunteers !== null && event.current_volunteers_count >= event.max_volunteers) {
            alert("Este evento ya está lleno.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/volunteers/${event.id}/join`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${store.token}` // Envía el token de autenticación
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchEventDetails(); // Vuelve a cargar los detalles del evento para actualizar el contador y la lista
            } else {
                alert(`Error al apuntarse: ${data.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("Error al unirse al evento:", error);
            alert("Hubo un error al intentar apuntarse al evento.");
        }
    };

    // Función para que un voluntario se desapunte de un evento
    const handleLeaveEvent = async () => {
        // Validaciones básicas antes de enviar la petición
        if (!store.isAuthenticated || store.user?.role !== 'volunteer') {
            alert("Debes iniciar sesión como voluntario para desapuntarte.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/volunteers/${event.id}/leave`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${store.token}` // Envía el token de autenticación
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                fetchEventDetails(); // Vuelve a cargar los detalles del evento
            } else {
                alert(`Error al desapuntarse: ${data.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("Error al desapuntarse del evento:", error);
            alert("Hubo un error al intentar desapuntarse del evento.");
        }
    };

    // useEffect para cargar los datos del evento cuando el componente se monta
    // o cuando cambia el ID del evento o la información del usuario logueado
    useEffect(() => {
        fetchEventDetails();
    }, [id, store.user?.id]); // Dependencia del ID del usuario para re-chequear el registro si el user cambia (login/logout)


    // Si el evento aún no se ha cargado, muestra un mensaje de carga
    if (!event) return <p>Cargando evento...</p>;

    // Variables de ayuda para el renderizado condicional
    const isEventFull = event.max_volunteers !== null && event.current_volunteers_count >= event.max_volunteers;
    const availableSlots = event.max_volunteers !== null ? event.max_volunteers - event.current_volunteers_count : null;

    return (
        <div className="container mt-4">
            <div className="row">
                {/* Columna izquierda para detalles principales del evento */}
                <div className="col-md-8">
                    <h2>{event.title}</h2>
                    {/* Renderiza la imagen del evento si existe, si no, puedes poner una placeholder */}
                    {event.image_url && (
                        <img 
                            src={event.image_url} 
                            className="img-fluid mb-3 rounded shadow-sm" 
                            alt={event.title} 
                            style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }} 
                        />
                    )}
                    
                    <p>
                        <strong>Fecha y Hora:</strong> {new Date(event.date).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                    <p>
                        <strong>Organizado por:</strong> {event.association_name || 'Asociación desconocida'}
                    </p>
                    <hr />
                    <h5>Descripción del Evento:</h5>
                    <p className="text-justify">{event.description || 'No hay descripción disponible para este evento.'}</p>
                </div>

                {/* Columna derecha para detalles de voluntariado y acciones */}
                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title text-primary mb-3">Detalles de Voluntariado</h5>
                            
                            {/* Información de capacidad actual */}
                            <p className="card-text">
                                Voluntarios apuntados: <strong>{event.current_volunteers_count}</strong>
                                {event.max_volunteers !== null && ` de ${event.max_volunteers}`}
                            </p>

                            {/* Mostrar plazas disponibles o si el evento está lleno */}
                            {event.max_volunteers !== null && (
                                <p className={`card-text fw-bold ${isEventFull ? 'text-danger' : 'text-success'}`}>
                                    {isEventFull 
                                        ? "¡Este evento ha alcanzado su límite máximo de voluntarios!"
                                        : `Plazas disponibles: ${availableSlots}`
                                    }
                                </p>
                            )}
                            {/* Mensaje si el evento no tiene límite de voluntarios */}
                            {event.max_volunteers === null && (
                                <p className="card-text text-muted">
                                    Este evento no tiene un límite máximo de voluntarios.
                                </p>
                            )}

                            {/* Sección del botón para apuntarse/desapuntarse (condicional según rol y estado) */}
                            {store.isAuthenticated && store.user?.role === 'volunteer' && (
                                <div className="mt-4">
                                    {userIsRegistered ? (
                                        <button className="btn btn-danger w-100" onClick={handleLeaveEvent}>
                                            Desapuntarse
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn btn-success w-100" 
                                            onClick={handleJoinEvent} 
                                            disabled={isEventFull} // El botón se deshabilita si el evento está lleno
                                        >
                                            {isEventFull ? "Evento Lleno" : "Apuntarse al Evento"}
                                        </button>
                                    )}
                                </div>
                            )}
                            {/* Mensajes para otros roles o no logueados */}
                            {!store.isAuthenticated && (
                                <p className="text-muted mt-4 text-center">Inicia sesión como voluntario para apuntarte.</p>
                            )}
                            {store.isAuthenticated && store.user?.role === 'association' && (
                                <p className="text-muted mt-4 text-center">Las asociaciones no pueden apuntarse a eventos.</p>
                            )}

                            {/* Lista de Voluntarios Apuntados */}
                            <h6 className="mt-4 border-top pt-3">Voluntarios Apuntados:</h6>
                            {event.volunteers && event.volunteers.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {event.volunteers.map(volunteer => (
                                        <li key={volunteer.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <span>
                                                {volunteer.name || volunteer.email?.split('@')[0]} {volunteer.lastname || ''}
                                            </span>
                                            <span className="badge bg-secondary rounded-pill">
                                                {new Date(volunteer.joined_at).toLocaleDateString('es-ES')}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">Nadie se ha apuntado aún.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};