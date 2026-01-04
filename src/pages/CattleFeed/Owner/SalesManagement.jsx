import { useState, useEffect } from 'react';
import { getCattleFeedSales, addCattleFeedSale, updateCattleFeedSale, deleteCattleFeedSale, getCattleFeedInventory, getCattleFeedInventoryItem } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Modal from '../../../components/common/Modal';
import Receipt from '../../../components/common/Receipt';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';

const SalesManagement = () => {
  const { isSuperAdmin, currentUser } = useAuth();
  const { selectedOwnerId } = useOwner();
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saleType, setSaleType] = useState('wholesale'); // 'wholesale' or 'retail'
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
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
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedOwnerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const ownerId = isSuperAdmin ? selectedOwnerId : null;
      const [salesData, inventoryData] = await Promise.all([
        getCattleFeedSales(ownerId),
        getCattleFeedInventory(ownerId),
      ]);
      setSales(salesData);
      setInventory(inventoryData);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load sales data';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
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
      showError('Please select an item and enter quantity');
      return;
    }

    try {
      const inventoryItem = await getCattleFeedInventoryItem(selectedItem.inventoryId);
      if (!inventoryItem) {
        showError('Item not found');
        return;
      }

      const quantity = parseFloat(selectedItem.quantity);
      if (quantity <= 0) {
        showError('Quantity must be greater than 0');
        return;
      }

      if (quantity > inventoryItem.quantity) {
        showError(`Insufficient stock. Available: ${inventoryItem.quantity} ${inventoryItem.unit}`);
        return;
      }

      // Check if item already in cart
      const existingIndex = formData.items.findIndex(item =>
        item.inventoryId === selectedItem.inventoryId ||
        item.inventoryId === inventoryItem._id ||
        item.inventoryId === inventoryItem.id
      );
      const unitPrice = saleType === 'wholesale' ? inventoryItem.wholesalePrice : inventoryItem.retailPrice;
      const total = quantity * unitPrice;

      if (existingIndex >= 0) {
        // Update existing item
        const updatedItems = [...formData.items];
        const newQuantity = updatedItems[existingIndex].quantity + quantity;
        if (newQuantity > inventoryItem.quantity) {
          showError(`Insufficient stock. Available: ${inventoryItem.quantity} ${inventoryItem.unit}`);
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
              inventoryId: inventoryItem._id || inventoryItem.id,
              itemName: inventoryItem.name,
              quantity: quantity,
              unitPrice: unitPrice,
              total: total,
            },
          ],
        }));
      }

      setSelectedItem({ inventoryId: '', quantity: '' });
    } catch (err) {
      showError(err.message || 'Failed to add item to sale');
    }
  };

  const removeItemFromSale = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const updateItemQuantity = async (index, newQuantity) => {
    const item = formData.items[index];
    try {
      const inventoryItem = await getCattleFeedInventoryItem(item.inventoryId);

      if (!inventoryItem) {
        showError('Item not found');
        return;
      }

      const quantity = parseFloat(newQuantity);
      if (quantity <= 0) {
        showError('Quantity must be greater than 0');
        return;
      }

      if (quantity > inventoryItem.quantity) {
        showError(`Insufficient stock. Available: ${inventoryItem.quantity} ${inventoryItem.unit}`);
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
    } catch (err) {
      showError(err.message || 'Failed to update item quantity');
    }
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

    try {
      setSubmitting(true);
      const saleData = {
        saleType: saleType,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone || null,
        items: formData.items,
        totalAmount: calculateTotal(),
      };

      if (editingSale) {
        await updateCattleFeedSale(editingSale._id || editingSale.id, saleData);
        success('Sale updated successfully');
      } else {
        await addCattleFeedSale(saleData);
        success('Sale created successfully');
      }

      resetForm();
      await loadData();
    } catch (err) {
      const errorMessage = err.message || 'Failed to save sale';
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setSaleType(sale.saleType);
    setFormData({
      customerName: sale.customerName || '',
      customerPhone: sale.customerPhone || '',
      items: sale.items || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale? This will restore inventory quantities.')) {
      return;
    }

    try {
      await deleteCattleFeedSale(id);
      success('Sale deleted successfully');
      await loadData();
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete sale';
      showError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      items: [],
    });
    setSelectedItem({ inventoryId: '', quantity: '' });
    setEditingSale(null);
    setShowForm(false);
    setErrors({});
  };

  // Filter sales by type
  const filteredSales = sales.filter(sale => sale.saleType === saleType);

  // Get available inventory items (with stock > 0)
  const availableItems = inventory.filter(item => item.quantity > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSuperAdmin && <OwnerSelector systemType="cattleFeed" />}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Sales Management</h1>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Create New Sale
        </Button>
      </div>

      {/* Sale Type Toggle */}
      <Card>
        <div className="flex gap-4">
          <Button
            variant={saleType === 'wholesale' ? 'primary' : 'secondary'}
            onClick={() => {
              setSaleType('wholesale');
              resetForm();
            }}
          >
            Wholesale Sales
          </Button>
          <Button
            variant={saleType === 'retail' ? 'primary' : 'secondary'}
            onClick={() => {
              setSaleType('retail');
              resetForm();
            }}
          >
            Retail Sales
          </Button>
        </div>
      </Card>

      {/* Sales List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No {saleType} sales found
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale._id || sale.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(sale.date || sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{sale.customerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{sale.items?.length || 0} items</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{sale.totalAmount?.toFixed(2) || '0.00'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSelectedSaleForReceipt(sale);
                            setShowReceipt(true);
                          }}
                          className="text-xs px-2 py-1"
                        >
                          Receipt
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(sale)}
                          className="text-xs px-2 py-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleDelete(sale._id || sale.id)}
                          className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Sale Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingSale ? 'Edit Sale' : 'Create New Sale'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
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

          <div className="border-t pt-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Add Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Select
                label="Select Item"
                name="inventoryId"
                value={selectedItem.inventoryId}
                onChange={handleSelectedItemChange}
                options={[
                  { value: '', label: 'Select an item' },
                  ...availableItems.map(item => ({
                    value: item._id || item.id,
                    label: `${item.name} (Stock: ${item.quantity} ${item.unit})`,
                  })),
                ]}
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

          {/* Items in Sale */}
          {formData.items.length > 0 && (
            <div className="border-t pt-4 mb-4">
              <h3 className="text-lg font-semibold mb-4">Items in Sale</h3>
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ₹{item.unitPrice?.toFixed(2)} = ₹{item.total?.toFixed(2)}
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
                        variant="secondary"
                        onClick={() => removeItemFromSale(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-lg font-bold text-gray-800">
                  Total: ₹{calculateTotal().toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={resetForm}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || formData.items.length === 0}
            >
              {submitting ? 'Saving...' : editingSale ? 'Update Sale' : 'Create Sale'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal */}
      {showReceipt && selectedSaleForReceipt && (
        <Modal
          isOpen={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            setSelectedSaleForReceipt(null);
          }}
          title="Sale Receipt"
          size="lg"
        >
          <Receipt
            sale={selectedSaleForReceipt}
            companyName={
              isSuperAdmin
                ? (selectedItem?.companyDetails?.name || 'Retail Shop') // SuperAdmin might need to fetch owner details, simpler to default for now or pass selectedOwner's logic
                : (currentUser?.companyDetails?.name || 'My Shop')
            }
          />
        </Modal>
      )}
    </div>
  );
};

export default SalesManagement;
