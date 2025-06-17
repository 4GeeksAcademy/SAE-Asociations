import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import useGlobalReducer from '../hooks/useGlobalReducer';

const RegisterAssociation = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

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

        // Datos del representante
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

        // Datos de la asociación
        if (!formData.association_name.trim()) {
            newErrors.association_name = 'Nombre de la asociación es requerido';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Descripción es requerida';
        }

        if (!formData.cif.trim()) {
            newErrors.cif = 'CIF es requerido';
        }

        if (!formData.contact_email.trim()) {
            newErrors.contact_email = 'Email de contacto es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
            newErrors.contact_email = 'Email de contacto inválido';
        }

        if (!formData.contact_phone.trim()) {
            newErrors.contact_phone = 'Teléfono de contacto es requerido';
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
            const response = await authService.registerAssociation(formData);

            setStatus({ type: 'success', message: 'Asociación registrada exitosamente. Redirigiendo al login...' });
            dispatch({
                type: 'SET_MESSAGE',
                payload: { text: 'Asociación registrada exitosamente', type: 'success' }
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
                    <div className="col-12 col-sm-11 col-md-10 col-lg-9 col-xl-8">
                        <div className="card shadow-lg border-0">
                            <div className="card-header bg-info text-white text-center py-3 py-md-4">
                                <h2 className="mb-0 fw-bold h4 h3-md h2-lg">
                                    <i className="bi bi-building me-2"></i>
                                    <span className="d-none d-sm-inline">Registro de </span>Asociación
                                </h2>
                                <p className="mb-0 mt-2 opacity-75 small d-none d-md-block">Registra tu organización en nuestra plataforma</p>
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
                                    {status && (
                                        <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`}>
                                            <i className={`bi ${status.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                                            {status.message}
                                        </div>
                                    )}

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
                                                    <i className="bi bi-envelope me-1"></i>Email Personal
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                    placeholder="tu@email.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                />
                                                {errors.email && (
                                                    <div className="text-danger small mt-1">{errors.email}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="phone" className="form-label fw-semibold">
                                                    <i className="bi bi-telephone me-1"></i>Teléfono Personal
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    id="phone"
                                                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                    placeholder="+34 123 456 789"
                                                    value={formData.phone}
                                                    onChange={handleChange}
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
                                                />
                                                {errors.password && (
                                                    <div className="text-danger small mt-1">{errors.password}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="confirmPassword" className="form-label fw-semibold">
                                                    <i className="bi bi-lock-fill me-1"></i>Confirmar Contraseña
                                                </label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    id="confirmPassword"
                                                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                    placeholder="Repite tu contraseña"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
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

                                        <div className="mb-3">
                                            <label htmlFor="association_name" className="form-label fw-semibold">
                                                <i className="bi bi-building me-1"></i>Nombre de la Asociación
                                            </label>
                                            <input
                                                type="text"
                                                name="association_name"
                                                id="association_name"
                                                className={`form-control ${errors.association_name ? 'is-invalid' : ''}`}
                                                placeholder="Nombre oficial de la asociación"
                                                value={formData.association_name}
                                                onChange={handleChange}
                                            />
                                            {errors.association_name && (
                                                <div className="text-danger small mt-1">{errors.association_name}</div>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="cif" className="form-label fw-semibold">
                                                <i className="bi bi-card-text me-1"></i>CIF/NIF
                                            </label>
                                            <input
                                                type="text"
                                                name="cif"
                                                id="cif"
                                                className={`form-control ${errors.cif ? 'is-invalid' : ''}`}
                                                placeholder="CIF de la asociación"
                                                value={formData.cif}
                                                onChange={handleChange}
                                            />
                                            {errors.cif && (
                                                <div className="text-danger small mt-1">{errors.cif}</div>
                                            )}
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
                                                placeholder="Describe la misión y actividades de tu asociación"
                                                value={formData.description}
                                                onChange={handleChange}
                                            ></textarea>
                                            {errors.description && (
                                                <div className="text-danger small mt-1">{errors.description}</div>
                                            )}
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="contact_email" className="form-label fw-semibold">
                                                    <i className="bi bi-envelope me-1"></i>Email de Contacto
                                                </label>
                                                <input
                                                    type="email"
                                                    name="contact_email"
                                                    id="contact_email"
                                                    className={`form-control ${errors.contact_email ? 'is-invalid' : ''}`}
                                                    placeholder="contacto@asociacion.com"
                                                    value={formData.contact_email}
                                                    onChange={handleChange}
                                                />
                                                {errors.contact_email && (
                                                    <div className="text-danger small mt-1">{errors.contact_email}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="contact_phone" className="form-label fw-semibold">
                                                    <i className="bi bi-telephone me-1"></i>Teléfono de Contacto
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="contact_phone"
                                                    id="contact_phone"
                                                    className={`form-control ${errors.contact_phone ? 'is-invalid' : ''}`}
                                                    placeholder="+34 123 456 789"
                                                    value={formData.contact_phone}
                                                    onChange={handleChange}
                                                />
                                                {errors.contact_phone && (
                                                    <div className="text-danger small mt-1">{errors.contact_phone}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn btn-info btn-lg w-100 mb-4"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Registrando Asociación...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-building-check me-2"></i>
                                                Registrar Asociación
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center border-top pt-4">
                                    <p className="text-muted mb-3">¿Ya tienes cuenta o prefieres otra opción?</p>
                                    <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                                        <Link to="/login" className="btn btn-outline-primary btn-sm px-4">
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                            Iniciar Sesión
                                        </Link>
                                        <Link to="/register/user" className="btn btn-outline-success btn-sm px-4">
                                            <i className="bi bi-person-plus me-2"></i>
                                            Registrar Usuario
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

export default RegisterAssociation; 