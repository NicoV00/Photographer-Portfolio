import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { gsap } from 'gsap';

// Component for the title with improved typewriter effect
const SmoothGlowingTitle = ({ text, open, isMobile = false, noGlowOnMobile = false }) => {
  const titleRef = useRef(null);
  const charElements = useRef([]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const glowTimeline = useRef(null);
  
  // Split text for mobile devices
  const displayName = isMobile ? text.split(' ') : [text];
  
  // Entry effect with soft glow and typewriter
  useEffect(() => {
    if (open && titleRef.current && !hasAnimated) {
      // Crear timeline para animación del glow (solo si no es móvil o si noGlowOnMobile es false)
      if (!isMobile || !noGlowOnMobile) {
        const tl = gsap.timeline();
        glowTimeline.current = tl;
        
        // Start with a neon green glow in the container
        tl.fromTo(titleRef.current, 
          {
            textShadow: '0 0 0px rgba(0, 255, 0, 0)'
          },
          {
            textShadow: '0 0 4px rgba(0, 255, 0, 0.5), 0 0 8px rgba(0, 255, 0, 0.3)',
            duration: 1.5,
            ease: 'power1.inOut'
          }
        );
      }
      
      // Clean up existing characters
      if (isMobile) {
        // For mobile, handled differently with two lines
        return;
      }
      
      // Select all spans (characters)
      const chars = titleRef.current.querySelectorAll('.char');
      charElements.current = chars;
      
      // Initially hide all characters
      gsap.set(chars, { 
        opacity: 0,
        display: 'inline-block' 
      });
      
      // Create timeline for typing animation
      const typeTimeline = gsap.timeline({
        onComplete: () => {
          // When complete, intensify the glow and keep it stronger (si no es móvil o noGlowOnMobile es false)
          if (!isMobile || !noGlowOnMobile) {
            if (glowTimeline.current) {
              glowTimeline.current.to(titleRef.current, {
                textShadow: '0 0 8px rgba(0, 255, 0, 0.7), 0 0 15px rgba(0, 255, 0, 0.5), 0 0 20px rgba(0, 255, 0, 0.3)',
                duration: 1.2,
                ease: 'power2.inOut'
              }).to(titleRef.current, {
                textShadow: '0 0 5px rgba(0, 255, 0, 0.6), 0 0 10px rgba(0, 255, 0, 0.4), 0 0 15px rgba(0, 255, 0, 0.3)',
                duration: 1.8,
                ease: 'power2.out',
                delay: 0.5
              });
            }
          }
          
          setHasAnimated(true);
        }
      });
      
      // Animate each character with ascending delay
      chars.forEach((char, index) => {
        const delay = 0.05 + index * 0.04; // Adjust speed here
        typeTimeline.to(char, {
          opacity: 1,
          duration: 0.1,
          ease: "none"
        }, delay);
      });
      
    } else if (!open) {
      // Reset if panel is closed
      setHasAnimated(false);
      
      // Clear timeline
      if (glowTimeline.current) {
        glowTimeline.current.kill();
        glowTimeline.current = null;
      }
      
      // Reset character opacity for next animation
      if (charElements.current.length > 0) {
        gsap.set(charElements.current, { opacity: 0 });
      }
    }
    
    return () => {
      if (glowTimeline.current) {
        glowTimeline.current.kill();
      }
    };
  }, [open, text, isMobile, hasAnimated, noGlowOnMobile]);
  
  // Effect for title hover - FIX: completely remove glow when not hovering
  useEffect(() => {
    if (titleRef.current && (!isMobile || !noGlowOnMobile)) {
      // Add subtle interactivity to the title
      const handleMouseEnter = () => {
        gsap.to(titleRef.current, {
          textShadow: '0 0 8px rgba(0, 255, 0, 0.8), 0 0 15px rgba(0, 255, 0, 0.6), 0 0 20px rgba(0, 255, 0, 0.4)',
          duration: 0.6,
          ease: 'power1.inOut'
        });
      };
      
      const handleMouseLeave = () => {
        // FIX: Completely remove the glow on mouse leave
        gsap.to(titleRef.current, {
          textShadow: 'none',
          duration: 0.8,
          ease: 'power1.out'
        });
      };
      
      titleRef.current.addEventListener('mouseenter', handleMouseEnter);
      titleRef.current.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        if (titleRef.current) {
          titleRef.current.removeEventListener('mouseenter', handleMouseEnter);
          titleRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, [isMobile, noGlowOnMobile]);
  
  // Renderizado según el dispositivo
  if (isMobile) {
    // Mobile version: title in two lines
    return (
      <Box ref={titleRef} sx={{ textAlign: 'center', width: '100%' }}>
        <Typography
          sx={{
            fontFamily: 'Medium, sans-serif',
            textTransform: 'uppercase',
            fontSize: { xs: '2.2rem', sm: '3rem' }, // Responsive font size
            letterSpacing: '1px',
            fontWeight: 'bold',
            color: 'white',
            lineHeight: '1',
            whiteSpace: 'nowrap',
            cursor: 'default',
            // Sin efecto de glow si noGlowOnMobile es true
            textShadow: noGlowOnMobile ? 'none' : '0 0 3px #00ff00, 0 0 5px #00ff00'
          }}
        >
          {displayName[0]}
        </Typography>
        <Typography
          sx={{
            fontFamily: 'Medium, sans-serif',
            textTransform: 'uppercase',
            fontSize: { xs: '2.2rem', sm: '3rem' }, // Responsive font size
            letterSpacing: '1px',
            fontWeight: 'bold',
            color: 'white',
            lineHeight: '1.1',
            whiteSpace: 'nowrap',
            cursor: 'default',
            // Sin efecto de glow si noGlowOnMobile es true
            textShadow: noGlowOnMobile ? 'none' : '0 0 3px #00ff00, 0 0 5px #00ff00'
          }}
        >
          {displayName.length > 1 ? displayName[1] : ''}
        </Typography>
      </Box>
    );
  }
  
  // Desktop version with text separated into spans for animation
  // Manually separate "ENZO" and "CIMILLO" to ensure correct spacing
  const titleParts = text.split(' ');
  
  return (
    <Typography 
      ref={titleRef}
      sx={{
        fontFamily: 'Medium, sans-serif',
        textTransform: 'uppercase',
        fontSize: '4.5rem',
        letterSpacing: '2px',
        fontWeight: 'bold',
        color: 'white',
        width: '100%',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        cursor: 'default'
      }}
    >
      {/* First part: ENZO */}
      {titleParts[0].split('').map((char, index) => (
        <span key={`first-${index}`} className="char" style={{opacity: 1}}>
          {char}
        </span>
      ))}
      
      {/* Visible space between words */}
      <span className="char" style={{opacity: 1, width: '0.5em', display: 'inline-block'}}>&nbsp;</span>
      
      {/* Second part: CIMILLO */}
      {titleParts.length > 1 && titleParts[1].split('').map((char, index) => (
        <span key={`second-${index}`} className="char" style={{opacity: 1}}>
          {char}
        </span>
      ))}
    </Typography>
  );
};

export default SmoothGlowingTitle;