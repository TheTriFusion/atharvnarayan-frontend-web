import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMilkTruckTrips, getMilkTruckBMCs, getMilkTruckVehicles, getMilkTruckDrivers, getMilkTruckRoutes, deleteMilkTruckTrip } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';
import TripDetailsModal from '../../../components/MilkTruck/TripDetailsModal';

const Dashboard = () => {
  const { isSuperAdmin } = useAuth();
  const { selectedOwnerId } = useOwner();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    inProgressTrips: 0,
    totalBMCs: 0,
    totalVehicles: 0,
    totalDrivers: 0,
    totalRoutes: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [bmcs, setBMCs] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    loadAllData();
    loadNotifications();
  }, [selectedOwnerId]);

  const loadNotifications = () => {
    const notifs = JSON.parse(localStorage.getItem('ownerNotifications') || '[]');
    setNotifications(notifs.slice(0, 10)); // Show last 10 notifications
  };

  const clearNotifications = () => {
    localStorage.removeItem('ownerNotifications');
    setNotifications([]);
  };

  const loadAllData = async () => {
    try {
      const ownerId = isSuperAdmin ? selectedOwnerId : null;
      const [trips, bmcs, vehiclesData, drivers, routesData] = await Promise.all([
        getMilkTruckTrips(ownerId),
        getMilkTruckBMCs(ownerId),
        getMilkTruckVehicles(ownerId),
        getMilkTruckDrivers(ownerId),
        getMilkTruckRoutes(ownerId),
      ]);

      // Ensure arrays
      const tripsArray = Array.isArray(trips) ? trips : [];
      const bmcsArray = Array.isArray(bmcs) ? bmcs : [];
      const vehiclesArray = Array.isArray(vehiclesData) ? vehiclesData : [];
      const driversArray = Array.isArray(drivers) ? drivers : [];
      const routesArray = Array.isArray(routesData) ? routesData : [];

      setStats({
        totalTrips: tripsArray.length,
        completedTrips: tripsArray.filter(t => t.status === 'completed').length,
        inProgressTrips: tripsArray.filter(t => t.status === 'in_progress').length,
        totalBMCs: bmcsArray.length,
        totalVehicles: vehiclesArray.length,
        totalDrivers: driversArray.length,
        totalRoutes: routesArray.length,
      });

      // Set completed trips (history)
      const completed = tripsArray
        .filter(t => t.status === 'completed')
        .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
      setCompletedTrips(completed);

      setDrivers(driversArray);
      setVehicles(vehiclesArray);
      setRoutes(routesArray);
      setBMCs(bmcsArray);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      const success = await deleteMilkTruckTrip(tripId);
      if (success) {
        setDeleteMessage('Trip deleted successfully!');
        setTimeout(() => setDeleteMessage(''), 3000);
        setDeleteConfirm(null);
        // Reload data
        await loadAllData();
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      setDeleteMessage(`Error: ${error.message}`);
      setTimeout(() => setDeleteMessage(''), 5000);
    }
  };

  const handleDriverClick = (driverId) => {
    navigate(`/milk-truck/owner/drivers/${driverId}/trips`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isSuperAdmin && <OwnerSelector systemType="milkTruck" />}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Owner Dashboard</h1>
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
          {!loading && (
            <button
              onClick={loadAllData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              title="Refresh data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.totalTrips}</p>
            <p className="text-gray-600 mt-2">Total Trips</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.completedTrips}</p>
            <p className="text-gray-600 mt-2">Completed Trips</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.inProgressTrips}</p>
            <p className="text-gray-600 mt-2">Active Trips</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.totalBMCs}</p>
            <p className="text-gray-600 mt-2">Total BMCs</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.totalVehicles}</p>
            <p className="text-gray-600 mt-2">Vehicles</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-teal-600">{stats.totalDrivers}</p>
            <p className="text-gray-600 mt-2">Drivers</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-pink-600">{stats.totalRoutes}</p>
            <p className="text-gray-600 mt-2">Routes</p>
          </div>
        </Card>
      </div>

      {/* Driver Overview Section */}
      {drivers.length > 0 && (
        <Card title="Driver Overview" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => {
              const driverTrips = completedTrips.filter(t => {
                const tripDriverId = t.driverId?._id || t.driverId?.id || t.driverId;
                const driverId = driver._id || driver.id;
                return tripDriverId === driverId;
              });
              const activeTrips = completedTrips.filter(t => {
                const tripDriverId = t.driverId?._id || t.driverId?.id || t.driverId;
                const driverId = driver._id || driver.id;
                return tripDriverId === driverId && t.status === 'in_progress';
              });
              const totalTrips = driverTrips.length;
              const completedCount = driverTrips.filter(t => t.status === 'completed').length;

              return (
                <div
                  key={driver._id || driver.id}
                  onClick={() => handleDriverClick(driver._id || driver.id)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{driver.name}</h3>
                      <p className="text-sm text-gray-500">{driver.phoneNumber || 'N/A'}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDriverClick(driver._id || driver.id);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Trips →
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{totalTrips}</p>
                      <p className="text-xs text-gray-500">Total Trips</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{completedCount}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-600">{activeTrips.length}</p>
                      <p className="text-xs text-gray-500">Active</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Real-time Notifications */}
      <Card
        title={
          <div className="flex justify-between items-center">
            <span>Real-time BMC Collection Updates</span>
            {notifications.length > 0 && (
              <Button variant="secondary" onClick={clearNotifications} className="text-xs">
                Clear All
              </Button>
            )}
          </div>
        }
        className="mb-8"
      >
        {notifications.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-green-800">{notif.message}</p>

                    {/* Handle old notification format (totals) */}
                    {notif.totals && (
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <p>Total Milk: <span className="font-medium">{notif.totals.totalMilk.toFixed(2)}L</span></p>
                        <p>Total Expenses: <span className="font-medium">₹{notif.totals.totalExpenses?.toFixed(2) || '0.00'}</span></p>
                      </div>
                    )}

                    {/* Handle new notification format (summary) */}
                    {notif.summary && (
                      <div className="mt-2 text-sm text-gray-700 space-y-1">
                        <p>Total Milk: <span className="font-medium">{notif.summary.totalMilk.toFixed(2)}L</span></p>
                        <p>Total Expenses: <span className="font-medium">₹{notif.summary.totalExpenses?.toFixed(2) || '0.00'}</span></p>
                        {notif.summary.finalPrice && (
                          <p>Final Price: <span className="font-medium">₹{notif.summary.finalPrice?.toFixed(2)}</span></p>
                        )}
                      </div>
                    )}

                    {notif.variance && (
                      <div className="mt-2 text-sm border-t border-green-200 pt-1">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Variance:</span>
                          <span className={`font-bold ${notif.variance.milk < 0 ? 'text-red-700' : 'text-green-700'}`}>
                            {notif.variance.milk > 0 ? '+' : ''}{notif.variance.milk.toFixed(2)}L
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent updates. BMC collection data will appear here in real-time.
          </div>
        )}
      </Card>

      {completedTrips.length > 0 && (
        <Card title="Trip Completed History">
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
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">BMCs</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedTrips.map((trip) => {
                  const vehicleReg = trip.vehicleId?.registrationNumber || vehicles.find(v => v.id === trip.vehicleId)?.registrationNumber || 'N/A';
                  const routeName = trip.routeId?.name || routes.find(r => r.id === trip.routeId)?.name || 'N/A';

                  // Safe access to new data structure
                  const collected = trip.dairyConfirmation?.collectionTotals?.milk || trip.summary?.totalMilk || 0;
                  const dairy = trip.dairyConfirmation?.totalMilkQuantity || trip.summary?.totalMilk || 0;
                  const diff = trip.dairyConfirmation?.variance?.milk || (dairy - collected);
                  const bmcCount = trip.bmcEntries?.length || 0;

                  const tripId = trip.id || trip._id || `trip-${Math.random()}`;

                  return (
                    <tr key={tripId} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>{new Date(trip.endTime || trip.startTime).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{new Date(trip.endTime || trip.startTime).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                        #{tripId ? tripId.toString().substring(tripId.toString().length - 6) : 'N/A'}
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
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">
                        {bmcCount} BMC{bmcCount !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedTrip(trip)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(tripId);
                            }}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Trip?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this trip? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDeleteTrip(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Trip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success/Error Message */}
      {deleteMessage && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${deleteMessage.includes('Error') ? 'bg-red-500' : 'bg-green-500'
          } text-white font-medium animate-fade-in`}>
          {deleteMessage}
        </div>
      )}

      {selectedTrip && (
        <TripDetailsModal
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onUpdate={(updatedTrip) => {
            if (updatedTrip === null) {
              // Trip was deleted
              setSelectedTrip(null);
              loadAllData();
            } else {
              // Trip was updated
              loadAllData();
            }
          }}
          bmcs={bmcs}
          routes={routes}
          vehicles={vehicles}
        />
      )}
    </div>
  );
};

export default Dashboard;

