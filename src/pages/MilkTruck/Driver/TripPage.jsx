import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getMilkTruckTrips, getMilkTruckVehicles, getMilkTruckRoutes, getMilkTruckBMCs } from '../../../utils/storage';
import TripStart from '../../../components/Driver/TripStart';
import ActiveTrip from './ActiveTrip';
import Card from '../../../components/common/Card';

const TripPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTrip, setActiveTrip] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [bmcs, setBMCs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTripData();
    }, []);

    const loadTripData = async () => {
        setLoading(true);
        try {
            const [allTrips, allVehicles, allRoutes, allBMCs] = await Promise.all([
                getMilkTruckTrips(),
                getMilkTruckVehicles(),
                getMilkTruckRoutes(),
                getMilkTruckBMCs()
            ]);

            const tripsArray = Array.isArray(allTrips) ? allTrips : [];
            const driverTrips = tripsArray.filter(t => {
                const tripDriverId = t.driverId?._id || t.driverId?.id || t.driverId;
                const userId = user.id || user._id;
                return tripDriverId === userId;
            });

            // Find active trip
            const inProgressTrip = driverTrips.find(t => t.status === 'in_progress');
            setActiveTrip(inProgressTrip || null);

            setVehicles(Array.isArray(allVehicles) ? allVehicles : []);
            setRoutes(Array.isArray(allRoutes) ? allRoutes : []);
            setBMCs(Array.isArray(allBMCs) ? allBMCs : []);
            setLoading(false);
        } catch (error) {
            console.error('Error loading trip data:', error);
            setLoading(false);
        }
    };

    const handleTripStart = async (newTrip) => {
        console.log('Trip started:', newTrip);
        // Ensure the trip has the right status
        if (newTrip && newTrip.status === 'in_progress') {
            setActiveTrip(newTrip);
            // Reload data to ensure consistency
            await loadTripData();
        }
    };

    const handleTripComplete = async () => {
        console.log('Trip completed, redirecting to dashboard');
        setActiveTrip(null);
        // Navigate back to dashboard
        navigate('/milk-truck/driver/dashboard');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/milk-truck/driver/dashboard')}
                    className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
                >
                    ← Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-800">
                    {activeTrip ? 'Active Trip' : 'Start New Trip'}
                </h1>
            </div>

            {/* Trip Content */}
            {activeTrip ? (
                <ActiveTrip
                    trip={activeTrip}
                    onTripComplete={handleTripComplete}
                    bmcs={bmcs}
                    routes={routes}
                    vehicles={vehicles}
                />
            ) : (
                <Card>
                    <TripStart
                        onTripStart={handleTripStart}
                        vehicles={vehicles}
                        routes={routes}
                    />
                </Card>
            )}
        </div>
    );
};

export default TripPage;
