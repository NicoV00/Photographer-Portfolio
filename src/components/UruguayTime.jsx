import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

// Component to display the time in Montevideo, Uruguay
const UruguayTime = () => {
  const [time, setTime] = useState('');
  const [blinkOn, setBlinkOn] = useState(true);
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Correctly calculate Uruguay time (GMT-3)
      let hours = now.getUTCHours() - 3;
      // Adjust if it goes to previous day
      if (hours < 0) hours += 24;
      
      const minutes = now.getUTCMinutes();
      const seconds = now.getUTCSeconds();
      
      const timeString = 
        String(hours).padStart(2, '0') + 
        ':' + 
        String(minutes).padStart(2, '0') + 
        ':' + 
        String(seconds).padStart(2, '0') + 
        ' UYT';
      
      setTime(timeString);
    };
    
    // Update time every second
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    
    // Blink the dot every 500ms
    const blinkInterval = setInterval(() => {
      setBlinkOn(prev => !prev);
    }, 500);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(blinkInterval);
    };
  }, [blinkOn]);
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box 
        sx={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: 'white', 
          marginRight: '8px',
          opacity: blinkOn ? 1 : 0,
          transition: 'opacity 0.1s ease'
        }} 
      />
      <Typography sx={{ 
        fontSize: { xs: '0.875rem', sm: '1.125rem' }, // Responsive font size
        fontFamily: 'monospace',
        fontWeight: '500',
        letterSpacing: '1px'
      }}>
        {time}
      </Typography>
    </Box>
  );
};

export default UruguayTime;