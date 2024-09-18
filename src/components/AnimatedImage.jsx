import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';

const ImageMesh = ({ url, position = [0, 0, 0], rotationY }) => {
  const texture = useLoader(THREE.TextureLoader, url);
  const meshRef = useRef();

  // Set position
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [position]);

  // Update rotation smoothly using useFrame
  useFrame(() => {
    if (meshRef.current) {
      // Smoothly interpolate position
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        position[0],
        0.001
      );
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        position[1],
        0.001
      );

      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        rotationY,
        0.05 // Interpolation factor for smoothness
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4, 3]} /> {/* Adjust size as needed */}
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

const AnimatedImage = ({ url, position, scroll, scrollEvent }) => {
  const [rotationY, setRotationY] = useState(0);
  const [x, setX] = useState(position[0]);
  const [y, setY] = useState(position[1]);

  // Update rotationY target based on scroll
  useEffect(() => {
    if (scroll > scrollEvent - 50 && scroll < scrollEvent + 20) {
      setRotationY(-1.4);
      setX(position[0]);
      setY(position[1]);
    } else {
      setRotationY(0);
      setX(position[0] + 6);
      setY(position[1] + 8);
    }
  }, [scroll, scrollEvent, position]);

  return (
    <ImageMesh 
      url={url} 
      position={[x, y, position[2]]} // Example position
      rotationY={rotationY}
    />
  );
};

export default AnimatedImage;
