import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/routes';
import { StoreProvider } from './hooks/useGlobalReducer';
import './styles/index.css';

// Importar Bootstrap JavaScript
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <StoreProvider>
            <BrowserRouter>
                <AppRouter />
            </BrowserRouter>
        </StoreProvider>
    </React.StrictMode>
);