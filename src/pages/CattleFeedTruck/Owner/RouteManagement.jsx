import { useState, useEffect } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import axios from 'axios';

const RouteManagement = () => {
    const [routes, setRoutes] = useState([]);
    const [deliveryPoints, setDeliveryPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        startPoint: '',
        deliveryPoints: [],
        estimatedDistance: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [routesRes, pointsRes] = await Promise.all([
                axios.get('http://15.206.212.140:5000/api/cattle-feed-truck/routes', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://15.206.212.140:5000/api/cattle-feed-truck/delivery-points', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setRoutes(routesRes.data || []);
            setDeliveryPoints(pointsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingRoute) {
                await axios.put(`http://15.206.212.140:5000/api/cattle-feed-truck/routes/${editingRoute._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post('http://15.206.212.140:5000/api/cattle-feed-truck/routes', formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving route:', error);
            alert('Error: ' + error.message);
        }
    };

    const handleEdit = (route) => {
        setEditingRoute(route);
        setFormData({
            name: route.name,
            startPoint: route.startPoint || '',
            deliveryPoints: route.deliveryPoints?.map(p => p._id || p) || [],
            estimatedDistance: route.estimatedDistance || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://15.206.212.140:5000/api/cattle-feed-truck/routes/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
        } catch (error) {
            console.error('Error deleting route:', error);
        }
    };

    const toggleDeliveryPoint = (pointId) => {
        setFormData(prev => ({
            ...prev,
            deliveryPoints: prev.deliveryPoints.includes(pointId)
                ? prev.deliveryPoints.filter(p => p !== pointId)
                : [...prev.deliveryPoints, pointId]
        }));
    };

    const resetForm = () => {
        setFormData({ name: '', startPoint: '', deliveryPoints: [], estimatedDistance: '' });
        setEditingRoute(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Route Management</h1>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>+ Add Route</Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {routes.length === 0 ? (
                        <Card className="col-span-full">
                            <div className="text-center py-8 text-gray-500">No routes found. Create your first route.</div>
                        </Card>
                    ) : (
                        routes.map((route) => (
                            <Card key={route._id}>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{route.name}</h3>
                                <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Start:</span> {route.startPoint || 'N/A'}</p>
                                <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Stops:</span> {route.deliveryPoints?.length || 0} delivery points</p>
                                <p className="text-sm text-gray-600 mb-4"><span className="font-medium">Distance:</span> {route.estimatedDistance || 'N/A'} km</p>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => handleEdit(route)}>Edit</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(route._id)}>Delete</Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingRoute ? 'Edit Route' : 'Add Route'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Route Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="Start Point" value={formData.startPoint} onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })} />
                    <Input label="Estimated Distance (km)" type="number" step="0.1" value={formData.estimatedDistance} onChange={(e) => setFormData({ ...formData, estimatedDistance: e.target.value })} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Points</label>
                        <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                            {deliveryPoints.length === 0 ? (
                                <p className="text-sm text-gray-500">No delivery points available</p>
                            ) : (
                                deliveryPoints.map(point => (
                                    <label key={point._id} className="flex items-center py-2 hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.deliveryPoints.includes(point._id)}
                                            onChange={() => toggleDeliveryPoint(point._id)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">{point.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
                        <Button type="submit">{editingRoute ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RouteManagement;
