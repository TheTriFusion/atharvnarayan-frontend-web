import { useState, useEffect } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import axios from 'axios';

const DriverManagement = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        licenseNumber: '',
        address: '',
        password: '',
    });

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/cattle-feed-truck/drivers', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDrivers(response.data || []);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            if (editingDriver) {
                // For editing, only include password if it's provided
                const updateData = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await axios.put(
                    `http://localhost:5000/api/cattle-feed-truck/drivers/${editingDriver._id}`,
                    updateData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // For creating new driver
                const data = {
                    ...formData,
                    role: 'cattleFeedTruckDriver',
                    systemType: 'cattleFeedTruck',
                    password: formData.password || formData.phoneNumber, // Use provided password or default to phone number
                };
                await axios.post('http://localhost:5000/api/cattle-feed-truck/drivers', data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setShowModal(false);
            resetForm();
            fetchDrivers();
        } catch (error) {
            console.error('Error saving driver:', error);
            alert('Error: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (driver) => {
        setEditingDriver(driver);
        setFormData({
            name: driver.name,
            phoneNumber: driver.phoneNumber,
            licenseNumber: driver.licenseNumber || '',
            address: driver.address || '',
            password: '', // Leave empty for editing
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this driver?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/cattle-feed-truck/drivers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDrivers();
        } catch (error) {
            console.error('Error deleting driver:', error);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', phoneNumber: '', licenseNumber: '', address: '', password: '' });
        setEditingDriver(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Driver Management</h1>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>+ Add Driver</Button>
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
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">License Number</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drivers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-gray-500">
                                            No drivers found. Add your first driver to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    drivers.map((driver) => (
                                        <tr key={driver._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-900">{driver.name}</td>
                                            <td className="py-3 px-4 text-gray-600">{driver.phoneNumber}</td>
                                            <td className="py-3 px-4 text-gray-600">{driver.licenseNumber || 'N/A'}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs ${driver.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {driver.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(driver)} className="mr-2">Edit</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(driver._id)}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingDriver ? 'Edit Driver' : 'Add Driver'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Driver Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="Phone Number" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} required />
                    <Input label="License Number" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} />
                    <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    <Input
                        label={editingDriver ? "Password (leave empty to keep current)" : "Password"}
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingDriver}
                        placeholder={editingDriver ? "Leave empty to keep current password" : "Enter password"}
                    />
                    {!editingDriver && !formData.password && <p className="text-sm text-gray-500">If left empty, default password will be same as phone number</p>}
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
                        <Button type="submit">{editingDriver ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DriverManagement;
