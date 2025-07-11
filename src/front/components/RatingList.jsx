import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { ratingService } from '../services/ratingService';

const RatingList = ({ associationId, refreshTrigger, onEditRating }) => {
    const [ratings, setRatings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [showAllRatings, setShowAllRatings] = useState(false);

    // Función para obtener el user_id del token JWT
    const getCurrentUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub;
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    };

    useEffect(() => {
        // Obtener el ID del usuario actual
        const userId = getCurrentUserId();
        setCurrentUserId(userId);

        const fetchRatings = async () => {
            try {
                setIsLoading(true);
                setError('');

                const response = await ratingService.getRatings(associationId);

                if (response.success) {
                    setRatings(response.ratings);
                } else {
                    setError('Error al cargar las valoraciones');
                }

            } catch (err) {
                setError('Error al cargar las valoraciones');
                console.error('Error fetching ratings:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRatings();
    }, [associationId, refreshTrigger]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEditRating = (rating) => {
        if (onEditRating) {
            onEditRating(rating);
        }
    };

    if (isLoading) {
        return (
            <div className="rating-list">
                <h4 className="mb-4">Valoraciones</h4>
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando valoraciones...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rating-list">
                <h4 className="mb-4">Valoraciones</h4>
                <div className="alert alert-warning" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="rating-list" id="ratings-section">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">
                    <i className="fas fa-star text-warning me-2"></i>
                    Valoraciones
                </h4>
                {ratings.length > 0 && (
                    <span className="badge bg-secondary">
                        {ratings.length} {ratings.length === 1 ? 'valoración' : 'valoraciones'}
                    </span>
                )}
            </div>

            {ratings.length === 0 ? (
                <div className="text-center py-4 text-muted">
                    <i className="fas fa-star fa-3x mb-3 text-light"></i>
                    <p>Aún no hay valoraciones para esta asociación.</p>
                    <p className="small">¡Sé el primero en valorar como voluntario!</p>
                </div>
            ) : (
                <>
                    <div className="row">
                        {(showAllRatings ? ratings : ratings.slice(0, 3)).map((rating) => (
                            <div key={rating.id} className="col-12 mb-4">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                                                    style={{ width: '40px', height: '40px' }}>
                                                    <i className="fas fa-user text-white"></i>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">
                                                        {rating.user?.name || 'Usuario anónimo'}
                                                    </h6>
                                                    <small className="text-muted">
                                                        {formatDate(rating.created_at)}
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <StarRating
                                                    rating={rating.rating}
                                                    readonly={true}
                                                    size="sm"
                                                />
                                                {currentUserId && Number(rating.user_id) === Number(currentUserId) && (
                                                    <button
                                                        className="btn btn-outline-primary btn-sm ms-2"
                                                        onClick={() => handleEditRating(rating)}
                                                        title="Editar tu valoración"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {rating.comment && (
                                            <div className="rating-comment">
                                                <p className="mb-0 text-dark">
                                                    "{rating.comment}"
                                                </p>
                                            </div>
                                        )}

                                        {rating.updated_at !== rating.created_at && (
                                            <div className="mt-2">
                                                <small className="text-muted">
                                                    <i className="fas fa-edit me-1"></i>
                                                    Editado el {formatDate(rating.updated_at)}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {ratings.length > 3 && (
                        <div className="text-center mt-4">
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => setShowAllRatings(!showAllRatings)}
                            >
                                {showAllRatings ? (
                                    <>
                                        <i className="bi bi-chevron-up me-2"></i>
                                        Mostrar menos
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-chevron-down me-2"></i>
                                        Ver todas las valoraciones ({ratings.length - 3} más)
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RatingList; 