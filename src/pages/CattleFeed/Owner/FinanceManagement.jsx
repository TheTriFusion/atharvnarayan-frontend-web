import { useState, useEffect } from 'react';
import { getCattleFeedOrders, getCattleFeedInventory, updateCattleFeedOrderPayment, updateCattleFeedInventory } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';

const FinanceManagement = () => {
    const { isSuperAdmin } = useAuth();
    const { selectedOwnerId } = useOwner();
    const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'supplier'
    const [loading, setLoading] = useState(true);

    // Data
    const [customerDues, setCustomerDues] = useState([]);
    const [supplierDues, setSupplierDues] = useState([]);

    // Payment Modal State
    const [modal, setModal] = useState({ show: false, type: '', item: null, amount: '', status: 'partial' });

    const { success, error: showError } = useToast();

    useEffect(() => {
        loadData();
    }, [selectedOwnerId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const ownerId = isSuperAdmin ? selectedOwnerId : null; // Backend handles null for owner role

            // 1. Fetch Customer Dues (Orders where paid < total)
            // We fetch all orders and filter client-side for now as backend query params might be limited
            const allOrders = await getCattleFeedOrders(ownerId ? { ownerId } : {});
            const dueOrders = allOrders.filter(o => {
                const total = o.totalAmount || 0;
                const paid = o.amountPaid || 0;
                return paid < total && o.status !== 'cancelled';
            });
            setCustomerDues(dueOrders);

            // 2. Fetch Supplier Dues (Inventory where paid < cost)
            const allInventory = await getCattleFeedInventory(ownerId);
            // console.log('All Inventory for Finance:', allInventory); // Debugging
            const dueInventory = allInventory.filter(i => {
                const cost = Number(i.purchaseCost) || 0;
                const paid = Number(i.amountPaid) || 0;
                return cost > 0 && paid < cost;
            });
            setSupplierDues(dueInventory);

        } catch (err) {
            console.error(err);
            showError('Failed to load finance data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPayment = (type, item) => {
        setModal({
            show: true,
            type,
            item,
            amount: '',
            status: item.paymentStatus || 'partial'
        });
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            const amount = parseFloat(modal.amount);
            if (isNaN(amount) || amount <= 0) {
                showError('Please enter a valid amount');
                return;
            }

            const { type, item, status } = modal;

            if (type === 'customer') {
                // Update Order Payment
                const currentPaid = item.amountPaid || 0;
                const newPaid = currentPaid + amount;

                await updateCattleFeedOrderPayment(item._id, {
                    amountPaid: newPaid,
                    paymentStatus: status
                });
                success('Payment recorded for Customer');
            } else {
                // Update Inventory Supplier Payment
                const currentPaid = item.amountPaid || 0;
                const newPaid = currentPaid + amount;

                await updateCattleFeedInventory(item._id || item.id, {
                    amountPaid: newPaid,
                    paymentStatus: status
                });
                success('Payment recorded for Supplier');
            }

            setModal({ show: false, type: '', item: null, amount: '', status: 'partial' });
            loadData();
        } catch (err) {
            console.error(err);
            showError('Failed to record payment');
        }
    };

    const calculateTotalStats = () => {
        const totalCustomerReceivable = customerDues.reduce((sum, o) => sum + (o.totalAmount - (o.amountPaid || 0)), 0);
        const totalSupplierPayable = supplierDues.reduce((sum, i) => sum + ((i.purchaseCost || 0) - (i.amountPaid || 0)), 0);
        return { totalCustomerReceivable, totalSupplierPayable };
    };

    const stats = calculateTotalStats();

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Finance Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-green-50 border-green-200">
                    <div className="text-green-800">
                        <h3 className="text-lg font-semibold">Total Receivable (From Customers)</h3>
                        <p className="text-3xl font-bold mt-2">₹{stats.totalCustomerReceivable.toFixed(2)}</p>
                        <p className="text-sm mt-1">{customerDues.length} pending orders</p>
                    </div>
                </Card>
                <Card className="bg-red-50 border-red-200">
                    <div className="text-red-800">
                        <h3 className="text-lg font-semibold">Total Payable (To Suppliers)</h3>
                        <p className="text-3xl font-bold mt-2">₹{stats.totalSupplierPayable.toFixed(2)}</p>
                        <p className="text-sm mt-1">{supplierDues.length} pending bills</p>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'customer'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('customer')}
                >
                    Customer Dues (Receivables)
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'supplier'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('supplier')}
                >
                    Supplier Dues (Payables)
                </button>
            </div>

            {/* Content */}
            <Card>
                {activeTab === 'customer' ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Info</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {customerDues.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No outstanding customer dues.</td>
                                    </tr>
                                ) : (
                                    customerDues.map((order) => {
                                        const due = order.totalAmount - (order.amountPaid || 0);
                                        return (
                                            <tr key={order._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="font-medium">{order.customerId?.name || 'Unknown'}</div>
                                                    <div className="text-gray-500">{order.customerId?.phone}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>#{order.orderNumber}</div>
                                                    <div className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    ₹{order.totalAmount}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                                    ₹{order.amountPaid || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                        order.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {order.paymentStatus || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">
                                                    ₹{due}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Button
                                                        variant="primary"
                                                        className="text-xs px-3 py-1"
                                                        onClick={() => handleOpenPayment('customer', order)}
                                                    >
                                                        Record Pay
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Cost</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {supplierDues.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No outstanding supplier dues.</td>
                                    </tr>
                                ) : (
                                    supplierDues.map((item) => {
                                        const due = (Number(item.purchaseCost) || 0) - (Number(item.amountPaid) || 0);
                                        return (
                                            <tr key={item._id || item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="font-medium">{item.supplier || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>{item.name}</div>
                                                    <div className="text-xs">{item.quantity} {item.unit}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    ₹{Number(item.purchaseCost || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                                    ₹{Number(item.amountPaid || 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${item.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                                        item.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {item.paymentStatus || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">
                                                    ₹{due}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Button
                                                        variant="primary"
                                                        className="text-xs px-3 py-1"
                                                        onClick={() => handleOpenPayment('supplier', item)}
                                                    >
                                                        Pay Supplier
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Payment Modal */}
            <Modal
                isOpen={modal.show}
                onClose={() => setModal({ show: false, type: '', item: null, amount: '', status: 'partial' })}
                title={`Record Payment for ${modal.type === 'customer' ? 'Customer' : 'Supplier'}`}
            >
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-medium">
                                ₹{modal.type === 'customer'
                                    ? modal.item?.totalAmount
                                    : modal.item?.purchaseCost || 0}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Already Paid:</span>
                            <span className="font-medium text-green-600">
                                ₹{modal.item?.amountPaid || 0}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                            <span className="text-gray-800">Balance Due:</span>
                            <span className="text-red-600">
                                ₹{modal.type === 'customer'
                                    ? (modal.item?.totalAmount - (modal.item?.amountPaid || 0))
                                    : ((modal.item?.purchaseCost || 0) - (modal.item?.amountPaid || 0))}
                            </span>
                        </div>
                    </div>

                    <Input
                        label="Payment Amount (₹)"
                        type="number"
                        value={modal.amount}
                        onChange={(e) => setModal(prev => ({ ...prev, amount: e.target.value }))}
                        min="0"
                        step="0.01"
                        required
                        autoFocus
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Payment Status
                        </label>
                        <select
                            value={modal.status}
                            onChange={(e) => setModal(prev => ({ ...prev, status: e.target.value }))}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="pending">Pending</option>
                            <option value="partial">Partial</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setModal({ show: false, type: '', item: null, amount: '', status: 'partial' })}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Save Payment
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FinanceManagement;
