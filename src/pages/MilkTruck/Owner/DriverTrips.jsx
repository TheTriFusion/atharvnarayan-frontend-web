import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMilkTruckTrips, getMilkTruckBMCs, getMilkTruckVehicles, getMilkTruckDrivers, getMilkTruckRoutes } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';
import TripDetailsModal from '../../../components/MilkTruck/TripDetailsModal';

const DriverTrips = () => {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const { selectedOwnerId } = useOwner();
  const [driver, setDriver] = useState(null);
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [bmcs, setBMCs] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [driverId, selectedOwnerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const ownerId = isSuperAdmin ? selectedOwnerId : null;
      
      // Load all data
      const [allTrips, allDrivers, vehiclesData, routesData, bmcsData] = await Promise.all([
        getMilkTruckTrips(ownerId),
        getMilkTruckDrivers(ownerId),
        getMilkTruckVehicles(ownerId),
        getMilkTruckRoutes(ownerId),
        getMilkTruckBMCs(ownerId),
      ]);

      // Find the driver
      const driversArray = Array.isArray(allDrivers) ? allDrivers : [];
      const foundDriver = driversArray.find(d => (d._id || d.id) === driverId);
      
      if (!foundDriver) {
        console.error('Driver not found');
        navigate('/milk-truck/owner/dashboard');
        return;
      }

      setDriver(foundDriver);

      // Filter trips for this driver
      const tripsArray = Array.isArray(allTrips) ? allTrips : [];
      const driverTrips = tripsArray.filter(t => {
        const tripDriverId = t.driverId?._id || t.driverId?.id || t.driverId;
        return tripDriverId === driverId;
      });

      // Sort by date (newest first)
      const sortedTrips = driverTrips.sort((a, b) => {
        const dateA = new Date(a.endTime || a.startTime || a.createdAt);
        const dateB = new Date(b.endTime || b.startTime || b.createdAt);
        return dateB - dateA;
      });

      setTrips(sortedTrips);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setRoutes(Array.isArray(routesData) ? routesData : []);
      setBMCs(Array.isArray(bmcsData) ? bmcsData : []);
    } catch (error) {
      console.error('Error loading driver trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedTrips = trips.filter(t => t.status === 'completed');
  const activeTrips = trips.filter(t => t.status === 'in_progress');

  return (
    <div className="container mx-auto px-4 py-8">
      {isSuperAdmin && <OwnerSelector systemType="milkTruck" />}

      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/milk-truck/owner/dashboard')}
          className="mb-4"
        >
          ← Back to Dashboard
        </Button>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Driver Trips</h1>
            {driver && (
              <p className="text-gray-600 mt-1">
                {driver.name} • {driver.phoneNumber || 'N/A'}
              </p>
            )}
          </div>
          {!loading && (
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{trips.length}</p>
            <p className="text-gray-600 mt-2">Total Trips</p>
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

      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading trips...</p>
          </div>
        </Card>
      ) : trips.length > 0 ? (
        <Card title="All Trips">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trip ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route / Vehicle</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collected</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Dairy Rec.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trips.map((trip) => {
                  const vehicleReg = trip.vehicleId?.registrationNumber || vehicles.find(v => (v.id || v._id) === trip.vehicleId)?.registrationNumber || 'N/A';
                  const routeName = trip.routeId?.name || routes.find(r => (r.id || r._id) === trip.routeId)?.name || 'N/A';

                  const collected = trip.dairyConfirmation?.collectionTotals?.milk || trip.summary?.totalMilk || 0;
                  const dairy = trip.dairyConfirmation?.totalMilkQuantity || trip.summary?.totalMilk || 0;
                  const diff = trip.dairyConfirmation?.variance?.milk || (dairy - collected);
                  const bmcCount = trip.bmcEntries?.length || 0;

                  return (
                    <tr
                      key={trip._id || trip.id}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedTrip(trip)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>{new Date(trip.endTime || trip.startTime || trip.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(trip.endTime || trip.startTime || trip.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                        #{(trip._id || trip.id).toString().substring((trip._id || trip.id).toString().length - 6)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="font-medium">{routeName}</div>
                        <div className="text-xs text-gray-500">{vehicleReg}</div>
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
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            trip.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : trip.status === 'in_progress'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {trip.status === 'completed' ? 'Completed' : trip.status === 'in_progress' ? 'In Progress' : trip.status}
                        </span>
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
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No trips found for this driver.</p>
            <p className="text-sm text-gray-400 mt-1">Trips will appear here once the driver starts a trip.</p>
          </div>
        </Card>
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

export default DriverTrips;

