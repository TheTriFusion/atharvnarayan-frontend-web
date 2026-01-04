import { useState, useEffect } from 'react';
import { getMilkTruckBMCs, updateMilkTruckTrip } from '../../utils/storage';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const DairyConfirmation = ({ trip, onConfirm }) => {
  const [bmcs, setBMCs] = useState([]);
  const [editableBmcData, setEditableBmcData] = useState([]);

  useEffect(() => {
    getMilkTruckBMCs().then(data => setBMCs(Array.isArray(data) ? data : []));

    // Initialize editable BMC data from trip entries
    const initialBmcData = trip.bmcEntries.map(entry => {
      const entryBmcId = entry.bmcId?._id || entry.bmcId?.id || entry.bmcId;
      const bmcName = entry.bmcId?.name || 'Unknown';
      return {
        bmcId: entryBmcId,
        bmcName: bmcName,
        milkQuantity: entry.collectionData?.milkQuantity || 0,
        fatContent: entry.collectionData?.fatContent || 0,
        snfContent: entry.collectionData?.snfContent || 0,
        originalData: entry.collectionData
      };
    });
    setEditableBmcData(initialBmcData);
  }, [trip]);

  const [dairyData, setDairyData] = useState({
    totalMilkQuantity: '',
    averageFatContent: '',
    averageSnfContent: '',
  });

  const [showVarianceForm, setShowVarianceForm] = useState(false);

  const [error, setError] = useState('');

  // Handler for updating individual BMC data
  const handleBmcDataChange = (index, field, value) => {
    setEditableBmcData(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: parseFloat(value) || 0
      };
      return updated;
    });
    setError('');
  };

  // Calculate totals from ORIGINAL BMC Data (for Trip Summary - NEVER CHANGES)
  const originalCollectionTotals = trip.bmcEntries.reduce((acc, entry) => {
    const data = entry.collectionData;
    if (!data) return acc;

    const milk = parseFloat(data.milkQuantity) || 0;
    const fat = parseFloat(data.fatContent) || 0;
    const snf = parseFloat(data.snfContent) || 0;

    acc.milk += milk;
    acc.fatKg += (milk * fat) / 100;
    acc.snfKg += (milk * snf) / 100;
    acc.count += 1;

    return acc;
  }, { milk: 0, fatKg: 0, snfKg: 0, count: 0 });

  const originalAvgFat = originalCollectionTotals.milk > 0 ? (originalCollectionTotals.fatKg / originalCollectionTotals.milk) * 100 : 0;
  const originalAvgSnf = originalCollectionTotals.milk > 0 ? (originalCollectionTotals.snfKg / originalCollectionTotals.milk) * 100 : 0;

  // Calculate totals from EDITABLE BMC Data (for Dairy Verification - CAN CHANGE)
  const editableTotals = editableBmcData.reduce((acc, entry) => {
    const milk = parseFloat(entry.milkQuantity) || 0;
    const fat = parseFloat(entry.fatContent) || 0;
    const snf = parseFloat(entry.snfContent) || 0;

    acc.milk += milk;
    acc.fatKg += (milk * fat) / 100;
    acc.snfKg += (milk * snf) / 100;
    acc.count += 1;

    return acc;
  }, { milk: 0, fatKg: 0, snfKg: 0, count: 0 });

  const editableAvgFat = editableTotals.milk > 0 ? (editableTotals.fatKg / editableTotals.milk) * 100 : 0;
  const editableAvgSnf = editableTotals.milk > 0 ? (editableTotals.snfKg / editableTotals.milk) * 100 : 0;

  // For backward compatibility, keep collectionTotals pointing to editable totals
  const collectionTotals = editableTotals;
  const avgFat = editableAvgFat;
  const avgSnf = editableAvgSnf;

  // Auto-update dairy input fields when BMC data changes
  useEffect(() => {
    if (showVarianceForm && editableBmcData.length > 0) {
      setDairyData({
        totalMilkQuantity: collectionTotals.milk.toFixed(2),
        averageFatContent: avgFat.toFixed(2),
        averageSnfContent: avgSnf.toFixed(2),
      });
    }
  }, [editableBmcData, showVarianceForm, collectionTotals.milk, avgFat, avgSnf]);

  const handleInputChange = (field, value) => {
    setDairyData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleMatchConfirm = () => {
    // Auto-fill with collection totals (don't submit yet - wait for final button)
    setDairyData({
      totalMilkQuantity: collectionTotals.milk.toString(),
      averageFatContent: avgFat.toString(),
      averageSnfContent: avgSnf.toString(),
    });
    setShowVarianceForm(true); // Show the form with pre-filled data
  };

  const handleSubmitTripComplete = () => {
    // Check if form is filled (either auto-filled or manually entered)
    if (!dairyData.totalMilkQuantity || !dairyData.averageFatContent || !dairyData.averageSnfContent) {
      setError('Please fill in all dairy reception details or click "Yes, Exact Match" first');
      return;
    }

    const finalDairyData = {
      totalMilkQuantity: parseFloat(dairyData.totalMilkQuantity),
      averageFatContent: parseFloat(dairyData.averageFatContent),
      averageSnfContent: parseFloat(dairyData.averageSnfContent),
      confirmedAt: new Date().toISOString(),
    };

    submitTrip(finalDairyData);
  };

  const submitTrip = async (finalDairyData) => {
    try {
      // Calculate Variance
      const variance = {
        milk: finalDairyData.totalMilkQuantity - collectionTotals.milk,
        fat: finalDairyData.averageFatContent - avgFat,
        snf: finalDairyData.averageSnfContent - avgSnf,
      };

      // Build BMC entries - PRESERVE original collectionData, save edits to dairyVerifiedData
      const preservedBmcEntries = editableBmcData.map(entry => {
        // Find the original entry to preserve other fields
        const originalEntry = trip.bmcEntries.find(e => (e.bmcId?._id || e.bmcId?.id || e.bmcId) === entry.bmcId);

        return {
          bmcId: entry.bmcId,
          // PRESERVE original collection data - NEVER MODIFIED
          collectionData: originalEntry?.collectionData || {
            milkQuantity: parseFloat(entry.originalData?.milkQuantity) || 0,
            fatContent: parseFloat(entry.originalData?.fatContent) || 0,
            snfContent: parseFloat(entry.originalData?.snfContent) || 0,
            collectedAt: entry.originalData?.collectedAt || new Date().toISOString(),
          },
          // NEW: Save dairy-verified (edited) data separately
          dairyVerifiedData: {
            milkQuantity: parseFloat(entry.milkQuantity) || 0,
            fatContent: parseFloat(entry.fatContent) || 0,
            snfContent: parseFloat(entry.snfContent) || 0,
            verifiedAt: new Date().toISOString(),
          },
          submissionData: originalEntry?.submissionData || null,
          differences: originalEntry?.differences || null,
          arrivalNotified: originalEntry?.arrivalNotified || false,
          arrivalTime: originalEntry?.arrivalTime || null,
        };
      });

      // Build complete trip update with all data
      const updatedTrip = {
        ...trip,
        status: 'completed',
        endTime: new Date().toISOString(),
        bmcEntries: preservedBmcEntries, // Preserve all BMC entries with collection data
        dairyConfirmation: {
          totalMilkQuantity: finalDairyData.totalMilkQuantity,
          averageFatContent: finalDairyData.averageFatContent,
          averageSnfContent: finalDairyData.averageSnfContent,
          confirmedAt: finalDairyData.confirmedAt,
          variance: variance,
          collectionTotals: {
            milk: collectionTotals.milk,
            fat: avgFat,
            snf: avgSnf
          }
        },
        // Add summary for trip-level totals
        summary: {
          totalMilk: collectionTotals.milk,
          avgFat: avgFat,
          avgSnf: avgSnf,
          completedAt: new Date().toISOString(),
        }
      };

      // Get trip ID (handle both formats)
      const tripId = trip.id || trip._id;
      if (!tripId) {
        throw new Error('Trip ID is missing');
      }

      // Remove internal MongoDB fields that shouldn't be sent
      const cleanTrip = { ...updatedTrip };
      delete cleanTrip._id;
      delete cleanTrip.__v;
      delete cleanTrip.id; // Remove id if it exists as a duplicate

      console.log('Submitting trip completion:', {
        tripId,
        bmcEntriesCount: preservedBmcEntries.length,
        hasDairyConfirmation: !!cleanTrip.dairyConfirmation,
        status: cleanTrip.status
      });

      const result = await updateMilkTruckTrip(tripId, cleanTrip);

      if (!result) {
        throw new Error('Failed to save trip data - no response from server');
      }

      console.log('Trip completed successfully:', result);

      // Notification
      const notifications = JSON.parse(localStorage.getItem('ownerNotifications') || '[]');
      notifications.unshift({
        id: `notif-${Date.now()}`,
        type: 'dairy_confirmation',
        tripId: trip.id || trip._id,
        message: `Trip Completed. Collected: ${collectionTotals.milk.toFixed(2)}L, Dairy: ${finalDairyData.totalMilkQuantity.toFixed(2)}L`,
        timestamp: new Date().toISOString(),
        variance,
        summary: updatedTrip.summary
      });
      localStorage.setItem('ownerNotifications', JSON.stringify(notifications.slice(0, 50)));

      // Ensure the result has completed status
      const completedTripData = result || updatedTrip;
      if (completedTripData.status !== 'completed') {
        completedTripData.status = 'completed';
      }

      // Call onConfirm with the updated trip data
      onConfirm(completedTripData);
    } catch (error) {
      console.error('Error completing trip:', error);
      setError(`Failed to complete trip: ${error.message || 'Unknown error'}`);
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();

    if (!dairyData.totalMilkQuantity || !dairyData.averageFatContent || !dairyData.averageSnfContent) {
      setError('Please fill in all dairy reception details');
      return;
    }

    const finalDairyData = {
      totalMilkQuantity: parseFloat(dairyData.totalMilkQuantity),
      averageFatContent: parseFloat(dairyData.averageFatContent),
      averageSnfContent: parseFloat(dairyData.averageSnfContent),
      confirmedAt: new Date().toISOString(),
    };

    submitTrip(finalDairyData);
  };

  // Calculate realtime difference for display
  const currentMilkDiff = dairyData.totalMilkQuantity
    ? (parseFloat(dairyData.totalMilkQuantity) - collectionTotals.milk).toFixed(2)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Summary of BMC Collections */}
      <Card title="Trip Summary - BMC Collections">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BMC Name</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Milk (L)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Fat %</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Fat (kg)</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">SNF %</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">SNF (kg)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trip.bmcEntries.map((entry, index) => {
                const entryBmcId = entry.bmcId?._id || entry.bmcId?.id || entry.bmcId;
                const bmcName = entry.bmcId?.name || bmcs.find(b => (b.id || b._id) === entryBmcId)?.name || 'Unknown';
                const data = entry.collectionData;

                if (!data) return null;

                const fatKg = (parseFloat(data.milkQuantity) * parseFloat(data.fatContent)) / 100;
                const snfKg = (parseFloat(data.milkQuantity) * parseFloat(data.snfContent)) / 100;

                return (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{bmcName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{parseFloat(data.milkQuantity).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{parseFloat(data.fatContent).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{fatKg.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{parseFloat(data.snfContent).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{snfKg.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-blue-50">
              <tr>
                <td className="px-4 py-3 text-sm font-bold text-blue-900">Total Collected</td>
                <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{originalCollectionTotals.milk.toFixed(2)} L</td>
                <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{originalAvgFat.toFixed(2)} %</td>
                <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{originalCollectionTotals.fatKg.toFixed(2)} kg</td>
                <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{originalAvgSnf.toFixed(2)} %</td>
                <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{originalCollectionTotals.snfKg.toFixed(2)} kg</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* 2. Dairy Reception Verification */}
      <Card title="Dairy Verification">
        {!showVarianceForm ? (
          <div className="space-y-6">
            {/* Individual BMC Data */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">BMC-wise Collection Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">BMC Name</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Milk (L)</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Fat %</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Fat (kg)</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">SNF %</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">SNF (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editableBmcData.map((entry, index) => {
                      const fatKg = (parseFloat(entry.milkQuantity) * parseFloat(entry.fatContent)) / 100;
                      const snfKg = (parseFloat(entry.milkQuantity) * parseFloat(entry.snfContent)) / 100;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{entry.bmcName}</td>
                          <td className="px-4 py-2 text-sm text-gray-700 text-right">{parseFloat(entry.milkQuantity).toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-700 text-right">{parseFloat(entry.fatContent).toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-700 text-right">{fatKg.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-700 text-right">{parseFloat(entry.snfContent).toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-gray-700 text-right">{snfKg.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aggregated Totals */}
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Collected</p>
                  <p className="text-3xl font-bold">{collectionTotals.milk.toFixed(2)} L</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
                    <span className="font-semibold">Fat: {avgFat.toFixed(2)}%</span>
                    <span>({collectionTotals.fatKg.toFixed(2)} kg)</span>
                    <span className="font-semibold">SNF: {avgSnf.toFixed(2)}%</span>
                    <span>({collectionTotals.snfKg.toFixed(2)} kg)</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm italic opacity-75">Does the Dairy Receipt match these figures?</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="success" className="py-4 text-lg" onClick={handleMatchConfirm}>
                ✅ Yes, Exact Match
              </Button>
              <Button variant="danger" className="py-4 text-lg" onClick={() => setShowVarianceForm(true)}>
                ⚠️ No, Enter Variance
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-6 animate-fade-in">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 mb-4 flex justify-between items-center">
              <span>Edit individual BMC values below or enter final dairy receipt values.</span>
              <button
                type="button"
                onClick={() => setShowVarianceForm(false)}
                className="text-yellow-600 underline hover:text-yellow-900"
              >
                Back to Match Check
              </button>
            </div>

            {/* Editable BMC Data Table */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Edit BMC Collection Data</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">BMC Name</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Milk (L)</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Fat %</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">Fat (kg)</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">SNF %</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase">SNF (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editableBmcData.map((entry, index) => {
                      const fatKg = (parseFloat(entry.milkQuantity) * parseFloat(entry.fatContent)) / 100;
                      const snfKg = (parseFloat(entry.milkQuantity) * parseFloat(entry.snfContent)) / 100;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{entry.bmcName}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={entry.milkQuantity}
                              onChange={(e) => handleBmcDataChange(index, 'milkQuantity', e.target.value)}
                              className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="20"
                              value={entry.fatContent}
                              onChange={(e) => handleBmcDataChange(index, 'fatContent', e.target.value)}
                              className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700 text-right bg-gray-50">{fatKg.toFixed(2)}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="20"
                              value={entry.snfContent}
                              onChange={(e) => handleBmcDataChange(index, 'snfContent', e.target.value)}
                              className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700 text-right bg-gray-50">{snfKg.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-blue-50">
                    <tr>
                      <td className="px-4 py-3 text-sm font-bold text-blue-900">Updated Total</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{collectionTotals.milk.toFixed(2)} L</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{avgFat.toFixed(2)} %</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{collectionTotals.fatKg.toFixed(2)} kg</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{avgSnf.toFixed(2)} %</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-900 text-right">{collectionTotals.snfKg.toFixed(2)} kg</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Total Milk Quantity (Liters) *"
                  type="number"
                  value={dairyData.totalMilkQuantity}
                  onChange={(e) => handleInputChange('totalMilkQuantity', e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g. 1500.50"
                />
                {dairyData.totalMilkQuantity && (
                  <p className={`text-xs mt-1 font-medium ${parseFloat(currentMilkDiff) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Difference: {currentMilkDiff > 0 ? '+' : ''}{currentMilkDiff} L
                  </p>
                )}
              </div>

              <Input
                label="Final Fat Content (%) *"
                type="number"
                value={dairyData.averageFatContent}
                onChange={(e) => handleInputChange('averageFatContent', e.target.value)}
                required
                min="0"
                max="20"
                step="0.01"
                placeholder="e.g. 4.5"
              />

              <Input
                label="Final SNF Content (%) *"
                type="number"
                value={dairyData.averageSnfContent}
                onChange={(e) => handleInputChange('averageSnfContent', e.target.value)}
                required
                min="0"
                max="20"
                step="0.01"
                placeholder="e.g. 8.5"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </form>
        )}

        {/* Submit Trip Complete Button - Always visible at the end of the card */}
        <div className="pt-6 mt-6 border-t-2 border-gray-300">
          <Button
            variant="success"
            className="w-full text-xl py-5 font-bold shadow-lg hover:shadow-xl transition-all bg-green-600 hover:bg-green-700"
            onClick={handleSubmitTripComplete}
            disabled={showVarianceForm && (!dairyData.totalMilkQuantity || !dairyData.averageFatContent || !dairyData.averageSnfContent)}
          >
            ✅ Submit Trip Complete
          </Button>
          {!showVarianceForm && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Click "Yes, Exact Match" or "No, Enter Variance" above, then submit here
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DairyConfirmation;

