import React from 'react';
import { Html } from '@react-three/drei';
import { Box, styled } from '@mui/material';
import { keyframes } from '@emotion/react';

const fadeInDelayed = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const StyledButton = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '330px',
  right: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'black',
  color: 'white',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(0.5),
  cursor: 'pointer',
  opacity: 0,
  animation: `${fadeInDelayed} 0.5s ease-in-out 2s forwards`,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  }
}));

const PortfolioButton = ({ onClick }) => {
  return (
    <Html position={[0, 0, 0]} zIndexRange={[50, 0]}>
      <StyledButton onClick={onClick}>
        ENTER PORTFOLIO
      </StyledButton>
    </Html>
  );
};

export default PortfolioButton;