import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon in webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons
const startIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='#10B981' stroke='white' stroke-width='2'/><text x='16' y='21' text-anchor='middle' fill='white' font-size='14' font-weight='bold'>S</text></svg>`),
    iconSize: [32, 32], iconAnchor: [16, 16],
});

const endIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='#EF4444' stroke='white' stroke-width='2'/><text x='16' y='21' text-anchor='middle' fill='white' font-size='14' font-weight='bold'>E</text></svg>`),
    iconSize: [32, 32], iconAnchor: [16, 16],
});

const driverIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'><circle cx='18' cy='18' r='16' fill='#3B82F6' stroke='white' stroke-width='2.5'/><text x='18' y='23' text-anchor='middle' fill='white' font-size='16'>🚛</text></svg>`),
    iconSize: [36, 36], iconAnchor: [18, 18],
});

// Helper to recenter map on current replay position
function MapFlyTo({ coord }) {
    const map = useMap();
    useEffect(() => {
        if (coord) {
            map.setView([coord.latitude, coord.longitude], map.getZoom(), { animate: true });
        }
    }, [coord, map]);
    return null;
}

const SPEED_OPTIONS = [1, 2, 4, 8];

/**
 * TripReplayPlayer
 * Shows a route map with playback controls. The truck marker animates along
 * the locationHistory path at the selected speed.
 *
 * Props:
 *   locationHistory – array of { latitude, longitude, timestamp }
 *   bmcEntries      – (optional) array with bmcId+collectionData to mark stops
 *   tripInfo        – { startTime, endTime, driverName }
 */
export default function TripReplayPlayer({ locationHistory = [], bmcEntries = [], tripInfo = {} }) {
    const points = locationHistory
        .filter(p => p.latitude && p.longitude)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const [frameIndex, setFrameIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(2);
    const intervalRef = useRef(null);

    const totalFrames = points.length;
    const current = points[frameIndex] || null;

    // Advance one frame
    const tick = useCallback(() => {
        setFrameIndex(prev => {
            if (prev >= totalFrames - 1) {
                setPlaying(false);
                return prev;
            }
            return prev + 1;
        });
    }, [totalFrames]);

    // Start / stop interval
    useEffect(() => {
        if (playing) {
            // Delay between frames = time gap / speed, clamped to 30–1500ms
            const computeDelay = () => {
                if (frameIndex >= totalFrames - 1) return 500;
                const a = new Date(points[frameIndex].timestamp);
                const b = new Date(points[frameIndex + 1].timestamp);
                const realGapMs = b - a;
                const compressed = Math.max(30, Math.min(1500, realGapMs / (speed * 10)));
                return compressed;
            };
            intervalRef.current = setInterval(tick, computeDelay());
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [playing, frameIndex, speed, tick, totalFrames]);

    const handleSlider = (e) => {
        setFrameIndex(Number(e.target.value));
        setPlaying(false);
    };

    const reset = () => {
        setFrameIndex(0);
        setPlaying(false);
    };

    const coordsForMap = points.map(p => [p.latitude, p.longitude]);
    const traveledCoords = points.slice(0, frameIndex + 1).map(p => [p.latitude, p.longitude]);
    const notTraveledCoords = points.slice(frameIndex).map(p => [p.latitude, p.longitude]);

    const center = current
        ? [current.latitude, current.longitude]
        : points.length > 0
            ? [points[0].latitude, points[0].longitude]
            : [20.5937, 78.9629];

    const formatTime = (iso) => {
        if (!iso) return '--';
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const duration = () => {
        if (!tripInfo.startTime || !tripInfo.endTime) return '--';
        const diff = (new Date(tripInfo.endTime) - new Date(tripInfo.startTime)) / 1000 / 60;
        return `${Math.floor(diff)}m ${Math.round(diff % 1 * 60)}s`;
    };

    if (totalFrames < 2) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                <span className="text-4xl mb-2">📍</span>
                <p className="text-sm font-medium">No GPS data available for replay</p>
                <p className="text-xs mt-1 text-gray-300">Location history is recorded during active trips</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg">
            {/* Map */}
            <div style={{ height: 340, position: 'relative' }}>
                <MapContainer
                    center={center}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    {/* Gray: not yet traveled */}
                    {notTraveledCoords.length >= 2 && (
                        <Polyline positions={notTraveledCoords} pathOptions={{ color: '#D1D5DB', weight: 3, dashArray: '6 4' }} />
                    )}
                    {/* Blue: already traveled */}
                    {traveledCoords.length >= 2 && (
                        <Polyline positions={traveledCoords} pathOptions={{ color: '#3B82F6', weight: 5 }} />
                    )}

                    {/* Start marker */}
                    <Marker position={[points[0].latitude, points[0].longitude]} icon={startIcon}>
                        <Popup><strong>Start</strong><br />{formatTime(points[0].timestamp)}</Popup>
                    </Marker>
                    {/* End marker */}
                    <Marker position={[points[totalFrames - 1].latitude, points[totalFrames - 1].longitude]} icon={endIcon}>
                        <Popup><strong>End</strong><br />{formatTime(points[totalFrames - 1].timestamp)}</Popup>
                    </Marker>

                    {/* Live driver truck marker */}
                    {current && (
                        <Marker position={[current.latitude, current.longitude]} icon={driverIcon}>
                            <Popup>
                                <strong>🚛 {tripInfo.driverName || 'Driver'}</strong>
                                <br />
                                {formatTime(current.timestamp)}
                            </Popup>
                        </Marker>
                    )}

                    <MapFlyTo coord={current} />
                </MapContainer>

                {/* Overlay: current time badge */}
                {current && (
                    <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-lg px-3 py-2 text-xs font-mono">
                        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wide mb-0.5">Current Time</div>
                        <div className="text-blue-700 font-bold text-sm">{formatTime(current.timestamp)}</div>
                    </div>
                )}

                {/* Progress */}
                <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md rounded-lg px-3 py-2 text-xs font-mono">
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wide mb-0.5">Progress</div>
                    <div className="text-purple-700 font-bold text-sm">{frameIndex + 1}/{totalFrames}</div>
                </div>
            </div>

            {/* Controls panel */}
            <div className="bg-gray-900 px-4 py-3">
                {/* Slider */}
                <div className="mb-3">
                    <input
                        type="range"
                        min={0}
                        max={totalFrames - 1}
                        value={frameIndex}
                        onChange={handleSlider}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-500"
                        style={{ background: `linear-gradient(to right, #3B82F6 ${(frameIndex / (totalFrames - 1)) * 100}%, #4B5563 0%)` }}
                    />
                    <div className="flex justify-between text-gray-400 text-xs mt-1">
                        <span>{formatTime(points[0].timestamp)}</span>
                        <span>{formatTime(points[totalFrames - 1].timestamp)}</span>
                    </div>
                </div>

                {/* Buttons row */}
                <div className="flex items-center gap-3">
                    {/* Reset */}
                    <button onClick={reset} className="text-gray-400 hover:text-white transition-colors text-xl" title="Restart">⏮</button>

                    {/* Play/Pause */}
                    <button
                        onClick={() => frameIndex >= totalFrames - 1 ? (reset(), setTimeout(() => setPlaying(true), 50)) : setPlaying(!playing)}
                        className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xl flex items-center justify-center transition-colors shadow-lg"
                    >
                        {playing ? '⏸' : '▶'}
                    </button>

                    {/* Speed selector */}
                    <div className="flex gap-1 ml-2">
                        {SPEED_OPTIONS.map(s => (
                            <button
                                key={s}
                                onClick={() => setSpeed(s)}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${speed === s ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                {s}×
                            </button>
                        ))}
                    </div>

                    {/* Trip stats */}
                    <div className="ml-auto flex gap-4 text-xs text-gray-400">
                        {tripInfo.driverName && (
                            <span>🚛 {tripInfo.driverName}</span>
                        )}
                        <span>📍 {totalFrames} pts</span>
                        <span>⏱ {duration()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
