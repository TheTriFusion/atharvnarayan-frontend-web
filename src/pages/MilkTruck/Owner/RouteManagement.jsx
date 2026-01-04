import { useState, useEffect } from 'react';
import { getMilkTruckRoutes, getMilkTruckBMCs, addMilkTruckRoute, updateMilkTruckRoute, deleteMilkTruckRoute } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';

const RouteManagement = () => {
  const { isSuperAdmin } = useAuth();
  const { selectedOwnerId } = useOwner();
  const [routes, setRoutes] = useState([]);
  const [bmcs, setBMCs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
  });
  const [selectedBMCs, setSelectedBMCs] = useState([]);
  const [bmcToAdd, setBMCToAdd] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedOwnerId]);

  const loadData = async () => {
    try {
      const ownerId = isSuperAdmin ? selectedOwnerId : null;
      const [routesData, bmcsData] = await Promise.all([
        getMilkTruckRoutes(ownerId),
        getMilkTruckBMCs(ownerId),
      ]);
      setRoutes(Array.isArray(routesData) ? routesData : []);
      setBMCs(Array.isArray(bmcsData) ? bmcsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setRoutes([]);
      setBMCs([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBMC = () => {
    if (bmcToAdd && !selectedBMCs.includes(bmcToAdd)) {
      setSelectedBMCs(prev => [...prev, bmcToAdd]);
      setBMCToAdd('');
    }
  };

  const handleRemoveBMC = (indexToRemove) => {
    setSelectedBMCs(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const moveBMC = (index, direction) => {
    const newBMCs = [...selectedBMCs];
    if (direction === 'up' && index > 0) {
      [newBMCs[index], newBMCs[index - 1]] = [newBMCs[index - 1], newBMCs[index]];
      setSelectedBMCs(newBMCs);
    } else if (direction === 'down' && index < newBMCs.length - 1) {
      [newBMCs[index], newBMCs[index + 1]] = [newBMCs[index + 1], newBMCs[index]];
      setSelectedBMCs(newBMCs);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedBMCs.length === 0) {
      alert('Please select at least one BMC for the route');
      return;
    }

    const routeData = {
      ...formData,
      bmcSequence: selectedBMCs,
    };

    try {
      if (editingRoute) {
        await updateMilkTruckRoute(editingRoute._id || editingRoute.id, routeData);
      } else {
        await addMilkTruckRoute(routeData);
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Failed to save route: ' + error.message);
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
    });
    // Handle populated BMCs or ID strings
    const bmcIds = route.bmcSequence?.map(b => (typeof b === 'object' ? b._id || b.id : b)) || [];
    setSelectedBMCs(bmcIds);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteMilkTruckRoute(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting route:', error);
        alert('Failed to delete route: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setSelectedBMCs([]);
    setBMCToAdd('');
    setEditingRoute(null);
    setShowForm(false);
  };

  // Filter available BMCs
  const getAvailableBMCs = () => {
    // Get all BMCs currently assigned to other routes
    const assignedBMCs = new Set();
    routes.forEach(route => {
      // If we are editing, we ignore the current route's existing BMCs in the "assigned check"
      // because we might want to keep them or re-add them.
      // But actually, we just need to know which BMCs are used by *other* routes.
      if (editingRoute && (route._id || route.id) === (editingRoute._id || editingRoute.id)) {
        return; // Skip current route
      }
      if (Array.isArray(route.bmcSequence)) {
        route.bmcSequence.forEach(bmc => {
          const bmcId = typeof bmc === 'object' ? (bmc._id || bmc.id) : bmc;
          assignedBMCs.add(bmcId);
        });
      }
    });

    // Return BMCs that are NOT assigned to other routes AND not already selected in current form
    return bmcs.filter(bmc => {
      const bmcId = bmc._id || bmc.id;
      return !assignedBMCs.has(bmcId) && !selectedBMCs.includes(bmcId);
    });
  };

  const availableBMCs = getAvailableBMCs();

  return (
    <div className="container mx-auto px-4 py-8">
      {isSuperAdmin && <OwnerSelector systemType="milkTruck" />}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Route Management</h1>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add New Route
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6" title={editingRoute ? 'Edit Route' : 'Add New Route'}>
          <form onSubmit={handleSubmit}>
            <Input
              label="Route Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Route 1"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add BMCs to Route
              </label>
              <div className="flex gap-2 mb-4">
                <div className="flex-grow">
                  <Select
                    name="bmcToAdd"
                    value={bmcToAdd}
                    onChange={(e) => setBMCToAdd(e.target.value)}
                    options={[
                      { value: '', label: 'Select a BMC' },
                      ...availableBMCs.map(b => ({ value: b._id || b.id, label: `${b.name} (${b.location})` }))
                    ]}
                    placeholder="Select a BMC to add"
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleAddBMC}
                  disabled={!bmcToAdd}
                  className="whitespace-nowrap h-10 mt-1"
                >
                  Add BMC
                </Button>
              </div>

              {selectedBMCs.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Route Sequence (Order matters):</p>
                  <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {selectedBMCs.map((bmcId, index) => {
                      const bmc = bmcs.find(b => (b._id || b.id) === bmcId);
                      return (
                        <div key={bmcId} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border border-gray-200">
                          <span className="text-sm font-medium text-gray-800">
                            {index + 1}. {bmc?.name || 'Unknown'} <span className="text-gray-500 font-normal">- {bmc?.location}</span>
                          </span>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => moveBMC(index, 'up')}
                              disabled={index === 0}
                              className="text-xs px-2 py-1"
                            >
                              ↑
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => moveBMC(index, 'down')}
                              disabled={index === selectedBMCs.length - 1}
                              className="text-xs px-2 py-1"
                            >
                              ↓
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              onClick={() => handleRemoveBMC(index)}
                              className="text-xs px-2 py-1"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {selectedBMCs.length === 0 && (
                <p className="text-sm text-gray-500 italic mt-2">No BMCs added yet. Select and add BMCs above.</p>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <Button type="submit" variant="primary">
                {editingRoute ? 'Update' : 'Add'} Route
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Route List">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BMC Sequence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(routes) || routes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                    No routes found. Add your first route to get started.
                  </td>
                </tr>
              ) : (
                routes.map((route) => {
                  const routeBMCs = Array.isArray(route.bmcSequence) ? route.bmcSequence.map(id => {
                    const bmcId = typeof id === 'object' ? (id._id || id.id) : id;
                    const bmcObj = typeof id === 'object' ? id : (Array.isArray(bmcs) ? bmcs.find(b => (b._id || b.id) === bmcId) : null);
                    return bmcObj?.name || 'Unknown';
                  }).join(' → ') : '';

                  return (
                    <tr key={route._id || route.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{route.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{routeBMCs}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(route)}
                            className="text-xs px-2 py-1"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(route._id || route.id)}
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RouteManagement;
