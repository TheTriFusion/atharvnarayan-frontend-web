import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getMilkTruckTrips, getMilkTruckVehicles, getMilkTruckRoutes, getMilkTruckBMCs } from '../../../utils/storage';
import TripDetailsModal from '../../../components/MilkTruck/TripDetailsModal';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [bmcs, setBMCs] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Backend already filters trips by driverId for drivers
      const [allTrips, allVehicles, allRoutes, allBMCs] = await Promise.all([
        getMilkTruckTrips(), // Backend returns only this driver's trips
        getMilkTruckVehicles(),
        getMilkTruckRoutes(),
        getMilkTruckBMCs()
      ]);

      console.log('Driver Dashboard - Raw data from backend:', {
        tripsCount: allTrips?.length,
        trips: allTrips,
        currentUserId: user.id || user._id,
        currentUserRole: user.role
      });

      const tripsArray = Array.isArray(allTrips) ? allTrips : [];

      // ADDITIONAL CLIENT-SIDE FILTERING as safety measure
      // Filter to only show trips for the current logged-in driver
      const currentDriverId = user.id || user._id;
      const driverTrips = tripsArray.filter(trip => {
        const tripDriverId = trip.driverId?._id || trip.driverId?.id || trip.driverId;
        const match = tripDriverId?.toString() === currentDriverId?.toString();

        if (!match) {
          console.warn('Filtering out trip not belonging to current driver:', {
            tripId: trip.id || trip._id,
            tripDriverId: tripDriverId,
            currentDriverId: currentDriverId
          });
        }

        return match;
      });

      console.log('Filtered trips for current driver:', {
        totalTrips: tripsArray.length,
        driverTrips: driverTrips.length,
        currentDriver: user.name
      });

      setTrips(driverTrips);
      setVehicles(Array.isArray(allVehicles) ? allVehicles : []);
      setRoutes(Array.isArray(allRoutes) ? allRoutes : []);
      setBMCs(Array.isArray(allBMCs) ? allBMCs : []);


    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTripStart = async (newTrip) => {
    try {
      // Ensure the trip has the correct status
      const tripWithStatus = {
        ...newTrip,
        status: 'in_progress'
      };

      console.log('Trip started, setting active trip:', tripWithStatus);

      // Set flag to indicate we just started a trip
      setJustStartedTrip(tripWithStatus);
      setActiveTrip(tripWithStatus);
      setShowTripStart(false);

      // Refresh dashboard data to get latest from backend
      // The loadDashboardData will preserve the activeTrip if justStartedTrip is set
      await loadDashboardData();
    } catch (error) {
      console.error('Error handling trip start:', error);
      // Even if refresh fails, keep the trip active
      const tripWithStatus = {
        ...newTrip,
        status: 'in_progress'
      };
      setActiveTrip(tripWithStatus);
      setJustStartedTrip(tripWithStatus);
      setShowTripStart(false);
    }
  };

  const handleTripComplete = async (completedTrip) => {
    try {
      // Immediately clear active trip to hide the active trip section
      setActiveTrip(null);

      // Reload dashboard data to get updated trip status and show in completed trips
      await loadDashboardData();

      // Show success message
      console.log('Trip completed successfully:', completedTrip);
    } catch (error) {
      console.error('Error handling trip completion:', error);
      // Still clear active trip even if refresh fails
      setActiveTrip(null);
    }
  };

  console.log('Trip filtering:', {
    totalTrips: trips.length,
    tripsData: trips.map(t => ({
      id: t.id || t._id,
      status: t.status,
      startTime: t.startTime,
      endTime: t.endTime
    }))
  });

  // Active trips - currently in progress
  const activeTrips = trips.filter(t => {
    const status = (t.status || t.Status || '').toLowerCase();
    return status === 'in_progress' || status === 'inprogress' || status === 'in progress';
  });

  // Completed trips - show ALL trips that are NOT in progress
  // This handles any status like: "completed", "complete", "finished", etc.
  const completedTrips = trips.filter(t => {
    const status = (t.status || t.Status || '').toLowerCase();
    const isInProgress = status === 'in_progress' || status === 'inprogress' || status === 'in progress';
    // If it has an endTime, it's definitely completed
    return !isInProgress || t.endTime;
  });

  console.log('Filtered trips:', {
    totalTrips: trips.length,
    completedCount: completedTrips.length,
    activeCount: activeTrips.length,
    completedTrips: completedTrips.map(t => ({ id: t.id || t._id, status: t.status }))
  });

  // Sort by date desc
  const sortedTrips = [...completedTrips].sort((a, b) => new Date(b.endTime || b.startTime || b.createdAt) - new Date(a.endTime || a.startTime || a.createdAt));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Driver Dashboard</h1>
          <p className="text-gray-600">Welcome, {user.name}</p>
        </div>
        {!loading && (
          <button
            onClick={loadDashboardData}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Refresh Data
          </button>
        )}
      </div>

      {/* Start Trip Button - navigates to separate trip page */}
      <div className="mb-8">
        <Button
          variant="primary"
          onClick={() => navigate('/milk-truck/driver/trip')}
          className="text-lg px-6 py-3 w-full md:w-auto shadow-lg hover:shadow-xl transition-all"
        >
          Start New Trip 🚚
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your trips...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{trips.length}</p>
                <p className="text-gray-600 mt-2">Total Trips Assigned</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{completedTrips.length}</p>
                <p className="text-gray-600 mt-2">Completed Trips</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{activeTrips.length}</p>
                <p className="text-gray-600 mt-2">Active Trips</p>
              </div>
            </Card>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Completed Trips History</h2>
          {sortedTrips.length > 0 ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trip ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collected</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Dairy Rec.</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">BMCs</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedTrips.map((trip) => {
                      const routeName = trip.routeId?.name || routes.find(r => r.id === trip.routeId)?.name || 'Unknown Route';
                      const collected = trip.dairyConfirmation?.collectionTotals?.milk || trip.summary?.totalMilk || 0;
                      const dairy = trip.dairyConfirmation?.totalMilkQuantity || trip.summary?.totalMilk || 0;
                      const diff = trip.dairyConfirmation?.variance?.milk || (dairy - collected);
                      const bmcCount = trip.bmcEntries?.length || 0;

                      const tripId = trip.id || trip._id || `trip-${Math.random()}`;

                      return (
                        <tr
                          key={tripId}
                          className="hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedTrip(trip)}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div>{new Date(trip.endTime || trip.startTime).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(trip.endTime || trip.startTime).toLocaleTimeString()}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">
                            #{tripId ? tripId.toString().substring(tripId.toString().length - 6) : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {routeName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {collected.toFixed(2)} L
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {dairy.toFixed(2)} L
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-medium ${diff < 0 ? 'text-red-600' : diff > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {diff > 0 ? '+' : ''}{diff !== 0 ? diff.toFixed(2) : '-'} L
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">
                            {bmcCount} BMC{bmcCount !== 1 ? 's' : ''}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTrip(trip);
                              }}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-600 text-xl font-medium mb-2">No completed trips found</p>
                <p className="text-gray-400">Start a new trip to build your history!</p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/milk-truck/driver/trip')}
                  className="mt-6"
                >
                  Start Your First Trip 🚚
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {selectedTrip && (
        <TripDetailsModal
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          bmcs={bmcs}
          routes={routes}
          vehicles={vehicles}
        />
      )}
    </div>
  );
};




export default DriverDashboard;

