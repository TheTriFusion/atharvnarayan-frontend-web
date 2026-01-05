import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import axios from 'axios';

const ActiveTrip = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Delivery Modal State
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [selectedDeliveryIndex, setSelectedDeliveryIndex] = useState(null);
    const [receiverInput, setReceiverInput] = useState('');

    useEffect(() => {
        fetchActiveTrip();

        // Auto-refresh every 5 seconds
        const interval = setInterval(() => {
            fetchActiveTrip();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchActiveTrip = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('http://15.206.212.140:5000/api/cattle-feed-truck/trips', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const trips = Array.isArray(response.data) ? response.data : [];

            // Filter for current driver's active trips
            const userId = user?._id || user?.id;
            const activeTrips = trips.filter(trip => {
                const driverId = trip.driverId?._id || trip.driverId;
                return driverId && userId && driverId.toString() === userId.toString() &&
                    (trip.status === 'loading' || trip.status === 'in_transit');
            });

            if (activeTrips.length > 0) {
                // Get the most recent active trip
                const activeTrip = activeTrips.sort((a, b) =>
                    new Date(b.createdAt || b.startTime) - new Date(a.createdAt || a.startTime)
                )[0];
                setTrip(activeTrip);
            } else {
                // No active trip, redirect to dashboard
                navigate('/cattle-feed-truck/driver/dashboard');
            }
        } catch (error) {
            console.error('Error fetching active trip:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const openDeliveryModal = (index) => {
        setSelectedDeliveryIndex(index);
        setReceiverInput('');
        setShowDeliveryModal(true);
    };

    const confirmDelivery = async () => {
        if (!trip || selectedDeliveryIndex === null) return;

        const index = selectedDeliveryIndex;
        const entry = trip.deliveryEntries[index];
        const location = entry.notes || entry.location || `Location ${index + 1}`;
        const plannedItems = entry.plannedDelivery?.feedItems || [];
        const bags = plannedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

        try {
            const token = localStorage.getItem('token');

            // Create actual delivery entry
            const actualDelivery = {
                feedItems: plannedItems.map(item => ({
                    feedType: item.feedType || 'Cattle Feed',
                    quantity: item.quantity || 0,
                    unit: item.unit || 'bags',
                    pricePerUnit: item.pricePerUnit || 0,
                })),
                totalAmount: entry.plannedDelivery?.totalAmount || 0,
                deliveredAt: new Date(),
                receivedBy: receiverInput || undefined,
            };

            const response = await axios.put(
                `http://15.206.212.140:5000/api/cattle-feed-truck/trips/${trip._id}/deliveries/${index}`,
                { actualDelivery },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update trip state
            setTrip(response.data);
            setShowDeliveryModal(false);

            // Check if all deliveries are complete
            const updatedTrip = response.data;
            const allDelivered = updatedTrip.deliveryEntries?.every(e => e.actualDelivery?.deliveredAt);

            if (allDelivered && updatedTrip.deliveryEntries.length > 0) {
                // Auto-complete trip
                setTimeout(async () => {
                    if (window.confirm('All deliveries completed! Mark trip as finished?')) {
                        try {
                            await axios.put(
                                `http://15.206.212.140:5000/api/cattle-feed-truck/trips/${trip._id}`,
                                { status: 'completed', endTime: new Date() },
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            alert('Trip completed successfully!');
                            navigate('/cattle-feed-truck/driver/dashboard');
                        } catch (error) {
                            console.error('Error completing trip:', error);
                        }
                    }
                }, 500);
            } else {
                alert('Delivery confirmed! Owner dashboard updated.');
            }
        } catch (error) {
            console.error('Error marking delivery:', error);
            alert('Error: ' + (error.response?.data?.message || error.message));
        }
    };



    const handleCompleteTrip = async () => {
        if (!trip) return;

        const deliveredBags = trip.deliveryEntries?.reduce((sum, entry) => {
            const actualDelivery = entry.actualDelivery;
            if (actualDelivery && actualDelivery.feedItems) {
                return sum + actualDelivery.feedItems.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
            }
            return sum;
        }, 0) || 0;
        const totalBags = trip.summary?.totalQuantityLoaded || trip.tripDetails?.totalBags || 0;

        if (deliveredBags < totalBags) {
            if (!window.confirm(`You've delivered ${deliveredBags}/${totalBags} bags. Complete trip anyway?`)) {
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://15.206.212.140:5000/api/cattle-feed-truck/trips/${trip._id}`,
                { status: 'completed', endTime: new Date() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Trip completed!');
            navigate('/cattle-feed-truck/driver/dashboard');
        } catch (error) {
            console.error('Error completing trip:', error);
            alert('Error completing trip');
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchActiveTrip();
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="p-6">
                <Card>
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🚚</div>
                        <p className="text-gray-600 text-lg">No active trip</p>
                        <p className="text-sm text-gray-400 mt-2">Redirecting to dashboard...</p>
                    </div>
                </Card>
            </div>
        );
    }

    // Calculate trip stats
    const deliveredBags = trip.deliveryEntries?.reduce((sum, entry) => {
        const actualDelivery = entry.actualDelivery;
        if (actualDelivery && actualDelivery.feedItems) {
            return sum + actualDelivery.feedItems.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0);
        }
        return sum;
    }, 0) || 0;
    const totalBags = trip.summary?.totalQuantityLoaded || trip.tripDetails?.totalBags || 0;
    const deliveryEntries = trip.deliveryEntries || [];
    const allDelivered = deliveryEntries.length > 0 && deliveryEntries.every(entry => entry.actualDelivery?.deliveredAt);
    const deliveredCount = deliveryEntries.filter(e => e.actualDelivery?.deliveredAt).length;

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 md:p-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 shadow-lg mb-8">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="white">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                </div>
                <div className="relative p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
                                {trip.status === 'in_transit' ? 'In Transit' : 'Loading'}
                            </span>
                            <span className="text-blue-100 text-sm">Trip #{trip._id.substring(trip._id.length - 6)}</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Active Trip</h1>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm"
                        >
                            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/cattle-feed-truck/driver/dashboard')}
                            className="bg-white text-blue-900 border-none hover:bg-blue-50"
                        >
                            ← Dashboard
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Stats & Meta */}
                <div className="space-y-6">
                    {/* Trip Details Card */}
                    <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50 font-bold text-gray-700">
                            Trip Details
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg">
                                <span className="text-sm text-gray-500">Route</span>
                                <span className="font-bold text-gray-800">{trip.from} ➝ {trip.to}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-500">Vehicle</span>
                                <span className="font-bold text-gray-800">{trip.vehicleId?.registrationNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-500">Date</span>
                                <span className="font-bold text-gray-800">{new Date(trip.date || trip.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Progress Card */}
                    <Card className="bg-white shadow-sm border border-gray-100">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50 font-bold text-gray-700">
                            Delivery Progress
                        </div>
                        <div className="p-6">
                            <div className="flex justify-center mb-6">
                                <div className="relative h-40 w-40">
                                    <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            className="text-gray-100"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className={`${deliveredBags >= totalBags ? 'text-green-500' : 'text-blue-500'} transition-all duration-1000 ease-out`}
                                            strokeDasharray={`${Math.min((deliveredBags / totalBags) * 100, 100)}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                        <div className="text-3xl font-bold text-gray-800">{Math.round((deliveredBags / (totalBags || 1)) * 100)}%</div>
                                        <div className="text-xs text-gray-500">Completed</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <div className="text-2xl font-bold text-green-600">{deliveredBags}</div>
                                    <div className="text-xs text-green-700 font-medium uppercase">Delivered</div>
                                </div>
                                <div className="p-3 bg-gray-100 rounded-xl">
                                    <div className="text-2xl font-bold text-gray-600">{totalBags}</div>
                                    <div className="text-xs text-gray-500 font-medium uppercase">Total Bags</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Delivery List */}
                <div className="lg:col-span-2">
                    <Card className="h-full shadow-sm border border-gray-100 flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Delivery Stops</h2>
                                <p className="text-sm text-gray-500">{deliveredCount} of {deliveryEntries.length} completed</p>
                            </div>
                            {allDelivered && (
                                <Button onClick={handleCompleteTrip} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 animate-pulse">
                                    🏆 Complete Trip Now
                                </Button>
                            )}
                        </div>

                        <div className="p-4 space-y-4 flex-1 bg-gray-50/50">
                            {deliveryEntries.length > 0 ? (
                                deliveryEntries.map((entry, index) => {
                                    const plannedItems = entry.plannedDelivery?.feedItems || [];
                                    const actualItems = entry.actualDelivery?.feedItems || [];
                                    const plannedBags = plannedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
                                    const actualBags = actualItems.length > 0
                                        ? actualItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
                                        : plannedBags;
                                    const location = entry.notes || entry.location || `Location ${index + 1}`;
                                    const isDelivered = !!entry.actualDelivery?.deliveredAt;

                                    return (
                                        <div
                                            key={index}
                                            className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${isDelivered
                                                ? 'bg-white border-green-200 opacity-70 hover:opacity-100'
                                                : 'bg-white border-blue-200 shadow-md hover:shadow-lg scale-[1.01]'
                                                }`}
                                        >
                                            {isDelivered && (
                                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
                                                    COMPLETED
                                                </div>
                                            )}

                                            <div className="p-5 flex flex-col md:flex-row gap-4 items-center">
                                                {/* Number Badge */}
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${isDelivered ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {index + 1}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 text-center md:text-left w-full">
                                                    <h3 className="text-lg font-bold text-gray-800">{location}</h3>
                                                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2 text-sm">
                                                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                            🎒 {actualBags} Bags
                                                        </span>
                                                        {plannedItems.map((item, idx) => (
                                                            <span key={idx} className="bg-blue-50 px-2 py-1 rounded text-blue-700">
                                                                📦 {item.feedType}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {isDelivered && entry.actualDelivery && (
                                                        <div className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-2 grid grid-cols-2 gap-2">
                                                            {entry.actualDelivery.deliveredAt && (
                                                                <p>🕒 {new Date(entry.actualDelivery.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            )}
                                                            {entry.actualDelivery.receivedBy && (
                                                                <p>👤 {entry.actualDelivery.receivedBy}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action */}
                                                {!isDelivered && (
                                                    <Button
                                                        onClick={() => openDeliveryModal(index)}
                                                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 min-w-[140px]"
                                                    >
                                                        ✓ Mark Done
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 italic">No delivery locations planned.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Delivery Confirmation Modal */}
            <Modal
                isOpen={showDeliveryModal}
                onClose={() => setShowDeliveryModal(false)}
                title="Confirm Delivery"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Marking delivery for <span className="font-bold text-gray-800">
                            {trip?.deliveryEntries[selectedDeliveryIndex]?.location || 'Location'}
                        </span>
                    </p>

                    <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-xl">👜</div>
                        <div>
                            <p className="text-sm text-blue-800 font-medium">Items to Deliver</p>
                            <p className="font-bold text-blue-900">
                                {trip?.deliveryEntries[selectedDeliveryIndex]?.plannedDelivery?.feedItems?.[0]?.quantity || 0} Bags
                            </p>
                        </div>
                    </div>

                    <Input
                        label="Receiver Name (Optional)"
                        value={receiverInput}
                        onChange={(e) => setReceiverInput(e.target.value)}
                        placeholder="Who received the delivery?"
                    />

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button variant="secondary" onClick={() => setShowDeliveryModal(false)}>Cancel</Button>
                        <Button onClick={confirmDelivery} className="bg-green-600 hover:bg-green-700 text-white">
                            ✓ Confirm Delivery
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ActiveTrip;





