import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import useGlobalReducer from '../hooks/useGlobalReducer';

const RegisterAssociation = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    // Limpiar mensaje al desmontar el componente
    useEffect(() => {
        return () => dispatch({ type: 'CLEAR_MESSAGE' });
    }, [dispatch]);

    // Estado del formulario 
    const [formData, setFormData] = useState({
        // Datos del representante
        name: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        // Datos de la asociación
        association_name: '',
        description: '',
        cif: '',
        contact_email: '',
        contact_phone: '',
    });

    // Estados para validación y UI
    const [errors, setErrors] = useState({});

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

        // Validar datos del representante
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
        } else if (formData.name.length > 100) {
            newErrors.name = 'El nombre debe tener máximo 100 caracteres';
        }

        if (!formData.lastname.trim()) {
            newErrors.lastname = 'El apellido es obligatorio';
        } else if (formData.lastname.length > 100) {
            newErrors.lastname = 'El apellido debe tener máximo 100 caracteres';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Por favor, introduce un email válido (ejemplo: usuario@dominio.com)';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es obligatorio';
        } else if (formData.phone.length > 20) {
            newErrors.phone = 'El teléfono debe tener máximo 20 caracteres';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres con letras y números';
        } else if (!/[A-Za-z]/.test(formData.password)) {
            newErrors.password = 'La contraseña debe contener al menos una letra';
        } else if (!/\d/.test(formData.password)) {
            newErrors.password = 'La contraseña debe contener al menos un número';
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Confirmar contraseña es obligatorio';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas deben coincidir exactamente';
        }

        // Validar datos de la asociación
        if (!formData.association_name.trim()) {
            newErrors.association_name = 'El nombre de la asociación es obligatorio';
        } else if (formData.association_name.length > 200) {
            newErrors.association_name = 'El nombre de la asociación debe tener máximo 200 caracteres';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La descripción es obligatoria';
        } else if (formData.description.length > 1000) {
            newErrors.description = 'La descripción debe tener máximo 1000 caracteres';
        }

        if (!formData.cif.trim()) {
            newErrors.cif = 'El CIF es obligatorio';
        } else if (formData.cif.length > 20) {
            newErrors.cif = 'El CIF debe tener máximo 20 caracteres';
        }

        if (!formData.contact_email.trim()) {
            newErrors.contact_email = 'El email de contacto es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
            newErrors.contact_email = 'Por favor, introduce un email de contacto válido';
        }

        if (!formData.contact_phone.trim()) {
            newErrors.contact_phone = 'El teléfono de contacto es obligatorio';
        } else if (formData.contact_phone.length > 20) {
            newErrors.contact_phone = 'El teléfono de contacto debe tener máximo 20 caracteres';
        }

        // Validar URLs opcionales
        if (formData.website_url && formData.website_url.trim() && !formData.website_url.match(/^https?:\/\/.+/)) {
            newErrors.website_url = 'La URL del sitio web no es válida (debe empezar con http:// o https://)';
        }

        if (formData.social_media_url && formData.social_media_url.trim() && !formData.social_media_url.match(/^https?:\/\/.+/)) {
            newErrors.social_media_url = 'La URL de redes sociales no es válida (debe empezar con http:// o https://)';
        }

        if (formData.image_url && formData.image_url.trim() && !formData.image_url.match(/^https?:\/\/.+/)) {
            newErrors.image_url = 'La URL de la imagen no es válida (debe empezar con http:// o https://)';
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
            // Enviar todos los datos incluyendo confirmPassword para validación
            const response = await authService.registerAssociation(formData);

            dispatch({
                type: 'SET_MESSAGE',
                payload: { text: 'Asociación registrada exitosamente. Redirigiendo al login...', type: 'success' }
            });

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Error en registro:', error);

            let errorMessage = 'No pudimos procesar el registro de tu asociación en este momento. Por favor, inténtalo de nuevo en unos minutos.';

            // Manejar diferentes tipos de errores
            if (error.message) {
                if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
                    errorMessage = 'No pudimos conectar con el servidor. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
                } else if (error.message.includes('Email already registered') || error.message.includes('ya está registrado')) {
                    errorMessage = 'Este email ya está registrado. ¿Quieres iniciar sesión en su lugar?';
                } else if (error.message.includes('CIF already registered') || error.message.includes('CIF ya está registrado')) {
                    errorMessage = 'Este CIF ya está registrado por otra asociación. Verifica que sea correcto o contacta con soporte.';
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
                <div className="col-12 col-sm-11 col-md-10 col-lg-9 col-xl-8">
                    <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-header bg-info text-white text-center py-4 rounded-top-4">
                            <h2 className="mb-0 fw-bold">
                                <i className="bi bi-building me-2"></i>
                                Registro de Asociación
                            </h2>
                            <p className="mb-0 mt-2 opacity-90">Registra tu organización</p>
                        </div>
                        <div className="card-body p-3 p-md-5">
                            {/* Mostrar loading global */}
                            {store.isLoading && (
                                <div className="text-center mb-3">
                                    <div className="spinner-border text-info" role="status">
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
                                <div className="alert alert-info mb-4">
                                    <i className="bi bi-info-circle me-2"></i>
                                    <strong>Información importante:</strong> Necesitamos tanto los datos del representante como de la asociación para completar el registro.
                                </div>

                                {/* Datos Personales del Representante */}
                                <div className="mb-4">
                                    <h4 className="text-primary mb-3 h5 h4-md">
                                        <i className="bi bi-person-badge me-2"></i>
                                        <span className="d-none d-sm-inline">Datos del </span>Representante
                                    </h4>
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
                                                <i className="bi bi-envelope me-1"></i>Email personal
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
                                                <i className="bi bi-telephone me-1"></i>Teléfono personal
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                placeholder="Tu teléfono"
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
                                                placeholder="Mínimo 8 caracteres"
                                                value={formData.password}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                            />
                                            {errors.password && (
                                                <div className="text-danger small mt-1">{errors.password}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="confirmPassword" className="form-label fw-semibold">
                                                <i className="bi bi-lock-fill me-1"></i>Confirmar
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                id="confirmPassword"
                                                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                placeholder="Repite tu contraseña"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                            />
                                            {errors.confirmPassword && (
                                                <div className="text-danger small mt-1">{errors.confirmPassword}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Datos de la Asociación */}
                                <div className="mb-4">
                                    <h4 className="text-info mb-3 h5 h4-md">
                                        <i className="bi bi-building me-2"></i>
                                        <span className="d-none d-sm-inline">Datos de la </span>Asociación
                                    </h4>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="association_name" className="form-label fw-semibold">
                                                <i className="bi bi-building me-1"></i>Nombre
                                            </label>
                                            <input
                                                type="text"
                                                name="association_name"
                                                id="association_name"
                                                className={`form-control ${errors.association_name ? 'is-invalid' : ''}`}
                                                placeholder="Nombre de la asociación"
                                                value={formData.association_name}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                            />
                                            {errors.association_name && (
                                                <div className="text-danger small mt-1">{errors.association_name}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="cif" className="form-label fw-semibold">
                                                <i className="bi bi-card-text me-1"></i>CIF
                                            </label>
                                            <input
                                                type="text"
                                                name="cif"
                                                id="cif"
                                                className={`form-control ${errors.cif ? 'is-invalid' : ''}`}
                                                placeholder="CIF de la asociación"
                                                value={formData.cif}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                            />
                                            {errors.cif && (
                                                <div className="text-danger small mt-1">{errors.cif}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label fw-semibold">
                                            <i className="bi bi-card-text me-1"></i>Descripción
                                        </label>
                                        <textarea
                                            name="description"
                                            id="description"
                                            rows="3"
                                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                            placeholder="Describe brevemente la actividad de tu asociación"
                                            value={formData.description}
                                            onChange={handleChange}
                                            disabled={store.isLoading}
                                        />
                                        {errors.description && (
                                            <div className="text-danger small mt-1">{errors.description}</div>
                                        )}
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="contact_email" className="form-label fw-semibold">
                                                <i className="bi bi-envelope me-1"></i>Email de contacto
                                            </label>
                                            <input
                                                type="email"
                                                name="contact_email"
                                                id="contact_email"
                                                className={`form-control ${errors.contact_email ? 'is-invalid' : ''}`}
                                                placeholder="contacto@asociacion.com"
                                                value={formData.contact_email}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                            />
                                            {errors.contact_email && (
                                                <div className="text-danger small mt-1">{errors.contact_email}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-4">
                                            <label htmlFor="contact_phone" className="form-label fw-semibold">
                                                <i className="bi bi-telephone me-1"></i>Teléfono de contacto
                                            </label>
                                            <input
                                                type="tel"
                                                name="contact_phone"
                                                id="contact_phone"
                                                className={`form-control ${errors.contact_phone ? 'is-invalid' : ''}`}
                                                placeholder="Teléfono de la asociación"
                                                value={formData.contact_phone}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                            />
                                            {errors.contact_phone && (
                                                <div className="text-danger small mt-1">{errors.contact_phone}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-info w-100 py-2 fw-semibold"
                                    disabled={store.isLoading}
                                >
                                    {store.isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Registrando asociación...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-building-check me-2"></i>
                                            Registrar Asociación
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="text-center mt-4">
                                <p className="text-muted mb-0">
                                    ¿Ya tienes cuenta?{' '}
                                    <Link to="/login" className="text-decoration-none fw-semibold">
                                        Inicia sesión aquí
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterAssociation; 