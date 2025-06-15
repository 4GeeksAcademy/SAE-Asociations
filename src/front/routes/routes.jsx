import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../pages/Layout';
import Home from '../pages/Home';
import {Demo} from '../pages/Demo';
import {Single} from '../pages/Single';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="demo" element={<Demo />} />
        <Route path="single" element={<Single />} />
        {/* Ruta para manejar URLs no definidas */}
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;