import React, { useState } from 'react';
import './Footer.css';
import OffCanvas from './OffCanvas';

const Footer = ({ onShowChange, onGalleryToggle }) => {
  const styles = [
    'muf',
    'a.del.amour',
    'blua',
    'kiosko',
    'archivo',
    'lenoir',
    'CH1MA',
  ];

  return (
    <footer className="footer">
      {styles.map((style, index) => (
        <button 
          key={index} 
          className="style-button"
        >
          {style}
        </button>
      ))}
      {/* Botón de Gallery separado y con estilo distintivo */}
      <button 
        className="style-button gallery-button"
        onClick={onGalleryToggle}
        style={{
          color: 'white',  // Temporalmente en rojo para hacerlo visible
          fontWeight: 'bold'
        }}
      >
        Gallery
      </button>
      <OffCanvas onShowChange={onShowChange} />
    </footer>
  );
};

export default Footer;