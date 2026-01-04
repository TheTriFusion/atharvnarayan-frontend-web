import { useState, useEffect } from 'react';
import { getCattleFeedOrders, updateCattleFeedOrderStatus } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';

const OrderManagement = () => {
    const { isSuperAdmin } = useAuth();
    const { selectedOwnerId } = useOwner();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [processingId, setProcessingId] = useState(null);
    const { success: showSuccess, error: showError } = useToast();

    useEffect(() => {
        loadOrders();
    }, [selectedOwnerId, filter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const ownerId = isSuperAdmin ? selectedOwnerId : null;
            const params = {};
            if (ownerId) params.ownerId = ownerId;
            if (filter !== 'all') params.status = filter;

            const data = await getCattleFeedOrders(params);
            setOrders(data);
        } catch (err) {
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setProcessingId(orderId);
            await updateCattleFeedOrderStatus(orderId, newStatus);
            showSuccess(`Order updated to ${newStatus}`);
            loadOrders();
        } catch (err) {
            showError('Failed to update order status');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-purple-100 text-purple-800',
            packed: 'bg-indigo-100 text-indigo-800',
            shipped: 'bg-cyan-100 text-cyan-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const [paymentModal, setPaymentModal] = useState({ show: false, orderId: null, currentPaid: 0, total: 0 });
    const [paymentAmount, setPaymentAmount] = useState('');

    const openPaymentModal = (order) => {
        setPaymentModal({
            show: true,
            orderId: order._id,
            currentPaid: order.amountPaid || 0,
            total: order.totalAmount
        });
        setPaymentAmount('');
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            const amount = parseFloat(paymentAmount);
            if (isNaN(amount) || amount < 0) {
                showError('Please enter a valid amount');
                return;
            }

            // Calculate new total paid
            const newTotalPaid = paymentModal.currentPaid + amount;

            // Allow overpayment? For now, maybe just warn or cap at total?
            // Let's allow flexible entry but maybe show warning if > total.

            // Call API
            // We need to use a direct API call or update storage function
            // Since we added updateCattleFeedOrderPayment in storage.js, let's use it.
            // But wait, the updateCattleFeedOrderPayment function takes (id, paymentStatus).
            // We need to update it to support amountPaid too. 
            // Actually, I'll use the generic updateStatus logic or create a new one.
            // Let's import updateCattleFeedOrderPayment from storage.js first.
            const { updateCattleFeedOrderPayment } = await import('../../../utils/storage');

            await updateCattleFeedOrderPayment(paymentModal.orderId, {
                amountPaid: newTotalPaid
                // The backend automatically calculates status
            });

            showSuccess('Payment recorded successfully');
            setPaymentModal({ show: false, orderId: null, currentPaid: 0, total: 0 });
            loadOrders();
        } catch (err) {
            console.error(err);
            showError('Failed to record payment');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
                <button
                    onClick={loadOrders}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Refresh
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : orders.length === 0 ? (
                <Card>
                    <div className="text-center py-12 text-gray-500">
                        No {filter !== 'all' ? filter : ''} orders found
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => {
                        const amountPaid = order.amountPaid || 0;
                        const balanceDue = order.totalAmount - amountPaid;

                        return (
                            <Card key={order._id}>
                                <div className="flex flex-col lg:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold">Order #{order.orderNumber}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-2">Customer Details</h4>
                                                {order.customerId ? (
                                                    <div className="text-sm text-gray-600">
                                                        <p className="font-medium">{order.customerId.name}</p>
                                                        <p>{order.customerId.phone}</p>
                                                        <p>{order.deliveryAddress?.street}</p>
                                                        <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-red-500">Customer Deleted</p>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-2">Order Info</h4>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <p>Total Amount: <span className="font-bold text-green-600">₹{order.totalAmount}</span></p>
                                                    <p>Payment Method: {order.paymentMethod.toUpperCase()}</p>
                                                    <div className="flex justify-between items-center border-t pt-2 mt-2">
                                                        <span>Status: <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>{order.paymentStatus.toUpperCase()}</span></span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                        <span>Paid: ₹{amountPaid}</span>
                                                        <span className={`${balanceDue > 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>Due: ₹{balanceDue > 0 ? balanceDue : 0}</span>
                                                    </div>
                                                    {balanceDue > 0 && order.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => openPaymentModal(order)}
                                                            className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                                                        >
                                                            Record Payment
                                                        </button>
                                                    )}
                                                    {order.deliveryCharges > 0 && <p className="text-xs text-gray-400 mt-1">Includes Delivery: ₹{order.deliveryCharges}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-2">Items</h4>
                                            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span>{item.quantity} x {item.productName} ({item.unit})</span>
                                                        <span className="font-medium">₹{item.totalPrice}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:w-48 flex flex-col justify-center gap-2 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                                        {order.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                                                    disabled={processingId === order._id}
                                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                    disabled={processingId === order._id}
                                                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'processing')}
                                                disabled={processingId === order._id}
                                                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                Process
                                            </button>
                                        )}
                                        {order.status === 'processing' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'shipped')}
                                                disabled={processingId === order._id}
                                                className="w-full px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50"
                                            >
                                                Ship
                                            </button>
                                        )}
                                        {order.status === 'shipped' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'delivered')}
                                                disabled={processingId === order._id}
                                                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                            >
                                                Mark Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Payment Recording Modal */}
            {paymentModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Record Payment</h3>
                        <div className="mb-4 text-sm text-gray-600">
                            <p>Total Order Amount: <span className="font-semibold">₹{paymentModal.total}</span></p>
                            <p>Already Paid: <span className="font-semibold">₹{paymentModal.currentPaid}</span></p>
                            <p className="text-red-600 font-bold mt-1">Balance Due: ₹{paymentModal.total - paymentModal.currentPaid}</p>
                        </div>
                        <form onSubmit={handlePaymentSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount to Receive (₹)
                                </label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                                    min="1"
                                    max={paymentModal.total - paymentModal.currentPaid}
                                    step="0.01"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentModal({ show: false, orderId: null, currentPaid: 0, total: 0 })}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Save Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
