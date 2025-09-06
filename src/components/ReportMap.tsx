import * as L from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

import 'leaflet/dist/leaflet.css'
import { Hourglass, Locate, Map, Satellite } from 'lucide-preact'
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
	const [style, setStyle] = useState<'Satellite' | 'Topographic'>('Topographic')
	const [zoom, setZoom] = useState(13)
	const [center, setCenter] = useState<L.LatLngExpression>(
		markerLocation
			? [markerLocation.lat, markerLocation.lng]
			: [59.905900733292235, 10.7496181292028],
	)
	const [isLocating, setIsLocating] = useState(false)

	const toggleMapStyle = () => {
		setStyle(style === 'Satellite' ? 'Topographic' : 'Satellite')
	}

	const centerOnUserLocation = useMemo(
		() => () => {
			if (!mapInstance) return
			if (!('geolocation' in navigator)) {
				alert('Geolocation is not supported by this browser.')
				return
			}

			setIsLocating(true)

			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords
					const userLatLng = L.latLng(latitude, longitude)
					mapInstance.setView(userLatLng, zoom)
					setIsLocating(false)
				},
				(error) => {
					console.error('Error getting user location:', error)
					setIsLocating(false)
					alert(
						'Unable to get your location. Please ensure location services are enabled.',
					)
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 300000, // 5 minutes
				},
			)
		},
		[mapInstance, zoom],
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
			// Add Norgeskart layers («topografisk kart»)
			L.tileLayer(
				'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
				{
					attribution:
						'&copy; <a href="http://www.kartverket.no/">Kartverket</a>',
				},
			).addTo(map)
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
				iconUrl: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/images/marker-icon.png`,
				shadowUrl: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/images/marker-shadow.png`,
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
			<div className="map-controls">
				<button
					className="map-control-button"
					onClick={toggleMapStyle}
					type="button"
				>
					{style === 'Satellite' ? <Satellite /> : <Map />}
				</button>
				<button
					className="map-control-button"
					onClick={centerOnUserLocation}
					disabled={isLocating}
					type="button"
				>
					{isLocating ? <Hourglass /> : <Locate />}
				</button>
			</div>
		</div>
	)
}
