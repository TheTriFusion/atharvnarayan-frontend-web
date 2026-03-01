import { useState, useEffect, useRef } from 'react';
import { cattleFeedTruckAPI, milkTruckAPI, usersAPI, SOCKET_URL } from '../../utils/api';
import { io } from 'socket.io-client';
import TripPathMap from '../../components/Map/TripPathMap';
import Card from '../../components/common/Card';

const TRIP_TYPE_CF = 'cattle_feed_truck';
const TRIP_TYPE_MILK = 'milk_truck';

export default function TripsWithMap() {
  const [tripType, setTripType] = useState(TRIP_TYPE_CF);
  const [owners, setOwners] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tab, setTab] = useState('live'); // 'live' | 'history'
  const [livePath, setLivePath] = useState([]);
  const [historyPath, setHistoryPath] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingTripDetail, setLoadingTripDetail] = useState(false);
  const socketRef = useRef(null);

  // Load owners by trip type
  useEffect(() => {
    let mounted = true;
    setLoadingOwners(true);
    const role = tripType === TRIP_TYPE_CF ? 'cattleFeedTruckOwner' : 'milkTruckOwner';
    const systemType = tripType === TRIP_TYPE_CF ? 'cattleFeedTruck' : 'milkTruck';
    usersAPI.getUsers({ role, systemType })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data || res?.users || []);
        if (mounted) {
          setOwners(Array.isArray(list) ? list : []);
          setSelectedOwnerId('');
          setTrips([]);
          setSelectedTrip(null);
          setLivePath([]);
          setHistoryPath([]);
        }
      })
      .catch(() => mounted && setOwners([]))
      .finally(() => mounted && setLoadingOwners(false));
    return () => { mounted = false; };
  }, [tripType]);

  // Load trips when owner selected
  useEffect(() => {
    if (!selectedOwnerId) {
      setTrips([]);
      setSelectedTrip(null);
      return;
    }
    let mounted = true;
    setLoadingTrips(true);
    const api = tripType === TRIP_TYPE_CF ? cattleFeedTruckAPI : milkTruckAPI;
    api.getTrips(selectedOwnerId)
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        if (mounted) {
          setTrips(Array.isArray(list) ? list : []);
          setSelectedTrip(null);
          setLivePath([]);
          setHistoryPath([]);
        }
      })
      .catch(() => mounted && setTrips([]))
      .finally(() => mounted && setLoadingTrips(false));
    return () => { mounted = false; };
  }, [selectedOwnerId, tripType]);

  // Socket for live path
  useEffect(() => {
    if (tab !== 'live' || !selectedTrip?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setLivePath([]);
      return;
    }
    const tripId = selectedTrip._id;
    setLivePath([]);
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('join_trip_room', { tripId });
    });
    socket.on('driver_location', (data) => {
      if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
        setLivePath((prev) => [...prev, { latitude: data.lat, longitude: data.lng }]);
      }
    });
    socket.on('connect_error', (err) => console.warn('Socket error:', err.message));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tab, selectedTrip?._id ?? null]);

  // Load trip detail for history
  useEffect(() => {
    if (tab !== 'history' || !selectedTrip?._id) {
      setHistoryPath([]);
      return;
    }
    let mounted = true;
    setLoadingTripDetail(true);
    const api = tripType === TRIP_TYPE_CF ? cattleFeedTruckAPI : milkTruckAPI;
    api.getTrip(selectedTrip._id)
      .then((data) => {
        const trip = data?.data ?? data;
        const hist = trip?.locationHistory || [];
        const path = hist.map((p) => ({
          latitude: p.latitude ?? p.lat,
          longitude: p.longitude ?? p.lng,
        })).filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number');
        if (mounted) setHistoryPath(path);
      })
      .catch(() => mounted && setHistoryPath([]))
      .finally(() => mounted && setLoadingTripDetail(false));
    return () => { mounted = false; };
  }, [tab, selectedTrip?._id ?? null, tripType]);

  const activeTrips = trips.filter((t) =>
    t.status === 'in_transit' || t.status === 'loading' || t.status === 'in_progress'
  );
  const coordinates = tab === 'live' ? livePath : historyPath;
  const isLiveActive = tab === 'live' && selectedTrip && (selectedTrip.status === 'in_transit' || selectedTrip.status === 'loading' || selectedTrip.status === 'in_progress');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Trips with Map</h1>
      <p className="text-gray-600 mb-6">View live driver path and trip history by owner</p>

      <Card className="p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trip type</label>
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 min-w-[200px]"
            >
              <option value={TRIP_TYPE_CF}>Cattle Feed Truck</option>
              <option value={TRIP_TYPE_MILK}>Milk Truck</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <select
              value={selectedOwnerId}
              onChange={(e) => setSelectedOwnerId(e.target.value)}
              disabled={loadingOwners}
              className="border border-gray-300 rounded-lg px-4 py-2 min-w-[220px]"
            >
              <option value="">Select owner</option>
              {owners.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name || o.phoneNumber || o._id}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setTab('live')}
              className={`px-4 py-2 font-medium ${tab === 'live' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setTab('history')}
              className={`px-4 py-2 font-medium ${tab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              History
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="font-semibold text-gray-800 mb-3">
              {tab === 'live' ? 'Active trips (select to watch live)' : 'Trips (select for history)'}
            </h2>
            {loadingTrips && <p className="text-gray-500 text-sm">Loading...</p>}
            {!selectedOwnerId && <p className="text-gray-500 text-sm">Select an owner first</p>}
            {selectedOwnerId && !loadingTrips && trips.length === 0 && (
              <p className="text-gray-500 text-sm">No trips found</p>
            )}
            {tab === 'live' && selectedOwnerId && activeTrips.length === 0 && trips.length > 0 && (
              <p className="text-gray-500 text-sm">No active trips</p>
            )}
            <ul className="space-y-2 max-h-[320px] overflow-y-auto">
              {tab === 'live'
                ? activeTrips.map((t) => (
                    <li key={t._id}>
                      <button
                        type="button"
                        onClick={() => setSelectedTrip(t)}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                          selectedTrip?._id === t._id
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium block">
                          {t.driverId?.name || 'Driver'} – {t.from || 'From'} → {t.to || 'To'}
                        </span>
                        <span className="text-xs text-gray-500">{t.status}</span>
                      </button>
                    </li>
                  ))
                : trips.map((t) => (
                    <li key={t._id}>
                      <button
                        type="button"
                        onClick={() => setSelectedTrip(t)}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                          selectedTrip?._id === t._id
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium block">
                          {t.driverId?.name || 'Driver'} – {t.from || t.routeId?.name || 'Trip'}
                        </span>
                        <span className="text-xs text-gray-500">{t.status}</span>
                      </button>
                    </li>
                  ))}
            </ul>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="p-4">
            <h2 className="font-semibold text-gray-800 mb-3">
              {tab === 'live' ? 'Live path' : 'Trip path (history)'}
            </h2>
            {!selectedTrip && (
              <p className="text-gray-500 py-8 text-center">Select a trip from the list</p>
            )}
            {selectedTrip && tab === 'history' && loadingTripDetail && (
              <p className="text-gray-500 py-8 text-center">Loading path...</p>
            )}
            {selectedTrip && tab === 'history' && !loadingTripDetail && historyPath.length === 0 && (
              <p className="text-gray-500 py-8 text-center">No path recorded for this trip</p>
            )}
            {selectedTrip && (tab !== 'history' || historyPath.length > 0) && (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedTrip.driverId?.name || 'Driver'} · {selectedTrip.status}
                  {tab === 'live' && isLiveActive && (
                    <span className="ml-2 text-green-600">● Live</span>
                  )}
                </p>
                <TripPathMap
                  coordinates={coordinates}
                  height={400}
                  showFitBounds={true}
                />
              </>
            )}
            {selectedTrip && tab === 'live' && !isLiveActive && (
              <p className="text-amber-600 text-sm mt-2">Trip is not active; path may not update</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
