import React from "react";
import { OrbitControls } from "@react-three/drei";
import AnimatedCarousel from "./AnimatedCarousel";

// Add setActiveGalleryColor prop to match the updates in AnimatedCarousel
const About1 = ({ setIndex, setShowCollection, setCollection, setActiveGalleryColor }) => {
  return (
    <>
      {/* Ambient and Directional Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight intensity={2.5} position={[5, 5, 5]} castShadow />
      <directionalLight intensity={2.5} position={[-5, 5, -5]} castShadow />
      <directionalLight intensity={2.5} position={[0, 5, 0]} castShadow />
      <directionalLight intensity={2.5} position={[5, 5, 0]} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={5.7} />
      
      <OrbitControls
        minPolarAngle={Math.PI / 4}  // 45 degrees
        maxPolarAngle={(3 * Math.PI) / 4}  // 135 degrees
      />
      <AnimatedCarousel 
        setIndex={setIndex} 
        setShowCollection={setShowCollection} 
        setCollection={setCollection}
        setActiveGalleryColor={setActiveGalleryColor} // Add this prop
      />
    </>
  );
};

export default About1;
