import React from "react";
import { OrbitControls } from "@react-three/drei";
import AnimatedCarousel from "./AnimatedImage";
import { OverlayPy } from "./OverlayPy";


const About1 = () => {
  return (
    <>
      {/* Ambient and Directional Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight intensity={2.5} position={[5, 5, 5]} castShadow />
      <directionalLight intensity={2.5} position={[-5, 5, -5]} castShadow />
      <directionalLight intensity={2.5} position={[0, 5, 0]} castShadow />
      <directionalLight intensity={2.5} position={[5, 5, 0]} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={5.7} />

      <OrbitControls />
      <AnimatedCarousel />
    </>
  );
};

export default About1;
