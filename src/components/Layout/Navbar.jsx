import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

const Navbar = () => {
  const { user, logout, isSuperAdmin, isCattleFeedOwner, isMilkTruckOwner, isSeller, isDriver } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (isSuperAdmin) return '/superadmin/dashboard';
    if (isCattleFeedOwner) return '/cattle-feed/owner/dashboard';
    if (isMilkTruckOwner) return '/milk-truck/owner/dashboard';
    if (isSeller) return '/cattle-feed/seller/sales';
    if (isDriver) return '/milk-truck/driver/dashboard';
    return '/login';
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isCattleFeedOwner) return 'Cattle Feed Owner';
    if (isMilkTruckOwner) return 'Milk Truck Owner';
    if (isSeller) return 'Seller';
    if (isDriver) return 'Driver';
    return '';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to={getDashboardLink()} className="text-xl font-bold">
            Atharvnarayana
          </Link>
          
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {user.name} ({getRoleLabel()})
              </span>
              <Button variant="secondary" onClick={handleLogout} className="text-sm">
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

