import { useState, useEffect } from 'react';
import { getCattleFeedInventory, addCattleFeedSale, getCattleFeedSales, getCattleFeedInventoryItem } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Modal from '../../../components/common/Modal';
import Receipt from '../../../components/common/Receipt';

const SellerSales = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [saleType, setSaleType] = useState('retail'); // Default to retail for sellers
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    items: [],
  });
  const [selectedItem, setSelectedItem] = useState({
    inventoryId: '',
    quantity: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const inventoryData = await getCattleFeedInventory();
    const salesData = await getCattleFeedSales();
    setInventory(inventoryData);
    setSales(salesData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectedItemChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem(prev => ({ ...prev, [name]: value }));
  };

  const addItemToSale = async () => {
    if (!selectedItem.inventoryId || !selectedItem.quantity) {
      alert('Please select an item and enter quantity');
      return;
    }

    const inventoryItem = await getCattleFeedInventoryItem(selectedItem.inventoryId);
    if (!inventoryItem) {
      alert('Item not found');
      return;
    }

    const quantity = parseFloat(selectedItem.quantity);
    if (quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    if (quantity > inventoryItem.quantity) {
      alert(`Insufficient stock. Available: ${inventoryItem.quantity} ${inventoryItem.unit}`);
      return;
    }

    // Check if item already in cart
    const existingIndex = formData.items.findIndex(item => item.inventoryId === selectedItem.inventoryId);
    const unitPrice = saleType === 'wholesale' ? inventoryItem.wholesalePrice : inventoryItem.retailPrice;
    const total = quantity * unitPrice;

    if (existingIndex >= 0) {
      // Update existing item
      const updatedItems = [...formData.items];
      const newQuantity = updatedItems[existingIndex].quantity + quantity;
      if (newQuantity > inventoryItem.quantity) {
        alert(`Insufficient stock. Available: ${inventoryItem.quantity} ${inventoryItem.unit}`);
        return;
      }
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: newQuantity,
        total: newQuantity * unitPrice,
      };
      setFormData(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Add new item
      setFormData(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            inventoryId: inventoryItem.id,
            itemName: inventoryItem.name,
            quantity: quantity,
            unit: inventoryItem.unit,
            unitPrice: unitPrice,
            total: total,
          },
        ],
      }));
    }

    setSelectedItem({ inventoryId: '', quantity: '' });
  };

  const removeItemFromSale = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const updateItemQuantity = async (index, newQuantity) => {
    const item = formData.items[index];
    const inventoryItem = await getCattleFeedInventoryItem(item.inventoryId);
    
    if (!inventoryItem) return;

    const quantity = parseFloat(newQuantity);
    if (quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    if (quantity > inventoryItem.quantity) {
      alert(`Insufficient stock. Available: ${inventoryItem.quantity} ${inventoryItem.unit}`);
      return;
    }

    const unitPrice = saleType === 'wholesale' ? inventoryItem.wholesalePrice : inventoryItem.retailPrice;
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: quantity,
      total: quantity * unitPrice,
    };
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (formData.items.length === 0) {
      newErrors.items = 'Please add at least one item to the sale';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const saleData = {
      saleType: saleType,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone || null,
      items: formData.items,
      totalAmount: calculateTotal(),
    };
    
    const newSale = await addCattleFeedSale(saleData);
    
    // Show success message and receipt option
    setSuccessMessage(`Sale created successfully! Total: ₹${calculateTotal().toFixed(2)}`);
    
    // Set the new sale for receipt viewing
    setSelectedSaleForReceipt(newSale);
    
    // Reset form
    setFormData({
      customerName: '',
      customerPhone: '',
      items: [],
    });
    setSelectedItem({ inventoryId: '', quantity: '' });
    setErrors({});
    
    // Reload inventory and sales to reflect updated quantities
    loadData();
    
    // Show receipt modal automatically
    setTimeout(() => {
      setShowReceipt(true);
    }, 500);
    
    // Clear success message after 10 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 10000);
  };

  // Get available inventory items (with stock > 0)
  const availableItems = inventory.filter(item => item.quantity > 0);

  // Sort sales by date (newest first)
  const sortedSales = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Sales Management</h1>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
          <span>{successMessage}</span>
          {selectedSaleForReceipt && (
            <Button
              variant="primary"
              onClick={() => setShowReceipt(true)}
              className="text-sm"
            >
              View Receipt
            </Button>
          )}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          {/* Sale Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sale Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={async () => {
                  setSaleType('wholesale');
                  // Recalculate prices for existing items
                  const updatedItems = await Promise.all(
                    formData.items.map(async (item) => {
                      const inventoryItem = await getCattleFeedInventoryItem(item.inventoryId);
                      if (inventoryItem) {
                        const unitPrice = inventoryItem.wholesalePrice;
                        return {
                          ...item,
                          unitPrice: unitPrice,
                          total: item.quantity * unitPrice,
                        };
                      }
                      return item;
                    })
                  );
                  setFormData(prev => ({ ...prev, items: updatedItems }));
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  saleType === 'wholesale'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Wholesale
              </button>
              <button
                type="button"
                onClick={async () => {
                  setSaleType('retail');
                  // Recalculate prices for existing items
                  const updatedItems = await Promise.all(
                    formData.items.map(async (item) => {
                      const inventoryItem = await getCattleFeedInventoryItem(item.inventoryId);
                      if (inventoryItem) {
                        const unitPrice = inventoryItem.retailPrice;
                        return {
                          ...item,
                          unitPrice: unitPrice,
                          total: item.quantity * unitPrice,
                        };
                      }
                      return item;
                    })
                  );
                  setFormData(prev => ({ ...prev, items: updatedItems }));
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  saleType === 'retail'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Retail
              </button>
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
              placeholder="Enter customer name"
              error={errors.customerName}
            />
            <Input
              label="Customer Phone (Optional)"
              name="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>

          {/* Add Items Section */}
          <div className="border-t pt-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Select
                label="Select Item"
                name="inventoryId"
                value={selectedItem.inventoryId}
                onChange={handleSelectedItemChange}
                options={availableItems.map(item => ({
                  value: item.id,
                  label: `${item.name} (Stock: ${item.quantity} ${item.unit})`,
                }))}
                placeholder="Select an item"
              />
              <Input
                label="Quantity"
                type="number"
                name="quantity"
                value={selectedItem.quantity}
                onChange={handleSelectedItemChange}
                min="0.01"
                step="0.01"
                placeholder="0"
              />
              <div className="flex items-end">
                <Button type="button" variant="primary" onClick={addItemToSale} className="w-full">
                  Add Item
                </Button>
              </div>
            </div>
          </div>

          {errors.items && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.items}
            </div>
          )}

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Items in Sale:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {formData.items.map((item, index) => {
                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} {item.unit || ''} × ₹{item.unitPrice?.toFixed(2)} = ₹{item.total?.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, e.target.value)}
                          min="0.01"
                          step="0.01"
                          className="w-20"
                        />
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => removeItemFromSale(index)}
                          className="text-xs px-2 py-1"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-xl font-bold text-gray-800">
                  Total Amount: ₹{calculateTotal().toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <Button type="submit" variant="primary" className="w-full" disabled={formData.items.length === 0}>
              Create Sale
            </Button>
          </div>
        </form>
      </Card>

      {/* Sales History Section */}
      <Card title={`All Sales History (${sortedSales.length} transactions)`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No sales found
                  </td>
                </tr>
              ) : (
                sortedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">{sale.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(sale.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{sale.customerName}</p>
                        {sale.customerPhone && (
                          <p className="text-xs text-gray-500">{sale.customerPhone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sale.saleType === 'wholesale' 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {sale.saleType?.charAt(0).toUpperCase() + sale.saleType?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="space-y-1 max-w-xs">
                        {sale.items?.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-medium">{item.itemName}:</span>{' '}
                            <span>{item.quantity} × ₹{item.unitPrice?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ₹{sale.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setSelectedSaleForReceipt(sale);
                          setShowReceipt(true);
                        }}
                        className="text-xs px-2 py-1"
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Statistics */}
        {sortedSales.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-blue-600">{sortedSales.length}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Wholesale Sales</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {sortedSales.filter(s => s.saleType === 'wholesale').length}
                </p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Retail Sales</p>
                <p className="text-2xl font-bold text-teal-600">
                  {sortedSales.filter(s => s.saleType === 'retail').length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{sortedSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          setSelectedSaleForReceipt(null);
        }}
        title="Sales Receipt"
        size="lg"
      >
        {selectedSaleForReceipt && (
          <Receipt
            sale={selectedSaleForReceipt}
            onClose={() => {
              setShowReceipt(false);
              setSelectedSaleForReceipt(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default SellerSales;

