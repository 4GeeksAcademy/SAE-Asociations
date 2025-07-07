import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import useGlobalReducer from '../hooks/useGlobalReducer';
import ProfileImageUploader from '../components/ProfileImageUploader';

const RegisterUser = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    // Limpiar mensaje al desmontar el componente
    useEffect(() => {
        return () => dispatch({ type: 'CLEAR_MESSAGE' });
    }, [dispatch]);

    // Estado del formulario
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        profile_image: '',
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

    // Manejar subida exitosa de imagen
    const handleImageUploadSuccess = (imageUrl, uploadInfo) => {
        console.log('Imagen de perfil subida exitosamente:', imageUrl);
        setFormData(prev => ({
            ...prev,
            profile_image: imageUrl
        }));
    };

    // Manejar error en subida de imagen
    const handleImageUploadError = (error) => {
        console.error('Error al subir imagen de perfil:', error);
        dispatch({
            type: 'SET_MESSAGE',
            payload: { text: 'Error al subir la imagen de perfil. Puedes continuar sin imagen.', type: 'warning' }
        });
    };

    // Validaciones del formulario
    const validateForm = () => {
        const newErrors = {};

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
            const response = await authService.registerUser(formData);

            dispatch({
                type: 'SET_MESSAGE',
                payload: { text: 'Usuario registrado exitosamente. Redirigiendo al login...', type: 'success' }
            });

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Error en registro:', error);

            let errorMessage = 'No pudimos procesar tu registro en este momento. Por favor, inténtalo de nuevo en unos minutos.';

            // Manejar diferentes tipos de errores
            if (error.message) {
                if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
                    errorMessage = 'No pudimos conectar con el servidor. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
                } else if (error.message.includes('Email already registered') || error.message.includes('ya está registrado')) {
                    errorMessage = 'Este email ya está registrado. ¿Quieres iniciar sesión en su lugar?';
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
                <div className="col-12 col-sm-10 col-md-8 col-lg-7 col-xl-6">
                    <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-header bg-success text-white text-center py-4 rounded-top-4">
                            <h2 className="mb-0 fw-bold">
                                <i className="bi bi-person-plus me-2"></i>
                                Registro de Voluntario
                            </h2>
                            <p className="mb-0 mt-2 opacity-90">Únete a nuestra comunidad</p>
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

                            {/* Imagen de Perfil */}
                            <div className="text-center mb-4">
                                <div className="d-flex justify-content-center mb-2">
                                    <ProfileImageUploader
                                        onUploadSuccess={handleImageUploadSuccess}
                                        onUploadError={handleImageUploadError}
                                        currentImageUrl={formData.profile_image}
                                        size="large"
                                        disabled={store.isLoading}
                                    />
                                </div>
                                <small className="text-muted">Imagen de perfil (opcional)</small>
                            </div>

                            <form onSubmit={handleSubmit}>
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
                                            <i className="bi bi-telephone me-1"></i>Teléfono
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
                                        />
                                        {errors.confirmPassword && (
                                            <div className="text-danger small mt-1">{errors.confirmPassword}</div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success w-100 py-2 fw-semibold"
                                    disabled={store.isLoading}
                                >
                                    {store.isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Registrando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-person-check me-2"></i>
                                            Registrarse
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

export default RegisterUser; 