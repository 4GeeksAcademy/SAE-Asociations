import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploader from "./ImageUploader";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


export const EventForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image_url: "",
        date: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageUploadSuccess = (imageUrl, uploadInfo) => {
        console.log('Imagen subida exitosamente:', imageUrl);
        setFormData({
            ...formData,
            image_url: imageUrl
        });
    };

    const handleImageUploadError = (error) => {
        console.error('Error al subir imagen:', error);
        alert('Error al subir la imagen. Por favor, inténtalo de nuevo.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            // 1. Obtener el token del localStorage
            const token = localStorage.getItem("token");

            // 2. Verificar si el token existe
            if (!token) {
                alert("Debes iniciar sesión para crear un evento.");
                // O redirigir al login
                // navigate('/login'); 
                return; // Detener la ejecución si no hay token
            }

            const dataToSend = { ...formData };
            if (dataToSend.date === "") {
                dataToSend.date = null; // Convierte la cadena vacía a null
            }
            console.log("Enviando datos:", JSON.stringify(dataToSend));

            const response = await fetch(`${API_BASE_URL}/api/events`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                // Si la respuesta no es OK, intentamos leer el cuerpo del error
                const errorData = await response.json();
                console.error("Error al crear evento (respuesta no OK):", errorData);
                throw new Error(errorData.error || "Error al crear evento");
            }

            const result = await response.json();
            alert("Evento creado con éxito");
            console.log(result);

            // Redirigir a la lista de eventos
            navigate('/event/list');

        } catch (error) {
            console.error("Error:", error);
            alert("Hubo un error al crear el evento");
        }
    };

    return (
        <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-12">
                <label htmlFor="title" className="form-label">Título del evento</label>
                <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                />
            </div>

            <div className="col-12">
                <label htmlFor="description" className="form-label">Descripción</label>
                <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="col-12">
                <label className="form-label fw-medium">Imagen del evento</label>
                <ImageUploader
                    onUploadSuccess={handleImageUploadSuccess}
                    onUploadError={handleImageUploadError}
                    buttonText="Seleccionar imagen"
                    buttonClass="btn-success"
                    currentImageUrl={formData.image_url}
                    showPreview={true}
                />
                {formData.image_url && (
                    <div className="mt-2">
                        <small className="text-success">
                            ✓ Imagen seleccionada correctamente
                        </small>
                    </div>
                )}
            </div>

            <div className="col-md-6">
                <label htmlFor="date" className="form-label">Fecha</label>
                <input
                    type="datetime-local"
                    className="form-control"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="col-md-6">
                <label htmlFor="max_volunteers" className="form-label">Número Máximo de Voluntarios (opcional)</label>
                <input
                    type="number" 
                    className="form-control"
                    id="max_volunteers"
                    name="max_volunteers"
                    value={formData.max_volunteers}
                    onChange={handleChange}
                    min="0" 
                    placeholder="Ilimitado si se deja en blanco"
                />
            </div>

            <div className="col-12">
                <button type="submit" className="btn btn-primary">Crear evento</button>
            </div>
        </form>
    );
};
