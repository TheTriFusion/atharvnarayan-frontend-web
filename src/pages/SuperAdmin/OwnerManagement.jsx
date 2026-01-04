import { useState } from 'react';
import Card from '../../components/common/Card';
import CattleFeedOwnerManagement from './CattleFeedOwnerManagement';
import MilkTruckOwnerManagement from './MilkTruckOwnerManagement';
import CattleFeedTruckOwnerManagement from './CattleFeedTruckOwnerManagement';

const OwnerManagement = () => {
  const [activeTab, setActiveTab] = useState('cattle-feed');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Owner Management</h1>

      <Card>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('cattle-feed')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'cattle-feed'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            🌾 Cattle Feed Shop Owners
          </button>
          <button
            onClick={() => setActiveTab('milk-truck')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'milk-truck'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            🥛 Milk Truck Owners
          </button>
          <button
            onClick={() => setActiveTab('cattle-feed-truck')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'cattle-feed-truck'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            🚚 Cattle Feed Truck Owners
          </button>
        </div>
      </Card>

      <div>
        {activeTab === 'cattle-feed' && <CattleFeedOwnerManagement />}
        {activeTab === 'milk-truck' && <MilkTruckOwnerManagement />}
        {activeTab === 'cattle-feed-truck' && <CattleFeedTruckOwnerManagement />}
      </div>
    </div>
  );
};

export default OwnerManagement;

