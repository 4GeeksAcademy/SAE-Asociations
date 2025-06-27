import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AssociationCard } from "../components/AssociationCard.jsx";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

export const AssociationList = () => {
    const [associations, setAssociations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getAssociations = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/associations/`);
            const data = await res.json();

            if (data.success) {
                setAssociations(data.associations || []);
            } else {
                setError('Error al cargar las asociaciones');
            }
        } catch (error) {
            console.error("Error fetching associations:", error);
            setError('Error de conexión al cargar las asociaciones');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAssociations();
    }, []);

    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="container mt-4 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando asociaciones...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Asociaciones</h2>
                    <p className="text-muted">Descubre las asociaciones que están marcando la diferencia</p>
                </div>
                <button
                    className="btn btn-success"
                    onClick={() => navigate("/register/association")}
                >
                    <i className="bi bi-plus-lg me-2"></i>
                    Crear asociación
                </button>
            </div>

            {/* Stats */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <h3 className="mb-0">{associations.length}</h3>
                            <small>Asociaciones registradas</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de asociaciones */}
            {associations.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-building" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                    <h4 className="mt-3 text-muted">No hay asociaciones registradas</h4>
                    <p className="text-muted">Sé el primero en registrar una asociación</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/register/association")}
                    >
                        Registrar asociación
                    </button>
                </div>
            ) : (
                <div className="row g-4">
                    {associations.map(association => (
                        <div className="col-md-4" key={association.id}>
                            <AssociationCard association={association} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 