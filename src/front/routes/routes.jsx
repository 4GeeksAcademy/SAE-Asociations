import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
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
import DonationSuccess from '../pages/DonationSuccess';
import DonationCancel from '../pages/DonationCancel';
import { AccountSettings } from '../pages/AccountSettings';
<<<<<<< HEAD
import AuthValidator from '../components/AuthValidator';
import { ForgotPassword } from '../components/ForgotPassword';
import { ResetPassword } from '../components/ResetPassword';
=======
import { ForgotPassword } from '../components/ForgotPassword';
import { ResetPassword } from '../components/ResetPassword';

>>>>>>> origin/develop

const ProtectedLayout = () => (
  <AuthValidator>
    <Layout />
  </AuthValidator>
);

<<<<<<< HEAD
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  },
  routes: [
    {
      path: "/",
      element: <ProtectedLayout />,
      children: [
        {
          index: true,
          element: <Home />
        },
        {
          path: "login",
          element: <Login />
        },
        {
          path: "register/user",
          element: <RegisterUser />
        },
        {
          path: "register/association",
          element: <RegisterAssociation />
        },
        // Password Recovery Routes
        {
          path: "forgot-password",
          element: <ForgotPassword />
        },
        {
          path: "reset-password/:token",
          element: <ResetPassword />
        },
        {
          path: "account/settings",
          element: <AccountSettings />
        },
        {
          path: "event/detail/:id",
          element: <EventDetail />
        },
        {
          path: "event/list",
          element: <EventList />
        },
        {
          path: "event/list/:association_id",
          element: <EventList />
        },
        {
          path: "event/creation",
          element: <EventCreation />
        },
        {
          path: "associations",
          element: <AssociationList />
        },
        {
          path: "association/:id",
          element: <AssociationDetail />
        },
        {
          path: "donations",
          element: <Donations />
        },
        {
          path: "donate/association/:id",
          element: <DonateForm />
        },
        {
          path: "donation-success",
          element: <DonationSuccess />
        },
        {
          path: "donation-cancel",
          element: <DonationCancel />
        },
        {
          path: "*",
          element: <Home />
        }
      ]
    }
  ]
=======
        {/* Auth Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register/user" element={<RegisterUser />} />
        <Route path="register/association" element={<RegisterAssociation />} />

        {/* Password recovery */}
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />

        {/* Account Routes */}
        <Route path="account/settings" element={<AccountSettings />} />

        {/* Event Routes */}
        <Route path="event/detail/:id" element={<EventDetail />} />
        <Route path="event/list" element={<EventList />} />
        <Route path="event/list/:association_id" element={<EventList />} />
        <Route path="event/creation" element={<EventCreation />} />

        {/* Association Routes */}
        <Route path="associations" element={<AssociationList />} />
        <Route path="association/:id" element={<AssociationDetail />} />

        {/* Donation Routes */}
        <Route path="donations" element={<Donations />} />
        <Route path="donate/association/:id" element={<DonateForm />} />
        <Route path="donation-success" element={<DonationSuccess />} />
        <Route path="donation-cancel" element={<DonationCancel />} />

        {/* Ruta para manejar URLs no definidas */}
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
>>>>>>> origin/develop
};

export const router = createBrowserRouter(routerConfig.routes, routerConfig);