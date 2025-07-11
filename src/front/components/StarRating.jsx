import React, { useState } from 'react';

const StarRating = ({ rating = 0, onRatingChange = null, readonly = false, size = 'md' }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeClasses = {
        sm: 'fs-6',
        md: 'fs-5',
        lg: 'fs-4',
        xl: 'fs-3'
    };

    const handleStarClick = (starRating) => {
        if (!readonly && onRatingChange) {
            onRatingChange(starRating);
        }
    };

    const handleMouseEnter = (starRating) => {
        if (!readonly) {
            setHoverRating(starRating);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    const getStarColor = (starIndex) => {
        const activeRating = hoverRating || rating;
        if (starIndex <= activeRating) {
            return '#ffc107'; // Bootstrap warning color (yellow)
        }
        return '#dee2e6'; // Bootstrap light gray
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`${sizeClasses[size]} ${!readonly ? 'cursor-pointer' : ''}`}
                    style={{
                        color: getStarColor(i),
                        marginRight: '2px',
                        cursor: readonly ? 'default' : 'pointer',
                        transition: 'color 0.2s ease'
                    }}
                    onClick={() => handleStarClick(i)}
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseLeave={handleMouseLeave}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    return (
        <div className="star-rating d-inline-flex align-items-center">
            {renderStars()}
            {readonly && rating > 0 && (
                <span className="ms-2 text-muted">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating; 