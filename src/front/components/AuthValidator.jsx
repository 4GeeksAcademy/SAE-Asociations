import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import useGlobalReducer from '../hooks/useGlobalReducer';

const AuthValidator = ({ children }) => {
    const [isValidating, setIsValidating] = useState(true);
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    useEffect(() => {
        const validateAuthOnStartup = async () => {
            try {
                // Validación local rápida del token
                authService.isTokenExpired();
            } catch (error) {
                console.error('Error validating auth on startup:', error);
            } finally {
                setIsValidating(false);
            }
        };

        validateAuthOnStartup();

        // Escuchar eventos de limpieza de autenticación
        const handleAuthCleared = () => {
            dispatch({ type: 'LOGOUT' });
            navigate('/');
        };

        // Escuchar cambios en el estado de autenticación
        const handleAuthStateChanged = (event) => {
            if (!event.detail.isAuthenticated) {
                dispatch({ type: 'LOGOUT' });
                navigate('/');
            }
        };

        window.addEventListener('auth-cleared', handleAuthCleared);
        window.addEventListener('auth-state-changed', handleAuthStateChanged);

        return () => {
            window.removeEventListener('auth-cleared', handleAuthCleared);
            window.removeEventListener('auth-state-changed', handleAuthStateChanged);
        };
    }, [dispatch, navigate]);

    // Mostrar un spinner mientras se valida
    if (isValidating) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Validando autenticación...</span>
                </div>
            </div>
        );
    }

    return children;
};

export default AuthValidator; 