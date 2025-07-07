import React from "react";
import { Link } from "react-router-dom";
import '../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer-main">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
            <h5 className="footer-title">SAE Asociaciones</h5>
            <p className="footer-subtitle">
              Uniendo corazones y causas
            </p>
          </div>

          <div className="col-md-4 text-center mb-3 mb-md-0">
            <div className="d-flex justify-content-center gap-3 social-links">
              <a href="#" aria-label="Facebook">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" aria-label="Twitter">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="#" aria-label="Instagram">
                <i className="bi bi-instagram fs-5"></i>
              </a>
            </div>
          </div>

          <div className="col-md-4 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3">
              <Link to="/privacy" className="footer-nav-link">
                Privacidad
              </Link>
              <Link to="/terms" className="footer-nav-link">
                Términos
              </Link>
              <Link to="/contact" className="footer-nav-link">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;