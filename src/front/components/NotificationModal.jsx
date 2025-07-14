import React from 'react';

const NotificationModal = ({
    show,
    onClose,
    type = 'info',
    title,
    message,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    onConfirm = null,
    showCancel = false
}) => {
    if (!show) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <i className="bi bi-check-circle-fill notification-icon success-icon"></i>;
            case 'error':
                return <i className="bi bi-exclamation-triangle-fill notification-icon error-icon"></i>;
            case 'warning':
                return <i className="bi bi-exclamation-circle-fill notification-icon warning-icon"></i>;
            case 'confirm':
                return <i className="bi bi-question-circle-fill notification-icon confirm-icon"></i>;
            default:
                return <i className="bi bi-info-circle-fill notification-icon info-icon"></i>;
        }
    };

    const getButtonClass = () => {
        switch (type) {
            case 'success':
                return 'btn-success';
            case 'error':
                return 'btn-danger';
            case 'warning':
                return 'btn-warning';
            case 'confirm':
                return 'btn-primary';
            default:
                return 'btn-info';
        }
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    return (
        <div className="notification-modal-overlay" onClick={onClose}>
            <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                <div className="notification-content">
                    <div className="notification-icon-container">
                        {getIcon()}
                    </div>

                    <div className="notification-body">
                        {title && <h4 className="notification-title">{title}</h4>}
                        {message && <p className="notification-message">{message}</p>}
                    </div>

                    <div className="notification-actions">
                        {showCancel && (
                            <button
                                type="button"
                                className="notification-btn notification-btn-secondary"
                                onClick={onClose}
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            type="button"
                            className={`notification-btn notification-btn-primary ${getButtonClass()}`}
                            onClick={handleConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal; 