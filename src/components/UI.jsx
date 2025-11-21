import React from 'react'
import FloatingLeftCard from './FloatingLeftCard'
import FloatingBottomCard from './FloatingBottomCard';
 
function UI({showMeasurements, setShowMeasurements}) {
    return (
        <>
            <FloatingLeftCard showMeasurements={showMeasurements} setShowMeasurements={setShowMeasurements}/>
            <FloatingBottomCard />
        </>
    );
}
 
export default UI;