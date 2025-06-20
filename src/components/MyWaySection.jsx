// src/components/MyWaySection.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { gsap } from 'gsap';

// Utils integrados
class Emitter {
  constructor() {
    this.events = [];
  }

  on(name, callback, context, once = false) {
    if (!this.events[name]) {
      this.events[name] = [];
    }

    let exists = false;
    this.events[name].forEach((object) => {
      if (object.cb === callback && object.context === context) {
        exists = true;
        return;
      }
    });
    if (exists) {
      return;
    }

    this.events[name].push({
      cb: callback,
      context: context,
      once: once
    });
  }

  emit(name) {
    const self = this;
    const data = [].slice.call(arguments, 1);

    if (this.events[name]) {
      this.events[name].forEach((object, index) => {
        object.cb.apply(object.context, data);

        if (object.once) {
          delete self.events[name][index];
        }
      });
    }
  }

  off(name, callback, context) {
    const self = this;

    if (this.events[name]) {
      this.events[name].forEach((object, index) => {
        if (object.cb === callback && object.context === context) {
          delete self.events[name][index];
        }
      });
    }
  }
}

class Ticker {
  constructor() {
    this.callbacks = [];
    this.delta = 0;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    gsap.ticker.add(this.tick.bind(this));
  }

  tick(time, delta) {
    const self = this;
    this.delta = delta || 0.016;

    this.callbacks.forEach((object, index) => {
      if (object && object.callback) {
        object.callback.apply(object.context);
        delete self.callbacks[index];
      }
    });

    this.callbacks = this.callbacks.filter(Boolean);
    emitter.emit('tick', time * 1000);
    emitter.emit('mousemove', mouseRef.current.x, mouseRef.current.y);
  }

  nextTick(callback, context) {
    this.callbacks.push({
      callback,
      context
    });
  }
}

// Noise class para las waves
class Noise {
  constructor(seed = Math.random()) {
    this.seed = seed;
  }

  perlin2(x, y) {
    // Simplified Perlin noise implementation
    const p = [];
    for (let i = 0; i < 256; i++) {
      p[i] = Math.floor(Math.random() * 256);
    }
    
    for (let i = 0; i < 256; i++) {
      p[256 + i] = p[i];
    }

    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (t, a, b) => a + t * (b - a);
    const grad = (hash, x, y) => {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = fade(x);
    const v = fade(y);
    
    const A = p[X] + Y;
    const AA = p[A];
    const AB = p[A + 1];
    const B = p[X + 1] + Y;
    const BA = p[B];
    const BB = p[B + 1];
    
    return lerp(v, lerp(u, grad(p[AA], x, y),
                           grad(p[BA], x - 1, y)),
                   lerp(u, grad(p[AB], x, y - 1),
                           grad(p[BB], x - 1, y - 1)));
  }
}

const emitter = new Emitter();
const ticker = new Ticker();
const mouseRef = { current: { x: 0, y: 0 } };

// Waves Component - Implementación fiel al componente Astro
const WavesComponent = ({ className }) => {
  const svgRef = useRef(null);
  const wavesRef = useRef(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const boundingRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const mouseWaveRef = useRef({
    x: -10,
    y: 0,
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
    v: 0,
    vs: 0,
    a: 0,
    set: false,
  });
  const linesRef = useRef([]);
  const pathsRef = useRef([]);
  const noiseRef = useRef(new Noise(Math.random()));

  const setSize = useCallback(() => {
    if (!wavesRef.current) return;
    
    const bounding = wavesRef.current.getBoundingClientRect();
    
    if (svgRef.current) {
      svgRef.current.style.width = '';
      svgRef.current.style.height = '';
    }
    
    boundingRef.current = {
      left: bounding.left,
      top: bounding.top + window.scrollY,
      width: wavesRef.current.clientWidth,
      height: wavesRef.current.clientHeight,
    };

    if (svgRef.current) {
      svgRef.current.style.width = `${boundingRef.current.width}px`;
      svgRef.current.style.height = `${boundingRef.current.height}px`;
    }
  }, []);

  const setLines = useCallback(() => {
    const { width, height } = boundingRef.current;

    linesRef.current = [];

    // Limpiar paths existentes
    pathsRef.current.forEach((path) => {
      if (path && path.parentNode) {
        path.parentNode.removeChild(path);
      }
    });
    pathsRef.current = [];

    // Configuración de la grilla como en el original de Astro
    const xGap = 10;
    const yGap = 32;

    const oWidth = width + 200;
    const oHeight = height + 30;

    const totalLines = Math.ceil(oWidth / xGap);
    const totalPoints = Math.ceil(oHeight / yGap);

    const xStart = (width - xGap * totalLines) / 2;
    const yStart = (height - yGap * totalPoints) / 2;

    for (let i = 0; i <= totalLines; i++) {
      const points = [];

      for (let j = 0; j <= totalPoints; j++) {
        const point = {
          x: xStart + xGap * i,
          y: yStart + yGap * j,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 },
        };

        points.push(point);
      }

      // Crear path SVG
      if (svgRef.current) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.style.fill = 'none';
        path.style.stroke = '#666';
        path.style.strokeWidth = '1px';
        path.classList.add('wave-line');

        svgRef.current.appendChild(path);
        pathsRef.current.push(path);
        linesRef.current.push(points);
      }
    }

    if (isPaused) {
      drawLines();
    }
  }, [isPaused]);

  const movePoints = useCallback((time) => {
    const lines = linesRef.current;
    const mouse = mouseWaveRef.current;
    const noise = noiseRef.current;

    lines.forEach((points) => {
      points.forEach((p) => {
        // Movimiento de onda con ruido Perlin (idéntico al original)
        const move = noise.perlin2(
          (p.x + time * 0.0125) * 0.002,
          (p.y + time * 0.005) * 0.0015
        ) * 12;
        p.wave.x = Math.cos(move) * 32;
        p.wave.y = Math.sin(move) * 16;

        // Efecto del mouse (idéntico al original)
        if (isInteractive) {
          const dx = p.x - mouse.sx;
          const dy = p.y - mouse.sy;
          const d = Math.hypot(dx, dy);
          const l = Math.max(175, mouse.vs);

          if (d < l) {
            const s = 1 - d / l;
            const f = Math.cos(d * 0.001) * s;

            p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00065;
            p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00065;
          }

          p.cursor.vx += (0 - p.cursor.x) * 0.005; // Tensión del string
          p.cursor.vy += (0 - p.cursor.y) * 0.005;

          p.cursor.vx *= 0.925; // Fricción/duración  
          p.cursor.vy *= 0.925;

          p.cursor.x += p.cursor.vx * 2; // Fuerza
          p.cursor.y += p.cursor.vy * 2;

          p.cursor.x = Math.min(100, Math.max(-100, p.cursor.x)); // Limitar movimiento
          p.cursor.y = Math.min(100, Math.max(-100, p.cursor.y));
        }
      });
    });
  }, [isInteractive]);

  const moved = useCallback((point, withCursorForce = true) => {
    const coords = {
      x: point.x + point.wave.x + (withCursorForce ? point.cursor.x : 0),
      y: point.y + point.wave.y + (withCursorForce ? point.cursor.y : 0),
    };

    // Redondear a 1 decimal como en el original
    coords.x = Math.round(coords.x * 10) / 10;
    coords.y = Math.round(coords.y * 10) / 10;

    return coords;
  }, []);

  const drawLines = useCallback(() => {
    const lines = linesRef.current;
    const paths = pathsRef.current;

    lines.forEach((points, lIndex) => {
      if (!paths[lIndex]) return;

      let p1 = moved(points[0], false);
      let d = `M ${p1.x} ${p1.y}`;

      points.forEach((point, pIndex) => {
        const isLast = pIndex === points.length - 1;
        const p1 = moved(point, !isLast);
        d += `L ${p1.x} ${p1.y}`;
      });

      paths[lIndex].setAttribute('d', d);
    });
  }, [moved]);

  const tick = useCallback((time) => {
    const mouse = mouseWaveRef.current;

    // Movimiento suave del mouse (idéntico al original)
    mouse.sx += (mouse.x - mouse.sx) * 0.1;
    mouse.sy += (mouse.y - mouse.sy) * 0.1;

    // Velocidad del mouse
    const dx = mouse.x - mouse.lx;
    const dy = mouse.y - mouse.ly;
    const d = Math.hypot(dx, dy);

    mouse.v = d;
    mouse.vs += (d - mouse.vs) * 0.1;
    mouse.vs = Math.min(100, mouse.vs);

    mouse.lx = mouse.x;
    mouse.ly = mouse.y;
    mouse.a = Math.atan2(dy, dx);

    // Actualizar variables CSS para el indicador del mouse
    if (wavesRef.current) {
      wavesRef.current.style.setProperty('--x', `${mouse.sx}px`);
      wavesRef.current.style.setProperty('--y', `${mouse.sy}px`);
    }

    movePoints(time);
    drawLines();
  }, [movePoints, drawLines]);

  const updateMousePosition = useCallback((x, y) => {
    const mouse = mouseWaveRef.current;

    mouse.x = x - boundingRef.current.left;
    mouse.y = y - boundingRef.current.top + window.scrollY;

    if (!mouse.set) {
      mouse.sx = mouse.x;
      mouse.sy = mouse.y;
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      mouse.set = true;
    }
  }, []);

  useEffect(() => {
    const onMouseMove = (x, y) => updateMousePosition(x, y);
    const onResize = () => {
      setSize();
      setLines();
    };

    emitter.on('mousemove', onMouseMove);
    emitter.on('resize', onResize);

    if (!isPaused) {
      emitter.on('tick', tick);
    }

    return () => {
      emitter.off('mousemove', onMouseMove);
      emitter.off('resize', onResize);
      emitter.off('tick', tick);
    };
  }, [updateMousePosition, setSize, setLines, tick, isPaused]);

  useEffect(() => {
    setSize();
    setLines();
    setIsInteractive(true);
    
    // Timer para activar la interactividad después de la intro
    const timer = setTimeout(() => {
      setIsInteractive(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [setSize, setLines]);

  const handleMouseMove = (e) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouseRef.current.x = touch.clientX;
    mouseRef.current.y = touch.clientY;
  };

  return (
    <Box
      ref={wavesRef}
      className={className}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      sx={{
        '--x': '-8px',
        '--y': '50%',
        position: 'relative',
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        
        // Indicador del mouse (como en el original Astro)
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          background: '#ff0000',
          borderRadius: '50%',
          transform: 'translate3d(calc(var(--x) - 50%), calc(var(--y) - 50%), 0)',
          willChange: 'transform',
          zIndex: 10,
          pointerEvents: 'none',
        },
      }}
    >
      <svg
        ref={svgRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
};

// Custom Scrollbar Component - Adaptado del código Astro
const CustomScrollbar = () => {
  const scrollbarRef = useRef(null);
  const thumbRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ start: { y: 0, scroll: 0 } });

  const setScrollbar = useCallback(() => {
    if (!scrollbarRef.current || !thumbRef.current) return;

    const safeHeight = window.innerHeight;
    const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const maxScrollTop = documentHeight - safeHeight;
    
    // Evitar división por cero
    if (maxScrollTop <= 0) return;
    
    const scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScrollTop));
    const scrollbarHeight = Math.max(20, (safeHeight / documentHeight) * safeHeight); // Mínimo 20px
    const scrollbarTop = scrollProgress * (safeHeight - scrollbarHeight);

    scrollbarRef.current.style.setProperty('--scrollbar-height', `${scrollbarHeight}px`);
    scrollbarRef.current.style.setProperty('--scrollbar-top', `${scrollbarTop}px`);
  }, []);

  const onDragStart = useCallback((e) => {
    const clientY = e.clientY || e.touches[0].clientY;
    const safeHeight = window.innerHeight;
    const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const maxScrollTop = documentHeight - safeHeight;
    
    if (maxScrollTop <= 0) return;
    
    setIsDragging(true);
    dragRef.current.start.y = clientY;
    dragRef.current.start.scroll = Math.max(0, Math.min(1, window.scrollY / maxScrollTop));
    
    if (scrollbarRef.current) {
      scrollbarRef.current.classList.add('is-dragging');
    }
    e.preventDefault();
  }, []);

  const onDragMove = useCallback((e) => {
    if (!isDragging) return;

    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (!clientY) return;
    
    const safeHeight = window.innerHeight;
    const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const maxScrollTop = documentHeight - safeHeight;
    
    if (maxScrollTop <= 0) return;
    
    const dragDelta = clientY - dragRef.current.start.y;
    const dragProgress = dragDelta / safeHeight;
    const newScrollProgress = Math.max(0, Math.min(1, dragRef.current.start.scroll + dragProgress));
    const scrollMove = newScrollProgress * maxScrollTop;

    window.scrollTo(0, scrollMove);
    e.preventDefault();
  }, [isDragging]);

  const onDragEnd = useCallback((e) => {
    if (!isDragging) return;

    setIsDragging(false);
    if (scrollbarRef.current) {
      scrollbarRef.current.classList.remove('is-dragging');
    }
    e.preventDefault();
  }, [isDragging]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollbar();
      emitter.emit('scroll'); // Emitir evento como en el original
    };
    const handleResize = () => {
      setScrollbar();
      emitter.emit('resize'); // Emitir evento como en el original
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);

    // Set initial scrollbar
    setScrollbar();

    // Add class to html (como en el original Astro)
    document.documentElement.classList.add('has-scrollbar');

    // Emitter events del original
    emitter.on('resize', setScrollbar);
    emitter.on('scroll', setScrollbar);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      document.removeEventListener('touchmove', onDragMove);
      document.removeEventListener('touchend', onDragEnd);
      document.documentElement.classList.remove('has-scrollbar');
      emitter.off('resize', setScrollbar);
      emitter.off('scroll', setScrollbar);
    };
  }, [setScrollbar, onDragMove, onDragEnd]);

  return (
    <Box
      ref={scrollbarRef}
      className="site-scrollbar"
      sx={{
        '--border-width': '16px',
        '--scrollbar-height': '0px',
        '--scrollbar-top': '0px',
        
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 20,
        width: 'var(--border-width)',
        height: '100%',
        scale: '1 1',
        transition: 'scale 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'scale',
        
        '@media (max-width: 768px)': {
          '--border-width': '8px',
        },
        
        '&.is-dragging': {
          cursor: 'grabbing',
          '& .scrollbar-thumb': {
            cursor: 'grabbing',
            '&::after': {
              width: 'calc(var(--border-width) - 2px)',
              backgroundColor: '#fff',
            },
          },
        },
      }}
    >
      {/* Track */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          pointerEvents: 'none',
        }}
      />
      
      {/* Thumb */}
      <Box
        ref={thumbRef}
        className="scrollbar-thumb"
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          zIndex: 3,
          width: 'calc(var(--border-width) * 0.5)',
          height: 'var(--scrollbar-height)',
          cursor: 'grab',
          transform: 'translateX(-50%) translateY(var(--scrollbar-top))',
          scale: '1 1',
          transition: 'scale 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.07s linear',
          willChange: 'opacity, scale, transform',
          
          // Estado de transición (como en el original)
          '.is-transitioning &': {
            scale: '0 1',
          },
          
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 'calc(var(--border-width) * -1)',
            left: 'calc(50% - var(--border-width) * 0.5)',
            width: 'var(--border-width)',
            height: 'calc(100% + var(--border-width))',
          },
          
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 'var(--border-width)',
            bottom: 'var(--border-width)',
            left: '50%',
            width: '100%',
            height: 'auto',
            backgroundColor: '#000',
            borderRadius: 'inherit',
            transform: 'translateX(-50%)',
            transition: 'width 0.1s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'background, width',
          },
          
          '&:hover::after': {
            width: 'calc(var(--border-width) - 2px)',
          },
        }}
      />
    </Box>
  );
};

const MyWaySection = ({ onBack, onBackToGalleries }) => {
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [distortion, setDistortion] = useState(50);

  const boundingRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const scrollRef = useRef({ start: 0, end: 0, p: 0, sp: 0 });

  const setSize = useCallback(() => {
    if (!sectionRef.current) return;

    const bounding = sectionRef.current.getBoundingClientRect();
    boundingRef.current = {
      left: bounding.left,
      top: bounding.top,
      width: bounding.width,
      height: bounding.height,
    };
  }, []);

  const setScroll = useCallback(() => {
    const bounding = boundingRef.current;
    scrollRef.current = {
      start: bounding.top + window.scrollY,
      end: bounding.top + window.scrollY + bounding.height + window.innerHeight,
      p: 0,
      sp: 0,
    };
  }, []);

  const onScroll = useCallback((scrollY) => {
    const scroll = scrollRef.current;
    const trigger = scrollY + window.innerHeight;

    if (trigger < scroll.start) {
      scroll.p = 0;
    } else if (trigger > scroll.end) {
      scroll.p = 1;
    } else {
      scroll.p = (trigger - scroll.start) / (scroll.end - scroll.start);
    }
  }, []);

  const tick = useCallback(() => {
    const scroll = scrollRef.current;
    scroll.sp += (scroll.p - scroll.sp) * 0.1;
    setScrollProgress(scroll.sp);
  }, []);

  useEffect(() => {
    ticker.init();

    const init = () => {
      setSize();
      setScroll();

      const handleScroll = () => onScroll(window.scrollY);
      const handleResize = () => {
        setSize();
        setScroll();
        emitter.emit('resize');
      };

      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      emitter.on('tick', tick);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        emitter.off('tick', tick);
      };
    };

    const cleanup = init();
    return cleanup;
  }, [setSize, setScroll, onScroll, tick]);

  return (
    <>
      <CustomScrollbar />
      
      <Box
        ref={sectionRef}
        sx={{
          '--padding': '40rem', // Restaurado al tamaño original
          '--scroll-progress': scrollProgress,
          '--distortion': distortion,
          
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 3,
          padding: 'calc(var(--padding) * 0.5) 0 calc(var(--padding) * 1)', // Reducido padding
          minHeight: '200vh', // Reducido de 300vh a 200vh
          background: '#f5f5f5',

          '@media (max-width: 768px)': {
            '--padding': '10rem', // Reducido para móvil
            minHeight: '150vh',
          }
        }}
      >
        {/* Líneas de profundidad de fondo */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            overflow: 'hidden',
          }}
        >
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            {/* Líneas verticales de profundidad */}
            {Array.from({ length: 20 }, (_, i) => (
              <line
                key={`depth-v-${i}`}
                x1={`${(i / 19) * 100}%`}
                y1="0%"
                x2={`${(i / 19) * 100}%`}
                y2="100%"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="1"
              />
            ))}
            {/* Líneas horizontales de profundidad */}
            {Array.from({ length: 15 }, (_, i) => (
              <line
                key={`depth-h-${i}`}
                x1="0%"
                y1={`${(i / 14) * 100}%`}
                x2="100%"
                y2={`${(i / 14) * 100}%`}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="1"
              />
            ))}
            {/* Líneas radiantes desde el centro */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const centerX = 50;
              const centerY = 50;
              const endX = centerX + Math.cos(angle) * 50;
              const endY = centerY + Math.sin(angle) * 50;
              return (
                <line
                  key={`radial-${i}`}
                  x1={`${centerX}%`}
                  y1={`${centerY}%`}
                  x2={`${endX}%`}
                  y2={`${endY}%`}
                  stroke="rgba(0,0,0,0.05)"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </Box>

        {/* Waves Background */}
        <WavesComponent 
          className="waves-background"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }} 
        />

        {/* EL TEXTO PRINCIPAL CON MATRIX3D */}
        <Box
          sx={{
            '--amplitude': '50%',
            '--offset': '15%', // Restaurado
            position: 'absolute',
            bottom: 0,
            left: 0,
            zIndex: 2,
            width: '100%',
            height: 'calc(var(--padding) * 1.05 + 5rem)', // Restaurado
            perspective: 'calc(var(--distortion) * 0.85em)',
            userSelect: 'none',
            fontFamily: '"Impact", "Arial Black", sans-serif',
            fontWeight: 700,
            fontSize: 'calc(var(--padding) * 1.2)', // Restaurado al tamaño original
            lineHeight: 0.82,
            textAlign: 'center',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',

            '@media (max-width: 768px)': {
              '--amplitude': '75%',
              '--offset': '27.5%',
              perspective: 'calc(var(--distortion) * 1.05em)',
              fontSize: 'calc(var(--padding) * 0.75)', // Restaurado
            }
          }}
        >
          {/* Distorted wrapper */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: 'calc(var(--padding) * 1.5)', // Restaurado
              overflow: 'hidden',
              perspective: 'calc(var(--distortion) * 0.7em)',

              '@media (max-width: 768px)': {
                perspective: 'calc(var(--distortion) * 0.85em)',
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: '-100%',
                width: '300%',
                height: 'calc(var(--padding) * 1.05 + 5rem)', // Restaurado
                transformOrigin: '50% 100%',
                transform: `matrix3d(
                  1,
                  0,
                  0,
                  0,
                  0,
                  1,
                  var(--distortion),
                  0,
                  0,
                  0,
                  1,
                  0,
                  0,
                  0,
                  0,
                  1
                )`,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  willChange: 'transform',
                  color: '#000',
                  transform: `translate3d(
                    0,
                    calc(var(--scroll-progress) * var(--amplitude) - var(--offset)),
                    0
                  )`,
                }}
              >
                Project <br />
                under <br />
                creation <br />
                <Box component="span" sx={{ color: '#ff0000', fontSize: '1.2em' }}>
                  404
                </Box>
                
                {/* Botón volver a galerías debajo del 404 */}
                <Box
                  sx={{
                    marginTop: '2rem',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    component="button"
                    onClick={onBackToGalleries}
                    sx={{
                      padding: '12px 24px',
                      backgroundColor: '#000',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      fontFamily: 'inherit',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#333',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    ← Volver a las galerías
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Normal wrapper */}
          <Box
            sx={{
              position: 'absolute',
              top: 'calc(100% - 1px)',
              left: 0,
              width: '100%',
              height: 'calc(100% + 100vh)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '300%',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  willChange: 'transform',
                  color: '#000',
                  transform: `translate3d(
                    0,
                    calc(
                      var(--scroll-progress) * var(--amplitude) - 100% - var(--offset)
                    ),
                    0
                  )`,
                }}
              >
                Project <br />
                under <br />
                creation <br />
                <Box component="span" sx={{ color: '#ff0000', fontSize: '1.2em' }}>
                  404
                </Box>
                
                {/* Botón duplicado para el wrapper normal */}
                <Box
                  sx={{
                    marginTop: '2rem',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    component="button"
                    onClick={onBackToGalleries}
                    sx={{
                      padding: '12px 24px',
                      backgroundColor: '#000',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      fontFamily: 'inherit',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#333',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    ← Volver a las galerías
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Botón volver arriba (fijo) */}
        <button 
          onClick={onBack}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            padding: '12px 24px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#333';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#000';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Volver al carrusel
        </button>
      </Box>
    </>
  );
};

export default MyWaySection;
