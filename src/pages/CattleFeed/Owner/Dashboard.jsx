import { useState, useEffect, useRef } from 'react';
import { getCattleFeedInventory, getCattleFeedSales, getCattleFeedOrders } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';

const Dashboard = () => {
  const { isSuperAdmin } = useAuth();
  const { selectedOwnerId } = useOwner();
  const [stats, setStats] = useState({
    totalInventoryItems: 0,
    totalStockValue: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    totalSales: 0,
    wholesaleSales: 0,
    retailSales: 0,
    totalRevenue: 0,
    wholesaleRevenue: 0,
    retailRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const { error: showError } = useToast();
  const isLoadingRef = useRef(false);

  useEffect(() => {
    loadStats();
  }, [selectedOwnerId]);

  const loadStats = async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      return;
    }
    try {
      setLoading(true);
      setError('');

      const ownerId = isSuperAdmin ? selectedOwnerId : null;
      const [inventory, sales, pendingOrdersData] = await Promise.all([
        getCattleFeedInventory(ownerId),
        getCattleFeedSales(ownerId),
        getCattleFeedOrders({ ownerId, status: 'pending' })
      ]);

      // Calculate inventory stats
      const totalItems = inventory.length;
      const stockValue = inventory.reduce((sum, item) => {
        return sum + (item.quantity * item.retailPrice);
      }, 0);
      const lowStock = inventory.filter(item => item.quantity < 50).length;

      // Calculate sales stats
      const totalSalesCount = sales.length;
      const wholesaleSales = sales.filter(s => s.saleType === 'wholesale').length;
      const retailSales = sales.filter(s => s.saleType === 'retail').length;
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      const wholesaleRevenue = sales
        .filter(s => s.saleType === 'wholesale')
        .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      const retailRevenue = sales
        .filter(s => s.saleType === 'retail')
        .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

      setStats({
        totalInventoryItems: totalItems,
        totalStockValue: stockValue,
        lowStockItems: lowStock,
        pendingOrders: pendingOrdersData.length,
        totalSales: totalSalesCount,
        wholesaleSales,
        retailSales,
        totalRevenue,
        wholesaleRevenue,
        retailRevenue,
      });

      // Set recent sales and low stock items
      setRecentSales(
        sales
          .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
          .slice(0, 5)
      );
      setLowStockItems(
        inventory
          .filter(item => item.quantity < 50)
          .slice(0, 5)
      );
    } catch (err) {
      const errorMessage = err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  if (loading && stats.totalInventoryItems === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && stats.totalInventoryItems === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadStats}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSuperAdmin && <OwnerSelector systemType="cattleFeed" />}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
          {!loading && (
            <button
              onClick={loadStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              title="Refresh data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Inventory Stats */}
      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.totalInventoryItems}</p>
            <p className="text-gray-600 mt-2">Total Inventory Items</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">₹{stats.totalStockValue.toFixed(2)}</p>
            <p className="text-gray-600 mt-2">Total Stock Value</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{stats.lowStockItems}</p>
            <p className="text-gray-600 mt-2">Low Stock Items</p>
          </div>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/cattle-feed/owner/orders'}>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            <p className="text-gray-600 mt-2">Pending Orders</p>
            <p className="text-xs text-blue-500 mt-1">Click to manage</p>
          </div>
        </Card>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.totalSales}</p>
            <p className="text-gray-600 mt-2">Total Sales</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.wholesaleSales}</p>
            <p className="text-gray-600 mt-2">Wholesale Sales</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-teal-600">{stats.retailSales}</p>
            <p className="text-gray-600 mt-2">Retail Sales</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toFixed(2)}</p>
            <p className="text-gray-600 mt-2">Total Revenue</p>
          </div>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">₹{stats.wholesaleRevenue.toFixed(2)}</p>
            <p className="text-gray-600 mt-2">Wholesale Revenue</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-600">₹{stats.retailRevenue.toFixed(2)}</p>
            <p className="text-gray-600 mt-2">Retail Revenue</p>
          </div>
        </Card>
      </div>

      {/* Recent Sales and Low Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recentSales.length > 0 && (
          <Card title="Recent Sales">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSales.map((sale) => (
                    <tr key={sale._id || sale.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{sale.customerName}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${sale.saleType === 'wholesale'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-teal-100 text-teal-800'
                          }`}>
                          {sale.saleType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{sale.totalAmount?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(sale.date || sale.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {lowStockItems.length > 0 && (
          <Card title="Low Stock Items">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockItems.map((item) => (
                    <tr key={item._id || item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.quantity < 20
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
