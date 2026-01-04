import { useState } from 'react';
import { getMilkTruckBMCs, updateMilkTruckTrip, getMilkTruckPricing } from '../../utils/storage';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const DairyConfirmation = ({ trip, onConfirm }) => {
    const bmcs = getMilkTruckBMCs();
    const pricing = getMilkTruckPricing();

    // Initialize with empty submission data
    const [submissionForms, setSubmissionForms] = useState({});
    const [error, setError] = useState('');
    const [differences, setDifferences] = useState({});

    const handleInputChange = (bmcId, field, value) => {
        setSubmissionForms(prev => ({
            ...prev,
            [bmcId]: {
                ...prev[bmcId],
                [field]: value,
            },
        }));

        // Calculate real-time differences
        const entry = trip.bmcEntries.find(e => e.bmcId === bmcId);
        if (entry && entry.collectionData) {
            const collection = entry.collectionData;
            const currentForm = { ...submissionForms[bmcId], [field]: value };

            // Only calculate if we have numbers
            if (currentForm.milkQuantity && collection.milkQuantity) {
                const milkDiff = parseFloat(currentForm.milkQuantity) - collection.milkQuantity;
                const fatDiff = (parseFloat(currentForm.fatContent) || 0) - collection.fatContent;
                const snfDiff = (parseFloat(currentForm.snfContent) || 0) - collection.snfContent;

                setDifferences(prev => ({
                    ...prev,
                    [bmcId]: {
                        milkQuantity: milkDiff,
                        fatContent: fatDiff,
                        snfContent: snfDiff
                    }
                }));
            }
        }
    };

    const calculateFinalStats = () => {
        let totals = {
            collectionMilk: 0,
            submissionMilk: 0,
            expenses: 0
        };

        const entries = trip.bmcEntries.map(entry => {
            const subData = submissionForms[entry.bmcId];
            if (!subData) return null;

            const collection = entry.collectionData;

            totals.collectionMilk += collection.milkQuantity;
            totals.submissionMilk += parseFloat(subData.milkQuantity || 0);
            totals.expenses += (parseFloat(subData.fuel || 0) + parseFloat(subData.foodTollWater || 0));

            // Calculate liters for fat/snf
            const fatLiters = (parseFloat(subData.milkQuantity) * parseFloat(subData.fatContent)) / 100;
            const snfLiters = (parseFloat(subData.milkQuantity) * parseFloat(subData.snfContent)) / 100;
            const colFatLiters = (collection.milkQuantity * collection.fatContent) / 100;
            const colSnfLiters = (collection.milkQuantity * collection.snfContent) / 100;

            return {
                ...entry,
                submissionData: {
                    milkQuantity: parseFloat(subData.milkQuantity),
                    fatContent: parseFloat(subData.fatContent),
                    snfContent: parseFloat(subData.snfContent),
                    expenses: {
                        fuel: parseFloat(subData.fuel || 0),
                        foodTollWater: parseFloat(subData.foodTollWater || 0)
                    },
                    notes: subData.notes,
                    submittedAt: new Date().toISOString()
                },
                differences: {
                    milkQuantity: parseFloat(subData.milkQuantity) - collection.milkQuantity,
                    fatContent: parseFloat(subData.fatContent) - collection.fatContent,
                    snfContent: parseFloat(subData.snfContent) - collection.snfContent,
                    fatLiters: fatLiters - colFatLiters,
                    snfLiters: snfLiters - colSnfLiters
                }
            };
        }).filter(Boolean);

        return { entries, totals };
    };

    const handleFinalSubmit = (e) => {
        e.preventDefault();

        // Check if all forms filled
        const allFilled = trip.bmcEntries.every(entry => {
            const form = submissionForms[entry.bmcId];
            return form && form.milkQuantity && form.fatContent && form.snfContent;
        });

        if (!allFilled) {
            setError('Please fill submission data for all BMCs');
            return;
        }

        const { entries, totals } = calculateFinalStats();

        // Summary Calculation
        const totalFatLiters = entries.reduce((sum, e) => sum + ((e.submissionData.milkQuantity * e.submissionData.fatContent) / 100), 0);
        const totalSnfLiters = entries.reduce((sum, e) => sum + ((e.submissionData.milkQuantity * e.submissionData.snfContent) / 100), 0);

        const summary = {
            totalMilk: totals.submissionMilk,
            totalFatLiters,
            totalSnfLiters,
            avgFat: totals.submissionMilk ? (totalFatLiters / totals.submissionMilk) * 100 : 0,
            avgSnf: totals.submissionMilk ? (totalSnfLiters / totals.submissionMilk) * 100 : 0,
            totalExpenses: totals.expenses,
            completedAt: new Date().toISOString()
        };

        const updatedTrip = {
            ...trip,
            status: 'completed',
            endTime: new Date().toISOString(),
            bmcEntries: entries,
            summary
        };

        updateMilkTruckTrip(trip.id, updatedTrip);

        // Notify Owner
        const notifications = JSON.parse(localStorage.getItem('ownerNotifications') || '[]');
        notifications.unshift({
            id: `notif-${Date.now()}`,
            type: 'dairy_submission',
            tripId: trip.id,
            message: `Trip Completed. Collected: ${totals.collectionMilk.toFixed(2)}L, Submitted: ${totals.submissionMilk.toFixed(2)}L. Diff: ${(totals.submissionMilk - totals.collectionMilk).toFixed(2)}L`,
            timestamp: new Date().toISOString(),
            summary
        });
        localStorage.setItem('ownerNotifications', JSON.stringify(notifications.slice(0, 50)));

        onConfirm(updatedTrip);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <Card title="Dairy Submission (Enter Final Readings)">
                <p className="text-sm text-gray-600 mb-4">
                    For each BMC, enter the quantity and quality readings as confirmed by the Dairy.
                </p>

                <div className="space-y-6">
                    {trip.bmcEntries.map(entry => {
                        const bmc = bmcs.find(b => b.id === entry.bmcId);
                        const col = entry.collectionData;
                        const form = submissionForms[entry.bmcId] || {};
                        const diff = differences[entry.bmcId];

                        return (
                            <div key={entry.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-lg">{bmc?.name}</h4>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Collected: <span className="font-semibold">{col.milkQuantity}L</span>
                                            (Fat: {col.fatContent}%, SNF: {col.snfContent}%)
                                        </div>
                                    </div>
                                    {diff && (
                                        <div className={`text-right text-xs px-2 py-1 rounded ${diff.milkQuantity < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            Diff: {diff.milkQuantity > 0 ? '+' : ''}{diff.milkQuantity.toFixed(2)}L
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <Input
                                        label="Dairy Milk Qty (L)"
                                        type="number"
                                        value={form.milkQuantity || ''}
                                        onChange={(e) => handleInputChange(entry.bmcId, 'milkQuantity', e.target.value)}
                                        placeholder={col.milkQuantity}
                                        required
                                    />
                                    <Input
                                        label="Dairy Fat %"
                                        type="number"
                                        value={form.fatContent || ''}
                                        onChange={(e) => handleInputChange(entry.bmcId, 'fatContent', e.target.value)}
                                        placeholder={col.fatContent}
                                        required
                                    />
                                    <Input
                                        label="Dairy SNF %"
                                        type="number"
                                        value={form.snfContent || ''}
                                        onChange={(e) => handleInputChange(entry.bmcId, 'snfContent', e.target.value)}
                                        placeholder={col.snfContent}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Expenses (Fuel/Toll/Food)"
                                        type="number"
                                        value={form.fuel || ''} // Using 'fuel' generic field for simplicity here, or separate
                                        onChange={(e) => handleInputChange(entry.bmcId, 'fuel', e.target.value)}
                                        placeholder="0"
                                    />
                                    <Input
                                        label="Notes"
                                        value={form.notes || ''}
                                        onChange={(e) => handleInputChange(entry.bmcId, 'notes', e.target.value)}
                                        placeholder="Any discrepancy notes..."
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {error && (
                    <div className="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="mt-6">
                    <Button
                        variant="success"
                        onClick={handleFinalSubmit}
                        className="w-full py-3 text-lg"
                    >
                        Submit Final Dairy Readings & Close Trip
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default DairyConfirmation;
