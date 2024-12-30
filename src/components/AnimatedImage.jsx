import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useLoader, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const QualitySwitch = ({ isHighQuality, onChange }) => {
  return (
    <Html position={[0, 0, 0]} // Adjust position as needed
          zIndexRange={[50, 0]} // Set appropriate z-index for layering
    >
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-black/30 p-2 rounded-lg">
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

  const [loadedIndices, setLoadedIndices] = useState([]);
  const refs = useRef(Array(imageUrls.length).fill().map(() => React.createRef()));
  const groupRef = useRef();
  const cameraRef = useRef();
  const [selectedImage, setSelectedImage] = useState([]);
  const [isImageUpFront, setIsImageUpFront] = useState(false);

  useEffect(() => {
    textures.forEach((_, index) => {
      setLoadedIndices(prev => [...prev, index]);
    });
  }, [textures]);

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

  const handleClick = (index) => {
    if (!selectedImage.includes(index)) {
      setSelectedImage(prev => {
        const updatedList = [...prev, index];
        const closestImageIndex = findClosestImage(updatedList);
        if (closestImageIndex !== null) {
          animateImageToFront(closestImageIndex);
        } else {
          animateImageToFront(index);
        }
        return updatedList;
      });
    } else {
      resetImagePositions();
    }
  };

  const handleQualityChange = (newQuality) => {
    setIsHighQuality(newQuality);
    setLoadedIndices([]);
    imageUrls.forEach((_, index) => {
      setLoadedIndices(prev => [...prev, index]);
    });
  };

  // Animation and camera update logic here...
  // (Keep your existing animation and camera logic)

  return (
    <>
      <QualitySwitch 
        isHighQuality={isHighQuality}
        onChange={handleQualityChange}
      />
      <group ref={groupRef}>
        {imageUrls.map((url, index) => (
          loadedIndices.includes(index) && (
            <ImageMesh
              key={index}
              refProp={refs.current[index]}
              position={originalPositions[index]}
              textureUrl={url}
              onClick={() => handleClick(index)}
              visible={true}
              isHighQuality={isHighQuality}
              />
            )
          ))}
      </group>
    </>
  );
};

export default AnimatedCarousel;