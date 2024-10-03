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

const AnimatedCarousel = ({ setShowDiv, setIndex }) => {
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
    [4, 1, 4], // Quadrant (1) (+, +, +)
    [8, 5, -12], // Quadrant (2) (+, +, -)
    [8, -2, 15], // Quadrant (3) (+, -, +)
    [1, -2, -13], // Quadrant (4) (+, -, -)
    [-4, 4, 12], // Quadrant (5) (-, +, +)
    [-8, 4, -10], // Quadrant (6) (-, +, -)
    [-4, -4, 12], // Quadrant (7) (-, -, +)
     // Quadrant (8) (-, -, -)
  ];

  const groupRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState([]);
  const [isImageUpFront, setIsImageUpFront] = useState(false);
  const cameraRef = useRef();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handleClick = (index) => {
    // Check if the image is already selected to avoid duplicates
    if (!(selectedImage.includes(index))) {
      // Update the selected images state
      setSelectedImage((prev) => {
          const updatedList = [...prev, index]; // Add the new index          
          // Trigger animation for the closest image after the state update
          const closestImageIndex = findClosestImage(updatedList); // Pass updated list here
          if (closestImageIndex !== null) {
              animateImageToFront(closestImageIndex);
          } else {
              animateImageToFront(index);
          }
          return updatedList; // Return the updated list
      });
      //console.log(`Image ${index} clicked`);
  } else {
      resetImagePositions();
  }
};

const animateImageToFront = (index) => {
  setIsImageUpFront(true);
  refs.forEach((ref, i) => {
      if (i === index) {
          return;
      }
      gsap.to(ref.current.position, {
          x: originalPositions[i][0] + 20,
          y: originalPositions[i][1] + 20,
          z: originalPositions[i][2] + 20,
          duration: 1,
      });
  })

  const ref = refs[index]?.current; // Use optional chaining
  if (ref && cameraRef.current) {
      const camera = cameraRef.current;
      console.log('camera position:', camera.position);
 
      // Get camera's forward direction vector
      const forwardVector = new THREE.Vector3();
      camera.getWorldDirection(forwardVector); // Gets the normalized vector of the camera's forward direction
      
      // Calculate the position in front of the camera (e.g., 5 units in front)
      const distanceFromCamera = 1; // You can change this to the desired distance
      const targetPosition = new THREE.Vector3();
      targetPosition.copy(camera.position).add(forwardVector.multiplyScalar(distanceFromCamera));
      setIndex(index);
      setShowDiv(true);
      // Animate the image to the target position in front of the camera
      gsap.to(ref.position, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1,
          onComplete: () => {
              // Logic after animation completes, if needed
              const closestImageIndex = findClosestImage(selectedImage); // Pass selectedImage if required
              console.log('image position:', ref.position);
          },
      });
      // Animate the camera to the new position
      gsap.to(camera.position, {
        x: 3,
        y: 3,
        z: 3,
        duration: 1,
        onComplete: () => {
            // You can handle additional logic here if needed
            console.log('Camera moved to:', camera.position);
            setIndex(index);
            setShowDiv(true);
        },
    });
  }
};

const findClosestImage = (updatedList) => { // Accept updated list as a parameter
  if (updatedList.length === 0) {
      return null;
  }
  const cameraPosition = cameraRef.current.position.clone();
  let closestIndex = updatedList[0]; // Start with the first selected image
  let closestDistance = Infinity; // Initialize closestDistance to Infinity
  // Iterate only over the provided list of selected images
  updatedList.forEach((index) => {
      const ref = refs[index]; // Get the reference for the selected image
      if (ref && ref.current) { // Check if the ref and current position exist
          const distance = ref.current.position.distanceTo(cameraPosition);
          if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = index; // Update closestIndex to the current index if distance is smaller
          }
      }
  });
  return closestIndex; // Return the closest selected image index
};

  useFrame(({ camera }) => {
    cameraRef.current = camera;
    //console.log('camera position:', camera.position);
    refs.forEach(ref => {
      if (ref.current) {
        ref.current.lookAt(camera.position);
      }
    });

    // Rota el grupo en sentido antihorario alrededor del eje Y
    if (groupRef.current && !isImageUpFront) {
      groupRef.current.rotation.x += 0.001; // Cambio a rotación en Y
    }
  });

  const resetImagePositions = () => {
    setShowDiv(false);
    const camera = cameraRef.current;

    refs.forEach((ref, index) => {
      if (ref.current) {
        gsap.to(ref.current.position, {
          x: originalPositions[index][0],
          y: originalPositions[index][1],
          z: originalPositions[index][2],
          duration: 1,
        });
      }
    });
    if (isImageUpFront) {
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 35,
        duration: 1,
        onComplete: () => {
                // You can handle additional logic here if needed
                console.log('Camera moved to:', camera.position);
                },
        });
      }
    setIsImageUpFront(false);
    setSelectedImage([]); // Reiniciar la imagen seleccionada
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
