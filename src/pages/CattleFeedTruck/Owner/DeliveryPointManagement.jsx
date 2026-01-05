import { useState, useEffect } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import axios from 'axios';

const DeliveryPointManagement = () => {
    const [deliveryPoints, setDeliveryPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPoint, setEditingPoint] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        fetchDeliveryPoints();
    }, []);

    const fetchDeliveryPoints = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://15.206.212.140:5000/api/cattle-feed-truck/delivery-points', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDeliveryPoints(response.data || []);
        } catch (error) {
            console.error('Error fetching delivery points:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingPoint) {
                await axios.put(
                    `http://15.206.212.140:5000/api/cattle-feed-truck/delivery-points/${editingPoint._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post('http://15.206.212.140:5000/api/cattle-feed-truck/delivery-points', formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setShowModal(false);
            resetForm();
            fetchDeliveryPoints();
        } catch (error) {
            console.error('Error saving delivery point:', error);
            alert('Error: ' + error.message);
        }
    };

    const handleEdit = (point) => {
        setEditingPoint(point);
        setFormData({
            name: point.name,
            contactPerson: point.contactPerson || '',
            phone: point.phone || '',
            address: point.address || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://15.206.212.140:5000/api/cattle-feed-truck/delivery-points/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDeliveryPoints();
        } catch (error) {
            console.error('Error deleting delivery point:', error);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', contactPerson: '', phone: '', address: '' });
        setEditingPoint(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Delivery Points</h1>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>+ Add Delivery Point</Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deliveryPoints.length === 0 ? (
                        <Card className="col-span-full">
                            <div className="text-center py-8 text-gray-500">
                                No delivery points found. Add your first delivery point.
                            </div>
                        </Card>
                    ) : (
                        deliveryPoints.map((point) => (
                            <Card key={point._id}>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{point.name}</h3>
                                <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Contact:</span> {point.contactPerson || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Phone:</span> {point.phone || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    <span className="font-medium">Address:</span> {point.address || 'N/A'}
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => handleEdit(point)}>Edit</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(point._id)}>Delete</Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingPoint ? 'Edit Delivery Point' : 'Add Delivery Point'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="Contact Person" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
                    <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
                        <Button type="submit">{editingPoint ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DeliveryPointManagement;
