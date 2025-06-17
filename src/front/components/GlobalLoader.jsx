import React from 'react';
import useGlobalReducer from '../hooks/useGlobalReducer';

const GlobalLoader = () => {
    const { store } = useGlobalReducer();

    if (!store.isLoading) return null;

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9999
            }}
        >
            <div className="bg-white p-4 rounded shadow text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mb-0 text-muted">Procesando...</p>
            </div>
        </div>
    );
};

export default GlobalLoader; 