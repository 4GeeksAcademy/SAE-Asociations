import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import useGlobalReducer from '../hooks/useGlobalReducer';

const Login = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    // Estado del formulario
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Estado para errores de validación
    const [errors, setErrors] = useState({});

    // Estado para loading y mensajes - usando dispatch pattern
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(null);

    // Función para manejar cambios en inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validación del formulario
    const validateForm = () => {
        const newErrors = {};

        // Validar email
        if (!formData.email.trim()) {
            newErrors.email = 'Email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Validar contraseña
        if (!formData.password.trim()) {
            newErrors.password = 'Contraseña es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setStatus(null);
        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            const response = await authService.login(formData);

            // Usar dispatch para actualizar el estado global
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: response.user,
                    token: response.token
                }
            });

            setStatus({ type: 'success', message: 'Login exitoso. Redirigiendo...' });

            // Redirigir después de 1 segundo
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (error) {
            console.error('Error en login:', error);

            let errorMessage = 'Error en el login';
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setStatus({ type: 'error', message: errorMessage });
            dispatch({
                type: 'SET_MESSAGE',
                payload: { text: errorMessage, type: 'error' }
            });
        } finally {
            setIsSubmitting(false);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    return (
        <div className="min-vh-100 bg-light py-3 py-md-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                        <div className="card shadow-lg border-0">
                            <div className="card-header bg-primary text-white text-center py-3 py-md-4">
                                <h2 className="mb-0 fw-bold h3 h2-md">
                                    <i className="bi bi-box-arrow-in-right me-2"></i>
                                    Iniciar Sesión
                                </h2>
                                <p className="mb-0 mt-2 opacity-75 small">Accede a tu cuenta</p>
                            </div>

                            <div className="card-body p-3 p-md-5">
                                {/* Mostrar loading global */}
                                {store.isLoading && (
                                    <div className="text-center mb-3">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Mostrar mensaje global */}
                                {store.message && (
                                    <div className={`alert alert-${store.message.type === 'error' ? 'danger' : store.message.type} mb-4`}>
                                        <i className={`bi ${store.message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                                        {store.message.text}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {status && (
                                        <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`}>
                                            <i className={`bi ${status.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                                            {status.message}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label fw-semibold">
                                            <i className="bi bi-envelope me-1"></i>Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            placeholder="tu@email.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={store.isLoading}
                                        />
                                        {errors.email && (
                                            <div className="text-danger small mt-1">{errors.email}</div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label fw-semibold">
                                            <i className="bi bi-lock me-1"></i>Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            id="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            placeholder="Tu contraseña"
                                            value={formData.password}
                                            onChange={handleChange}
                                            disabled={store.isLoading}
                                        />
                                        {errors.password && (
                                            <div className="text-danger small mt-1">{errors.password}</div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-2 fw-semibold"
                                        disabled={isSubmitting || store.isLoading}
                                    >
                                        {isSubmitting || store.isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Iniciando sesión...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                                Iniciar Sesión
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center">
                                    <p className="text-muted mb-3">¿No tienes cuenta? Regístrate como:</p>
                                    <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                                        <Link
                                            to="/register/user"
                                            className="btn btn-outline-success btn-sm px-3 px-sm-4"
                                        >
                                            <i className="bi bi-person-plus me-2"></i>
                                            <span className="d-none d-sm-inline">Usuario/</span>Voluntario
                                        </Link>
                                        <Link
                                            to="/register/association"
                                            className="btn btn-outline-info btn-sm px-3 px-sm-4"
                                        >
                                            <i className="bi bi-building me-2"></i>
                                            Asociación
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 