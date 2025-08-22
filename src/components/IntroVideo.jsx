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
});

const Video = styled('video')(({ zoomScale }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 0,
  transform: `scale(${zoomScale})`,
  transition: 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)',
  transformOrigin: 'center center',
}));

const FinalImage = styled('div')(({ opacity }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundImage: `url("./images/blua_constelaciones_finales.jpg")`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  opacity: opacity,
  transition: 'opacity 0.3s ease-out',
  zIndex: 1,
  transform: 'scale(1)',
  transformOrigin: 'center center',
}));

function IntroVideo({ onIntroComplete }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const callbackFiredRef = useRef(false);
  const finalImageUrl = "./images/blua_constelaciones_finales.jpg";
  const videoLoadedRef = useRef(false);
  const videoEndedRef = useRef(false);
  const zoomStartedRef = useRef(false);
  
  // Estados
  const [imageOpacity, setImageOpacity] = useState(0);
  const [videoDuration, setVideoDuration] = useState(6);
  const [isMobile, setIsMobile] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoZoomScale, setVideoZoomScale] = useState(1); // Nuevo estado para el zoom
  
  // Configuración del zoom
  const ZOOM_START_TIME = 2.0; // Segundos antes del final para empezar el zoom
  const MAX_ZOOM_SCALE = 1.75; // Escala máxima del zoom (1.5 = 150%)
  
  // DETECCIÓN MEJORADA DE MÓVIL
  useEffect(() => {
    const detectMobile = () => {
      // Múltiples métodos de detección
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/.test(userAgent);
      
      // Detección por tamaño de pantalla
      const isMobileScreen = window.innerWidth <= 768 || window.innerHeight <= 896;
      
      // Detección por orientación (portrait en móviles)
      const isPortrait = window.innerHeight > window.innerWidth;
      
      // Detección de touch
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Es móvil si cumple con user agent Y (pantalla pequeña O es portrait) Y tiene touch
      const mobile = isMobileUA && (isMobileScreen || isPortrait) && hasTouch;
      
      console.log('🔍 DETECCIÓN MÓVIL:', {
        userAgent: isMobileUA,
        screen: isMobileScreen,
        portrait: isPortrait,
        touch: hasTouch,
        resultado: mobile,
        dimensions: `${window.innerWidth}x${window.innerHeight}`
      });
      
      setIsMobile(mobile);
      
      // Establecer URL del video inmediatamente
      const newVideoUrl = mobile ? "/videos/entradaweb_vertical.mp4" : "/videos/ENTRADA_WEB2.2.mp4";
      setVideoUrl(newVideoUrl);
      
      console.log(`📱 DISPOSITIVO: ${mobile ? 'MÓVIL' : 'DESKTOP'}`);
      console.log(`🎬 VIDEO URL: ${newVideoUrl}`);
      
      return mobile;
    };
    
    // Ejecutar detección inmediatamente
    const mobile = detectMobile();
    
    // Escuchar cambios
    const handleResize = () => {
      setTimeout(detectMobile, 100); // Pequeño delay para que se actualicen las dimensiones
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  // Precargar la imagen final
  useEffect(() => {
    const img = new Image();
    img.src = finalImageUrl;
    img.importance = "high";
    
    const safetyTimer = setTimeout(() => {
      if (!callbackFiredRef.current && !videoEndedRef.current && videoLoadedRef.current) {
        console.log("⚠️ Timer de seguridad activado");
        setImageOpacity(1);
        triggerTransition();
      }
    }, (videoDuration + 5) * 1000);
    
    return () => clearTimeout(safetyTimer);
  }, [videoDuration]);
  
  // CONFIGURACIÓN Y REPRODUCCIÓN DEL VIDEO
  useEffect(() => {
    if (!videoUrl) return; // Esperar a que se establezca la URL
    
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    console.log(`🎬 CONFIGURANDO VIDEO: ${videoUrl}`);
    
    // CONFIGURACIONES CRÍTICAS PARA MÓVILES
    videoElement.muted = true; // CRÍTICO para autoplay en móviles
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.preload = "auto";
    
    // Atributos adicionales para móviles
    videoElement.setAttribute('autoplay', '');
    videoElement.setAttribute('muted', '');
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('webkit-playsinline', 'true');
    videoElement.setAttribute('x5-playsinline', 'true');
    videoElement.setAttribute('x5-video-player-type', 'h5');
    videoElement.setAttribute('x5-video-player-fullscreen', 'false');
    
    // ESTABLECER LA FUENTE DEL VIDEO
    videoElement.src = videoUrl;
    
    // Event Listeners
    const handleCanPlay = () => {
      console.log(`✅ Video listo: ${isMobile ? 'MÓVIL' : 'DESKTOP'}`);
      videoLoadedRef.current = true;
    };
    
    const handleLoadedMetadata = () => {
      if (videoElement.duration && videoElement.duration !== Infinity) {
        console.log(`⏱️ Duración del video:`, videoElement.duration);
        setVideoDuration(videoElement.duration);
      }
      videoLoadedRef.current = true;
    };
    
    const handleTimeUpdate = () => {
      const currentTime = videoElement.currentTime;
      const duration = videoElement.duration || 6;
      const timeUntilEnd = duration - currentTime;
      
      // Aplicar zoom en los últimos frames - una sola vez
      if (timeUntilEnd <= ZOOM_START_TIME && !zoomStartedRef.current) {
        zoomStartedRef.current = true;
        setVideoZoomScale(MAX_ZOOM_SCALE);
        console.log(`🔍 Zoom iniciado: ${MAX_ZOOM_SCALE}x`);
      }
      
      if (currentTime >= duration - 0.1) {
        console.log("📹 Video cerca del final");
      }
    };
    
    const handleEnded = () => {
      console.log(`✅ VIDEO TERMINADO - ${isMobile ? 'MÓVIL' : 'DESKTOP'}`);
      videoEndedRef.current = true;
      setImageOpacity(1);
      
      if (!callbackFiredRef.current) {
        triggerTransition();
      }
    };
    
    const handleError = (e) => {
      console.error(`❌ Error en video ${isMobile ? 'MÓVIL' : 'DESKTOP'}:`, e);
      if (videoLoadedRef.current && !videoEndedRef.current && !callbackFiredRef.current) {
        console.log("🚨 Activando transición de emergencia");
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
    
    // INICIAR REPRODUCCIÓN INMEDIATA
    const startPlayback = async () => {
      try {
        console.log(`🚀 Iniciando reproducción automática - ${isMobile ? 'MÓVIL' : 'DESKTOP'}`);
        
        // Para móviles, asegurar que esté muted
        if (isMobile) {
          videoElement.muted = true;
          videoElement.volume = 0;
        }
        
        await videoElement.play();
        console.log(`✅ Reproducción iniciada exitosamente - ${isMobile ? 'MÓVIL' : 'DESKTOP'}`);
        
      } catch (error) {
        console.error("❌ Error al iniciar reproducción:", error);
        
        // FALLBACK: Intentar con interacción del usuario si falla autoplay
        const handleUserInteraction = async (event) => {
          try {
            console.log("👆 Intento de reproducción con interacción del usuario");
            await videoElement.play();
            console.log("✅ Reproducción iniciada con interacción del usuario");
            
            // Remover listeners una vez que funcione
            document.removeEventListener('touchstart', handleUserInteraction);
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
            
          } catch (e) {
            console.error("❌ Error incluso con interacción:", e);
          }
        };
        
        // Agregar múltiples tipos de eventos de interacción
        document.addEventListener('touchstart', handleUserInteraction, { once: true });
        document.addEventListener('click', handleUserInteraction, { once: true });
        document.addEventListener('keydown', handleUserInteraction, { once: true });
        
        console.log("⏳ Esperando interacción del usuario para reproducir video");
      }
    };
    
    // Ejecutar inmediatamente
    startPlayback();
    
    // Cleanup
    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('error', handleError);
    };
  }, [videoUrl, isMobile]); // Depender de videoUrl e isMobile
  
  // Función para manejar la transición final
  const triggerTransition = () => {
    if (callbackFiredRef.current) return;
    
    callbackFiredRef.current = true;
    console.log(`🎬 Ejecutando transición final - ${isMobile ? 'MÓVIL' : 'DESKTOP'}`);
    
    setImageOpacity(1);
    
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    if (onIntroComplete) {
      onIntroComplete(finalImageUrl);
    }
    
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.transition = 'opacity 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
        containerRef.current.style.opacity = '0';
      }
    }, 50);
    
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.display = 'none';
      }
    }, 1600);
  };
  
  return (
    <VideoContainer ref={containerRef}>
      <Video
        ref={videoRef}
        zoomScale={videoZoomScale}
        autoPlay
        muted
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="false"
        controls={false} // CRÍTICO: Sin controles para evitar botón play
      >
        {/* Fallback si no carga */}
        Tu navegador no soporta videos.
      </Video>
      
      <FinalImage opacity={imageOpacity} />
    </VideoContainer>
  );
}

export default IntroVideo;