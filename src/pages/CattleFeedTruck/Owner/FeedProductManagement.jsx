import { useState, useEffect } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import axios from 'axios';

const FeedProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        pricePerUnit: '',
        unit: 'kg',
        description: '',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://api.thetrifusion.in/api/cattle-feed-truck/feed-products', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingProduct) {
                await axios.put(
                    `https://api.thetrifusion.in/api/cattle-feed-truck/feed-products/${editingProduct._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post('https://api.thetrifusion.in/api/cattle-feed-truck/feed-products', formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error: ' + error.message);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category || '',
            pricePerUnit: product.pricePerUnit || '',
            unit: product.unit || 'kg',
            description: product.description || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://api.thetrifusion.in/api/cattle-feed-truck/feed-products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', category: '', pricePerUnit: '', unit: 'kg', description: '' });
        setEditingProduct(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Feed Products</h1>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>+ Add Product</Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length === 0 ? (
                        <Card className="col-span-full">
                            <div className="text-center py-8 text-gray-500">No products found. Add your first product.</div>
                        </Card>
                    ) : (
                        products.map((product) => (
                            <Card key={product._id}>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                                <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Category:</span> {product.category || 'N/A'}</p>
                                <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Price:</span> ₹{product.pricePerUnit || 'N/A'} / {product.unit}</p>
                                {product.description && <p className="text-sm text-gray-600 mb-4">{product.description}</p>}
                                <div className="flex gap-2 mt-4">
                                    <Button variant="secondary" size="sm" onClick={() => handleEdit(product)}>Edit</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(product._id)}>Delete</Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingProduct ? 'Edit Product' : 'Add Product'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Cattle Feed, Poultry Feed" />
                    <Input label="Price per Unit" type="number" step="0.01" value={formData.pricePerUnit} onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })} required />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="kg">Kilogram (kg)</option>
                            <option value="ton">Ton</option>
                            <option value="bag">Bag</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows="3" />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</Button>
                        <Button type="submit">{editingProduct ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FeedProductManagement;
