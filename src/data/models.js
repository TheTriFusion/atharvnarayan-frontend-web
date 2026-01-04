// Unified initial data for Atharvnarayana

// Generate 50 BMCs
const generateBMCs = () => {
  const bmcs = [];
  const locations = [
    'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur',
    'Sangli', 'Satara', 'Ratnagiri', 'Jalgaon', 'Akola', 'Latur', 'Ahmednagar', 'Chandrapur',
    'Parbhani', 'Ichalkaranji', 'Jalna', 'Bhusawal', 'Panvel', 'Baramati', 'Yavatmal', 'Kamptee',
    'Gondia', 'Wardha', 'Udgir', 'Osmanabad', 'Nanded', 'Beed', 'Hinganghat', 'Khamgaon',
    'Washim', 'Malkapur', 'Buldhana', 'Jalna', 'Ambajogai', 'Pusad', 'Arvi', 'Pandharpur',
    'Shirpur', 'Dhule', 'Nandurbar', 'Malegaon', 'Barshi', 'Pathri', 'Manmad', 'Kopargaon',
    'Shrirampur', 'Rahuri', 'Sangamner', 'Shirdi'
  ];
  
  for (let i = 1; i <= 50; i++) {
    const locationIndex = (i - 1) % locations.length;
    bmcs.push({
      id: `bmc${i}`,
      name: `BMC ${String.fromCharCode(64 + ((i - 1) % 26) + 1)}${i > 26 ? Math.floor((i - 1) / 26) : ''}`,
      location: locations[locationIndex] || `Location ${i}`,
      contact: `1234567${String(i).padStart(3, '0')}`,
    });
  }
  return bmcs;
};

export const initialData = {
  cattleFeed: {
    inventory: [
      {
        id: 'inv-1',
        name: 'Premium Cattle Feed',
        category: 'Cattle Feed',
        quantity: 500,
        unit: 'kg',
        wholesalePrice: 45,
        retailPrice: 55,
        supplier: 'ABC Feed Suppliers',
        expiryDate: '2025-12-31',
        description: 'High-quality premium feed for dairy cattle',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      },
      {
        id: 'inv-2',
        name: 'Standard Cattle Feed',
        category: 'Cattle Feed',
        quantity: 750,
        unit: 'kg',
        wholesalePrice: 35,
        retailPrice: 42,
        supplier: 'XYZ Feed Company',
        expiryDate: '2025-11-30',
        description: 'Standard feed for general cattle',
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString(),
      },
      {
        id: 'inv-3',
        name: 'Poultry Starter Feed',
        category: 'Poultry Feed',
        quantity: 300,
        unit: 'bag',
        wholesalePrice: 850,
        retailPrice: 950,
        supplier: 'Poultry Feed Ltd',
        expiryDate: '2025-10-15',
        description: 'Starter feed for young poultry',
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date('2024-02-01').toISOString(),
      },
      {
        id: 'inv-4',
        name: 'Goat Feed Mix',
        category: 'Goat Feed',
        quantity: 200,
        unit: 'kg',
        wholesalePrice: 40,
        retailPrice: 48,
        supplier: 'Livestock Feed Co',
        expiryDate: '2025-09-20',
        description: 'Nutritional feed mix for goats',
        createdAt: new Date('2024-02-10').toISOString(),
        updatedAt: new Date('2024-02-10').toISOString(),
      },
      {
        id: 'inv-5',
        name: 'Sheep Feed Pellets',
        category: 'Sheep Feed',
        quantity: 150,
        unit: 'kg',
        wholesalePrice: 38,
        retailPrice: 45,
        supplier: 'Farm Feed Solutions',
        expiryDate: '2025-08-30',
        description: 'Pelletized feed for sheep',
        createdAt: new Date('2024-02-15').toISOString(),
        updatedAt: new Date('2024-02-15').toISOString(),
      },
      {
        id: 'inv-6',
        name: 'Cattle Mineral Supplement',
        category: 'Cattle Feed',
        quantity: 40,
        unit: 'kg',
        wholesalePrice: 120,
        retailPrice: 150,
        supplier: 'ABC Feed Suppliers',
        expiryDate: '2026-06-30',
        description: 'Mineral supplement for cattle health',
        createdAt: new Date('2024-03-01').toISOString(),
        updatedAt: new Date('2024-03-01').toISOString(),
      },
    ],
    sales: [
      {
        id: 'sale-1',
        saleType: 'wholesale',
        customerName: 'Farm A',
        customerPhone: '9876543210',
        items: [
          {
            inventoryId: 'inv-1',
            itemName: 'Premium Cattle Feed',
            quantity: 100,
            unitPrice: 45,
            total: 4500,
          },
        ],
        totalAmount: 4500,
        date: new Date('2024-03-05').toISOString(),
        createdAt: new Date('2024-03-05').toISOString(),
      },
      {
        id: 'sale-2',
        saleType: 'retail',
        customerName: 'John Doe',
        customerPhone: '9876543211',
        items: [
          {
            inventoryId: 'inv-2',
            itemName: 'Standard Cattle Feed',
            quantity: 25,
            unitPrice: 42,
            total: 1050,
          },
        ],
        totalAmount: 1050,
        date: new Date('2024-03-06').toISOString(),
        createdAt: new Date('2024-03-06').toISOString(),
      },
      {
        id: 'sale-3',
        saleType: 'wholesale',
        customerName: 'Farm B',
        customerPhone: '9876543212',
        items: [
          {
            inventoryId: 'inv-3',
            itemName: 'Poultry Starter Feed',
            quantity: 10,
            unitPrice: 850,
            total: 8500,
          },
        ],
        totalAmount: 8500,
        date: new Date('2024-03-07').toISOString(),
        createdAt: new Date('2024-03-07').toISOString(),
      },
    ],
    sellers: [
      {
        id: 'seller1',
        name: 'Seller 1',
        username: 'seller1',
        password: 'seller123',
        role: 'seller',
        systemType: 'cattleFeed',
        phone: '9876543210',
        phoneNumber: '9876543210',
        email: 'seller1@example.com',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
      },
      {
        id: 'seller2',
        name: 'Seller 2',
        username: 'seller2',
        password: 'seller123',
        role: 'seller',
        systemType: 'cattleFeed',
        phone: '9876543211',
        phoneNumber: '9876543211',
        email: 'seller2@example.com',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
      },
    ],
    customers: [
      {
        id: 'customer-1',
        name: 'Farm A',
        phone: '9876543210',
        email: 'farma@example.com',
        totalPurchases: 1,
        totalAmount: 4500,
        lastPurchaseDate: new Date('2024-03-05').toISOString(),
        createdAt: new Date('2024-03-05').toISOString(),
        updatedAt: new Date('2024-03-05').toISOString(),
      },
      {
        id: 'customer-2',
        name: 'John Doe',
        phone: '9876543211',
        email: 'johndoe@example.com',
        totalPurchases: 1,
        totalAmount: 1050,
        lastPurchaseDate: new Date('2024-03-06').toISOString(),
        createdAt: new Date('2024-03-06').toISOString(),
        updatedAt: new Date('2024-03-06').toISOString(),
      },
      {
        id: 'customer-3',
        name: 'Farm B',
        phone: '9876543212',
        email: 'farmb@example.com',
        totalPurchases: 1,
        totalAmount: 8500,
        lastPurchaseDate: new Date('2024-03-07').toISOString(),
        createdAt: new Date('2024-03-07').toISOString(),
        updatedAt: new Date('2024-03-07').toISOString(),
      },
    ],
    owners: [
      {
        id: 'cf-owner1',
        name: 'Cattle Feed Admin',
        username: 'cfadmin',
        password: 'cfadmin123',
        role: 'cattleFeedOwner',
        systemType: 'cattleFeed',
        phone: '9876543200',
        phoneNumber: '9876543200',
        email: 'cfadmin@example.com',
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
      },
    ],
  },
  milkTruck: {
    owners: [
      { 
        id: 'owner1', 
        name: 'Milk Truck Owner', 
        phoneNumber: '9876543210', 
        password: 'owner123', 
        role: 'milkTruckOwner',
        systemType: 'milkTruck',
      },
    ],
    bmcs: generateBMCs(),
    vehicles: [
      { id: 'v1', registrationNumber: 'MH-12-ABCD', capacity: 10000, assignedDriver: 'd1' },
      { id: 'v2', registrationNumber: 'MH-12-EFGH', capacity: 12000, assignedDriver: 'd1' },
      { id: 'v3', registrationNumber: 'MH-12-IJKL', capacity: 8000, assignedDriver: 'd2' },
      { id: 'v4', registrationNumber: 'MH-12-MNOP', capacity: 15000, assignedDriver: 'd2' },
      { id: 'v5', registrationNumber: 'MH-12-QRST', capacity: 10000, assignedDriver: 'd1' },
    ],
    drivers: [
      { 
        id: 'd1', 
        name: 'Driver 1', 
        licenseNumber: 'DL12345', 
        phoneNumber: '1234567890', 
        password: 'driver1', 
        role: 'driver',
        systemType: 'milkTruck',
        assignedVehicles: ['v1', 'v2', 'v5'] 
      },
      { 
        id: 'd2', 
        name: 'Driver 2', 
        licenseNumber: 'DL67890', 
        phoneNumber: '1234567891', 
        password: 'driver2', 
        role: 'driver',
        systemType: 'milkTruck',
        assignedVehicles: ['v3', 'v4'] 
      },
    ],
    routes: [
      { 
        id: 'r1', 
        name: 'Route 1: Mumbai Region -> Dairy', 
        bmcSequence: ['bmc1', 'bmc2', 'bmc3', 'bmc4', 'bmc5', 'bmc6', 'bmc7', 'bmc8', 'bmc9', 'bmc10'], 
        vehicleId: 'v1', 
        driverId: 'd1' 
      },
      { 
        id: 'r2', 
        name: 'Route 2: Pune Region -> Dairy', 
        bmcSequence: ['bmc11', 'bmc12', 'bmc13', 'bmc14', 'bmc15', 'bmc16', 'bmc17', 'bmc18', 'bmc19', 'bmc20'], 
        vehicleId: 'v2', 
        driverId: 'd1' 
      },
      { 
        id: 'r3', 
        name: 'Route 3: Nagpur Region -> Dairy', 
        bmcSequence: ['bmc21', 'bmc22', 'bmc23', 'bmc24', 'bmc25', 'bmc26', 'bmc27', 'bmc28', 'bmc29', 'bmc30'], 
        vehicleId: 'v3', 
        driverId: 'd2' 
      },
      { 
        id: 'r4', 
        name: 'Route 4: Nashik Region -> Dairy', 
        bmcSequence: ['bmc31', 'bmc32', 'bmc33', 'bmc34', 'bmc35', 'bmc36', 'bmc37', 'bmc38', 'bmc39', 'bmc40'], 
        vehicleId: 'v4', 
        driverId: 'd2' 
      },
      { 
        id: 'r5', 
        name: 'Route 5: Aurangabad Region -> Dairy', 
        bmcSequence: ['bmc41', 'bmc42', 'bmc43', 'bmc44', 'bmc45', 'bmc46', 'bmc47', 'bmc48', 'bmc49', 'bmc50'], 
        vehicleId: 'v5', 
        driverId: 'd1' 
      },
    ],
    trips: [],
    pricing: {
      basePricePerLiter: 50,
      fatPricePerPercent: 2,
      snfPricePerPercent: 1,
    },
  },
};

