import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { gsap } from 'gsap';

// Enhanced component for text with glitch effect
const SequentialGlitchText = ({ 
  text, 
  fontSize, 
  fontFamily, 
  fontWeight, 
  color, 
  letterSpacing, 
  style, 
  initialGlitch = false, 
  isNeonGreen = false,
  lineHeight
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isInitializing, setIsInitializing] = useState(initialGlitch);
  const textRef = useRef(null);
  const underlineRef = useRef(null);
  const animationRef = useRef(null);
  const glitchTimerRef = useRef(null);
  const underlineAnimationRef = useRef(null);
  
  // Character sets for the glitch effect
  const symbolsSet = "!<>-_\\/[]{}=+*^?#.:;()%&@$~|`\"'";
  const numbersSet = "0123456789";
  const lettersSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  
  // Effect for initialization and animation
  useEffect(() => {
    if (!textRef.current) return;
    
    // Stop previous animations
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (glitchTimerRef.current) {
      clearTimeout(glitchTimerRef.current);
      glitchTimerRef.current = null;
    }
    
    // Initialize text with spans for each letter preserving spaces
    const initializeText = () => {
      // Clear current content
      textRef.current.innerHTML = '';
      
      // Create span for each character, keeping spaces intact
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.dataset.index = index;
        span.dataset.original = char;
        
        // If it's a space, ensure it's preserved
        if (char === ' ') {
          span.innerHTML = '&nbsp;';
          span.style.marginRight = '0.25em'; // Ensure visible spacing
        } else {
          span.style.display = 'inline-block';
          span.style.transition = 'transform 0.1s ease, scale 0.2s ease';
          span.style.transformOrigin = 'center';
        }
        
        textRef.current.appendChild(span);
      });
    };
    
    // Always initialize to ensure correct structure
    initializeText();
    
    // Function to get a random character for the glitch
    const getRandomChar = () => {
      const charSet = Math.random() < 0.6 ? symbolsSet : 
                   (Math.random() < 0.5 ? numbersSet : lettersSet);
      return charSet[Math.floor(Math.random() * charSet.length)];
    };
    
    // Function to apply sequential glitch effect (previous version)
    const applySequentialGlitch = () => {
      if (!textRef.current) return;
      
      const chars = textRef.current.querySelectorAll('span');
      if (!chars.length) return;
      
      // Adaptive glitch window (larger for longer texts)
      const baseWindowSize = 5; // Minimum 5 letters
      const adaptiveSize = Math.max(baseWindowSize, Math.floor(text.length / 15)); // Scale for long texts
      const windowSize = Math.min(adaptiveSize, 12); // No more than 12 at once to keep the effect visible
      
      let currentIndex = 0;
      
      const animateNextGroup = () => {
        // Reset all previous letters
        for (let i = 0; i < currentIndex; i++) {
          if (chars[i]) {
            chars[i].textContent = chars[i].dataset.original;
            if (chars[i].dataset.original === ' ') {
              chars[i].innerHTML = '&nbsp;';
            }
            chars[i].style.scale = '1';
            chars[i].style.transform = 'translateY(0)';
          }
        }
        
        // Animate current group
        for (let i = currentIndex; i < Math.min(currentIndex + windowSize, chars.length); i++) {
          if (chars[i] && chars[i].dataset.original.trim() !== '') {
            // Apply glitch only to non-space characters
            chars[i].textContent = getRandomChar();
            chars[i].style.scale = '1.2';
            chars[i].style.transform = 'translateY(-1px)';
          }
        }
        
        // Advance to the next group, faster
        currentIndex += 2; // Advance by 2 to speed up
        
        // Continue or end
        if (currentIndex < chars.length) {
          // Reduce time between groups to speed up the effect
          glitchTimerRef.current = setTimeout(animateNextGroup, 30); // 30ms instead of 40ms
        } else {
          // Restore everything at the end, faster
          setTimeout(() => {
            chars.forEach(span => {
              span.textContent = span.dataset.original;
              if (span.dataset.original === ' ') {
                span.innerHTML = '&nbsp;';
              }
              span.style.scale = '1';
              span.style.transform = 'translateY(0)';
            });
          }, 150); // 150ms instead of 200ms
        }
      };
      
      // Start the animation
      glitchTimerRef.current = setTimeout(animateNextGroup, 30); // Reduced from 50ms to 30ms
    };
    
    // Apply glitch based on state
    if (initialGlitch && isInitializing) {
      applySequentialGlitch();
      
      // End initialization after animation, faster for longer texts
      const animationDuration = Math.min(text.length * 30, 800); // Limit to 800ms maximum
      glitchTimerRef.current = setTimeout(() => {
        setIsInitializing(false);
      }, animationDuration);
    } else if (isHovered) {
      applySequentialGlitch();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (glitchTimerRef.current) {
        clearTimeout(glitchTimerRef.current);
      }
    };
  }, [text, isHovered, isInitializing, initialGlitch]);
  
  // Effect for the underline animation on hover
  useEffect(() => {
    if (!isNeonGreen || !underlineRef.current) return;
    
    if (underlineAnimationRef.current) {
      underlineAnimationRef.current.kill();
      underlineAnimationRef.current = null;
    }
    
    // Animation of the bar when hovering
    if (isHovered) {
      const tl = gsap.timeline();
      underlineAnimationRef.current = tl;
      
      // Animation of the bar entry and exit (smoother)
      tl.fromTo(underlineRef.current, 
        { width: "0%", left: "0%", right: "auto" }, 
        { width: "100%", duration: 0.35, ease: "power2.inOut" }
      ).to(underlineRef.current, 
        { left: "auto", right: "0%", width: "0%", duration: 0.35, delay: 0.1, ease: "power2.inOut" }
      );
    } else {
      gsap.set(underlineRef.current, { width: "0%", left: "0%", right: "auto" });
    }
    
    return () => {
      if (underlineAnimationRef.current) {
        underlineAnimationRef.current.kill();
      }
    };
  }, [isHovered, isNeonGreen]);
  
  // Determine styles based on isNeonGreen
  const baseStyles = {
    fontSize: fontSize || 'inherit',
    fontFamily: fontFamily || 'monospace',
    fontWeight: fontWeight || 'inherit',
    color: isNeonGreen ? '#00ff00' : (color || 'inherit'),
    letterSpacing: letterSpacing || '0px',
    lineHeight: lineHeight || 'normal',
    cursor: 'default',
    transition: 'letter-spacing 0.2s, text-shadow 0.3s',
    wordSpacing: '0.25em', // Ensure spacing between words
    position: 'relative', // For positioning the underline bar
    ...(isHovered && { 
      letterSpacing: '0.5px',
    }),
    // Add glow effect for neon green
    ...(isNeonGreen && {
      textShadow: isHovered 
        ? '0 0 4px #00ff00, 0 0 8px #00ff00, 0 0 12px #00ff00, 0 0 16px #00ff00'
        : '0 0 2px #00ff00, 0 0 4px #00ff00, 0 0 6px #00ff00',
      fontWeight: 'bold'
    }),
    ...style
  };
  
  return (
    <Box position="relative" display="inline-block">
      <Typography 
        ref={textRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={baseStyles}
      >
        {text}
      </Typography>
      {isNeonGreen && (
        <Box
          ref={underlineRef}
          sx={{
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            height: '2px',
            width: '0%',
            backgroundColor: '#00ff00',
            boxShadow: '0 0 4px #00ff00, 0 0 8px #00ff00',
            transition: 'width 0.3s'
          }}
        />
      )}
    </Box>
  );
};

export default SequentialGlitchText;