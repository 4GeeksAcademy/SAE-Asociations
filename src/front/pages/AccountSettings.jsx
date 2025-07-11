import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService.js';
import NotificationModal from '../components/NotificationModal';
import useNotification from '../hooks/useNotification';

export const AccountSettings = () => {
  const user = authService.getCurrentUser();
  const { notification, hideNotification, showSuccess, showError } = useNotification();

  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    lastname: user?.lastname || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

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

  const handleProfileChange = e => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = e => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const submitProfile = async e => {
    e.preventDefault();
    try {
      await authService.updateProfile(profileData);
      showSuccess('¡Perfil actualizado!', 'Los cambios se han guardado correctamente');
      setEditingProfile(false);
      // Opcional: refrescar token / localStorage
    } catch (err) {
      showError('Error al actualizar', err.response?.data?.msg || 'Error al actualizar perfil');
    }
  };

  const submitPassword = async e => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      return showError('Contraseñas no coinciden', 'La nueva contraseña y su confirmación no coinciden');
    }
    try {
      await authService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      showSuccess('¡Contraseña cambiada!', 'Tu contraseña ha sido actualizada correctamente');
      setChangingPassword(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      showError('Error al cambiar contraseña', err.response?.data?.error || 'Error al cambiar contraseña');
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">
                <i className="bi bi-gear me-2"></i> Ajustes de cuenta
              </h4>
            </div>
            <div className="card-body-user">
              {/* --- Info del usuario --- */}
              <div className="row mb-4">
                <div className="col-md-3 text-center">
                  <div
                    className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto"
                  >
                    <i className="bi bi-person-fill text-secondary"></i>
                  </div>
                </div>
                <div className="col-md-9">
                  <h5>
                    {user.association
                      ? user.association.name
                      : `${user.name || ''} ${user.lastname || ''}`.trim() || user.email}
                  </h5>
                  <p className="text-muted mb-1">
                    <i className="bi bi-envelope me-2"></i> {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-muted mb-1">
                      <i className="bi bi-telephone me-2"></i> {user.phone}
                    </p>
                  )}
                  <span className={`badge ${user.association ? 'bg-primary' : 'bg-success'}`}>
                    {user.association ? 'Asociación' : 'Voluntario'}
                  </span>
                </div>
              </div>

              {/* --- Botones de acción --- */}
              <div className="d-flex gap-2 mb-4">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setEditingProfile(!editingProfile);
                    if (changingPassword) setChangingPassword(false);
                  }}
                >
                  <i className="bi bi-pencil me-2"></i> Editar perfil
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setChangingPassword(!changingPassword);
                    if (editingProfile) setEditingProfile(false);
                  }}
                >
                  <i className="bi bi-shield-lock me-2"></i> Cambiar contraseña
                </button>
              </div>

              {/* --- Formulario Editar Perfil --- */}
              {editingProfile && (
                <form onSubmit={submitProfile} className="mb-4">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={profileData.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Apellido</label>
                    <input
                      type="text"
                      name="lastname"
                      className="form-control"
                      value={profileData.lastname}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Guardar cambios
                  </button>
                </form>
              )}

              {/* --- Formulario Cambiar Contraseña --- */}
              {changingPassword && (
                <form onSubmit={submitPassword}>
                  <div className="mb-3">
                    <label className="form-label">Contraseña actual</label>
                    <input
                      type="password"
                      name="current_password"
                      className="form-control"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nueva contraseña</label>
                    <input
                      type="password"
                      name="new_password"
                      className="form-control"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirmar nueva contraseña</label>
                    <input
                      type="password"
                      name="confirm_password"
                      className="form-control"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Cambiar contraseña
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>

      <NotificationModal
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
        onConfirm={notification.onConfirm}
        showCancel={notification.showCancel}
      />
    </div>
  );
};
