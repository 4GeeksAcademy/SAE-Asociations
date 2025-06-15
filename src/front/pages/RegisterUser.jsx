import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import useGlobalReducer from '../hooks/useGlobalReducer';

const RegisterUser = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    // Estado del formulario
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    // Estados para validación y UI
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(null);

    // Manejar cambios en inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validaciones del formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nombre es requerido';
        }

        if (!formData.lastname.trim()) {
            newErrors.lastname = 'Apellido es requerido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Teléfono es requerido';
        }

        if (!formData.password) {
            newErrors.password = 'Contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mínimo 6 caracteres';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirmar contraseña es requerido';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas deben coincidir';
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
            // Enviar todos los datos incluyendo confirmPassword para validación
            const response = await authService.registerUser(formData);

            setStatus({ type: 'success', message: 'Usuario registrado exitosamente. Redirigiendo al login...' });
            dispatch({
                type: 'SET_MESSAGE',
                payload: { text: 'Usuario registrado exitosamente', type: 'success' }
            });

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Error en registro:', error);

            let errorMessage = 'Error en el registro';
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
                    <div className="col-12 col-sm-11 col-md-10 col-lg-8 col-xl-6">
                        <div className="card shadow-lg border-0">
                            <div className="card-header bg-success text-white text-center py-3 py-md-4">
                                <h2 className="mb-0 fw-bold h4 h3-md h2-lg">
                                    <i className="bi bi-person-plus me-2"></i>
                                    <span className="d-none d-sm-inline">Registro de </span>Usuario/Voluntario
                                </h2>
                                <p className="mb-0 mt-2 opacity-75 small d-none d-md-block">Únete como voluntario a nuestra comunidad</p>
                            </div>

                            <div className="card-body p-3 p-md-5">
                                {/* Mostrar loading global */}
                                {store.isLoading && (
                                    <div className="text-center mb-3">
                                        <div className="spinner-border text-success" role="status">
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

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="name" className="form-label fw-semibold">
                                                <i className="bi bi-person me-1"></i>Nombre
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                placeholder="Tu nombre"
                                                value={formData.name}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                            />
                                            {errors.name && (
                                                <div className="text-danger small mt-1">{errors.name}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="lastname" className="form-label fw-semibold">
                                                <i className="bi bi-person me-1"></i>Apellido
                                            </label>
                                            <input
                                                type="text"
                                                name="lastname"
                                                id="lastname"
                                                className={`form-control ${errors.lastname ? 'is-invalid' : ''}`}
                                                placeholder="Tu apellido"
                                                value={formData.lastname}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                            />
                                            {errors.lastname && (
                                                <div className="text-danger small mt-1">{errors.lastname}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
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

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="phone" className="form-label fw-semibold">
                                                <i className="bi bi-phone me-1"></i>Teléfono
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                placeholder="612345678"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                            />
                                            {errors.phone && (
                                                <div className="text-danger small mt-1">{errors.phone}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="password" className="form-label fw-semibold">
                                                <i className="bi bi-lock me-1"></i>Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                id="password"
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                placeholder="Mínimo 6 caracteres"
                                                value={formData.password}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                            />
                                            {errors.password && (
                                                <div className="text-danger small mt-1">{errors.password}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-4">
                                            <label htmlFor="confirmPassword" className="form-label fw-semibold">
                                                <i className="bi bi-lock-fill me-1"></i>Confirmar Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                id="confirmPassword"
                                                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                placeholder="Repetir contraseña"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                            />
                                            {errors.confirmPassword && (
                                                <div className="text-danger small mt-1">{errors.confirmPassword}</div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-success w-100 py-2 fw-semibold mb-4"
                                        disabled={isSubmitting || store.isLoading}
                                    >
                                        {isSubmitting || store.isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Registrando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-person-check me-2"></i>
                                                Registrarse como Voluntario
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center border-top pt-4">
                                    <p className="text-muted mb-3 small">¿Ya tienes cuenta o prefieres otra opción?</p>
                                    <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                                        <Link to="/login" className="btn btn-outline-primary btn-sm px-3 px-sm-4">
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                            Iniciar Sesión
                                        </Link>
                                        <Link to="/register/association" className="btn btn-outline-info btn-sm px-3 px-sm-4">
                                            <i className="bi bi-building me-2"></i>
                                            <span className="d-none d-sm-inline">Registrar </span>Asociación
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

export default RegisterUser; 