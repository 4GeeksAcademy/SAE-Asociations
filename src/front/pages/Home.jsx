import React from 'react';
import { Link } from 'react-router-dom';
import saeLogo from '../assets/img/SAE-LOGO.png';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="min-vh-100">
      {/* Hero Section */}
      <div className="py-5 bg-gradient hero-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8 text-center">
              {/* Logo */}
              <div className="mb-4 d-flex justify-content-center">
                <div className="logo-container mb-3">
                  <div className="logo-wrapper">
                    <img
                      src={saeLogo}
                      alt="SAE Logo"
                      className="logo-image"
                    />
                  </div>
                </div>
              </div>

              {/* Título y descripción */}
              <h1 className="display-4 fw-bold mb-3 text-dark fade-in">
                Uniendo Corazones y Causas
              </h1>
              <p className="lead mb-4 text-secondary fade-in-delay">
                Conectamos asociaciones con voluntarios apasionados. Juntos, creamos eventos significativos que transforman vidas y fortalecen nuestra comunidad.
              </p>

              {/* Botones de acción */}
              <div className="d-flex justify-content-center gap-4 flex-wrap fade-in-delay-2">
                <Link
                  to="/register/user"
                  className="btn btn-outline-teal btn-lg"
                >
                  <i className="bi bi-heart-fill me-2"></i>
                  Quiero ser Voluntario
                </Link>

                <Link
                  to="/register/association"
                  className="btn btn-outline-info btn-lg"
                >
                  <i className="bi bi-building me-2"></i>
                  Somos una Asociación
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-5 bg-white features-section">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {[
              {
                icon: 'calendar2-heart',
                title: 'Encuentra tu Causa',
                description: 'Explora eventos y asociaciones que se alineen con tus valores e intereses.',
                colorClass: 'primary'
              },
              {
                icon: 'people-fill',
                title: 'Únete a la Comunidad',
                description: 'Conecta con otros voluntarios y asociaciones que comparten tu pasión por ayudar.',
                colorClass: 'success'
              },
              {
                icon: 'hand-thumbs-up',
                title: 'Crea Impacto Real',
                description: 'Participa en eventos significativos y ve el cambio positivo que generas en la sociedad.',
                colorClass: 'info'
              }
            ].map((feature, index) => (
              <div key={index} className="col-12 col-md-4">
                <div className="card h-100 border-0 shadow-hover feature-card">
                  <div className="card-body text-center p-4">
                    <div className={`icon-circle bg-${feature.colorClass} bg-opacity-10 mb-4`}>
                      <i className={`bi bi-${feature.icon} text-${feature.colorClass} fs-2`}></i>
                    </div>
                    <h3 className="h4 mb-3 fw-bold">{feature.title}</h3>
                    <p className="text-muted mb-0 px-lg-3">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action - Eventos */}
      <div className="py-5 bg-light events-cta">
        <div className="container">
          <div className="row align-items-center justify-content-center text-center text-lg-start">
            <div className="col-lg-5 mb-4 mb-lg-0">
              <h2 className="display-6 fw-bold mb-3">
                Descubre Eventos Inspiradores
              </h2>
              <p className="lead text-muted mb-4">
                Explora una variedad de eventos sociales y encuentra oportunidades para marcar la diferencia en tu comunidad.
              </p>
              <Link
                to="/event/list"
                className="btn btn-primary btn-lg px-4"
              >
                <i className="bi bi-calendar-event me-2"></i>
                Ver Eventos
              </Link>
            </div>
            <div className="col-lg-5 offset-lg-1">
              <div className="p-4 rounded-4 bg-white shadow-sm text-center">
                <div className="events-illustration mb-4">
                  <i className="bi bi-search-heart text-primary display-1"></i>
                </div>
                <h4 className="fw-bold mb-3">¿Buscas voluntarios?</h4>
                <p className="text-muted mb-4">
                  Crea eventos y conecta con personas comprometidas que quieren apoyar tu causa.
                </p>
                <Link
                  to="/event/creation"
                  className="btn btn-outline-primary btn-lg px-4"
                >
                  <i className="bi bi-calendar-plus me-2"></i>
                  Crear Evento
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;