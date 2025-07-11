import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { ratingService } from '../services/ratingService';

const RatingDisplay = ({ associationId, onRateClick }) => {
    const [ratingSummary, setRatingSummary] = useState(null);
    const [canRate, setCanRate] = useState(false);
    const [alreadyRated, setAlreadyRated] = useState(false);
    const [unratedEvents, setUnratedEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRatingData = async () => {
            try {
                setIsLoading(true);

                // Obtener resumen de valoraciones
                const ratingsResponse = await ratingService.getRatings(associationId);
                if (ratingsResponse.success) {
                    setRatingSummary(ratingsResponse.summary);
                }

                // Verificar si el usuario puede valorar (solo si está logueado)
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const canRateResponse = await ratingService.canUserRate(associationId);
                        if (canRateResponse.success) {
                            setCanRate(canRateResponse.can_rate);
                            setAlreadyRated(canRateResponse.already_rated);
                            setUnratedEvents(canRateResponse.unrated_events || []);
                        }
                    } catch (error) {
                        // Si no puede verificar permisos (no autenticado), simplemente no mostrar el botón
                        setCanRate(false);
                        setAlreadyRated(false);
                        setUnratedEvents([]);
                    }
                }

            } catch (error) {
                console.error('Error fetching rating data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRatingData();
    }, [associationId]);

    const handleRateClick = () => {
        if (onRateClick) {
            // Pasar los eventos no valorados al componente padre
            onRateClick(unratedEvents);
        }
    };

    if (isLoading) {
        return (
            <div className="rating-display bg-light rounded p-3 mb-4">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    const hasRatings = ratingSummary && ratingSummary.total_ratings > 0;

    return (
        <div className="rating-display bg-light rounded p-3 mb-4">
            <div className="row align-items-center">
                <div className="col-md-8">
                    <div className="d-flex align-items-center">
                        {hasRatings ? (
                            <>
                                <StarRating
                                    rating={ratingSummary.average_rating}
                                    readonly={true}
                                    size="lg"
                                />
                                <div className="ms-3">
                                    <h5 className="mb-1">{ratingSummary.average_rating.toFixed(1)}/5</h5>
                                    <p className="text-muted mb-0">
                                        {ratingSummary.total_ratings} valoracion{ratingSummary.total_ratings !== 1 ? 'es' : ''}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="text-muted">
                                <StarRating rating={0} readonly={true} size="lg" />
                                <span className="ms-3">Sin valoraciones aún</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-md-4 text-end">
                    {canRate && !alreadyRated && (
                        <button
                            className="btn btn-primary"
                            onClick={handleRateClick}
                        >
                            <i className="fas fa-star me-2"></i>
                            Valorar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RatingDisplay; 