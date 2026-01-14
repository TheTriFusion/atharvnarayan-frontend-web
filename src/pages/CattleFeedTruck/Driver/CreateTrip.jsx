import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal'; // Kept for consistency if needed, though this is a full page now
import axios from 'axios';

const CreateTrip = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [wizardStep, setWizardStep] = useState(1);
    const [vehicles, setVehicles] = useState([]);

    // Form States
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        from: '',
        to: '',
        vehicleId: '',
        startKm: '',
        average: '',
        distance: '',
        oil: '',
        diesel: '',
        helperName: '',
        advance: '',
        driverId: user?._id || user?.id,
    });

    // Delivery State
    const [deliveries, setDeliveries] = useState([]);
    const [newDelivery, setNewDelivery] = useState({
        location: '',
        bags: '',
        feedType: 'Cattle Feed',
        receiverName: '',
        receiverPhone: ''
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://43.204.211.69:5000/api/cattle-feed-truck/vehicles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVehicles(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            // alert('Failed to fetch vehicles'); // Optional: handle error gracefully
        }
    };

    const handleAddDelivery = () => {
        if (!newDelivery.location || !newDelivery.bags) {
            alert('Please enter location and number of bags');
            return;
        }

        setDeliveries([...deliveries, { ...newDelivery }]);
        setNewDelivery({
            location: '',
            bags: '',
            feedType: 'Cattle Feed',
            receiverName: '',
            receiverPhone: ''
        });
    };

    const removeDelivery = (index) => {
        const updated = [...deliveries];
        updated.splice(index, 1);
        setDeliveries(updated);
    };

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            // Format deliveries for backend
            const validDeliveries = deliveries.map(d => ({
                location: d.location,
                receiverName: d.receiverName,
                receiverPhone: d.receiverPhone,
                plannedDelivery: {
                    feedItems: [{
                        feedType: d.feedType,
                        quantity: Number(d.bags),
                        unit: 'bags'
                    }]
                }
            }));

            const payload = {
                ...formData,
                deliveryEntries: validDeliveries,
                totalBags: deliveries.reduce((sum, d) => sum + Number(d.bags), 0),
                status: 'in_transit',
                startTime: new Date()
            };

            await axios.post(
                'http://43.204.211.69:5000/api/cattle-feed-truck/trips',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Trip started successfully!');
            navigate('/cattle-feed-truck/driver/active-trip');
        } catch (error) {
            console.error('Error creating trip:', error);
            alert('Error creating trip: ' + (error.response?.data?.message || error.message));
        }
    };

    const nextStep = () => {
        // Validation per step
        if (wizardStep === 1) {
            if (!formData.from || !formData.to || !formData.vehicleId) {
                alert('Please fill in all required fields');
                return;
            }
        } else if (wizardStep === 2) {
            if (!formData.startKm) {
                alert('Please enter Start KM');
                return;
            }
        }
        setWizardStep(prev => prev + 1);
    };

    const prevStep = () => setWizardStep(prev => prev - 1);

    const renderStep = () => {
        switch (wizardStep) {
            case 1:
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                            <h3 className="font-semibold text-blue-800 mb-1">Route & Vehicle</h3>
                            <p className="text-sm text-blue-600">Select your route and assigned vehicle.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    value={formData.vehicleId}
                                    onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                                >
                                    <option value="">Select Vehicle</option>
                                    {vehicles.map(v => (
                                        <option key={v._id} value={v._id}>{v.registrationNumber} ({v.model})</option>
                                    ))}
                                </select>
                            </div>
                            <Input label="From Location *" value={formData.from} onChange={e => setFormData({ ...formData, from: e.target.value })} placeholder="Start Location" />
                            <Input label="To Location *" value={formData.to} onChange={e => setFormData({ ...formData, to: e.target.value })} placeholder="End Location" />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
                            <h3 className="font-semibold text-indigo-800 mb-1">Trip Metrics</h3>
                            <p className="text-sm text-indigo-600">Enter initial meter reading and fuel details.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Start KM *" type="number" value={formData.startKm} onChange={e => setFormData({ ...formData, startKm: e.target.value })} placeholder="Odometer Reading" />
                            <Input label="Expected Average" type="number" value={formData.average} onChange={e => setFormData({ ...formData, average: e.target.value })} placeholder="KMPL" />
                            <Input label="Est. Distance (KM)" type="number" value={formData.distance} onChange={e => setFormData({ ...formData, distance: e.target.value })} placeholder="Total KM" />
                            <Input label="Oil (Litres)" type="number" value={formData.oil} onChange={e => setFormData({ ...formData, oil: e.target.value })} placeholder="L" />
                            <Input label="Diesel (Litres)" type="number" value={formData.diesel} onChange={e => setFormData({ ...formData, diesel: e.target.value })} placeholder="L" />
                            <Input label="Helper Name" value={formData.helperName} onChange={e => setFormData({ ...formData, helperName: e.target.value })} placeholder="Optional" />
                            <Input label="Advance Payment" type="number" value={formData.advance} onChange={e => setFormData({ ...formData, advance: e.target.value })} placeholder="₹" />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
                            <h3 className="font-semibold text-green-800 mb-1">Delivery Plan</h3>
                            <p className="text-sm text-green-600">Add all planned stops for this trip.</p>
                        </div>

                        {/* Add New Delivery Form */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-3">Add New Stop</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <Input
                                    value={newDelivery.location}
                                    onChange={e => setNewDelivery({ ...newDelivery, location: e.target.value })}
                                    placeholder="Location / Shop Name *"
                                    className="bg-white"
                                />
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={newDelivery.bags}
                                        onChange={e => setNewDelivery({ ...newDelivery, bags: e.target.value })}
                                        placeholder="Bags *"
                                        className="bg-white w-24"
                                    />
                                    <select
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none"
                                        value={newDelivery.feedType}
                                        onChange={e => setNewDelivery({ ...newDelivery, feedType: e.target.value })}
                                    >
                                        <option>Cattle Feed</option>
                                        <option>Poultry Feed</option>
                                        <option>Supplements</option>
                                    </select>
                                </div>
                                <Input
                                    value={newDelivery.receiverName}
                                    onChange={e => setNewDelivery({ ...newDelivery, receiverName: e.target.value })}
                                    placeholder="Receiver Name (Optional)"
                                    className="bg-white"
                                />
                                <Input
                                    value={newDelivery.receiverPhone}
                                    onChange={e => setNewDelivery({ ...newDelivery, receiverPhone: e.target.value })}
                                    placeholder="Receiver Phone (Optional)"
                                    className="bg-white"
                                />
                            </div>
                            <Button onClick={handleAddDelivery} size="sm" className="w-full bg-gray-800 hover:bg-black text-white">
                                + Add Stop
                            </Button>
                        </div>

                        {/* List of deliveries */}
                        <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto">
                            {deliveries.map((d, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div>
                                        <p className="font-bold text-gray-800">{d.location}</p>
                                        <p className="text-xs text-gray-500">{d.bags} bags • {d.feedType}</p>
                                    </div>
                                    <button onClick={() => removeDelivery(i)} className="text-red-500 hover:text-red-700 p-2">✕</button>
                                </div>
                            ))}
                            {deliveries.length === 0 && (
                                <p className="text-center text-gray-400 py-4 italic">No stops added yet.</p>
                            )}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-6 text-center">
                            <div className="text-4xl mb-2">🚚</div>
                            <h3 className="font-bold text-yellow-800 text-lg">Ready to Start?</h3>
                            <p className="text-yellow-700">Please review the details below before starting.</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Route</span>
                                <span className="font-bold text-gray-800">{formData.from} ➝ {formData.to}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Vehicle</span>
                                <div className="text-right">
                                    <span className="font-bold text-gray-800 block">
                                        {vehicles.find(v => v._id === formData.vehicleId)?.registrationNumber || 'N/A'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        Start KM: {formData.startKm}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Total Stops</span>
                                <span className="font-bold text-blue-600">{deliveries.length} Locations</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total Load</span>
                                <span className="font-bold text-green-600 text-lg">
                                    {deliveries.reduce((sum, d) => sum + Number(d.bags), 0)} Bags
                                </span>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/cattle-feed-truck/driver/dashboard')}
                        className="mb-4 text-gray-500 hover:text-gray-800"
                    >
                        ← Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">Start New Trip</h1>
                    <p className="text-gray-500 mt-1">Fill in the details below to begin your journey.</p>
                </div>

                {/* Wizard Container */}
                <Card className="p-0 overflow-hidden shadow-xl border-0">
                    {/* Progress Bar */}
                    <div className="bg-white border-b border-gray-100 p-6">
                        <div className="flex justify-between relative">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0 -translate-y-1/2 rounded-full"></div>
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-blue-500 -z-0 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${((wizardStep - 1) / 3) * 100}%` }}
                            ></div>

                            {[1, 2, 3, 4].map(step => (
                                <div key={step} className="relative z-10 flex flex-col items-center group cursor-default">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ring-4 ${step <= wizardStep
                                        ? 'bg-blue-600 text-white ring-blue-50 shadow-blue-200 shadow-lg scale-110'
                                        : 'bg-white text-gray-400 ring-gray-50 border-2 border-gray-200'
                                        }`}>
                                        {step < wizardStep ? '✓' : step}
                                    </div>
                                    <span className={`text-xs font-semibold mt-2 transition-colors duration-300 ${step <= wizardStep ? 'text-blue-600' : 'text-gray-400'
                                        }`}>
                                        {['Route', 'Metrics', 'Plan', 'Review'][step - 1]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="p-6 md:p-8 min-h-[400px] bg-white">
                        {renderStep()}
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center">
                        <Button
                            variant="secondary"
                            onClick={wizardStep === 1 ? () => navigate('/cattle-feed-truck/driver/dashboard') : prevStep}
                            className="text-gray-600 hover:bg-white hover:shadow-sm"
                        >
                            {wizardStep === 1 ? 'Cancel' : '← Back'}
                        </Button>

                        {wizardStep < 4 ? (
                            <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-100 transform hover:-translate-y-0.5 transition-all">
                                Next Step →
                            </Button>
                        ) : (
                            <Button onClick={handleCreateTrip} className="bg-green-600 hover:bg-green-700 text-white px-8 shadow-lg shadow-green-100 transform hover:-translate-y-0.5 transition-all">
                                ⭐ Start Trip Now
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CreateTrip;
