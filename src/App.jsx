import { useState } from 'react'
import './App.css'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Path } from './components/Path'
import About1 from './components/About1'

function App() {
  const [count, setCount] = useState(0)

  return (
      <Path />
  )
}

export default App
