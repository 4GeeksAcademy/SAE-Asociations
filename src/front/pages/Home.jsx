import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container py-3 py-md-5">
      {/* Hero Section */}
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 text-center">
          <h1 className="display-5 display-md-4 fw-bold mb-4">Bienvenido a SAE Associations</h1>
          <p className="lead mb-4 mb-md-5">
            Conectamos voluntarios con asociaciones para crear un impacto positivo en la comunidad.
            <span className="d-none d-md-inline"> Únete a nuestra plataforma y forma parte del cambio.</span>
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap flex-sm-nowrap">
            <Link to="/register/user" className="btn btn-primary btn-lg w-100 w-sm-auto">
              <i className="bi bi-person-plus me-2"></i>
              <span className="d-none d-sm-inline">Quiero ser </span>Voluntario
            </Link>
            <Link to="/register/association" className="btn btn-outline-primary btn-lg w-100 w-sm-auto">
              <i className="bi bi-building me-2"></i>
              <span className="d-none d-sm-inline">Soy una </span>Asociación
            </Link>
          </div>
        </div>
      </div>

      {/* Sobre Nosotros Section */}
      <div className="row mt-4 mt-md-5 mb-4 mb-md-5">
        <div className="col-12 text-center">
          <h2 className="h2 h1-md mb-3 mb-md-4">Sobre Nosotros</h2>
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8">
              <p className="lead text-muted">
                SAE Associations es una plataforma innovadora que facilita la conexión entre
                voluntarios comprometidos y asociaciones que necesitan apoyo.
                <span className="d-none d-md-inline">
                  Creemos en el poder de la colaboración para generar un impacto social positivo y duradero
                  en nuestras comunidades.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="row mt-4 mt-md-5 g-4">
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center p-3 p-md-4">
              <div className="mb-3">
                <i className="bi bi-search text-primary" style={{ fontSize: '2rem' }}></i>
              </div>
              <h3 className="card-title h5 h4-md">Encuentra tu causa</h3>
              <p className="card-text text-muted small">
                Descubre oportunidades de voluntariado que se alineen con tus intereses y habilidades.
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center p-3 p-md-4">
              <div className="mb-3">
                <i className="bi bi-people text-primary" style={{ fontSize: '2rem' }}></i>
              </div>
              <h3 className="card-title h5 h4-md">Conecta con organizaciones</h3>
              <p className="card-text text-muted small">
                Las asociaciones pueden encontrar voluntarios comprometidos con su misión.
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4 mx-auto mx-md-0">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body text-center p-3 p-md-4">
              <div className="mb-3">
                <i className="bi bi-heart text-primary" style={{ fontSize: '2rem' }}></i>
              </div>
              <h3 className="card-title h5 h4-md">Crea impacto</h3>
              <p className="card-text text-muted small">
                Juntos podemos generar un cambio positivo y duradero en nuestra comunidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;