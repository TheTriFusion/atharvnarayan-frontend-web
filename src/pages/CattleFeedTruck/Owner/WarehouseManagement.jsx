import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import axios from 'axios';

const WarehouseManagement = () => {
    const { user } = useAuth();
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: '',
        contact: '',
    });

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/cattle-feed-truck/warehouses', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWarehouses(response.data || []);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingWarehouse) {
                await axios.put(
                    `http://localhost:5000/api/cattle-feed-truck/warehouses/${editingWarehouse._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post('http://localhost:5000/api/cattle-feed-truck/warehouses', formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setShowModal(false);
            resetForm();
            fetchWarehouses();
        } catch (error) {
            console.error('Error saving warehouse:', error);
            alert('Error saving warehouse: ' + error.message);
        }
    };

    const handleEdit = (warehouse) => {
        setEditingWarehouse(warehouse);
        setFormData({
            name: warehouse.name,
            location: warehouse.location,
            capacity: warehouse.capacity || '',
            contact: warehouse.contact || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this warehouse?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/cattle-feed-truck/warehouses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchWarehouses();
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            alert('Error deleting warehouse');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', location: '', capacity: '', contact: '' });
        setEditingWarehouse(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Warehouse Management</h1>
                <Button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    + Add Warehouse
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
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Capacity</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warehouses.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-gray-500">
                                            No warehouses found. Add your first warehouse to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    warehouses.map((warehouse) => (
                                        <tr key={warehouse._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-900">{warehouse.name}</td>
                                            <td className="py-3 px-4 text-gray-600">{warehouse.location}</td>
                                            <td className="py-3 px-4 text-gray-600">{warehouse.capacity || 'N/A'}</td>
                                            <td className="py-3 px-4 text-gray-600">{warehouse.contact || 'N/A'}</td>
                                            <td className="py-3 px-4 text-right">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleEdit(warehouse)}
                                                    className="mr-2"
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(warehouse._id)}
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
                title={editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Warehouse Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                    />
                    <Input
                        label="Capacity (tons)"
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                    <Input
                        label="Contact Number"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
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
                            {editingWarehouse ? 'Update' : 'Create'} Warehouse
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default WarehouseManagement;
