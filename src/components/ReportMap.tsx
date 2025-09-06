import * as L from 'leaflet'
import { Locate, Map, Satellite } from 'lucide-preact'
import { useEffect, useRef, useState } from 'preact/hooks'

import 'leaflet/dist/leaflet.css'
import './ReportMap.css'

export const ReportMap = ({
	markerLocation,
	onClick,
}: {
	markerLocation?: L.LatLng
	onClick?: (lngLat: L.LatLng) => void
}) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const [mapInstance, setMap] = useState<L.Map>()
	const [style, setStyle] = useState<'Satellite' | 'Standard'>('Standard')
	const [zoom, setZoom] = useState(13)
	const [center, setCenter] = useState<L.LatLngExpression>(
		markerLocation
			? [markerLocation.lat, markerLocation.lng]
			: [59.905900733292235, 10.7496181292028],
	)

	useEffect(() => {
		if (containerRef.current === null) return

		const map = L.map(containerRef.current, {
			center,
			zoom,
			keyboard: false,
		})

		// Add tile layer based on style
		if (style === 'Satellite') {
			L.tileLayer(
				'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
				{
					attribution:
						'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
				},
			).addTo(map)
		} else {
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			}).addTo(map)
		}

		map.whenReady(() => {
			console.debug(`[Map]`, `loaded`)
			setMap(map)
		})

		map.on('click', (e: L.LeafletMouseEvent) => {
			const lngLat = L.latLng(e.latlng.lat, e.latlng.lng)
			console.debug(`[Map]`, `clicked at`, lngLat)
			onClick?.(lngLat)
		})

		map.on('zoomend', () => {
			const currentZoom = map.getZoom()
			setZoom(currentZoom)
		})

		map.on('moveend', () => {
			const currentCenter = map.getCenter()
			console.debug(`[Map]`, `moved to`, currentCenter)
			setCenter([currentCenter.lat, currentCenter.lng])
		})

		return () => {
			console.debug(`[Map]`, `unmounted`)
			console.debug(`[Map]`, `cleaning up`)
			map.remove()
		}
	}, [containerRef, style])

	useEffect(() => {
		if (mapInstance === undefined) return
		if (markerLocation === undefined) return

		console.debug(`[Map]`, `updating marker location to`, markerLocation)
		const marker = L.marker([markerLocation.lat, markerLocation.lng], {
			draggable: true,
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
		}).addTo(mapInstance)

		marker.on('dragend', () => {
			const lngLat = marker.getLatLng()
			console.debug(`[Map]`, `marker dragged to`, lngLat)
			onClick?.(lngLat)
		})

		return () => {
			marker.remove()
			console.debug(`[Map]`, `marker removed`)
		}
	}, [markerLocation, mapInstance])

	return (
		<div id="reportMapContainer">
			<div id="reportMap" ref={containerRef} />
			<nav>
				{style === 'Satellite' ? (
					<button
						type="button"
						class="btn btn-secondary d-flex align-items-center flex-column"
						onClick={() => setStyle('Standard')}
						title="Terrain view"
					>
						<Map />
					</button>
				) : (
					<button
						type="button"
						class="btn btn-secondary d-flex align-items-center flex-column"
						onClick={() => setStyle('Satellite')}
						title="Satellite view"
					>
						<Satellite />
					</button>
				)}

				{navigator.geolocation !== undefined && (
					<button
						type="button"
						class="btn btn-secondary d-flex align-items-center flex-column mt-2"
						onClick={() => {
							navigator.geolocation.getCurrentPosition(
								(position) => {
									const { latitude, longitude } = position.coords
									mapInstance?.flyTo([latitude, longitude])
									setCenter([latitude, longitude])
								},
								(error) => {
									console.error('Error getting location:', error.message)
									alert(
										'Unable to retrieve your location. Please ensure location access is enabled.',
									)
								},
								{ enableHighAccuracy: true },
							)
						}}
						title="Locate me"
					>
						<Locate />
					</button>
				)}
			</nav>
		</div>
	)
}
