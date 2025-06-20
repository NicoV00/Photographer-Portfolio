import React from 'react';
import { Html } from '@react-three/drei';
import { Box, Typography, Switch } from '@mui/material';

const QualitySwitch = ({ isHighQuality, onChange }) => {
  return (
    <Html>
      {/* Embedded font import */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600&display=swap');
        `}
      </style>
      
      <Box
        sx={{
          position: 'absolute',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: 'rgba(15, 25, 45, 0.65)',
          backdropFilter: 'blur(12px)',
          padding: '10px 18px',
          borderRadius: '6px',
          border: '1px solid rgba(80, 180, 255, 0.25)',
          boxShadow: `
            0 0 15px rgba(80, 180, 255, 0.2),
            inset 0 1px 1px rgba(255, 255, 255, 0.1),
            inset 0 -1px 1px rgba(0, 0, 0, 0.2)
          `,
          transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
          top: '350px',
          right: '650px',
          '&:hover': {
            boxShadow: `
              0 0 20px rgba(80, 180, 255, 0.4),
              inset 0 1px 1px rgba(255, 255, 255, 0.15),
              inset 0 -1px 1px rgba(0, 0, 0, 0.25)
            `,
            borderColor: 'rgba(80, 180, 255, 0.4)',
            transform: 'translateY(-1px)'
          }
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(200, 230, 255, 0.95)',
            userSelect: 'none',
            letterSpacing: '0.1em',
            textShadow: '0 0 8px rgba(100, 200, 255, 0.6)',
            fontFamily: '"Rajdhani", "Courier New", monospace',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}
        >
          Render Quality
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            marginLeft: '0px'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: '12px',
              fontWeight: 600,
              color: !isHighQuality ? 'rgba(180, 240, 255, 1)' : 'rgba(180, 240, 255, 0.3)',
              userSelect: 'none',
              letterSpacing: '0.08em',
              fontFamily: '"Rajdhani", "Courier New", monospace',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              textShadow: !isHighQuality ? '0 0 6px rgba(100, 200, 255, 0.7)' : 'none'
            }}
          >
            Lite
          </Typography>
          
          <Switch
            checked={isHighQuality}
            onChange={(e) => onChange(e.target.checked)}
            size="small"
            sx={{
              '& .MuiSwitch-thumb': {
                backgroundColor: isHighQuality ? 'rgba(120, 220, 255, 1)' : 'rgba(180, 220, 255, 0.7)',
                boxShadow: `
                  0 0 8px ${isHighQuality ? 'rgba(100, 200, 255, 0.8)' : 'rgba(100, 200, 255, 0.4)'},
                  inset 0 1px 1px rgba(255, 255, 255, 0.3)
                `,
                width: 14,
                height: 14,
                margin: '2px',
                transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
              },
              '& .MuiSwitch-track': {
                backgroundColor: 'rgba(30, 70, 120, 0.3)',
                border: '1px solid rgba(80, 160, 220, 0.4)',
                opacity: 1,
                borderRadius: '12px',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)'
              },
              '& .MuiSwitch-switchBase': {
                padding: '7px',
                '&:hover': {
                  '& .MuiSwitch-thumb': {
                    boxShadow: `
                      0 0 12px ${isHighQuality ? 'rgba(100, 220, 255, 1)' : 'rgba(100, 200, 255, 0.6)'},
                      inset 0 1px 1px rgba(255, 255, 255, 0.4)
                    `
                  }
                }
              }
            }}
          />
          
          <Typography
            variant="body2"
            sx={{
              fontSize: '12px',
              fontWeight: 600,
              color: isHighQuality ? 'rgba(180, 240, 255, 1)' : 'rgba(180, 240, 255, 0.3)',
              userSelect: 'none',
              letterSpacing: '0.08em',
              fontFamily: '"Rajdhani", "Courier New", monospace',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              textShadow: isHighQuality ? '0 0 6px rgba(100, 200, 255, 0.7)' : 'none'
            }}
          >
            Ultra
          </Typography>
        </Box>
      </Box>
    </Html>
  );
};

export default QualitySwitch;
