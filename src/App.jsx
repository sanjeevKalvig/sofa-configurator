import React, { useState } from 'react'
import { useLoader } from './hooks/useLoader'
import Scene from './components/Scene'
import LoadingScreen from './components/LoadingScreen'
import UI from './components/UI'

function App() {
  const { loading } = useLoader()
  const [ showMeasurements, setShowMeasurements ] = useState(false)
  if (loading) return <LoadingScreen/>
  
  return (
    <div className="h-screen bg-blue-100 p-4">
    <div className="relative h-full rounded-4xl overflow-hidden shadow-xl">
      <Scene showMeasurements={showMeasurements} setShowMeasurements={setShowMeasurements}/>
      <UI showMeasurements={showMeasurements} setShowMeasurements={setShowMeasurements}/>
    </div>
  </div>
  )
}

export default App