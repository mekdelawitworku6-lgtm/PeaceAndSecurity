"use client"

import React, { useCallback, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const containerStyle = {
    width: '100%',
    height: '100%'
}

const defaultCenter = {
    lat: 9.0300,
    lng: 38.7400
}

interface MapPickerProps {
    lat?: number
    lng?: number
    onChange: (lat: number, lng: number) => void
    height?: string
}

export function MapPicker({ lat, lng, onChange, height = "300px" }: MapPickerProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-picker-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    })

    const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
        lat && lng ? { lat, lng } : null
    )

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newLat = e.latLng.lat()
            const newLng = e.latLng.lng()
            setMarker({ lat: newLat, lng: newLng })
            onChange(newLat, newLng)
        }
    }, [onChange])

    const center = marker || defaultCenter

    if (!isLoaded) {
        return (
            <div className="w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs" style={{ height }}>
                Loading Maps...
            </div>
        )
    }

    return (
        <div className="rounded-xl overflow-hidden border border-slate-200">
            <GoogleMap
                mapContainerStyle={{ ...containerStyle, height }}
                center={center}
                zoom={marker ? 15 : 12}
                onClick={onMapClick}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                }}
            >
                {marker && (
                    <Marker
                        position={marker}
                        draggable={false}
                    />
                )}
            </GoogleMap>
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold">
                    {marker ? `${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}` : "Click on the map to set location"}
                </span>
                {marker && (
                    <button
                        type="button"
                        onClick={() => { setMarker(null); onChange(0, 0) }}
                        className="text-[10px] text-red-500 font-bold hover:underline"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    )
}
