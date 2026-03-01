import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon in Leaflet with react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

function FitBounds({ latLngs }) {
  const map = useMap();
  useEffect(() => {
    if (!latLngs || latLngs.length < 2 || !map) return;
    map.fitBounds(latLngs, { padding: [40, 40], maxZoom: 14 });
  }, [latLngs, map]);
  return null;
}

export default function TripPathMap({ coordinates = [], height = 400, showFitBounds = true }) {
  const latLngs = useMemo(() => {
    return (coordinates || [])
      .map((c) => [c.latitude ?? c.lat, c.longitude ?? c.lng])
      .filter(([lat, lng]) => typeof lat === 'number' && typeof lng === 'number');
  }, [coordinates]);

  const center = useMemo(() => {
    if (latLngs.length === 0) return DEFAULT_CENTER;
    if (latLngs.length === 1) return latLngs[0];
    const sumLat = latLngs.reduce((s, [lat]) => s + lat, 0);
    const sumLng = latLngs.reduce((s, [, lng]) => s + lng, 0);
    return [sumLat / latLngs.length, sumLng / latLngs.length];
  }, [latLngs]);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer
        center={center}
        zoom={latLngs.length >= 2 ? 12 : DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showFitBounds && latLngs.length >= 2 && <FitBounds latLngs={latLngs} />}
        {latLngs.length >= 2 && (
          <Polyline positions={latLngs} pathOptions={{ color: '#3B82F6', weight: 4 }} />
        )}
      </MapContainer>
    </div>
  );
}
