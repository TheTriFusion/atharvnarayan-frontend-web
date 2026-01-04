import { useState, useEffect } from 'react';
import { getCattleFeedInventory, addCattleFeedInventory, updateCattleFeedInventory, deleteCattleFeedInventory } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';

const InventoryManagement = () => {
  const { isSuperAdmin, currentUser } = useAuth(); // Get currentUser to check businessCategory
  const { selectedOwnerId } = useOwner();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'kg',
    wholesalePrice: '',
    retailPrice: '',
    supplier: '',
    purchaseCost: '',
    amountPaid: '',
    paymentStatus: 'pending',
    paymentDueDate: '',
    expiryDate: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  // Determine Business Category and Presets
  const businessCategory = currentUser?.companyDetails?.businessCategory || 'agro_cattle_feed';

  const CATEGORY_PRESETS = {
    'agro_cattle_feed': ['Cattle Feed', 'Poultry Feed', 'Goat Feed', 'Sheep Feed', 'Supplements', 'Medicines'],
    'grocery': ['Grains', 'Spices', 'Oil', 'Snacks', 'Beverages', 'Cleaning', 'Personal Care'],
    'medical': ['Tablets', 'Syrups', 'Injections', 'Surgicals', 'Wellness', 'Baby Care'],
    'hardware': ['Tools', 'Paints', 'Plumbing', 'Electrical', 'Cement', 'Fittings'],
    'clothing': ['Men', 'Women', 'Kids', 'Accessories', 'Fabrics'],
    'other': ['General']
  };

  const UNIT_PRESETS = {
    'agro_cattle_feed': ['kg', 'bag', 'ton', 'liter', 'bottle'],
    'grocery': ['kg', 'gram', 'liter', 'packet', 'box', 'pcs', 'dozen'],
    'medical': ['strip', 'bottle', 'box', 'tube', 'vial', 'pcs'],
    'hardware': ['pcs', 'kg', 'meter', 'box', 'set', 'liter'],
    'clothing': ['pcs', 'meter', 'set', 'pair'],
    'other': ['pcs', 'kg', 'liter', 'box']
  };

  const categories = CATEGORY_PRESETS[businessCategory] || CATEGORY_PRESETS['other'];
  const units = UNIT_PRESETS[businessCategory] || UNIT_PRESETS['other'];

  // Merge with any custom categories found in inventory
  const availableCategories = [...new Set([...categories, ...inventory.map(i => i.category)])].sort();

  useEffect(() => {
    loadData();
  }, [selectedOwnerId]); // Reload when owner selection changes

  const loadData = async () => {
    try {
      setLoading(true);
      // Super Admin: use selected owner ID, Owner: pass null (backend will use their own ID)
      const ownerId = isSuperAdmin ? selectedOwnerId : null;
      const data = await getCattleFeedInventory(ownerId);
      setInventory(data);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load inventory';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity || parseFloat(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.wholesalePrice || parseFloat(formData.wholesalePrice) < 0) {
      newErrors.wholesalePrice = 'Valid wholesale price is required';
    }
    if (!formData.retailPrice || parseFloat(formData.retailPrice) < 0) {
      newErrors.retailPrice = 'Valid retail price is required';
    }
    if (parseFloat(formData.wholesalePrice) >= parseFloat(formData.retailPrice)) {
      newErrors.retailPrice = 'Retail price must be higher than wholesale price';
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
      const itemData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        wholesalePrice: parseFloat(formData.wholesalePrice),
        retailPrice: parseFloat(formData.retailPrice),
        purchaseCost: parseFloat(formData.purchaseCost) || 0,
        amountPaid: parseFloat(formData.amountPaid) || 0,
        paymentStatus: formData.paymentStatus,
        paymentDueDate: formData.paymentDueDate || null,
        expiryDate: formData.expiryDate || null,
        description: formData.description || '',
      };

      if (editingItem) {
        await updateCattleFeedInventory(editingItem._id || editingItem.id, itemData);
        success('Inventory item updated successfully');
      } else {
        await addCattleFeedInventory(itemData);
        success('Inventory item added successfully');
      }

      resetForm();
      await loadData();
    } catch (err) {
      const errorMessage = err.message || 'Failed to save inventory item';
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || '',
      quantity: item.quantity?.toString() || '',
      unit: item.unit || 'kg',
      wholesalePrice: item.wholesalePrice?.toString() || '',
      retailPrice: item.retailPrice?.toString() || '',
      supplier: item.supplier || '',
      purchaseCost: item.purchaseCost?.toString() || '',
      amountPaid: item.amountPaid?.toString() || '',
      paymentStatus: item.paymentStatus || 'pending',
      paymentDueDate: item.paymentDueDate ? new Date(item.paymentDueDate).toISOString().split('T')[0] : '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      description: item.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await deleteCattleFeedInventory(id);
      success('Inventory item deleted successfully');
      await loadData();
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete inventory item';
      showError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      unit: 'kg',
      wholesalePrice: '',
      retailPrice: '',
      supplier: '',
      purchaseCost: '',
      amountPaid: '',
      paymentStatus: 'pending',
      paymentDueDate: '',
      expiryDate: '',
      description: '',
    });
    setEditingItem(null);
    setErrors({});
    setShowForm(false);
  };

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSuperAdmin && <OwnerSelector systemType="cattleFeed" />}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add New Item
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or category..."
          />
          <Select
            label="Filter by Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...availableCategories.map(cat => ({ value: cat, label: cat })),
            ]}
          />
        </div>
      </Card>

      {/* Inventory List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wholesale/Retail</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item._id || item.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${item.quantity < 50
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs">W: ₹{item.wholesalePrice?.toFixed(2)}</span>
                        <span className="text-green-600 font-medium">R: ₹{item.retailPrice?.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.purchaseCost > 0 ? (
                        <div className="flex flex-col text-xs">
                          <span>Cost: ₹{item.purchaseCost}</span>
                          <span className={item.amountPaid >= item.purchaseCost ? 'text-green-600' : 'text-orange-600'}>
                            Paid: ₹{item.amountPaid || 0}
                          </span>
                          {item.amountPaid < item.purchaseCost && (
                            <span className="text-red-500 font-bold">Due: ₹{item.purchaseCost - (item.amountPaid || 0)}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(item)}
                          className="text-xs px-2 py-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleDelete(item._id || item.id)}
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

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Item Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
          />

          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            error={errors.category}
            required
            options={[
              { value: '', label: 'Select Category' },
              ...availableCategories.map(cat => ({ value: cat, label: cat })),
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              error={errors.quantity}
              required
              min="0"
              step="0.01"
            />

            <Select
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              options={units.map(unit => ({ value: unit, label: unit }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Wholesale Price (₹)"
              type="number"
              name="wholesalePrice"
              value={formData.wholesalePrice}
              onChange={handleInputChange}
              error={errors.wholesalePrice}
              required
              min="0"
              step="0.01"
            />

            <Input
              label="Retail Price (₹)"
              type="number"
              name="retailPrice"
              value={formData.retailPrice}
              onChange={handleInputChange}
              error={errors.retailPrice}
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* Supplier & Payment Details */}
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Supplier & Payment Info</h4>
            <div className="space-y-4">
              <Input
                label="Supplier Name"
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Total Purchase Cost (₹)"
                  type="number"
                  name="purchaseCost"
                  value={formData.purchaseCost}
                  onChange={handleInputChange}
                  min="0"
                />
                <Input
                  label="Amount Paid (₹)"
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Payment Status"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleInputChange}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'partial', label: 'Partial' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'overdue', label: 'Overdue' }
                  ]}
                />
                <Input
                  label="Payment Due Date"
                  type="date"
                  name="paymentDueDate"
                  value={formData.paymentDueDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>



          <Input
            label="Expiry Date"
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
          />

          <Input
            label="Description"
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />

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
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingItem ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;
