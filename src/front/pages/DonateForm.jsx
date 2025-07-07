import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

const DonateForm = () => {
    const { id } = useParams(); // ID de la asociación
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        amount: '',
        description: ''
    });

    const [association, setAssociation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchAssociation();
        }
    }, [id]);

    const fetchAssociation = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/associations/${id}`);
            const data = await response.json();
            if (data.success) {
                setAssociation(data.association);
            } else {
                setError('Asociación no encontrada');
            }
        } catch (error) {
            console.error('Error fetching association:', error);
            setError('Error al cargar la asociación');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!authService.isAuthenticated()) {
            setError('Debes iniciar sesión para hacer una donación');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Obtener la URL base del frontend automáticamente
            const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

            const donationData = {
                amount: parseFloat(formData.amount),
                association_id: parseInt(id),
                description: formData.description || 'Donación directa a la asociación',
                success_url: `${frontendUrl}/donation-success`,
                cancel_url: `${frontendUrl}/donation-cancel`
            };

            const response = await fetch(`${API_BASE_URL}/api/donations/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify(donationData)
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = data.checkout_url;
            } else {
                setError(data.error || 'Error al crear la donación');
            }

        } catch (error) {
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!association && !error) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-3 py-md-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">

                    {/* Header */}
                    <div className="text-center mb-4">
                        <i className="bi bi-heart-fill text-primary" style={{ fontSize: '3rem' }}></i>
                        <h1 className="h2 mt-3 mb-2">Donar a {association?.name}</h1>
                        <p className="text-muted">
                            Apoya directamente a esta asociación para sus necesidades y proyectos
                        </p>
                    </div>

                    {/* Info de la asociación */}
                    {association && (
                        <div className="card bg-light mb-4">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-building text-primary me-3" style={{ fontSize: '2rem' }}></i>
                                    <div>
                                        <h5 className="mb-1">{association.name}</h5>
                                        <p className="text-muted small mb-0">{association.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <div className="card shadow-sm">
                        <div className="card-body p-4">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                {/* Monto */}
                                <div className="mb-3">
                                    <label htmlFor="amount" className="form-label">
                                        <i className="bi bi-currency-euro me-2"></i>
                                        Monto de la donación *
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">€</span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="amount"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            min="1"
                                            max="10000"
                                            step="0.01"
                                            required
                                            placeholder="25.00"
                                        />
                                    </div>
                                    <div className="form-text">Mínimo €1, máximo €10,000</div>
                                </div>

                                {/* Descripción */}
                                <div className="mb-4">
                                    <label htmlFor="description" className="form-label">
                                        <i className="bi bi-chat-left-text me-2"></i>
                                        Mensaje personal (opcional)
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        maxLength="500"
                                        placeholder="Escribe un mensaje de apoyo o la razón de tu donación..."
                                    />
                                    <div className="form-text">{formData.description.length}/500 caracteres</div>
                                </div>

                                {/* Botones */}
                                <div className="d-flex gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary flex-fill"
                                        onClick={() => navigate(`/association/${id}`)}
                                        disabled={loading}
                                    >
                                        Volver
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-fill"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-heart-fill me-2"></i>
                                                Donar €{formData.amount || '0'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Info de seguridad */}
                    <div className="text-center mt-4">
                        <small className="text-muted">
                            <i className="bi bi-shield-check me-1"></i>
                            Pagos seguros procesados por Stripe
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonateForm; 