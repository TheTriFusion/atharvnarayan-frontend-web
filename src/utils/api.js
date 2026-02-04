// API utility functions for making requests to backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.thetrifusion.in/api';

// Request cache to prevent duplicate calls
const requestCache = new Map();
const pendingRequests = new Map();

// Get JWT token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Set JWT token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove JWT token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Check if we're on login page
const isLoginPage = () => {
  return window.location.pathname === '/login';
};

// Generic API request function with request deduplication
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;

  // Create a unique key for this request
  const requestKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`;

  // If there's a pending request with the same key, return it
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  // Create the request promise
  const requestPromise = (async () => {
    try {
      const response = await fetch(url, config);

      // Handle network errors
      if (!response.ok && response.status === 0) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, create error message
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          removeToken();
          // Only redirect if not already on login page to prevent loops
          if (!isLoginPage()) {
            window.location.href = '/login';
          }
        }
        throw new Error(data.message || `Request failed: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error) {
      // Handle network/fetch errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('Network Error: Backend server may not be running or CORS issue');
        throw new Error('Cannot connect to server. Please ensure the backend is running on https://api.thetrifusion.in');
      }
      console.error('API Error:', error);
      throw error;
    } finally {
      // Remove from pending requests after completion
      pendingRequests.delete(requestKey);
    }
  })();

  // Store the pending request
  pendingRequests.set(requestKey, requestPromise);

  return requestPromise;
};

// Auth API
export const authAPI = {
  // Regular user login (owners, drivers, sellers)
  login: async (phoneNumber, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: { phoneNumber, password },
    });
    if (response.success && response.token) {
      setToken(response.token);
    }
    return response;
  },
  // Super admin login
  loginSuperAdmin: async (phoneNumber, password) => {
    const response = await apiRequest('/auth/login/superadmin', {
      method: 'POST',
      body: { phoneNumber, password },
    });
    if (response.success && response.token) {
      setToken(response.token);
    }
    return response;
  },
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },
  getCurrentUser: async () => {
    // Don't call if no token exists
    if (!getToken()) {
      return { success: false, message: 'No token' };
    }
    return apiRequest('/auth/me');
  },
  logout: () => {
    removeToken();
  },
};

// Cattle Feed API
export const cattleFeedAPI = {
  // Inventory
  getInventory: (ownerId = null) => {
    const url = ownerId ? `/cattle-feed/inventory?ownerId=${ownerId}` : '/cattle-feed/inventory';
    return apiRequest(url);
  },
  getInventoryItem: (id) => apiRequest(`/cattle-feed/inventory/${id}`),
  createInventory: (data) => apiRequest('/cattle-feed/inventory', { method: 'POST', body: data }),
  updateInventory: (id, data) => apiRequest(`/cattle-feed/inventory/${id}`, { method: 'PUT', body: data }),
  deleteInventory: (id) => apiRequest(`/cattle-feed/inventory/${id}`, { method: 'DELETE' }),

  // Sales
  getSales: (ownerId = null) => {
    const url = ownerId ? `/cattle-feed/sales?ownerId=${ownerId}` : '/cattle-feed/sales';
    return apiRequest(url);
  },
  getSale: (id) => apiRequest(`/cattle-feed/sales/${id}`),
  createSale: (data) => apiRequest('/cattle-feed/sales', { method: 'POST', body: data }),
  updateSale: (id, data) => apiRequest(`/cattle-feed/sales/${id}`, { method: 'PUT', body: data }),
  deleteSale: (id) => apiRequest(`/cattle-feed/sales/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: (ownerId = null) => {
    const url = ownerId ? `/cattle-feed/customers?ownerId=${ownerId}` : '/cattle-feed/customers';
    return apiRequest(url);
  },
  getCustomer: (id) => apiRequest(`/cattle-feed/customers/${id}`),
  getCustomerByPhone: (phone) => apiRequest(`/cattle-feed/customers/phone/${phone}`),
  getCustomerPurchases: (phone) => apiRequest(`/cattle-feed/customers/phone/${phone}/purchases`),
  createCustomer: (data) => apiRequest('/cattle-feed/customers', { method: 'POST', body: data }),
  updateCustomer: (id, data) => apiRequest(`/cattle-feed/customers/${id}`, { method: 'PUT', body: data }),
  deleteCustomer: (id) => apiRequest(`/cattle-feed/customers/${id}`, { method: 'DELETE' }),
  // Customer Orders
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/customer-orders${queryString ? `?${queryString}` : ''}`);
  },
  getOrder: (id) => apiRequest(`/customer-orders/${id}`),
  updateOrderStatus: (id, status, notes) => apiRequest(`/customer-orders/${id}/status`, {
    method: 'PUT',
    body: { status, notes }
  }),
  updateOrderPayment: (id, data) => apiRequest(`/customer-orders/${id}/payment`, {
    method: 'PUT',
    body: data
  }),
  deleteOrder: (id) => apiRequest(`/customer-orders/${id}`, { method: 'DELETE' }),
};

// Suppliers API
export const suppliersAPI = {
  // Suppliers
  getSuppliers: (ownerId = null) => {
    const url = ownerId ? `/suppliers?ownerId=${ownerId}` : '/suppliers';
    return apiRequest(url);
  },
  createSupplier: (data) => apiRequest('/suppliers', { method: 'POST', body: data }),
  updateSupplier: (id, data) => apiRequest(`/suppliers/${id}`, { method: 'PUT', body: data }),
  deleteSupplier: (id) => apiRequest(`/suppliers/${id}`, { method: 'DELETE' }),

  // Purchase Orders
  getPurchaseOrders: (ownerId = null) => {
    const url = ownerId ? `/suppliers/purchase-orders?ownerId=${ownerId}` : '/suppliers/purchase-orders';
    return apiRequest(url);
  },
  createPurchaseOrder: (data) => apiRequest('/suppliers/purchase-orders', { method: 'POST', body: data }),
  updatePurchaseOrder: (id, data) => apiRequest(`/suppliers/purchase-orders/${id}`, { method: 'PUT', body: data }),
};

// Milk Truck API
export const milkTruckAPI = {
  // BMCs
  getBMCs: (ownerId = null) => {
    const url = ownerId ? `/milk-truck/bmcs?ownerId=${ownerId}` : '/milk-truck/bmcs';
    return apiRequest(url);
  },
  getBMC: (id) => apiRequest(`/milk-truck/bmcs/${id}`),
  createBMC: (data) => apiRequest('/milk-truck/bmcs', { method: 'POST', body: data }),
  updateBMC: (id, data) => apiRequest(`/milk-truck/bmcs/${id}`, { method: 'PUT', body: data }),
  deleteBMC: (id) => apiRequest(`/milk-truck/bmcs/${id}`, { method: 'DELETE' }),
  getBMCHistory: (id) => apiRequest(`/milk-truck/bmcs/${id}/history`),

  // Vehicles
  getVehicles: (ownerId = null) => {
    const url = ownerId ? `/milk-truck/vehicles?ownerId=${ownerId}` : '/milk-truck/vehicles';
    return apiRequest(url);
  },
  getVehicle: (id) => apiRequest(`/milk-truck/vehicles/${id}`),
  createVehicle: (data) => apiRequest('/milk-truck/vehicles', { method: 'POST', body: data }),
  updateVehicle: (id, data) => apiRequest(`/milk-truck/vehicles/${id}`, { method: 'PUT', body: data }),
  deleteVehicle: (id) => apiRequest(`/milk-truck/vehicles/${id}`, { method: 'DELETE' }),

  // Routes
  getRoutes: (ownerId = null) => {
    const url = ownerId ? `/milk-truck/routes?ownerId=${ownerId}` : '/milk-truck/routes';
    return apiRequest(url);
  },
  getRoute: (id) => apiRequest(`/milk-truck/routes/${id}`),
  createRoute: (data) => apiRequest('/milk-truck/routes', { method: 'POST', body: data }),
  updateRoute: (id, data) => apiRequest(`/milk-truck/routes/${id}`, { method: 'PUT', body: data }),
  deleteRoute: (id) => apiRequest(`/milk-truck/routes/${id}`, { method: 'DELETE' }),

  // Trips
  getTrips: (ownerId = null) => {
    const url = ownerId ? `/milk-truck/trips?ownerId=${ownerId}` : '/milk-truck/trips';
    return apiRequest(url);
  },
  getTrip: (id) => apiRequest(`/milk-truck/trips/${id}`),
  createTrip: (data) => apiRequest('/milk-truck/trips', { method: 'POST', body: data }),
  updateTrip: (id, data) => apiRequest(`/milk-truck/trips/${id}`, { method: 'PUT', body: data }),
  deleteTrip: (id) => apiRequest(`/milk-truck/trips/${id}`, { method: 'DELETE' }),
  addBMCEntry: (id, data) => apiRequest(`/milk-truck/trips/${id}/bmc-entry`, { method: 'POST', body: data }),
  getBMCEntry: (tripId, bmcId) => apiRequest(`/milk-truck/trips/${tripId}/bmc-entry/${bmcId}`),


  // Pricing
  getPricing: () => apiRequest('/milk-truck/pricing'),
  updatePricing: (data) => apiRequest('/milk-truck/pricing', { method: 'PUT', body: data }),
};

// Users API
export const usersAPI = {
  getUsers: (params = {}, ownerId = null) => {
    const allParams = { ...params };
    if (ownerId) {
      allParams.ownerId = ownerId;
    }
    const queryString = new URLSearchParams(allParams).toString();
    return apiRequest(`/users${queryString ? `?${queryString}` : ''}`);
  },
  getUser: (id) => apiRequest(`/users/${id}`),
  getUserByPhone: (phoneNumber) => apiRequest(`/users/phone/${phoneNumber}`),
  createUser: (data) => apiRequest('/users', { method: 'POST', body: data }),
  updateUser: (id, data) => apiRequest(`/users/${id}`, { method: 'PUT', body: data }),
  deleteUser: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
};
