import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import useGlobalReducer from '../hooks/useGlobalReducer';
import ProfileImageUploader from '../components/ProfileImageUploader';

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
        image_url: '',
        // Nuevos campos de redes sociales
        website_url: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
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

    // Manejar subida exitosa de imagen de la asociación
    const handleAssociationImageUploadSuccess = (imageUrl, uploadInfo) => {
        // Logo subido exitosamente
        setFormData(prev => ({
            ...prev,
            image_url: imageUrl
        }));
    };

    // Manejar error en subida de imagen
    const handleImageUploadError = (error) => {
        console.error('Error al subir imagen:', error);
        dispatch({
            type: 'SET_MESSAGE',
            payload: { text: 'Error al subir la imagen. Puedes continuar sin imagen.', type: 'warning' }
        });
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
        } else if (!/^(\+34)?[6789]\d{8}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
            newErrors.phone = 'El teléfono no es válido (ejemplo: 612345678 o +34612345678)';
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
        } else if (formData.description.length > 2000) {
            newErrors.description = 'La descripción debe tener máximo 2000 caracteres';
        }

        if (!formData.cif.trim()) {
            newErrors.cif = 'El CIF es obligatorio';
        } else if (formData.cif.length > 30) {
            newErrors.cif = 'El CIF debe tener máximo 30 caracteres';
        } else if (!/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/i.test(formData.cif.trim())) {
            newErrors.cif = 'El CIF no es válido (ejemplo: A12345674)';
        }

        if (!formData.contact_email.trim()) {
            newErrors.contact_email = 'El email de contacto es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
            newErrors.contact_email = 'Por favor, introduce un email de contacto válido';
        } else if (formData.contact_email.length > 120) {
            newErrors.contact_email = 'El email de contacto debe tener máximo 120 caracteres';
        }

        if (!formData.contact_phone.trim()) {
            newErrors.contact_phone = 'El teléfono de contacto es obligatorio';
        } else if (!/^(\+34)?[6789]\d{8}$/.test(formData.contact_phone.replace(/[\s\-\(\)]/g, ''))) {
            newErrors.contact_phone = 'El teléfono de contacto no es válido (ejemplo: 612345678 o +34612345678)';
        }

        // Validar URLs opcionales
        if (formData.website_url && formData.website_url.trim()) {
            if (!formData.website_url.match(/^https?:\/\/.+/)) {
                newErrors.website_url = 'La URL del sitio web no es válida (debe empezar con http:// o https://)';
            } else if (formData.website_url.length > 200) {
                newErrors.website_url = 'La URL del sitio web debe tener máximo 200 caracteres';
            }
        }

        if (formData.facebook_url && formData.facebook_url.trim()) {
            if (!formData.facebook_url.match(/^https?:\/\/.+/)) {
                newErrors.facebook_url = 'La URL de Facebook no es válida (debe empezar con http:// o https://)';
            } else if (formData.facebook_url.length > 200) {
                newErrors.facebook_url = 'La URL de Facebook debe tener máximo 200 caracteres';
            }
        }

        if (formData.instagram_url && formData.instagram_url.trim()) {
            if (!formData.instagram_url.match(/^https?:\/\/.+/)) {
                newErrors.instagram_url = 'La URL de Instagram no es válida (debe empezar con http:// o https://)';
            } else if (formData.instagram_url.length > 200) {
                newErrors.instagram_url = 'La URL de Instagram debe tener máximo 200 caracteres';
            }
        }

        if (formData.twitter_url && formData.twitter_url.trim()) {
            if (!formData.twitter_url.match(/^https?:\/\/.+/)) {
                newErrors.twitter_url = 'La URL de Twitter/X no es válida (debe empezar con http:// o https://)';
            } else if (formData.twitter_url.length > 200) {
                newErrors.twitter_url = 'La URL de Twitter/X debe tener máximo 200 caracteres';
            }
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
                    <div className="card border-0 rounded-4 auth-card">
                        <div className="card-header text-white text-center py-4 rounded-top-4"
                            style={{
                                background: `linear-gradient(135deg, var(--sae-association), var(--sae-association-dark))`
                            }}>
                            <h2 className="mb-0 fw-bold">
                                <i className="bi bi-building me-2"></i>
                                Registro de Asociación
                            </h2>
                            <p className="mb-0 mt-2 text-white">Registra tu organización</p>
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
                                <div className="alert alert-info mb-4">
                                    <i className="bi bi-info-circle me-2"></i>
                                    <strong>Información importante:</strong> Necesitamos tanto los datos del representante como de la asociación para completar el registro.
                                </div>

                                {/* Logo de la Asociación */}
                                <div className="text-center mb-4">
                                    <div className="d-flex justify-content-center mb-2">
                                        <ProfileImageUploader
                                            onUploadSuccess={handleAssociationImageUploadSuccess}
                                            onUploadError={handleImageUploadError}
                                            currentImageUrl={formData.image_url}
                                            size="large"
                                            disabled={store.isLoading}
                                        />
                                    </div>
                                    <small className="text-muted">Logo de la asociación (opcional)</small>
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
                                                autoComplete="given-name"
                                            />
                                            {errors.name && (
                                                <div className="text-danger small mt-1">{errors.name}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="lastname" className="form-label fw-semibold">
                                                <i className="bi bi-person me-1"></i>Apellidos
                                            </label>
                                            <input
                                                type="text"
                                                name="lastname"
                                                id="lastname"
                                                className={`form-control ${errors.lastname ? 'is-invalid' : ''}`}
                                                placeholder="Tus apellidos"
                                                value={formData.lastname}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                                autoComplete="family-name"
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
                                                placeholder="tu.email@ejemplo.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                                autoComplete="email"
                                            />
                                            {errors.email && (
                                                <div className="text-danger small mt-1">{errors.email}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="phone" className="form-label fw-semibold">
                                                <i className="bi bi-telephone me-1"></i>Teléfono
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                id="phone"
                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                placeholder="Ejemplo: 612345678"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                                autoComplete="tel"
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
                                                autoComplete="new-password"
                                            />
                                            {errors.password && (
                                                <div className="text-danger small mt-1">{errors.password}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-4">
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
                                                autoComplete="new-password"
                                            />
                                            {errors.confirmPassword && (
                                                <div className="text-danger small mt-1">{errors.confirmPassword}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Datos de la Asociación */}
                                <div className="mb-4">
                                    <h4 className="text-primary mb-3 h5 h4-md">
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
                                                placeholder="Ejemplo: A12345674"
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
                                                disabled={store.isLoading}
                                                autoComplete="email"
                                            />
                                            {errors.contact_email && (
                                                <div className="text-danger small mt-1">{errors.contact_email}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-4">
                                            <label htmlFor="contact_phone" className="form-label fw-semibold">
                                                <i className="bi bi-telephone me-1"></i>Teléfono de Contacto
                                            </label>
                                            <input
                                                type="tel"
                                                name="contact_phone"
                                                id="contact_phone"
                                                className={`form-control ${errors.contact_phone ? 'is-invalid' : ''}`}
                                                placeholder="Ejemplo: 612345678"
                                                value={formData.contact_phone}
                                                onChange={handleChange}
                                                disabled={store.isLoading}
                                                autoComplete="tel"
                                            />
                                            {errors.contact_phone && (
                                                <div className="text-danger small mt-1">{errors.contact_phone}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Redes Sociales y Sitio Web */}
                                    <div className="mb-4">
                                        <h5 className="text-secondary mb-3">
                                            <i className="bi bi-share me-2"></i>
                                            Redes Sociales y Sitio Web <span className="text-muted small">(opcional)</span>
                                        </h5>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="website_url" className="form-label fw-semibold">
                                                    <i className="bi bi-globe me-1"></i>Sitio Web
                                                </label>
                                                <input
                                                    type="url"
                                                    name="website_url"
                                                    id="website_url"
                                                    className={`form-control ${errors.website_url ? 'is-invalid' : ''}`}
                                                    placeholder="https://www.asociacion.com"
                                                    value={formData.website_url}
                                                    onChange={handleChange}
                                                    disabled={store.isLoading}
                                                />
                                                {errors.website_url && (
                                                    <div className="text-danger small mt-1">{errors.website_url}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="facebook_url" className="form-label fw-semibold">
                                                    <i className="bi bi-facebook me-1"></i>Facebook
                                                </label>
                                                <input
                                                    type="url"
                                                    name="facebook_url"
                                                    id="facebook_url"
                                                    className={`form-control ${errors.facebook_url ? 'is-invalid' : ''}`}
                                                    placeholder="https://www.facebook.com/asociacion"
                                                    value={formData.facebook_url}
                                                    onChange={handleChange}
                                                    disabled={store.isLoading}
                                                />
                                                {errors.facebook_url && (
                                                    <div className="text-danger small mt-1">{errors.facebook_url}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="instagram_url" className="form-label fw-semibold">
                                                    <i className="bi bi-instagram me-1"></i>Instagram
                                                </label>
                                                <input
                                                    type="url"
                                                    name="instagram_url"
                                                    id="instagram_url"
                                                    className={`form-control ${errors.instagram_url ? 'is-invalid' : ''}`}
                                                    placeholder="https://www.instagram.com/asociacion"
                                                    value={formData.instagram_url}
                                                    onChange={handleChange}
                                                    disabled={store.isLoading}
                                                />
                                                {errors.instagram_url && (
                                                    <div className="text-danger small mt-1">{errors.instagram_url}</div>
                                                )}
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="twitter_url" className="form-label fw-semibold">
                                                    <i className="bi bi-twitter-x me-1"></i>Twitter/X
                                                </label>
                                                <input
                                                    type="url"
                                                    name="twitter_url"
                                                    id="twitter_url"
                                                    className={`form-control ${errors.twitter_url ? 'is-invalid' : ''}`}
                                                    placeholder="https://www.twitter.com/asociacion"
                                                    value={formData.twitter_url}
                                                    onChange={handleChange}
                                                    disabled={store.isLoading}
                                                />
                                                {errors.twitter_url && (
                                                    <div className="text-danger small mt-1">{errors.twitter_url}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-association w-100 py-2 fw-semibold"
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