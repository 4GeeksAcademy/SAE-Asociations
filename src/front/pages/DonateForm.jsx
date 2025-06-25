import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGlobalReducer from '../hooks/useGlobalReducer';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

const DonateForm = () => {
    const { type } = useParams(); // "association" o "event"
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    const [formData, setFormData] = useState({
        amount: '',
        association_id: '',
        event_id: '',
        description: ''
    });

    const [associations, setAssociations] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAssociations();
        fetchEvents();
    }, []);

    const fetchAssociations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/associations/`);
            const data = await response.json();
            if (data.success) {
                setAssociations(data.associations || []);
            }
        } catch (error) {
            console.error('Error fetching associations:', error);
            setAssociations([]);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/`);
            const data = await response.json();
            if (data.success) {
                setEvents(data.events || []);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            setEvents([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!store.token) {
            setError('Debes iniciar sesión para hacer una donación');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const donationData = {
                amount: parseFloat(formData.amount),
                association_id: parseInt(formData.association_id),
                description: formData.description || `Donación ${type === 'event' ? 'para evento' : 'directa'}`
            };

            if (type === 'event' && formData.event_id) {
                donationData.event_id = parseInt(formData.event_id);
            }

            const response = await fetch(`${API_BASE_URL}/api/donations/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${store.token}`
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

    const isEventDonation = type === 'event';
    const title = isEventDonation ? 'Donar a un Evento' : 'Donar a una Asociación';
    const icon = isEventDonation ? 'bi-calendar-event' : 'bi-building';

    return (
        <div className="container py-3 py-md-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">

                    {/* Header */}
                    <div className="text-center mb-4">
                        <i className={`${icon} text-primary`} style={{ fontSize: '3rem' }}></i>
                        <h1 className="h2 mt-3 mb-2">{title}</h1>
                        <p className="text-muted">
                            {isEventDonation
                                ? 'Contribuye a un evento específico organizado por una asociación'
                                : 'Apoya directamente a una asociación para sus necesidades generales'
                            }
                        </p>
                    </div>

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

                                {/* Asociación */}
                                <div className="mb-3">
                                    <label htmlFor="association_id" className="form-label">
                                        <i className="bi bi-building me-2"></i>
                                        Asociación {isEventDonation ? 'organizadora' : 'destinataria'} *
                                    </label>
                                    <select
                                        className="form-select"
                                        id="association_id"
                                        name="association_id"
                                        value={formData.association_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Selecciona una asociación</option>
                                        {associations.map(association => (
                                            <option key={association.id} value={association.id}>
                                                {association.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Evento (solo si es donación por evento) */}
                                {isEventDonation && (
                                    <div className="mb-3">
                                        <label htmlFor="event_id" className="form-label">
                                            <i className="bi bi-calendar-event me-2"></i>
                                            Evento específico *
                                        </label>
                                        <select
                                            className="form-select"
                                            id="event_id"
                                            name="event_id"
                                            value={formData.event_id}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Selecciona un evento</option>
                                            {events
                                                .filter(event => !formData.association_id || event.association_id == formData.association_id)
                                                .map(event => (
                                                    <option key={event.id} value={event.id}>
                                                        {event.title}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        <div className="form-text">
                                            {!formData.association_id
                                                ? 'Primero selecciona una asociación'
                                                : 'Eventos de la asociación seleccionada'
                                            }
                                        </div>
                                    </div>
                                )}

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
                                        onClick={() => navigate('/donations')}
                                        disabled={loading}
                                    >
                                        Cancelar
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