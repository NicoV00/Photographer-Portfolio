import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useLoader, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import ImageMesh from './ImageMesh';
import { getGalleryColors } from '../utils/galleryColors';

const AnimatedCarousel = ({
  setShowCollection,
  setCollection,
  setIndex,
  setActiveGalleryColor,
  setSelectedProjectInfo,
  initialTransition = false,
  initialImageUrl = null,
  onTransitionComplete = null,
  isUserInactive = false
}) => {
  // MOBILE DETECTION
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || window.innerWidth <= 768;
  }, []);

  // ALWAYS HIGH QUALITY - No quality switch
  const isHighQuality = true; // Siempre máxima calidad
  const [isInitializing, setIsInitializing] = useState(initialTransition);
  const hasStartedTransitionRef = useRef(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);

  // OPTIMIZED IMAGE URLS - Consider using lower resolution versions for mobile
  const imageUrls = useMemo(() => {
    const baseUrls = [
      "./images/CALDO/CALDO-1 (PORTADA).jpg",
      "./images/blua_constelaciones_finales.jpg",
      "./images/PLATA/PLATA-2.jpg",
      "./images/CAT-17.jpg",
      "./images/NWB&W-09.jpg",
      "./images/S-1.jpg",
      "./images/MDLST/MDLST-1.png",
      "./images/TEO/V1.jpg",
      "./images/LENOIR/LENOIR-1.jpg",
      "./images/KABOA/KABOA-1.jpg",
      "./images/AMOUR/portada.jpg",
      "./images/MARCOS/MARCOSMUF-5 (PORTADA).jpg",
      "./images/PASARELA/PASARELA MUF-12(PORTADA).jpg",
      "./images/IDENTIDAD/IDENTIDAD MUF-1 (PORTADA).jpg",
      "./images/X/@enzocimillo_ex-_1.jpg",
    ];
    
    // MOBILE OPTIMIZATION: Limit number of images on mobile
    if (isMobile) {
      return baseUrls.slice(0, 15); // Show only 10 images on mobile
    }
    return baseUrls;
  }, [isMobile]);

  const projectInfo = useMemo(() => ({
    "./images/CALDO/CALDO-1 (PORTADA).jpg": { name: "Caldo Bastardo", year: "2024" },
    "./images/blua_constelaciones_finales.jpg": { name: "Constelacion, Blua", year: "2024" },
    "./images/PLATA/PLATA-2.jpg": { name: "Plata, Blua", year: "2024" },
    "./images/CAT-17.jpg": { name: "Catatumbo", year: "2024" },
    "./images/NWB&W-09.jpg": { name: "Neam Wave", year: "2024" },
    "./images/S-1.jpg": { name: "Ana Livni", year: "2024" },
    "./images/MDLST/MDLST-1.png": { name: "Maison de l'Est", year: "2024" },
    "./images/TEO/V1.jpg": { name: "La Notte, Vestimeteo", year: "2024" },
    "./images/LENOIR/LENOIR-1.jpg": { name: "Lenoir", year: "2024" },
    "./images/KABOA/KABOA-1.jpg": { name: "Kaboa SS24", year: "2024" },
    "./images/AMOUR/portada.jpg": { name: "A del Amour", year: "2024" },
    "./images/MARCOS/MARCOSMUF-5 (PORTADA).jpg": { name: "Catalogo MUF", year: "2024" },
    "./images/PASARELA/PASARELA MUF-12(PORTADA).jpg": { name: "Pasarela MUF", year: "2024" },
    "./images/IDENTIDAD/IDENTIDAD MUF-1 (PORTADA).jpg": { name: "Montevideo Under Fashion", year: "2024" },
    "./images/X/@enzocimillo_ex-_1.jpg": { name: "ex-", year: "2026" }
  }), []);

  const initialImageIndex = useMemo(() => {
    if (!initialImageUrl) return -1;
    return imageUrls.findIndex(url => url === initialImageUrl);
  }, [imageUrls, initialImageUrl]);

  // TEXTURE LOADING OPTIMIZATION
  const textures = useLoader(
    THREE.TextureLoader,
    imageUrls,
    (loader) => {
      loader.setCrossOrigin('anonymous');
    }
  );

  // OPTIMIZE TEXTURES FOR MOBILE AND CLEANUP ON UNMOUNT
  useEffect(() => {
    if (isMobile) {
      textures.forEach((texture) => {
        // Reduce texture resolution for mobile
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        // Dispose of unnecessary data
        if (texture.image) {
          const maxSize = 1024; // Max texture size for mobile
          if (texture.image.width > maxSize || texture.image.height > maxSize) {
            texture.needsUpdate = true;
          }
        }
      });
    }

    // CLEANUP: Dispose textures on unmount
    return () => {
      console.log('🧹 Cleaning up textures...');
      textures.forEach((texture) => {
        if (texture) {
          texture.dispose();
        }
      });
    };
  }, [textures, isMobile]);

  const refs = Array.from({ length: textures.length }, () => useRef());

  // ADJUSTED POSITIONS FOR MOBILE
  const originalPositions = useMemo(() => {
    const desktopPositions = [
      [-4.5, -4.5, 4],
      [0, 2, 14],
      [14, 4, -18],
      [1, 3, -13],
      [17, 3, 1],
      [-14, 0, 9],
      [13, -3, 6],
      [-7.5, 0, 6],
      [-0.5, 13, -12],
      [-7.5, 8, -10],
      [7, -2.5, -3],
      [9.5, 5.5, 7],
      [-13, 7, 0],
      [8, 9.5, -8],
      [2, -4, 12]  // Nueva posición para la imagen de ex- (más a la derecha)
    ];

    // Scale down positions for mobile
    if (isMobile) {
      return desktopPositions.slice(0, imageUrls.length).map(pos => 
        [pos[0] * 0.7, pos[1] * 0.7, pos[2] * 0.7]
      );
    }
    
    return desktopPositions;
  }, [isMobile, imageUrls.length]);

  const groupRef = useRef();
  const [selectedImage, setSelectedImage] = useState([]);
  const [isImageUpFront, setIsImageUpFront] = useState(false);
  const cameraRef = useRef();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const [loadedIndices, setLoadedIndices] = useState([]);
  const animationInProgressRef = useRef(false);
  const timelineRef = useRef(null);
  const backgroundRef = useRef(new THREE.Color('white'));

  // FRAME RATE LIMITER FOR MOBILE
  const frameCount = useRef(0);
  const skipFrames = isMobile ? 2 : 1; // Skip every other frame on mobile

  // CLEANUP: Kill all GSAP animations on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up GSAP animations...');
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      // Kill all GSAP tweens
      gsap.killTweensOf("*");
    };
  }, []);

  useEffect(() => {
    textures.forEach((_, index) => {
      setLoadedIndices(prev => [...prev, index]);
    });
  }, [textures]);

  // OPTIMIZED INITIAL TRANSITION
  useEffect(() => {
    if (initialTransition && initialImageIndex !== -1 && refs[initialImageIndex]?.current
        && !hasStartedTransitionRef.current && !animationInProgressRef.current) {

      hasStartedTransitionRef.current = true;
      animationInProgressRef.current = true;
      setIsInitializing(true);

      refs.forEach((ref, idx) => {
        if (ref.current) {
          ref.current.visible = idx === initialImageIndex;
          if (idx !== initialImageIndex) {
            ref.current.scale.set(0.001, 0.001, 0.001);
            if (ref.current.material) {
              ref.current.material.transparent = true;
              ref.current.material.opacity = 0;
            }
          } else {
            if (ref.current.material) {
              ref.current.material.transparent = true;
              ref.current.material.opacity = 0;
            }
          }
        }
      });

      const targetRef = refs[initialImageIndex].current;
      const camera = cameraRef.current;

      if (targetRef && camera) {
        const finalPosition = [...originalPositions[initialImageIndex]];

        camera.position.set(0, 0, 6);
        camera.lookAt(0, 0, 0);

        targetRef.position.set(0, 0, 0);
        targetRef.scale.set(6, 6, 6);

        // SIMPLIFIED ANIMATION FOR MOBILE
        const duration = isMobile ? 1.2 : 1.8;
        const timeline = gsap.timeline({
          onComplete: () => {
            gsap.set(targetRef.position, {
              x: finalPosition[0],
              y: finalPosition[1],
              z: finalPosition[2],
              overwrite: true,
              force3D: false // Disable 3D transform on mobile
            });

            gsap.set(targetRef.scale, {
              x: 1,
              y: 1,
              z: 1,
              overwrite: true
            });

            gsap.set(camera.position, {
              x: 0,
              y: 0,
              z: 45,
              overwrite: true
            });

            if (targetRef.material) {
              targetRef.material.opacity = 1;
            }

            setIsInitializing(false);
            animationInProgressRef.current = false;
            if (onTransitionComplete) {
              onTransitionComplete();
            }
          }
        });

        timeline.to(targetRef.position, {
          x: finalPosition[0],
          y: finalPosition[1],
          z: finalPosition[2],
          duration: duration,
          ease: isMobile ? "power2.inOut" : "power3.inOut",
          onUpdate: isMobile ? null : () => {
            if (targetRef) {
              targetRef.lookAt(camera.position);
            }
          }
        }, 0);

        timeline.to(targetRef.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: duration,
          ease: isMobile ? "power2.inOut" : "power3.inOut"
        }, 0);

        timeline.to(targetRef.material, {
          opacity: 1,
          duration: duration,
          ease: isMobile ? "power2.inOut" : "power3.inOut"
        }, 0);

        timeline.to(camera.position, {
          x: 0,
          y: 0,
          z: 45,
          duration: duration,
          ease: isMobile ? "power2.inOut" : "power3.inOut"
        }, 0);

        timeline.call(() => {
          refs.forEach((ref, idx) => {
            if (ref.current && idx !== initialImageIndex) {
              ref.current.visible = true;

              // SIMPLIFIED ANIMATION FOR OTHER IMAGES ON MOBILE
              const animDuration = isMobile ? 0.8 : 1.2;
              const delay = isMobile ? 0.05 : (0.1 + (Math.random() * 0.4));

              gsap.fromTo(ref.current.scale,
                { x: 0.001, y: 0.001, z: 0.001 },
                {
                  x: 1,
                  y: 1,
                  z: 1,
                  duration: animDuration,
                  delay: delay,
                  ease: isMobile ? "power2.out" : "back.out(1.3)",
                  onUpdate: isMobile ? null : () => {
                    if (ref.current) {
                      ref.current.lookAt(camera.position);
                    }
                  }
                }
              );

              if (ref.current.material) {
                gsap.fromTo(ref.current.material,
                  { opacity: 0 },
                  {
                    opacity: 1,
                    duration: animDuration,
                    delay: delay,
                    ease: "power2.out"
                  }
                );
              }
            }
          });
        }, [], 1.0);
      }
    }
  }, [initialTransition, initialImageIndex, refs, originalPositions, onTransitionComplete, isMobile]);

  // Quality change handler removed - always high quality

  const handleClick = useCallback((index) => {
    if (isInitializing || animationInProgressRef.current) return;

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

      const galleryImageUrl = imageUrls[index];
      const galleryColors = getGalleryColors(galleryImageUrl);

      if (setActiveGalleryColor) {
        setActiveGalleryColor(galleryColors);
      }

      if (galleryColors && galleryColors.main) {
        const newColor = new THREE.Color("white");
        backgroundRef.current = newColor;
      }
    } else {
      resetImagePositions();
    }
  }, [selectedImage, isInitializing, imageUrls]);

  const animateImageToFront = useCallback((index) => {
    // Keep original animation logic unchanged
    if (animationInProgressRef.current) return;
    animationInProgressRef.current = true;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    setIsImageUpFront(true);

    if (setSelectedProjectInfo) {
      const imageUrl = imageUrls[index];
      const info = projectInfo[imageUrl];
      console.log("Enviando información del proyecto:", info);
      setSelectedProjectInfo(info);
    }

    timelineRef.current = gsap.timeline({
      onComplete: () => {
        animationInProgressRef.current = false;
      }
    });

    const selectedRef = refs[index]?.current;
    const camera = cameraRef.current;

    if (!selectedRef || !camera) {
      animationInProgressRef.current = false;
      return;
    }

    setIndex(index);

    const originalPosition = selectedRef.position.clone();

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const cameraDistanceToOrigin = camera.position.length();

    console.log(`Camera distance to origin: ${cameraDistanceToOrigin}`);

    var zoomRatio = 0.87;
    if (cameraDistanceToOrigin > 80) {
      zoomRatio = 0.94;
    } else if (cameraDistanceToOrigin > 150) {
      zoomRatio = 1.1;
    }

    const zoomDistance = cameraDistanceToOrigin * zoomRatio;
    const targetPosition = camera.position.clone().add(direction.multiplyScalar(zoomDistance));

    // Keep original smooth animation
    timelineRef.current.to(selectedRef.position, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.2,
      ease: "power3.inOut",
      force3D: true,
      onUpdate: () => {
        if (selectedRef) {
          selectedRef.lookAt(camera.position);
        }
      }
    }, 0);

    timelineRef.current.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 1.4,
      ease: "power3.inOut",
      force3D: true
    }, 0);

    // Keep original dispersion animation
    refs.forEach((ref, i) => {
      if (i === index) return;

      const mesh = ref.current;
      if (!mesh) return;

      const direction = new THREE.Vector3(
        mesh.position.x - originalPosition.x,
        mesh.position.y - originalPosition.y,
        mesh.position.z - originalPosition.z
      ).normalize();

      const distance = 500 + Math.random() * 200;

      timelineRef.current.to(mesh.position, {
        x: originalPositions[i][0] + direction.x * distance,
        y: originalPositions[i][1] + direction.y * distance,
        z: originalPositions[i][2] + direction.z * distance,
        duration: 1.0 + Math.random() * 0.3,
        ease: "power3.out",
        delay: Math.random() * 0.1,
        onComplete: () => {
          mesh.visible = false;
        }
      }, 0);
    });

    timelineRef.current.play();
  }, [refs, imageUrls, projectInfo, originalPositions]);

  const findClosestImage = useCallback((updatedList) => {
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
  }, [refs]);

  // OPTIMIZED FRAME UPDATE FOR MOBILE
  useFrame(({ camera, scene }) => {
    frameCount.current++;
    
    // Skip frames on mobile for better performance
    if (isMobile && frameCount.current % skipFrames !== 0) {
      return;
    }

    cameraRef.current = camera;

    // Only update look-at every few frames on mobile
    if (!animationInProgressRef.current && (!isMobile || frameCount.current % 4 === 0)) {
      refs.forEach(ref => {
        if (ref.current) {
          ref.current.lookAt(camera.position);
        }
      });
    }

    if (isImageUpFront && scene.background) {
      scene.background.lerp(backgroundRef.current, isMobile ? 0.1 : 0.05);
    } else if (scene.background) {
      scene.background.lerp(new THREE.Color('white'), isMobile ? 0.1 : 0.05);
    }

    // SLOWER ROTATION ON MOBILE
    if (groupRef.current && 
        !isImageUpFront && 
        !isInitializing && 
        !animationInProgressRef.current && 
        !isUserInactive &&
        !isManuallyPaused) {
      groupRef.current.rotation.y += isMobile ? 0.0001 : 0.0003;
    }
  });

  const resetImagePositions = useCallback(() => {
    if (animationInProgressRef.current) return;
    animationInProgressRef.current = true;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const camera = cameraRef.current;

    if (setSelectedProjectInfo) {
      setSelectedProjectInfo(null);
    }

    if (setActiveGalleryColor) {
      setActiveGalleryColor({
        main: '#ffffff',
        text: '#000000',
        highlight: '#666666'
      });
    }

    backgroundRef.current = new THREE.Color('#ffffff');

    // OPTIMIZED RESET FOR MOBILE
    const duration = isMobile ? 0.8 : 1.2;
    
    timelineRef.current = gsap.timeline({
      onComplete: () => {
        refs.forEach((ref, index) => {
          if (ref.current) {
            const targetPos = originalPositions[index];
            gsap.set(ref.current.position, {
              x: targetPos[0],
              y: targetPos[1],
              z: targetPos[2],
              force3D: !isMobile,
              overwrite: true
            });
          }
        });

        setIsImageUpFront(false);
        setSelectedImage([]);
        animationInProgressRef.current = false;
      }
    });

    timelineRef.current.to(camera.position, {
      x: 0,
      y: 0,
      z: 45,
      duration: duration,
      ease: isMobile ? "power2.inOut" : "power3.inOut",
      force3D: !isMobile
    }, 0);

    refs.forEach((ref, index) => {
      if (ref.current) {
        ref.current.visible = true;

        const currentPos = ref.current.position;
        const targetPos = originalPositions[index];
        const distance = Math.sqrt(
          Math.pow(currentPos.x - targetPos[0], 2) +
          Math.pow(currentPos.y - targetPos[1], 2) +
          Math.pow(currentPos.z - targetPos[2], 2)
        );

        const animDuration = isMobile ? 
          Math.min(0.8, 0.4 + (distance / 800)) : 
          Math.min(1.2, 0.6 + (distance / 500));

        const delay = isMobile ? 0 : (0.1 + Math.random() * 0.1);

        timelineRef.current.to(ref.current.position, {
          x: targetPos[0],
          y: targetPos[1],
          z: targetPos[2],
          duration: animDuration,
          ease: isMobile ? "power2.inOut" : "power3.inOut",
          force3D: !isMobile,
          onUpdate: isMobile ? null : () => {
            if (ref.current) {
              ref.current.lookAt(camera.position);
            }
          }
        }, delay);
      }
    });

    timelineRef.current.play();
  }, [refs, originalPositions, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isInitializing || animationInProgressRef.current) return;
      if (!isImageUpFront) return;

      // Handle both mouse and touch events
      const clientX = event.clientX || (event.touches && event.touches[0]?.clientX);
      const clientY = event.clientY || (event.touches && event.touches[0]?.clientY);
      
      if (clientX === undefined || clientY === undefined) return;

      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
      
      // Ensure camera is available
      if (!cameraRef.current) return;
      
      raycaster.setFromCamera(mouse, cameraRef.current);

      // Only check the selected image (which should be at position 0,0,0)
      const selectedImageIndex = selectedImage[selectedImage.length - 1];
      if (selectedImageIndex === undefined) return;
      
      const selectedRef = refs[selectedImageIndex]?.current;
      if (!selectedRef || !selectedRef.visible) return;

      const intersects = raycaster.intersectObject(selectedRef, false);

      // If no intersection with the selected image, reset positions
      if (intersects.length === 0) {
        resetImagePositions();
      }
    };

    // Add both mouse and touch event listeners
    const eventType = isMobile ? 'touchstart' : 'mousedown';
    document.addEventListener(eventType, handleClickOutside, { passive: false });
    
    return () => {
      document.removeEventListener(eventType, handleClickOutside);
    };
  }, [refs, isInitializing, resetImagePositions, selectedImage, isMobile]);

  // Keyboard controls (desktop only)
  useEffect(() => {
    if (isMobile) return; // Skip keyboard controls on mobile
    
    const handleKeyPress = (event) => {
      if (event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setIsManuallyPaused(prev => {
          const newState = !prev;
          console.log(newState ? "⏸️ PAUSA MANUAL ACTIVADA" : "▶️ PAUSA MANUAL DESACTIVADA");
          
          if (newState) {
            console.log("=== POSICIONES ACTUALES DE LAS IMÁGENES ===");
            refs.forEach((ref, index) => {
              if (ref.current) {
                const pos = ref.current.position;
                console.log(`Imagen ${index}: [${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}]`);
              }
            });
            console.log("==========================================");
            console.log("Presiona Shift+P nuevamente para reanudar el movimiento");
          }
          
          return newState;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [refs, isMobile]);

  return (
    <group ref={groupRef}>
      {/* Quality switch removed - always high quality */}

      {/* Debug pause indicator - only on desktop */}
      {!isMobile && isManuallyPaused && (
        <group position={[-15, 15, 10]}>
          <mesh>
            <boxGeometry args={[8, 3, 0.1]} />
            <meshBasicMaterial color="#ff0000" opacity={0.9} transparent />
          </mesh>
          <mesh position={[0, 0, 0.2]}>
            <planeGeometry args={[7, 2]} />
            <meshBasicMaterial color="#ffffff" opacity={1} transparent />
          </mesh>
        </group>
      )}
      
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