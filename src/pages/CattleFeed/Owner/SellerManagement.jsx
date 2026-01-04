import { useState, useEffect } from 'react';
import { getCattleFeedSellers, addCattleFeedSeller, updateCattleFeedSeller, deleteCattleFeedSeller } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';

const SellerManagement = () => {
  const { isSuperAdmin } = useAuth();
  const { selectedOwnerId } = useOwner();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    phoneNumber: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedOwnerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const ownerId = isSuperAdmin ? selectedOwnerId : null;
      const data = await getCattleFeedSellers(ownerId);
      setSellers(data);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load sellers';
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

  const validateForm = async () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else {
      // Check if username already exists (excluding current seller being edited)
      const existingSeller = sellers.find(
        s => s.username === formData.username && (s._id || s.id) !== (editingSeller?._id || editingSeller?.id)
      );
      if (existingSeller) {
        newErrors.username = 'Username already exists';
      }
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    // Password validation: required for new sellers, optional for editing (to keep old password)
    if (!editingSeller && (!formData.password || formData.password.length < 4)) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    if (editingSeller && formData.password && formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!(await validateForm())) {
      return;
    }
    
    try {
      setSubmitting(true);
      const sellerData = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || null,
      };
      
      // Only update password if provided (for editing) or always for new sellers
      if (formData.password) {
        sellerData.password = formData.password;
      }
      
      if (editingSeller) {
        await updateCattleFeedSeller(editingSeller._id || editingSeller.id, sellerData);
        success('Seller updated successfully');
      } else {
        await addCattleFeedSeller(sellerData);
        success('Seller added successfully');
      }
      
      resetForm();
      await loadData();
    } catch (err) {
      const errorMessage = err.message || 'Failed to save seller';
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (seller) => {
    setEditingSeller(seller);
    setFormData({
      name: seller.name || '',
      username: seller.username || '',
      password: '', // Don't show password, require new one or keep old
      phoneNumber: seller.phoneNumber || seller.phone || '',
      email: seller.email || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this seller? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteCattleFeedSeller(id);
      success('Seller deleted successfully');
      await loadData();
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete seller';
      showError(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      phoneNumber: '',
      email: '',
    });
    setEditingSeller(null);
    setShowForm(false);
    setErrors({});
  };

  // Filter sellers
  const filteredSellers = sellers.filter(seller => {
    const searchLower = searchTerm.toLowerCase();
    return (
      seller.name?.toLowerCase().includes(searchLower) ||
      seller.username?.toLowerCase().includes(searchLower) ||
      (seller.phoneNumber || seller.phone)?.includes(searchTerm) ||
      seller.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSuperAdmin && <OwnerSelector systemType="cattleFeed" />}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Seller Management</h1>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add New Seller
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          label="Search Sellers"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, username, phone, or email..."
        />
      </Card>

      {/* Sellers List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No sellers found
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => (
                  <tr key={seller._id || seller.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{seller.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{seller.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{seller.phoneNumber || seller.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{seller.email || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(seller)}
                          className="text-xs px-2 py-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleDelete(seller._id || seller.id)}
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
        title={editingSeller ? 'Edit Seller' : 'Add New Seller'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
          />

          <Input
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            error={errors.username}
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            error={errors.phoneNumber}
            required
          />

          <Input
            label={editingSeller ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            required={!editingSeller}
            minLength={4}
          />

          <Input
            label="Email (Optional)"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
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
              {submitting ? 'Saving...' : editingSeller ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SellerManagement;
