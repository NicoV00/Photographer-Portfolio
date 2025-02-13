import styled from 'styled-components';
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Gallery.css';

gsap.registerPlugin(ScrollTrigger);

const Gallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = React.useState(null);
  const containerRef = useRef(null);
  const galleryRef = useRef(null);

  const handleImageClick = (src) => {
    setSelectedImage(src);
  };

  const handleClose = (e) => {
    if (e.target.classList.contains('backdrop')) {
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    const gallery = galleryRef.current;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY || e.deltaX;
      const scrollSpeed = 1.5;
      
      container.scrollLeft += delta * scrollSpeed;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Función para renderizar los items de la galería con los iframes de Spotify
  const renderGalleryItems = () => {
    const items = [];
    images.forEach((src, index) => {
      // Agregar el primer Spotify embed después de la quinta imagen
      if (index === 4) {
        items.push(
          <SpotifyContainer key="spotify-embed-1">
            <iframe 
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/track/3VEQBNtshnnRnad8e0UhKV?utm_source=generator"
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </SpotifyContainer>
        );
      }

      // Agregar la imagen
      items.push(
        <GalleryItem key={`image-${index}`} onClick={() => handleImageClick(src)}>
          <img 
            src={src} 
            alt={`Gallery item ${index + 1}`} 
            className="gallery-image"
          />
        </GalleryItem>
      );

      // Agregar el segundo Spotify embed antes de la última imagen
      if (index === images.length - 2) {
        items.push(
          <SpotifyContainer key="spotify-embed-2">
            <iframe 
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/track/3BP4REyXj5TppWeyJWP1Nk?utm_source=generator"
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </SpotifyContainer>
        );
      }
    });
    return items;
  };

  return (
    <GalleryContainer ref={containerRef}>
      <GalleryWrapper ref={galleryRef}>
        {renderGalleryItems()}
      </GalleryWrapper>
      {selectedImage && (
        <Backdrop className="backdrop" onClick={handleClose}>
          <SelectedImage src={selectedImage} alt="Selected" />
        </Backdrop>
      )}
    </GalleryContainer>
  );
};

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const SelectedImage = styled.img`
  max-height: 80vh;
  border-radius: 1px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
`;

const GalleryContainer = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  background-color:rgb(0, 2, 10);
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const GalleryWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 100px;
  padding: 40px;
  height: 100%;
  width: max-content;
`;

const GalleryItem = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  img {
    display: block;
    max-height: 70vh;
    object-fit: cover;
    border-radius: 1px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
  }
  &:hover img {
    transform: scale(1.0);
  }
`;

const SpotifyContainer = styled.div`
  flex-shrink: 0;
  width: 400px;
  height: 352px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default Gallery;