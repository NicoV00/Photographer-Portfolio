import React, { useState, useRef, useEffect } from 'react';
import { Box, Modal, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Custom font loading
const GlobalStyle = styled('style')({
  '@font-face': {
    fontFamily: 'Medium OTF',
    src: 'url("/fonts/Medium.otf") format("opentype")',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  },
});

// Styled components using MUI styling system
const GalleryContainer = styled(Box)(({ theme }) => ({
  overflow: 'auto',
  overflowY: 'hidden',
  backgroundColor: 'white', // Mantiene el fondo blanco como solicitado
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  scrollBehavior: 'smooth',
  WebkitOverflowScrolling: 'touch',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
}));

const GalleryWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '350px',
  padding: '80px',
  height: '100%',
  width: 'max-content',
  [theme.breakpoints.down('md')]: {
    gap: '250px',
    padding: '60px',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '150px',
    padding: '40px',
  },
}));

const GalleryItem = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  '& img': {
    display: 'block',
    maxHeight: '70vh',
    objectFit: 'cover',
    borderRadius: '1px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.3s ease',
    [theme.breakpoints.down('md')]: {
      maxHeight: '60vh',
    },
    [theme.breakpoints.down('sm')]: {
      maxHeight: '50vh',
    },
  },
  '&:hover img': {
    transform: 'scale(1.03)',
  },
}));

// Spotify Container with custom styling
const SpotifyContainer = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  width: '300px',
  height: '80px',  // Reduced height for minimal look
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: '12px',
  margin: '0 20px',
  [theme.breakpoints.down('md')]: {
    width: '250px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '200px',
    height: '70px',
  },
  '& iframe': {
    border: 'none',
    width: '100%',
    height: '80px',
    backgroundColor: 'transparent',
  }
}));

// Container for phrase images
const PhraseContainer = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  width: '400px',
  display: 'flex',
  alignItems: 'flex-start', // Align to top
  justifyContent: 'flex-start',
  // paddingTop definido individualmente en cada instancia para variar alturas
  paddingBottom: '0',
  [theme.breakpoints.down('md')]: {
    width: '300px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '200px',
  },
  '& img': {
    width: '100%',
    objectFit: 'contain',
  }
}));

// Title at the beginning of the gallery
const BluaTitle = styled(Box)(({ theme }) => ({
  fontFamily: '"Medium OTF", sans-serif',
  fontSize: '64px',
  fontWeight: 'bold',
  color: 'black',
  textTransform: 'uppercase',
  marginRight: '80px',
  [theme.breakpoints.down('md')]: {
    fontSize: '48px',
    marginRight: '60px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '36px',
    marginRight: '40px',
  },
}));

const ModalContainer = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxHeight: '80vh',
  maxWidth: '90vw',
  outline: 'none',
  '& img': {
    maxHeight: '80vh',
    maxWidth: '90vw',
    objectFit: 'contain',
    borderRadius: '1px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5)',
  },
});

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '20px',
  right: '20px',
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  top: '20px',
  left: '20px',
  color: 'black',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  zIndex: 1000,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
}));

// Spotify track data
const spotifyTrack = {
  id: '3VEQBNtshnnRnad8e0UhKV',
  embedUrl: 'https://open.spotify.com/embed/track/3VEQBNtshnnRnad8e0UhKV?utm_source=generator'
};

// Second Spotify track data
const spotifyTrack2 = {
  id: '3BP4REyXj5TppWeyJWP1Nk',
  embedUrl: 'https://open.spotify.com/embed/track/3BP4REyXj5TppWeyJWP1Nk?utm_source=generator'
};

// Phrase images
const phraseImages = [
  '/images/blua/f1.png',
  '/images/blua/f2.png',
  '/images/blua/f3.png',
  '/images/blua/f4.png',
];

const BluaGallery = ({ onBack }) => {
  // Use direct paths to images
  const images = [
    '/images/blua/b1.jpg',
    '/images/blua/b2.jpg',
    '/images/blua/b3.jpg',
    '/images/blua/b4.jpg',
    '/images/blua/b5.jpg',
    '/images/blua/b6.jpg',
  ];
  
  const [selectedImage, setSelectedImage] = useState(null);
  const containerRef = useRef(null);
  const galleryRef = useRef(null);
  const theme = useTheme();
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Handle image click to open modal
  const handleImageClick = (src) => {
    setSelectedImage(src);
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedImage(null);
  };

  // Improved wheel and grab/drag events
  useEffect(() => {
    const container = containerRef.current;
    
    // Wheel event handler for smooth scrolling
    const handleWheel = (e) => {
      e.preventDefault();
      const scrollSpeed = 3;
      const delta = e.deltaY;
      container.scrollLeft += delta * scrollSpeed;
    };
    
    // Mouse drag event handlers
    let isDown = false;
    let startX;
    let scrollLeft;
    
    const handleMouseDown = (e) => {
      isDown = true;
      container.style.cursor = 'grabbing';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };
    
    const handleMouseLeave = () => {
      isDown = false;
      container.style.cursor = 'grab';
    };
    
    const handleMouseUp = () => {
      isDown = false;
      container.style.cursor = 'grab';
    };
    
    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2; // Adjust for faster/slower scroll
      container.scrollLeft = scrollLeft - walk;
    };
    
    // Add event listeners
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    
    // Clean up event listeners
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Function to render gallery items with Spotify embed and phrases
  const renderGalleryItems = () => {
    const items = [];
    
    // Add BLUA title at the beginning
    items.push(
      <BluaTitle key="blua-title">BLUA</BluaTitle>
    );
    
    images.forEach((src, index) => {
      // Add the image
      items.push(
        <GalleryItem key={`image-${index}`} onClick={() => handleImageClick(src)}>
          <Box
            component="img"
            src={src}
            alt={`Gallery item ${index + 1}`}
            className="gallery-image"
          />
        </GalleryItem>
      );

      // Add phrase after the first image at higher position
      if (index === 0) {
        items.push(
          <PhraseContainer key="phrase-1" sx={{ paddingTop: '20px' }}>
            <Box
              component="img"
              src={phraseImages[0]}
              alt="Phrase 1"
            />
          </PhraseContainer>
        );
      }
      
      // Add phrase after the second image at middle position
      if (index === 1) {
        items.push(
          <PhraseContainer key="phrase-2" sx={{ paddingTop: '120px' }}>
            <Box
              component="img"
              src={phraseImages[1]}
              alt="Phrase 2"
            />
          </PhraseContainer>
        );
      }
      
      // Add the Spotify embed after the third image
      if (index === 2) {
        items.push(
          <SpotifyContainer key="spotify-embed">
            <Box 
              component="iframe" 
              src={spotifyTrack.embedUrl}
              width="100%"
              height="80px"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              sx={{ borderRadius: '12px' }}
            />
          </SpotifyContainer>
        );
      }
      
      // Add phrase after the fourth image at lower position
      if (index === 3) {
        items.push(
          <PhraseContainer key="phrase-3" sx={{ paddingTop: '180px' }}>
            <Box
              component="img"
              src={phraseImages[2]}
              alt="Phrase 3"
            />
          </PhraseContainer>
        );
      }

      // Add second Spotify embed after the fifth image
      if (index === 4) {
        items.push(
          <SpotifyContainer key="spotify-embed-2">
            <Box 
              component="iframe" 
              src={spotifyTrack2.embedUrl}
              width="100%"
              height="80px"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              sx={{ borderRadius: '12px' }}
            />
          </SpotifyContainer>
        );
      }
      
      // Add phrase after the last image at different position
      if (index === 5) {
        items.push(
          <PhraseContainer key="phrase-4" sx={{ paddingTop: '60px' }}>
            <Box
              component="img"
              src={phraseImages[3]}
              alt="Phrase 4"
            />
          </PhraseContainer>
        );
      }
    });
    
    return items;
  };

  return (
    <>
      <GlobalStyle />
      
      {/* Botón para volver */}
      <BackButton onClick={onBack} aria-label="Back">
        <ArrowBackIcon />
      </BackButton>
      
      <GalleryContainer ref={containerRef}>
        <GalleryWrapper ref={galleryRef}>
          {renderGalleryItems()}
        </GalleryWrapper>
        
        <Modal
          open={selectedImage !== null}
          onClose={handleClose}
          aria-labelledby="image-modal"
        >
          <ModalContainer>
            <Box
              component="img"
              src={selectedImage}
              alt="Selected"
            />
            <CloseButton onClick={handleClose} aria-label="Close">
              <CloseIcon />
            </CloseButton>
          </ModalContainer>
        </Modal>
      </GalleryContainer>
    </>
  );
};

export default BluaGallery;