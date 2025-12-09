import React from 'react'
import FloatingLeftCard from './FloatingLeftCard'
import FloatingBottomCard from './FloatingBottomCard';

function UI({showMeasurements, setShowMeasurements, onCheckout,setActiveMaterial,setCategorySelectedMaterial,clickedMeshCategory,setClickedMeshCategory}) {
    return (
        <>
            <FloatingLeftCard 
            showMeasurements={showMeasurements} 
            setShowMeasurements={setShowMeasurements}
            setActiveMaterial={setActiveMaterial}
            setCategorySelectedMaterial={setCategorySelectedMaterial}
            clickedMeshCategory={clickedMeshCategory}
            setClickedMeshCategory={setClickedMeshCategory}
            />
            <FloatingBottomCard onCheckout={onCheckout} />
        </>
    );
}

export default UI;