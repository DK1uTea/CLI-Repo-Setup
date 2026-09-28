'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Default: Berlin, Germany
const BERLIN = { lat: 52.52, lng: 13.405 };

const markerIcon = L.icon({
    iconUrl: '/images/marker-icon.png',
    iconSize: [28, 37],
    iconAnchor: [14, 37],
    popupAnchor: [0, -36],
});

const ICON_PIN = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const ICON_USER = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`;

function buildPopupHtml(title?: string, address?: string, organizer?: string) {
    const displayTitle = title || 'Sommerfest Berlin 2025';
    const displayAddress = address || 'Unter den Linden 1, 10117 Berlin';
    const displayOrganizer = organizer || 'Max Mustermann';

    return `
    <div style="font-family:inherit;min-width:180px;display:flex;flex-direction:column;gap:6px">
      <div style="font-weight:700;font-size:13px" translate="no">${displayTitle}</div>
      <div style="display:flex;gap:6px;align-items:flex-start;font-size:12px;color:#666">
        ${ICON_PIN}
        <span translate="no">${displayAddress}</span>
      </div>
      <div style="display:flex;gap:6px;align-items:flex-start;font-size:12px">
        ${ICON_USER}
        <span translate="no">${displayOrganizer}</span>
      </div>
    </div>
  `;
}

type Props = {
    lat?: number | null;
    lng?: number | null;
    title?: string;
    address?: string;
    organizer?: string;
};

export function SummaryMapInner({ lat, lng, title, address, organizer }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    const hasLocation = !!(lat && lng);
    const position: L.LatLngTuple = hasLocation ? [lat!, lng!] : [BERLIN.lat, BERLIN.lng];
    const zoom = 13;

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(position, zoom);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        if (hasLocation) {
          const marker = L.marker(position, { icon: markerIcon }).addTo(map);
          marker.bindPopup(buildPopupHtml(title, address, organizer));
        }

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ height: 400, width: '100%', borderRadius: 14, overflow: 'hidden', zIndex: 0 }}
        />
    );
}
