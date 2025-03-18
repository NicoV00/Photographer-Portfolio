import { Box, Button, Drawer, styled } from '@mui/material';

// Styled components for consistent appearance
export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '800px',
    backgroundColor: 'black',
    color: 'white',
    padding: '20px',
    position: 'relative',
    fontFamily: 'DM Sans, sans-serif',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    }
  }
}));

export const InfoButton = styled(Button)(({ isHovered }) => ({
  margin: '0 4px',
  padding: '6px 13px',
  border: isHovered ? '1px solid #000' : '1px solid #ccc',
  borderRadius: '2px',
  backgroundColor: 'transparent',
  color: 'black',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'border 0.3s ease, background-color 0.3s ease, border-radius 0.3s ease, color 0.3s ease',
  position: 'relative',
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: 'transparent',
  }
}));

export const CustomCursor = styled(Box)(({ backgroundColor, color }) => ({
  position: 'fixed',
  width: '24px',
  height: '24px',
  border: '2px solid black',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '18px',
  fontFamily: 'monospace',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none',
  zIndex: 1000,
  cursor: 'none',
  backgroundColor,
  color,
  left: '50%', // Center cursor initially
  top: '50%',
  // Añadimos transición suave para la visibilidad
  transition: 'visibility 0.1s linear',
}));

export const OverlayBackdrop = styled(Box)({
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: 'rgba(1, 1, 1, 0.2)',
  display: 'flex',
  justifyContent: 'flex-end',
  zIndex: 9999,
});

export const CloseButton = styled(Box)(({ isMobile }) => ({
  position: 'absolute',
  top: isMobile ? '10px' : '20px',
  right: isMobile ? '10px' : '20px',
  width: isMobile ? '24px' : '30px',
  height: isMobile ? '24px' : '30px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  fontSize: isMobile ? '18px' : '22px',
  fontFamily: 'monospace',
  cursor: 'pointer',
  zIndex: 1010,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '2px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
}));