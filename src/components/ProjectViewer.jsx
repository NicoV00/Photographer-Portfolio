import React, { useState, lazy, Suspense } from 'react';
import AnimatedCarousel from './AnimatedCarousel';
import { Box, CircularProgress } from '@mui/material';

// Importación de todas las galerías desde el punto centralizado
import {
  BluaGallery,
  AnaLivniGallery,
  MaisonGallery,
  VestimeTeoGallery,
  CaldoGallery,
  PlataGallery,
  LenoirGallery,
  KaboaGallery,
  AmourGallery,
  MarcosGallery,
  PasarelaGallery // Añadido PasarelaGallery
} from './Galleries';

// Mapeo de imágenes a componentes de galería
const galleryMap = {
  "./images/CALDO/CALDO-1 (PORTADA).jpg": {
    component: CaldoGallery,
    props: {}
  },
  "./images/blua_constelaciones_finales.jpg": {
    component: BluaGallery,
    props: {}
  },
  "./images/S-1.jpg": {
    component: AnaLivniGallery,
    props: {}
  },
  "./images/MDLST/MDLST-1.png": {
    component: MaisonGallery,
    props: {}
  },
  "./images/TEO/V1.jpg": {
    component: VestimeTeoGallery,
    props: {}
  },
  "./images/PLATA/PLATA-2.jpg": {
    component: PlataGallery,
    props: {}
  },
  "./images/LENOIR/LENOIR-1.jpg": {
    component: LenoirGallery,
    props: {}
  },
  "./images/KABOA/KABOA-1.jpg": {
    component: KaboaGallery,
    props: {}
  },
  "./images/AMOUR/portada.jpg": {
    component: AmourGallery,
    props: {}
  },
  "./images/MARCOS/MARCOSMUF-5 (PORTADA).jpg": {
    component: MarcosGallery,
    props: {}
  },
  "./images/PASARELA/PASARELA MUF-12(PORTADA).jpg": { // Añadido el mapeo para PASARELA
    component: PasarelaGallery,
    props: {}
  }
};

const ProjectViewer = () => {
  const [showCollection, setShowCollection] = useState(false);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  // Función para volver al carrusel
  const handleBack = () => {
    setShowCollection(false);
    setCurrentCollection(null);
  };
  
  // Renderiza el contenido apropiado según el estado
  const renderContent = () => {
    if (showCollection && currentCollection) {
      const projectConfig = galleryMap[currentCollection];
      
      if (projectConfig) {
        const ProjectComponent = projectConfig.component;
        
        return (
          <Suspense fallback={
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh'
            }}>
              <CircularProgress />
            </Box>
          }>
            <ProjectComponent
              onBack={handleBack}
              {...projectConfig.props}
            />
          </Suspense>
        );
      } else {
        // Fallback si no hay un componente configurado para esa imagen
        return (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: '20px'
          }}>
            <h2>Proyecto en desarrollo</h2>
            <p>Este proyecto aún no está disponible para visualización.</p>
            <button 
              onClick={handleBack}
              style={{
                padding: '10px 20px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Volver al carrusel
            </button>
          </Box>
        );
      }
    }
    
    // Muestra el carrusel si no hay colección seleccionada
    return (
      <AnimatedCarousel 
        setShowCollection={setShowCollection}
        setCollection={setCurrentCollection}
        setIndex={setSelectedIndex}
      />
    );
  };
  
  return (
    <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      {renderContent()}
    </Box>
  );
};

export default ProjectViewer;
