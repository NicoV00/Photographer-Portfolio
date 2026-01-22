// Map collection paths to their color schemes 
const galleryColors = {
  // Map collection path to its color scheme
  "caldo": {
    main: "#edd97a",     // Yellow background color for CALDO BASTARDO 2024
    text: "#FF0000",     // RED text on yellow background
    highlight: "#FF0000" // Red highlights (like in the frames)
  },
  "ana-livni": {
    main: "#F0F0F0",     // Light gray background
    text: "#000000",     // Black text
    highlight: "#000000" // Black highlight for consistency
  },
  "blua": {
    main: "#dbdae5",     // Light lavender/purple background (Constelación)
    text: "#000000",     // BLACK text for light background (CORREGIDO)
    highlight: "#8481a0" // Darker purple highlights
  },
  "constelacion": {      // Alias para Blua Constelación
    main: "#dbdae5",     // Light lavender/purple background
    text: "#000000",     // BLACK text for light background
    highlight: "#8481a0" // Darker purple highlights
  },
  "maison": {
    main: "#1e1e1d",     // Maison 2024 dark color
    text: "#FFFFFF",     // White text for dark background
    highlight: "#FFFFFF" // White highlight for consistency
  },
  "vestimeteo": {
    main: "#b4e5f3",     // VESTIMETEO light blue color
    text: "#000000",     // Black text
    highlight: "#3BAFD9" // Darker blue for highlights
  },
  "marcos": {
    main: "#c2dd52",     // MARCOS MUF green color (lime green)
    text: "#000000",     // Black text
    highlight: "#8CAA21" // Darker green for highlights
  },
  "pasarela": {
    main: "#1e1815",     // Dark background for runway
    text: "#13359B",     // Blue text for dark background
    highlight: "#13359B" // Blue highlights
  },
  "identidad": {
    main: "#13359B",     // Dark background for runway
    text: "#ffffffff",     // Blue text for dark background
    highlight: "#f5f5f5ff" // Blue highlights
  },
  "plata": {
    main: "#e6e6e6",     // Light gray background
    text: "#000000",     // BLACK text for light background (CORREGIDO)
    highlight: "#a0a0a0" // Gray highlights
  },
  "lenoir": {
    main: "#aa88ef",     // Lilac color
    text: "#000000",     // BLACK text for better contrast (CORREGIDO)
    highlight: "#333333" // Dark gray highlights
  },
  "kaboa": {
    main: "#ededed",     // Light gray background
    text: "#000000",     // BLACK text for light background (CORREGIDO)
    highlight: "#000000" // Black highlights
  },
  "amour": {
    main: "#e82d2d",     // Red background
    text: "#FFFFFF",     // White text for dark red background
    highlight: "#FFFFFF" // White highlights
  },
  "catatumbo": {         // CAT (Catatumbo)
    main: "#FFFFFF",     // White/light background
    text: "#000000",     // Black text
    highlight: "#000000" // Black highlights
  },
  "newblackwhite": {     // NEW BLACK & WHITE
    main: "#FFFFFF",     // White background
    text: "#000000",     // Black text (AÑADIDO)
    highlight: "#000000" // Black highlights
  },
  "enzo": {
    main: "#f9f9f9",     // Enzo X light gray/white background
    text: "#000000",     // Black text
    highlight: "#333333" // Dark gray highlights
  },
  // Default colors for collections without specific mapping
  "default": {
    main: "#FFFFFF",     // White background
    text: "#000000",     // Black text (CORREGIDO - era blanco)
    highlight: "#666666" // Gray highlights
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
    if (collectionPath.includes('blua') || collectionPath.includes('constelaciones')) return galleryColors.blua;
    if (collectionPath.includes('MDLST')) return galleryColors.maison;
    if (collectionPath.includes('TEO')) return galleryColors.vestimeteo;
    if (collectionPath.includes('MARCOS')) return galleryColors.marcos;
    if (collectionPath.includes('PASARELA')) return galleryColors.pasarela;
    if (collectionPath.includes('LENOIR')) return galleryColors.lenoir;
    if (collectionPath.includes('KABOA')) return galleryColors.kaboa;
    if (collectionPath.includes('ADELAMOUR') || collectionPath.includes('AMOUR')) return galleryColors.amour;
    if (collectionPath.includes('PLATA')) return galleryColors.plata;
    if (collectionPath.includes('IDENTIDAD')) return galleryColors.identidad;
    if (collectionPath.includes('CAT-')) return galleryColors.catatumbo;
    if (collectionPath.includes('NWB&W') || collectionPath.includes('BLACK')) return galleryColors.newblackwhite;
    if (collectionPath.includes('X/') || collectionPath.includes('enzocimillo')) return galleryColors.enzo;
  }

  // If collection type provided directly
  if (collectionPath && galleryColors[collectionPath]) {
    return galleryColors[collectionPath];
  }

  // Default fallback
  return galleryColors.default;
};

export default galleryColors;
