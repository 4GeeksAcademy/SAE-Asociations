import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService.js';
import NotificationModal from '../components/NotificationModal';
import useNotification from '../hooks/useNotification';
import ProfileImageUploader from '../components/ProfileImageUploader';
import '../styles/event-list.css'; // Reutilizar estilos

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

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

  // Función para verificar si hay una imagen válida
  const hasValidImage = (imageUrl) => {
    return imageUrl && imageUrl.trim() !== '';
  };

  // Función para generar la imagen de fallback
  const getFallbackImage = () => {
    const initial = user?.name?.charAt(0) || user?.email?.charAt(0) || 'U';
    return `https://placehold.co/150x150/4dabf7/ffffff?text=${initial}`;
  };

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

  const handleImageUploadSuccess = async (imageUrl, imageInfo) => {
    try {
      // Actualizar la imagen en el backend
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/api/user/profile-image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: imageUrl
        })
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('¡Imagen actualizada!', 'Tu imagen de perfil ha sido actualizada correctamente');

        // Actualizar el usuario en localStorage
        const updatedUser = { ...user, profile_image: imageUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Recargar la página para mostrar la nueva imagen
        window.location.reload();
      } else {
        const errorData = await response.json();
        showError('Error al actualizar imagen', errorData.error || 'Error al actualizar imagen de perfil');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      showError('Error de conexión', 'Hubo un problema al actualizar la imagen');
    }
  };

  const handleImageUploadError = (error) => {
    console.error('Error uploading image:', error);
    showError('Error al subir imagen', 'Error al subir la imagen de perfil. Por favor, inténtalo de nuevo.');
  };

  const submitProfile = async e => {
    e.preventDefault();
    try {
      await authService.updateProfile(profileData);
      showSuccess('¡Perfil actualizado!', 'Los cambios se han guardado correctamente');
      setEditingProfile(false);

      // Actualizar el usuario en localStorage
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
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
    <div className={`account-settings-container ${user.association ? 'association-theme' : 'volunteer-theme'}`}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="settings-card">
              <div className={`settings-header ${user.association ? 'header-association' : 'header-volunteer'}`}>
                <h2 className="settings-title">
                  <i className="bi bi-gear me-2"></i>
                  Configuración de Perfil
                </h2>
                <p className="settings-subtitle">
                  Gestiona tu información personal y configuración de cuenta
                </p>
              </div>

              <div className="profile-section">
                <div className="profile-header">
                  <div className="profile-avatar-container">
                    <ProfileImageUploader
                      onUploadSuccess={handleImageUploadSuccess}
                      onUploadError={handleImageUploadError}
                      currentImageUrl={hasValidImage(user.profile_image) ? user.profile_image : null}
                      size="large"
                      disabled={false}
                    />
                  </div>

                  <div className="profile-info">
                    <h3 className="profile-name">
                      {user.association
                        ? user.association.name
                        : `${user.name || ''} ${user.lastname || ''}`.trim() || user.email}
                    </h3>
                    <p className="profile-email">
                      <i className="bi bi-envelope me-2"></i>
                      {user.email}
                    </p>
                    {user.phone && (
                      <p className="profile-phone">
                        <i className="bi bi-telephone me-2"></i>
                        {user.phone}
                      </p>
                    )}
                    <span className={`profile-badge ${user.association ? 'badge-association' : 'badge-volunteer'}`}>
                      <i className={`bi ${user.association ? 'bi-building' : 'bi-person'} me-1`}></i>
                      {user.association ? 'Asociación' : 'Voluntario'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="settings-actions">
                <button
                  className={`action-btn ${editingProfile ? 'active' : ''} ${user.association ? 'btn-association' : 'btn-volunteer'}`}
                  onClick={() => {
                    setEditingProfile(!editingProfile);
                    if (changingPassword) setChangingPassword(false);
                  }}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Editar perfil
                </button>
                <button
                  className={`action-btn ${changingPassword ? 'active' : ''} ${user.association ? 'btn-association' : 'btn-volunteer'}`}
                  onClick={() => {
                    setChangingPassword(!changingPassword);
                    if (editingProfile) setEditingProfile(false);
                  }}
                >
                  <i className="bi bi-shield-lock me-2"></i>
                  Cambiar contraseña
                </button>
              </div>

              {/* Formulario Editar Perfil */}
              {editingProfile && (
                <div className="form-section">
                  <h4 className="form-title">
                    <i className="bi bi-person me-2"></i>
                    Información Personal
                  </h4>
                  <form onSubmit={submitProfile} className="profile-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Nombre</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Apellido</label>
                        <input
                          type="text"
                          name="lastname"
                          className="form-control"
                          value={profileData.lastname}
                          onChange={handleProfileChange}
                          placeholder="Tu apellido"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="Tu número de teléfono"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-check me-2"></i>
                        Guardar cambios
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setEditingProfile(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Formulario Cambiar Contraseña */}
              {changingPassword && (
                <div className="form-section">
                  <h4 className="form-title">
                    <i className="bi bi-shield-lock me-2"></i>
                    Cambiar Contraseña
                  </h4>
                  <form onSubmit={submitPassword} className="password-form">
                    <div className="form-group">
                      <label className="form-label">Contraseña actual</label>
                      <input
                        type="password"
                        name="current_password"
                        className="form-control"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        placeholder="Tu contraseña actual"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Nueva contraseña</label>
                        <input
                          type="password"
                          name="new_password"
                          className="form-control"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          placeholder="Nueva contraseña"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirmar nueva contraseña</label>
                        <input
                          type="password"
                          name="confirm_password"
                          className="form-control"
                          value={passwordData.confirm_password}
                          onChange={handlePasswordChange}
                          placeholder="Confirmar nueva contraseña"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        <i className="bi bi-check me-2"></i>
                        Cambiar contraseña
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setChangingPassword(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
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
