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
  initialTransition = false,
  initialImageUrl = null,
  onTransitionComplete = null
}) => {
  const [isHighQuality, setIsHighQuality] = useState(false);
  const [isInitializing, setIsInitializing] = useState(initialTransition);
  const hasStartedTransitionRef = useRef(false);
  
  const imageUrls = useMemo(() => [
    "./images/CALDO/CALDO-1 (PORTADA).jpg",
    "./images/blua_constelaciones_finales.jpg",
    "./images/PLATA/PLATA-2.jpg",
    "./images/CAT-17.jpg",
    "./images/D-09.jpg",
    "./images/L-12.jpg",
    "./images/NWB&W-09.jpg",
    "./images/S-1.jpg",
    "./images/MDLST/MDLST-1.png",
    "./images/TEO/V1.jpg",
    "./images/LENOIR/LENOIR-1.jpg",
    "./images/KABOA/KABOA-1.jpg", // Add this line to include KABOA
    "./images/AMOUR/ADELAMOUR-1.jpg",
    "./images/MARCOS/MARCOSMUF-5 (PORTADA).jpg",
    "./images/PASARELA/PASARELA MUF-12(PORTADA).jpg",
  ], []);

  // Encontrar el índice de la imagen inicial
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

  const originalPositions = useMemo(() => {
    const areaWidth = 25;
    const areaHeight = 25;
    const areaDepth = 20;
    
    return imageUrls.map((url, index) => {
      // Si es la imagen especial, darle una posición fija prominente
      if (url === "./images/blua_constelaciones_finales.jpg") {
        return [0, 3, 15]; // Posición central, ligeramente elevada y más adelante
      }
      
      // Para el resto de imágenes, usar el posicionamiento estándar
      const cluster = Math.floor(index / 4);
      const intraClusterIndex = index % 4;
      
      let baseX = (cluster % 3 - 1) * (areaWidth / 2);
      let baseZ = Math.floor(cluster / 3) * (areaDepth / 2) - areaDepth / 4;
      
      const angleInCluster = (intraClusterIndex / 4) * Math.PI * 2;
      const clusterRadius = 8;
      
      const randomOffset = () => (Math.random() - 0.5) * 5;
      
      const x = baseX + Math.cos(angleInCluster) * clusterRadius + randomOffset();
      const y = (Math.random() - 0.5) * areaHeight;
      const z = baseZ + Math.sin(angleInCluster) * clusterRadius + randomOffset();
      
      const indexVariation = Math.sin(index * 0.5) * 3;
      
      return [
        x + indexVariation,
        y + Math.cos(index * 0.7) * 2,
        z + indexVariation * 0.5
      ];
    });
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

  // Create a ref for scene background color transition
  const backgroundRef = useRef(new THREE.Color('white'));

  useEffect(() => {
    textures.forEach((_, index) => {
      setLoadedIndices(prev => [...prev, index]);
    });
  }, [textures]);

  // Gestionar la transición inicial desde la foto del video
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
            // IMPORTANTE: Eliminar cualquier movimiento residual estableciendo posiciones exactas
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
          ease: "power3.inOut", // Cambio a un easing más suave
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

  // PERFECTA: Animación ultra suave al seleccionar una imagen
  const animateImageToFront = (index) => {
    // Evitar animaciones simultáneas
    if (animationInProgressRef.current) return;
    animationInProgressRef.current = true;
    
    // Cancelar cualquier animación previa si existe
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    
    setIsImageUpFront(true);
    
    // Crear nuevo timeline coordinado para toda la animación
    timelineRef.current = gsap.timeline({
      onComplete: () => {
        // CLAVE: Establecer posiciones finales exactas para eliminar cualquier movimiento residual
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
        
        // Finalizar animación
        animationInProgressRef.current = false;
      }
    });
    
    // Referencia a la imagen seleccionada y cámara
    const selectedRef = refs[index]?.current;
    const camera = cameraRef.current;
    
    if (!selectedRef || !camera) {
      animationInProgressRef.current = false;
      return;
    }
    
    // 1. Notificar el índice seleccionado
    setIndex(index);
    
    // 2. Guardar posición original de la imagen seleccionada
    const originalPosition = selectedRef.position.clone();
    
    // 3. Colocar cámara en posición ideal para la vista de cerca
    const idealCameraPosition = new THREE.Vector3(3, 3, 3);
    
    // 4. Animación ultra suave para la imagen seleccionada
    timelineRef.current.to(selectedRef.position, {
      x: 0,
      y: 0, 
      z: 0,
      duration: 1.2,
      ease: "power3.inOut", // Easing más suave
      force3D: true, // Mejora la precisión
      onUpdate: () => {
        if (selectedRef) {
          selectedRef.lookAt(camera.position);
        }
      }
    }, 0);
    
    // 5. Mover la cámara coordinadamente con la imagen
    timelineRef.current.to(camera.position, {
      x: idealCameraPosition.x,
      y: idealCameraPosition.y,
      z: idealCameraPosition.z,
      duration: 1.4,
      ease: "power3.inOut",
      force3D: true
    }, 0);
    
    // 6. Animar las demás imágenes hacia afuera con movimiento orgánico
    refs.forEach((ref, i) => {
      if (i === index) return; // Saltar imagen seleccionada
      
      const mesh = ref.current;
      if (!mesh) return;

      // Calcular vector de dirección desde imagen seleccionada
      const direction = new THREE.Vector3(
        mesh.position.x - originalPosition.x,
        mesh.position.y - originalPosition.y,
        mesh.position.z - originalPosition.z
      ).normalize();
      
      // Distancia variable para movimiento más natural
      const distance = 500 + Math.random() * 200;
      
      // Animar cada imagen con timing ligeramente diferente
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
    
    // Iniciar la animación
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
    
    // Hacer que las imágenes miren a la cámara (solo si no están en animación activa)
    if (!animationInProgressRef.current) {
      refs.forEach(ref => {
        if (ref.current) {
          ref.current.lookAt(camera.position);
        }
      });
    }

    // Transición suave de color de fondo
    if (isImageUpFront && scene.background) {
      scene.background.lerp(backgroundRef.current, 0.05);
    } else if (scene.background) {
      scene.background.lerp(new THREE.Color('white'), 0.05);
    }

    // Rotación suave del grupo solo cuando es apropiado
    if (groupRef.current && !isImageUpFront && !isInitializing && !animationInProgressRef.current) {
      groupRef.current.rotation.y += 0.0003;
    }
  });

  // Reset de posiciones con movimiento perfecto
  const resetImagePositions = () => {
    // Evitar múltiples resets
    if (animationInProgressRef.current) return;
    animationInProgressRef.current = true;
    
    // Cancelar cualquier animación previa
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    
    const camera = cameraRef.current;
    
    // Crear nuevo timeline para reset coordinado
    timelineRef.current = gsap.timeline({
      onComplete: () => {
        // CLAVE: Garantizar posiciones finales exactas
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
    
    // 1. Primero mover la cámara a posición general
    timelineRef.current.to(camera.position, {
      x: 0,
      y: 0,
      z: 45,
      duration: 1.2,
      ease: "power3.inOut",
      force3D: true
    }, 0);
    
    // 2. Restaurar posición de cada imagen con movimiento armonioso
    refs.forEach((ref, index) => {
      if (ref.current) {
        // Hacer visible inmediatamente sin parpadeo
        ref.current.visible = true;
        
        // Calcular distancia para timing proporcional (más lejos = más tiempo)
        const currentPos = ref.current.position;
        const targetPos = originalPositions[index];
        const distance = Math.sqrt(
          Math.pow(currentPos.x - targetPos[0], 2) +
          Math.pow(currentPos.y - targetPos[1], 2) +
          Math.pow(currentPos.z - targetPos[2], 2)
        );
        
        // Ajustar duración basada en distancia (más suave para objetos lejanos)
        const duration = Math.min(1.2, 0.6 + (distance / 500));
        
        // Animar cada imagen a su posición original
        timelineRef.current.to(ref.current.position, {
          x: targetPos[0],
          y: targetPos[1],
          z: targetPos[2],
          duration: duration,
          ease: "power3.inOut",
          force3D: true,
          onUpdate: () => {
            // Mantener la imagen orientada hacia la cámara
            if (ref.current) {
              ref.current.lookAt(camera.position);
            }
          }
        }, 0.1 + Math.random() * 0.1); // Pequeño retraso escalonado
      }
    });
    
    // Iniciar reset
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
