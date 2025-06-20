import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>SAE Associations</h5>
            <p className="mb-0">Conectando voluntarios con asociaciones para crear impacto social.</p>
          </div>
          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <div className="d-flex flex-column">
              <span>&copy; {currentYear} SAE Associations. Todos los derechos reservados.</span>
              <div className="mt-2">
                <a href="#" className="text-white me-3">Términos</a>
                <a href="#" className="text-white me-3">Privacidad</a>
                <a href="#" className="text-white">Contacto</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;