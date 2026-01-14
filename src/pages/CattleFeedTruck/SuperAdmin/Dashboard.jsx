import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOwner } from '../../../contexts/OwnerContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import axios from 'axios';

const CattleFeedTruckSuperAdminDashboard = () => {
    const { selectedOwnerId } = useOwner();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalOwners: 0,
        totalDrivers: 0,
        totalWarehouses: 0,
        totalVehicles: 0,
        totalDeliveryPoints: 0,
        totalRoutes: 0,
        totalTrips: 0,
        activeTrips: 0,
        completedTrips: 0,
    });
    const [loading, setLoading] = useState(true);
    const [recentTrips, setRecentTrips] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [selectedOwnerId]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch all owners
            const ownersResponse = await axios.get('http://43.204.211.69:5000/api/users?role=cattleFeedTruckOwner&systemType=cattleFeedTruck', { headers });
            const owners = ownersResponse.data.data || [];

            let totalDrivers = 0;
            let totalWarehouses = 0;
            let totalVehicles = 0;
            let totalDeliveryPoints = 0;
            let totalRoutes = 0;
            let totalTrips = 0;
            let activeTrips = 0;
            let completedTrips = 0;
            let allTrips = [];

            // If an owner is selected, fetch their specific data
            if (selectedOwnerId) {
                const [warehouses, vehicles, deliveryPoints, routes, drivers, trips] = await Promise.all([
                    axios.get('http://43.204.211.69:5000/api/cattle-feed-truck/warehouses', { headers }),
                    axios.get('http://43.204.211.69:5000/api/cattle-feed-truck/vehicles', { headers }),
                    axios.get('http://43.204.211.69:5000/api/cattle-feed-truck/delivery-points', { headers }),
                    axios.get('http://43.204.211.69:5000/api/cattle-feed-truck/routes', { headers }),
                    axios.get('http://43.204.211.69:5000/api/cattle-feed-truck/drivers', { headers }),
                    axios.get('http://43.204.211.69:5000/api/cattle-feed-truck/trips', { headers }),
                ]);

                totalDrivers = drivers.data?.length || 0;
                totalWarehouses = warehouses.data?.length || 0;
                totalVehicles = vehicles.data?.length || 0;
                totalDeliveryPoints = deliveryPoints.data?.length || 0;
                totalRoutes = routes.data?.length || 0;
                allTrips = trips.data || [];
                totalTrips = allTrips.length;
                activeTrips = allTrips.filter(t => t.status === 'loading' || t.status === 'in_transit').length;
                completedTrips = allTrips.filter(t => t.status === 'completed').length;
            }

            setStats({
                totalOwners: owners.length,
                totalDrivers,
                totalWarehouses,
                totalVehicles,
                totalDeliveryPoints,
                totalRoutes,
                totalTrips,
                activeTrips,
                completedTrips,
            });

            setRecentTrips(allTrips.slice(0, 10));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Cattle Feed Truck System</h1>
                    <p className="text-gray-600 mt-2">Super Admin Dashboard</p>
                </div>
                <Button onClick={fetchDashboardData} variant="outline">
                    🔄 Refresh
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <div className="text-center">
                                <p className="text-blue-100 text-sm">Total Owners</p>
                                <h3 className="text-4xl font-bold mt-2">{stats.totalOwners}</h3>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                            <div className="text-center">
                                <p className="text-green-100 text-sm">Total Drivers</p>
                                <h3 className="text-4xl font-bold mt-2">{stats.totalDrivers}</h3>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <div className="text-center">
                                <p className="text-purple-100 text-sm">Total Trips</p>
                                <h3 className="text-4xl font-bold mt-2">{stats.totalTrips}</h3>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                            <div className="text-center">
                                <p className="text-orange-100 text-sm">Active Trips</p>
                                <h3 className="text-4xl font-bold mt-2">{stats.activeTrips}</h3>
                            </div>
                        </Card>
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <div className="text-center">
                                <p className="text-gray-600 text-sm">Warehouses</p>
                                <h4 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalWarehouses}</h4>
                            </div>
                        </Card>

                        <Card>
                            <div className="text-center">
                                <p className="text-gray-600 text-sm">Vehicles</p>
                                <h4 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalVehicles}</h4>
                            </div>
                        </Card>

                        <Card>
                            <div className="text-center">
                                <p className="text-gray-600 text-sm">Delivery Points</p>
                                <h4 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalDeliveryPoints}</h4>
                            </div>
                        </Card>

                        <Card>
                            <div className="text-center">
                                <p className="text-gray-600 text-sm">Routes</p>
                                <h4 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalRoutes}</h4>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Button
                                variant="primary"
                                onClick={() => navigate('/cattle-feed-truck/superadmin/warehouses')}
                                className="py-4"
                            >
                                🏭 Warehouses
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/cattle-feed-truck/superadmin/vehicles')}
                                className="py-4"
                            >
                                🚛 Vehicles
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/cattle-feed-truck/superadmin/delivery-points')}
                                className="py-4"
                            >
                                📍 Delivery Points
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/cattle-feed-truck/superadmin/routes')}
                                className="py-4"
                            >
                                🛣️ Routes
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/cattle-feed-truck/superadmin/drivers')}
                                className="py-4"
                            >
                                👥 Drivers
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/cattle-feed-truck/superadmin/trips')}
                                className="py-4"
                            >
                                📊 Trips
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/cattle-feed-truck/superadmin/feed-products')}
                                className="py-4"
                            >
                                🌾 Feed Products
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/superadmin/owners')}
                                className="py-4"
                            >
                                🏢 Manage Owners
                            </Button>
                        </div>
                    </Card>

                    {/* Recent Trips */}
                    {recentTrips.length > 0 && (
                        <Card>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Trips</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Driver</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Route</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vehicle</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTrips.map((trip) => (
                                            <tr key={trip._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {new Date(trip.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-800">
                                                    {trip.driverId?.name || 'N/A'}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-800">
                                                    {trip.routeId?.name || 'N/A'}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {trip.vehicleId?.registrationNumber || 'N/A'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${trip.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : trip.status === 'in_transit'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : trip.status === 'loading'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {trip.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => navigate(`/cattle-feed-truck/superadmin/trips/${trip._id}`)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

export default CattleFeedTruckSuperAdminDashboard;

