import React, { useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import AnimatedCarousel from "./AnimatedImage";

const About1 = ({ setIndex, setShowCollection, setCollection }) => {
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
      <AnimatedCarousel setIndex={setIndex} setShowCollection={setShowCollection} setCollection={setCollection} />
    </>
  );
};

export default About1;
