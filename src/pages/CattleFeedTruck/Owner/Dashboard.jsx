import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import axios from 'axios';

const CattleFeedTruckOwnerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const [statsResponse, tripsResponse] = await Promise.all([
                axios.get('https://api.thetrifusion.in/api/cattle-feed-truck/owner/dashboard-stats', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('https://api.thetrifusion.in/api/cattle-feed-truck/trips', {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);
            setStats(statsResponse.data);
            setTrips(tripsResponse.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            {/* Header Section */}
            <div className="mb-10 relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                            Cattle Feed Dashboard
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg font-medium">
                            Welcome back, <span className="text-gray-800">{user?.name}</span> 👋
                        </p>
                    </div>
                    <div className="text-sm text-gray-400 font-medium px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                    { title: 'Total Drivers', value: stats?.totalDrivers || 0, icon: '👥', color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200' },
                    { title: 'Total Trips', value: stats?.totalTrips || 0, icon: '🚛', color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200' },
                    { title: 'Completed', value: stats?.completedTrips || 0, icon: '✨', color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-200' },
                    { title: "Today's Trips", value: stats?.todayTrips || 0, icon: '📅', color: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-200' },
                ].map((stat, index) => (
                    <div key={index} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.color} p-6 text-white shadow-lg ${stat.shadow} transition-transform hover:-translate-y-1 duration-300`}>
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 text-8xl opacity-10 select-none">
                            {stat.icon}
                        </div>
                        <div className="relative z-10">
                            <p className="text-blue-100 text-sm font-medium tracking-wide uppercase opacity-90">{stat.title}</p>
                            <h3 className="text-4xl font-bold mt-1 tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions Grid */}
            <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { label: 'Vehicles', icon: '🚛', path: '/cattle-feed-truck/owner/vehicles', desc: 'Manage Fleet' },
                        { label: 'Drivers', icon: '👥', path: '/cattle-feed-truck/owner/drivers', desc: 'Manage Staff' },
                        { label: 'All Trips', icon: '📊', path: '/cattle-feed-truck/owner/trips', desc: 'View History' },
                        { label: 'Reports', icon: '📈', path: '/cattle-feed-truck/owner/reports', desc: 'Analytics' },
                    ].map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => navigate(action.path)}
                            className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group"
                        >
                            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
                            <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{action.label}</span>
                            <span className="text-xs text-gray-400 mt-1">{action.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid: Active & Recent Trips */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Trips Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                Active Trips
                            </h2>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
                            {stats?.activeTrips && stats.activeTrips.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.activeTrips.map((trip) => (
                                        <div
                                            key={trip._id}
                                            onClick={() => navigate(`/cattle-feed-truck/owner/trips/${trip._id}`)}
                                            className="group p-4 rounded-lg bg-gray-50 border border-transparent hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${trip.status === 'in_transit' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {trip.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                                <span className="text-xs text-gray-400 group-hover:text-blue-500">View →</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm border border-gray-100">
                                                    🚚
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 text-sm">
                                                        {trip.routeId?.name || 'Ad-hoc Trip'}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {trip.driverId?.name} • {trip.vehicleId?.registrationNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                                    <span className="text-4xl mb-2 opacity-30">🚚</span>
                                    <p className="text-sm">No active trips right now</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Trips Table Column */}
                <div className="lg:col-span-2">
                    <Card className="h-full border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
                            <button
                                onClick={() => navigate('/cattle-feed-truck/owner/trips')}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                View All
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : trips.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="text-left py-3 px-4 font-semibold rounded-l-lg">Date</th>
                                            <th className="text-left py-3 px-4 font-semibold">Details</th>
                                            <th className="text-left py-3 px-4 font-semibold">Status</th>
                                            <th className="text-right py-3 px-4 font-semibold rounded-r-lg">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {trips.slice(0, 5).map((trip) => (
                                            <tr key={trip._id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="py-4 px-4">
                                                    <div className="text-sm font-medium text-gray-800">
                                                        {new Date(trip.date || trip.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-800">
                                                            {trip.from && trip.to ? `${trip.from} → ${trip.to}` : trip.routeId?.name || 'N/A'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 mt-0.5">
                                                            {trip.driverId?.name || 'Unknown'} • {trip.tripDetails?.distance || trip.distance || 0} km
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trip.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        trip.status === 'in_transit' ? 'bg-purple-100 text-purple-700' :
                                                            trip.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {trip.status === 'completed' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>}
                                                        {trip.status?.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/cattle-feed-truck/owner/trips/${trip._id}`)}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors font-medium text-sm group-hover:translate-x-1 duration-200 inline-block"
                                                    >
                                                        Details →
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">No recent activity found.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CattleFeedTruckOwnerDashboard;
