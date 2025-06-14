import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../pages/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import RegisterUser from '../pages/RegisterUser';
import RegisterAssociation from '../pages/RegisterAssociation';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        {/* Auth Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register/user" element={<RegisterUser />} />
        <Route path="register/association" element={<RegisterAssociation />} />
        {/* Ruta para manejar URLs no definidas */}
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;