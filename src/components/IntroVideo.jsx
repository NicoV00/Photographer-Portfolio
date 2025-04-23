import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const VideoContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 2000,
  backgroundColor: '#000',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  pointerEvents: 'none',
});

const Video = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
});

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
  zIndex: 2001,
  pointerEvents: 'auto', // Make sure it's clickable
  transition: 'all 0.3s ease',
  border: '2px solid white',
  boxShadow: isMuted ? 'none' : '0 0 15px rgba(255, 255, 255, 0.5)',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: isMuted ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.7)',
  },
  // Add a pulsing animation when muted to draw attention
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
  
  // Start with audio muted
  const [isMuted, setIsMuted] = useState(true);
  
  // IMPORTANTE: Iniciar la transición inmediatamente al montar el componente
  useEffect(() => {
    // Precargar la imagen crítica en segundo plano
    const img = new Image();
    img.src = finalImageUrl;
    
    // Establecer un timer de seguridad para garantizar que la transición
    // comenzará incluso si el video no termina correctamente
    const safetyTimer = setTimeout(() => {
      if (!callbackFiredRef.current) {
        console.log("Timer de seguridad activado - iniciando transición");
        triggerTransition();
      }
    }, 10000); // 10 segundos máximo para el video
    
    return () => clearTimeout(safetyTimer);
  }, []);
  
  // Configure Media Session API for browser tab controls
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !navigator.mediaSession) return;

    // Set up media session metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Intro Video',
      artist: 'Your Brand Name',
      album: 'Website Intro',
      artwork: [
        { src: '/images/thumbnail.png', sizes: '96x96', type: 'image/png' }
      ]
    });

    // Define media session action handlers
    navigator.mediaSession.setActionHandler('play', () => {
      videoElement.play();
      navigator.mediaSession.playbackState = 'playing';
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      videoElement.pause();
      navigator.mediaSession.playbackState = 'paused';
    });

    // Handle mute/unmute through the system controls
    const handleVolumeChange = () => {
      setIsMuted(videoElement.muted);
    };

    videoElement.addEventListener('volumechange', handleVolumeChange);

    return () => {
      videoElement.removeEventListener('volumechange', handleVolumeChange);
      
      // Clean up media session
      if (navigator.mediaSession) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      }
    };
  }, []);

  // Manejar el video de forma agresiva
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement) return;
    
    // Ensure video starts muted
    videoElement.muted = true;
    
    // Escuchar por el evento de tiempo actualizado para detectar el final más rápido
    const handleTimeUpdate = () => {
      const videoDuration = videoElement.duration;
      const currentTime = videoElement.currentTime;
      
      // Si estamos cerca del final del video (últimos 0.5 segundos), iniciar transición
      if (videoDuration > 0 && currentTime >= videoDuration - 0.5) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        triggerTransition();
      }
    };
    
    // También escuchar el evento ended como respaldo
    const handleVideoEnd = () => {
      console.log("Video terminado - iniciando transición");
      triggerTransition();
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleVideoEnd);
    
    // Start playing muted right away (should work in all browsers)
    videoElement.play().catch(error => {
      console.error("Error de autoplay incluso con silencio:", error);
      // Si falla el autoplay, iniciar la transición pronto
      setTimeout(triggerTransition, 300);
    });

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleVideoEnd);
    };
  }, []);
  
  // Función para disparar la transición una sola vez
  const triggerTransition = () => {
    if (callbackFiredRef.current) return;
    
    callbackFiredRef.current = true;
    console.log("INICIANDO TRANSICIÓN INMEDIATA");
    
    // Comenzar a ocultar el contenedor de video inmediatamente
    if (containerRef.current) {
      containerRef.current.style.opacity = '0';
      containerRef.current.style.transition = 'opacity 0.3s';
    }
    
    // Notificar sin demora al componente App
    if (onIntroComplete) {
      onIntroComplete(finalImageUrl);
    }
    
    // Ocultar completamente el contenedor después de un breve desvanecimiento
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.display = 'none';
      }
    }, 300);
  };

  // Toggle mute/unmute with enhanced functionality
  const toggleMute = (e) => {
    e.stopPropagation(); // Prevent event from bubbling
    
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (videoRef.current) {
      videoRef.current.muted = newMutedState;
      
      // If we're unmuting, try to play again in case it was paused
      if (!newMutedState) {
        videoRef.current.play().catch(err => {
          console.error("No se pudo reproducir el video después de desmutear:", err);
          // If audio fails to play, revert to muted state
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
        <source src="/videos/ENTRADA WEB-1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </Video>
      
      {/* Enhanced sound control button */}
      <SoundButton onClick={toggleMute} isMuted={isMuted}>
        {isMuted ? <UnmuteIcon /> : <MuteIcon />}
      </SoundButton>
    </VideoContainer>
  );
}

export default IntroVideo;
