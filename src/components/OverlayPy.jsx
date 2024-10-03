import { Scroll, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";


export const OverlayPy = ({ image, showDiv }) => {
  const [delayedShow, setDelayedShow] = useState(false);

  useEffect(() => {
    let timer;
    if (showDiv) {
      // Wait one second before setting delayedShow to true
      timer = setTimeout(() => {
        setDelayedShow(true);
      }, 1000);
    } else {
      // Reset delayedShow when showDiv becomes false
      setDelayedShow(false);
    }

    // Cleanup timeout on component unmount or when showDiv changes
    return () => clearTimeout(timer);
  }, [showDiv]);

  return (
      <div style={{ ...styles.container, display: delayedShow ? 'flex' : 'none' }} >
          <img src={image} alt="overlay" style={styles.image} />
      </div>
  )
}

const styles = {
  container: { 
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      display: 'flex', // Flexbox for centering
      justifyContent: 'center', // Horizontal centering
      alignItems: 'center', // Vertical centering
      backgroundColor: 'rgba(78, 187, 230, 0.5)' // Optional: semi-transparent overlay background
  },
  image: {
      width: '40%',
      display: 'block',
  }
}