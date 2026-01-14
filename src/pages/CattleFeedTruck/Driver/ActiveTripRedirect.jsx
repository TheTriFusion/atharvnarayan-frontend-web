import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const ActiveTripRedirect = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkActiveTrip = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setChecking(false);
                    return;
                }

                const response = await axios.get('http://43.204.211.69:5000/api/cattle-feed-truck/trips', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const trips = Array.isArray(response.data) ? response.data : [];
                const userId = user?._id || user?.id;

                const activeTrips = trips.filter(trip => {
                    const driverId = trip.driverId?._id || trip.driverId;
                    return driverId && userId && driverId.toString() === userId.toString() &&
                        (trip.status === 'loading' || trip.status === 'in_transit');
                });

                if (activeTrips.length > 0) {
                    // Redirect to active trip page
                    navigate('/cattle-feed-truck/driver/active-trip', { replace: true });
                } else {
                    setChecking(false);
                }
            } catch (error) {
                console.error('Error checking active trip:', error);
                setChecking(false);
            }
        };

        if (user) {
            checkActiveTrip();
        } else {
            setChecking(false);
        }
    }, [user, navigate]);

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Checking for active trips...</div>
                </div>
            </div>
        );
    }

    return children;
};

export default ActiveTripRedirect;





