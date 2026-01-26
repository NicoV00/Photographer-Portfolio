import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Importar el componente principal
import './index.css'; // Si tienes estilos globales, puedes incluirlos aquí

// Renderizar el componente App en el elemento con id 'root'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
