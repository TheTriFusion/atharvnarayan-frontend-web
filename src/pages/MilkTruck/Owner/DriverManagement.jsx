import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMilkTruckDrivers, getMilkTruckVehicles, getMilkTruckTrips, addMilkTruckDriver, updateMilkTruckDriver, deleteMilkTruckDriver } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';

const DriverManagement = () => {
  const { isSuperAdmin } = useAuth();
  const { selectedOwnerId } = useOwner();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    phoneNumber: '',
    password: '',
  });
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  useEffect(() => {
    loadData();
  }, [selectedOwnerId]);

  const loadData = async () => {
    try {
      const ownerId = isSuperAdmin ? selectedOwnerId : null;
      const [driversData, vehiclesData, tripsData] = await Promise.all([
        getMilkTruckDrivers(ownerId),
        getMilkTruckVehicles(ownerId),
        getMilkTruckTrips(ownerId),
      ]);
      setDrivers(Array.isArray(driversData) ? driversData : []);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setTrips(Array.isArray(tripsData) ? tripsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setDrivers([]);
      setVehicles([]);
      setTrips([]);
    }
  };

  const handleViewTrips = (driverId) => {
    navigate(`/milk-truck/owner/drivers/${driverId}/trips`);
  };

  const getDriverTripStats = (driverId) => {
    const driverTrips = trips.filter(t => {
      const tripDriverId = t.driverId?._id || t.driverId?.id || t.driverId;
      return tripDriverId === driverId;
    });
    return {
      total: driverTrips.length,
      completed: driverTrips.filter(t => t.status === 'completed').length,
      active: driverTrips.filter(t => t.status === 'in_progress').length,
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVehicleToggle = (vehicleId) => {
    setSelectedVehicles(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const driverData = {
      ...formData,
      assignedVehicles: selectedVehicles,
    };
    
    try {
      if (editingDriver) {
        await updateMilkTruckDriver(editingDriver._id || editingDriver.id, driverData);
      } else {
        await addMilkTruckDriver(driverData);
      }
      
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving driver:', error);
      alert('Failed to save driver: ' + error.message);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      phoneNumber: driver.phoneNumber || '',
      password: driver.password || '',
    });
    setSelectedVehicles(driver.assignedVehicles || []);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await deleteMilkTruckDriver(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting driver:', error);
        alert('Failed to delete driver: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', licenseNumber: '', phoneNumber: '', password: '' });
    setSelectedVehicles([]);
    setEditingDriver(null);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isSuperAdmin && <OwnerSelector systemType="milkTruck" />}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Driver Management</h1>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add New Driver
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6" title={editingDriver ? 'Edit Driver' : 'Add New Driver'}>
          <form onSubmit={handleSubmit}>
            <Input
              label="Driver Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter driver name"
            />
            <Input
              label="License Number"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              required
              placeholder="Enter license number"
            />
            <Input
              label="Phone Number"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              placeholder="Enter phone number"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter password"
            />
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Vehicles
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {vehicles.map((vehicle) => (
                  <label key={vehicle.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={() => handleVehicleToggle(vehicle.id)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {vehicle.registrationNumber} ({vehicle.capacity}L)
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                {editingDriver ? 'Update' : 'Add'} Driver
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Driver List">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Trips</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Vehicles</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(drivers) || drivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No drivers found. Add your first driver to get started.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => {
                  const assignedVehicles = Array.isArray(vehicles) ? vehicles.filter(v => 
                    driver.assignedVehicles?.includes(v._id || v.id)
                  ) : [];
                  const tripStats = getDriverTripStats(driver._id || driver.id);
                  return (
                    <tr key={driver._id || driver.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{driver.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{driver.phoneNumber || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{driver.licenseNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tripStats.total}</span>
                        <span className="text-xs text-gray-500">
                          ({tripStats.completed} completed, {tripStats.active} active)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {assignedVehicles.length > 0
                        ? assignedVehicles.map(v => v.registrationNumber).join(', ')
                        : 'None'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          onClick={() => handleViewTrips(driver._id || driver.id)}
                          className="text-xs px-2 py-1"
                        >
                          View Trips
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(driver)}
                          className="text-xs px-2 py-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(driver._id || driver.id)}
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

export default DriverManagement;

