import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import OffCanvas from './OffCanvas';

const ImageMesh = ({ position, texture, refProp, onClick }) => {
  return (
    <group ref={refProp} position={position}>
      <mesh onClick={onClick}>
        <planeGeometry args={[4, 3]} /> {/* Adjust size as needed */}
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
};

const AnimatedCarousel = () => {
  // Load original textures
  const texture1 = useLoader(THREE.TextureLoader, "./images/DSC00993.jpg");
  const texture2 = useLoader(THREE.TextureLoader, "./images/DSC00994.jpg");
  const texture3 = useLoader(THREE.TextureLoader, "./images/DSC00995.jpg");

  // Load placeholder textures
  const placeholderTexture = useLoader(THREE.TextureLoader, "https://picsum.photos/400/300");

  // Create an array of refs and positions for 20 images
  const refs = Array.from({ length: 20 }, () => useRef());
  const positions = [
    [-8, -5, -10], [-1, -2, -23],  // [n, n, n]
    [8, -1, -12], [4, -1, -4],  // [p, n, n]
    [4, 4, -20], [12, 8, -11], // [p, p, n]
    [0, 1, 25], [10, 2, 8], // [p, p, p]
    [-10, -4, 5], [-2, -3, 18], [11, 5, -13],// [n, nn, p]
    [-12, 5, 12], [-7, 3, 22], [-7, 2, -14],// [n, p, p]
    [8, -2, 15], [5, -1, 19], [9, 2, -17], // [p, n, p]
    [-12, 6, -10], [-10, 3, -20], [-1, 4, -18], // [n, p, n]
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleClick = (index) => {
    setSelectedImage(index);
    setIsOpen(true);
  };

  useFrame(({ camera }) => {
    // Make each mesh look at the camera
    refs.forEach(ref => {
      if (ref.current) {
        ref.current.lookAt(camera.position);
      }
    });
  });

  const closePanel = () => {
    setIsOpen(false);
  };

  return (
    <>
      <group>
        {/* Use the first 3 textures for the first 3 images */}
        <ImageMesh refProp={refs[0]} position={positions[0]} texture={texture1} onClick={() => handleClick(0)} />
        <ImageMesh refProp={refs[1]} position={positions[1]} texture={texture2} onClick={() => handleClick(1)} />
        <ImageMesh refProp={refs[2]} position={positions[2]} texture={texture3} onClick={() => handleClick(2)} />

        {/* Usa la textura placeholder para las imágenes restantes */}
        {refs.slice(3).map((ref, index) => (
          <ImageMesh
            key={index + 3}
            refProp={ref}
            position={positions[index + 3]}
            texture={placeholderTexture}
            onClick={() => handleClick(index + 3)} // Captura el clic
          />
        ))}
      </group>
    </>
  );
};

export default AnimatedCarousel;
