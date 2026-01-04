import { useState, useEffect } from 'react';
import { useOwner } from '../../contexts/OwnerContext';
import { getCattleFeedOwners, getMilkTruckOwners } from '../../utils/storage';
import Select from '../common/Select';
import Button from '../common/Button';

const OwnerSelector = ({ systemType = 'both' }) => {
  const { selectedOwnerId, selectedOwnerData, ownerType, selectOwner, clearOwner } = useOwner();
  const [cattleFeedOwners, setCattleFeedOwners] = useState([]);
  const [milkTruckOwners, setMilkTruckOwners] = useState([]);
  const [selectedType, setSelectedType] = useState(ownerType || 'cattleFeed');
  const [selectedId, setSelectedId] = useState(selectedOwnerId || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    setLoading(true);
    try {
      const [cfOwners, mtOwners] = await Promise.all([
        getCattleFeedOwners(),
        getMilkTruckOwners(),
      ]);
      setCattleFeedOwners(cfOwners);
      setMilkTruckOwners(mtOwners);
    } catch (error) {
      console.error('Error loading owners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!selectedId) {
      clearOwner();
      return;
    }

    const owners = selectedType === 'cattleFeed' ? cattleFeedOwners : milkTruckOwners;
    const owner = owners.find((o) => o._id === selectedId);
    
    if (owner) {
      selectOwner(selectedId, owner, selectedType);
    }
  };

  const handleClear = () => {
    setSelectedId('');
    setSelectedType('cattleFeed');
    clearOwner();
  };

  const currentOwners = selectedType === 'cattleFeed' ? cattleFeedOwners : milkTruckOwners;
  const ownerOptions = currentOwners.map((owner) => ({
    value: owner._id,
    label: `${owner.name} - ${owner.phoneNumber}`,
  }));

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">System Type</label>
          <div className="flex gap-2">
            {(systemType === 'both' || systemType === 'cattleFeed') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedType('cattleFeed');
                  setSelectedId('');
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedType === 'cattleFeed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cattle Feed
              </button>
            )}
            {(systemType === 'both' || systemType === 'milkTruck') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedType('milkTruck');
                  setSelectedId('');
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedType === 'milkTruck'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Milk Truck
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-[250px]">
          <Select
            label="Select Owner"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            options={ownerOptions}
            placeholder={loading ? 'Loading owners...' : 'Select an owner to manage'}
            disabled={loading}
          />
        </div>

        <div className="flex gap-2 items-end">
          <Button variant="primary" onClick={handleApply} className="whitespace-nowrap">
            Apply Filter
          </Button>
          {selectedOwnerId && (
            <Button variant="secondary" onClick={handleClear} className="whitespace-nowrap">
              Clear Filter
            </Button>
          )}
        </div>
      </div>

      {selectedOwnerData && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Currently Managing:</p>
              <p className="text-lg font-semibold text-blue-600">
                {selectedOwnerData.name} ({ownerType === 'cattleFeed' ? 'Cattle Feed' : 'Milk Truck'})
              </p>
              <p className="text-sm text-gray-600">{selectedOwnerData.phoneNumber}</p>
            </div>
          </div>
        </div>
      )}

      {!selectedOwnerId && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Select an owner to view and manage their specific data. When no owner is
            selected, you'll see aggregated data from all owners.
          </p>
        </div>
      )}
    </div>
  );
};

export default OwnerSelector;

