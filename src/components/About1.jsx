import React, { useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import AnimatedCarousel from "./AnimatedCarousel";

// Componente simplificado sin retrasos
const About1 = ({ 
  setIndex, 
  setShowCollection, 
  setCollection, 
  setActiveGalleryColor,
  initialTransition = false,
  initialImageUrl = null,
  onTransitionComplete = null,
  onCarouselReady = null
}) => {
  
  // Notificar INMEDIATAMENTE que el componente está listo
  useEffect(() => {
    // Llamar al callback inmediatamente
    if (onCarouselReady) {
      console.log("About1: Notificando que está listo");
      onCarouselReady();
    }
    
    // También notificar que la transición ha completado si no hay transición inicial
    if (!initialTransition && onTransitionComplete) {
      onTransitionComplete();
    }
  }, []); // Solo ejecutar una vez al montar

  return (
    <>
      {/* Luces */}
      <ambientLight intensity={0.5} />
      <directionalLight intensity={2.5} position={[5, 5, 5]} castShadow />
      <directionalLight intensity={2.5} position={[-5, 5, -5]} castShadow />
      <directionalLight intensity={2.5} position={[0, 5, 0]} castShadow />
      <directionalLight intensity={2.5} position={[5, 5, 0]} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={5.7} />
      
      {/* OrbitControls desactivados durante la transición */}
      <OrbitControls
        enabled={!initialTransition}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(3 * Math.PI) / 4}
      />
      
      <AnimatedCarousel 
        setIndex={setIndex}
        setShowCollection={setShowCollection}
        setCollection={setCollection}
        setActiveGalleryColor={setActiveGalleryColor}
        // Pasar los props de transición
        initialTransition={initialTransition}
        initialImageUrl={initialImageUrl}
        onTransitionComplete={onTransitionComplete}
      />
    </>
  );
};

export default About1;
