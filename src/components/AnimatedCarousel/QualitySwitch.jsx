import React from 'react';
import { Html } from '@react-three/drei';
import { Box, Typography, Switch, styled } from '@mui/material';

const StyledBox = styled(Box)(({ theme }) => ({
  position: 'absolute', 
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  top: '400px',
  right: '750px'
}));

const QualitySwitch = ({ isHighQuality, onChange }) => {
  return (
    <Html position={[0, 0, 0]} zIndexRange={[50, 0]}>
      <StyledBox>
        <Typography variant="body2" color="white">Quality:</Typography>
        <Switch
          checked={isHighQuality}
          onChange={(e) => onChange(e.target.checked)}
          color="primary"
        />
        <Typography variant="body2" color="white">
          {isHighQuality ? 'High' : 'Lite'}
        </Typography>
      </StyledBox>
    </Html>
  );
};

export default QualitySwitch;