import React from 'react';
import { Html } from '@react-three/drei';
import { Box, Typography, Switch } from '@mui/material';

const QualitySwitch = ({ isHighQuality, onChange }) => {
  return (
    <Html>
      <Box
        sx={{
          position: 'absolute',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(8px)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s ease',
          top: '400px',
          right: '750px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.85)',
            userSelect: 'none',
          }}
        >
          Quality
        </Typography>
        
        <Switch
          checked={isHighQuality}
          onChange={(e) => onChange(e.target.checked)}
          size="small"
          sx={{
            '& .MuiSwitch-thumb': {
              backgroundColor: isHighQuality ? '#fff' : 'rgba(255, 255, 255, 0.6)',
            },
            '& .MuiSwitch-track': {
              backgroundColor: isHighQuality ? 'rgba(80, 180, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)',
              opacity: 1,
            }
          }}
        />
        
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            minWidth: '30px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.85)',
            userSelect: 'none',
          }}
        >
          {isHighQuality ? 'High' : 'Lite'}
        </Typography>
      </Box>
    </Html>
  );
};

export default QualitySwitch;
