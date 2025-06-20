import React, { useEffect, useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// Main container with minimal glass effect
const ScreensaverContainer = styled(Box)(({ isActive }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  opacity: isActive ? 1 : 0,
  visibility: isActive ? 'visible' : 'hidden',
  transition: 'opacity 0.4s ease, visibility 0.4s',
  pointerEvents: isActive ? 'all' : 'none',
  cursor: 'none',
  overflow: 'hidden',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}));

// Text line container with infinite animation
const TextLineContainer = styled(Box)(({ direction, lineIndex }) => ({
  width: '100%',
  height: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  position: 'absolute',
  top: lineIndex === 0 ? '45%' : '55%', // Adjusted positioning
  left: 0,
  transform: 'translateY(-50%)', // Center vertically
  
  '&::before, &::after': {
    content: lineIndex === 0 ? '"enzo                    "' : '"fashion photographer                    "',
    position: 'absolute',
    top: 0,
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 'clamp(80px, 20vw, 300px)',
    fontWeight: 'bold',
    lineHeight: '0.8',
    letterSpacing: '-0.05em',
    whiteSpace: 'nowrap',
    color: '#000000',
    mixBlendMode: 'difference',
    WebkitTextStroke: '0.5px rgba(255,255,255,0.3)',
    userSelect: 'none',
  },
  
  '&::before': {
    left: '0%',
    animation: `${direction === 'left' ? 'slideLeftInfinite' : 'slideRightInfinite'} 20s linear infinite`,
  },
  
  '&::after': {
    left: direction === 'left' ? '100%' : '-100%',
    animation: `${direction === 'left' ? 'slideLeftInfinite' : 'slideRightInfinite'} 20s linear infinite`,
  },
  
  '@keyframes slideLeftInfinite': {
    '0%': { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(-100%)' },
  },
  
  '@keyframes slideRightInfinite': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
  
  '@media (max-width: 768px)': {
    top: lineIndex === 0 ? '40%' : '60%',
    '&::before, &::after': {
      fontSize: 'clamp(60px, 18vw, 200px)',
      content: lineIndex === 0 ? '"enzo              "' : '"fashion photographer              "',
    },
  },
}));

// Activity indicator
const ActivityIndicator = styled(Box)({
  position: 'absolute',
  bottom: '80px',
  left: '50%',
  transform: 'translateX(-50%)',
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '12px',
  fontWeight: 'normal',
  color: 'rgba(0, 0, 0, 0.4)',
  mixBlendMode: 'difference',
  letterSpacing: '4px',
  textTransform: 'uppercase',
  animation: 'pulse 4s ease-in-out infinite',
  
  '@keyframes pulse': {
    '0%, 100%': { opacity: 0.6 },
    '50%': { opacity: 0.3 },
  },
});

const ScreensaverBanner = ({ 
  isActive = false, 
  onDismiss = null,
  onInactivityChange = null, 
  timeout = 20000
}) => {
  const [show, setShow] = useState(false);
  const stateRef = useRef({
    timer: null,
    inactivityTimer: null,
    lastActivity: Date.now(),
    isInactive: false,
    callbacks: { onDismiss, onInactivityChange },
    mouseThreshold: { x: 0, y: 0, threshold: 30 }
  });

  useEffect(() => {
    stateRef.current.callbacks = { onDismiss, onInactivityChange };
  }, [onDismiss, onInactivityChange]);

  useEffect(() => {
    if (!isActive) return;

    const handleActivity = (e) => {
      stateRef.current.lastActivity = Date.now();
      if (show) {
        setShow(false);
        stateRef.current.callbacks.onDismiss?.();
      }
      resetTimers();
    };

    const handleMouseMove = (e) => {
      if (show) return handleActivity(e);
      const { x, y, threshold } = stateRef.current.mouseThreshold;
      if (Math.abs(e.clientX - x) > threshold || Math.abs(e.clientY - y) > threshold) {
        stateRef.current.mouseThreshold = { ...stateRef.current.mouseThreshold, x: e.clientX, y: e.clientY };
        handleActivity(e);
      }
    };

    const resetTimers = () => {
      clearTimeout(stateRef.current.timer);
      clearTimeout(stateRef.current.inactivityTimer);
      stateRef.current.isInactive = false;
      stateRef.current.callbacks.onInactivityChange?.(false);

      stateRef.current.inactivityTimer = setTimeout(() => {
        stateRef.current.isInactive = true;
        stateRef.current.callbacks.onInactivityChange?.(true);
        stateRef.current.timer = setTimeout(() => setShow(true), 3000);
      }, timeout - 3000);
    };

    const events = [
      { name: 'mousedown', handler: handleActivity },
      { name: 'mousemove', handler: handleMouseMove },
      { name: 'click', handler: handleActivity },
      { name: 'keydown', handler: handleActivity },
      { name: 'wheel', handler: handleActivity },
      { name: 'touchstart', handler: handleActivity }
    ];

    events.forEach(e => document.addEventListener(e.name, e.handler, { passive: true }));
    resetTimers();

    return () => {
      events.forEach(e => document.removeEventListener(e.name, e.handler));
      clearTimeout(stateRef.current.timer);
      clearTimeout(stateRef.current.inactivityTimer);
    };
  }, [isActive, timeout, show]);

  if (!isActive) return null;

  return (
    <ScreensaverContainer isActive={show}>
      {/* Top line - "enzo" moving right to left */}
      <TextLineContainer direction="left" lineIndex={0} />
      
      {/* Bottom line - "fashion photographer" moving left to right */}
      <TextLineContainer direction="right" lineIndex={1} />
      
      <ActivityIndicator>
        move to continue
      </ActivityIndicator>
    </ScreensaverContainer>
  );
};

export default ScreensaverBanner;
