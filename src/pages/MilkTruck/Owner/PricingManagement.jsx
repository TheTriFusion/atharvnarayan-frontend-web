import { useState, useEffect } from 'react';
import { getMilkTruckPricing, setMilkTruckPricing } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';

const PricingManagement = () => {
  const { isSuperAdmin } = useAuth();
  const { selectedOwnerId } = useOwner();
  const [pricing, setPricingState] = useState({
    basePricePerLiter: 0,
    fatPricePerPercent: 0,
    snfPricePerPercent: 0,
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPricing();
  }, [selectedOwnerId]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const savedPricing = await getMilkTruckPricing();
      if (savedPricing && typeof savedPricing === 'object') {
        setPricingState({
          basePricePerLiter: savedPricing.basePricePerLiter || 50,
          fatPricePerPercent: savedPricing.fatPricePerPercent || 2,
          snfPricePerPercent: savedPricing.snfPricePerPercent || 1,
        });
      }
    } catch (err) {
      console.error('Error loading pricing:', err);
      setError('Failed to load pricing configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPricingState(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      await setMilkTruckPricing(pricing);
      setMessage('Pricing updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update pricing: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Pricing Management</h1>
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pricing configuration...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isSuperAdmin && <OwnerSelector systemType="milkTruck" />}
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pricing Management</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <Card title="Set Pricing Rules">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Base Price Per Liter (₹)"
              type="number"
              name="basePricePerLiter"
              value={pricing.basePricePerLiter}
              onChange={handleInputChange}
              disabled={loading}
              required
              min="0"
              step="0.01"
              placeholder="Enter base price per liter"
            />

            <Input
              label="Fat Price Per Percent (₹)"
              type="number"
              name="fatPricePerPercent"
              value={pricing.fatPricePerPercent}
              onChange={handleInputChange}
              disabled={loading}
              required
              min="0"
              step="0.01"
              placeholder="Enter price per fat percent"
            />

            <Input
              label="SNF Price Per Percent (₹)"
              type="number"
              name="snfPricePerPercent"
              value={pricing.snfPricePerPercent}
              onChange={handleInputChange}
              disabled={loading}
              required
              min="0"
              step="0.01"
              placeholder="Enter price per SNF percent"
            />

            {message && (
              <div className={`p-3 rounded ${
                message.includes('success') 
                  ? 'bg-green-100 text-green-700 border border-green-400' 
                  : 'bg-red-100 text-red-700 border border-red-400'
              }`}>
                {message}
              </div>
            )}

            <Button type="submit" variant="primary">
              Update Pricing
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Pricing Calculation Formula" className="mt-6">
        <div className="space-y-2 text-gray-700">
          <p><strong>Total Price =</strong></p>
          <p className="ml-4">
            (Base Price × Total Liters) + (Fat Price × Fat% × Total Liters) + (SNF Price × SNF% × Total Liters)
          </p>
          <p className="mt-4 text-sm text-gray-600">
            This formula will be used to calculate payments for completed trips.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PricingManagement;

