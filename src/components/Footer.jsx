import React from 'react';
import { Box, styled } from '@mui/material';
import OffCanvas from './OffCanvas';

// Container con la posición original exacta
const FooterContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: '5px',
  right: '5px',
  zIndex: 100,
  padding: '10px',
  
  // Responsive styles - mantener los originales
  [theme.breakpoints.down('sm')]: {
    padding: '6px',
  },
  
  // Extra small screens
  '@media (max-width: 480px)': {
    bottom: '3px',
    right: '3px',
  }
}));

const Footer = ({ onShowChange }) => {
  return (
    <FooterContainer>
      <OffCanvas onShowChange={onShowChange} />
    </FooterContainer>
  );
};

export default Footer;