import { useState, useEffect } from 'react';
import {
  getMilkTruckOwners,
  getPendingMilkTruckOwners,
  approveMilkTruckOwner,
  addMilkTruckOwner,
  updateMilkTruckOwner,
  deleteMilkTruckOwner
} from '../../utils/storage';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { getImageUrl } from '../../utils/api';
import { UserDocumentsSection } from '../../components/common/DocViewer';

const MilkTruckOwnerManagement = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [owners, setOwners] = useState([]);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [viewOwner, setViewOwner] = useState(null); // For document viewer
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    companyName: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'active') {
        const data = await getMilkTruckOwners();
        setOwners(data);
      } else {
        const data = await getPendingMilkTruckOwners();
        setPendingOwners(data);
      }
    } catch (error) {
      console.error('Error loading milk truck owners:', error);
      setOwners([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const ownerData = {
      name: formData.name.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      companyDetails: { name: formData.companyName }
    };
    if (formData.password) ownerData.password = formData.password;

    try {
      if (editingOwner) {
        await updateMilkTruckOwner(editingOwner._id || editingOwner.id, ownerData);
      } else {
        await addMilkTruckOwner(ownerData);
      }
      resetForm();
      await loadData();
    } catch (error) {
      console.error(error);
      setErrors({ submit: error.message });
    }
  };

  const handleApprove = async (owner) => {
    if (window.confirm(`Approve registration for ${owner.name} (${owner.companyDetails?.name})?`)) {
      try {
        await approveMilkTruckOwner(owner._id || owner.id);
        loadData();
      } catch (e) {
        alert('Error approving: ' + e.message);
      }
    }
  };

  const handleEdit = (owner) => {
    setEditingOwner(owner);
    setFormData({
      name: owner.name || '',
      phoneNumber: owner.phoneNumber || '',
      password: '',
      companyName: owner.companyDetails?.name || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this milk truck owner?')) {
      await deleteMilkTruckOwner(id);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phoneNumber: '', password: '', companyName: '' });
    setEditingOwner(null);
    setShowForm(false);
    setErrors({});
  };

  const currentList = activeTab === 'active' ? owners : pendingOwners;
  const filteredOwners = Array.isArray(currentList) ? currentList.filter(owner => {
    const term = searchTerm.toLowerCase();
    return (
      (owner.name && owner.name.toLowerCase().includes(term)) ||
      (owner.phoneNumber && owner.phoneNumber.includes(term)) ||
      (owner.companyDetails?.name && owner.companyDetails.name.toLowerCase().includes(term))
    );
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Milk Truck Owners</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>Add New Owner</Button>
      </div>

      <div className="flex space-x-4 border-b">
        <button
          className={`py-2 px-4 ${activeTab === 'active' ? 'border-b-2 border-blue-500 text-blue-600 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('active')}
        >
          Active Owners
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'pending' ? 'border-b-2 border-yellow-500 text-yellow-600 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals ({pendingOwners.length})
        </button>
      </div>

      <Card>
        <Input label="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." />
      </Card>

      {/* Add/Edit Form Modal */}
      <Modal isOpen={showForm} onClose={resetForm} title={editingOwner ? 'Edit Owner' : 'Add Owner'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required />
          <Input label="Company Name" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="e.g., ABC Transport" />
          <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
          <Input label={editingOwner ? 'New Password' : 'Password'} type="password" name="password" value={formData.password} onChange={handleInputChange} required={!editingOwner} />
          {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Owner Detail / Document Viewer Modal */}
      {viewOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="font-bold text-xl text-gray-800">{viewOwner.name}</h2>
                <p className="text-sm text-gray-500">
                  {viewOwner.companyDetails?.name && <span className="mr-2">🏢 {viewOwner.companyDetails.name}</span>}
                  📞 {viewOwner.phoneNumber}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${viewOwner.onboardingStatus === 'approved' ? 'bg-green-100 text-green-700' :
                    viewOwner.onboardingStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                  }`}>
                  {viewOwner.onboardingStatus || (viewOwner.isActive ? 'Active' : 'Inactive')}
                </span>
                <button onClick={() => setViewOwner(null)} className="text-gray-400 hover:text-gray-700 text-2xl">×</button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Email</p>
                  <p className="font-medium">{viewOwner.email || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Company Type</p>
                  <p className="font-medium capitalize">{viewOwner.companyDetails?.type?.replace('_', ' ') || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Address</p>
                  <p className="font-medium">{viewOwner.companyDetails?.address || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Registered</p>
                  <p className="font-medium">{viewOwner.createdAt ? new Date(viewOwner.createdAt).toLocaleDateString() : '—'}</p>
                </div>
              </div>

              {/* KYC Documents Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span>📄</span> KYC Documents
                </h3>
                <UserDocumentsSection user={viewOwner} />
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
              {activeTab === 'pending' && (
                <Button variant="success" onClick={() => { handleApprove(viewOwner); setViewOwner(null); }}>
                  ✓ Approve Registration
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="secondary" onClick={() => { handleEdit(viewOwner); setViewOwner(null); }}>Edit</Button>
                <Button variant="danger" onClick={() => { handleDelete(viewOwner._id || viewOwner.id); setViewOwner(null); }}>Delete</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Owners Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Owner</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Company</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Documents</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOwners.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No owners found</td></tr>
              ) : (
                filteredOwners.map(owner => (
                  <tr key={owner._id || owner.id} className="hover:bg-gray-50">
                    {/* Owner with avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {owner.profileImage ? (
                          <img
                            src={getImageUrl(owner.profileImage)}
                            alt={owner.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
                            onClick={() => setViewOwner(owner)}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {owner.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{owner.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{owner.companyDetails?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{owner.phoneNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${owner.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {owner.onboardingStatus || (owner.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    {/* Document indicator */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {owner.documents?.panImage && <span title="PAN" className="text-lg">🪪</span>}
                        {(owner.documents?.aadhaarFrontImage || owner.documents?.aadhaarCard) && <span title="Aadhaar" className="text-lg">🪪</span>}
                        {owner.documents?.gstDocument && <span title="GST" className="text-lg">📋</span>}
                        {!owner.documents?.panImage && !owner.documents?.aadhaarCard && !owner.documents?.gstDocument && (
                          <span className="text-gray-300 text-xs">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => setViewOwner(owner)}>
                          👁 View
                        </Button>
                        {activeTab === 'pending' && (
                          <Button variant="success" className="px-2 py-1 text-xs" onClick={() => handleApprove(owner)}>Approve</Button>
                        )}
                        <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => handleEdit(owner)}>Edit</Button>
                        <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleDelete(owner._id || owner.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MilkTruckOwnerManagement;
