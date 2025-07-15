import React from 'react';
import { Link } from 'react-router-dom';
import saeLogo from '../assets/img/SAE-LOGO.png';
import '../styles/home.css';

const features = [
  {
    icon: 'bi-people-fill',
    title: 'Impacto real',
    description: '+500 voluntarios han participado en eventos solidarios.'
  },
  {
    icon: 'bi-chat-quote',
    title: 'Testimonio',
    description: '“Gracias a la plataforma, encontramos voluntarios increíbles para nuestro evento.” — Asociación XYZ'
  },
  {
    icon: 'bi-list-check',
    title: 'Cómo funciona',
    description: 'Regístrate, elige tu causa y empieza a ayudar en minutos.'
  }
];

const communityAvatars = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/65.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/12.jpg',
  'https://randomuser.me/api/portraits/women/25.jpg',
];

const heroBubbles = [
  // Izquierda del título: Playa
  { src: 'https://plus.unsplash.com/premium_photo-1663126366512-62a1e0494bad?q=80&w=3243&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', className: 'bubble bubble-hero bubble-left', style: { top: '120px', left: 'calc(50% - 320px)', zIndex: 1, opacity: 0.8, width: '80px', height: '80px' } },
  // Derecha del título: Recogida de alimentos
  { src: 'https://images.unsplash.com/photo-1557660559-42497f78035b?q=80&w=1892&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', className: 'bubble bubble-hero bubble-right', style: { top: '120px', left: 'calc(50% + 250px)', zIndex: 1, opacity: 0.8, width: '80px', height: '80px' } },
  // Arriba izquierda del título: Ayuda a los necesitados (alternativa Unsplash)
  { src: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', className: 'bubble bubble-hero bubble-topleft', style: { top: '70px', left: 'calc(50% - 180px)', zIndex: 1, opacity: 0.7, width: '60px', height: '60px' } },
  // Arriba derecha del título: Voluntariado en grupo
  { src: 'https://plus.unsplash.com/premium_photo-1681140560555-2a054c898b66?q=80&w=3271&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', className: 'bubble bubble-hero bubble-topright', style: { top: '70px', left: 'calc(50% + 120px)', zIndex: 1, opacity: 0.7, width: '60px', height: '60px' } },
];

const Home = () => {
  return (
    <div className="min-vh-100">
      {/* Hero Section */}
      <div className="py-5 bg-gradient hero-section position-relative" style={{ overflow: 'visible' }}>
        {/* Burbujas decorativas */}
        {heroBubbles.map((bubble, idx) => (
          <img
            key={idx}
            src={bubble.src}
            alt="Decoración evento"
            className={bubble.className}
            aria-hidden="true"
            style={bubble.style}
          />
        ))}
        <div className="container position-relative" style={{ zIndex: 2 }}>
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
                  className="btn btn-outline-volunteer btn-lg"
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

      {/* Fila de avatares de la comunidad mejor integrada */}
      <div className="container">
        <div className="community-avatars-integrated d-flex align-items-center justify-content-center">
          {communityAvatars.map((url, idx) => (
            <img src={url} alt={`Voluntario ${idx + 1}`} className="avatar-img-integrated" key={idx} />
          ))}
          <div className="avatar-img-integrated avatar-plus">
            <i className="bi bi-people-fill"></i>
          </div>
          <span className="ms-3 text-secondary fw-bold">Únete a nuestra comunidad</span>
        </div>
      </div>

      {/* Bloque de tarjetas sobrias y profesionales */}
      <div className="py-5 bg-white">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {features.map((feature, idx) => (
              <div key={idx} className="col-12 col-md-4">
                <div className="card h-100 border-0 shadow-sm feature-card p-4 text-center">
                  <div className="mb-3">
                    <i className={`bi ${feature.icon} text-primary`} style={{ fontSize: '2.5rem' }}></i>
                  </div>
                  <h3 className="h5 mb-2 fw-bold">{feature.title}</h3>
                  <p className="text-muted mb-0">{feature.description}</p>
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