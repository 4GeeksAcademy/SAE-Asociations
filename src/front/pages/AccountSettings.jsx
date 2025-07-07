import React from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

export const AccountSettings = () => {
    const user = authService.getCurrentUser();

    if (!user) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">
                    <h4>Acceso denegado</h4>
                    <p>Debes iniciar sesión para acceder a los ajustes de cuenta.</p>
                    <Link to="/login" className="btn btn-primary">Iniciar Sesión</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="mb-0">
                                <i className="bi bi-gear me-2"></i>
                                Ajustes de cuenta
                            </h4>
                        </div>
                        <div className="card-body">
                            {/* Información actual del usuario */}
                            <div className="row mb-4">
                                <div className="col-md-3">
                                    <div className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                        <i className="bi bi-person-fill text-secondary" style={{ fontSize: '40px' }}></i>
                                    </div>
                                </div>
                                <div className="col-md-9">
                                    <h5>{user.association ? user.association.name : `${user.name || ''} ${user.lastname || ''}`.trim() || user.email}</h5>
                                    <p className="text-muted mb-1">
                                        <i className="bi bi-envelope me-2"></i>
                                        {user.email}
                                    </p>
                                    {user.phone && (
                                        <p className="text-muted mb-1">
                                            <i className="bi bi-telephone me-2"></i>
                                            {user.phone}
                                        </p>
                                    )}
                                    <span className={`badge ${user.association ? 'bg-primary' : 'bg-success'}`}>
                                        {user.association ? 'Asociación' : 'Voluntario'}
                                    </span>
                                </div>
                            </div>

                            {/* Placeholder para futuras funcionalidades */}
                            <div className="alert alert-info">
                                <h6><i className="bi bi-info-circle me-2"></i>Próximamente</h6>
                                <p className="mb-2">Esta sección está en desarrollo. Pronto podrás:</p>
                                <ul className="mb-0">
                                    <li>Editar tu perfil</li>
                                    <li>Cambiar tu contraseña</li>
                                    <li>Configurar notificaciones</li>
                                    <li>Gestionar la privacidad de tu cuenta</li>
                                    {user.association && <li>Actualizar información de la asociación</li>}
                                </ul>
                            </div>

                            {/* Botones de acción */}
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-primary" disabled>
                                    <i className="bi bi-pencil me-2"></i>
                                    Editar perfil
                                </button>
                                <button className="btn btn-outline-secondary" disabled>
                                    <i className="bi bi-shield-lock me-2"></i>
                                    Cambiar contraseña
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 
