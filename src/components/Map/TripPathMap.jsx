import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored marker icons
const makeIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:16px; height:16px; border-radius:50%;
      background:${color}; border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);">
    </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const greenIcon = makeIcon('#22C55E');
const redIcon = makeIcon('#EF4444');
const blueIcon = makeIcon('#3B82F6');

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

function FitBounds({ latLngs }) {
  const map = useMap();
  useEffect(() => {
    if (!latLngs || latLngs.length < 2 || !map) return;
    map.fitBounds(latLngs, { padding: [40, 40], maxZoom: 15 });
  }, [latLngs, map]);
  return null;
}

/**
 * TripPathMap component
 * @param {Array} coordinates - Array of {latitude, longitude} or {lat, lng}
 * @param {number} height - Height of map in px
 * @param {boolean} showFitBounds - Auto-fit map to path
 * @param {boolean} isLive - If true, last point gets a "live" marker instead of "end"
 * @param {string} driverName - Driver name shown in popups
 */
export default function TripPathMap({
  coordinates = [],
  height = 400,
  showFitBounds = true,
  isLive = false,
  driverName = 'Driver',
}) {
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

  const startPoint = latLngs.length > 0 ? latLngs[0] : null;
  const endPoint = latLngs.length > 1 ? latLngs[latLngs.length - 1] : null;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 relative" style={{ height }}>
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

        {/* Route Polyline */}
        {latLngs.length >= 2 && (
          <Polyline positions={latLngs} pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.85 }} />
        )}

        {/* Start Marker — green */}
        {startPoint && (
          <Marker position={startPoint} icon={greenIcon}>
            <Popup>
              <strong>🟢 Trip Start</strong>
              <br />{driverName}
            </Popup>
          </Marker>
        )}

        {/* End / Current Marker */}
        {endPoint && (
          <>
            <Marker position={endPoint} icon={isLive ? blueIcon : redIcon}>
              <Popup>
                {isLive ? (
                  <><strong>🔵 Current Location</strong><br />{driverName} · Live</>
                ) : (
                  <><strong>🔴 Trip End</strong><br />{driverName}</>
                )}
              </Popup>
            </Marker>
            {/* Pulsing ring for live tracking */}
            {isLive && (
              <CircleMarker
                center={endPoint}
                radius={18}
                pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.15, weight: 2 }}
              />
            )}
          </>
        )}

        {/* Single point (no path yet) */}
        {latLngs.length === 1 && (
          <CircleMarker
            center={latLngs[0]}
            radius={8}
            pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.6 }}
          />
        )}
      </MapContainer>

      {/* Legend overlay */}
      {latLngs.length >= 2 && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 rounded-lg px-3 py-2 text-xs shadow flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Start
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: isLive ? '#3B82F6' : '#EF4444' }} />
            {isLive ? 'Current' : 'End'}
          </span>
        </div>
      )}
    </div>
  );
}
