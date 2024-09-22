import { Canvas } from '@react-three/fiber'
import { EffectComposer, DepthOfField } from '@react-three/postprocessing'
import * as THREE from 'three'
import About1 from './components/About1'
import './App.css'


function App() {

  return (
    <Canvas
      camera={{
        fov: 64,
        position: [0, 0, 0],
      }}
      gl={{ antialias: true }}
      onCreated={({ scene }) => {
        scene.fog = new THREE.FogExp2(0xFFFFFF, 0.1); // Add fog with color and density
      }}
    >
      <About1 />
    </Canvas>
  )
}

export default App
