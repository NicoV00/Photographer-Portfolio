import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const VideoContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 2000, // Debe estar por encima del contenido principal
  backgroundColor: '#000',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
});

const Video = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 0, // Detrás de FinalImage
});

const FinalImage = styled('div')(({ opacity }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundImage: `url("./images/blua_constelaciones_finales.jpg")`,
  backgroundSize: 'cover', // IGUAL que el video para continuidad perfecta
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  opacity: opacity,
  transition: 'opacity 0.3s ease-out', // Transición aún más rápida para entrada instantánea
  zIndex: 1, // Encima del video
  // Asegurar que no hay escalado adicional
  transform: 'scale(1)',
  transformOrigin: 'center center',
}));

function IntroVideo({ onIntroComplete }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const callbackFiredRef = useRef(false);
  const finalImageUrl = "./images/blua_constelaciones_finales.jpg";
  const videoLoadedRef = useRef(false);
  const videoEndedRef = useRef(false); // Nueva referencia para controlar el final
  
  // Estados
  const [imageOpacity, setImageOpacity] = useState(0);
  const [videoDuration, setVideoDuration] = useState(6); // Duración predeterminada
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      // Múltiples formas de detectar móvil para mayor precisión
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
      
      // También verificar por tamaño de pantalla y orientación
      const isMobileScreen = window.innerWidth <= 768 || 
                           (window.innerHeight > window.innerWidth && window.innerWidth <= 1024);
      
      // Verificar si tiene capacidad táctil
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Determinar si es móvil basándose en múltiples factores
      const mobile = (isMobileUA || isMobileScreen) && hasTouch;
      
      setIsMobile(mobile);
      console.log(`📱 Dispositivo detectado: ${mobile ? 'MÓVIL' : 'DESKTOP'}`);
      console.log(`📐 Dimensiones: ${window.innerWidth}x${window.innerHeight}`);
    };
    
    checkMobile();
    
    // Escuchar cambios de orientación
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);
  
  // Obtener la URL del video según el dispositivo
  const getVideoUrl = () => {
    if (isMobile) {
      return "/videos/entradaweb_vertical.mp4"; // VIDEO VERTICAL PARA MÓVIL
    }
    return "/videos/ENTRADA_WEB2.2.mp4"; // VIDEO HORIZONTAL PARA DESKTOP
  };
  
  // Precargar la imagen final inmediatamente
  useEffect(() => {
    const img = new Image();
    img.src = finalImageUrl;
    img.importance = "high"; // Marcar como alta prioridad
    
    // Timer de seguridad - solo si el video NO terminó naturalmente
    const safetyTimer = setTimeout(() => {
      if (!callbackFiredRef.current && !videoEndedRef.current && videoLoadedRef.current) {
        console.log("⚠️ Timer de seguridad: forzando finalización");
        setImageOpacity(1);
        triggerTransition();
      }
    }, (videoDuration + 5) * 1000); // Duración del video + 5 segundos para estar seguros
    
    return () => clearTimeout(safetyTimer);
  }, [videoDuration]);
  
  // Inicializar reproducción de video
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    // Configuraciones iniciales - SIN SONIDO
    videoElement.muted = true;
    videoElement.preload = "auto";
    videoElement.playsInline = true;
    videoElement.setAttribute('playsinline', '');
    
    // Importante para móviles: evitar controles nativos
    videoElement.setAttribute('webkit-playsinline', 'true');
    videoElement.setAttribute('x5-playsinline', 'true');
    videoElement.setAttribute('x5-video-player-type', 'h5');
    videoElement.setAttribute('x5-video-player-fullscreen', 'false');
    
    // Cambiar la fuente del video según el dispositivo
    const videoUrl = getVideoUrl();
    console.log(`🎬 Cargando video: ${videoUrl}`);
    
    // Detectar cuando el video está listo
    const handleCanPlay = () => {
      console.log(`Video ${isMobile ? 'MÓVIL' : 'DESKTOP'} listo para reproducir`);
      videoLoadedRef.current = true;
    };
    
    // Actualizar duración real del video cuando esté disponible
    const handleLoadedMetadata = () => {
      if (videoElement.duration && videoElement.duration !== Infinity) {
        console.log(`Duración del video ${isMobile ? 'MÓVIL' : 'DESKTOP'}:`, videoElement.duration);
        setVideoDuration(videoElement.duration);
      }
      videoLoadedRef.current = true;
    };
    
    // NO hacer nada durante la reproducción - dejar que se reproduzca completo
    const handleTimeUpdate = () => {
      // Solo para debug, NO para mostrar imagen
      const currentTime = videoElement.currentTime;
      const duration = videoElement.duration || 6;
      
      // Verificar que estamos cerca del final pero AÚN no mostrar imagen
      if (currentTime >= duration - 0.1) {
        console.log("Video cerca del final, esperando evento 'ended'");
      }
    };
    
    // SOLO cuando el video termine COMPLETAMENTE
    const handleEnded = () => {
      console.log(`✅ VIDEO ${isMobile ? 'MÓVIL' : 'DESKTOP'} TERMINADO COMPLETAMENTE - Mostrando imagen`);
      videoEndedRef.current = true;
      
      // INMEDIATAMENTE mostrar la imagen
      setImageOpacity(1);
      
      if (!callbackFiredRef.current) {
        triggerTransition();
      }
    };
    
    // Manejar errores - solo si el video ya cargó y no terminó
    const handleError = (e) => {
      console.error(`Error en el video ${isMobile ? 'MÓVIL' : 'DESKTOP'}:`, e);
      if (videoLoadedRef.current && !videoEndedRef.current && !callbackFiredRef.current) {
        console.log("Error: activando transición de emergencia");
        setImageOpacity(1);
        triggerTransition();
      }
    };
    
    // Registrar eventos
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('error', handleError);
    
    // Iniciar reproducción con manejo especial para móviles
    const startPlayback = async () => {
      try {
        // En móviles, a veces necesitamos un pequeño delay
        if (isMobile) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        await videoElement.play();
        console.log(`✅ Video ${isMobile ? 'MÓVIL' : 'DESKTOP'} reproduciendo`);
      } catch (error) {
        console.error("Error al iniciar reproducción:", error);
        
        // En móviles, intentar con interacción del usuario si falla
        if (isMobile) {
          const handleFirstTouch = async () => {
            try {
              await videoElement.play();
              document.removeEventListener('touchstart', handleFirstTouch);
              document.removeEventListener('click', handleFirstTouch);
            } catch (e) {
              console.error("Error al reproducir con touch:", e);
            }
          };
          
          document.addEventListener('touchstart', handleFirstTouch, { once: true });
          document.addEventListener('click', handleFirstTouch, { once: true });
        }
      }
    };
    
    // Pequeño delay antes de intentar reproducir
    setTimeout(startPlayback, 100);
    
    // Limpiar eventos
    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('error', handleError);
    };
  }, [isMobile]); // Re-ejecutar cuando cambie isMobile
  
  // Función para manejar la transición final
  const triggerTransition = () => {
    if (callbackFiredRef.current) return;
    
    callbackFiredRef.current = true;
    console.log(`Ejecutando transición final ${isMobile ? 'MÓVIL' : 'DESKTOP'}`);
    
    // Solo asegurar opacidad si no se ha hecho ya
    setImageOpacity(1);
    
    // Pausar video para conservar recursos
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    // PRIMERO notificar al componente App para que prepare la siguiente vista
    // Es crítico que esto ocurra antes de desvanecer el contenedor
    if (onIntroComplete) {
      onIntroComplete(finalImageUrl);
    }
    
    // DESPUÉS iniciar el desvanecimiento de este contenedor
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.transition = 'opacity 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
        containerRef.current.style.opacity = '0';
      }
    }, 50); // Tiempo mínimo para que App reaccione
    
    // Finalmente ocultar el contenedor
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.display = 'none';
      }
    }, 1600); // Después de completar la transición más larga
  };
  
  return (
    <VideoContainer ref={containerRef}>
      <Video
        ref={videoRef}
        autoPlay
        muted={true}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
      >
        <source src={getVideoUrl()} type="video/mp4" />
        Tu navegador no soporta videos.
      </Video>
      
      {/* Imagen final que se superpone al video */}
      <FinalImage opacity={imageOpacity} />
    </VideoContainer>
  );
}

export default IntroVideo;
