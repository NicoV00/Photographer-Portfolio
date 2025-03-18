import React, { useEffect, useRef } from 'react';

/**
 * Custom cursor manager based on the approach from the article by Stefan Vitasovic
 * Uses requestAnimationFrame and lerp for smooth cursor movement
 */
class CursorController {
  constructor(options = {}) {
    // Mouse coordinates (target position)
    this.target = { x: 0.5, y: 0.5 };
    
    // Cursor element coordinates (current position)
    this.cursor = { x: 0.5, y: 0.5 };
    
    // Configuration options
    this.speed = options.speed || 0.2;
    this.offset = options.offset || { x: 0, y: 0 };
    
    // References to DOM elements
    this.cursorElements = {
      main: null,
      red: null,
      blue: null
    };

    // Store the animation frame request ID
    this.raf = null;
    
    // Offsets for RGB effect
    this.rgbOffsets = {
      red: { x: -3, y: 0 },
      blue: { x: 3, y: 0 }
    };
    
    // Bind methods to instance
    this.onMouseMove = this.onMouseMove.bind(this);
    this.render = this.render.bind(this);
    this.updateElements = this.updateElements.bind(this);
  }
  
  /**
   * Initialize the cursor controller
   */
  init(elements) {
    // Store references to DOM elements
    this.cursorElements = {
      main: elements.main || null,
      red: elements.red || null,
      blue: elements.blue || null
    };
    
    // Set initial positions to center of screen
    this.target.x = window.innerWidth / 2;
    this.target.y = window.innerHeight / 2;
    this.cursor.x = this.target.x;
    this.cursor.y = this.target.y;
    
    // Make cursors visible immediately
    this.setVisibility(true);
    
    // Initial position update
    this.updateElements();
    
    // Add event listener for mouse movement
    window.addEventListener("mousemove", this.onMouseMove);
    
    // Start the render loop
    this.raf = requestAnimationFrame(this.render);
    
    return this;
  }
  
  /**
   * Clean up event listeners and cancel animations
   */
  destroy() {
    window.removeEventListener("mousemove", this.onMouseMove);
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }
  
  /**
   * Handle mouse movement
   */
  onMouseMove(e) {
    // Update target position (normalized between 0 and 1)
    this.target.x = e.clientX;
    this.target.y = e.clientY;
    
    // Restart animation loop if it was stopped
    if (!this.raf) {
      this.raf = requestAnimationFrame(this.render);
    }
  }
  
  /**
   * Linear interpolation function
   */
  lerp(a, b, n) {
    return (1 - n) * a + n * b;
  }
  
  /**
   * Update cursor element positions
   */
  updateElements() {
    const { main, red, blue } = this.cursorElements;
    
    if (main) {
      main.style.transform = `translate(${this.cursor.x + this.offset.x}px, ${this.cursor.y + this.offset.y}px)`;
    }
    
    if (red) {
      red.style.transform = `translate(${this.cursor.x + this.offset.x + this.rgbOffsets.red.x}px, ${this.cursor.y + this.offset.y + this.rgbOffsets.red.y}px)`;
    }
    
    if (blue) {
      blue.style.transform = `translate(${this.cursor.x + this.offset.x + this.rgbOffsets.blue.x}px, ${this.cursor.y + this.offset.y + this.rgbOffsets.blue.y}px)`;
    }
  }
  
  /**
   * Animation render loop
   */
  render() {
    // Smoothly interpolate towards the target position
    this.cursor.x = this.lerp(this.cursor.x, this.target.x, this.speed);
    this.cursor.y = this.lerp(this.cursor.y, this.target.y, this.speed);
    
    // Update DOM elements
    this.updateElements();
    
    // Calculate distance to target
    const dx = this.target.x - this.cursor.x;
    const dy = this.target.y - this.cursor.y;
    const delta = Math.sqrt(dx * dx + dy * dy);
    
    // If cursor is very close to target position, stop animation to save resources
    if (delta < 0.1) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
      return;
    }
    
    // Continue animation loop
    this.raf = requestAnimationFrame(this.render);
  }
  
  /**
   * Set visibility of cursor elements
   */
  setVisibility(isVisible) {
    const visibility = isVisible ? 'visible' : 'hidden';
    const { main, red, blue } = this.cursorElements;
    
    if (main) main.style.visibility = visibility;
    if (red) red.style.visibility = visibility;
    if (blue) blue.style.visibility = visibility;
  }
}

/**
 * React hook to use the cursor controller
 */
export const useCursorManager = (options = {}) => {
  const cursorController = useRef(null);
  
  useEffect(() => {
    // Create a new controller instance
    cursorController.current = new CursorController({
      speed: options.speed || 0.2,
      offset: options.offset || { x: -10, y: -5 }
    });
    
    return () => {
      // Clean up on unmount
      if (cursorController.current) {
        cursorController.current.destroy();
      }
    };
  }, [options.speed]);
  
  /**
   * Initialize the cursor controller with DOM elements
   */
  const initCursor = (elements) => {
    if (cursorController.current) {
      cursorController.current.init(elements);
    }
  };
  
  /**
   * Set visibility of cursor elements
   */
  const setCursorVisibility = (isVisible) => {
    if (cursorController.current) {
      cursorController.current.setVisibility(isVisible);
    }
  };
  
  return {
    initCursor,
    setCursorVisibility
  };
};

export default useCursorManager;