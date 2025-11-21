import React, { useEffect, useState } from 'react'
import { preloadModels } from '../utils/modelCache'
import { preloadTextures } from '../utils/textureCache'

export function useLoader() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadAll() {
            try {
                // Preload all assets
                await Promise.all([
                    preloadModels(),
                    preloadTextures()
                ])


                // Delay showing scene slightly (sync with fade)
                setTimeout(() => {
                    setLoading(false)
                }, 800)
            } catch (err) {
                console.error('Preloading failed:', err)
                setLoading(false)
            }
        }

        loadAll()
    }, [])

    return { loading };

}
