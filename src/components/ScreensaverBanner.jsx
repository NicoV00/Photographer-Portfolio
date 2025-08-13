"use client"

import { useEffect, useState, useRef } from "react"
import { styled } from "@mui/material/styles"
import { Box } from "@mui/material"

const GlobalStyle = styled('style')({
  '@font-face': [
    {
      fontFamily: 'Medium',
      src: 'url("/fonts/Medium.otf") format("opentype")',
      fontWeight: 'normal',
      fontStyle: 'normal',
    },
    {
      fontFamily: 'Helvetica-Bold',
      src: 'url("/fonts/Helvetica-Bold.ttf") format("truetype")',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fontDisplay: 'swap',
    },
    {
      fontFamily: 'HelveticaNeueMedium',
      src: 'url("/fonts/HelveticaNeueMedium.otf") format("opentype")',
      fontWeight: 'bold',
      fontStyle: 'normal',
      fontDisplay: 'swap',
    },
    {
      fontFamily: 'Helvetica-Regular',
      src: 'url("/fonts/Helvetica.ttf") format("truetype")',
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontDisplay: 'swap',
    }
  ]
});

// Main container with subtle glassmorphism
const ScreensaverContainer = styled(Box)(({ isActive }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  opacity: isActive ? 1 : 0,
  visibility: isActive ? "visible" : "hidden",
  transition: "opacity 0.4s ease, visibility 0.4s",
  pointerEvents: isActive ? "all" : "none",
  cursor: "none",
  overflow: "hidden",
  backgroundColor: "rgba(255, 255, 255, 0.01)",
  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
}))

// Wrapper for each text line
const TextWrapper = styled(Box)({
  width: "100%",
  position: "absolute",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
})

// VELOCIDAD VISUAL UNIFORME: Duraciones ajustadas proporcionalmente a la longitud del texto
// Para que ambas líneas se vean moviéndose a la misma velocidad visual,
// la línea más larga necesita más tiempo para completar su ciclo
// "enzo cimillo" = 12 caracteres → 30s
// "fashion photographer." = 21 caracteres → 52s (proporción 1.75x)
const TOP_LINE_DURATION = "45s";    // Línea superior (texto más corto)
const BOTTOM_LINE_DURATION = "75s"; // Línea inferior (texto más largo)

// Inner container for the scrolling text
const ScrollingText = styled(Box)(({ direction, duration }) => ({
  display: "flex",
  whiteSpace: "nowrap",
  animation: `${direction === "left" ? "scrollLeft" : "scrollRight"} ${duration} linear infinite`,
  
  "@keyframes scrollLeft": {
    "0%": { transform: "translateX(0%)" },
    "100%": { transform: "translateX(-50%)" }, // Mueve exactamente la mitad del contenido
  },
  
  "@keyframes scrollRight": {
    "0%": { transform: "translateX(-50%)" }, // Empieza desde -50%
    "100%": { transform: "translateX(0%)" },  // Termina en 0%
  },
}))

// Individual text span
const TextSpan = styled('span')({
  fontFamily: 'Helvetica',
  fontSize: "clamp(100px, 18vw, 280px)",
  lineHeight: "1.2",
  letterSpacing: "-0.05em",
  color: "#000000",
  marginRight: "80px",
  userSelect: "none",
  display: "inline-block",
  
  "@media (max-width: 768px)": {
    fontSize: "clamp(50px, 15vw, 180px)",
    marginRight: "40px",
    lineHeight: "1.1",
  },
  
  "@media (max-width: 480px)": {
    fontSize: "clamp(45px, 22vw, 150px)",
    marginRight: "30px",
    lineHeight: "1.1",
  },
})

// Activity indicator (removido para limpieza visual)
const ActivityIndicator = styled(Box)({
  position: "absolute",
  bottom: "60px",
  left: "50%",
  transform: "translateX(-50%)",
  fontFamily: 'Helvetica',
  fontSize: "12px",
  color: "#000000",
  letterSpacing: "4px",
  textTransform: "uppercase",
  animation: "pulse 4s ease-in-out infinite",
  
  "@keyframes pulse": {
    "0%, 100%": { opacity: 0.8 },
    "50%": { opacity: 0.4 },
  },
  
  "@media (max-width: 768px)": {
    bottom: "40px",
    fontSize: "10px",
    letterSpacing: "2px",
  },
})

const ScreensaverBanner = ({ isActive = false, onDismiss = null, onInactivityChange = null, timeout = 20000 }) => {
  const [show, setShow] = useState(false)
  const stateRef = useRef({
    timer: null,
    inactivityTimer: null,
    lastActivity: Date.now(),
    isInactive: false,
    callbacks: { onDismiss, onInactivityChange },
    mouseThreshold: { x: 0, y: 0, threshold: 30 },
  })

  useEffect(() => {
    stateRef.current.callbacks = { onDismiss, onInactivityChange }
  }, [onDismiss, onInactivityChange])

  useEffect(() => {
    if (!isActive) return

    const handleActivity = (e) => {
      stateRef.current.lastActivity = Date.now()
      if (show) {
        setShow(false)
        stateRef.current.callbacks.onDismiss?.()
      }
      resetTimers()
    }

    const handleMouseMove = (e) => {
      if (show) return handleActivity(e)
      const { x, y, threshold } = stateRef.current.mouseThreshold
      if (Math.abs(e.clientX - x) > threshold || Math.abs(e.clientY - y) > threshold) {
        stateRef.current.mouseThreshold = { ...stateRef.current.mouseThreshold, x: e.clientX, y: e.clientY }
        handleActivity(e)
      }
    }

    const resetTimers = () => {
      clearTimeout(stateRef.current.timer)
      clearTimeout(stateRef.current.inactivityTimer)
      stateRef.current.isInactive = false
      stateRef.current.callbacks.onInactivityChange?.(false)

      stateRef.current.inactivityTimer = setTimeout(() => {
        stateRef.current.isInactive = true
        stateRef.current.callbacks.onInactivityChange?.(true)
        stateRef.current.timer = setTimeout(() => setShow(true), 3000)
      }, timeout - 3000)
    }

    const events = [
      { name: "mousedown", handler: handleActivity },
      { name: "mousemove", handler: handleMouseMove },
      { name: "click", handler: handleActivity },
      { name: "keydown", handler: handleActivity },
      { name: "wheel", handler: handleActivity },
      { name: "touchstart", handler: handleActivity },
    ]

    events.forEach((e) => document.addEventListener(e.name, e.handler, { passive: true }))
    resetTimers()

    return () => {
      events.forEach((e) => document.removeEventListener(e.name, e.handler))
      clearTimeout(stateRef.current.timer)
      clearTimeout(stateRef.current.inactivityTimer)
    }
  }, [isActive, timeout, show])

  if (!isActive) return null

  // Crear arrays con exactamente el mismo número de repeticiones
  const createRepeatedText = (text, count = 12) => {
    return Array(count).fill(text)
  }

  const topLineText = "enzo cimillo"
  const bottomLineText = "fashion photographer."

  return (
    <ScreensaverContainer isActive={show}>
      <GlobalStyle />
      
      {/* Línea superior - moviendo de derecha a izquierda */}
      <TextWrapper sx={{ 
        top: "10%",
        "@media (max-width: 768px)": {
          top: "25%",
        }
      }}>
        <ScrollingText direction="left" duration={TOP_LINE_DURATION}>
          {createRepeatedText(topLineText).map((text, index) => (
            <TextSpan key={`top-${index}`}>{text}</TextSpan>
          ))}
          {/* Duplicar para efecto continuo sin saltos */}
          {createRepeatedText(topLineText).map((text, index) => (
            <TextSpan key={`top-dup-${index}`}>{text}</TextSpan>
          ))}
        </ScrollingText>
      </TextWrapper>

      {/* Línea inferior - moviendo de izquierda a derecha */}
      <TextWrapper sx={{ 
        bottom: "10%",
        "@media (max-width: 768px)": {
          bottom: "30%",
        }
      }}>
        <ScrollingText direction="right" duration={BOTTOM_LINE_DURATION}>
          {createRepeatedText(bottomLineText).map((text, index) => (
            <TextSpan key={`bottom-${index}`}>{text}</TextSpan>
          ))}
          {/* Duplicar para efecto continuo sin saltos */}
          {createRepeatedText(bottomLineText).map((text, index) => (
            <TextSpan key={`bottom-dup-${index}`}>{text}</TextSpan>
          ))}
        </ScrollingText>
      </TextWrapper>

    </ScreensaverContainer>
  )
}

export default ScreensaverBanner
