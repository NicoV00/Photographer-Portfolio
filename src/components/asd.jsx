import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap'; // Import GSAP
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

  // Create an array of refs and positions for images
  const refs = Array.from({ length: 20 }, () => useRef());
  const originalPositions = [
    [-8, -5, -10], [-1, -2, -23],
    [8, -1, -12], [4, -1, -4],
    [4, 4, -20], [12, 8, -11],
    [0, 1, 25], [10, 2, 8],
    [-10, -4, 5], [-2, -3, 18], [11, 5, -13],
    [-12, 5, 12], [-7, 3, 22], [-7, 2, -14],
    [8, -2, 15], [5, -1, 19], [9, 2, -17],
    [-12, 6, -10], [-10, 3, -20], [-1, 4, -18],
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState([]);
  const cameraRef = useRef();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handleClick = (index) => {
    // Check if the image is already selected to avoid duplicates
    if (!selectedImage.includes(index)) {
        // Update the selected images state
        setSelectedImage((prev) => {
            const updatedList = [...prev, index]; // Add the new index
            console.log("Selected Images:", updatedList); // Log the entire list
            
            // Trigger animation for the closest image after the state update
            const closestImageIndex = findClosestImage(updatedList); // Pass updated list here
            if (closestImageIndex !== null) {
                animateImageToFront(closestImageIndex);
            } else {
                animateImageToFront(index);
            }

            return updatedList; // Return the updated list
        });

        console.log(`Image ${index} clicked`);
    } else {
        resetImagePositions();
    }
};

const animateImageToFront = (index) => {
    const ref = refs[index]?.current; // Use optional chaining

    if (ref && cameraRef.current) {
        const camera = cameraRef.current;

        // Get the direction vector the camera is facing
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        // Set a fixed distance from the camera (adjust this value as needed)
        const distance = 4; 

        // Calculate the target position in front of the camera
        const targetPosition = camera.position.clone().add(direction.multiplyScalar(distance));

        // Animate the image to the target position
        gsap.to(ref.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 1,
            onComplete: () => {
                // You might want to consider if you need this logic here anymore
                // Remove the following line if it's redundant
                const closestImageIndex = findClosestImage(selectedImage); // Pass selectedImage
                console.log(`Closest image index: ${closestImageIndex}`);
            },
        });
    }
};

const findClosestImage = (updatedList) => { // Accept updated list as a parameter
    if (updatedList.length === 0) {
        console.log('No selected images.');
        return null;
    }

    const cameraPosition = cameraRef.current.position.clone();
    let closestIndex = updatedList[0]; // Start with the first selected image
    let closestDistance = Infinity; // Initialize closestDistance to Infinity

    console.log('Checking for closest images...');

    // Iterate only over the provided list of selected images
    updatedList.forEach((index) => {
        const ref = refs[index]; // Get the reference for the selected image
        if (ref && ref.current) { // Check if the ref and current position exist
            const distance = ref.current.position.distanceTo(cameraPosition);
            console.log(`Distance to selected image ${index}: ${distance}`);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index; // Update closestIndex to the current index if distance is smaller
            }
        }
    });

    console.log(`Closest image index: ${closestIndex}`); // Log the closest image index
    return closestIndex; // Return the closest selected image index
};

  useFrame(({ camera }) => {
    cameraRef.current = camera; // Update camera reference
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

  // Function to reset image positions
  const resetImagePositions = () => {
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
    setSelectedImage([]); // Clear selected images
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Update mouse position for raycasting
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Set raycaster
      raycaster.setFromCamera(mouse, cameraRef.current);

      // Check for intersections with image meshes
      const intersects = refs.map(ref => ref.current).filter(ref => ref).reduce((acc, ref) => {
        const intersection = raycaster.intersectObject(ref);
        return acc.concat(intersection);
      }, []);

      if (intersects.length === 0) {
        resetImagePositions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside); // Use 'mousedown' for capturing click events
    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Cleanup the event listener
    };
  }, [refs]);

  return (
    <>
      <group>
        {/* Use the first 3 textures for the first 3 images */}
        <ImageMesh refProp={refs[0]} position={originalPositions[0]} texture={texture1} onClick={() => handleClick(0)} />
        <ImageMesh refProp={refs[1]} position={originalPositions[1]} texture={texture2} onClick={() => handleClick(1)} />
        <ImageMesh refProp={refs[2]} position={originalPositions[2]} texture={texture3} onClick={() => handleClick(2)} />

        {/* Use placeholder texture for the remaining images */}
        {refs.slice(3).map((ref, index) => (
          <ImageMesh
            key={index + 3}
            refProp={ref}
            position={originalPositions[index + 3]}
            texture={placeholderTexture}
            onClick={() => handleClick(index + 3)} // Capture click
          />
        ))}
      </group>
    </>
  );
};

export default AnimatedCarousel;