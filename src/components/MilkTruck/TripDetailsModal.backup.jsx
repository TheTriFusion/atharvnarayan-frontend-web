import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { updateMilkTruckTrip, deleteMilkTruckTrip } from '../../utils/storage';
import { useAuth } from '../../contexts/AuthContext';

const TripDetailsModal = ({ trip, onClose, onUpdate, bmcs = [], routes = [], vehicles = [] }) => {
    const { user } = useAuth();
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Pricing state
    const [fatPrice, setFatPrice] = useState('');
    const [snfPrice, setSnfPrice] = useState('');
    const [basePricePerLiter, setBasePricePerLiter] = useState('');

    // Safety check - if no trip, don't render
    if (!trip) {
        return null;
    }

    // Helper to resolve route object (populated or from list)
    const getRoute = () => {
        if (trip.routeId && typeof trip.routeId === 'object' && trip.routeId.name) {
            return trip.routeId;
        }
        return routes.find(r => r.id === trip.routeId) || {};
    };

    // Helper to resolve vehicle object
    const getVehicle = () => {
        if (trip.vehicleId && typeof trip.vehicleId === 'object' && trip.vehicleId.registrationNumber) {
            return trip.vehicleId;
        }
        return vehicles.find(v => v.id === trip.vehicleId) || {};
    };

    const route = getRoute();
    const vehicle = getVehicle();

    // Safe trip ID extraction
    const tripId = trip.id || trip._id || 'N/A';
    const displayTripId = tripId !== 'N/A' ? tripId.toString().substring(tripId.toString().length - 6) : 'N/A';

    // Totals
    const collected = trip.dairyConfirmation?.collectionTotals?.milk || trip.summary?.totalMilk || 0;
    const dairy = trip.dairyConfirmation?.totalMilkQuantity || trip.summary?.totalMilk || 0;
    const diff = trip.dairyConfirmation?.variance?.milk || (dairy - collected);

    const formattedDiff = diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(2)}` : '0.00';

    // Calculate BMC totals
    const bmcTotals = trip.bmcEntries?.reduce((acc, entry) => {
        if (entry.collectionData) {
            acc.collectionMilk += parseFloat(entry.collectionData.milkQuantity) || 0;
            acc.collectionFat += (parseFloat(entry.collectionData.milkQuantity) || 0) * (parseFloat(entry.collectionData.fatContent) || 0) / 100;
            acc.collectionSnf += (parseFloat(entry.collectionData.milkQuantity) || 0) * (parseFloat(entry.collectionData.snfContent) || 0) / 100;
        }
        if (entry.submissionData) {
            acc.submissionMilk += parseFloat(entry.submissionData.milkQuantity) || 0;
            acc.submissionFat += (parseFloat(entry.submissionData.milkQuantity) || 0) * (parseFloat(entry.submissionData.fatContent) || 0) / 100;
            acc.submissionSnf += (parseFloat(entry.submissionData.milkQuantity) || 0) * (parseFloat(entry.submissionData.snfContent) || 0) / 100;
            acc.totalExpenses += (parseFloat(entry.submissionData.expenses?.fuel) || 0) + (parseFloat(entry.submissionData.expenses?.foodTollWater) || 0);
        }
        return acc;
    }, {
        collectionMilk: 0,
        collectionFat: 0,
        collectionSnf: 0,
        submissionMilk: 0,
        submissionFat: 0,
        submissionSnf: 0,
        totalExpenses: 0
    }) || {
        collectionMilk: 0,
        collectionFat: 0,
        collectionSnf: 0,
        submissionMilk: 0,
        submissionFat: 0,
        submissionSnf: 0,
        totalExpenses: 0
    };

    // Check if user can edit (only owners and superadmins)
    const canEdit = user && (user.role === 'milkTruckOwner' || user.role === 'superadmin');

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
                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    onClick={() => alert('Edit functionality: You can implement inline editing for dairy confirmation and BMC data here')}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    onClick={() => setDeleteConfirm(true)}
                                >
                                    🗑️ Delete
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
                            ✕
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-6">
                    {/* Content - No Tabs, Direct Display */}

                    {/* Summary Tab */}
                    {activeTab === 'summary' && (
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

                            {/* Summary Stats */}
                            {trip.summary && (
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <h4 className="font-semibold text-green-800 mb-3">Trip Summary</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Total Milk</p>
                                            <p className="font-bold text-lg">{trip.summary.totalMilk?.toFixed(2) || '0.00'} L</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Avg Fat</p>
                                            <p className="font-bold text-lg">{trip.summary.avgFat?.toFixed(2) || '0.00'}%</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Avg SNF</p>
                                            <p className="font-bold text-lg">{trip.summary.avgSnf?.toFixed(2) || '0.00'}%</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Total Expenses</p>
                                            <p className="font-bold text-lg">₹{trip.summary.totalExpenses?.toFixed(2) || '0.00'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* BMC-wise Comparison: At BMC vs At Dairy */}
                            {trip.bmcEntries && trip.bmcEntries.length > 0 && (
                                <div className="bg-white rounded-lg border border-gray-200">
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                                        <h4 className="font-semibold text-gray-800 text-lg">📊 BMC-wise Comparison: Collection vs Dairy Verification</h4>
                                        <p className="text-sm text-gray-600 mt-1">Compare original BMC collection data with dairy-verified values for each BMC</p>
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
                                                    {/* At BMC columns */}
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-green-50">Milk (L)</th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-green-50">Fat %</th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-green-50 border-r">SNF %</th>
                                                    {/* At Dairy columns */}
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-purple-50">Milk (L)</th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-purple-50">Fat %</th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 bg-purple-50 border-r">SNF %</th>
                                                    {/* Variance columns */}
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

                                                    // Calculate variances
                                                    const milkVar = atDairy ? (parseFloat(atDairy.milkQuantity) - parseFloat(atBMC.milkQuantity)) : 0;
                                                    const fatVar = atDairy ? (parseFloat(atDairy.fatContent) - parseFloat(atBMC.fatContent)) : 0;
                                                    const snfVar = atDairy ? (parseFloat(atDairy.snfContent) - parseFloat(atBMC.snfContent)) : 0;

                                                    // Calculate kg variances
                                                    const atBMCFatKg = (parseFloat(atBMC.milkQuantity) * parseFloat(atBMC.fatContent)) / 100;
                                                    const atBMCSnfKg = (parseFloat(atBMC.milkQuantity) * parseFloat(atBMC.snfContent)) / 100;
                                                    const atDairyFatKg = atDairy ? (parseFloat(atDairy.milkQuantity) * parseFloat(atDairy.fatContent)) / 100 : 0;
                                                    const atDairySnfKg = atDairy ? (parseFloat(atDairy.milkQuantity) * parseFloat(atDairy.snfContent)) / 100 : 0;
                                                    const fatKgVar = atDairyFatKg - atBMCFatKg;
                                                    const snfKgVar = atDairySnfKg - atBMCSnfKg;

                                                    return (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">{bmcName}</td>

                                                            {/* At BMC */}
                                                            <td className="px-3 py-3 text-sm text-gray-700 text-center bg-green-50">{parseFloat(atBMC.milkQuantity).toFixed(2)}</td>
                                                            <td className="px-3 py-3 text-sm text-gray-700 text-center bg-green-50">{parseFloat(atBMC.fatContent).toFixed(2)}</td>
                                                            <td className="px-3 py-3 text-sm text-gray-700 text-center bg-green-50 border-r">{parseFloat(atBMC.snfContent).toFixed(2)}</td>

                                                            {/* At Dairy */}
                                                            <td className="px-3 py-3 text-sm text-gray-700 text-center bg-purple-50">{atDairy ? parseFloat(atDairy.milkQuantity).toFixed(2) : '-'}</td>
                                                            <td className="px-3 py-3 text-sm text-gray-700 text-center bg-purple-50">{atDairy ? parseFloat(atDairy.fatContent).toFixed(2) : '-'}</td>
                                                            <td className="px-3 py-3 text-sm text-gray-700 text-center bg-purple-50 border-r">{atDairy ? parseFloat(atDairy.snfContent).toFixed(2) : '-'}</td>

                                                            {/* Variance */}
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
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Legend */}
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
                        </div>
                    )}

                    {/* BMC Details Tab */}
                    {activeTab === 'bmc' && (
                        <div className="space-y-4">
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-semibold text-green-800 mb-2">🏭 Original BMC Collection Data</h4>
                                <p className="text-sm text-green-700">These are the original values collected at each BMC location before any verification edits.</p>
                            </div>

                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                    <strong>Total BMCs:</strong> {trip.bmcEntries?.length || 0} |
                                    <strong> Total Collected:</strong> {bmcTotals.collectionMilk.toFixed(2)} L |
                                    <strong> Total Submitted:</strong> {bmcTotals.submissionMilk.toFixed(2)} L
                                </p>
                            </div>

                            {trip.bmcEntries && trip.bmcEntries.length > 0 ? (
                                <>
                                    {/* BMC Collection Data Table */}
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">BMC Name</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Milk (L)</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Fat %</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Fat (kg)</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">SNF %</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">SNF (kg)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {trip.bmcEntries.map((entry, index) => {
                                                    const entryBmcId = entry.bmcId?._id || entry.bmcId?.id || entry.bmcId;
                                                    const bmcName = entry.bmcId?.name || bmcs.find(b => (b.id || b._id) === entryBmcId)?.name || 'Unknown BMC';
                                                    const data = entry.collectionData;

                                                    if (!data) return null;

                                                    const fatKg = (parseFloat(data.milkQuantity) * parseFloat(data.fatContent)) / 100;
                                                    const snfKg = (parseFloat(data.milkQuantity) * parseFloat(data.snfContent)) / 100;

                                                    return (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{bmcName}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">{parseFloat(data.milkQuantity).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">{parseFloat(data.fatContent).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-sm text-blue-700 text-right font-semibold">{fatKg.toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">{parseFloat(data.snfContent).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-sm text-blue-700 text-right font-semibold">{snfKg.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot className="bg-blue-50">
                                                <tr>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-900">Total Collected</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{bmcTotals.collectionMilk.toFixed(2)} L</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">
                                                        {bmcTotals.collectionMilk > 0 ? ((bmcTotals.collectionFat / bmcTotals.collectionMilk) * 100).toFixed(2) : '0.00'}%
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{bmcTotals.collectionFat.toFixed(2)} kg</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">
                                                        {bmcTotals.collectionMilk > 0 ? ((bmcTotals.collectionSnf / bmcTotals.collectionMilk) * 100).toFixed(2) : '0.00'}%
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{bmcTotals.collectionSnf.toFixed(2)} kg</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* Info Note */}
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-800">
                                            💡 <strong>Note:</strong> These are the original collection values. Check the "Dairy Verification" tab to see if any values were edited during verification.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg border border-gray-200">
                                    No BMC entries found for this trip.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dairy Verification Tab - Shows Edited BMC Values */}
                    {activeTab === 'verification' && (
                        <div className="space-y-4">
                            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <h4 className="font-semibold text-yellow-800 mb-2">📝 Dairy Verification Details</h4>
                                <p className="text-sm text-yellow-700">These are the final BMC values after editing during dairy verification. Compare with original BMC Details to see what was changed.</p>
                            </div>

                            {trip.bmcEntries && trip.bmcEntries.length > 0 ? (
                                <>
                                    {/* BMC-wise Dairy Verification Data */}
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">BMC Name</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Milk (L)</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Fat %</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Fat (kg)</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">SNF %</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">SNF (kg)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {trip.bmcEntries.map((entry, index) => {
                                                    const entryBmcId = entry.bmcId?._id || entry.bmcId?.id || entry.bmcId;
                                                    const bmcName = entry.bmcId?.name || bmcs.find(b => (b.id || b._id) === entryBmcId)?.name || 'Unknown BMC';
                                                    // Use dairyVerifiedData if available, fallback to collectionData
                                                    const data = entry.dairyVerifiedData || entry.collectionData;

                                                    if (!data) return null;

                                                    const fatKg = (parseFloat(data.milkQuantity) * parseFloat(data.fatContent)) / 100;
                                                    const snfKg = (parseFloat(data.milkQuantity) * parseFloat(data.snfContent)) / 100;

                                                    return (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{bmcName}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">{parseFloat(data.milkQuantity).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">{parseFloat(data.fatContent).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-sm text-blue-700 text-right font-semibold">{fatKg.toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-700 text-right">{parseFloat(data.snfContent).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-sm text-blue-700 text-right font-semibold">{snfKg.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot className="bg-blue-50">
                                                <tr>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-900">Final Totals</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{collected.toFixed(2)} L</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{trip.dairyConfirmation?.collectionTotals?.fat?.toFixed(2) || '0.00'}%</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{bmcTotals.collectionFat.toFixed(2)} kg</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{trip.dairyConfirmation?.collectionTotals?.snf?.toFixed(2) || '0.00'}%</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{bmcTotals.collectionSnf.toFixed(2)} kg</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* Comparison Note */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            💡 <strong>Note:</strong> These values may have been edited by the driver during dairy verification. Check the "BMC Details" tab to see original collection values.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-lg mb-2">No Dairy Verification Data Available</p>
                                    <p className="text-sm text-gray-400">BMC entry data will appear here after dairy verification.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Dairy Confirmation Tab */}
                    {activeTab === 'dairy' && (
                        <div className="space-y-6">
                            {trip.dairyConfirmation ? (
                                <>
                                    <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                                        <h4 className="font-semibold text-purple-800 mb-4 text-lg">Dairy Confirmation Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-white p-4 rounded border border-purple-100">
                                                <p className="text-xs text-gray-500 mb-1">Total Milk Quantity</p>
                                                <p className="text-2xl font-bold text-purple-900">{trip.dairyConfirmation.totalMilkQuantity?.toFixed(2) || '0.00'} L</p>
                                            </div>
                                            <div className="bg-white p-4 rounded border border-purple-100">
                                                <p className="text-xs text-gray-500 mb-1">Average Fat Content</p>
                                                <p className="text-2xl font-bold text-purple-900">{trip.dairyConfirmation.averageFatContent?.toFixed(2) || '0.00'}%</p>
                                            </div>
                                            <div className="bg-white p-4 rounded border border-purple-100">
                                                <p className="text-xs text-gray-500 mb-1">Average SNF Content</p>
                                                <p className="text-2xl font-bold text-purple-900">{trip.dairyConfirmation.averageSnfContent?.toFixed(2) || '0.00'}%</p>
                                            </div>
                                        </div>
                                        {trip.dairyConfirmation.confirmedAt && (
                                            <p className="text-xs text-gray-600 mt-4">
                                                Confirmed At: {new Date(trip.dairyConfirmation.confirmedAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                    {trip.dairyConfirmation.collectionTotals && (
                                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                            <h4 className="font-semibold text-blue-800 mb-4">Collection Totals (from BMCs)</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-white p-4 rounded border border-blue-100">
                                                    <p className="text-xs text-gray-500 mb-1">Total Milk Collected</p>
                                                    <p className="text-2xl font-bold text-blue-900">{trip.dairyConfirmation.collectionTotals.milk?.toFixed(2) || '0.00'} L</p>
                                                </div>
                                                <div className="bg-white p-4 rounded border border-blue-100">
                                                    <p className="text-xs text-gray-500 mb-1">Average Fat</p>
                                                    <p className="text-2xl font-bold text-blue-900">{trip.dairyConfirmation.collectionTotals.fat?.toFixed(2) || '0.00'}%</p>
                                                </div>
                                                <div className="bg-white p-4 rounded border border-blue-100">
                                                    <p className="text-xs text-gray-500 mb-1">Average SNF</p>
                                                    <p className="text-2xl font-bold text-blue-900">{trip.dairyConfirmation.collectionTotals.snf?.toFixed(2) || '0.00'}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {trip.dairyConfirmation.variance && (
                                        <div className={`rounded-lg p-6 border ${trip.dairyConfirmation.variance.milk < 0
                                            ? 'bg-red-50 border-red-200'
                                            : trip.dairyConfirmation.variance.milk > 0
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-gray-50 border-gray-200'
                                            }`}>
                                            <h4 className={`font-semibold mb-4 ${trip.dairyConfirmation.variance.milk < 0
                                                ? 'text-red-800'
                                                : trip.dairyConfirmation.variance.milk > 0
                                                    ? 'text-green-800'
                                                    : 'text-gray-800'
                                                }`}>
                                                Variance (Dairy Receipt - Collection)
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-white p-4 rounded border">
                                                    <p className="text-xs text-gray-500 mb-1">Milk Quantity Variance</p>
                                                    <p className={`text-2xl font-bold ${trip.dairyConfirmation.variance.milk < 0
                                                        ? 'text-red-700'
                                                        : trip.dairyConfirmation.variance.milk > 0
                                                            ? 'text-green-700'
                                                            : 'text-gray-700'
                                                        }`}>
                                                        {trip.dairyConfirmation.variance.milk > 0 ? '+' : ''}{trip.dairyConfirmation.variance.milk?.toFixed(2) || '0.00'} L
                                                    </p>
                                                </div>
                                                <div className="bg-white p-4 rounded border">
                                                    <p className="text-xs text-gray-500 mb-1">Fat Content Variance</p>
                                                    <p className={`text-2xl font-bold ${trip.dairyConfirmation.variance.fat < 0
                                                        ? 'text-red-700'
                                                        : trip.dairyConfirmation.variance.fat > 0
                                                            ? 'text-green-700'
                                                            : 'text-gray-700'
                                                        }`}>
                                                        {trip.dairyConfirmation.variance.fat > 0 ? '+' : ''}{trip.dairyConfirmation.variance.fat?.toFixed(2) || '0.00'}%
                                                    </p>
                                                </div>
                                                <div className="bg-white p-4 rounded border">
                                                    <p className="text-xs text-gray-500 mb-1">SNF Content Variance</p>
                                                    <p className={`text-2xl font-bold ${trip.dairyConfirmation.variance.snf < 0
                                                        ? 'text-red-700'
                                                        : trip.dairyConfirmation.variance.snf > 0
                                                            ? 'text-green-700'
                                                            : 'text-gray-700'
                                                        }`}>
                                                        {trip.dairyConfirmation.variance.snf > 0 ? '+' : ''}{trip.dairyConfirmation.variance.snf?.toFixed(2) || '0.00'}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-gray-500 text-lg mb-2">No Dairy Confirmation Data Available</p>
                                    <p className="text-sm text-gray-400">Dairy confirmation data will appear here once the trip is completed.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <Button variant="secondary" onClick={onClose}>Close Details</Button>
                </div>

                {/* Delete Confirmation Dialog */}
                {deleteConfirm && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Trip?</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this trip? This action cannot be undone and will remove all BMC entries and dairy confirmation data.
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
