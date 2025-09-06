import * as L from 'leaflet'
import { useEffect, useRef } from 'preact/hooks'

import 'leaflet/dist/leaflet.css'
import './MiniMap.css'

export const MiniMap = ({
	markerLocation,
}: {
	markerLocation: { lng: number; lat: number }
}) => {
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (containerRef.current === null) return

		const map = L.map(containerRef.current, {
			center: [markerLocation.lat, markerLocation.lng],
			zoom: 12,
			keyboard: false,
			zoomControl: false,
			attributionControl: false,
		})

		// Add OpenStreetMap tile layer
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map)

		const marker = L.marker([markerLocation.lat, markerLocation.lng], {
			icon: L.icon({
				iconUrl:
					'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
				shadowUrl:
					'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
				shadowSize: [41, 41],
			}),
		}).addTo(map)

		return () => {
			console.debug(`[Map]`, `unmounted`)
			console.debug(`[Map]`, `cleaning up`)
			marker.remove()
			map.remove()
		}
	}, [containerRef, markerLocation])

	return <div id="miniMap" ref={containerRef} />
}
