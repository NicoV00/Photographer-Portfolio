import React, { useState } from 'react';
import './Footer.css'; // Asegúrate de crear este archivo CSS
import OffCanvas from './OffCanvas';

const Footer = ({ onShowChange }) => {
  const styles = [
    'Illustration',
    'Landscape',
    'Plants',
    'Collage',
    'Archival',
    'Portraits',
    'Digital'
  ];

  return (
    <footer className="footer">
      {styles.map((style, index) => (
        <button key={index} className="style-button">
          {style}
        </button>
      ))}
      <OffCanvas onShowChange={onShowChange} />
    </footer>
  );
};

export default Footer;
