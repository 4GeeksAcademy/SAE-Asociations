import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/layout/ScrollToTop';

const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Outlet /> {/* Aquí se renderizan las páginas */}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Layout;