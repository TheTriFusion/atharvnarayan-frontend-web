import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMilkTruckVehicles, getMilkTruckRoutes, getMilkTruckBMCs, addMilkTruckTrip } from '../../utils/storage';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';

const TripStart = ({ onTripStart, vehicles, routes }) => {
  const { user } = useAuth();
  const [allVehicles, setAllVehicles] = useState(vehicles || []);
  const [allRoutes, setAllRoutes] = useState(routes || []);
  const [allBMCs, setAllBMCs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch if not provided via props
    if (!vehicles || !routes) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [vehiclesData, routesData, bmcs] = await Promise.all([
            getMilkTruckVehicles(),
            getMilkTruckRoutes(),
            getMilkTruckBMCs()
          ]);
          setAllVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
          setAllRoutes(Array.isArray(routesData) ? routesData : []);
          setAllBMCs(Array.isArray(bmcs) ? bmcs : []);
        } catch (error) {
          console.error('Error fetching trip data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      // Use props data
      setAllVehicles(vehicles);
      setAllRoutes(routes);
    }
  }, [vehicles, routes]);

  // Allow any vehicle access as requested
  const availableVehicles = allVehicles;

  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [error, setError] = useState('');

  // Allow any route access as requested
  const availableRoutes = allRoutes;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartTrip = async (e) => {
    if (e) e.preventDefault();

    if (!selectedVehicleId || !selectedRouteId) {
      setError('Please select both vehicle and route');
      return;
    }

    const selectedRoute = allRoutes.find(r => (r.id || r._id) === selectedRouteId);
    if (!selectedRoute) {
      setError('Route not found');
      return;
    }

    setIsSubmitting(true);
    try {
      const newTrip = {
        vehicleId: selectedVehicleId,
        routeId: selectedRouteId,
        driverId: user.id,
        status: 'in_progress',
        startTime: new Date().toISOString(),
        endTime: null,
        bmcEntries: [],
        dairyConfirmation: null,
      };

      const createdTrip = await addMilkTruckTrip(newTrip);

      if (createdTrip) {
        onTripStart(createdTrip);
      } else {
        setError('Failed to start trip. Please try again.');
      }
    } catch (error) {
      console.error('Error starting trip:', error);
      setError('An error occurred while starting the trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading options...</div>;
  }

  console.log('TripStart - Available data:', {
    vehiclesCount: availableVehicles.length,
    routesCount: availableRoutes.length,
    vehicles: availableVehicles,
    routes: availableRoutes
  });

  const selectedRoute = allRoutes.find(r => (r.id || r._id) === selectedRouteId);

  return (
    <Card title="Start New Trip" className="max-w-2xl mx-auto">
      <div className="space-y-4">
        <Select
          label="Select Vehicle"
          value={selectedVehicleId}
          onChange={(e) => {
            setSelectedVehicleId(e.target.value);
            setError('');
          }}
          options={availableVehicles.map(v => ({ value: v.id || v._id, label: v.registrationNumber }))}
          required
          placeholder="Choose the tanker you are operating"
        />

        <Select
          label="Select Route"
          value={selectedRouteId}
          onChange={(e) => {
            setSelectedRouteId(e.target.value);
            setError('');
          }}
          options={availableRoutes.map(r => ({ value: r.id || r._id, label: r.name }))}
          required
          placeholder="Choose the route for this trip"
        />

        {selectedRoute && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Route Details:</h3>
            <p className="text-gray-600 font-medium mb-2">
              {selectedRoute.name}
            </p>
            {selectedRoute.bmcSequence && selectedRoute.bmcSequence.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Assigned BMCs:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRoute.bmcSequence.map((bmc, index) => {
                    // bmc is already populated as an object
                    return (
                      <span key={bmc._id || bmc.id || index} className="px-2 py-1 bg-white border border-blue-200 rounded text-sm text-blue-700 shadow-sm">
                        {index + 1}. {bmc?.name || 'Unknown BMC'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            variant="primary"
            onClick={handleStartTrip}
            disabled={!selectedVehicleId || !selectedRouteId || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Starting Trip...' : 'Start Trip'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TripStart;

