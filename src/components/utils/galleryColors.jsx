// Map collection paths to their color schemes
const galleryColors = {
  // Map collection path to its color scheme
  "caldo": {
    main: "#edd97a",     // Yellow background color for CALDO BASTARDO 2024
    text: "#FF0000",     // RED text on yellow background
    highlight: "#FF0000" // Red highlights (like in the frames)
  },
  "ana-livni": {
    main: "#F0F0F0",     // Pasarela color
    text: "#000000",     // Black text
    highlight: "#000000" // Black highlight for consistency
  },
  "blua": {
    main: "#e6e6e6",     // Plata, BLUA 2024 gradient start (light grey)
    text: "#000000",     // Black text
    highlight: "#000000" // Black highlight (gradient end)
  },
  "maison": {
    main: "#1e1e1d",     // Maison 2024 color
    text: "#FFFFFF",     // White text for dark background
    highlight: "#FFFFFF" // White highlight for consistency
  },
  "vestimeteo": {
    main: "#b4e5f3",     // VESTIMETEO light blue color
    text: "#000000",     // Black text
    highlight: "#3BAFD9" // Darker blue for highlights
  },
  "marcos-muf": {
    main: "#c2dd52",     // MARCOS MUF green color
    text: "#000000",     // Black text
    highlight: "#8CAA21" // Darker green for highlights
  },
  "plata": {
    main: "#e6e6e6",     // Actualizado a gris claro (como BLUA)
    text: "#000000",     // Texto negro
    highlight: "#a0a0a0" // Highlight plata/gris
  },
  // Default colors for collections without specific mapping
  "default": {
    main: "#dbdae5",     // Light gray
    text: "#000000",     // Black text
    highlight: "#666666" // Darker gray for highlights
  }
};

/**
 * Get color theme based on collection path or type
 * @param {string} collectionPath - Path to collection image or collection type
 * @returns {object} Color theme object with main, text, and highlight colors
 */
export const getGalleryColors = (collectionPath) => {
  // If direct path provided, extract the collection type
  if (collectionPath && typeof collectionPath === 'string' && collectionPath.startsWith('./images/')) {
    // Map to collection types based on path patterns
    if (collectionPath.includes('CALDO')) return galleryColors.caldo;
    if (collectionPath.includes('S-1')) return galleryColors["ana-livni"];
    if (collectionPath.includes('blua')) return galleryColors.blua;
    if (collectionPath.includes('MDLST')) return galleryColors.maison;
    if (collectionPath.includes('TEO')) return galleryColors.vestimeteo;
    if (collectionPath.includes('MARCOS')) return galleryColors["marcos-muf"];
    
    // Para la colección PLATA - actualizada a usar el tema con fondo gris claro
    if (collectionPath.includes('PLATA')) return galleryColors.plata;
  }
  
  // If collection type provided directly
  if (collectionPath && galleryColors[collectionPath]) {
    return galleryColors[collectionPath];
  }
  
  // Default fallback
  return galleryColors.default;
};

export default galleryColors;