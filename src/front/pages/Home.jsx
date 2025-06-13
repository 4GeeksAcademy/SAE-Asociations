import React from 'react';

const Home = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 text-center">
          <h1 className="display-4 fw-bold mb-4">Bienvenido a Alfa Associations</h1>
          <p className="lead mb-5">
            Conectamos voluntarios con asociaciones para crear un impacto positivo en la comunidad.
          </p>
          
          <div className="d-flex justify-content-center gap-3">
            <a href="/registro-voluntario" className="btn btn-primary btn-lg">
              Quiero ser Voluntario
            </a>
            <a href="/registro-asociacion" className="btn btn-outline-primary btn-lg">
              Soy una Asociación
            </a>
          </div>
        </div>
      </div>
      
      <div className="row mt-5">
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="card-title">Encuentra tu causa</h3>
              <p className="card-text">
                Descubre oportunidades de voluntariado que se alineen con tus intereses y habilidades.
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="card-title">Conecta con organizaciones</h3>
              <p className="card-text">
                Las asociaciones pueden encontrar voluntarios comprometidos con su misión.
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="card-title">Crea impacto</h3>
              <p className="card-text">
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