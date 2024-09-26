import React from 'react';
import './Footer.css'; // Asegúrate de crear este archivo CSS
import OffCanvas from './OffCanvas';

const Footer = () => {
  const styles = [
    'illustration',
    'landscape',
    'plants',
    'collage',
    'archival',
    'portraits',
    'digital'
  ];

  return (
    <footer className="footer">
      {styles.map((style, index) => (
        <button key={index} className="style-button">
          {style}
        </button>
      ))}
      <OffCanvas />
    </footer>
  );
};

export default Footer;
