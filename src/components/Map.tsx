import { useMapSettings } from '#context/MapSettings.tsx'
import { useReports } from '#context/Reports.tsx'
import { shortId, TrashType } from '@fjordcleanup/trash-proto'
import cx from 'classnames'
import * as L from 'leaflet'
import { route } from 'preact-router'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

import 'leaflet/dist/leaflet.css'
import './Map.css'

const isLandscape = () => window.innerWidth > window.innerHeight

export const Map = ({
	center,
	onClick,
}: {
	onClick?: () => void
	center?: { lat: number; lng: number }
}) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const initialized = useRef<boolean>(false)
	const settings = useMapSettings()
	const { reports } = useReports()
	const [mapInstance, setMap] = useState<L.Map>()
	const defaultZoom = useMemo(() => (isLandscape() ? 12 : 10), [])
	const [zoom, setZoom] = useState<number>(defaultZoom)

	useEffect(() => {
		if (containerRef.current === null) return
		if (initialized.current) return
		initialized.current = true

		const map = L.map(containerRef.current, {
			center: [
				center?.lat ?? settings.center?.lat ?? 59.905900733292235,
				center?.lng ?? settings.center?.lng ?? 10.7496181292028,
			],
			zoom: defaultZoom,
			keyboard: false,
			maxZoom: 18,
		})

		// Add Norgeskart layers («topografisk kart»)
		L.tileLayer(
			'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
			{
				attribution:
					'&copy; <a href="http://www.kartverket.no/">Kartverket</a>',
			},
		).addTo(map)

		map.whenReady(() => {
			console.debug(`[Map]`, `loaded`)
			setMap(map)
		})

		map.on('click', () => {
			onClick?.()
		})

		map.on('zoomend', () => {
			const newZoom = Math.floor(map.getZoom())
			if (newZoom !== zoom) {
				setZoom(newZoom)
			}
		})

		return () => {
			console.debug(`[Map]`, `unmounted`)
			console.debug(`[Map]`, `cleaning up`)
			map.remove()
		}
	}, [containerRef, initialized])

	useEffect(() => {
		if (mapInstance === undefined) return
		const markers: Array<L.Marker> = []

		for (const report of reports) {
			const el = document.createElement('div')
			el.className = 'trash-marker'

			const escooterEl = document.createElement('div')
			escooterEl.className = report.type.includes(TrashType.Escooter)
				? 'escooter active'
				: 'escooter'
			el.appendChild(escooterEl)
			const bulkEl = document.createElement('div')
			bulkEl.className = report.type.includes(TrashType.Bulk)
				? 'bulk active'
				: 'bulk'
			el.appendChild(bulkEl)
			const litterEl = document.createElement('div')
			litterEl.className = report.type.includes(TrashType.Litter)
				? 'litter active'
				: 'litter'
			el.appendChild(litterEl)
			const otherEl = document.createElement('div')
			otherEl.className = report.type.includes(TrashType.Other)
				? 'other active'
				: 'other'
			el.appendChild(otherEl)

			const titleEl = document.createElement('div')
			titleEl.className = 'title'
			let title = shortId(report)
			if (report.isPublic !== true) title = '🔒' + title
			titleEl.textContent = title
			el.appendChild(titleEl)

			// add marker to map
			const marker = L.marker([report.location.lat, report.location.lng], {
				icon: L.divIcon({
					html: el.outerHTML,
					className: 'custom-div-icon',
					iconSize: [24, 24],
					iconAnchor: [12, 12],
				}),
			}).addTo(mapInstance)

			// Handle click event
			marker.on('click', (ev: L.LeafletMouseEvent) => {
				L.DomEvent.stopPropagation(ev)
				if (report.$meta.id === undefined) return
				route(`/map/${report.$meta.id}`)
			})

			markers.push(marker)
		}

		return () => {
			console.debug(`[Map]`, `cleaning up markers`)
			markers.forEach((marker) => marker.remove())
		}
	}, [reports, mapInstance])

	return (
		<div
			id="map"
			class={cx({
				'zoom-detail': zoom >= 14,
			})}
			ref={containerRef}
		/>
	)
}
