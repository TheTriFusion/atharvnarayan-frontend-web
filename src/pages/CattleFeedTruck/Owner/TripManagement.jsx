import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import axios from 'axios';

const TripManagement = () => {
    const { tripId } = useParams();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [expandedTrips, setExpandedTrips] = useState(new Set());
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        from: '',
        to: '',
        presentKm: '',
        kmAverage: '',
        distance: '',
        quantity: '',
        oilDiesel: '',
        driverId: '',
        vehicleId: '',
        helper: '',
        other: '',
        advancePayment: '',
    });

    useEffect(() => {
        fetchData();
        loadNotifications();

        // Auto-refresh every 10 seconds if enabled
        let interval;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchData();
                loadNotifications();
            }, 10000); // Refresh every 10 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    const loadNotifications = () => {
        const notifs = JSON.parse(localStorage.getItem('cattleFeedTruckOwnerNotifications') || '[]');
        setNotifications(notifs.slice(0, 20)); // Show last 20 notifications
    };

    const clearNotifications = () => {
        localStorage.removeItem('cattleFeedTruckOwnerNotifications');
        setNotifications([]);
    };

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [tripsRes, driversRes, vehiclesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/cattle-feed-truck/trips', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/cattle-feed-truck/drivers', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/cattle-feed-truck/vehicles', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const loadedTrips = tripsRes.data || [];
            setTrips(loadedTrips);
            setDrivers(driversRes.data || []);
            setVehicles(vehiclesRes.data || []);

            // Auto-open modal if tripId is present
            if (tripId && loadedTrips.length > 0) {
                const tripToView = loadedTrips.find(t => t._id === tripId);
                if (tripToView) {
                    setSelectedTrip(tripToView);
                    setShowDetailsModal(true);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const tripData = {
                ...formData,
                status: 'pending',
                tripDetails: {
                    presentKm: parseFloat(formData.presentKm) || 0,
                    kmAverage: parseFloat(formData.kmAverage) || 0,
                    distance: parseFloat(formData.distance) || 0,
                    quantity: parseFloat(formData.quantity) || 0,
                    oilDiesel: parseFloat(formData.oilDiesel) || 0,
                    helper: formData.helper,
                    other: formData.other,
                    advancePayment: parseFloat(formData.advancePayment) || 0,
                },
            };

            await axios.post('http://localhost:5000/api/cattle-feed-truck/trips', tripData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setShowCreateModal(false);
            resetForm();
            fetchData();
            alert('Trip created successfully!');
        } catch (error) {
            console.error('Error creating trip:', error);
            alert('Error creating trip: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            from: '',
            to: '',
            presentKm: '',
            kmAverage: '',
            distance: '',
            quantity: '',
            oilDiesel: '',
            driverId: '',
            vehicleId: '',
            helper: '',
            other: '',
            advancePayment: '',
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            loading: 'bg-blue-100 text-blue-800',
            in_transit: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const calculateDeliveredBags = (trip) => {
        if (trip.deliveryEntries && trip.deliveryEntries.length > 0) {
            return trip.deliveryEntries.reduce((sum, entry) => {
                const actualDelivery = entry.actualDelivery;
                // Only count if actually delivered (has deliveredAt or actual items)
                if (actualDelivery && actualDelivery.deliveredAt && actualDelivery.feedItems) {
                    return sum + actualDelivery.feedItems.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
                }
                return sum;
            }, 0);
        }
        return 0;
    };

    const getTotalBags = (trip) => {
        return trip.summary?.totalQuantityLoaded || trip.tripDetails?.quantity || 0;
    };

    const handleViewDetails = (trip) => {
        setSelectedTrip(trip);
        setShowDetailsModal(true);
    };

    const toggleTripExpansion = (tripId) => {
        setExpandedTrips(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tripId)) {
                newSet.delete(tripId);
            } else {
                newSet.add(tripId);
            }
            return newSet;
        });
    };

    const filteredTrips = trips.filter(trip => {
        if (filter === 'all') return true;
        return trip.status === filter;
    });

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Trip Management</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                        <p className="text-sm text-gray-500 font-medium">
                            {autoRefresh ? 'Live updates enabled' : 'Live updates paused'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="!bg-white !border !border-gray-200 !text-gray-600 hover:!bg-gray-50 !shadow-sm"
                    >
                        🔔 <span className="hidden sm:inline ml-1">Notifications</span>
                        {notifications.length > 0 && (
                            <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                                {notifications.length}
                            </span>
                        )}
                    </Button>
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm cursor-pointer"
                        >
                            <option value="all">All Trips</option>
                            <option value="pending">Pending</option>
                            <option value="loading">Loading</option>
                            <option value="in_transit">In Transit</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400 text-xs">▼</div>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`!shadow-sm ${autoRefresh ? '!bg-blue-50 !text-blue-600 border border-blue-100' : '!bg-white border border-gray-200 text-gray-600'}`}
                    >
                        {autoRefresh ? "⏸️ Pause" : "▶️ Resume"}
                    </Button>
                    <Button onClick={fetchData} className="!bg-white !border !border-gray-200 !text-gray-600 hover:!bg-gray-50 !shadow-sm !p-2.5">
                        🔄
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)} className="!bg-blue-600 hover:!bg-blue-700 !shadow-md !px-6">
                        + New Trip
                    </Button>
                </div>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                    { label: 'Total Trips', value: trips.length, color: 'text-gray-900', bg: 'bg-white' },
                    { label: 'Pending', value: trips.filter(t => t.status === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: 'Active', value: trips.filter(t => ['in_transit', 'loading'].includes(t.status)).length, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Completed', value: trips.filter(t => t.status === 'completed').length, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Trips Today', value: trips.filter(t => new Date(t.date || t.createdAt).toDateString() === new Date().toDateString()).length, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Deliveries', value: trips.reduce((sum, trip) => sum + (trip.deliveryEntries?.length || 0), 0), color: 'text-indigo-600', bg: 'bg-indigo-50' }
                ].map((stat, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border border-gray-100 shadow-sm ${stat.bg}`}>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1 opacity-80">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Notifications Panel */}
            {showNotifications && (
                <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ease-in-out">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-800">Notifications</h2>
                        <button onClick={clearNotifications} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
                            Clear All
                        </button>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 italic">No new notifications</div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto p-4 space-y-3">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 rounded-lg flex items-start gap-4 ${notif.type === 'trip_completed' ? 'bg-green-50' : 'bg-blue-50'}`}
                                >
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'trip_completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 text-sm">{notif.message}</p>
                                        <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                            <span>👤 {notif.driverName}</span>
                                            {notif.tripNumber && <span>🎫 #{notif.tripNumber}</span>}
                                            <span className="ml-auto opacity-70">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <Card className="!border-none !shadow-sm !rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left">Date & Time</th>
                                    <th className="px-6 py-4 text-left">Driver & Vehicle</th>
                                    <th className="px-6 py-4 text-left">Route Ino</th>
                                    <th className="px-6 py-4 text-left">Progress</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {filteredTrips.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl mb-3 opacity-20">🚚</span>
                                                <p>No trips found{filter !== 'all' ? ` for "${filter}" status` : ''}.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTrips.map((trip) => {
                                        const deliveredBags = calculateDeliveredBags(trip);
                                        const totalBags = getTotalBags(trip);
                                        const deliveryCount = trip.deliveryEntries?.length || 0;
                                        const isExpanded = expandedTrips.has(trip._id);
                                        const progressPercent = totalBags > 0 ? (deliveredBags / totalBags) * 100 : 0;

                                        return (
                                            <>
                                                <tr
                                                    key={trip._id}
                                                    onClick={() => toggleTripExpansion(trip._id)}
                                                    className={`group transition-all hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-800 text-sm">
                                                            {new Date(trip.date || trip.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {new Date(trip.date || trip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">{trip.driverId?.name || 'Unassigned'}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                                            {trip.vehicleId?.registrationNumber || 'No Vehicle'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-800 font-medium">
                                                            {trip.from && trip.to ? (
                                                                <span className="flex items-center gap-1.5">
                                                                    {trip.from} <span className="text-gray-400">→</span> {trip.to}
                                                                </span>
                                                            ) : (
                                                                trip.routeId?.name || 'N/A'
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {deliveryCount} stop{deliveryCount !== 1 ? 's' : ''}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 w-48">
                                                        <div className="flex justify-between text-xs mb-1.5">
                                                            <span className="font-semibold text-gray-700">{deliveredBags} bags</span>
                                                            <span className="text-gray-400">of {totalBags}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${progressPercent >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                                                            {trip.status?.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 text-sm">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleViewDetails(trip); }}
                                                                className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                                                title="View Full Details"
                                                            >
                                                                👁️
                                                            </button>
                                                            <button
                                                                className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                                onClick={(e) => { e.stopPropagation(); toggleTripExpansion(trip._id); }}
                                                            >
                                                                ▼
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr key={`${trip._id}-details`} className="bg-gray-50/50">
                                                        <td colSpan="6" className="p-0">
                                                            <div className="px-6 py-6 border-t border-gray-100 shadow-inner bg-gray-50">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                    {/* Trip Quick Info */}
                                                                    <div className="space-y-4">
                                                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Details</h4>
                                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                                                                <span className="block text-gray-500 text-xs mb-1">Trip ID</span>
                                                                                <span className="font-mono text-gray-800">{trip._id.substring(trip._id.length - 8)}</span>
                                                                            </div>
                                                                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                                                                <span className="block text-gray-500 text-xs mb-1">Distance Est.</span>
                                                                                <span className="font-medium text-gray-800">{trip.summary?.totalKm || trip.tripDetails?.distance || 0} km</span>
                                                                            </div>
                                                                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                                                                <span className="block text-gray-500 text-xs mb-1">Start Time</span>
                                                                                <span className="font-medium text-gray-800">{trip.startTime ? new Date(trip.startTime).toLocaleTimeString() : 'Not Started'}</span>
                                                                            </div>
                                                                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                                                                <span className="block text-gray-500 text-xs mb-1">Helper</span>
                                                                                <span className="font-medium text-gray-800">{trip.helper?.name || 'None'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Simple Delivery List Preview */}
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Delivery Preview</h4>
                                                                        {trip.deliveryEntries && trip.deliveryEntries.length > 0 ? (
                                                                            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                                                                                {trip.deliveryEntries.slice(0, 3).map((entry, idx) => (
                                                                                    <div key={idx} className="px-4 py-3 border-b border-gray-50 last:border-0 flex justify-between items-center text-sm">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className={`w-2 h-2 rounded-full ${entry.actualDelivery?.deliveredAt ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                                                            <span className="text-gray-700 truncate max-w-[150px]">{entry.location || `Stop #${idx + 1}`}</span>
                                                                                        </div>
                                                                                        <span className="text-gray-500 text-xs">
                                                                                            {entry.actualDelivery?.deliveredAt ? 'Delivered' : 'Pending'}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                                {trip.deliveryEntries.length > 3 && (
                                                                                    <div className="px-4 py-2 bg-gray-50 text-center text-xs text-blue-600 font-medium cursor-pointer hover:bg-gray-100" onClick={() => handleViewDetails(trip)}>
                                                                                        + {trip.deliveryEntries.length - 3} more stops
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-gray-400 text-sm italic bg-white p-4 rounded-lg border border-gray-100 text-center">No delivery stops recorded</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}


            {/* Create Trip Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    resetForm();
                }}
                title="Start New Trip"
            >
                <form onSubmit={handleCreateTrip} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />

                        <Input
                            label="From"
                            value={formData.from}
                            onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                            required
                        />

                        <Input
                            label="To"
                            value={formData.to}
                            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Driver *</label>
                            <select
                                value={formData.driverId}
                                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            >
                                <option value="">Select Driver</option>
                                {drivers.map(driver => (
                                    <option key={driver._id} value={driver._id}>{driver.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
                            <select
                                value={formData.vehicleId}
                                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            >
                                <option value="">Select Vehicle</option>
                                {vehicles.map(vehicle => (
                                    <option key={vehicle._id} value={vehicle._id}>{vehicle.registrationNumber}</option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Present KM"
                            type="number"
                            step="0.1"
                            value={formData.presentKm}
                            onChange={(e) => setFormData({ ...formData, presentKm: e.target.value })}
                        />

                        <Input
                            label="KM Average"
                            type="number"
                            step="0.1"
                            value={formData.kmAverage}
                            onChange={(e) => setFormData({ ...formData, kmAverage: e.target.value })}
                        />

                        <Input
                            label="Distance (km)"
                            type="number"
                            step="0.1"
                            value={formData.distance}
                            onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                            required
                        />

                        <Input
                            label="Quantity"
                            type="number"
                            step="0.1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />

                        <Input
                            label="Oil/Diesel (Liters)"
                            type="number"
                            step="0.1"
                            value={formData.oilDiesel}
                            onChange={(e) => setFormData({ ...formData, oilDiesel: e.target.value })}
                        />

                        <Input
                            label="Helper Name"
                            value={formData.helper}
                            onChange={(e) => setFormData({ ...formData, helper: e.target.value })}
                        />

                        <Input
                            label="Other"
                            value={formData.other}
                            onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                        />

                        <Input
                            label="Advance Payment"
                            type="number"
                            step="0.01"
                            value={formData.advancePayment}
                            onChange={(e) => setFormData({ ...formData, advancePayment: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowCreateModal(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Create Trip</Button>
                    </div>
                </form>
            </Modal>

            {/* Trip Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedTrip(null);
                }}
                title={`Trip Details - ${selectedTrip?.driverId?.name || 'N/A'}`}
            >
                {selectedTrip && (
                    <div className="space-y-6">
                        {/* Trip Overview */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-3">Trip Overview</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Date:</span>
                                    <span className="ml-2 font-medium">
                                        {new Date(selectedTrip.date || selectedTrip.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTrip.status)}`}>
                                        {selectedTrip.status?.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Driver:</span>
                                    <span className="ml-2 font-medium">{selectedTrip.driverId?.name || 'N/A'}</span>
                                    {selectedTrip.driverId?.phoneNumber && (
                                        <span className="ml-2 text-gray-500">({selectedTrip.driverId.phoneNumber})</span>
                                    )}
                                </div>
                                <div>
                                    <span className="text-gray-600">Vehicle:</span>
                                    <span className="ml-2 font-medium">
                                        {selectedTrip.vehicleId?.registrationNumber || 'N/A'}
                                        {selectedTrip.vehicleId?.vehicleType && (
                                            <span className="text-gray-500"> ({selectedTrip.vehicleId.vehicleType})</span>
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Route:</span>
                                    <span className="ml-2 font-medium">
                                        {selectedTrip.from && selectedTrip.to
                                            ? `${selectedTrip.from} → ${selectedTrip.to}`
                                            : selectedTrip.routeId?.name || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Distance:</span>
                                    <span className="ml-2 font-medium">
                                        {selectedTrip.summary?.totalKm || selectedTrip.tripDetails?.distance || selectedTrip.distance || 'N/A'} km
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bags Summary */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-3">Bags Summary</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-gray-600">Total Loaded:</span>
                                    <span className="ml-2 text-xl font-bold text-gray-800">
                                        {getTotalBags(selectedTrip)} bags
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Delivered:</span>
                                    <span className="ml-2 text-xl font-bold text-green-600">
                                        {calculateDeliveredBags(selectedTrip)} bags
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Remaining:</span>
                                    <span className="ml-2 text-xl font-bold text-orange-600">
                                        {getTotalBags(selectedTrip) - calculateDeliveredBags(selectedTrip)} bags
                                    </span>
                                </div>
                            </div>
                            {getTotalBags(selectedTrip) > 0 && (
                                <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                                    <div
                                        className={`h-3 rounded-full ${calculateDeliveredBags(selectedTrip) >= getTotalBags(selectedTrip) ? 'bg-green-600' : 'bg-blue-600'}`}
                                        style={{ width: `${Math.min((calculateDeliveredBags(selectedTrip) / getTotalBags(selectedTrip)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>

                        {/* Delivery Locations */}
                        {(selectedTrip.deliveryEntries && selectedTrip.deliveryEntries.length > 0) && (
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3">
                                    Delivery Locations ({selectedTrip.deliveryEntries.length})
                                </h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {selectedTrip.deliveryEntries.map((entry, index) => {
                                        const plannedItems = entry.plannedDelivery?.feedItems || [];
                                        const actualItems = entry.actualDelivery?.feedItems || [];
                                        const plannedBags = plannedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
                                        const actualBags = actualItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
                                        const isDelivered = !!entry.actualDelivery?.deliveredAt;
                                        const location = entry.notes || entry.location || `Location ${index + 1}`;

                                        return (
                                            <div
                                                key={index}
                                                className={`border rounded-lg p-4 ${isDelivered ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-800">
                                                                {entry.deliveryPointId?.name
                                                                    ? `${entry.deliveryPointId.name} ${entry.location ? `(${entry.location})` : ''}`
                                                                    : (entry.notes || entry.location || `Location ${index + 1}`)}
                                                            </span>
                                                            {isDelivered && (
                                                                <span className="text-green-600 text-sm">✓ Delivered</span>
                                                            )}
                                                        </div>
                                                        {entry.deliveryPointId?.location && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                📍 {entry.deliveryPointId.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-blue-600">
                                                            {actualBags > 0 ? actualBags : plannedBags} bags
                                                        </div>
                                                        {actualBags !== plannedBags && actualBags > 0 && (
                                                            <div className="text-xs text-gray-500">
                                                                Planned: {plannedBags}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Feed Items Details */}
                                                {(plannedItems.length > 0 || actualItems.length > 0) && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        {(actualItems.length > 0 ? actualItems : plannedItems).map((item, itemIndex) => (
                                                            <div key={itemIndex} className="text-sm text-gray-600 flex justify-between">
                                                                <span>{item.feedType || 'Cattle Feed'}</span>
                                                                <span className="font-medium">{item.quantity} {item.unit || 'bags'}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Delivery Info */}
                                                {isDelivered && entry.actualDelivery && (
                                                    <div className="mt-2 pt-2 border-t border-green-200">
                                                        <div className="text-sm text-gray-600">
                                                            {entry.actualDelivery.receivedBy && (
                                                                <div>Received by: <span className="font-medium">{entry.actualDelivery.receivedBy}</span></div>
                                                            )}
                                                            {entry.actualDelivery.deliveredAt && (
                                                                <div className="mt-1">
                                                                    Delivered at: <span className="font-medium">
                                                                        {new Date(entry.actualDelivery.deliveredAt).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {entry.notes && (
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        {entry.notes}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Trip Expenses */}
                        {selectedTrip.summary?.expenses && (
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-3">Expenses</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Fuel:</span>
                                        <span className="ml-2 font-medium">₹{selectedTrip.summary.expenses.fuel || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Other:</span>
                                        <span className="ml-2 font-medium">₹{selectedTrip.summary.expenses.other || 0}</span>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-yellow-200">
                                        <span className="text-gray-600">Total Expenses:</span>
                                        <span className="ml-2 font-bold text-lg">₹{selectedTrip.summary.expenses.totalExpenses || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div >
    );
};

export default TripManagement;
