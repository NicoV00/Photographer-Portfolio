import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useLoader, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import QualitySwitch from './QualitySwitch';
import ImageMesh from './ImageMesh';
import { getGalleryColors } from '../utils/galleryColors';

const AnimatedCarousel = ({ setShowCollection, setCollection, setIndex, setActiveGalleryColor }) => {
  const [isHighQuality, setIsHighQuality] = useState(false);
  const imageUrls = useMemo(() => [
    "./images/CALDO/CALDO-1 (PORTADA).jpg",
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
    "./images/S-1.jpg",
    "./images/MDLST/MDLST-1.png",
    "./images/TEO/V1.jpg"
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
    const areaWidth = 25;
    const areaHeight = 25;
    const areaDepth = 20;
    
    return imageUrls.map((_, index) => {
      // Create image clusters
      const cluster = Math.floor(index / 4);
      const intraClusterIndex = index % 4;
      
      // Base positions for each cluster
      let baseX = (cluster % 3 - 1) * (areaWidth / 2);
      let baseZ = Math.floor(cluster / 3) * (areaDepth / 2) - areaDepth / 4;
      
      // Adjust positions within the cluster
      const angleInCluster = (intraClusterIndex / 4) * Math.PI * 2;
      const clusterRadius = 8;
      
      // Add controlled random variations
      const randomOffset = () => (Math.random() - 0.5) * 5;
      
      const x = baseX + Math.cos(angleInCluster) * clusterRadius + randomOffset();
      const y = (Math.random() - 0.5) * areaHeight;
      const z = baseZ + Math.sin(angleInCluster) * clusterRadius + randomOffset();
      
      // Add additional variation based on index
      const indexVariation = Math.sin(index * 0.5) * 3;
      
      return [
        x + indexVariation,
        y + Math.cos(index * 0.7) * 2,
        z + indexVariation * 0.5
      ];
    });
  }, [imageUrls.length]);

  const groupRef = useRef();
  const [selectedImage, setSelectedImage] = useState([]);
  const [isImageUpFront, setIsImageUpFront] = useState(false);
  const cameraRef = useRef();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const [loadedIndices, setLoadedIndices] = useState([]);

  // Create a ref for scene background color transition
  const backgroundRef = useRef(new THREE.Color('white'));

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
    if (!(selectedImage.includes(index))) {
      setSelectedImage((prev) => {
        const updatedList = [...prev, index];
        const closestImageIndex = findClosestImage(updatedList);
        if (closestImageIndex !== null) {
          animateImageToFront(closestImageIndex);
        } else {
          animateImageToFront(index);
        }
        return updatedList;
      });
      
      // Get the gallery color based on the selected image URL
      const galleryImageUrl = imageUrls[index];
      const galleryColors = getGalleryColors(galleryImageUrl);
      
      // Pass the gallery colors to parent component
      if (setActiveGalleryColor) {
        setActiveGalleryColor(galleryColors);
      }
      
      // Apply gallery background color to scene
      if (galleryColors && galleryColors.main) {
        // Convert hex color to THREE.Color
        const newColor = new THREE.Color(galleryColors.main);
        backgroundRef.current = newColor;
      }
    } else {
      resetImagePositions();
    }
  };

  const animateImageToFront = (index) => {
    setIsImageUpFront(true);
    
    // Animate other images to move away organically
    refs.forEach((ref, i) => {
      if (i === index) return;
      
      const mesh = ref.current;
      if (!mesh) return;

      const direction = new THREE.Vector3(
        ref.current.position.x - refs[index].current.position.x,
        ref.current.position.y - refs[index].current.position.y,
        ref.current.position.z - refs[index].current.position.z
      ).normalize();
      
      gsap.to(ref.current.position, {
        x: originalPositions[i][0] + direction.x * 500,
        y: originalPositions[i][1] + direction.y * 500,
        z: originalPositions[i][2] + direction.z * 500,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          mesh.visible = false;
        }
      });
    });

    const ref = refs[index]?.current;
    if (ref && cameraRef.current) {
      const camera = cameraRef.current;
      const forwardVector = new THREE.Vector3();
      camera.getWorldDirection(forwardVector);
      const distanceFromCamera = 1;
      const targetPosition = new THREE.Vector3();
      targetPosition.copy(camera.position).add(forwardVector.multiplyScalar(distanceFromCamera));
      
      setIndex(index);
      
      gsap.to(ref.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: "power2.inOut"
      });
      
      gsap.to(camera.position, {
        x: 3,
        y: 3,
        z: 3,
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          setIndex(index);
        },
      });
    }
  };

  const findClosestImage = (updatedList) => {
    if (updatedList.length === 0) {
      return null;
    }
    const cameraPosition = cameraRef.current.position.clone();
    let closestIndex = updatedList[0];
    let closestDistance = Infinity;
    updatedList.forEach((index) => {
      const ref = refs[index];
      if (ref && ref.current) {
        const distance = ref.current.position.distanceTo(cameraPosition);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
    });
    return closestIndex;
  };

  useFrame(({ camera, scene }) => {
    cameraRef.current = camera;
    refs.forEach(ref => {
      if (ref.current) {
        ref.current.lookAt(camera.position);
      }
    });

    // Apply background color transition when a photo is selected
    if (isImageUpFront && scene.background) {
      scene.background.lerp(backgroundRef.current, 0.05);
    } else if (scene.background) {
      // Reset to white when no image is selected
      scene.background.lerp(new THREE.Color('white'), 0.05);
    }

    if (groupRef.current && !isImageUpFront) {
      groupRef.current.rotation.y += 0.0003; // Add slight Y rotation
    }
  });

  const resetImagePositions = () => {
    const camera = cameraRef.current;
    refs.forEach((ref, index) => {
      if (ref.current) {
        const mesh = ref.current;
        if (!mesh) return;
      
        // Make the mesh visible
        mesh.visible = true;

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
        z: 45,
        duration: 1,
      });
    }
    setIsImageUpFront(false);
    setSelectedImage([]);
    
    // Reset gallery colors
    if (setActiveGalleryColor) {
      setActiveGalleryColor(null);
    }
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
        resetImagePositions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs]);

  return (
    <group ref={groupRef}>
      <QualitySwitch isHighQuality={isHighQuality} onChange={handleQualityChange} />
      {imageUrls.map((texture, index) => (
        <ImageMesh
          key={index}
          position={originalPositions[index]}
          textureUrl={texture}
          refProp={refs[index]}
          onClick={() => handleClick(index)}
          isHighQuality={isHighQuality}
          isSelected={selectedImage.includes(index)}
          onGalleryToggle={() => { 
            setShowCollection(true); 
            setCollection(imageUrls[index]); 
          }}
        />
      ))}
    </group>
  );
};

export default AnimatedCarousel;
