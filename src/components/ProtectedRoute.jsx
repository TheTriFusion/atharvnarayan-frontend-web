import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Layout/Navbar';
import Sidebar from './Layout/Sidebar';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { 
    isAuthenticated, 
    isSuperAdmin, 
    isCattleFeedOwner, 
    isMilkTruckOwner, 
    isCattleFeedTruckOwner,
    isCattleFeedTruckDriver,
    isSeller, 
    isDriver,
    loading 
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Super admin can access all routes
  if (isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole === 'cattleFeedOwner' && !isCattleFeedOwner) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'milkTruckOwner' && !isMilkTruckOwner) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'cattleFeedSeller' && !isSeller) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'milkTruckDriver' && !isDriver) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'cattleFeedTruckOwner' && !isCattleFeedTruckOwner) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'cattleFeedTruckDriver' && !isCattleFeedTruckDriver) {
    return <Navigate to="/login" replace />;
  }

  // Seller layout (no sidebar, simpler)
  if ((requiredRole === 'seller' || requiredRole === 'cattleFeedSeller') && isSeller) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto p-6">
          {children}
        </main>
      </div>
    );
  }

  // Driver layout (no sidebar, simpler)
  if ((requiredRole === 'driver' || requiredRole === 'milkTruckDriver') && isDriver) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto p-6">
          {children}
        </main>
      </div>
    );
  }

  // Cattle Feed Truck Driver layout (no sidebar, simpler)
  if (requiredRole === 'cattleFeedTruckDriver' && isCattleFeedTruckDriver) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto p-6">
          {children}
        </main>
      </div>
    );
  }

  // Owner/Admin layout (with sidebar)
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProtectedRoute;

