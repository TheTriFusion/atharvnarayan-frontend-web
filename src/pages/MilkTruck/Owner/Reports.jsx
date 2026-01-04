import { useState, useEffect } from 'react';
import { getMilkTruckTrips, getMilkTruckBMCs, getMilkTruckVehicles, getMilkTruckDrivers, getMilkTruckRoutes, getMilkTruckPricing } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';

const Reports = () => {
  const { isSuperAdmin } = useAuth();
  const { selectedOwnerId } = useOwner();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    vehicleId: '',
    driverId: '',
  });
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [bmcs, setBMCs] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, [selectedOwnerId]);

  useEffect(() => {
    applyFilters();
  }, [filters, trips]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const ownerId = isSuperAdmin ? selectedOwnerId : null;
      const [tripsData, vehiclesData, driversData, routesData, bmcsData, pricingData] = await Promise.all([
        getMilkTruckTrips(ownerId),
        getMilkTruckVehicles(ownerId),
        getMilkTruckDrivers(ownerId),
        getMilkTruckRoutes(ownerId),
        getMilkTruckBMCs(ownerId),
        getMilkTruckPricing(),
      ]);

      const tripsArray = Array.isArray(tripsData) ? tripsData : [];
      const completedTrips = tripsArray.filter(t => t.status === 'completed');
      
      setTrips(completedTrips);
      setFilteredTrips(completedTrips);
      setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      setDrivers(Array.isArray(driversData) ? driversData : []);
      setRoutes(Array.isArray(routesData) ? routesData : []);
      setBMCs(Array.isArray(bmcsData) ? bmcsData : []);
      setPricing(pricingData || { basePricePerLiter: 50, fatPricePerPercent: 2, snfPricePerPercent: 1 });
    } catch (error) {
      console.error('Error loading reports data:', error);
      setPricing({ basePricePerLiter: 50, fatPricePerPercent: 2, snfPricePerPercent: 1 });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trips];

    if (filters.startDate) {
      filtered = filtered.filter(t => 
        new Date(t.startTime) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(t => 
        new Date(t.startTime) <= new Date(filters.endDate)
      );
    }

    if (filters.vehicleId) {
      filtered = filtered.filter(t => t.vehicleId === filters.vehicleId);
    }

    if (filters.driverId) {
      filtered = filtered.filter(t => t.driverId === filters.driverId);
    }

    setFilteredTrips(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const calculateTripPayment = (trip) => {
    if (!trip.dairyConfirmation || !pricing) return 0;

    const { totalMilkQuantity, fatContent, snfContent } = trip.dairyConfirmation;
    const baseAmount = pricing.basePricePerLiter * totalMilkQuantity;
    const fatAmount = pricing.fatPricePerPercent * fatContent * totalMilkQuantity;
    const snfAmount = pricing.snfPricePerPercent * snfContent * totalMilkQuantity;

    return baseAmount + fatAmount + snfAmount;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports</h1>
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports data...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isSuperAdmin && <OwnerSelector systemType="milkTruck" />}
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports</h1>

      <Card title="Filters" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
          <Input
            label="End Date"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
          <select
            name="vehicleId"
            value={filters.vehicleId}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.registrationNumber}</option>
            ))}
          </select>
          <select
            name="driverId"
            value={filters.driverId}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Drivers</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card title={`Completed Trips (${filteredTrips.length})`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trip ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Milk (L)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment (₹)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrips.map((trip) => {
                const vehicle = Array.isArray(vehicles) ? vehicles.find(v => (v._id || v.id) === trip.vehicleId) : null;
                const driver = Array.isArray(drivers) ? drivers.find(d => (d._id || d.id) === trip.driverId) : null;
                const payment = calculateTripPayment(trip);
                
                return (
                  <tr key={trip.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{trip.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {vehicle?.registrationNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{driver?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(trip.endTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {trip.dairyConfirmation?.totalMilkQuantity?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ₹{payment.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedTrip(trip)}
                        className="text-xs px-2 py-1"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Trip Details</h2>
              <Button variant="secondary" onClick={() => setSelectedTrip(null)}>
                Close
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Trip Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Trip ID</p>
                    <p className="font-medium">{selectedTrip.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-medium">
                      {(Array.isArray(vehicles) ? vehicles.find(v => (v._id || v.id) === selectedTrip.vehicleId) : null)?.registrationNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Driver</p>
                    <p className="font-medium">
                      {(Array.isArray(drivers) ? drivers.find(d => (d._id || d.id) === selectedTrip.driverId) : null)?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Route</p>
                    <p className="font-medium">
                      {(Array.isArray(routes) ? routes.find(r => (r._id || r.id) === selectedTrip.routeId) : null)?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <p className="font-medium">
                      {new Date(selectedTrip.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Time</p>
                    <p className="font-medium">
                      {selectedTrip.endTime ? new Date(selectedTrip.endTime).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">BMC Collection Details - All 3 Forms</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">BMC</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Form 1 (Initial)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Form 2 (Confirm)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">F2-F1 Diff</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Form 3 (Dairy)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">F3-F2 Diff</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedTrip.bmcEntries.map((entry) => {
                        const bmc = Array.isArray(bmcs) ? bmcs.find(b => (b._id || b.id) === entry.bmcId) : null;
                        const f1 = entry.form1Data;
                        const f2 = entry.form2Data;
                        const f3 = entry.form3Data;
                        
                        // Calculate differences with liter-based calculations
                        const diff1 = f1 && f2 ? (() => {
                          const f1FatLiters = (f1.milkQuantity * f1.fatContent) / 100;
                          const f1SNFLiters = (f1.milkQuantity * f1.snfContent) / 100;
                          const f2FatLiters = (f2.milkQuantity * f2.fatContent) / 100;
                          const f2SNFLiters = (f2.milkQuantity * f2.snfContent) / 100;
                          
                          return {
                            milk: f2.milkQuantity - f1.milkQuantity,
                            fatPercent: f2.fatContent - f1.fatContent,
                            snfPercent: f2.snfContent - f1.snfContent,
                            fatLiters: f2FatLiters - f1FatLiters,
                            snfLiters: f2SNFLiters - f1SNFLiters,
                          };
                        })() : null;
                        
                        const diff2 = f2 && f3 ? (() => {
                          const f2FatLiters = (f2.milkQuantity * f2.fatContent) / 100;
                          const f2SNFLiters = (f2.milkQuantity * f2.snfContent) / 100;
                          const f3FatLiters = (f3.milkQuantity * f3.fatContent) / 100;
                          const f3SNFLiters = (f3.milkQuantity * f3.snfContent) / 100;
                          
                          return {
                            milk: f3.milkQuantity - f2.milkQuantity,
                            fatPercent: f3.fatContent - f2.fatContent,
                            snfPercent: f3.snfContent - f2.snfContent,
                            fatLiters: f3FatLiters - f2FatLiters,
                            snfLiters: f3SNFLiters - f2SNFLiters,
                          };
                        })() : null;
                        
                        return (
                          <tr key={entry.id}>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{bmc?.name || 'Unknown'}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {f1 ? (
                                <div className="text-xs">
                                  <div>M: {f1.milkQuantity.toFixed(2)}L</div>
                                  <div>F: {f1.fatContent.toFixed(2)}%</div>
                                  <div className="text-gray-500">({((f1.milkQuantity * f1.fatContent) / 100).toFixed(2)}L)</div>
                                  <div>S: {f1.snfContent.toFixed(2)}%</div>
                                  <div className="text-gray-500">({((f1.milkQuantity * f1.snfContent) / 100).toFixed(2)}L)</div>
                                </div>
                              ) : 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {f2 ? (
                                <div className="text-xs">
                                  <div>M: {f2.milkQuantity.toFixed(2)}L</div>
                                  <div>F: {f2.fatContent.toFixed(2)}%</div>
                                  <div className="text-gray-500">({((f2.milkQuantity * f2.fatContent) / 100).toFixed(2)}L)</div>
                                  <div>S: {f2.snfContent.toFixed(2)}%</div>
                                  <div className="text-gray-500">({((f2.milkQuantity * f2.snfContent) / 100).toFixed(2)}L)</div>
                                </div>
                              ) : 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {diff1 ? (
                                <div className="text-xs">
                                  <div className={diff1.milk !== 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                                    M: {diff1.milk > 0 ? '+' : ''}{diff1.milk.toFixed(2)}L
                                  </div>
                                  <div className={diff1.fatPercent !== 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                                    F: {diff1.fatPercent > 0 ? '+' : ''}{diff1.fatPercent.toFixed(2)}%
                                  </div>
                                  <div className={diff1.fatLiters !== 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                                    ({diff1.fatLiters > 0 ? '+' : ''}{diff1.fatLiters.toFixed(2)}L)
                                  </div>
                                  <div className={diff1.snfPercent !== 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                                    S: {diff1.snfPercent > 0 ? '+' : ''}{diff1.snfPercent.toFixed(2)}%
                                  </div>
                                  <div className={diff1.snfLiters !== 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                                    ({diff1.snfLiters > 0 ? '+' : ''}{diff1.snfLiters.toFixed(2)}L)
                                  </div>
                                </div>
                              ) : 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {f3 ? (
                                <div className="text-xs">
                                  <div>M: {f3.milkQuantity.toFixed(2)}L</div>
                                  <div>F: {f3.fatContent.toFixed(2)}%</div>
                                  <div className="text-gray-500">({((f3.milkQuantity * f3.fatContent) / 100).toFixed(2)}L)</div>
                                  <div>S: {f3.snfContent.toFixed(2)}%</div>
                                  <div className="text-gray-500">({((f3.milkQuantity * f3.snfContent) / 100).toFixed(2)}L)</div>
                                </div>
                              ) : 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {diff2 ? (
                                <div className="text-xs">
                                  <div className={diff2.milk !== 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                                    M: {diff2.milk > 0 ? '+' : ''}{diff2.milk.toFixed(2)}L
                                  </div>
                                  <div className={diff2.fatPercent !== 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                                    F: {diff2.fatPercent > 0 ? '+' : ''}{diff2.fatPercent.toFixed(2)}%
                                  </div>
                                  <div className={diff2.fatLiters !== 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                                    ({diff2.fatLiters > 0 ? '+' : ''}{diff2.fatLiters.toFixed(2)}L)
                                  </div>
                                  <div className={diff2.snfPercent !== 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                                    S: {diff2.snfPercent > 0 ? '+' : ''}{diff2.snfPercent.toFixed(2)}%
                                  </div>
                                  <div className={diff2.snfLiters !== 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                                    ({diff2.snfLiters > 0 ? '+' : ''}{diff2.snfLiters.toFixed(2)}L)
                                  </div>
                                </div>
                              ) : 'N/A'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {f2?.expenses ? (
                                `₹${((f2.expenses.fuel || 0) + (f2.expenses.foodTollWater || 0)).toFixed(2)}`
                              ) : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedTrip.dairyConfirmation && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Dairy Confirmation</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Milk Quantity</p>
                      <p className="font-medium">
                        {selectedTrip.dairyConfirmation.totalMilkQuantity.toFixed(2)} L
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fat Content</p>
                      <p className="font-medium">
                        {selectedTrip.dairyConfirmation.fatContent.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SNF Content</p>
                      <p className="font-medium">
                        {selectedTrip.dairyConfirmation.snfContent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Milk Calculations Report */}
              {selectedTrip.dairyConfirmation?.milkCalculations && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">Milk Calculation Report</h3>
                  
                  {/* Route-by-Route Calculations Table */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Route Calculations</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300 bg-green-50">
                              बि.एम.सि नाम
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300 bg-blue-50">
                              दूध की म (Liters)
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300 bg-green-100">
                              फेट (%)
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300 bg-yellow-50">
                              एस एन एफ (%)
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300 bg-orange-50">
                              किलो फैट (kg)
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase border border-gray-300 bg-yellow-100">
                              किलो SNF (kg)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedTrip.dairyConfirmation.milkCalculations.routeCalculations.map((route, index) => {
                            const bmc = Array.isArray(bmcs) ? bmcs.find(b => (b._id || b.id) === route.bmcId) : null;
                            return (
                              <tr key={route.bmcId || index}>
                                <td className="px-4 py-2 text-sm border border-gray-300">{bmc?.name || 'Unknown'}</td>
                                <td className="px-4 py-2 text-sm border border-gray-300 text-right">
                                  {route.milk.toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-sm border border-gray-300 text-right">
                                  {route.fat.toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-sm border border-gray-300 text-right">
                                  {route.snf.toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-sm border border-gray-300 text-right">
                                  {route.kiloFat.toFixed(4)}
                                </td>
                                <td className="px-4 py-2 text-sm border border-gray-300 text-right">
                                  {route.kiloSNF.toFixed(4)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-red-50">
                          <tr>
                            <td className="px-4 py-2 text-sm font-semibold border border-gray-300 bg-red-100">
                              कुल योग (Total)
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold border border-gray-300 text-right">
                              {selectedTrip.dairyConfirmation.milkCalculations.totals.totalMilk.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold border border-gray-300 text-right">
                              {selectedTrip.dairyConfirmation.milkCalculations.averages.avgFat.toFixed(4)}
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold border border-gray-300 text-right">
                              {selectedTrip.dairyConfirmation.milkCalculations.averages.avgSNF.toFixed(4)}
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold border border-gray-300 text-right">
                              {selectedTrip.dairyConfirmation.milkCalculations.totals.totalKiloFat.toFixed(4)}
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold border border-gray-300 text-right">
                              {selectedTrip.dairyConfirmation.milkCalculations.totals.totalKiloSNF.toFixed(4)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Summary Calculations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-800 mb-3">Totals & Averages</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Milk:</span>
                          <span className="font-semibold">
                            {selectedTrip.dairyConfirmation.milkCalculations.totals.totalMilk.toFixed(2)} Liters
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Kilo Fat:</span>
                          <span className="font-semibold">
                            {selectedTrip.dairyConfirmation.milkCalculations.totals.totalKiloFat.toFixed(4)} kg
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Kilo SNF:</span>
                          <span className="font-semibold">
                            {selectedTrip.dairyConfirmation.milkCalculations.totals.totalKiloSNF.toFixed(4)} kg
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-blue-300">
                          <span className="text-gray-600">Average Fat %:</span>
                          <span className="font-semibold">
                            {selectedTrip.dairyConfirmation.milkCalculations.averages.avgFat.toFixed(4)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average SNF %:</span>
                          <span className="font-semibold">
                            {selectedTrip.dairyConfirmation.milkCalculations.averages.avgSNF.toFixed(4)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-gray-800 mb-3">Expected Values (संघ का योग)</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Milk:</span>
                          <span className="font-semibold">
                            {selectedTrip.dairyConfirmation.milkCalculations.expected.expectedMilk.toFixed(2)} Liters
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Fat %:</span>
                          <span className="font-semibold">
                            {selectedTrip.dairyConfirmation.milkCalculations.averages.avgFat.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected SNF %:</span>
                          <span className="font-semibold">
                            {selectedTrip.dairyConfirmation.milkCalculations.averages.avgSNF.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Kilo Fat:</span>
                          <span className="font-semibold">
                            {selectedTrip.dairyConfirmation.milkCalculations.expected.expectedFat.toFixed(4)} kg
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Kilo SNF:</span>
                          <span className="font-semibold">
                            {selectedTrip.dairyConfirmation.milkCalculations.expected.expectedSNF.toFixed(4)} kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profit/Loss Section */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Profit/Loss (लाभ हानि)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Milk Difference:</span>
                          <span className={`font-semibold ${
                            (selectedTrip.dairyConfirmation.milkCalculations.totals.totalMilk - 
                             selectedTrip.dairyConfirmation.milkCalculations.expected.expectedMilk) !== 0 
                              ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {(selectedTrip.dairyConfirmation.milkCalculations.totals.totalMilk - 
                              selectedTrip.dairyConfirmation.milkCalculations.expected.expectedMilk).toFixed(2)} Liters
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fat Difference:</span>
                          <span className={`font-semibold ${
                            selectedTrip.dairyConfirmation.milkCalculations.profitLoss.fatDifference !== 0 
                              ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {selectedTrip.dairyConfirmation.milkCalculations.profitLoss.fatDifference.toFixed(4)} kg
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">SNF Difference:</span>
                          <span className={`font-semibold ${
                            selectedTrip.dairyConfirmation.milkCalculations.profitLoss.snfDifference !== 0 
                              ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {selectedTrip.dairyConfirmation.milkCalculations.profitLoss.snfDifference.toFixed(4)} kg
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fat Loss (₹):</span>
                          <span className="font-semibold text-red-600">
                            ₹{selectedTrip.dairyConfirmation.milkCalculations.profitLoss.fatLoss.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">SNF Loss (₹):</span>
                          <span className="font-semibold text-red-600">
                            ₹{selectedTrip.dairyConfirmation.milkCalculations.profitLoss.snfLoss.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transport Expenses:</span>
                          <span className="font-semibold">
                            ₹{selectedTrip.dairyConfirmation.milkCalculations.profitLoss.totalTransportExpenses.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Final Total Loss */}
                  <div className="bg-red-100 p-4 rounded-lg border-2 border-red-400">
                    <h4 className="font-bold text-gray-800 mb-3 text-lg">Final Total Loss</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Transport Expenses:</span>
                        <span className="font-bold">₹{selectedTrip.dairyConfirmation.milkCalculations.profitLoss.totalTransportExpenses.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">Fat Loss:</span>
                        <span className="font-bold">₹{selectedTrip.dairyConfirmation.milkCalculations.profitLoss.fatLoss.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold">SNF Loss:</span>
                        <span className="font-bold">₹{selectedTrip.dairyConfirmation.milkCalculations.profitLoss.snfLoss.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xl pt-2 border-t-2 border-red-400">
                        <span className="font-bold">Total Loss:</span>
                        <span className="font-bold text-red-600">₹{selectedTrip.dairyConfirmation.milkCalculations.profitLoss.totalLoss.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Payment Calculation</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {pricing && selectedTrip.dairyConfirmation && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Base Amount:</span>
                        <span>
                          ₹{pricing.basePricePerLiter} × {selectedTrip.dairyConfirmation.totalMilkQuantity.toFixed(2)}L = 
                          ₹{(pricing.basePricePerLiter * selectedTrip.dairyConfirmation.totalMilkQuantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fat Amount:</span>
                        <span>
                          ₹{pricing.fatPricePerPercent} × {selectedTrip.dairyConfirmation.fatContent.toFixed(2)}% × {selectedTrip.dairyConfirmation.totalMilkQuantity.toFixed(2)}L = 
                          ₹{(pricing.fatPricePerPercent * selectedTrip.dairyConfirmation.fatContent * selectedTrip.dairyConfirmation.totalMilkQuantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>SNF Amount:</span>
                        <span>
                          ₹{pricing.snfPricePerPercent} × {selectedTrip.dairyConfirmation.snfContent.toFixed(2)}% × {selectedTrip.dairyConfirmation.totalMilkQuantity.toFixed(2)}L = 
                          ₹{(pricing.snfPricePerPercent * selectedTrip.dairyConfirmation.snfContent * selectedTrip.dairyConfirmation.totalMilkQuantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                        <span>Total Payment:</span>
                        <span>₹{calculateTripPayment(selectedTrip).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;

