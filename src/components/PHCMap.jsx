import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { REGION } from '../data/phcData';
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS = {
  stable: '#16a34a',
  'at-risk': '#d97706',
  critical: '#dc2626',
};

function MapBounds({ phcs }) {
  const map = useMap();
  useEffect(() => {
    if (!phcs || phcs.length === 0) return;
    const lats = phcs.map(p => p.lat);
    const lngs = phcs.map(p => p.lng);
    const bounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
    setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [40, 40] });
    }, 100);
  }, [map, phcs]);
  return null;
}

export default function PHCMap({ phcs, selectedPHC, onSelectPHC, highlightedIds = [] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <span className="text-gray-400 text-sm">Loading map…</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={REGION.center}
      zoom={REGION.zoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <MapBounds phcs={phcs} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {phcs.map(phc => {
        const isSelected = selectedPHC?.id === phc.id;
        const isHighlighted = highlightedIds.includes(phc.id);
        const color = STATUS_COLORS[phc.status] || '#6b7280';
        const radius = isSelected ? 11 : isHighlighted ? 9 : 7;
        const opacity = 1;

        return (
          <CircleMarker
            key={phc.id}
            center={[phc.lat, phc.lng]}
            radius={radius}
            pathOptions={{
              color: '#fff',
              weight: isSelected ? 2.5 : 1.5,
              fillColor: color,
              fillOpacity: opacity,
            }}
            eventHandlers={{
              click: () => onSelectPHC(phc),
            }}
          >
            <Tooltip
              permanent={false}
              direction="top"
              offset={[0, -8]}
            >
              <div className="text-xs font-medium text-gray-900 whitespace-nowrap">
                {phc.name}
                <br />
                <span className="font-normal text-gray-500">{phc.patientsPerDay} pts/day</span>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
