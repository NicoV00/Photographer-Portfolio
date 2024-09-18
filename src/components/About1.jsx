import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { HallwayModel } from "./Hallway"; // Assuming you have this component set up
import AnimatedImage from "./AnimatedImage";

const CameraController = () => {
  const { camera } = useThree();
  const [targetX, setTargetX] = useState(camera.position.x); // Target position for smooth transition
  const prevPosition = useRef(camera.position.clone());
  

  useEffect(() => {
    const handleScroll = (event) => {
      const scrollPosition = event.target.scrollTop; // Get scroll position from the container
      const newTargetX = scrollPosition * 0.08; // Adjust the multiplier for sensitivity
      setTargetX(newTargetX);
    };

    const scrollContainer = document.getElementById("scroll-container");
    scrollContainer.addEventListener("scroll", handleScroll);

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  
  useFrame(() => {
    // Smoothly interpolate camera position to the target
    camera.position.x += (targetX - camera.position.x) * 0.1; // Adjust the multiplier for smoothness
    camera.updateProjectionMatrix();

    // Logging the camera position for debugging purposes
    if (
      prevPosition.current.x !== camera.position.x ||
      prevPosition.current.y !== camera.position.y ||
      prevPosition.current.z !== camera.position.z
    ) {
      //console.log("Camera position:", camera.position);
      prevPosition.current.copy(camera.position);
    }
  });

  return null;
};

const About1 = () => {
  const [scrollHeight, setScrollHeight] = useState(0);

  useEffect(() => {
    const handleScroll = (event) => {
      const scrollPosition = event.target.scrollTop; // Get scroll position from the container
      setScrollHeight(scrollPosition);
      console.log("Scroll height:", scrollPosition);
    }
    const scrollContainer = document.getElementById("scroll-container");
    scrollContainer.addEventListener("scroll", handleScroll);

  }, []);

  const imageUrls = [
    { url: "./images/DSC00993.jpg", scrollEvent: 900 },
    { url: "./images/DSC00994.jpg", scrollEvent: 1400 },
    { url: "./images/DSC00995.jpg", scrollEvent: 1900 },
    // Add more image URLs here
  ];

  return (
    <>
      <section className="h-screen bg-white dark:bg-dark overflow-hidden relative">
        {/* Scrollable container for triggering scroll events */}
        <div
          id="scroll-container"
          className="h-full overflow-y-scroll relative"
          style={{ height: "100vh", overflowY: "scroll", zIndex: 1 }} // Make it scrollable and ensure it sits above Canvas
        >
          {/* Placeholder div to make scrolling possible */}
          <div style={{ height: "800vh", backgroundColor: "transparent" }}>
            <div style={{ height: "100vh", backgroundColor: "transparent", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
              <h1 style={{ color: "black" }}>Welcome</h1>
              <p style={{ color: "black" }}>This is some content that appears at the beginning.</p>
            </div>
            <div style={{ height: "100vh", backgroundColor: "transparent", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
              <h1 style={{ color: "black" }}>page 2</h1>
            </div>
            <div style={{ height: "100vh", backgroundColor: "transparent", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
              <h1 style={{ color: "black" }}>page 3</h1>
            </div>
            {/* Add content at specific scroll positions */}
            <div style={{ position: "absolute", top: "400vh", width: "100%", textAlign: "center" }}>
              <h1 style={{ color: "black" }}>Content at 400vh</h1>
              <p style={{ color: "black" }}>This is some content that appears when you scroll to 400vh.</p>
            </div>
          </div>
        </div>

        {/* Transparent and non-interceptive Canvas */}
        <div
          style={{
            height: "100vh",
            width: "100vw",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 0,
            pointerEvents: "none", // Allow pointer events to pass through
          }}
        >
          <Canvas
            camera={{ position: [-40, 0, 0] }}
            style={{ backgroundColor: "transparent" }} // Make Canvas background transparent
          >
            {/* Ambient and Directional Lights */}
            <ambientLight intensity={0.5} />
            <directionalLight intensity={2.5} position={[5, 5, 5]} castShadow />
            <directionalLight intensity={2.5} position={[-5, 5, -5]} castShadow />
            <directionalLight intensity={2.5} position={[0, 5, 0]} castShadow />
            <directionalLight intensity={2.5} position={[5, 5, 0]} castShadow />
            <pointLight position={[-5, 5, -5]} intensity={5.7} />

            {/* Update the Camera position smoothly based on scroll */}
            <CameraController />

            {/* Render the hallway model */}
            {imageUrls.map((image, index) => (
              <AnimatedImage
                key={index}
                url={image.url}
                position={[80 + index * 40, 0, -5]} // Adjust position to prevent overlap
                scroll={scrollHeight}
                scrollEvent={image.scrollEvent} // Adjust scroll event to trigger at different points
              />
            ))}
          </Canvas>
        </div>
      </section>
    </>
  );
};

export default About1;
