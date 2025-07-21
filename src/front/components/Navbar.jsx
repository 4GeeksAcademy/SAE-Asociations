import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import saeLogo from '../assets/img/SAE-LOGO.png';
import '../styles/navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const isExpired = authService.isTokenExpired();
      if (isExpired) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      const authenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      setIsAuthenticated(authenticated);
      setUser(currentUser);
    };

    checkAuthStatus();

    // Escuchar cambios en localStorage (de otras pestañas)
    window.addEventListener('storage', checkAuthStatus);
    // Escuchar cambios en localStorage (de la misma pestaña)
    window.addEventListener('localStorageUpdated', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('localStorageUpdated', checkAuthStatus);
    };
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  const getUserDisplayName = () => {
    if (!user) return '';
    if (user.association) return user.association.name;
    if (user.name && user.lastname) return `${user.name} ${user.lastname}`;
    if (user.name) return user.name;
    return user.email;
  };

  const getUserAvatar = () => {
    if (user?.association?.image_url) return user.association.image_url;
    if (user?.profile_image) return user.profile_image;
    if (user?.association) return 'https://placehold.co/400x400/6c757d/ffffff?text=Asociación';
    return null;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top navbar-main">
      <div className="container">
        <button
          className="navbar-toggler navbar-toggler-custom"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''} justify-content-center`} id="navbarNav">
          <ul className="navbar-nav align-items-center gap-lg-5">
            <li className="nav-item py-2 py-lg-0 me-lg-4">
              <Link className="nav-link p-0 d-flex justify-content-center" to="/" onClick={closeMenu}>
                <div className="navbar-logo">
                  <img src={saeLogo} alt="SAE Logo" />
                </div>
              </Link>
            </li>

            <li className="nav-item py-3 py-lg-0">
              <Link
                className={`nav-link-custom ${location.pathname === '/event/list' ? 'active' : ''}`}
                to="/event/list"
                onClick={closeMenu}
              >
                <i className="bi bi-calendar-event me-2"></i>
                Eventos
              </Link>
            </li>

            <li className="nav-item py-3 py-lg-0">
              <Link
                className={`nav-link-custom ${location.pathname === '/associations' ? 'active' : ''}`}
                to="/associations"
                onClick={closeMenu}
              >
                <i className="bi bi-building me-2"></i>
                Asociaciones
              </Link>
            </li>

            {!isAuthenticated ? (
              <li className="nav-item py-3 py-lg-0">
                <Link
                  className="nav-link-custom"
                  to="/login"
                  onClick={closeMenu}
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Iniciar Sesión
                </Link>
              </li>
            ) : (
              <li className="nav-item dropdown profile-dropdown">
                <button
                  className="dropdown-toggle d-flex align-items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  aria-expanded={isDropdownOpen}
                >
                  {getUserAvatar() ? (
                    <img
                      src={getUserAvatar()}
                      alt="Profile"
                      className="profile-avatar"
                    />
                  ) : (
                    <i className="bi bi-person-circle fs-4 text-white"></i>
                  )}
                  <span className="d-none d-lg-inline text-white">{getUserDisplayName()}</span>
                </button>
                <ul className={`dropdown-menu dropdown-menu-end mt-2 ${isDropdownOpen ? 'show' : ''}`}>
                  <li>
                    <Link className="dropdown-item" to="/account/settings" onClick={closeMenu}>
                      <i className="bi bi-gear me-2"></i>
                      Configuración
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;