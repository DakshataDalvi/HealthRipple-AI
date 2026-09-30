// ============================================================
// GooglePHCMap.jsx — Google Maps replacement for PHCMap.jsx
//
// Used on the Overview page. Displays all 25 PHCs as coloured
// Advanced Markers. Clicking a marker fires onSelectPHC().
// Nearby-PHC connections are drawn as grey polylines.
//
// Props mirror PHCMap.jsx exactly so callers can swap them
// with a single import change:
//   phcs          — full phcData.phcs array
//   selectedPHC   — currently selected PHC object or null
//   onSelectPHC   — callback(phc)
//   highlightedIds — array of PHC ids to highlight (optional)
//
// Requires: VITE_GOOGLE_MAPS_API_KEY in .env
// Falls back to null render when key is missing (caller shows Leaflet).
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { REGION } from '../data/phcData';

// ─── Status colours (match Leaflet version exactly) ──────────
const STATUS_COLORS = {
  stable: '#16a34a',
  'at-risk': '#d97706',
  critical: '#dc2626',
  disrupted: '#7c3aed',
};

const INDIA_CENTER = { lat: REGION.center[0], lng: REGION.center[1] };

// ─── Inner map layer (must be inside <Map>) ───────────────────
function PHCMarkerLayer({ phcs, selectedPHC, onSelectPHC, highlightedIds }) {
  const map = useMap();
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);

  // Draw nearby-PHC connections once
  useEffect(() => {
    if (!map || !phcs) return;

    // Clean up old polylines
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    // Build a quick lookup
    const byId = Object.fromEntries(phcs.map(p => [p.id, p]));

    phcs.forEach(phc => {
      (phc.nearbyPHCIds || []).forEach(nid => {
        const neighbor = byId[nid];
        if (!neighbor) return;
        if (phc.id >= nid) return; // draw each edge once

        // Compute Haversine distance for display
        const R = 6371;
        const dLat = ((neighbor.lat - phc.lat) * Math.PI) / 180;
        const dLng = ((neighbor.lng - phc.lng) * Math.PI) / 180;
        const a = Math.sin(dLat/2)**2 +
          Math.cos((phc.lat * Math.PI)/180) *
          Math.cos((neighbor.lat * Math.PI)/180) *
          Math.sin(dLng/2)**2;
        const distKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;

        const line = new window.google.maps.Polyline({
          path: [
            { lat: phc.lat, lng: phc.lng },
            { lat: neighbor.lat, lng: neighbor.lng },
          ],
          geodesic: true,
          strokeColor: '#cbd5e1',
          strokeOpacity: 0.6,
          strokeWeight: 1.5,
          map,
        });

        // Show distance on hover
        const info = new window.google.maps.InfoWindow({
          content: `
            <div style="font-size:11px;font-weight:600;color:#374151">${phc.name} ↔ ${neighbor.name}</div>
            <div style="font-size:11px;color:#6b7280;margin-top:2px">📍 ${distKm} km apart (straight-line)</div>
            <div style="font-size:10px;color:#9ca3af;margin-top:2px">Nearby PHC network connection</div>
          `,
          disableAutoPan: true,
        });
        line.addListener('click', e => info.open({ map, position: e.latLng }));
        line.addListener('mouseover', e => info.open({ map, position: e.latLng }));
        line.addListener('mouseout', () => info.close());

        polylinesRef.current.push(line);
      });
    });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, phcs]);

  // Create / update markers when PHC list or selection changes
  useEffect(() => {
    if (!map || !phcs) return;

    // Remove old markers
    markersRef.current.forEach(({ marker }) => {
      marker.map = null;
    });
    markersRef.current = [];

    phcs.forEach(phc => {
      const isSelected = selectedPHC?.id === phc.id;
      const isHighlighted = (highlightedIds || []).includes(phc.id);
      const color = STATUS_COLORS[phc.status] || '#6b7280';
      const size = isSelected ? 18 : isHighlighted ? 14 : 10;
      const borderWidth = isSelected ? 3 : isHighlighted ? 2 : 1.5;

      // Build an SVG circle as the marker icon
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size * 2}" height="${size * 2}" viewBox="0 0 ${size * 2} ${size * 2}">
          <circle cx="${size}" cy="${size}" r="${size - borderWidth}" fill="${color}"
            stroke="white" stroke-width="${borderWidth}" />
        </svg>`;

      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      const markerEl = document.createElement('div');
      markerEl.style.cursor = 'pointer';
      const img = document.createElement('img');
      img.src = url;
      img.width = size * 2;
      img.height = size * 2;
      markerEl.appendChild(img);

      // Use AdvancedMarkerElement if available, else fall back to Marker
      let marker;
      if (window.google.maps.marker?.AdvancedMarkerElement) {
        marker = new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: phc.lat, lng: phc.lng },
          content: markerEl,
          title: `${phc.name} — ${phc.patientsPerDay} pts/day`,
        });
        marker.addListener('click', () => onSelectPHC(phc));
      } else {
        // Fallback to legacy Marker
        marker = new window.google.maps.Marker({
          map,
          position: { lat: phc.lat, lng: phc.lng },
          title: phc.name,
          icon: {
            url,
            scaledSize: new window.google.maps.Size(size * 2, size * 2),
            anchor: new window.google.maps.Point(size, size),
          },
        });
        marker.addListener('click', () => onSelectPHC(phc));
      }

      // InfoWindow on hover
      const info = new window.google.maps.InfoWindow({
        content: `
          <div style="font-size:12px;font-weight:600;color:#111">${phc.name}</div>
          <div style="font-size:11px;color:#555">${phc.district}, ${phc.state}</div>
          <div style="font-size:11px;color:#555;margin-top:2px">${phc.patientsPerDay} pts/day · ${phc.status}</div>
        `,
        disableAutoPan: true,
      });

      if (window.google.maps.marker?.AdvancedMarkerElement) {
        marker.addListener('mouseover', () => info.open({ map, anchor: marker }));
        marker.addListener('mouseout', () => info.close());
      } else {
        marker.addListener('mouseover', () => info.open(map, marker));
        marker.addListener('mouseout', () => info.close());
      }

      markersRef.current.push({ marker, url });
    });

    return () => {
      markersRef.current.forEach(({ marker, url }) => {
        if (window.google.maps.marker?.AdvancedMarkerElement) {
          marker.map = null;
        } else {
          marker.setMap(null);
        }
        URL.revokeObjectURL(url);
      });
      markersRef.current = [];
    };
  }, [map, phcs, selectedPHC, highlightedIds, onSelectPHC]);

  // Fit bounds when PHC list changes
  useEffect(() => {
    if (!map || !phcs || phcs.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    phcs.forEach(p => {
      bounds.extend({ lat: p.lat, lng: p.lng });
    });
    map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
  }, [map, phcs]);

  return null;
}

// ─── Main exported component ──────────────────────────────────
export default function GooglePHCMap({ phcs, selectedPHC, onSelectPHC, highlightedIds = [] }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Graceful no-op if key is missing — caller shows Leaflet fallback
  if (!apiKey || apiKey === 'your_google_maps_api_key_here' || apiKey.trim() === '') {
    return null;
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['marker']}>
      <Map
        defaultCenter={INDIA_CENTER}
        defaultZoom={REGION.zoom}
        mapId="healthripple-overview"   // required for AdvancedMarkerElement
        gestureHandling="greedy"
        disableDefaultUI={false}
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
        mapTypeId="roadmap"
      >
        <PHCMarkerLayer
          phcs={phcs}
          selectedPHC={selectedPHC}
          onSelectPHC={onSelectPHC}
          highlightedIds={highlightedIds}
        />
      </Map>
    </APIProvider>
  );
}
