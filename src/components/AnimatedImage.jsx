import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useLoader, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap'; // Import GSAP
import { Html } from '@react-three/drei';
import { useMemo } from 'react';

const QualitySwitch = ({ isHighQuality, onChange }) => {
  return (
    <Html position={[0, 0, 0]} // Adjust position as needed
          zIndexRange={[50, 0]} // Set appropriate z-index for layering
    >
      <div className="absolute z-50 flex items-center gap-2 bg-black/30 p-2 rounded-lg" style={{ top: '400px', right: '750px' }}>
        <span className="text-white text-sm">Quality:</span>
        <button
          onClick={() => onChange(!isHighQuality)}
          className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
            isHighQuality ? 'bg-green-500' : 'bg-gray-400'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
              isHighQuality ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-white text-sm">
          {isHighQuality ? 'High' : 'Lite'}
        </span>
      </div>
    </Html>
  );
};

const ImageMesh = React.memo(({ position, textureUrl, refProp, onClick, isHighQuality }) => {
  const [texture, setTexture] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    let mounted = true;

    const loadTexture = async () => {
      if (isHighQuality) {
        // High quality loading using useLoader
        try {
          const loadedTexture = await new Promise((resolve) => {
            const loader = new THREE.TextureLoader();
            loader.load(textureUrl, (tex) => {
              if (mounted) {
                tex.encoding = THREE.sRGBEncoding;
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.generateMipmaps = true;
                tex.anisotropy = 16;
                resolve(tex);
              }
            });
          });
          setTexture(loadedTexture);
        } catch (error) {
          console.error('Error loading high quality texture:', error);
        }
      } else {
        // Lite quality loading
        const loader = new THREE.TextureLoader();
        loader.load(textureUrl, (tex) => {
          if (mounted) {
            tex.minFilter = THREE.LinearFilter;
            tex.generateMipmaps = false;
            setTexture(tex);
          }
        });
      }
    };

    loadTexture();

    return () => {
      mounted = false;
      if (texture) {
        texture.dispose();
      }
    };
  }, [textureUrl, isHighQuality]);

  useEffect(() => {
    if (texture?.image) {
      setAspectRatio(texture.image.width / texture.image.height);
    }
  }, [texture]);

  if (!texture) return null;

  return (
    <group ref={refProp} position={position}>
      <mesh onClick={onClick}>
        <planeGeometry args={[5 * aspectRatio, 5]} />
        <meshBasicMaterial 
          map={texture} 
          transparent
          encoding={isHighQuality ? THREE.sRGBEncoding : THREE.LinearEncoding}
        />
      </mesh>
    </group>
  );
});

const AnimatedCarousel = ({ setShowDiv, setIndex }) => {
  const [isHighQuality, setIsHighQuality] = useState(false);
  const imageUrls = useMemo(() => [
    "./images/blua_constelaciones_finales.jpg",
    "./images/LF-11.jpg",
    "./images/LFF-15.jpg",
    "./images/D2F-10.jpg",
    "./images/PLATA-2.jpg",
    "./images/L-5.jpg",
    "./images/L-8.jpg",
    "./images/CAT-17.jpg",
    "./images/D-09.jpg",
    "./images/KA_PUENTE1.1-04.jpg",
    "./images/L-1.jpg",
    "./images/L-12.jpg",
    "./images/MARCOS-34.jpg",
    "./images/NWB&W-09.jpg",
    "./images/O4-1.jpg",
    "./images/PLATA-2.jpg",
    "./images/S-1.jpg"
  ], []);

  const textures = useLoader(
    THREE.TextureLoader,
    imageUrls,
    (loader) => {
      loader.setCrossOrigin('anonymous');
    }
  );
  const refs = Array.from({ length: textures.length }, () => useRef());

  const originalPositions = useMemo(() => {
    const radius = 15;
    return imageUrls.map((_, index) => {
      const angle = (index / imageUrls.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 10;
      return [x, y, z];
    });
  }, [imageUrls.length]);

  const groupRef = useRef();
  const [selectedImage, setSelectedImage] = useState([]);
  const [isImageUpFront, setIsImageUpFront] = useState(false);
  const cameraRef = useRef();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const [loadedIndices, setLoadedIndices] = useState([]);

  useEffect(() => {
    textures.forEach((_, index) => {
      setLoadedIndices(prev => [...prev, index]);
    });
  }, [textures]);

  const handleQualityChange = (newQuality) => {
    setIsHighQuality(newQuality);
    setLoadedIndices([]);
    imageUrls.forEach((_, index) => {
      setLoadedIndices(prev => [...prev, index]);
    });
  };

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
          console.log('sabias', originalPositions[i])
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
          gsap.to(ref.position, {        x: 0,
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
      <QualitySwitch 
        isHighQuality={isHighQuality}
        onChange={handleQualityChange}
      />
      {imageUrls.map((texture, index) => (
        <ImageMesh
          key={index}
          refProp={refs[index]}
          position={originalPositions[index]}
          textureUrl={texture}
          onClick={() => handleClick(index)}
          visible={true}
          isHighQuality={isHighQuality}
        />
      ))}
    </group>
  );
};

export default AnimatedCarousel;