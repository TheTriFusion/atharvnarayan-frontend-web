import { useState, useEffect, useRef, useMemo } from 'react';
import {
  getCattleFeedInventory,
  getCattleFeedSales,
  getCattleFeedSellers,
  getCattleFeedOwners,
  getMilkTruckOwners,
  getMilkTruckDrivers,
  getMilkTruckVehicles,
  getMilkTruckTrips,
  getMilkTruckBMCs,
  getMilkTruckRoutes
} from '../../utils/storage';
import Card from '../../components/common/Card';
import { useToast } from '../../contexts/ToastContext';
import { useOwner } from '../../contexts/OwnerContext';
import OwnerSelector from '../../components/SuperAdmin/OwnerSelector';

const Dashboard = () => {
  const { selectedOwnerId, ownerType } = useOwner();

  // Refresh State
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  // Stats State
  const [cattleFeedStats, setCattleFeedStats] = useState({
    totalInventoryItems: 0,
    totalStockValue: 0,
    lowStockItems: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalSellers: 0,
  });

  const [milkTruckStats, setMilkTruckStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    inProgressTrips: 0,
    totalBMCs: 0,
    totalVehicles: 0,
    totalDrivers: 0,
    totalRoutes: 0,
  });

  const [ownerCounts, setOwnerCounts] = useState({
    totalCattleFeedOwners: 0,
    totalMilkTruckOwners: 0,
  });

  const [recentCattleFeedSales, setRecentCattleFeedSales] = useState([]);
  const [recentMilkTruckTrips, setRecentMilkTruckTrips] = useState([]);

  // Loading States
  const [loadingCF, setLoadingCF] = useState(true);
  const [loadingMT, setLoadingMT] = useState(true);
  const [loadingOwners, setLoadingOwners] = useState(true);

  const { error: showError } = useToast();

  // Derived IDs for dependencies
  const cattleFeedOwnerId = useMemo(() => ownerType === 'cattleFeed' ? selectedOwnerId : null, [ownerType, selectedOwnerId]);
  const milkTruckOwnerId = useMemo(() => ownerType === 'milkTruck' ? selectedOwnerId : null, [ownerType, selectedOwnerId]);

  // 1. Fetch Owners Counts (Only on mount)
  useEffect(() => {
    let mounted = true;
    const loadOwnerCounts = async () => {
      try {
        const [cfOwners, mtOwners] = await Promise.all([
          getCattleFeedOwners(),
          getMilkTruckOwners()
        ]);
        if (mounted) {
          setOwnerCounts({
            totalCattleFeedOwners: cfOwners.length,
            totalMilkTruckOwners: mtOwners.length
          });
        }
      } catch (error) {
        console.error("Failed to load owner counts", error);
      } finally {
        if (mounted) setLoadingOwners(false);
      }
    };
    loadOwnerCounts();
    return () => { mounted = false; };
  }, [refreshKey]);

  // 2. Fetch Cattle Feed Data
  useEffect(() => {
    let mounted = true;
    const loadCFData = async () => {
      setLoadingCF(true);
      try {
        const [inventory, sales, sellers] = await Promise.all([
          getCattleFeedInventory(cattleFeedOwnerId),
          getCattleFeedSales(cattleFeedOwnerId),
          getCattleFeedSellers(cattleFeedOwnerId),
        ]);

        if (!mounted) return;

        const totalItems = inventory.length;
        const stockValue = inventory.reduce((sum, item) => sum + (item.quantity * item.retailPrice), 0);
        const lowStock = inventory.filter(item => item.quantity < 50).length;
        const totalSalesCount = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

        setCattleFeedStats({
          totalInventoryItems: totalItems,
          totalStockValue: stockValue,
          lowStockItems: lowStock,
          totalSales: totalSalesCount,
          totalRevenue,
          totalSellers: sellers.length,
        });

        setRecentCattleFeedSales(
          sales
            .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
            .slice(0, 5)
        );

      } catch (error) {
        if (mounted) showError(error.message || 'Failed to load Cattle Feed stats');
      } finally {
        if (mounted) setLoadingCF(false);
      }
    };

    loadCFData();
    return () => { mounted = false; };
  }, [cattleFeedOwnerId, showError, refreshKey]);

  // 3. Fetch Milk Truck Data
  useEffect(() => {
    let mounted = true;
    const loadMTData = async () => {
      setLoadingMT(true);
      try {
        const [trips, bmcs, vehicles, drivers, routes] = await Promise.all([
          getMilkTruckTrips(milkTruckOwnerId),
          getMilkTruckBMCs(milkTruckOwnerId),
          getMilkTruckVehicles(milkTruckOwnerId),
          getMilkTruckDrivers(milkTruckOwnerId), // Assuming this accepts ownerId? storage.js says: getMilkTruckDrivers(ownerId = null)
          getMilkTruckRoutes(milkTruckOwnerId),
        ]);

        if (!mounted) return;

        const completedTrips = trips.filter(t => t.status === 'completed').length;
        const inProgressTrips = trips.filter(t => t.status === 'in_progress').length;

        setMilkTruckStats({
          totalTrips: trips.length,
          completedTrips,
          inProgressTrips,
          totalBMCs: bmcs.length,
          totalVehicles: vehicles.length,
          totalDrivers: drivers.length,
          totalRoutes: routes.length,
        });

        setRecentMilkTruckTrips(
          trips
            .filter(t => t.status === 'completed')
            .sort((a, b) => new Date(b.endTime || b.startTime || b.createdAt) - new Date(a.endTime || a.startTime || a.createdAt))
            .slice(0, 5)
        );

      } catch (error) {
        if (mounted) showError(error.message || 'Failed to load Milk Truck stats');
      } finally {
        if (mounted) setLoadingMT(false);
      }
    };

    loadMTData();
    return () => { mounted = false; };
  }, [milkTruckOwnerId, showError, refreshKey]);

  const loading = loadingCF || loadingMT || loadingOwners;

  // Manual Refresh Handler
  const handleRefresh = () => {
    // Determine which to refresh based on what we are looking at, or refresh all
    // Simplest to force re-run effects by invalidating or just calling logic.
    // But since effects depend on IDs, we can't easily force them without logic extraction.
    // For now, reloading page is worst case, but we can just reset loading to true?
    // Actually, calling the functions directly is better if we extracted them.
    // But for this quick fix, I will allow the effects to handle it.
    // To 'force' refresh, we could have a 'refreshTrigger' state in dependencies.
    window.location.reload(); // Simplest "Refresh" button behavior for now as splitting logic is complex, 
    // OR: we can implement a refresh key.
  };

  // Re-implementing manual refresh with key


  // Wrap the inner logic of effects to depend on refreshKey too?
  // Let's modify the effects to include refreshKey in dependencies.

  /* 
     NOTE: I am modifying the effects above to include refreshKey in dependencies 
     in the actual replacement content below 
  */

  if (loading && cattleFeedStats.totalInventoryItems === 0 && milkTruckStats.totalTrips === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
          {!loading && (
            <button
              onClick={triggerRefresh}
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

      {/* Owner Selector */}
      <OwnerSelector systemType="both" />

      {/* Cattle Feed Stats */}
      <div className={loadingCF ? 'opacity-50 pointer-events-none' : ''}>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Cattle Feed System Overview
          {loadingCF && <span className="text-sm font-normal ml-2 text-gray-500">(Updating...)</span>}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{cattleFeedStats.totalInventoryItems}</p>
              <p className="text-gray-600 mt-2">Total Inventory Items</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">₹{cattleFeedStats.totalStockValue.toFixed(2)}</p>
              <p className="text-gray-600 mt-2">Total Stock Value</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{cattleFeedStats.lowStockItems}</p>
              <p className="text-gray-600 mt-2">Low Stock Items</p>
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{cattleFeedStats.totalSales}</p>
              <p className="text-gray-600 mt-2">Total Sales</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">₹{cattleFeedStats.totalRevenue.toFixed(2)}</p>
              <p className="text-gray-600 mt-2">Total Revenue</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-600">{cattleFeedStats.totalSellers}</p>
              <p className="text-gray-600 mt-2">Cattle Feed Sellers</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Milk Truck Stats */}
      <div className={loadingMT ? 'opacity-50 pointer-events-none' : ''}>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Milk Truck System Overview
          {loadingMT && <span className="text-sm font-normal ml-2 text-gray-500">(Updating...)</span>}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{milkTruckStats.totalTrips}</p>
              <p className="text-gray-600 mt-2">Total Trips</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{milkTruckStats.completedTrips}</p>
              <p className="text-gray-600 mt-2">Completed Trips</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{milkTruckStats.inProgressTrips}</p>
              <p className="text-gray-600 mt-2">Active Trips</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{milkTruckStats.totalBMCs}</p>
              <p className="text-gray-600 mt-2">Total BMCs</p>
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{milkTruckStats.totalVehicles}</p>
              <p className="text-gray-600 mt-2">Vehicles</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-600">{milkTruckStats.totalDrivers}</p>
              <p className="text-gray-600 mt-2">Drivers</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-600">{milkTruckStats.totalRoutes}</p>
              <p className="text-gray-600 mt-2">Routes</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-600">{ownerCounts.totalMilkTruckOwners}</p>
              <p className="text-gray-600 mt-2">Milk Truck Owners</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recentCattleFeedSales.length > 0 && (
          <Card title="Recent Cattle Feed Sales">
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
                  {recentCattleFeedSales.map((sale) => (
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

        {recentMilkTruckTrips.length > 0 && (
          <Card title="Recent Milk Truck Trips">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trip ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentMilkTruckTrips.map((trip) => (
                    <tr key={trip._id || trip.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{trip._id || trip.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {trip.endTime ? new Date(trip.endTime).toLocaleDateString() :
                          trip.startTime ? new Date(trip.startTime).toLocaleDateString() :
                            new Date(trip.createdAt).toLocaleDateString()}
                      </td>
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
