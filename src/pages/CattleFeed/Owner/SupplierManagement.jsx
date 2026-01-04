import { useState, useEffect } from 'react';
import {
    getSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getPurchaseOrders,
    addPurchaseOrder
} from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import Select from '../../../components/common/Select';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';

const SupplierManagement = () => {
    const { isSuperAdmin } = useAuth();
    const { selectedOwnerId } = useOwner();
    const { success, error: showError } = useToast();

    const [activeTab, setActiveTab] = useState('suppliers');
    const [suppliers, setSuppliers] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Supplier Form State
    const [showSupplierForm, setShowSupplierForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [supplierData, setSupplierData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        gstNumber: '',
        productsSupplied: '', // comma separated for input
        address: { city: '', state: '' }
    });

    // Purchase Order Form State
    const [showPOForm, setShowPOForm] = useState(false);
    const [poData, setPoData] = useState({
        supplierId: '',
        items: [],
        totalAmount: 0,
        status: 'received',
        paymentStatus: 'pending'
    });
    const [poItem, setPoItem] = useState({ productName: '', quantity: '', pricePerUnit: '' });

    useEffect(() => {
        loadData();
    }, [selectedOwnerId, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const ownerId = isSuperAdmin ? selectedOwnerId : null;
            if (activeTab === 'suppliers') {
                const data = await getSuppliers(ownerId);
                setSuppliers(data);
            } else {
                const [supData, poData] = await Promise.all([
                    getSuppliers(ownerId),
                    getPurchaseOrders(ownerId)
                ]);
                setSuppliers(supData);
                setPurchaseOrders(poData);
            }
        } catch (e) {
            showError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSupplierSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...supplierData,
                productsSupplied: supplierData.productsSupplied.split(',').map(s => s.trim()).filter(Boolean)
            };
            if (editingSupplier) {
                await updateSupplier(editingSupplier._id || editingSupplier.id, payload);
                success('Supplier updated');
            } else {
                await addSupplier(payload);
                success('Supplier added');
            }
            setShowSupplierForm(false);
            loadData();
        } catch (e) {
            showError(e.message);
        }
    };

    const handlePOSubmit = async (e) => {
        e.preventDefault();
        try {
            if (poData.items.length === 0) return showError('Add at least one item');

            await addPurchaseOrder(poData);
            success('Purchase Order Created');
            setShowPOForm(false);
            loadData();
        } catch (e) {
            showError(e.message);
        }
    };

    const addPOItem = () => {
        if (!poItem.productName || !poItem.quantity || !poItem.pricePerUnit) return;
        const newItem = {
            ...poItem,
            quantity: Number(poItem.quantity),
            pricePerUnit: Number(poItem.pricePerUnit),
            totalPrice: Number(poItem.quantity) * Number(poItem.pricePerUnit)
        };

        setPoData(prev => ({
            ...prev,
            items: [...prev.items, newItem],
            totalAmount: prev.totalAmount + newItem.totalPrice
        }));
        setPoItem({ productName: '', quantity: '', pricePerUnit: '' });
    };

    return (
        <div className="space-y-6">
            {isSuperAdmin && <OwnerSelector systemType="cattleFeed" />}

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Supplier Management</h1>
                <div className="flex gap-2">
                    <Button onClick={() => {
                        if (activeTab === 'suppliers') {
                            setEditingSupplier(null);
                            setSupplierData({ name: '', contactPerson: '', phone: '', email: '', gstNumber: '', productsSupplied: '', address: { city: '', state: '' } });
                            setShowSupplierForm(true);
                        } else {
                            setPoData({ supplierId: '', items: [], totalAmount: 0, status: 'received', paymentStatus: 'pending' });
                            setShowPOForm(true);
                        }
                    }}>
                        {activeTab === 'suppliers' ? 'Add Supplier' : 'New Purchase'}
                    </Button>
                </div>
            </div>

            <div className="flex space-x-4 border-b">
                <button
                    className={`py-2 px-4 ${activeTab === 'suppliers' ? 'border-b-2 border-blue-500 text-blue-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('suppliers')}
                >
                    Suppliers List
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'purchases' ? 'border-b-2 border-blue-500 text-blue-600 font-bold' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('purchases')}
                >
                    Purchase History
                </button>
            </div>

            {activeTab === 'suppliers' && (
                <Card>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Contact</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Total Purchases</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {suppliers.map(s => (
                                <tr key={s._id || s.id}>
                                    <td className="px-4 py-3">{s.name}</td>
                                    <td className="px-4 py-3">{s.contactPerson}</td>
                                    <td className="px-4 py-3">{s.phone}</td>
                                    <td className="px-4 py-3 text-center">{s.totalPurchases || 0}</td>
                                    <td className="px-4 py-3">
                                        <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => {
                                            setEditingSupplier(s);
                                            setSupplierData({
                                                ...s,
                                                productsSupplied: s.productsSupplied?.join(', ') || '',
                                                address: s.address || { city: '', state: '' }
                                            });
                                            setShowSupplierForm(true);
                                        }}>Edit</Button>
                                        <Button variant="danger" className="px-2 py-1 text-xs ml-2" onClick={async () => {
                                            if (window.confirm('Delete?')) {
                                                await deleteSupplier(s._id || s.id);
                                                loadData();
                                            }
                                        }}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                            {suppliers.length === 0 && <tr><td colSpan="5" className="text-center py-4">No suppliers found</td></tr>}
                        </tbody>
                    </table>
                </Card>
            )}

            {activeTab === 'purchases' && (
                <Card>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">PO #</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Supplier</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Amount</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Items</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {purchaseOrders.map(po => (
                                <tr key={po._id || po.id}>
                                    <td className="px-4 py-3">{new Date(po.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{po.orderNumber}</td>
                                    <td className="px-4 py-3">{po.supplierId?.name || 'Unknown'}</td>
                                    <td className="px-4 py-3 font-bold">₹{po.totalAmount}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {po.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs ${po.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {po.paymentStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {purchaseOrders.length === 0 && <tr><td colSpan="6" className="text-center py-4">No purchase history</td></tr>}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* Supplier Modal */}
            <Modal isOpen={showSupplierForm} onClose={() => setShowSupplierForm(false)} title="Supplier Details">
                <form onSubmit={handleSupplierSubmit} className="space-y-4">
                    <Input label="Supplier Name" value={supplierData.name} onChange={e => setSupplierData({ ...supplierData, name: e.target.value })} required />
                    <Input label="Contact Person" value={supplierData.contactPerson} onChange={e => setSupplierData({ ...supplierData, contactPerson: e.target.value })} />
                    <Input label="Phone" value={supplierData.phone} onChange={e => setSupplierData({ ...supplierData, phone: e.target.value })} required />
                    <Input label="Email" value={supplierData.email} onChange={e => setSupplierData({ ...supplierData, email: e.target.value })} />
                    <Input label="Goods Supplied (comma separated)" value={supplierData.productsSupplied} onChange={e => setSupplierData({ ...supplierData, productsSupplied: e.target.value })} />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="secondary" type="button" onClick={() => setShowSupplierForm(false)}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Modal>

            {/* Purchase Order Modal */}
            <Modal isOpen={showPOForm} onClose={() => setShowPOForm(false)} title="New Purchase Entry">
                <form onSubmit={handlePOSubmit} className="space-y-4">
                    <Select
                        label="Select Supplier"
                        value={poData.supplierId}
                        onChange={e => setPoData({ ...poData, supplierId: e.target.value })}
                        required
                        options={[
                            { value: '', label: 'Select Supplier' },
                            ...suppliers.map(s => ({ value: s._id || s.id, label: s.name }))
                        ]}
                    />

                    <div className="bg-gray-50 p-3 rounded">
                        <h4 className="text-sm font-bold mb-2">Add Item to Bill</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <Input placeholder="Item Name" value={poItem.productName} onChange={e => setPoItem({ ...poItem, productName: e.target.value })} />
                            <Input placeholder="Qty" type="number" value={poItem.quantity} onChange={e => setPoItem({ ...poItem, quantity: e.target.value })} />
                            <Input placeholder="Price/Unit" type="number" value={poItem.pricePerUnit} onChange={e => setPoItem({ ...poItem, pricePerUnit: e.target.value })} />
                        </div>
                        <Button type="button" size="sm" className="mt-2 w-full" onClick={addPOItem}>Add Item</Button>
                    </div>

                    {poData.items.length > 0 && (
                        <div className="border rounded p-2 max-h-40 overflow-y-auto">
                            {poData.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm py-1 border-b last:border-0">
                                    <span>{item.productName} ({item.quantity} x {item.pricePerUnit})</span>
                                    <span className="font-bold">₹{item.totalPrice}</span>
                                </div>
                            ))}
                            <div className="text-right font-bold mt-2">Total: ₹{poData.totalAmount}</div>
                        </div>
                    )}

                    <Select
                        label="Payment Status"
                        value={poData.paymentStatus}
                        onChange={e => setPoData({ ...poData, paymentStatus: e.target.value })}
                        options={[
                            { value: 'pending', label: 'Pending' },
                            { value: 'paid', label: 'Paid' },
                            { value: 'partial', label: 'Partial' }
                        ]}
                    />

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="secondary" type="button" onClick={() => setShowPOForm(false)}>Cancel</Button>
                        <Button type="submit">Record Purchase</Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};

export default SupplierManagement;
