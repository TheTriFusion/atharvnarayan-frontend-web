// API-based storage utility functions for Atharvnarayana
// All data operations now go through the backend API
// Only JWT token is stored in localStorage

import { cattleFeedAPI, milkTruckAPI, usersAPI, suppliersAPI, removeToken } from './api';

// ==================== CATTLE FEED SYSTEM ====================

// Cattle Feed Inventory functions
export const getCattleFeedInventory = async (ownerId = null) => {
  try {
    const response = await cattleFeedAPI.getInventory(ownerId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
};

export const setCattleFeedInventory = async (inventory) => {
  // This function is kept for backward compatibility but doesn't do anything
  // Use individual create/update/delete functions instead
  console.warn('setCattleFeedInventory is deprecated. Use create/update/delete functions instead.');
  return inventory;
};

export const addCattleFeedInventory = async (item) => {
  try {
    const response = await cattleFeedAPI.createInventory(item);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

export const updateCattleFeedInventory = async (id, updates) => {
  try {
    const response = await cattleFeedAPI.updateInventory(id, updates);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

export const deleteCattleFeedInventory = async (id) => {
  try {
    const response = await cattleFeedAPI.deleteInventory(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

export const getCattleFeedInventoryItem = async (id) => {
  try {
    const response = await cattleFeedAPI.getInventoryItem(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return null;
  }
};

// Cattle Feed Sales functions
export const getCattleFeedSales = async (ownerId = null) => {
  try {
    const response = await cattleFeedAPI.getSales(ownerId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
};

export const setCattleFeedSales = async (sales) => {
  console.warn('setCattleFeedSales is deprecated. Use create/update/delete functions instead.');
  return sales;
};

export const addCattleFeedSale = async (sale) => {
  try {
    const response = await cattleFeedAPI.createSale(sale);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

export const updateCattleFeedSale = async (id, updates) => {
  try {
    const response = await cattleFeedAPI.updateSale(id, updates);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating sale:', error);
    throw error;
  }
};

export const deleteCattleFeedSale = async (id) => {
  try {
    const response = await cattleFeedAPI.deleteSale(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw error;
  }
};

export const getCattleFeedSale = async (id) => {
  try {
    const response = await cattleFeedAPI.getSale(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching sale:', error);
    return null;
  }
};

// Cattle Feed Customers functions
export const getCattleFeedCustomers = async (ownerId = null) => {
  try {
    const response = await cattleFeedAPI.getCustomers(ownerId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const setCattleFeedCustomers = async (customers) => {
  console.warn('setCattleFeedCustomers is deprecated. Use create/update/delete functions instead.');
  return customers;
};

export const addCattleFeedCustomer = async (customer) => {
  try {
    const response = await cattleFeedAPI.createCustomer(customer);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCattleFeedCustomer = async (id, updates) => {
  try {
    const response = await cattleFeedAPI.updateCustomer(id, updates);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCattleFeedCustomer = async (id) => {
  try {
    const response = await cattleFeedAPI.deleteCustomer(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

export const getCattleFeedCustomer = async (id) => {
  try {
    const response = await cattleFeedAPI.getCustomer(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
};

export const getCattleFeedCustomerByPhone = async (phone) => {
  try {
    const response = await cattleFeedAPI.getCustomerByPhone(phone);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching customer by phone:', error);
    return null;
  }
};

export const getCattleFeedCustomerPurchases = async (phone) => {
  try {
    const response = await cattleFeedAPI.getCustomerPurchases(phone);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching customer purchases:', error);
    return [];
  }
};

export const updateCattleFeedCustomerFromSale = async (sale) => {
  // This is handled automatically by the backend when creating a sale
  console.warn('updateCattleFeedCustomerFromSale is deprecated. Customer is updated automatically on sale creation.');
  return null;
};

// Cattle Feed Orders functions
export const getCattleFeedOrders = async (params = {}) => {
  try {
    const response = await cattleFeedAPI.getOrders(params);
    return response.success ? response.orders : [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const updateCattleFeedOrderStatus = async (id, status, notes) => {
  try {
    const response = await cattleFeedAPI.updateOrderStatus(id, status, notes);
    return response.success ? response.order : null;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updateCattleFeedOrderPayment = async (id, updates) => {
  try {
    const response = await cattleFeedAPI.updateOrderPayment(id, updates);
    return response.success ? response.order : null;
  } catch (error) {
    console.error('Error updating order payment:', error);
    throw error;
  }
};

export const deleteCattleFeedOrder = async (id) => {
  try {
    const response = await cattleFeedAPI.deleteOrder(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// ==================== SUPPLIERS & PURCHASE ORDERS ====================

// Suppliers
export const getSuppliers = async (ownerId = null) => {
  try {
    const response = await suppliersAPI.getSuppliers(ownerId);
    return response.success ? response.suppliers : [];
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
};

export const addSupplier = async (supplier) => {
  try {
    const response = await suppliersAPI.createSupplier(supplier);
    return response.success ? response.supplier : null;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
};

export const updateSupplier = async (id, updates) => {
  try {
    const response = await suppliersAPI.updateSupplier(id, updates);
    return response.success ? response.supplier : null;
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw error;
  }
};

export const deleteSupplier = async (id) => {
  try {
    const response = await suppliersAPI.deleteSupplier(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
};

// Purchase Orders
export const getPurchaseOrders = async (ownerId = null) => {
  try {
    const response = await suppliersAPI.getPurchaseOrders(ownerId);
    return response.success ? response.orders : [];
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return [];
  }
};

export const addPurchaseOrder = async (order) => {
  try {
    const response = await suppliersAPI.createPurchaseOrder(order);
    return response.success ? response.order : null;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    throw error;
  }
};

export const updatePurchaseOrder = async (id, updates) => {
  try {
    const response = await suppliersAPI.updatePurchaseOrder(id, updates);
    return response.success ? response.order : null;
  } catch (error) {
    console.error('Error updating purchase order:', error);
    throw error;
  }
};

// Cattle Feed Sellers/Owners functions (now using Users API)
export const getCattleFeedSellers = async (ownerId = null) => {
  try {
    const response = await usersAPI.getUsers({ role: 'cattleFeedSeller', systemType: 'cattleFeed' }, ownerId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return [];
  }
};

export const setCattleFeedSellers = async (sellers) => {
  console.warn('setCattleFeedSellers is deprecated. Use create/update/delete functions instead.');
  return sellers;
};

export const addCattleFeedSeller = async (seller) => {
  try {
    const sellerData = {
      ...seller,
      role: 'cattleFeedSeller',
      systemType: 'cattleFeed',
    };
    const response = await usersAPI.createUser(sellerData);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error creating seller:', error);
    throw error;
  }
};

export const updateCattleFeedSeller = async (id, updates) => {
  try {
    const response = await usersAPI.updateUser(id, updates);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating seller:', error);
    throw error;
  }
};

export const deleteCattleFeedSeller = async (id) => {
  try {
    const response = await usersAPI.deleteUser(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting seller:', error);
    throw error;
  }
};

export const getCattleFeedSeller = async (id) => {
  try {
    const response = await usersAPI.getUser(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching seller:', error);
    return null;
  }
};

export const getCattleFeedSellerByUsername = async (username) => {
  try {
    const sellers = await getCattleFeedSellers();
    return sellers.find(seller => seller.username === username) || null;
  } catch (error) {
    console.error('Error fetching seller by username:', error);
    return null;
  }
};

export const getCattleFeedSellerByPhone = async (phoneNumber) => {
  try {
    const response = await usersAPI.getUserByPhone(phoneNumber);
    if (response.success && response.data.role === 'cattleFeedSeller') {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching seller by phone:', error);
    return null;
  }
};

// Cattle Feed Owners functions
export const getCattleFeedOwners = async () => {
  try {
    const response = await usersAPI.getUsers({ role: 'cattleFeedOwner', systemType: 'cattleFeed' });
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching cattle feed owners:', error);
    return [];
  }
};

export const setCattleFeedOwners = async (owners) => {
  console.warn('setCattleFeedOwners is deprecated. Use create/update/delete functions instead.');
  return owners;
};

export const getPendingCattleFeedOwners = async () => {
  try {
    const response = await usersAPI.getUsers({
      role: 'cattleFeedOwner',
      systemType: 'cattleFeed',
      onboardingStatus: 'pending',
      isActive: 'false'
    });
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching pending cattle feed owners:', error);
    return [];
  }
};

export const approveCattleFeedOwner = async (id, updates = {}) => {
  try {
    const response = await usersAPI.updateUser(id, {
      isActive: true,
      onboardingStatus: 'approved',
      ...updates
    });
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error approving cattle feed owner:', error);
    throw error;
  }
};

export const addCattleFeedOwner = async (owner) => {
  try {
    const ownerData = {
      ...owner,
      role: 'cattleFeedOwner',
      systemType: 'cattleFeed',
    };
    const response = await usersAPI.createUser(ownerData);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error creating cattle feed owner:', error);
    throw error;
  }
};

export const updateCattleFeedOwner = async (id, updates) => {
  try {
    const response = await usersAPI.updateUser(id, updates);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating cattle feed owner:', error);
    throw error;
  }
};

export const deleteCattleFeedOwner = async (id) => {
  try {
    const response = await usersAPI.deleteUser(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting cattle feed owner:', error);
    throw error;
  }
};

export const getCattleFeedOwner = async (id) => {
  try {
    const response = await usersAPI.getUser(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching cattle feed owner:', error);
    return null;
  }
};

export const getCattleFeedOwnerByUsername = async (username) => {
  try {
    const owners = await getCattleFeedOwners();
    return owners.find(owner => owner.username === username) || null;
  } catch (error) {
    console.error('Error fetching owner by username:', error);
    return null;
  }
};

export const getCattleFeedOwnerByPhone = async (phoneNumber) => {
  try {
    const response = await usersAPI.getUserByPhone(phoneNumber);
    if (response.success && response.data.role === 'cattleFeedOwner') {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching owner by phone:', error);
    return null;
  }
};

// ==================== MILK TRUCK SYSTEM ====================

// Milk Truck Owners functions
export const getMilkTruckOwners = async () => {
  try {
    const response = await usersAPI.getUsers({ role: 'milkTruckOwner', systemType: 'milkTruck' });
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching milk truck owners:', error);
    return [];
  }
};

export const setMilkTruckOwners = async (owners) => {
  console.warn('setMilkTruckOwners is deprecated. Use create/update/delete functions instead.');
  return owners;
};

export const getPendingMilkTruckOwners = async () => {
  try {
    const response = await usersAPI.getUsers({
      role: 'milkTruckOwner',
      systemType: 'milkTruck',
      onboardingStatus: 'pending',
      isActive: 'false' // Explicitly ask for inactive
    });
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching pending milk truck owners:', error);
    return [];
  }
};

export const approveMilkTruckOwner = async (id, updates = {}) => {
  try {
    const response = await usersAPI.updateUser(id, {
      isActive: true,
      onboardingStatus: 'approved',
      ...updates
    });
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error approving milk truck owner:', error);
    throw error;
  }
};

export const addMilkTruckOwner = async (owner) => {
  try {
    const ownerData = {
      ...owner,
      role: 'milkTruckOwner',
      systemType: 'milkTruck',
    };
    const response = await usersAPI.createUser(ownerData);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error creating milk truck owner:', error);
    throw error;
  }
};

export const updateMilkTruckOwner = async (id, updates) => {
  try {
    const response = await usersAPI.updateUser(id, updates);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating milk truck owner:', error);
    throw error;
  }
};

export const deleteMilkTruckOwner = async (id) => {
  try {
    const response = await usersAPI.deleteUser(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting milk truck owner:', error);
    throw error;
  }
};

export const getMilkTruckOwner = async (id) => {
  try {
    const response = await usersAPI.getUser(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching milk truck owner:', error);
    return null;
  }
};

export const getMilkTruckOwnerByPhone = async (phoneNumber) => {
  try {
    const response = await usersAPI.getUserByPhone(phoneNumber);
    if (response.success && response.data.role === 'milkTruckOwner') {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching milk truck owner by phone:', error);
    return null;
  }
};

// Milk Truck Drivers functions
export const getMilkTruckDrivers = async (ownerId = null) => {
  try {
    const response = await usersAPI.getUsers({ role: 'milkTruckDriver', systemType: 'milkTruck' }, ownerId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching milk truck drivers:', error);
    return [];
  }
};

export const setMilkTruckDrivers = async (drivers) => {
  console.warn('setMilkTruckDrivers is deprecated. Use create/update/delete functions instead.');
  return drivers;
};

export const addMilkTruckDriver = async (driver) => {
  try {
    const driverData = {
      ...driver,
      role: 'milkTruckDriver',
      systemType: 'milkTruck',
      isActive: true,
    };
    const response = await usersAPI.createUser(driverData);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error creating milk truck driver:', error);
    throw error;
  }
};

export const updateMilkTruckDriver = async (id, updates) => {
  try {
    const response = await usersAPI.updateUser(id, updates);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating milk truck driver:', error);
    throw error;
  }
};

export const deleteMilkTruckDriver = async (id) => {
  try {
    const response = await usersAPI.deleteUser(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting milk truck driver:', error);
    throw error;
  }
};

export const getMilkTruckDriver = async (id) => {
  try {
    const response = await usersAPI.getUser(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching milk truck driver:', error);
    return null;
  }
};

export const getMilkTruckDriverByPhone = async (phoneNumber) => {
  try {
    const response = await usersAPI.getUserByPhone(phoneNumber);
    if (response.success && response.data.role === 'milkTruckDriver') {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching milk truck driver by phone:', error);
    return null;
  }
};

// Milk Truck BMCs functions
export const getMilkTruckBMCs = async (ownerId = null) => {
  try {
    const response = await milkTruckAPI.getBMCs(ownerId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching BMCs:', error);
    return [];
  }
};

export const getMilkTruckBMCHistory = async (id) => {
  try {
    const response = await milkTruckAPI.getBMCHistory(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching BMC history:', error);
    return null;
  }
};

export const setMilkTruckBMCs = async (bmcs) => {
  console.warn('setMilkTruckBMCs is deprecated. Use create/update/delete functions instead.');
  return bmcs;
};

export const addMilkTruckBMC = async (bmc) => {
  try {
    const response = await milkTruckAPI.createBMC(bmc);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error creating BMC:', error);
    throw error;
  }
};

export const updateMilkTruckBMC = async (id, updates) => {
  try {
    const response = await milkTruckAPI.updateBMC(id, updates);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating BMC:', error);
    throw error;
  }
};

export const deleteMilkTruckBMC = async (id) => {
  try {
    const response = await milkTruckAPI.deleteBMC(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting BMC:', error);
    throw error;
  }
};

export const getMilkTruckBMC = async (id) => {
  try {
    const response = await milkTruckAPI.getBMC(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching BMC:', error);
    return null;
  }
};

// Milk Truck Vehicles functions
export const getMilkTruckVehicles = async (ownerId = null) => {
  try {
    const response = await milkTruckAPI.getVehicles(ownerId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
};

export const setMilkTruckVehicles = async (vehicles) => {
  console.warn('setMilkTruckVehicles is deprecated. Use create/update/delete functions instead.');
  return vehicles;
};

export const addMilkTruckVehicle = async (vehicle) => {
  try {
    const response = await milkTruckAPI.createVehicle(vehicle);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

export const updateMilkTruckVehicle = async (id, updates) => {
  try {
    const response = await milkTruckAPI.updateVehicle(id, updates);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating vehicle:', error);
    throw error;
  }
};

export const deleteMilkTruckVehicle = async (id) => {
  try {
    const response = await milkTruckAPI.deleteVehicle(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    throw error;
  }
};

export const getMilkTruckVehicle = async (id) => {
  try {
    const response = await milkTruckAPI.getVehicle(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return null;
  }
};

// Milk Truck Routes functions
export const getMilkTruckRoutes = async (ownerId = null) => {
  try {
    const response = await milkTruckAPI.getRoutes(ownerId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
};

export const setMilkTruckRoutes = async (routes) => {
  console.warn('setMilkTruckRoutes is deprecated. Use create/update/delete functions instead.');
  return routes;
};

export const addMilkTruckRoute = async (route) => {
  try {
    const response = await milkTruckAPI.createRoute(route);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error creating route:', error);
    throw error;
  }
};

export const updateMilkTruckRoute = async (id, updates) => {
  try {
    const response = await milkTruckAPI.updateRoute(id, updates);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating route:', error);
    throw error;
  }
};

export const deleteMilkTruckRoute = async (id) => {
  try {
    const response = await milkTruckAPI.deleteRoute(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting route:', error);
    throw error;
  }
};

export const getMilkTruckRoute = async (id) => {
  try {
    const response = await milkTruckAPI.getRoute(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
};

// Milk Truck Trips functions
export const getMilkTruckTrips = async (ownerId = null) => {
  try {
    const response = await milkTruckAPI.getTrips(ownerId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching trips:', error);
    return [];
  }
};

export const setMilkTruckTrips = async (trips) => {
  console.warn('setMilkTruckTrips is deprecated. Use create/update/delete functions instead.');
  return trips;
};

export const addMilkTruckTrip = async (trip) => {
  try {
    const response = await milkTruckAPI.createTrip(trip);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};

export const updateMilkTruckTrip = async (id, updates) => {
  try {
    const response = await milkTruckAPI.updateTrip(id, updates);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

export const deleteMilkTruckTrip = async (id) => {
  try {
    const response = await milkTruckAPI.deleteTrip(id);
    return response.success;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

export const addBMCCollectionEntry = async (tripId, data) => {
  try {
    const response = await milkTruckAPI.addBMCEntry(tripId, data);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error adding BMC entry:', error);
    throw error;
  }
};

export const getMilkTruckTrip = async (id) => {
  // Validate ID format (MongoDB ObjectId is 24 hex characters)
  if (!id || typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
    // console.warn('Invalid trip ID format, skipping API call:', id);
    return null;
  }

  try {
    const response = await milkTruckAPI.getTrip(id);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error fetching trip:', error);
    return null;
  }
};

// Milk Truck Pricing functions
export const getMilkTruckPricing = async () => {
  try {
    const response = await milkTruckAPI.getPricing();
    return response.success ? response.data : {};
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return {};
  }
};

export const setMilkTruckPricing = async (pricing) => {
  try {
    const response = await milkTruckAPI.updatePricing(pricing);
    return response.success ? response.data : null;
  } catch (error) {
    console.error('Error updating pricing:', error);
    throw error;
  }
};

// ==================== USER FUNCTIONS ====================

// Current user functions (now using JWT token)
export const getCurrentUser = () => {
  // Return null - user data should come from API
  // This is kept for backward compatibility
  return null;
};

export const setCurrentUser = (user) => {
  // No longer storing user in localStorage
  // User data comes from JWT token
  console.warn('setCurrentUser is deprecated. User data comes from JWT token.');
};

export const clearCurrentUser = () => {
  // Clear token instead
  removeToken();
};

// ==================== INITIALIZATION ====================

export const initializeStorage = async (initialData) => {
  // No longer initializing localStorage
  // Data comes from backend API
  console.warn('initializeStorage is deprecated. Data comes from backend API.');
  return true;
};
