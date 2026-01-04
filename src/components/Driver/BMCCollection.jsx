import { useState, useEffect } from 'react';
import { getMilkTruckRoutes, getMilkTruckTrip, updateMilkTruckTrip, getMilkTruckPricing, addBMCCollectionEntry } from '../../utils/storage';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const BMCCollection = ({ trip, route, onComplete }) => {
  // Use passed route directly
  const currentRoute = route;
  const routeBMCs = currentRoute?.bmcSequence || [];



  const [selectedBMCId, setSelectedBMCId] = useState('');
  const [formData, setFormData] = useState({
    milkQuantity: '',
    fatContent: '',
    snfContent: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tripData, setTripData] = useState(trip);

  // Refresh trip data
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const updatedTrip = await getMilkTruckTrip(trip.id || trip._id);
        if (updatedTrip) {
          setTripData(updatedTrip);
        }
      } catch (error) {
        console.error('Error refreshing trip:', error);
      }
    };

    if (trip.id || trip._id) {
      fetchTrip();
    }
  }, [trip.id || trip._id]);

  // Check if BMC is collected
  const isBMCCollected = (bmcId) => {
    if (!bmcId) return false;

    const entry = tripData.bmcEntries.find(e => {
      if (!e.bmcId) return false;
      const entryBMCId = e.bmcId._id || e.bmcId.id || e.bmcId;
      if (!entryBMCId) return false;
      return entryBMCId.toString() === bmcId.toString();
    });
    return !!(entry && entry.collectionData);
  };

  // Get uncollected BMCs
  const uncollectedBMCs = routeBMCs.filter(bmc => !isBMCCollected(bmc.id || bmc._id));

  const selectedBMCEntry = tripData.bmcEntries.find(e => e.bmcId === selectedBMCId);

  const handleBMCCardClick = (bmcId) => {
    // if (isBMCCollected(bmcId)) return; // Allow re-opening for view/edit

    setSelectedBMCId(bmcId);
    setError('');
    setSuccessMessage('');

    const entry = tripData.bmcEntries.find(e => e.bmcId === bmcId);

    if (entry && entry.collectionData) {
      setFormData({
        milkQuantity: entry.collectionData.milkQuantity.toString(),
        fatContent: entry.collectionData.fatContent.toString(),
        snfContent: entry.collectionData.snfContent.toString(),
      });
    } else {
      setFormData({ milkQuantity: '', fatContent: '', snfContent: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBMCId) {
      setError('Please select a BMC');
      return;
    }

    if (!formData.milkQuantity || !formData.fatContent || !formData.snfContent) {
      setError('Please fill in all fields');
      return;
    }

    const collectionEntry = {
      bmcId: selectedBMCId,
      milkQuantity: parseFloat(formData.milkQuantity),
      fatContent: parseFloat(formData.fatContent),
      snfContent: parseFloat(formData.snfContent),
    };

    try {
      const updatedTrip = await addBMCCollectionEntry(trip.id || trip._id, collectionEntry);

      if (updatedTrip) {
        setTripData(updatedTrip);
        setSuccessMessage('Collection data saved successfully!');
        setError('');

        // Send notification to owner
        sendNotificationToOwner(routeBMCs.find(b => (b.id || b._id) === selectedBMCId)?.name, collectionEntry);

        // Auto-clear selection after delay
        setTimeout(() => {
          setSelectedBMCId('');
          setFormData({ milkQuantity: '', fatContent: '', snfContent: '' });
          setSuccessMessage('');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('already submitted')) {
        setError('This BMC has already been collected.');
      } else {
        setError('Failed to save collection data. Please try again.');
      }
    }
  };


  const sendNotificationToOwner = (bmcName, data) => {
    const notifications = JSON.parse(localStorage.getItem('ownerNotifications') || '[]');

    const message = `${bmcName} - Collected ${data.milkQuantity}L (Fat: ${data.fatContent}%, SNF: ${data.snfContent}%)`;

    notifications.unshift({
      id: `notif-${Date.now()}`,
      type: 'bmc_collection',
      tripId: trip.id,
      bmcId: selectedBMCId,
      bmcName,
      message,
      timestamp: new Date().toISOString(),
      collectionData: data,
    });

    localStorage.setItem('ownerNotifications', JSON.stringify(notifications.slice(0, 50)));
  };

  // Check completion
  const allCollected = routeBMCs.every(bmc => isBMCCollected(bmc.id || bmc._id));

  useEffect(() => {
    if (allCollected) {
      setTimeout(() => {
        onComplete(tripData);
      }, 2000);
    }
  }, [allCollected, tripData]);

  // Auto-select first uncollected BMC
  useEffect(() => {
    // Only auto-select if we have data, nothing is currently selected, and we have work to do
    if (uncollectedBMCs.length > 0 && !selectedBMCId) {
      const nextBMC = uncollectedBMCs[0];
      // Use a timeout to ensure state is stable and give a nice transition effect
      const timer = setTimeout(() => {
        handleBMCCardClick(nextBMC.id || nextBMC._id);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [uncollectedBMCs, selectedBMCId]);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card title="BMC Collection Progress">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {tripData.bmcEntries.filter(e => e.collectionData).length} of {routeBMCs.length} BMCs visited
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(tripData.bmcEntries.filter(e => e.collectionData).length / routeBMCs.length) * 100}%` }}
            />
          </div>
        </div>

        {uncollectedBMCs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {uncollectedBMCs.map((bmc) => {
              const bmcId = bmc.id || bmc._id;
              const isSelected = selectedBMCId === bmcId;
              const isCollected = isBMCCollected(bmcId);

              return (
                <div
                  key={bmcId}
                  onClick={() => handleBMCCardClick(bmcId)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative ${isSelected
                    ? 'border-blue-500 shadow-lg scale-105 z-10'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    } ${isCollected ? 'bg-green-50' : 'bg-white'}
                  `}
                >
                  {isCollected && (
                    <div className="absolute top-2 right-2 text-green-600 bg-green-100 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <p className="text-sm font-semibold text-gray-800 mb-1 pr-4">{bmc.name}</p>
                  <p className="text-xs text-gray-600">{bmc.location}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No BMCs assigned to this route.
          </div>
        )}

        {allCollected && !selectedBMCId && (
          <div className="mt-6 text-center py-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-semibold animate-pulse">
            ✓ All collections completed! Proceeding to Dairy...
          </div>
        )}
      </Card>

      {/* Entry Form */}
      {selectedBMCId && (
        <Card title={`Enter Collection Data - ${routeBMCs.find(b => (b.id || b._id) === selectedBMCId)?.name}`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Milk Quantity (Liters) *"
                type="number"
                name="milkQuantity"
                value={formData.milkQuantity}
                onChange={(e) => setFormData({ ...formData, milkQuantity: e.target.value })}
                required
                min="0"
                step="0.01"
                autoFocus
              />

              <Input
                label="Fat Content (%) *"
                type="number"
                name="fatContent"
                value={formData.fatContent}
                onChange={(e) => setFormData({ ...formData, fatContent: e.target.value })}
                required
                min="0"
                max="100"
                step="0.01"
              />

              <Input
                label="SNF Content (%) *"
                type="number"
                name="snfContent"
                value={formData.snfContent}
                onChange={(e) => setFormData({ ...formData, snfContent: e.target.value })}
                required
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
            >
              Save & Notify Owner
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default BMCCollection;
