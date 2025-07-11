import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { ratingService } from '../services/ratingService';

const RatingForm = ({
    show,
    onClose,
    associationId,
    unratedEvents = [],
    existingRating = null,
    onRatingSubmitted
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingRating) {
            // Modo edición
            setRating(existingRating.rating);
            setComment(existingRating.comment || '');
            setSelectedEventId(existingRating.event_id);
        } else {
            // Modo creación
            setRating(0);
            setComment('');
            // Seleccionar automáticamente el primer evento si solo hay uno
            if (unratedEvents.length === 1) {
                setSelectedEventId(unratedEvents[0].id);
            } else {
                setSelectedEventId(null);
            }
        }
        setError('');
    }, [existingRating, unratedEvents, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Por favor selecciona una valoración');
            return;
        }

        if (!selectedEventId) {
            setError('Por favor selecciona un evento');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const ratingData = {
                association_id: associationId,
                event_id: selectedEventId,
                rating: rating,
                comment: comment.trim() || null
            };

            let response;
            const isNewRating = !existingRating;

            if (existingRating) {
                response = await ratingService.updateRating(existingRating.id, ratingData);
            } else {
                response = await ratingService.createRating(ratingData);
            }

            if (response.success) {
                onRatingSubmitted(response.rating, isNewRating);
                onClose(isNewRating);
            } else {
                setError(response.message || 'Error al enviar valoración');
            }
        } catch (error) {
            // Manejo de errores específicos
            if (error.message.includes('ya lo valoraste')) {
                setError('Ya has valorado este evento.');
            } else if (error.message.includes('no fuiste voluntario')) {
                setError('Solo los voluntarios que participaron en el evento pueden valorar.');
            } else if (error.message.includes('no ha terminado')) {
                setError('Solo puedes valorar eventos que ya hayan terminado.');
            } else if (error.message.includes('Usuario no autenticado')) {
                setError('Debes iniciar sesión para valorar.');
            } else {
                setError('Error al enviar valoración. Inténtalo de nuevo.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose(false);
        }
    };

    if (!show) return null;

    const selectedEvent = unratedEvents.find(event => event.id === selectedEventId) ||
        (existingRating && existingRating.event);

    return (
        <div className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {existingRating ? 'Editar valoración' : 'Valorar evento'}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        ></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {/* Selección de evento (solo para valoraciones nuevas) */}
                            {!existingRating && unratedEvents.length > 0 && (
                                <div className="mb-4">
                                    <label className="form-label">Selecciona el evento a valorar *</label>
                                    {unratedEvents.length === 1 ? (
                                        <div className="alert alert-info">
                                            <strong>{unratedEvents[0].title}</strong>
                                            <br />
                                            <small className="text-muted">
                                                {new Date(unratedEvents[0].date).toLocaleDateString('es-ES')}
                                            </small>
                                        </div>
                                    ) : (
                                        <select
                                            className="form-select"
                                            value={selectedEventId || ''}
                                            onChange={(e) => setSelectedEventId(Number(e.target.value))}
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Selecciona un evento</option>
                                            {unratedEvents.map(event => (
                                                <option key={event.id} value={event.id}>
                                                    {event.title} - {new Date(event.date).toLocaleDateString('es-ES')}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            )}

                            {/* Mostrar evento seleccionado en modo edición */}
                            {existingRating && existingRating.event && (
                                <div className="mb-4">
                                    <label className="form-label">Evento</label>
                                    <div className="alert alert-info">
                                        <strong>{existingRating.event.title}</strong>
                                        <br />
                                        <small className="text-muted">
                                            {new Date(existingRating.event.date).toLocaleDateString('es-ES')}
                                        </small>
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="form-label">Valoración *</label>
                                <div className="d-flex align-items-center">
                                    <StarRating
                                        rating={rating}
                                        onRatingChange={setRating}
                                        readonly={false}
                                        size="lg"
                                    />
                                    <span className="ms-3 text-muted">
                                        {rating > 0 ? `${rating}/5` : 'Selecciona una valoración'}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="comment" className="form-label">
                                    Comentario (opcional)
                                </label>
                                <textarea
                                    id="comment"
                                    className="form-control"
                                    rows="4"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Comparte tu experiencia como voluntario en este evento..."
                                    maxLength="500"
                                    disabled={isSubmitting}
                                />
                                <div className="form-text">
                                    {comment.length}/500 caracteres
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting || rating === 0 || !selectedEventId}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Enviando...
                                    </>
                                ) : (
                                    existingRating ? 'Actualizar' : 'Enviar valoración'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RatingForm; 