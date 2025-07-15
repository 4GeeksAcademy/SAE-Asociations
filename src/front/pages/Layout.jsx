import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

const Layout = () => {
      const location = useLocation();

      return (
            <div className="d-flex flex-column min-vh-100">
                  <Navbar />
                  <main className="flex-grow-1 d-flex flex-column" style={{ paddingTop: '76px' }}>
                        <ScrollToTop location={location}>
                              <Outlet />
                        </ScrollToTop>
                  </main>
                  <Footer />
            </div>
      );
};

export default Layout;