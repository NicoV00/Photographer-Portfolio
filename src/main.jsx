import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importar el componente principal
import './index.css'; // Si tienes estilos globales, puedes incluirlos aquí

// Renderizar el componente App en el elemento con id 'root'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
