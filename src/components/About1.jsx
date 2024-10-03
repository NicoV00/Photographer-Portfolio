import React, { useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import AnimatedCarousel from "./AnimatedImage";

const About1 = ({ setIndex, setShowDiv }) => {
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
      <AnimatedCarousel setIndex={setIndex} setShowDiv={setShowDiv} />
    </>
  );
};

export default About1;
