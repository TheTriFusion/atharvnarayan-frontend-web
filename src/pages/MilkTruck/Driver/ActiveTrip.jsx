import { useState, useEffect } from 'react';
import BMCCollection from '../../../components/Driver/BMCCollection';
import DairyConfirmation from '../../../components/Driver/DairyConfirmation';
import Card from '../../../components/common/Card';
import { getMilkTruckRoutes, getMilkTruckVehicles } from '../../../utils/storage';

const ActiveTrip = ({ trip, onTripComplete }) => {
  const [currentTrip, setCurrentTrip] = useState(trip);
  const [stage, setStage] = useState('bmc_collection');
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    setCurrentTrip(trip);
  }, [trip]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesData, vehiclesData] = await Promise.all([
          getMilkTruckRoutes(),
          getMilkTruckVehicles()
        ]);
        setRoutes(Array.isArray(routesData) ? routesData : []);
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      } catch (error) {
        console.error('Error fetching trip details:', error);
      }
    };
    fetchData();
  }, []);

  // Handle both ID strings and populated objects
  // Handle both ID strings and populated objects
  const routeId = typeof currentTrip.routeId === 'object' ? (currentTrip.routeId.id || currentTrip.routeId._id) : currentTrip.routeId;
  const vehicleId = typeof currentTrip.vehicleId === 'object' ? (currentTrip.vehicleId.id || currentTrip.vehicleId._id) : currentTrip.vehicleId;

  const currentRoute = routes.find(r => (r.id || r._id) === routeId) || (typeof currentTrip.routeId === 'object' ? currentTrip.routeId : null);
  const currentVehicle = vehicles.find(v => (v.id || v._id) === vehicleId) || (typeof currentTrip.vehicleId === 'object' ? currentTrip.vehicleId : null);

  const handleBMCComplete = (updatedTrip) => {
    setCurrentTrip(updatedTrip);
    // Check if all BMCs are collected
    const bmcSequence = currentRoute?.bmcSequence || [];
    const allCollected = bmcSequence.every(bmc =>
      updatedTrip.bmcEntries.some(e => {
        const entryBmcId = e.bmcId._id || e.bmcId || e.bmcId;
        const seqBmcId = bmc._id || bmc.id || bmc;
        return entryBmcId.toString() === seqBmcId.toString() && e.collectionData;
      })
    );

    if (allCollected) {
      setStage('dairy_confirmation');
    }
  };

  const handleDairyConfirm = async (updatedTrip) => {
    try {
      // Ensure trip is marked as completed
      const completedTrip = {
        ...updatedTrip,
        status: 'completed',
        endTime: updatedTrip.endTime || new Date().toISOString()
      };
      
      console.log('Completing trip:', completedTrip);
      
      // Call the completion handler (this will clear active trip and refresh the dashboard)
      await onTripComplete(completedTrip);
    } catch (error) {
      console.error('Error completing trip:', error);
      alert(`Failed to complete trip: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Vehicle</p>
            <p className="font-semibold text-gray-800">
              {currentVehicle?.registrationNumber || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Route</p>
            <p className="font-semibold text-gray-800">
              {currentRoute?.name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-semibold text-gray-800 capitalize">{currentTrip.status}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className={`flex-1 p-4 rounded-lg ${stage === 'bmc_collection' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
            }`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${stage === 'bmc_collection' ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                1
              </div>
              <div>
                <p className="font-semibold">BMC Collection</p>
                <p className="text-sm text-gray-600">
                  {currentTrip.bmcEntries.filter(e => e.collectionData).length} of {currentRoute?.bmcSequence?.length || 0} collected
                </p>
              </div>
            </div>
          </div>

          <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>

          <div className={`flex-1 p-4 rounded-lg ${stage === 'dairy_confirmation' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
            }`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${stage === 'dairy_confirmation' ? 'bg-blue-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                2
              </div>
              <div>
                <p className="font-semibold">Dairy Confirmation</p>
                <p className="text-sm text-gray-600">Final lab results</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {stage === 'bmc_collection' && (
        <BMCCollection trip={currentTrip} route={currentRoute} onComplete={handleBMCComplete} />
      )}

      {stage === 'dairy_confirmation' && (
        <DairyConfirmation trip={currentTrip} onConfirm={handleDairyConfirm} />
      )}
    </div>
  );
};

export default ActiveTrip;

