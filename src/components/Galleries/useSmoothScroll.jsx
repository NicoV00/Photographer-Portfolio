import { useRef, useEffect, useState, useCallback } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';

/**
 * Custom hook for implementing ultra smooth scrolling with Lenis
 * @param {Object} options - Configuration options
 * @param {React.RefObject} options.containerRef - Reference to the scrollable container
 * @param {boolean} options.isMobile - Whether the device is mobile
 * @param {boolean} options.isLoading - Whether content is still loading
 * @param {function} options.checkVisibility - Function to check visibility of elements (optional)
 * @param {boolean} options.horizontal - Whether scrolling is horizontal (default: true)
 * @param {number} options.duration - Animation duration for scroll (default: 1.8)
 * @param {number} options.wheelMultiplier - Multiplier for wheel events (default: 1.5)
 * @param {number} options.touchMultiplier - Multiplier for touch events (default: 2.5)
 * @param {number} options.lerp - Linear interpolation value (default: 0.055)
 * @param {Object} options.colors - Theme colors (optional)
 * @returns {Object} - scrollLeft and scrollProgress state values
 */
const useSmoothScroll = ({
  containerRef,
  isMobile,
  isLoading,
  checkVisibility,
  horizontal = true,
  duration = 1.8,           // Reduced duration for faster response
  wheelMultiplier = 1.5,     // Increased multiplier for more responsive scrolling
  touchMultiplier = 2.5,     // Increased touch multiplier for mobile
  lerp = 0.055,              // Slightly increased lerp for faster response but still smooth
  colors = null
}) => {
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lenisRef = useRef(null);
  const frameRef = useRef(null);
  const progressRef = useRef(0);
  const wheelHandlerRef = useRef(null);

  // Initialize Lenis for smooth scrolling with optimized configuration
  useEffect(() => {
    if (isLoading || !containerRef.current || (isMobile && horizontal)) return;

    // Clean up any existing instances
    if (lenisRef.current) {
      lenisRef.current.destroy();
      lenisRef.current = null;
    }

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    // Optimized easing function for ultra smooth experience but faster response
    const optimizedEasing = (t) => {
      return 1 - Math.pow(1 - t, 3); // More responsive curve (power of 3 instead of 4)
    };

    // Initialize Lenis with optimized configuration
    lenisRef.current = new Lenis({
      wrapper: containerRef.current,
      content: containerRef.current,
      duration: duration,
      easing: optimizedEasing,
      orientation: horizontal ? 'horizontal' : 'vertical',
      gestureOrientation: horizontal ? 'both' : 'vertical', // Permitir ambas direcciones
      smoothWheel: true,
      smoothTouch: true,     // Enable smooth touch for better experience on all devices
      touchMultiplier: touchMultiplier,
      wheelMultiplier: wheelMultiplier,
      lerp: lerp,            // Higher value for faster response
      infinite: false,       // No infinite scroll - important for proper progress tracking
      normalizeWheel: true   // Normalize wheel events across browsers for consistency
    });

    // Connect Lenis to requestAnimationFrame for optimal performance
    // Use a single rAF loop for better performance
    const animate = (time) => {
      lenisRef.current?.raf(time);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    // Handle scroll progress and visibility checks
    lenisRef.current.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
      // Set internal scrollLeft for other functions that need it
      setScrollLeft(scroll);
      
      // Animate the progress bar with GSAP to match Lenis smoothness
      const progressElements = document.querySelectorAll('[data-scroll-progress]');
      if (progressElements.length > 0) {
        const scrollPercentage = (scroll / limit) * 100;
        
        // Use a more immediate update for the progress bar
        gsap.to(progressElements, {
          width: `${scrollPercentage}%`, 
          duration: 0.05,     // Even faster updates for more responsive progress bar
          ease: "power1.out",
          overwrite: true
        });
        
        // Apply highlight color if provided
        if (colors && colors.highlight) {
          progressElements.forEach(el => {
            if (el.style.backgroundColor !== colors.highlight) {
              el.style.backgroundColor = colors.highlight;
            }
          });
        }
      }
      
      // Update state for components that need the percentage value
      // Use a ref to ensure smoother updates with less state changes
      progressRef.current = progress * 100;
      setScrollProgress(progressRef.current);
      
      // Run visibility check function if provided - optimized to reduce checks
      if (typeof checkVisibility === 'function') {
        // Only run at the end of scrolling or periodically during scroll
        // This dramatically improves performance
        if (Math.abs(velocity) < 0.01 || Math.random() < 0.05) {
          checkVisibility();
        }
      }
    });

    // Additional optimizations
    // Prevent scroll blocking
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
      // Full cleanup
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      
      document.body.style.overscrollBehavior = '';
      gsap.killTweensOf('[data-scroll-progress]');
    };
  }, [isLoading, isMobile, horizontal, checkVisibility, duration, wheelMultiplier, touchMultiplier, lerp, colors]);

  // Add mouse wheel event listener to handle vertical wheel scrolling for horizontal movement
  useEffect(() => {
    if (isLoading || !containerRef.current || !horizontal) return;
    
    // Guardar una referencia local
    const container = containerRef.current;

    // Custom wheel handler to ensure the vertical mouse wheel works with horizontal scrolling
    const handleWheel = (event) => {
      if (!lenisRef.current) return;
      
      // Prevent the default scroll behavior
      event.preventDefault();
      
      // Calculate the amount to scroll based on the wheel delta
      const delta = event.deltaY || -event.wheelDelta || event.detail;
      const scrollAmount = delta * wheelMultiplier;
      
      // Get current scroll position
      const currentScroll = lenisRef.current.scroll;
      
      // Scroll horizontally based on vertical wheel movement
      // Scrolling down = right, scrolling up = left
      lenisRef.current.scrollTo(currentScroll + scrollAmount, {
        immediate: false,
        duration: 0.3  // Shorter duration for more responsive feel
      });
    };
    
    // Save reference to the handler for cleanup
    wheelHandlerRef.current = handleWheel;
    
    // Add the wheel event listener with passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      // Verificar que el contenedor existe antes de remover el event listener
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isLoading, containerRef, horizontal, wheelMultiplier]);

  // Fallback to standard scroll for mobile horizontal (where Lenis has issues)
  useEffect(() => {
    // Only apply this for mobile + horizontal scroll where we're not using Lenis
    if (!isLoading && containerRef.current && isMobile && horizontal) {
      const container = containerRef.current;
      
      // Standard scroll handler for mobile
      const handleScroll = () => {
        const scrollPosition = horizontal ? container.scrollLeft : container.scrollTop;
        setScrollLeft(scrollPosition);
        
        // Calculate scroll progress
        const maxScroll = horizontal 
          ? container.scrollWidth - container.clientWidth 
          : container.scrollHeight - container.clientHeight;
        
        const progress = maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0;
        setScrollProgress(progress);
        
        // Update progress bar manually since Lenis isn't doing it
        const progressElements = document.querySelectorAll('[data-scroll-progress]');
        if (progressElements.length > 0) {
          progressElements.forEach(el => {
            el.style.width = `${progress}%`;
            if (colors && colors.highlight) {
              el.style.backgroundColor = colors.highlight;
            }
          });
        }
      };
      
      // Add scroll listener
      container.addEventListener('scroll', handleScroll, { passive: true });
      
      // Add wheel event listener for mobile too - more responsive now
      const handleMobileWheel = (event) => {
        // Prevent default scrolling
        event.preventDefault();
        
        // Calculate scroll amount - increased multiplier for more fluid experience
        const delta = event.deltaY || -event.wheelDelta || event.detail;
        const scrollAmount = delta * (wheelMultiplier * 1.2); // Slightly increased for mobile
        
        // Update scroll position with some momentum
        const momentumScroll = () => {
          const step = scrollAmount / 5;
          let count = 0;
          const scroll = () => {
            if (count < 5) {
              container.scrollLeft += step;
              count++;
              requestAnimationFrame(scroll);
            }
          };
          requestAnimationFrame(scroll);
        };
        
        momentumScroll();
      };
      
      container.addEventListener('wheel', handleMobileWheel, { passive: false });
      
      // Initial calculation
      handleScroll();
      
      return () => {
        if (container) {
          container.removeEventListener('scroll', handleScroll);
          container.removeEventListener('wheel', handleMobileWheel);
        }
      };
    }
  }, [isLoading, containerRef, isMobile, horizontal, colors, wheelMultiplier]);

  // Utility function to scroll to a specific position
  const scrollTo = useCallback((target, options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        duration: 1.2, // Faster scrollTo animation
        ...options
      });
    } else if (containerRef.current) {
      // Fallback for when Lenis isn't available
      const container = containerRef.current;
      if (horizontal) {
        container.scrollLeft = target;
      } else {
        container.scrollTop = target;
      }
    }
  }, [containerRef, horizontal]);

  return {
    scrollLeft,
    scrollProgress,
    scrollTo,
    lenis: lenisRef.current,
    colors
  };
};

export default useSmoothScroll;
