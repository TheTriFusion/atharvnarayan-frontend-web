import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

const Sidebar = () => {
  const location = useLocation();
  const { isSuperAdmin, isCattleFeedOwner, isMilkTruckOwner, isSeller, isDriver } = useAuth();
  const { t } = useLanguage();

  // Super Admin Menu - All sections
  const superAdminMenuItems = [
    { path: '/superadmin/dashboard', labelKey: 'superAdmin.title', section: 'superadmin' },
    { path: '/superadmin/owners', labelKey: 'superAdmin.ownerManagement', section: 'superadmin' },
    { path: '/cattle-feed/owner/dashboard', labelKey: 'cattleFeed.dashboard', section: 'cattleFeed' },
    { path: '/cattle-feed/owner/inventory', labelKey: 'cattleFeed.inventory', section: 'cattleFeed' },
    { path: '/cattle-feed/owner/sales', labelKey: 'cattleFeed.sales', section: 'cattleFeed' },
    { path: '/cattle-feed/owner/suppliers', labelKey: 'cattleFeed.suppliers', section: 'cattleFeed' },
    { path: '/cattle-feed/owner/sellers', labelKey: 'cattleFeed.sellers', section: 'cattleFeed' },
    { path: '/cattle-feed/owner/customers', labelKey: 'cattleFeed.customers', section: 'cattleFeed' },
    { path: '/cattle-feed/owner/orders', labelKey: 'cattleFeed.orders', section: 'cattleFeed' },
    { path: '/milk-truck/owner/dashboard', labelKey: 'milkTruck.dashboard', section: 'milkTruck' },
    { path: '/milk-truck/owner/bmcs', labelKey: 'milkTruck.bmcManagement', section: 'milkTruck' },
    { path: '/milk-truck/owner/vehicles', labelKey: 'milkTruck.vehicleManagement', section: 'milkTruck' },
    { path: '/milk-truck/owner/drivers', labelKey: 'milkTruck.driverManagement', section: 'milkTruck' },
    { path: '/milk-truck/owner/routes', labelKey: 'milkTruck.routeManagement', section: 'milkTruck' },
    { path: '/milk-truck/owner/pricing', labelKey: 'milkTruck.pricing', section: 'milkTruck' },
    { path: '/milk-truck/owner/reports', labelKey: 'milkTruck.reports', section: 'milkTruck' },
    { path: '/cattle-feed-truck/superadmin/dashboard', labelKey: 'cattleFeedTruck.dashboard', section: 'cattleFeedTruck' },
    { path: '/cattle-feed-truck/superadmin/vehicles', labelKey: 'cattleFeedTruck.vehicles', section: 'cattleFeedTruck' },
    { path: '/cattle-feed-truck/superadmin/drivers', labelKey: 'cattleFeedTruck.drivers', section: 'cattleFeedTruck' },
    { path: '/cattle-feed-truck/superadmin/trips', labelKey: 'cattleFeedTruck.trips', section: 'cattleFeedTruck' },
  ];

  // Cattle Feed Owner Menu
  const cattleFeedOwnerMenuItems = [
    { path: '/cattle-feed/owner/dashboard', labelKey: 'cattleFeed.dashboard' },
    { path: '/cattle-feed/owner/inventory', labelKey: 'cattleFeed.inventory' },
    { path: '/cattle-feed/owner/sales', labelKey: 'cattleFeed.sales' },
    { path: '/cattle-feed/owner/suppliers', labelKey: 'cattleFeed.suppliers' },
    { path: '/cattle-feed/owner/sellers', labelKey: 'cattleFeed.sellers' },
    { path: '/cattle-feed/owner/customers', labelKey: 'cattleFeed.customers' },
    { path: '/cattle-feed/owner/orders', labelKey: 'cattleFeed.orders' },
    { path: '/cattle-feed/owner/finance', labelKey: 'cattleFeed.finance' },
  ];

  // Milk Truck Owner Menu
  const milkTruckOwnerMenuItems = [
    { path: '/milk-truck/owner/dashboard', labelKey: 'milkTruck.dashboard' },
    { path: '/milk-truck/owner/bmcs', labelKey: 'milkTruck.bmcManagement' },
    { path: '/milk-truck/owner/vehicles', labelKey: 'milkTruck.vehicleManagement' },
    { path: '/milk-truck/owner/drivers', labelKey: 'milkTruck.driverManagement' },
    { path: '/milk-truck/owner/routes', labelKey: 'milkTruck.routeManagement' },
    { path: '/milk-truck/owner/pricing', labelKey: 'milkTruck.pricing' },
    { path: '/milk-truck/owner/reports', labelKey: 'milkTruck.reports' },
  ];

  // Seller Menu
  const sellerMenuItems = [
    { path: '/cattle-feed/seller/sales', labelKey: 'cattleFeed.sales' },
  ];

  // Driver Menu
  const driverMenuItems = [
    { path: '/milk-truck/driver/dashboard', labelKey: 'milkTruck.dashboard' },
  ];

  // Cattle Feed Truck Owner Menu
  const cattleFeedTruckOwnerMenuItems = [
    { path: '/cattle-feed-truck/owner/dashboard', labelKey: 'cattleFeedTruck.dashboard' },
    { path: '/cattle-feed-truck/owner/vehicles', labelKey: 'cattleFeedTruck.vehicles' },
    { path: '/cattle-feed-truck/owner/drivers', labelKey: 'cattleFeedTruck.drivers' },
    { path: '/cattle-feed-truck/owner/trips', labelKey: 'cattleFeedTruck.trips' },
  ];

  // Determine which menu to show
  let menuItems = [];
  const { isCattleFeedTruckOwner } = useAuth();
  if (isSuperAdmin) {
    menuItems = superAdminMenuItems;
  } else if (isCattleFeedOwner) {
    menuItems = cattleFeedOwnerMenuItems;
  } else if (isMilkTruckOwner) {
    menuItems = milkTruckOwnerMenuItems;
  } else if (isCattleFeedTruckOwner) {
    menuItems = cattleFeedTruckOwnerMenuItems;
  } else if (isSeller) {
    menuItems = sellerMenuItems;
  } else if (isDriver) {
    menuItems = driverMenuItems;
  }

  const isActive = (path) => location.pathname === path;

  //  Group menu items by section for super admin
  const groupedMenuItems = isSuperAdmin ? {
    superadmin: superAdminMenuItems.filter(item => item.section === 'superadmin'),
    cattleFeed: superAdminMenuItems.filter(item => item.section === 'cattleFeed'),
    milkTruck: superAdminMenuItems.filter(item => item.section === 'milkTruck'),
    cattleFeedTruck: superAdminMenuItems.filter(item => item.section === 'cattleFeedTruck'),
  } : null;

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <div className="mb-4 flex justify-center">
        <LanguageSwitcher />
      </div>
      <nav className="space-y-2">
        {isSuperAdmin && groupedMenuItems ? (
          <>
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Super Admin</h3>
              {groupedMenuItems.superadmin.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Retail Shop System</h3>
              {groupedMenuItems.cattleFeed.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Milk Truck</h3>
              {groupedMenuItems.milkTruck.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Cattle Feed Truck</h3>
              {groupedMenuItems.cattleFeedTruck.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
          </>
        ) : (
          menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              {t(item.labelKey)}
            </Link>
          ))
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;

