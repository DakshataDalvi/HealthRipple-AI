import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline, useMap } from 'react-leaflet';
import { REGION, phcs } from '../data/phcData';
import 'leaflet/dist/leaflet.css';

// Compute arrow midpoint and slight offset for visual clarity
function arrowPoints(from, to) {
  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;
  return [[from[0], from[1]], [midLat, midLng], [to[0], to[1]]];
}

const STATUS_COLORS = {
  stable: '#16a34a',
  'at-risk': '#d97706',
  critical: '#dc2626',
  disrupted: '#7c3aed',
};

function FitBounds({ affectedIds, allPHCs }) {
  const map = useMap();
  useEffect(() => {
    if (!affectedIds || affectedIds.length === 0) return;
    const coords = allPHCs
      .filter(p => affectedIds.includes(p.id))
      .map(p => [p.lat, p.lng]);
    if (coords.length > 0) {
      // Add padding so markers aren't at the edge
      setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(coords, { padding: [60, 60], maxZoom: 11 });
      }, 100);
    }
  }, [affectedIds, allPHCs, map]);
  return null;
}

export default function SimulationMap({ result }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <span className="text-gray-400 text-sm">Loading map…</span>
      </div>
    );
  }

  if (!result) {
    return (
      <MapContainer
        center={REGION.center}
        zoom={REGION.zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {phcs.map(p => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={7}
            pathOptions={{ color: '#fff', weight: 1.5, fillColor: STATUS_COLORS[p.status] || '#6b7280', fillOpacity: 1 }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <span className="text-xs font-medium">{p.name}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    );
  }

  // Build lookup from result: id → affected PHC state
  const affectedMap = {};
  for (const ap of result.affectedPHCs) {
    affectedMap[ap.id] = ap;
  }

  const affectedIds = result.affectedPHCs.map(p => p.id);

  // Build flow lines
  const flowLines = result.patientFlows
    .filter(f => f.patients > 0)
    .map(f => {
      const from = phcs.find(p => p.id === f.fromId);
      const to = phcs.find(p => p.id === f.toId);
      if (!from || !to) return null;
      const weight = Math.max(1.5, Math.min(5, f.patients / 30));
      return {
        points: [[from.lat, from.lng], [to.lat, to.lng]],
        weight,
        patients: f.patients,
        fromName: from.name,
        toName: to.name,
        hop: f.hop ?? 1,
      };
    })
    .filter(Boolean);

  return (
    <MapContainer
      center={REGION.center}
      zoom={REGION.zoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds affectedIds={affectedIds} allPHCs={phcs} />

      {/* Flow lines */}
      {flowLines.map((line, i) => (
        <Polyline
          key={`${line.fromName}-${line.toName}-${line.hop}`}
          positions={line.points}
          pathOptions={{
            color: line.hop === 1 ? '#2563eb' : '#7c3aed',
            weight: line.weight,
            opacity: 0.65,
            dashArray: line.hop === 2 ? '6 4' : null,
          }}
        >
          <Tooltip sticky>
            <div className="text-xs">
              <p className="font-semibold">{line.fromName} → {line.toName}</p>
              <p className="text-gray-600">{line.patients} patients redirected</p>
              {line.hop === 2 && <p className="text-purple-600 font-medium">Secondary ripple</p>}
            </div>
          </Tooltip>
        </Polyline>
      ))}

      {/* All PHC markers */}
      {phcs.map(phc => {
        const affected = affectedMap[phc.id];
        const status = affected ? affected.computedStatus : phc.status;
        const isDisrupted = affected?.isDisrupted;
        const isAffected = !!affected;

        let fillColor = STATUS_COLORS[status] || '#6b7280';
        if (isDisrupted) fillColor = STATUS_COLORS.disrupted;

        const radius = isDisrupted ? 13 : isAffected ? 10 : 6;
        const weight = isDisrupted ? 3 : isAffected ? 2 : 1.5;
        const strokeColor = isDisrupted ? '#fff' : '#fff';

        return (
          <CircleMarker
            key={phc.id}
            center={[phc.lat, phc.lng]}
            radius={radius}
            pathOptions={{
              color: strokeColor,
              weight,
              fillColor,
              fillOpacity: isAffected ? 1 : 0.6,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} permanent={isDisrupted}>
              <div className="text-xs">
                <p className="font-semibold text-gray-900">{phc.name}</p>
                {affected ? (
                  <>
                    <p className="text-gray-600">
                      Load: {affected.currentLoad} / {affected.practicalCapacity} pts
                    </p>
                    {affected.redirectedIn > 0 && (
                      <p className="text-blue-600">+{affected.redirectedIn} incoming</p>
                    )}
                    {isDisrupted && (
                      <p className="text-purple-600 font-medium">⚠ Disrupted</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">{phc.patientsPerDay} pts/day · {phc.status}</p>
                )}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
