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
  zIndex: 0, // Detrás de FinalImage y SoundButton
});

const FinalImage = styled('div')(({ opacity }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundImage: `url("./images/blua_constelaciones_finales.jpg")`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  opacity: opacity,
  transition: 'opacity 0.8s ease-in-out',
  zIndex: 1, // Encima del video, debajo del botón de sonido
}));

// Enhanced sound control button with better visibility
const SoundButton = styled(Box)(({ isMuted }) => ({
  position: 'absolute',
  bottom: '30px',
  right: '30px',
  width: '50px',
  height: '50px',
  backgroundColor: isMuted ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.5)',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  zIndex: 2001, // Siempre encima
  pointerEvents: 'auto', // Asegurar que sea clickeable
  transition: 'all 0.3s ease',
  border: '2px solid white',
  boxShadow: isMuted ? 'none' : '0 0 15px rgba(255, 255, 255, 0.5)',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: isMuted ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.7)',
  },
  animation: isMuted ? 'pulse 2s infinite' : 'none',
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.4)'
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(255, 255, 255, 0)'
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)'
    }
  }
}));

// Mute icon (speaker with X)
const MuteIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 5L6 9H2V15H6L11 19V5Z" />
    <path d="M23 9L17 15" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M17 9L23 15" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// Unmute icon (speaker with waves)
const UnmuteIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 5L6 9H2V15H6L11 19V5Z" />
    <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.07 5.93C20.9447 7.80528 21.9979 10.3447 21.9979 13C21.9979 15.6553 20.9447 18.1947 19.07 20.07" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function IntroVideo({ onIntroComplete }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const callbackFiredRef = useRef(false);
  const finalImageUrl = "./images/blua_constelaciones_finales.jpg";
  const videoLoadedRef = useRef(false);
  
  // Estados
  const [isMuted, setIsMuted] = useState(true);
  const [imageOpacity, setImageOpacity] = useState(0);
  const [videoDuration, setVideoDuration] = useState(6); // Duración predeterminada
  
  // Precargar la imagen final inmediatamente
  useEffect(() => {
    const img = new Image();
    img.src = finalImageUrl;
    img.importance = "high"; // Marcar como alta prioridad
    
    // Timer de seguridad (solo como respaldo)
    const safetyTimer = setTimeout(() => {
      if (!callbackFiredRef.current && videoLoadedRef.current) {
        console.log("Timer de seguridad activado después de carga completa");
        triggerTransition();
      }
    }, videoDuration * 1000 + 500); // Duración del video + pequeño margen
    
    return () => clearTimeout(safetyTimer);
  }, [videoDuration]);
  
  // Inicializar reproducción de video
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    // Configuraciones iniciales
    videoElement.muted = true;
    videoElement.preload = "auto";
    videoElement.playsInline = true;
    videoElement.setAttribute('playsinline', '');
    
    // Detectar cuando el video está listo
    const handleCanPlay = () => {
      console.log("Video listo para reproducir");
      videoLoadedRef.current = true;
    };
    
    // Actualizar duración real del video cuando esté disponible
    const handleLoadedMetadata = () => {
      if (videoElement.duration && videoElement.duration !== Infinity) {
        console.log("Duración del video:", videoElement.duration);
        setVideoDuration(videoElement.duration);
      }
      videoLoadedRef.current = true;
    };
    
    // Monitorear el tiempo para detectar el final y controlar la transición
    const handleTimeUpdate = () => {
      const currentTime = videoElement.currentTime;
      const duration = videoElement.duration || 6;
      
      // Comenzar a mostrar la imagen en el último segundo
      if (currentTime >= duration - 1) {
        const fadeProgress = Math.min((currentTime - (duration - 1)) / 0.7, 1);
        setImageOpacity(fadeProgress);
        
        // Iniciar transición cuando estemos muy cerca del final
        if (currentTime >= duration - 0.1 && !callbackFiredRef.current) {
          console.log("Video cerca del final, iniciando transición");
          triggerTransition();
        }
      }
    };
    
    // Detectar fin del video
    const handleEnded = () => {
      console.log("Video terminado");
      if (!callbackFiredRef.current) {
        triggerTransition();
      }
    };
    
    // Manejar errores
    const handleError = (e) => {
      console.error("Error en el video:", e);
      if (videoLoadedRef.current && !callbackFiredRef.current) {
        triggerTransition();
      }
    };
    
    // Registrar eventos
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('error', handleError);
    
    // Iniciar reproducción con un pequeño retraso para asegurar carga
    setTimeout(() => {
      videoElement.play().catch(error => {
        console.error("Error al iniciar reproducción:", error);
      });
    }, 100);
    
    // Limpiar eventos
    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('error', handleError);
    };
  }, []);
  
  // Función para manejar la transición final
  const triggerTransition = () => {
    if (callbackFiredRef.current) return;
    
    callbackFiredRef.current = true;
    console.log("Ejecutando transición final");
    
    // Asegurar que la imagen esté completamente visible
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
        containerRef.current.style.transition = 'opacity 1s ease-in-out';
        containerRef.current.style.opacity = '0';
      }
    }, 50); // Tiempo mínimo para que App reaccione
    
    // Finalmente ocultar el contenedor
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.display = 'none';
      }
    }, 1100); // Después de completar la transición
  };
  
  // Manejar cambio de mute/unmute
  const toggleMute = (e) => {
    e.stopPropagation();
    
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (videoRef.current) {
      videoRef.current.muted = newMutedState;
      
      if (!newMutedState) {
        videoRef.current.play().catch(err => {
          console.error("Error al reproducir con audio:", err);
          videoRef.current.muted = true;
          setIsMuted(true);
        });
      }
    }
  };
  
  return (
    <VideoContainer ref={containerRef}>
      <Video
        ref={videoRef}
        autoPlay
        muted={isMuted}
        playsInline
      >
        <source src="/videos/ENTRADA_WEB2.1.mp4" type="video/mp4" />
        Tu navegador no soporta videos.
      </Video>
      
      {/* Imagen final con opacidad controlada */}
      <FinalImage opacity={imageOpacity} />
      
      {/* Botón de sonido */}
      <SoundButton onClick={toggleMute} isMuted={isMuted}>
        {isMuted ? <UnmuteIcon /> : <MuteIcon />}
      </SoundButton>
    </VideoContainer>
  );
}

export default IntroVideo;
