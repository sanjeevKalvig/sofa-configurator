import React, { useEffect } from "react";
import { X } from "lucide-react";
import { data } from "../config/data";

export default function MeshDetailsPanel({
    isUserNotified,
    setIsUserNotified,
    hoveredMesh,
    onClose,
    activeMaterial,
}) {

    // Hide hint after 4 seconds 
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsUserNotified(false);
        }, 4000); // 4 seconds
    }, []);

    if (!hoveredMesh) return null;
    const targetMeshData = data.meshClickConfig.find((mesh) => mesh.meshName == hoveredMesh.name);
    if(!targetMeshData) return;

    return (
        <div
        // className="fixed inset-0"
        >
            {isUserNotified && (
                <div className="animate-text absolute top-[20%] left-[30%] text-white text-4xl font-semibold">
                    Click on close button to unfocus
                </div>
            )}
            {/* Right side panel */}
            <div className="absolute top-8 right-4 ml-auto w-100 backdrop-blur-sm shadow-xl rounded-lg z-30 p-6 flex flex-col">

                {/* Tooltip */}
                {/* <div className="absolute -top-5 right-8 bg-blue-500 text-white px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                    <div className="text-sm font-medium">
                        Click on close button to unfocus
                    </div>
                    <div className="absolute -bottom-1 left-[80%] transform -translate-x-1/2">
                        <div className="w-3 h-3 bg-blue-500 rotate-45" />
                    </div>
                </div> */}


                {/* Mesh Name and close button */}
                <div className="flex justify-between items-center mb-4">
                    <p className="text-3xl uppercase font-medium  underline underline-offset-4">{targetMeshData.nameToDisplay}</p>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-white text-lg bg-gradient-to-r from-red-500 to-red-600 rounded-xl px-4 py-2 cursor-pointer hover:from-red-600 hover:to-red-700 active:scale-95 transition-all shadow-lg border-2 border-red-400"
                    >
                        {/* <X className="w-5 h-5" /> */}
                        Close
                    </button>
                </div>

                {/* Dimensions */}
                <p className="text-2xl mb-4 font-semibold">
                    {targetMeshData.dimensions}
                </p>

                {/* Material */}
                <p className="text-xl font-semibold">{activeMaterial?.materialName}</p>



            </div>
        </div>
    );
}