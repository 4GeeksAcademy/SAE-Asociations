import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService.js';
import ImageUploader from './ImageUploader';
import NotificationModal from './NotificationModal';
import useNotification from '../hooks/useNotification';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

export const EventForm = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { notification, hideNotification, showSuccess, showError } = useNotification();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        city: '',
        address: '',
        event_type: '',
        max_volunteers: '',
        image_url: null
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageUpload = (url) => {
        if (!url) {
            showError('Error de imagen', 'Error al subir la imagen. Por favor, inténtalo de nuevo.');
            return;
        }
        setFormData(prev => ({ ...prev, image_url: url }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const currentUser = authService.getCurrentUser();

        if (!currentUser || !currentUser.association) {
            showError('Acceso denegado', 'Debes iniciar sesión para crear un evento.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const token = authService.getToken();

            const eventData = {
                title: formData.title,
                description: formData.description,
                date: formData.date, 
                city: formData.city, 
                address: formData.address || null, 
                event_type: formData.event_type || null, 
                association_id: currentUser.association.id,
                max_volunteers: formData.max_volunteers === '' ? null : parseInt(formData.max_volunteers)
            };

            const response = await fetch(`${API_BASE_URL}/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });

            const result = await response.json();

            if (response.ok) {
                showSuccess('¡Evento creado!', 'El evento ha sido creado con éxito');
                setTimeout(() => {
                    navigate('/event/list');
                }, 2000);
            } else {
                setError(result.error || 'Error al crear el evento');
                showError('Error al crear evento', result.error || 'Hubo un error al crear el evento');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            setError('Error de conexión');
            showError('Error de conexión', 'Hubo un error al crear el evento');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mt-4">
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
                        onUploadSuccess={handleImageUpload}
                        onUploadError={(error) => {
                            console.error('Error uploading image:', error);
                            showError('Error al subir imagen', 'Hubo un problema al subir la imagen. Por favor, inténtalo de nuevo.');
                        }}
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
                    <label htmlFor="date" className="form-label">Fecha y hora</label>
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
                    <label htmlFor="city" className="form-label">Ciudad <span className="text-danger">*</span></label>
                    <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-12">
                    <label htmlFor="address" className="form-label">Dirección (opcional)</label>
                    <input
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>

                <div className="col-12">
                    <label htmlFor="event_type" className="form-label">Tipo de Evento <span className="text-danger">*</span></label>
                    <select
                        className="form-control"
                        id="event_type"
                        name="event_type"
                        value={formData.event_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Selecciona un tipo</option> 
                        <option value="Medio Ambiente">Medio Ambiente</option>
                        <option value="Educación">Educación</option>
                        <option value="Salud">Salud</option>
                        <option value="Comunidad">Comunidad</option>
                        <option value="Animales">Animales</option>
                        <option value="Deporte">Deporte</option>
                        <option value="Cultura">Cultura</option>
                        <option value="Otro">Otro</option>
                    </select>
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

            <NotificationModal
                show={notification.show}
                onClose={hideNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                confirmText={notification.confirmText}
                cancelText={notification.cancelText}
                onConfirm={notification.onConfirm}
                showCancel={notification.showCancel}
            />
        </div>
    );
};
