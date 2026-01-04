import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OwnerProvider } from './contexts/OwnerContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import OwnerRegistration from './pages/Auth/OwnerRegistration';

// Super Admin Pages
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import SuperAdminOwnerManagement from './pages/SuperAdmin/OwnerManagement';

// Cattle Feed Owner Pages
import CattleFeedOwnerDashboard from './pages/CattleFeed/Owner/Dashboard';
import CattleFeedOwnerInventoryManagement from './pages/CattleFeed/Owner/InventoryManagement';
import CattleFeedOwnerSalesManagement from './pages/CattleFeed/Owner/SalesManagement';
import CattleFeedOwnerSellerManagement from './pages/CattleFeed/Owner/SellerManagement';
import SupplierManagement from './pages/CattleFeed/Owner/SupplierManagement';
import CattleFeedOwnerCustomerManagement from './pages/CattleFeed/Owner/CustomerManagement';
import CarttleFeedOwnerOrderManagement from './pages/CattleFeed/Owner/OrderManagement';
import CattleFeedOwnerFinanceManagement from './pages/CattleFeed/Owner/FinanceManagement';

// Cattle Feed Seller Pages
import CattleFeedSellerSales from './pages/CattleFeed/Seller/SellerSales';

// Milk Truck Owner Pages
import MilkTruckOwnerDashboard from './pages/MilkTruck/Owner/Dashboard';
import MilkTruckOwnerBMCManagement from './pages/MilkTruck/Owner/BMCManagement';
import MilkTruckOwnerVehicleManagement from './pages/MilkTruck/Owner/VehicleManagement';
import MilkTruckOwnerDriverManagement from './pages/MilkTruck/Owner/DriverManagement';
import MilkTruckOwnerDriverTrips from './pages/MilkTruck/Owner/DriverTrips';
import MilkTruckOwnerRouteManagement from './pages/MilkTruck/Owner/RouteManagement';
import MilkTruckOwnerPricingManagement from './pages/MilkTruck/Owner/PricingManagement';
import MilkTruckOwnerReports from './pages/MilkTruck/Owner/Reports';

// Milk Truck Driver Pages
import MilkTruckDriverDashboard from './pages/MilkTruck/Driver/DriverDashboard';
import MilkTruckDriverTripPage from './pages/MilkTruck/Driver/TripPage';

// Cattle Feed Truck Owner Pages
import CattleFeedTruckOwnerDashboard from './pages/CattleFeedTruck/Owner/Dashboard';
import WarehouseManagement from './pages/CattleFeedTruck/Owner/WarehouseManagement';
import VehicleManagement from './pages/CattleFeedTruck/Owner/VehicleManagement';
import DeliveryPointManagement from './pages/CattleFeedTruck/Owner/DeliveryPointManagement';
import RouteManagement from './pages/CattleFeedTruck/Owner/RouteManagement';
import DriverManagement from './pages/CattleFeedTruck/Owner/DriverManagement';
import FeedProductManagement from './pages/CattleFeedTruck/Owner/FeedProductManagement';
import TripManagement from './pages/CattleFeedTruck/Owner/TripManagement';

// Cattle Feed Truck Driver Pages
import CattleFeedTruckDriverDashboard from './pages/CattleFeedTruck/Driver/Dashboard';
import CattleFeedTruckDriverActiveTrip from './pages/CattleFeedTruck/Driver/ActiveTrip';
import CattleFeedTruckDriverCreateTrip from './pages/CattleFeedTruck/Driver/CreateTrip';
import ActiveTripRedirect from './pages/CattleFeedTruck/Driver/ActiveTripRedirect';

// Cattle Feed Truck Super Admin Pages
import CattleFeedTruckSuperAdminDashboard from './pages/CattleFeedTruck/SuperAdmin/Dashboard';

function App() {
  // Data now comes from backend API - no localStorage initialization needed
  return (
    <ToastProvider>
      <LanguageProvider>
        <AuthProvider>
          <OwnerProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<OwnerRegistration />} />
                {/* Super Admin Routes */}
                <Route
                  path="/superadmin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="superadmin">
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/superadmin/owners"
                  element={
                    <ProtectedRoute requiredRole="superadmin">
                      <SuperAdminOwnerManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Cattle Feed Owner Routes */}
                <Route
                  path="/cattle-feed/owner/dashboard"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedOwner">
                      <CattleFeedOwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cattle-feed/owner/inventory"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedOwner">
                      <CattleFeedOwnerInventoryManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cattle-feed/owner/sales"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedOwner">
                      <CattleFeedOwnerSalesManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cattle-feed/owner/sellers"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedOwner">
                      <CattleFeedOwnerSellerManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cattle-feed/owner/suppliers"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedOwner">
                      <SupplierManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cattle-feed/owner/customers"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedOwner">
                      <CattleFeedOwnerCustomerManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cattle-feed/owner/orders"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedOwner">
                      <CarttleFeedOwnerOrderManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cattle-feed/owner/finance"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedOwner">
                      <CattleFeedOwnerFinanceManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Cattle Feed Seller Routes */}
                <Route
                  path="/cattle-feed/seller/sales"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedSeller">
                      <CattleFeedSellerSales />
                    </ProtectedRoute>
                  }
                />

                {/* Milk Truck Owner Routes */}
                <Route
                  path="/milk-truck/owner/dashboard"
                  element={
                    <ProtectedRoute requiredRole="milkTruckOwner">
                      <MilkTruckOwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/milk-truck/owner/bmcs"
                  element={
                    <ProtectedRoute requiredRole="milkTruckOwner">
                      <MilkTruckOwnerBMCManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/milk-truck/owner/vehicles"
                  element={
                    <ProtectedRoute requiredRole="milkTruckOwner">
                      <MilkTruckOwnerVehicleManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/milk-truck/owner/drivers"
                  element={
                    <ProtectedRoute requiredRole="milkTruckOwner">
                      <MilkTruckOwnerDriverManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/milk-truck/owner/drivers/:driverId/trips"
                  element={
                    <ProtectedRoute requiredRole="milkTruckOwner">
                      <MilkTruckOwnerDriverTrips />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/milk-truck/owner/routes"
                  element={
                    <ProtectedRoute requiredRole="milkTruckOwner">
                      <MilkTruckOwnerRouteManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/milk-truck/owner/pricing"
                  element={
                    <ProtectedRoute requiredRole="milkTruckOwner">
                      <MilkTruckOwnerPricingManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/milk-truck/owner/reports"
                  element={
                    <ProtectedRoute requiredRole="milkTruckOwner">
                      <MilkTruckOwnerReports />
                    </ProtectedRoute>
                  }
                />

                {/* Milk Truck Driver Routes */}
                <Route
                  path="/milk-truck/driver/dashboard"
                  element={
                    <ProtectedRoute requiredRole="milkTruckDriver">
                      <MilkTruckDriverDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/milk-truck/driver/trip"
                  element={
                    <ProtectedRoute requiredRole="milkTruckDriver">
                      <MilkTruckDriverTripPage />
                    </ProtectedRoute>
                  }
                />

                {/* Cattle Feed Truck Super Admin Routes */}
                <Route
                  path="/cattle-feed-truck/superadmin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="superadmin">
                      <CattleFeedTruckSuperAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/cattle-feed-truck/superadmin/warehouses" element={<ProtectedRoute requiredRole="superadmin"><div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-4">Warehouse Management</h1><p className="text-gray-600">Coming Soon - CRUD operations for warehouses</p></div></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/superadmin/vehicles" element={<ProtectedRoute requiredRole="superadmin"><div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-4">Vehicle Management</h1><p className="text-gray-600">Coming Soon - CRUD operations for delivery vehicles</p></div></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/superadmin/delivery-points" element={<ProtectedRoute requiredRole="superadmin"><div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-4">Delivery Points Management</h1><p className="text-gray-600">Coming Soon - CRUD operations for delivery points</p></div></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/superadmin/routes" element={<ProtectedRoute requiredRole="superadmin"><div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-4">Routes Management</h1><p className="text-gray-600">Coming Soon - CRUD operations for delivery routes</p></div></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/superadmin/drivers" element={<ProtectedRoute requiredRole="superadmin"><div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-4">Drivers Management</h1><p className="text-gray-600">Coming Soon - View and manage all drivers</p></div></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/superadmin/trips" element={<ProtectedRoute requiredRole="superadmin"><div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-4">Trips Management</h1><p className="text-gray-600">Coming Soon - View and monitor all delivery trips</p></div></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/superadmin/feed-products" element={<ProtectedRoute requiredRole="superadmin"><div className="container mx-auto p-8"><h1 className="text-3xl font-bold mb-4">Feed Products Management</h1><p className="text-gray-600">Coming Soon - CRUD operations for feed products catalog</p></div></ProtectedRoute>} />

                {/* Cattle Feed Truck Owner Routes */}
                <Route
                  path="/cattle-feed-truck/owner/dashboard"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedTruckOwner">
                      <CattleFeedTruckOwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/cattle-feed-truck/owner/warehouses" element={<ProtectedRoute requiredRole="cattleFeedTruckOwner"><WarehouseManagement /></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/owner/vehicles" element={<ProtectedRoute requiredRole="cattleFeedTruckOwner"><VehicleManagement /></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/owner/delivery-points" element={<ProtectedRoute requiredRole="cattleFeedTruckOwner"><DeliveryPointManagement /></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/owner/routes" element={<ProtectedRoute requiredRole="cattleFeedTruckOwner"><RouteManagement /></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/owner/drivers" element={<ProtectedRoute requiredRole="cattleFeedTruckOwner"><DriverManagement /></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/owner/feed-products" element={<ProtectedRoute requiredRole="cattleFeedTruckOwner"><FeedProductManagement /></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/owner/trips" element={<ProtectedRoute requiredRole="cattleFeedTruckOwner"><TripManagement /></ProtectedRoute>} />
                <Route path="/cattle-feed-truck/owner/trips/:tripId" element={<ProtectedRoute requiredRole="cattleFeedTruckOwner"><TripManagement /></ProtectedRoute>} />

                {/* Cattle Feed Truck Driver Routes */}
                <Route
                  path="/cattle-feed-truck/driver/active-trip"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedTruckDriver">
                      <CattleFeedTruckDriverActiveTrip />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cattle-feed-truck/driver/create-trip"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedTruckDriver">
                      <CattleFeedTruckDriverCreateTrip />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cattle-feed-truck/driver/dashboard"
                  element={
                    <ProtectedRoute requiredRole="cattleFeedTruckDriver">
                      <ActiveTripRedirect>
                        <CattleFeedTruckDriverDashboard />
                      </ActiveTripRedirect>
                    </ProtectedRoute>
                  }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </OwnerProvider>
        </AuthProvider>
      </LanguageProvider>
    </ToastProvider>
  );
}

export default App;

