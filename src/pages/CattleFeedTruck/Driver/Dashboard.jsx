import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import axios from 'axios';

const CattleFeedTruckDriverDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]); // Kept if needed for stats, otherwise can verify usage
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const [tripsRes, vehiclesRes] = await Promise.all([
                axios.get('https://api.thetrifusion.in/api/cattle-feed-truck/trips', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('https://api.thetrifusion.in/api/cattle-feed-truck/vehicles', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            setTrips(Array.isArray(tripsRes.data) ? tripsRes.data : []);
            setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response?.status === 401) {
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };



    const handleStartTrip = async (tripId) => {
        if (!window.confirm('Start this trip?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `https://api.thetrifusion.in/api/cattle-feed-truck/trips/${tripId}`,
                { status: 'in_transit' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
            navigate('/cattle-feed-truck/driver/active-trip');
        } catch (error) {
            console.error('Error starting trip:', error);
            alert('Error starting trip');
        }
    };

    // Filter Logic
    const userId = user?._id || user?.id;
    const myTrips = trips.filter(trip => {
        if (!userId) return false;
        const driverId = trip.driverId?._id || trip.driverId;
        return driverId && driverId.toString() === userId.toString();
    });

    const activeTrips = myTrips.filter(t => t.status === 'in_transit' || t.status === 'loading');
    const pendingTrips = myTrips.filter(t => t.status === 'pending');
    const completedTrips = myTrips.filter(t => t.status === 'completed');

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 md:p-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 shadow-lg mb-8 transition-transform hover:scale-[1.005] duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="white">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                </div>
                <div className="relative p-6 md:p-8 text-white">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Driver Dashboard</h1>
                    <p className="mt-2 text-blue-100 text-lg">Good day, {user?.name}. Ready for your next journey?</p>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-white border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Trips</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{myTrips.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                            <span className="text-2xl">🚛</span>
                        </div>
                    </div>
                </Card>
                <Card className="bg-white border-l-4 border-green-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Completed</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{completedTrips.length}</h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full text-green-600">
                            <span className="text-2xl">✅</span>
                        </div>
                    </div>
                </Card>
                <Card className="bg-white border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Today's Activity</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">
                                {myTrips.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).length}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                            <span className="text-2xl">📅</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Active Trips Alert */}
            {activeTrips.length > 0 && (
                <div className="mb-8 p-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl shadow-lg transform hover:scale-[1.01] transition-transform cursor-pointer group"
                    onClick={() => navigate('/cattle-feed-truck/driver/active-trip')}>
                    <div className="bg-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between group-hover:bg-opacity-95 transition-colors">
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Trip in Progress</h2>
                                <p className="text-gray-600">You have an active trip. Click here to manage deliveries.</p>
                            </div>
                        </div>
                        <Button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-none shadow-orange-200">
                            Continue Trip →
                        </Button>
                    </div>
                </div>
            )}

            {/* Pending Trips Section */}
            {pendingTrips.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-1.5 h-6 bg-yellow-500 rounded-full mr-3"></span>
                        Pending Trips ({pendingTrips.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {pendingTrips.map(trip => (
                            <div key={trip._id} className="bg-white p-5 rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{trip.from} ➝ {trip.to}</h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(trip.date || trip.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Pending</span>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-gray-600">
                                        🚛 {trip.vehicleId?.registrationNumber || 'No Vehicle'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        📦 {trip.summary?.totalQuantityLoaded || trip.tripDetails?.totalBags || 0} Bags
                                    </p>
                                </div>
                                <Button
                                    onClick={() => handleStartTrip(trip._id)}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-200"
                                >
                                    ▶ Start Trip
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Start New Trip Action */}
            <div className="mb-8 flex justify-center">
                <button
                    onClick={() => navigate('/cattle-feed-truck/driver/create-trip')}
                    className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-lg rounded-full hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                >
                    <span className="mr-2 text-2xl group-hover:rotate-12 transition-transform duration-300">✨</span>
                    Start New Trip
                </button>
            </div>

            {/* Recent History Table */}
            <Card className="shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800">Recent Trip History</h3>
                    <button onClick={fetchData} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">Refresh List</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Performance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {myTrips.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                                        No trips found. Start your first journey today!
                                    </td>
                                </tr>
                            ) : (
                                myTrips.slice(0, 5).map(trip => (
                                    <tr key={trip._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {new Date(trip.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{trip.to}</div>
                                            <div className="text-xs text-gray-500">from {trip.from}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${trip.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                trip.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {trip.status === 'in_transit' ? 'In Progress' : trip.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                                            {trip.summary?.totalQuantityLoaded || trip.tripDetails?.totalBags || '-'} bags
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default CattleFeedTruckDriverDashboard;
