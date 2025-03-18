import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import PortfolioButton from './PortfolioButton';

const ImageMesh = React.memo(({ 
  position, 
  textureUrl, 
  refProp, 
  onClick, 
  isHighQuality, 
  isSelected, 
  onGalleryToggle 
}) => {
  const [texture, setTexture] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const meshRef = useRef();

  useEffect(() => {
    let mounted = true;

    const loadTexture = async () => {
      if (isHighQuality) {
        // High quality loading
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

  // Handle hover effect
  const handlePointerOver = () => {
    setIsHovered(true);
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, {
        x: 1.05,
        y: 1.05,
        z: 1.05,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  if (!texture) return null;

  return (
    <group ref={refProp} position={position}>
      <mesh 
        ref={meshRef}
        onClick={onClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[5 * aspectRatio, 5]} />
        <meshBasicMaterial
          map={texture}
          transparent
          encoding={isHighQuality ? THREE.sRGBEncoding : THREE.LinearEncoding}
        />
      </mesh>
      {isSelected && (
        <PortfolioButton onClick={onGalleryToggle} />
      )}
    </group>
  );
});

export default ImageMesh;