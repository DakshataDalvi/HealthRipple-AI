// ============================================================
// GoogleSimulationMap.jsx — Google Maps simulation results map (v2)
//
// Enhancements over v1:
//  • Each patient-flow line shows distance in km (from Haversine calc)
//  • Click a flow line to see the full evaluation breakdown:
//      Distance (geographic proximity) | Capacity surplus | Utilization
//      → Weight score that determined the patient share
//  • Candidate PHCs that were evaluated but NOT selected as receivers
//    are shown as dashed grey "considered" lines from the disrupted PHC
//  • Clear visual distinction:
//      Solid blue line  = recommended redistribution (hop 1)
//      Dashed purple    = secondary ripple (hop 2)
//      Thin dashed grey = geographic candidate (considered, not selected)
//  • InfoWindow on each marker includes load / utilization / incoming patients
//  • Auto-fits map to affected PHCs after simulation
//
// Simulation data model is unchanged.
// Falls back to null when VITE_GOOGLE_MAPS_API_KEY is absent.
// ============================================================

import { useEffect, useRef } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { REGION, phcs as allPHCs } from '../data/phcData';

const STATUS_COLORS = {
  stable: '#16a34a',
  'at-risk': '#d97706',
  critical: '#dc2626',
  disrupted: '#7c3aed',
};

const INDIA_CENTER = { lat: REGION.center[0], lng: REGION.center[1] };

// SVG circle blob URL
function makeSvgUrl(color, size, borderWidth) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size*2}" height="${size*2}" viewBox="0 0 ${size*2} ${size*2}">
    <circle cx="${size}" cy="${size}" r="${size - borderWidth}" fill="${color}" stroke="white" stroke-width="${borderWidth}"/>
  </svg>`;
  return URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
}

// Attach a marker (AdvancedMarkerElement if available, legacy Marker as fallback)
function createMarker(map, position, content, title, zIndex) {
  if (window.google.maps.marker?.AdvancedMarkerElement) {
    const m = new window.google.maps.marker.AdvancedMarkerElement({
      map, position, content, title, zIndex,
    });
    return m;
  }
  // Legacy path — content must be an icon url+size object
  const url = content._fallbackUrl;
  const size = content._fallbackSize;
  return new window.google.maps.Marker({
    map, position, title, zIndex,
    icon: { url, scaledSize: new window.google.maps.Size(size, size), anchor: new window.google.maps.Point(size/2, size/2) },
  });
}

function addListeners(marker, map, info, isAdvanced) {
  if (isAdvanced) {
    marker.addListener('click',     () => info.open({ map, anchor: marker }));
    marker.addListener('mouseover', () => info.open({ map, anchor: marker }));
    marker.addListener('mouseout',  () => info.close());
  } else {
    marker.addListener('click',     () => info.open(map, marker));
    marker.addListener('mouseover', () => info.open(map, marker));
    marker.addListener('mouseout',  () => info.close());
  }
}

// ─── Inner map layer ──────────────────────────────────────────
function SimulationLayer({ result }) {
  const map = useMap();
  const markersRef  = useRef([]);
  const linesRef    = useRef([]);
  const infoRefs    = useRef([]);

  useEffect(() => {
    if (!map) return;

    // ── Cleanup ────────────────────────────────────────────────
    markersRef.current.forEach(({ marker, url }) => {
      try { marker.map = null; } catch (_) { try { marker.setMap(null); } catch (__) {} }
      if (url) URL.revokeObjectURL(url);
    });
    markersRef.current = [];
    linesRef.current.forEach(l => l.setMap(null));
    linesRef.current = [];
    infoRefs.current.forEach(i => i.close());
    infoRefs.current = [];

    const isAdvanced = !!window.google.maps.marker?.AdvancedMarkerElement;
    const byId = Object.fromEntries(allPHCs.map(p => [p.id, p]));

    // ── Baseline (no simulation yet) ──────────────────────────
    if (!result) {
      allPHCs.forEach(phc => {
        const color = STATUS_COLORS[phc.status] || '#9ca3af';
        const size = 8;
        const url = makeSvgUrl(color, size, 1.5);

        const markerEl = document.createElement('div');
        markerEl.style.cursor = 'default';
        const img = document.createElement('img');
        img.src = url; img.width = size*2; img.height = size*2;
        markerEl.appendChild(img);
        if (!isAdvanced) { markerEl._fallbackUrl = url; markerEl._fallbackSize = size*2; }

        const marker = createMarker(map, { lat: phc.lat, lng: phc.lng }, markerEl, phc.name, 1);
        markersRef.current.push({ marker, url });
      });
      return;
    }

    // ── With simulation result ─────────────────────────────────
    const affectedMap = Object.fromEntries(result.affectedPHCs.map(ap => [ap.id, ap]));
    const disruptedId = result.params.phcId;
    const disruptedPHC = byId[disruptedId];

    // IDs of PHCs that actually received patients (flow.toId with patients > 0)
    const receiverIds = new Set(
      (result.patientFlows || []).filter(f => f.patients > 0 && f.hop === 1).map(f => f.toId)
    );

    // IDs evaluated as candidates but NOT ultimately receiving patients (sharePct > 0 but patients = 0)
    const candidateIds = new Set(
      (result.candidateEvaluations || [])
        .filter(c => !receiverIds.has(c.phcId) && c.phcId !== disruptedId)
        .map(c => c.phcId)
    );

    // ── Geographic candidate lines (thin dashed grey) ─────────
    // These show which PHCs were GEOGRAPHICALLY CONSIDERED but didn't receive the most patients
    // Label: "Candidate – X km" to distinguish proximity from recommendation
    if (disruptedPHC) {
      (result.candidateEvaluations || []).forEach(c => {
        const toPHC = byId[c.phcId];
        if (!toPHC || c.phcId === disruptedId) return;
        // Only draw a "candidate" line if this PHC didn't receive a primary flow
        if (receiverIds.has(c.phcId)) return;

        const line = new window.google.maps.Polyline({
          path: [
            { lat: disruptedPHC.lat, lng: disruptedPHC.lng },
            { lat: toPHC.lat,        lng: toPHC.lng        },
          ],
          geodesic: true,
          strokeColor: '#94a3b8',   // slate-400 — clearly "candidate, not selected"
          strokeOpacity: 0,
          strokeWeight: 1.5,
          icons: [{
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 0.5,
              strokeColor: '#94a3b8',
              scale: 2,
            },
            offset: '0', repeat: '8px',
          }],
          map,
          zIndex: 1,
        });

        const info = new window.google.maps.InfoWindow({
          content: `
            <div style="font-size:12px;font-weight:600;color:#64748b">Geographic Candidate</div>
            <div style="font-size:11px;color:#555;margin-top:2px">
              ${toPHC.name} — <strong>${c.distanceKm} km</strong> away
            </div>
            <div style="font-size:11px;color:#555;margin-top:2px">
              Capacity surplus: ${c.capacitySurplus} pts &nbsp;|&nbsp; 
              Utilization: ${c.utilizationPct}%
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;font-style:italic">
              ⚠ Considered geographically but outweighed by nearer or less-loaded facilities
            </div>
          `,
          disableAutoPan: true,
        });
        line.addListener('click', e => { info.open({ map, position: e.latLng }); infoRefs.current.push(info); });
        linesRef.current.push(line);
      });
    }

    // ── Patient flow lines ─────────────────────────────────────
    (result.patientFlows || [])
      .filter(f => f.patients > 0)
      .forEach(f => {
        const from = byId[f.fromId];
        const to   = byId[f.toId];
        if (!from || !to) return;

        const isHop2  = f.hop === 2;
        const color   = isHop2 ? '#7c3aed' : '#2563eb';
        const weight  = Math.max(2, Math.min(6, f.patients / 20));
        const distStr = f.distanceKm != null ? `${f.distanceKm} km` : '—';

        const line = new window.google.maps.Polyline({
          path: [{ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng }],
          geodesic: true,
          strokeColor: color,
          strokeOpacity: isHop2 ? 0 : 0.8,
          strokeWeight: weight,
          icons: isHop2
            ? [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.85, strokeColor: color, scale: 3 }, offset: '0', repeat: '10px' }]
            : [{
                icon: {
                  path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  strokeColor: color, strokeOpacity: 1, fillColor: color, fillOpacity: 1, scale: 3,
                },
                offset: '100%',
              }],
          map,
          zIndex: 10,
        });

        // ── Flow InfoWindow: geographic + capacity breakdown ───
        const evalEntry = (result.candidateEvaluations || []).find(c => c.phcId === f.toId);
        const breakdownHtml = evalEntry ? `
          <div style="margin-top:6px;border-top:1px solid #e5e7eb;padding-top:6px">
            <div style="font-size:10px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em">
              Why this facility was selected
            </div>
            <table style="font-size:11px;margin-top:4px;border-collapse:collapse;width:100%">
              <tr>
                <td style="color:#555;padding:1px 6px 1px 0">📍 Distance</td>
                <td style="font-weight:600">${distStr}</td>
                <td style="color:#6b7280;font-size:10px;padding-left:6px">(geographic proximity)</td>
              </tr>
              <tr>
                <td style="color:#555;padding:1px 6px 1px 0">🏥 Capacity surplus</td>
                <td style="font-weight:600">${evalEntry.capacitySurplus} pts</td>
                <td style="color:#6b7280;font-size:10px;padding-left:6px">(available headroom)</td>
              </tr>
              <tr>
                <td style="color:#555;padding:1px 6px 1px 0">📊 Utilization</td>
                <td style="font-weight:600">${evalEntry.utilizationPct}%</td>
                <td style="color:#6b7280;font-size:10px;padding-left:6px">(current load)</td>
              </tr>
              <tr>
                <td style="color:#555;padding:1px 6px 1px 0">⚖ Gravity weight</td>
                <td style="font-weight:600">${evalEntry.weightScore}</td>
                <td style="color:#6b7280;font-size:10px;padding-left:6px">(surplus ÷ distance)</td>
              </tr>
            </table>
            <div style="font-size:10px;color:#9ca3af;margin-top:4px;font-style:italic">
              Distance is one of multiple factors; capacity surplus drives the weight.
            </div>
          </div>` : '';

        const info = new window.google.maps.InfoWindow({
          content: `
            <div style="font-size:12px;font-weight:600;color:${color}">${isHop2 ? 'Secondary Ripple' : 'Patient Redistribution'}</div>
            <div style="font-size:11px;font-weight:600;color:#111;margin-top:2px">
              ${from.name} → ${to.name}
            </div>
            <div style="font-size:11px;color:#555;margin-top:2px">
              <strong>${f.patients}</strong> patients redirected
              ${distStr !== '—' ? ` &nbsp;·&nbsp; <strong>${distStr}</strong>` : ''}
              ${f.sharePct != null ? ` &nbsp;·&nbsp; ${f.sharePct}% of overflow` : ''}
            </div>
            ${breakdownHtml}
          `,
          disableAutoPan: true,
        });
        line.addListener('click', e => { info.open({ map, position: e.latLng }); infoRefs.current.push(info); });
        linesRef.current.push(line);
      });

    // ── PHC Markers ─────────────────────────────────────────────
    const bounds = new window.google.maps.LatLngBounds();

    allPHCs.forEach(phc => {
      const affected    = affectedMap[phc.id];
      const isAffected  = !!affected;
      const isDisrupted = affected?.isDisrupted;

      const statusKey = isDisrupted ? 'disrupted' : (affected?.computedStatus ?? phc.status);
      const color     = STATUS_COLORS[statusKey] || '#9ca3af';
      const size        = isDisrupted ? 16 : isAffected ? 12 : 7;
      const borderWidth = isDisrupted ? 3  : isAffected ? 2  : 1.5;
      const opacity     = isAffected ? 1 : 0.45;

      const url = makeSvgUrl(color, size, borderWidth);
      const markerEl = document.createElement('div');
      markerEl.style.opacity = String(opacity);
      markerEl.style.cursor = 'default';
      const img = document.createElement('img');
      img.src = url; img.width = size*2; img.height = size*2;
      markerEl.appendChild(img);
      if (!isAdvanced) { markerEl._fallbackUrl = url; markerEl._fallbackSize = size*2; }

      const zIndex = isDisrupted ? 100 : isAffected ? 50 : candidateIds.has(phc.id) ? 20 : 1;
      const marker = createMarker(map, { lat: phc.lat, lng: phc.lng }, markerEl, phc.name, zIndex);

      // InfoWindow content
      let html;
      if (affected) {
        const utilPct = Math.round(affected.utilizationFraction * 100);
        const evalEntry = (result.candidateEvaluations || []).find(c => c.phcId === phc.id);
        html = `
          <div style="font-size:12px;font-weight:600;color:#111">${phc.name}</div>
          <div style="font-size:11px;color:#555">${phc.district ?? phc.state}</div>
          <div style="font-size:11px;margin-top:4px">
            Load: <strong>${affected.currentLoad}</strong> / ${affected.practicalCapacity} pts
            &nbsp;·&nbsp; 
            <span style="color:${color};font-weight:600">${utilPct}% utilised</span>
          </div>
          ${affected.redirectedIn > 0
            ? `<div style="font-size:11px;color:#2563eb;margin-top:2px">▲ +${affected.redirectedIn} incoming patients</div>` : ''}
          ${isDisrupted
            ? `<div style="font-size:11px;color:#7c3aed;font-weight:600;margin-top:2px">⚠ Disrupted — patients being redirected</div>` : ''}
          ${evalEntry ? `<div style="font-size:11px;color:#6b7280;margin-top:2px">📍 ${evalEntry.distanceKm} km from disrupted PHC</div>` : ''}
        `;
      } else {
        html = `
          <div style="font-size:12px;font-weight:600;color:#111">${phc.name}</div>
          <div style="font-size:11px;color:#555">${phc.patientsPerDay} pts/day · ${phc.status}</div>
        `;
      }

      const info = new window.google.maps.InfoWindow({ content: html, disableAutoPan: true });
      addListeners(marker, map, info, isAdvanced);
      markersRef.current.push({ marker, url });
      if (isAffected) bounds.extend({ lat: phc.lat, lng: phc.lng });
    });

    // Fit map to affected cluster
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 60, right: 40, bottom: 40, left: 40 });
      window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() > 11) map.setZoom(11);
      });
    }

    return () => {
      markersRef.current.forEach(({ marker, url }) => {
        try { marker.map = null; } catch (_) { try { marker.setMap(null); } catch (__) {} }
        if (url) URL.revokeObjectURL(url);
      });
      markersRef.current = [];
      linesRef.current.forEach(l => l.setMap(null));
      linesRef.current = [];
    };
  }, [map, result]);

  return null;
}

// ─── Exported component ───────────────────────────────────────
export default function GoogleSimulationMap({ result }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your_google_maps_api_key_here' || apiKey.trim() === '') return null;

  return (
    <APIProvider apiKey={apiKey} libraries={['marker']}>
      <Map
        defaultCenter={INDIA_CENTER}
        defaultZoom={REGION.zoom}
        mapId="healthripple-simulation"
        gestureHandling="greedy"
        disableDefaultUI={false}
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
        mapTypeId="roadmap"
      >
        <SimulationLayer result={result} />
      </Map>
    </APIProvider>
  );
}
