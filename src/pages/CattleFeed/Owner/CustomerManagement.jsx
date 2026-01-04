import { useState, useEffect } from 'react';
import { getCattleFeedCustomers, getCattleFeedCustomerPurchases, getCattleFeedSales } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';

const CustomerManagement = () => {
  const { isSuperAdmin } = useAuth();
  const { selectedOwnerId } = useOwner();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPurchases, setCustomerPurchases] = useState([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { error: showError } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedOwnerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const ownerId = isSuperAdmin ? selectedOwnerId : null;
      const [allCustomers, allSales] = await Promise.all([
        getCattleFeedCustomers(ownerId),
        getCattleFeedSales(ownerId),
      ]);
      
      // Update customer stats from all sales
      const updatedCustomers = allCustomers.map(customer => {
        const purchases = allSales.filter(sale => sale.customerPhone === customer.phone);
        const totalPurchases = purchases.length;
        const totalAmount = purchases.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const lastPurchase = purchases.length > 0 
          ? purchases.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))[0]
          : null;
        
        return {
          ...customer,
          totalPurchases,
          totalAmount,
          lastPurchaseDate: lastPurchase?.date || lastPurchase?.createdAt || customer.lastPurchaseDate,
        };
      });
      
      setCustomers(updatedCustomers);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load customers';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPurchases = async (customer) => {
    try {
      setSelectedCustomer(customer);
      const purchases = await getCattleFeedCustomerPurchases(customer.phone);
      setCustomerPurchases(purchases.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)));
      setShowPurchaseModal(true);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load customer purchases';
      showError(errorMessage);
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSuperAdmin && <OwnerSelector systemType="cattleFeed" />}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
      </div>

      {/* Search */}
      <Card>
        <Input
          label="Search Customers"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, phone, or email..."
        />
      </Card>

      {/* Customers List */}
      <Card title={`Customers (${filteredCustomers.length})`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Purchases</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Purchase</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id || customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{customer.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{customer.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{customer.totalPurchases || 0}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{customer.totalAmount?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {customer.lastPurchaseDate 
                        ? new Date(customer.lastPurchaseDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleViewPurchases(customer)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Purchases
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Purchase History Modal */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false);
          setSelectedCustomer(null);
        }}
        title={`Purchase History - ${selectedCustomer?.name || ''}`}
        size="lg"
      >
        {customerPurchases.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No purchases found for this customer</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerPurchases.map((purchase) => (
                    <tr key={purchase._id || purchase.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(purchase.date || purchase.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          purchase.saleType === 'wholesale'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}>
                          {purchase.saleType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{purchase.items?.length || 0} items</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{purchase.totalAmount?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pt-4 border-t">
              <p className="text-lg font-bold text-gray-800">
                Total: ₹{customerPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerManagement;
