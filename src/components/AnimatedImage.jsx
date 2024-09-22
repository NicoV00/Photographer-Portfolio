import React, { useRef, useLayoutEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { useScroll } from "@react-three/drei";
import gsap from "gsap";

const AnimatedCarousel = ({ url, position }) => {
  
  // Load three different textures
  const texture1 = useLoader(THREE.TextureLoader, "./images/DSC00993.jpg");
  const texture2 = useLoader(THREE.TextureLoader, "./images/DSC00994.jpg");
  const texture3 = useLoader(THREE.TextureLoader, "./images/DSC00995.jpg");

  const meshRef1 = useRef();
  const meshRef2 = useRef();
  const meshRef3 = useRef();
  const ref = useRef();
  const tl = useRef();

  const scroll = useScroll();
  useFrame(() => {
    if (tl.current) {
      tl.current.seek(scroll.offset * tl.current.duration());
    }
  });

  useLayoutEffect(() => {
    tl.current = gsap.timeline();
    
    // FIRST IMAGE(1) ANIMATION
    tl.current.to(
      meshRef1.current.position,
      {
        duration: 1,
        x: 0,
        y: 0,
        z: -2,
      },
      0
    );
    tl.current.to(
      meshRef1.current.rotation,
      {
        duration: 1,
        y: 0,
      },
      0
    );

    tl.current.to(
      meshRef1.current.position,
      {
        duration: 1,
        z: 1,
      },
      1
    );
    // SECOND IMAGE(2) ANIMATION
    tl.current.to(
      meshRef2.current.position,
      {
        duration: 1,
        y: 2,
        z: -10,
      },
      0
    )
    
    tl.current.to(
      meshRef2.current.position,
      {
        duration: 1,
        x: 0,
        y: 0,
        z: -2,
      },
      1
    )
    tl.current.to(
      meshRef2.current.rotation,
      {
        duration: 1,
        y: 0,
      },
      1
    );

    tl.current.to(
      meshRef2.current.position,
      {
        duration: 1,
        z: 1,
      },
      2
    );

    // THIRD IMAGE(3) ANIMATION
    tl.current.to(
      meshRef3.current.position,
      {
        duration: 1,
        x: 0,
        y: 2,
        z: -20,
      },
      0
    );

    tl.current.to(
      meshRef3.current.position,
      {
        duration: 1,
        x: 5,
        y: -5,
        z: -10,
      },
      1
    );

    tl.current.to(
      meshRef3.current.position,
      {
        duration: 1,
        x: 0,
        y: 0,
        z: -2,
      },
      2
    );
    tl.current.to(
      meshRef3.current.rotation,
      {
        duration: 1,
        y: 0,
      },
      2
    );

    tl.current.to(
      meshRef3.current.position,
      {
        duration: 1,
        z: 1,
      },
      3
    );
  }, []);
 
  return (
    <group ref={ref}>
      <group ref={meshRef1} rotation={[0, Math.PI / 2, 0]} position={[-4, 1, -10]}>
        <mesh>
          <planeGeometry args={[4, 3]} /> {/* Adjust size as needed */}
          <meshBasicMaterial map={texture2} />
        </mesh>
      </group>
      <group ref={meshRef2} rotation={[0, -Math.PI / 4, 0]} position={[3, 8, -30]}>
        <mesh>
          <planeGeometry args={[4, 3]} /> {/* Adjust size as needed */}
          <meshBasicMaterial map={texture1} />
        </mesh>
      </group>
      <group ref={meshRef3} rotation={[0, -Math.PI / 4, 0]} position={[-25, 8, -40]}>
        <mesh>
          <planeGeometry args={[4, 3]} /> {/* Adjust size as needed */}
          <meshBasicMaterial map={texture3} />
        </mesh>
      </group>
    </group>
  );
};

export default AnimatedCarousel;
