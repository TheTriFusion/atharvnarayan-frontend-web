import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import axios from 'axios';

const VehicleManagement = () => {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [formData, setFormData] = useState({
        registrationNumber: '',
        vehicleType: '',
        capacity: '',
        driverAssigned: '',
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/cattle-feed-truck/vehicles', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVehicles(response.data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const vehicleData = {
                ...formData,
                ownerId: user._id, // Add ownerId automatically
            };

            if (editingVehicle) {
                await axios.put(
                    `http://localhost:5000/api/cattle-feed-truck/vehicles/${editingVehicle._id}`,
                    vehicleData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post('http://localhost:5000/api/cattle-feed-truck/vehicles', vehicleData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setShowModal(false);
            resetForm();
            fetchVehicles();
        } catch (error) {
            console.error('Error saving vehicle:', error);
            alert('Error saving vehicle: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            registrationNumber: vehicle.registrationNumber,
            vehicleType: vehicle.vehicleType,
            capacity: vehicle.capacity || '',
            driverAssigned: vehicle.driverAssigned || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/cattle-feed-truck/vehicles/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchVehicles();
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Error deleting vehicle');
        }
    };

    const resetForm = () => {
        setFormData({ registrationNumber: '', vehicleType: '', capacity: '', driverAssigned: '' });
        setEditingVehicle(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Vehicle Management</h1>
                <Button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    + Add Vehicle
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Registration Number</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Capacity</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-gray-500">
                                            No vehicles found. Add your first vehicle to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    vehicles.map((vehicle) => (
                                        <tr key={vehicle._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-900">{vehicle.registrationNumber}</td>
                                            <td className="py-3 px-4 text-gray-600">{vehicle.vehicleType}</td>
                                            <td className="py-3 px-4 text-gray-600">{vehicle.capacity || 'N/A'} tons</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${vehicle.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {vehicle.status || 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleEdit(vehicle)}
                                                    className="mr-2"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(vehicle._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    resetForm();
                }}
                title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Registration Number"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                        <select
                            value={formData.vehicleType}
                            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        >
                            <option value="">Select Vehicle Type</option>
                            <option value="mini_truck">Mini Truck</option>
                            <option value="pickup">Pickup</option>
                            <option value="large_truck">Large Truck</option>
                            <option value="trailer">Trailer</option>
                        </select>
                    </div>
                    <Input
                        label="Capacity (tons)"
                        type="number"
                        step="0.1"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        required
                    />
                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingVehicle ? 'Update' : 'Create'} Vehicle
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default VehicleManagement;
