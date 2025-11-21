import React from 'react'

function Lights() {
    return (
        <>

            <directionalLight position={[0, 0, 5]} intensity={1.2}   />
            <directionalLight position={[0, 0, -5]} intensity={1.2}   />
            <directionalLight position={[5, 0, -5]} intensity={1.2}   />
            <directionalLight position={[-5, 0, -5]} intensity={1.2}   />
            <directionalLight position={[0, 5, 0]} intensity={1.2}   />
        </>
    )
}

export default Lights