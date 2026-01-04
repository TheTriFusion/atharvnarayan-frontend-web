import React, { useState } from 'react';
import Button from '../common/Button';
import { deleteMilkTruckTrip } from '../../utils/storage';
import { useAuth } from '../../contexts/AuthContext';

const TripDetailsModal = ({ trip, onClose, onUpdate, bmcs = [], routes = [], vehicles = [] }) => {
    const { user } = useAuth();
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Pricing state
    const [basePricePerLiter, setBasePricePerLiter] = useState('50');
    const [fatPricePerPercent, setFatPricePerPercent] = useState('2');
    const [snfPricePerPercent, setSnfPricePerPercent] = useState('1');

    // Safety check - if no trip, don't render
    if (!trip) {
        return null;
    }

    const tripId = trip.id || trip._id;
    const displayTripId = tripId && typeof tripId === 'object' ? tripId.$oid || tripId.toString() : tripId || 'N/A';

    // Get route and vehicle details
    const route = routes.find(r => (r.id || r._id) === (trip.routeId || trip.routeId?._id)) || { name: trip.routeId?.name || 'Unknown' };
    const vehicle = vehicles.find(v => (v.id || v._id) === (trip.vehicleId || trip.vehicleId?._id)) || { registrationNumber: trip.vehicleId?.registrationNumber || 'Unknown' };

    // Calculate dairy-verified (At Dairy) totals
    const dairyTotals = trip.bmcEntries?.reduce((acc, entry) => {
        const data = entry.dairyVerifiedData || entry.collectionData;
        if (!data) return acc;

        const milk = parseFloat(data.milkQuantity) || 0;
        const fat = parseFloat(data.fatContent) || 0;
        const snf = parseFloat(data.snfContent) || 0;

        acc.milk += milk;
        acc.fatKg += (milk * fat) / 100;
        acc.snfKg += (milk * snf) / 100;

        return acc;
    }, { milk: 0, fatKg: 0, snfKg: 0 }) || { milk: 0, fatKg: 0, snfKg: 0 };

    const dairyAvgFat = dairyTotals.milk > 0 ? (dairyTotals.fatKg / dairyTotals.milk) * 100 : 0;
    const dairyAvgSnf = dairyTotals.milk > 0 ? (dairyTotals.snfKg / dairyTotals.milk) * 100 : 0;

    // Calculate price
    const calculatePrice = () => {
        const basePrice = parseFloat(basePricePerLiter) || 0;
        const fatPrice = parseFloat(fatPricePerPercent) || 0;
        const snfPrice = parseFloat(snfPricePerPercent) || 0;

        // Price = (BasePricePerLiter * TotalMilk) + (FatPrice * FatAvg%) + (SNFPrice * SNFAvg%)
        const totalMilkPrice = basePrice * dairyTotals.milk;
        const totalFatPrice = fatPrice * dairyAvgFat;
        const totalSnfPrice = snfPrice * dairyAvgSnf;

        return totalMilkPrice + totalFatPrice + totalSnfPrice;
    };

    const totalPrice = calculatePrice();

    const handleDelete = async () => {
        try {
            const result = await deleteMilkTruckTrip(tripId);
            if (result.success) {
                setSaveMessage('Trip deleted successfully');
                setTimeout(() => {
                    onUpdate?.();
                    onClose();
                }, 1500);
            } else {
                setSaveMessage('Error deleting trip');
            }
        } catch (error) {
            setSaveMessage('Error deleting trip');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-blue-50 to-purple-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">🧾 Trip Payment Details</h2>
                        <p className="text-sm text-gray-500 flex gap-4 mt-1">
                            <span>🆔 {displayTripId}</span>
                            <span>📅 {trip.endTime || trip.startTime ? new Date(trip.endTime || trip.startTime).toLocaleString() : 'N/A'}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            Route: <span className="font-semibold">{route.name || 'Unknown Route'}</span> • Vehicle: <span className="font-semibold">{vehicle.registrationNumber || 'Unknown Vehicle'}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {(user?.role === 'superadmin' || user?.role === 'milkTruckOwner') && (
                            <Button
                                variant="danger"
                                onClick={() => setDeleteConfirm(true)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                🗑️ Delete
                            </Button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold leading-none"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-6">
                    <div className="space-y-6">
                        {/* Trip Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-3">Trip Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Start Time:</span>
                                    <span className="ml-2 font-medium">{trip.startTime ? new Date(trip.startTime).toLocaleString() : 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">End Time:</span>
                                    <span className="ml-2 font-medium">{trip.endTime ? new Date(trip.endTime).toLocaleString() : 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Route:</span>
                                    <span className="ml-2 font-medium">{route.name || 'Unknown'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Vehicle:</span>
                                    <span className="ml-2 font-medium">{vehicle.registrationNumber || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trip Summary */}
                        {trip.summary && (
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-3">Trip Summary</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Total Milk</p>
                                        <p className="font-bold text-lg">{dairyTotals.milk.toFixed(2)} L</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Avg Fat</p>
                                        <p className="font-bold text-lg">{dairyAvgFat.toFixed(2)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Avg SNF</p>
                                        <p className="font-bold text-lg">{dairyAvgSnf.toFixed(2)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Total Expenses</p>
                                        <p className="font-bold text-lg">₹{trip.summary.totalExpenses?.toFixed(2) || '0.00'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BMC-wise Comparison Table */}
                        {trip.bmcEntries && trip.bmcEntries.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                                    <h4 className="font-semibold text-gray-800 text-lg">📊 BMC-wise Comparison: Collection vs Dairy Verification</h4>
                                    <p className="text-sm text-gray-600 mt-1">Compare original BMC collection data with dairy-verified values</p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th rowSpan="2" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase border-r">BMC Name</th>
                                                <th colSpan="3" className="px-4 py-2 text-center text-xs font-medium text-green-700 uppercase bg-green-50 border-r">At BMC (Original)</th>
                                                <th colSpan="3" className="px-4 py-2 text-center text-xs font-medium text-purple-700 uppercase bg-purple-50 border-r">At Dairy (Verified)</th>
                                                <th colSpan="5" className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Variance</th>
                                            </tr>
                                            <tr>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-green-50">Milk (L)</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-green-50">Fat %</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-green-50 border-r">SNF %</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-purple-50">Milk (L)</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-purple-50">Fat %</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-purple-50 border-r">SNF %</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Milk (L)</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Fat %</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Fat (kg)</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">SNF %</th>
                                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">SNF (kg)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {trip.bmcEntries.map((entry, index) => {
                                                const entryBmcId = entry.bmcId?._id || entry.bmcId?.id || entry.bmcId;
                                                const bmcName = entry.bmcId?.name || bmcs.find(b => (b.id || b._id) === entryBmcId)?.name || 'Unknown BMC';

                                                const atBMC = entry.collectionData;
                                                const atDairy = entry.dairyVerifiedData || entry.collectionData;

                                                if (!atBMC) return null;

                                                const milkVar = atDairy ? (parseFloat(atDairy.milkQuantity) - parseFloat(atBMC.milkQuantity)) : 0;
                                                const fatVar = atDairy ? (parseFloat(atDairy.fatContent) - parseFloat(atBMC.fatContent)) : 0;
                                                const snfVar = atDairy ? (parseFloat(atDairy.snfContent) - parseFloat(atBMC.snfContent)) : 0;

                                                const atBMCFatKg = (parseFloat(atBMC.milkQuantity) * parseFloat(atBMC.fatContent)) / 100;
                                                const atBMCSnfKg = (parseFloat(atBMC.milkQuantity) * parseFloat(atBMC.snfContent)) / 100;
                                                const atDairyFatKg = atDairy ? (parseFloat(atDairy.milkQuantity) * parseFloat(atDairy.fatContent)) / 100 : 0;
                                                const atDairySnfKg = atDairy ? (parseFloat(atDairy.milkQuantity) * parseFloat(atDairy.snfContent)) / 100 : 0;
                                                const fatKgVar = atDairyFatKg - atBMCFatKg;
                                                const snfKgVar = atDairySnfKg - atBMCSnfKg;

                                                return (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">{bmcName}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-700 text-center bg-green-50">{parseFloat(atBMC.milkQuantity).toFixed(2)}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-700 text-center bg-green-50">{parseFloat(atBMC.fatContent).toFixed(2)}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-700 text-center bg-green-50 border-r">{parseFloat(atBMC.snfContent).toFixed(2)}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-700 text-center bg-purple-50">{atDairy ? parseFloat(atDairy.milkQuantity).toFixed(2) : '-'}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-700 text-center bg-purple-50">{atDairy ? parseFloat(atDairy.fatContent).toFixed(2) : '-'}</td>
                                                        <td className="px-3 py-3 text-sm text-gray-700 text-center bg-purple-50 border-r">{atDairy ? parseFloat(atDairy.snfContent).toFixed(2) : '-'}</td>
                                                        <td className={`px-3 py-3 text-sm font-semibold text-center ${milkVar < 0 ? 'text-red-600' : milkVar > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                                            {milkVar !== 0 ? (milkVar > 0 ? '+' : '') + milkVar.toFixed(2) : '0.00'}
                                                        </td>
                                                        <td className={`px-3 py-3 text-sm font-semibold text-center ${fatVar < 0 ? 'text-red-600' : fatVar > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                                            {fatVar !== 0 ? (fatVar > 0 ? '+' : '') + fatVar.toFixed(2) : '0.00'}
                                                        </td>
                                                        <td className={`px-3 py-3 text-sm font-semibold text-center ${fatKgVar < 0 ? 'text-red-600' : fatKgVar > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                                            {fatKgVar !== 0 ? (fatKgVar > 0 ? '+' : '') + fatKgVar.toFixed(2) : '0.00'}
                                                        </td>
                                                        <td className={`px-3 py-3 text-sm font-semibold text-center ${snfVar < 0 ? 'text-red-600' : snfVar > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                                            {snfVar !== 0 ? (snfVar > 0 ? '+' : '') + snfVar.toFixed(2) : '0.00'}
                                                        </td>
                                                        <td className={`px-3 py-3 text-sm font-semibold text-center ${snfKgVar < 0 ? 'text-red-600' : snfKgVar > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                                            {snfKgVar !== 0 ? (snfKgVar > 0 ? '+' : '') + snfKgVar.toFixed(2) : '0.00'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {/* Total Variance Row */}
                                            {(() => {
                                                // Calculate total variances
                                                const totalVariances = trip.bmcEntries.reduce((acc, entry) => {
                                                    const atBMC = entry.collectionData;
                                                    const atDairy = entry.dairyVerifiedData || entry.collectionData;

                                                    if (!atBMC) return acc;

                                                    const milkVar = atDairy ? (parseFloat(atDairy.milkQuantity) - parseFloat(atBMC.milkQuantity)) : 0;

                                                    const atBMCFatKg = (parseFloat(atBMC.milkQuantity) * parseFloat(atBMC.fatContent)) / 100;
                                                    const atBMCSnfKg = (parseFloat(atBMC.milkQuantity) * parseFloat(atBMC.snfContent)) / 100;
                                                    const atDairyFatKg = atDairy ? (parseFloat(atDairy.milkQuantity) * parseFloat(atDairy.fatContent)) / 100 : 0;
                                                    const atDairySnfKg = atDairy ? (parseFloat(atDairy.milkQuantity) * parseFloat(atDairy.snfContent)) / 100 : 0;
                                                    const fatKgVar = atDairyFatKg - atBMCFatKg;
                                                    const snfKgVar = atDairySnfKg - atBMCSnfKg;

                                                    acc.milkVar += milkVar;
                                                    acc.fatKgVar += fatKgVar;
                                                    acc.snfKgVar += snfKgVar;

                                                    return acc;
                                                }, { milkVar: 0, fatKgVar: 0, snfKgVar: 0 });

                                                return (
                                                    <tr className="bg-yellow-50 border-t-2 border-yellow-400">
                                                        <td colSpan="7" className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                                                            Total Variance:
                                                        </td>
                                                        <td className={`px-3 py-3 text-sm font-bold text-center ${totalVariances.milkVar < 0 ? 'text-red-700' : totalVariances.milkVar > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                                                            {totalVariances.milkVar !== 0 ? (totalVariances.milkVar > 0 ? '+' : '') + totalVariances.milkVar.toFixed(2) + ' L' : '0.00 L'}
                                                        </td>
                                                        <td colSpan="2" className="px-3 py-3 text-sm text-center text-gray-500">
                                                            -
                                                        </td>
                                                        <td className={`px-3 py-3 text-sm font-bold text-center ${totalVariances.fatKgVar < 0 ? 'text-red-700' : totalVariances.fatKgVar > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                                                            {totalVariances.fatKgVar !== 0 ? (totalVariances.fatKgVar > 0 ? '+' : '') + totalVariances.fatKgVar.toFixed(2) + ' kg' : '0.00 kg'}
                                                        </td>
                                                        <td className="px-3 py-3 text-sm text-center text-gray-500">
                                                            -
                                                        </td>
                                                        <td className={`px-3 py-3 text-sm font-bold text-center ${totalVariances.snfKgVar < 0 ? 'text-red-700' : totalVariances.snfKgVar > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                                                            {totalVariances.snfKgVar !== 0 ? (totalVariances.snfKgVar > 0 ? '+' : '') + totalVariances.snfKgVar.toFixed(2) + ' kg' : '0.00 kg'}
                                                        </td>
                                                    </tr>
                                                );
                                            })()}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                                        <span>Original Collection at BMC</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
                                        <span>Dairy Verified Values</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-600 font-semibold">+X.XX</span>
                                        <span>Increase</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-600 font-semibold">-X.XX</span>
                                        <span>Decrease</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pricing Form */}
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200 p-6">
                            <h4 className="font-bold text-yellow-900 text-xl mb-4 flex items-center gap-2">
                                💰 Payment Calculation
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Base Price per Liter (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={basePricePerLiter}
                                        onChange={(e) => setBasePricePerLiter(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                        placeholder="50"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fat Price per % (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={fatPricePerPercent}
                                        onChange={(e) => setFatPricePerPercent(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                        placeholder="2"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SNF Price per % (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={snfPricePerPercent}
                                        onChange={(e) => setSnfPricePerPercent(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                                        placeholder="1"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            {/* Calculation Breakdown */}
                            <div className="bg-white rounded-lg p-4 border border-yellow-300 mb-4">
                                <h5 className="font-semibold text-gray-800 mb-3">Calculation Breakdown:</h5>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Milk Payment:</span>
                                        <span className="font-mono">₹{basePricePerLiter} × {dairyTotals.milk.toFixed(2)}L = ₹{(parseFloat(basePricePerLiter) * dairyTotals.milk).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Fat Bonus:</span>
                                        <span className="font-mono">₹{fatPricePerPercent} × {dairyAvgFat.toFixed(2)}% = ₹{(parseFloat(fatPricePerPercent) * dairyAvgFat).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">SNF Bonus:</span>
                                        <span className="font-mono">₹{snfPricePerPercent} × {dairyAvgSnf.toFixed(2)}% = ₹{(parseFloat(snfPricePerPercent) * dairyAvgSnf).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-300 pt-2 mt-2"></div>
                                    <div className="flex justify-between text-lg font-bold text-green-700">
                                        <span>Total Payment:</span>
                                        <span>₹{totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded p-3 text-sm text-blue-800">
                                💡 <strong>Note:</strong> Payment is calculated based on dairy-verified milk quantities (At Dairy values).
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ Confirm Deletion</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this trip? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="secondary"
                                    onClick={() => setDeleteConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Delete Trip
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Save/Delete Message Toast */}
                {saveMessage && (
                    <div className={`absolute top-4 right-4 z-20 px-6 py-3 rounded-lg shadow-lg ${saveMessage.includes('Error') ? 'bg-red-500' : 'bg-green-500'
                        } text-white font-medium animate-fade-in`}>
                        {saveMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripDetailsModal;
