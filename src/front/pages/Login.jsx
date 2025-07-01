import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import useGlobalReducer from '../hooks/useGlobalReducer';

const Login = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    // Limpiar mensaje al desmontar el componente
    useEffect(() => {
        return () => dispatch({ type: 'CLEAR_MESSAGE' });
    }, [dispatch]);

    // Estado del formulario
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Estado para errores de validación
    const [errors, setErrors] = useState({});

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
            newErrors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Por favor, introduce un email válido (ejemplo: usuario@dominio.com)';
        }

        // Validar contraseña
        if (!formData.password.trim()) {
            newErrors.password = 'La contraseña es obligatoria';
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

        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            const response = await authService.login(formData);

            // authService ya guarda en localStorage, solo actualizamos el estado
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    user: response.user,
                    token: response.token
                }
            });

            // Redirigir a la página de eventos después de 1 segundo
            setTimeout(() => {
                navigate('/event/list');
            }, 1000);
        } catch (error) {
            console.error('Error en login:', error);

            let errorMessage = 'No pudimos conectarte en este momento. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';

            // Manejar diferentes tipos de errores
            if (error.message) {
                if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
                    errorMessage = 'No pudimos conectar con el servidor. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
                } else if (error.message.includes('Email o contraseña incorrectos')) {
                    errorMessage = 'Email o contraseña incorrectos. Por favor, verifica tus datos e inténtalo de nuevo.';
                } else if (error.message.includes('Network')) {
                    errorMessage = 'Problema de conexión. Por favor, verifica tu internet e inténtalo de nuevo.';
                } else {
                    errorMessage = error.message;
                }
            }

            dispatch({
                type: 'SET_MESSAGE',
                payload: { text: errorMessage, type: 'error' }
            });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-4">
            <div className="row w-100 justify-content-center">
                <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                    <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-header bg-primary text-white text-center py-4 rounded-top-4">
                            <h2 className="mb-0 fw-bold">
                                <i className="bi bi-person-circle me-2"></i>
                                Iniciar Sesión
                            </h2>
                            <p className="mb-0 mt-2 opacity-90">Accede a tu cuenta</p>
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
                                    disabled={store.isLoading}
                                >
                                    {store.isLoading ? (
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

                            <div className="text-center mt-4">
                                <p className="text-muted mb-2">¿No tienes cuenta?</p>
                                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                                    <Link to="/register/user" className="btn btn-outline-success btn-sm">
                                        <i className="bi bi-person-plus me-1"></i>
                                        Voluntario
                                    </Link>
                                    <Link to="/register/association" className="btn btn-outline-info btn-sm">
                                        <i className="bi bi-building me-1"></i>
                                        Asociación
                                    </Link>
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