import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();

      setIsAuthenticated(authenticated);
      setUser(currentUser);
    };

    // Check initial auth status
    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check on navigation changes
    checkAuthStatus();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  const getUserDisplayName = () => {
    if (!user) return '';

    // Si es una asociación, mostrar el nombre de la asociación
    if (user.association) {
      return user.association.name;
    }

    // Si es un usuario normal, mostrar nombre + apellido o email
    if (user.name && user.lastname) {
      return `${user.name} ${user.lastname}`;
    } else if (user.name) {
      return user.name;
    } else {
      return user.email;
    }
  };

  const getUserAvatar = () => {
    // Por ahora retornamos null, más adelante se puede implementar con imagen
    if (user?.profile_image) {
      return user.profile_image;
    }
    return null;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-heart-fill text-danger me-2"></i>
          SAE Associations
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                to="/"
              >
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/event/list' ? 'active' : ''}`}
                to="/event/list"
              >
                Eventos
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/associations' ? 'active' : ''}`}
                to="/associations"
              >
                Asociaciones
              </Link>
            </li>

            {/* Donaciones - solo si está autenticado */}
            {isAuthenticated && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${location.pathname === '/donations' ? 'active' : ''}`}
                  to="/donations"
                >
                  Donaciones
                </Link>
              </li>
            )}
            <li className="nav-item ms-2">
              {!isAuthenticated ? (
                // No autenticado - mostrar botón de login
                <Link className="btn btn-outline-light" to="/login">
                  Iniciar Sesión
                </Link>
              ) : (
                // Autenticado - mostrar dropdown de usuario
                <div className="dropdown">
                  <button
                    className="btn btn-outline-light dropdown-toggle d-flex align-items-center"
                    type="button"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {getUserAvatar() ? (
                      <img
                        src={getUserAvatar()}
                        alt="Avatar"
                        className="rounded-circle me-2"
                        width="24"
                        height="24"
                      />
                    ) : (
                      <div className="bg-secondary rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                        <i className="bi bi-person-fill text-white" style={{ fontSize: '14px' }}></i>
                      </div>
                    )}
                    <span className="d-none d-md-inline text-truncate" style={{ maxWidth: '120px' }}>
                      {getUserDisplayName()}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li>
                      <h6 className="dropdown-header d-md-none">
                        {getUserDisplayName()}
                      </h6>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/account/settings">
                        <i className="bi bi-gear me-2"></i>
                        Ajustes de cuenta
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;