import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../pages/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import RegisterUser from '../pages/RegisterUser';
import RegisterAssociation from '../pages/RegisterAssociation';
import { EventDetail } from '../pages/EventDetail';
import { EventList } from '../pages/EventList';
import { EventCreation } from '../pages/EventCreation';
import { AssociationList } from '../pages/AssociationList';
import { AssociationDetail } from '../pages/AssociationDetail';
import DonateForm from '../pages/DonateForm';
import Donations from '../pages/Donations';
import { AccountSettings } from '../pages/AccountSettings';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />

        {/* Auth Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register/user" element={<RegisterUser />} />
        <Route path="register/association" element={<RegisterAssociation />} />

        {/* Account Routes */}
        <Route path="account/settings" element={<AccountSettings />} />

        {/* Event Routes */}
        <Route path="event/detail/:id" element={<EventDetail />} />
        <Route path="event/list" element={<EventList />} />
        <Route path="event/creation" element={<EventCreation />} />

        {/* Association Routes */}
        <Route path="associations" element={<AssociationList />} />
        <Route path="association/:id" element={<AssociationDetail />} />

        {/* Donation Routes */}
        <Route path="donations" element={<Donations />} />
        <Route path="donate/association/:id" element={<DonateForm />} />

        {/* Ruta para manejar URLs no definidas */}
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;