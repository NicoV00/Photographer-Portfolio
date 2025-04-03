import React, { useState } from 'react';
import { Box, Button, styled, useMediaQuery, useTheme, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import OffCanvas from './OffCanvas';

// Componente personalizado para las dos rayas del menú
const TwoLineMenu = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '4px',
  width: '16px',
  height: '16px',
  '& .line': {
    width: '100%',
    height: '2px',
    backgroundColor: 'currentColor'
  }
});

// Styled MUI components to replace CSS classes
const FooterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  padding: '10px',
  backgroundColor: 'transparent',
  borderTop: 'none',
  position: 'fixed',
  bottom: '5px',
  right: '5px',
  zIndex: 100,
  flexWrap: 'wrap', // Allow items to wrap on smaller screens
  
  // Responsive styles
  [theme.breakpoints.down('sm')]: {
    gap: '6px',
    padding: '6px',
    maxWidth: '100%',
    justifyContent: 'flex-end', // Align to right on small screens
  },
  
  // Extra small screens
  '@media (max-width: 480px)': {
    bottom: '3px',
    right: '3px',
  }
}));

const StyleButton = styled(Button)(({ theme }) => ({
  padding: '0 10px',
  height: '35px',
  minHeight: '35px',
  minWidth: 'unset',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(0, 0, 0, 0.2)',
  borderRadius: '15px',
  backgroundColor: 'transparent',
  color: '#000',
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textAlign: 'center',
  lineHeight: 1,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    borderColor: '#000',
    borderRadius: 0,
    color: '#666',
    transform: 'translateY(-2px)',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  
  // Responsive styles
  [theme.breakpoints.down('sm')]: {
    padding: '0 8px',
    height: '30px',
    minHeight: '30px',
    fontSize: '12px',
  },
  
  // Extra small screens
  '@media (max-width: 480px)': {
    padding: '0 6px',
    height: '28px',
    minHeight: '28px',
    fontSize: '11px',
  }
}));


// Menú hamburguesa sin borde en pantallas pequeñas
const MenuIconButton = styled(IconButton)(({ theme }) => ({
  padding: '8px',
  border: '1px solid rgba(0, 0, 0, 0.2)',
  borderRadius: '15px',
  backgroundColor: 'transparent',
  color: '#000',
  '&:hover': {
    borderColor: '#000',
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  
  // Sin borde en pantallas pequeñas
  [theme.breakpoints.down('sm')]: {
    border: 'none',
    padding: '4px',
    minWidth: 'auto',
    '&:hover': {
      borderColor: 'transparent',
      borderRadius: 0,
      transform: 'translateY(-2px)',
    }
  }
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: 'white',
    borderRadius: 0,
    border: '1px solid #000',
    marginTop: '5px',
  }
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '14px',
  padding: '6px 16px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  }
}));

const Footer = ({ onShowChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isVerySmall = useMediaQuery('(max-width:480px)');
  
  // Para el menú en móviles
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const styles = [
    'muf',
    'a.del.amour',
    'blua',
    'kiosko',
    'archivo',
    'lenoir',
    'CH1MA',
  ];
  
  // Determinar cuántos botones mostrar directamente vs. en menú
  // según el tamaño de la pantalla
  const visibleStyles = isVerySmall ? [] : (isMobile ? styles.slice(0, 3) : styles);
  const menuStyles = isVerySmall ? styles : (isMobile ? styles.slice(3) : []);

  return (
    <FooterContainer>
      {/* Botones de estilo directamente visibles */}
      {/* 
      {visibleStyles.map((style, index) => (
        <StyleButton 
          key={index} 
          disableRipple={true}
          disableElevation={true}
        >
          {style}
        </StyleButton>
      ))}
      */}
      
      
      {/* Menú desplegable para pantallas pequeñas */}
      {/* 
      {menuStyles.length > 0 && (
        <>
          <MenuIconButton
            aria-label="more styles"
            aria-controls="style-menu"
            aria-haspopup="true"
            onClick={handleClick}
            disableRipple={true}
          >
            {isMobile ? (
              <TwoLineMenu>
                <div className="line"></div>
                <div className="line"></div>
              </TwoLineMenu>
            ) : (
              <MenuIcon fontSize="small" />
            )}
          </MenuIconButton>
          
          <StyledMenu
            id="style-menu"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleClose}
          >
            {menuStyles.map((style, index) => (
              <StyledMenuItem 
                key={index}
                onClick={handleClose}
              >
                {style}
              </StyledMenuItem>
            ))}
          </StyledMenu>
        </>
      )}
      */}
      
      <OffCanvas onShowChange={onShowChange} />
    </FooterContainer>
  );
};

export default Footer;
