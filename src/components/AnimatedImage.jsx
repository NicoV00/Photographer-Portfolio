import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useLoader, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap'; // Import GSAP

const ImageMesh = ({ position, texture, refProp, onClick }) => {
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    if (texture.image) {
      // Calculate the aspect ratio of the image
      setAspectRatio(texture.image.width / texture.image.height);
    }
  }, [texture]);

  return (
    <group ref={refProp} position={position}>
      <mesh onClick={onClick}>
        <planeGeometry args={[5 * aspectRatio, 5]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
};

const AnimatedCarousel = () => {
  const textures = [
    useLoader(THREE.TextureLoader, "./images/blua_constelaciones_finales.jpg"),
    useLoader(THREE.TextureLoader, "./images/LF-11.jpg"),
    useLoader(THREE.TextureLoader, "./images/LFF-15.jpg"),
    useLoader(THREE.TextureLoader, "./images/D2F-10.jpg"),
    useLoader(THREE.TextureLoader, "./images/PLATA-2.jpg"),
    useLoader(THREE.TextureLoader, "./images/L-5.jpg"),
    useLoader(THREE.TextureLoader, "./images/L-8.jpg"),
  ];

  const refs = Array.from({ length: textures.length }, () => useRef());
  const originalPositions = [
    [-8, -5, -10], [-1, -2, -23],
    [8, -1, -12], [4, -1, -4],
    [4, 4, -20], [-4, -4, -20],
    [-8, 2, -15],
  ];

  const [selectedImage, setSelectedImage] = useState(null);
  const cameraRef = useRef();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const groupRef = useRef();

  const handleClick = (index) => {
    if (selectedImage === index) {
      resetImagePositions(); // Si ya está seleccionada, resetea
    } else {
      setSelectedImage(index);
      animateImageToFront(index);
    }
  };

  const animateImageToFront = (index) => {
    const ref = refs[index]?.current;
    if (ref && cameraRef.current) {
      gsap.to(ref.position, {
        x: 0,
        y: 0,
        z: -2, // Acerca la imagen más a la cámara
        duration: 1,
      });

      // Aumentar el tamaño de la imagen
      gsap.to(ref.scale, {
        x: 6, // Tamaño en el eje X
        y: 6, // Tamaño en el eje Y
        z: 6, // Tamaño en el eje Z
        duration: 1,
      });

      // Añadir desenfoque al fondo
      gsap.to(refs.map((r) => r.current).filter((r, i) => i !== index), {
        scale: 0.5, // Reducir el tamaño de las imágenes en el fondo
        duration: 1,
      });
    }
  };

  useFrame(({ camera }) => {
    cameraRef.current = camera;
    refs.forEach(ref => {
      if (ref.current) {
        ref.current.lookAt(camera.position);
      }
    });

    // Rota el grupo en sentido antihorario alrededor del eje Y
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.001; // Cambio a rotación en Y
    }
  });

  const resetImagePositions = () => {
    refs.forEach((ref, index) => {
      if (ref.current) {
        gsap.to(ref.current.position, {
          x: originalPositions[index][0],
          y: originalPositions[index][1],
          z: originalPositions[index][2],
          duration: 1,
        });
        // Resetear el tamaño de las imágenes
        gsap.to(ref.current.scale, {
          x: 1, // Tamaño original en el eje X
          y: 1, // Tamaño original en el eje Y
          z: 1, // Tamaño original en el eje Z
          duration: 1,
        });
      }
    });
    setSelectedImage(null); // Reiniciar la imagen seleccionada
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = refs.map(ref => ref.current).filter(ref => ref).reduce((acc, ref) => {
        const intersection = raycaster.intersectObject(ref);
        return acc.concat(intersection);
      }, []);
      if (intersects.length === 0) {
        resetImagePositions(); // Restablecer posiciones si se hace clic fuera
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs]);

  return (
    <group ref={groupRef}>
      {textures.map((texture, index) => (
        <ImageMesh
          key={index}
          refProp={refs[index]}
          position={originalPositions[index]}
          texture={texture}
          onClick={() => handleClick(index)}
        />
      ))}
    </group>
  );
};

export default AnimatedCarousel;
