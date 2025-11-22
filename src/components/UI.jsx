import React from 'react'
import FloatingLeftCard from './FloatingLeftCard'
import FloatingBottomCard from './FloatingBottomCard';

function UI({showMeasurements, setShowMeasurements, onCheckout}) {
    return (
        <>
            <FloatingLeftCard showMeasurements={showMeasurements} setShowMeasurements={setShowMeasurements}/>
            <FloatingBottomCard onCheckout={onCheckout} />
        </>
    );
}

export default UI;