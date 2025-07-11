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
                return <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>;
            case 'error':
                return <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '3rem' }}></i>;
            case 'warning':
                return <i className="bi bi-exclamation-circle-fill text-warning" style={{ fontSize: '3rem' }}></i>;
            case 'confirm':
                return <i className="bi bi-question-circle-fill text-primary" style={{ fontSize: '3rem' }}></i>;
            default:
                return <i className="bi bi-info-circle-fill text-info" style={{ fontSize: '3rem' }}></i>;
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
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-body text-center p-4">
                        <div className="mb-3">
                            {getIcon()}
                        </div>
                        {title && <h5 className="mb-3">{title}</h5>}
                        {message && <p className="mb-4 text-muted">{message}</p>}

                        <div className="d-flex gap-2 justify-content-center">
                            {showCancel && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                type="button"
                                className={`btn ${getButtonClass()}`}
                                onClick={handleConfirm}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal; 