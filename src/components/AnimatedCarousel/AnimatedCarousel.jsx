import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useLoader, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import QualitySwitch from './QualitySwitch';
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
  const [isHighQuality, setIsHighQuality] = useState(true);
  const [isInitializing, setIsInitializing] = useState(initialTransition);
  const hasStartedTransitionRef = useRef(false);

  const imageUrls = useMemo(() => [
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
  ], []);

  const projectInfo = useMemo(() => ({
    "./images/CALDO/CALDO-1 (PORTADA).jpg": { name: "Caldo Bastardo", year: "2024" },
    "./images/blua_constelaciones_finales.jpg": { name: "Constelacion, Blua", year: "2024" },
    "./images/PLATA/PLATA-2.jpg": { name: "Plata, Blua", year: "2024" },
    "./images/CAT-17.jpg": { name: "Catatumbo", year: "2024" },
    "./images/NWB&W-09.jpg": { name: "NEW BLACK & WHITE", year: "2024" },
    "./images/S-1.jpg": { name: "Ana Livni", year: "2024" },
    "./images/MDLST/MDLST-1.png": { name: "Maison de l'Est", year: "2024" },
    "./images/TEO/V1.jpg": { name: "La Notte, Vestimeteo", year: "2024" },
    "./images/LENOIR/LENOIR-1.jpg": { name: "Lenoir", year: "2024" },
    "./images/KABOA/KABOA-1.jpg": { name: "Kaboa SS24", year: "2024" },
    "./images/AMOUR/portada.jpg": { name: "A del Amour", year: "2024" },
    "./images/MARCOS/MARCOSMUF-5 (PORTADA).jpg": { name: "Catalogo MUF", year: "2024" },
    "./images/PASARELA/PASARELA MUF-12(PORTADA).jpg": { name: "Pasarela MUF", year: "2024" },
    "./images/IDENTIDAD/IDENTIDAD MUF-1 (PORTADA).jpg": { name: "Montevideo Under Fashion", year: "2024" }
  }), []);

  const initialImageIndex = useMemo(() => {
    if (!initialImageUrl) return -1;
    return imageUrls.findIndex(url => url === initialImageUrl);
  }, [imageUrls, initialImageUrl]);

  const textures = useLoader(
    THREE.TextureLoader,
    imageUrls,
    (loader) => {
      loader.setCrossOrigin('anonymous');
    }
  );

  const refs = Array.from({ length: textures.length }, () => useRef());

  // POSICIONES REORGANIZADAS - Distribución más orgánica y natural
  const originalPositions = useMemo(() => {
    const positions = {
      // IMAGEN HERO - Mantener posición especial
      "./images/blua_constelaciones_finales.jpg": [0, 3, 15],
      
      // GRUPO FRONTAL IZQUIERDO (más cerca, más visible)
      "./images/CALDO/CALDO-1 (PORTADA).jpg": [-12, -2, 18],
      "./images/S-1.jpg": [-8, 5, 12],
      
      // GRUPO FRONTAL DERECHO
      "./images/PLATA/PLATA-2.jpg": [10, 1, 16],
      "./images/MDLST/MDLST-1.png": [7, -5, 14],
      
      // PLANO MEDIO SUPERIOR
      "./images/NWB&W-09.jpg": [-5, 8, 5],
      "./images/AMOUR/portada.jpg": [4, 9, 3],
      "./images/TEO/V1.jpg": [0, 11, -2],
      
      // PLANO MEDIO LATERAL
      "./images/CAT-17.jpg": [-15, 2, 0],
      "./images/LENOIR/LENOIR-1.jpg": [14, -1, 2],
      
      // FONDO DISTRIBUIDO
      "./images/KABOA/KABOA-1.jpg": [-10, -8, -10],
      "./images/MARCOS/MARCOSMUF-5 (PORTADA).jpg": [8, 6, -12],
      "./images/PASARELA/PASARELA MUF-12(PORTADA).jpg": [-3, -6, -15],
      "./images/IDENTIDAD/IDENTIDAD MUF-1 (PORTADA).jpg": [12, -9, -8]
    };

    return imageUrls.map((url) => positions[url] || [0, 0, 0]);
  }, [imageUrls]);

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

  useEffect(() => {
    textures.forEach((_, index) => {
      setLoadedIndices(prev => [...prev, index]);
    });
  }, [textures]);

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
          }
        }
      });

      const targetRef = refs[initialImageIndex].current;
      const camera = cameraRef.current;

      if (targetRef && camera) {
        const finalPosition = [...originalPositions[initialImageIndex]];

        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);

        targetRef.position.set(0, 0, 0);
        targetRef.scale.set(6, 6, 6);

        const timeline = gsap.timeline({
          onComplete: () => {
            gsap.set(targetRef.position, {
              x: finalPosition[0],
              y: finalPosition[1],
              z: finalPosition[2],
              overwrite: true,
              force3D: true
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
          duration: 1.8,
          ease: "power3.inOut",
          onUpdate: () => {
            if (targetRef) {
              targetRef.lookAt(camera.position);
            }
          }
        }, 0);

        timeline.to(targetRef.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1.8,
          ease: "power3.inOut"
        }, 0);

        timeline.to(camera.position, {
          x: 0,
          y: 0,
          z: 45,
          duration: 1.8,
          ease: "power3.inOut"
        }, 0);

        timeline.call(() => {
          refs.forEach((ref, idx) => {
            if (ref.current && idx !== initialImageIndex) {
              ref.current.visible = true;

              gsap.fromTo(ref.current.scale,
                { x: 0.001, y: 0.001, z: 0.001 },
                {
                  x: 1,
                  y: 1,
                  z: 1,
                  duration: 1.2,
                  delay: 0.1 + (Math.random() * 0.4),
                  ease: "back.out(1.3)",
                  onUpdate: () => {
                    if (ref.current) {
                      ref.current.lookAt(camera.position);
                    }
                  }
                }
              );
            }
          });
        }, [], 1.0);
      }
    }
  }, [initialTransition, initialImageIndex, refs, originalPositions, onTransitionComplete]);

  const handleQualityChange = (newQuality) => {
    setIsHighQuality(newQuality);
    setLoadedIndices([]);
    imageUrls.forEach((_, index) => {
      setLoadedIndices(prev => [...prev, index]);
    });
  };

  const handleClick = (index) => {
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
  };

  const animateImageToFront = (index) => {
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
        const targetRef = refs[index]?.current;
        if (targetRef) {
          gsap.set(targetRef.position, {
            x: 0,
            y: 0,
            z: 0,
            overwrite: true,
            force3D: true
          });
        }

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

    const idealCameraPosition = new THREE.Vector3(3, 3, 3);

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
      x: idealCameraPosition.x,
      y: idealCameraPosition.y,
      z: idealCameraPosition.z,
      duration: 1.4,
      ease: "power3.inOut",
      force3D: true
    }, 0);

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

    if (!animationInProgressRef.current) {
      refs.forEach(ref => {
        if (ref.current) {
          ref.current.lookAt(camera.position);
        }
      });
    }

    if (isImageUpFront && scene.background) {
      scene.background.lerp(backgroundRef.current, 0.05);
    } else if (scene.background) {
      scene.background.lerp(new THREE.Color('white'), 0.05);
    }

    if (groupRef.current && 
        !isImageUpFront && 
        !isInitializing && 
        !animationInProgressRef.current && 
        !isUserInactive) {
      groupRef.current.rotation.y += 0.0003;
    }
  });

  const resetImagePositions = () => {
    if (animationInProgressRef.current) return;
    animationInProgressRef.current = true;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const camera = cameraRef.current;

    if (setSelectedProjectInfo) {
      setSelectedProjectInfo(null);
    }

    timelineRef.current = gsap.timeline({
      onComplete: () => {
        refs.forEach((ref, index) => {
          if (ref.current) {
            const targetPos = originalPositions[index];
            gsap.set(ref.current.position, {
              x: targetPos[0],
              y: targetPos[1],
              z: targetPos[2],
              force3D: true,
              overwrite: true
            });
          }
        });

        setIsImageUpFront(false);
        setSelectedImage([]);

        if (setActiveGalleryColor) {
          setActiveGalleryColor(null);
        }

        animationInProgressRef.current = false;
      }
    });

    timelineRef.current.to(camera.position, {
      x: 0,
      y: 0,
      z: 45,
      duration: 1.2,
      ease: "power3.inOut",
      force3D: true
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

        const duration = Math.min(1.2, 0.6 + (distance / 500));

        timelineRef.current.to(ref.current.position, {
          x: targetPos[0],
          y: targetPos[1],
          z: targetPos[2],
          duration: duration,
          ease: "power3.inOut",
          force3D: true,
          onUpdate: () => {
            if (ref.current) {
              ref.current.lookAt(camera.position);
            }
          }
        }, 0.1 + Math.random() * 0.1);
      }
    });

    timelineRef.current.play();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isInitializing || animationInProgressRef.current) return;
      if (!isImageUpFront) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = refs
        .map(ref => ref.current)
        .filter(ref => ref && ref.visible)
        .reduce((acc, ref) => {
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
  }, [refs, isInitializing]);

  useEffect(() => {
    if (isUserInactive) {
      console.log("🔄 Carrusel PAUSADO - animaciones detenidas para screensaver");
    } else {
      console.log("▶️ Carrusel ACTIVO - animaciones normales");
    }
  }, [isUserInactive]);

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
