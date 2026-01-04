import { useState, useEffect } from 'react';
import { getMilkTruckVehicles, getMilkTruckDrivers, addMilkTruckVehicle, updateMilkTruckVehicle, deleteMilkTruckVehicle } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';

const VehicleManagement = () => {
  const { isSuperAdmin } = useAuth();
  const { selectedOwnerId } = useOwner();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    capacity: '',
    assignedDriver: '',
  });

  useEffect(() => {
    loadData();
  }, [selectedOwnerId]);

  const loadData = async () => {
    try {
      const ownerId = isSuperAdmin ? selectedOwnerId : null;
      const [vehiclesData, driversData] = await Promise.all([
        getMilkTruckVehicles(ownerId),
        getMilkTruckDrivers(ownerId),
      ]);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setDrivers(Array.isArray(driversData) ? driversData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setVehicles([]);
      setDrivers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const vehicleData = {
      ...formData,
      capacity: parseFloat(formData.capacity),
      assignedDriver: formData.assignedDriver || null,
    };
    
    try {
      if (editingVehicle) {
        await updateMilkTruckVehicle(editingVehicle._id || editingVehicle.id, vehicleData);
      } else {
        await addMilkTruckVehicle(vehicleData);
      }
      
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Failed to save vehicle: ' + error.message);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      registrationNumber: vehicle.registrationNumber,
      capacity: vehicle.capacity.toString(),
      assignedDriver: vehicle.assignedDriver || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteMilkTruckVehicle(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Failed to delete vehicle: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ registrationNumber: '', capacity: '', assignedDriver: '' });
    setEditingVehicle(null);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isSuperAdmin && <OwnerSelector systemType="milkTruck" />}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Vehicle Management</h1>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add New Vehicle
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6" title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}>
          <form onSubmit={handleSubmit}>
            <Input
              label="Registration Number"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              required
              placeholder="e.g., MH-12-ABCD"
            />
            <Input
              label="Capacity (Liters)"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter capacity"
            />
            <Select
              label="Assigned Driver"
              name="assignedDriver"
              value={formData.assignedDriver}
              onChange={handleInputChange}
              options={drivers.map(d => ({ value: d._id || d.id, label: d.name }))}
              placeholder="Select a driver (optional)"
            />
            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                {editingVehicle ? 'Update' : 'Add'} Vehicle
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Vehicle List">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity (L)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(vehicles) || vehicles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No vehicles found. Add your first vehicle to get started.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => {
                  const driver = Array.isArray(drivers) ? drivers.find(d => (d._id || d.id) === vehicle.assignedDriver) : null;
                  return (
                    <tr key={vehicle._id || vehicle.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{vehicle.registrationNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{vehicle.capacity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {driver?.name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(vehicle)}
                          className="text-xs px-2 py-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(vehicle._id || vehicle.id)}
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

export default VehicleManagement;

