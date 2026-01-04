import { useState, useEffect } from 'react';
import { getMilkTruckBMCs, addMilkTruckBMC, updateMilkTruckBMC, deleteMilkTruckBMC, getMilkTruckBMCHistory } from '../../../utils/storage';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { useOwner } from '../../../contexts/OwnerContext';
import OwnerSelector from '../../../components/SuperAdmin/OwnerSelector';

const BMCManagement = () => {
  const { isSuperAdmin } = useAuth();
  const { selectedOwnerId } = useOwner();
  const [bmcs, setBMCs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBMC, setEditingBMC] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact: '',
  });

  useEffect(() => {
    loadBMCs();
  }, [selectedOwnerId]);

  const loadBMCs = async () => {
    try {
      const ownerId = isSuperAdmin ? selectedOwnerId : null;
      const data = await getMilkTruckBMCs(ownerId);
      setBMCs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading BMCs:', error);
      setBMCs([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBMC) {
        await updateMilkTruckBMC(editingBMC._id || editingBMC.id, formData);
      } else {
        await addMilkTruckBMC(formData);
      }

      resetForm();
      await loadBMCs();
    } catch (error) {
      console.error('Error saving BMC:', error);
      alert('Failed to save BMC: ' + error.message);
    }
  };

  const handleEdit = (bmc) => {
    setEditingBMC(bmc);
    setFormData({
      name: bmc.name,
      location: bmc.location,
      contact: bmc.contact,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this BMC?')) {
      try {
        await deleteMilkTruckBMC(id);
        await loadBMCs();
      } catch (error) {
        console.error('Error deleting BMC:', error);
        alert('Failed to delete BMC: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', location: '', contact: '' });
    setEditingBMC(null);
    setShowForm(false);
  };

  const [historyModal, setHistoryModal] = useState({ show: false, bmc: null, data: null, loading: false });

  // ... (previous useEffect and loadBMCs remain same)

  // Add viewHistory function
  const viewHistory = async (bmc) => {
    setHistoryModal({ show: true, bmc, data: null, loading: true });
    try {
      const historyData = await getMilkTruckBMCHistory(bmc._id || bmc.id);
      setHistoryModal({ show: true, bmc, data: historyData, loading: false });
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistoryModal({ show: false, bmc: null, data: null, loading: false });
      alert('Failed to load history');
    }
  };

  const closeHistory = () => {
    setHistoryModal({ show: false, bmc: null, data: null, loading: false });
  };

  // ... (previous handle actions)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... (previous JSX) */}

      {/* History Modal */}
      {historyModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">BMC History: {historyModal.bmc?.name}</h2>
                <p className="text-sm text-gray-600">Detailed Collection vs Dairy Verification Analysis</p>
              </div>
              <button onClick={closeHistory} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {historyModal.loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : historyModal.data && historyModal.data.history?.length > 0 ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border border-blue-100">
                      <h3 className="text-sm font-semibold text-blue-800 uppercase mb-2">Total Accumulated Variance (Milk)</h3>
                      <div className={`text-2xl font-bold ${(historyModal.data.totalVariance?.milk || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(historyModal.data.totalVariance?.milk || 0) > 0 ? '+' : ''}{(historyModal.data.totalVariance?.milk || 0).toFixed(2)} L
                      </div>
                    </Card>
                    <Card className="bg-purple-50 border border-purple-100">
                      <h3 className="text-sm font-semibold text-purple-800 uppercase mb-2">Total Variance (Fat Kg)</h3>
                      <div className={`text-2xl font-bold ${(historyModal.data.totalVariance?.fatKg || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(historyModal.data.totalVariance?.fatKg || 0) > 0 ? '+' : ''}{(historyModal.data.totalVariance?.fatKg || 0).toFixed(2)} Kg
                      </div>
                    </Card>
                    <Card className="bg-indigo-50 border border-indigo-100">
                      <h3 className="text-sm font-semibold text-indigo-800 uppercase mb-2">Total Variance (SNF Kg)</h3>
                      <div className={`text-2xl font-bold ${(historyModal.data.totalVariance?.snfKg || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(historyModal.data.totalVariance?.snfKg || 0) > 0 ? '+' : ''}{(historyModal.data.totalVariance?.snfKg || 0).toFixed(2)} Kg
                      </div>
                    </Card>
                  </div>

                  {/* Detailed Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th rowSpan="2" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase border-r">Date & Trip</th>
                          <th colSpan="3" className="px-4 py-2 text-center text-xs font-bold text-green-700 bg-green-50 border-r uppercase">Collected (At BMC)</th>
                          <th colSpan="3" className="px-4 py-2 text-center text-xs font-bold text-purple-700 bg-purple-50 border-r uppercase">Verified (At Dairy)</th>
                          <th colSpan="3" className="px-4 py-2 text-center text-xs font-bold text-gray-700 bg-gray-50 uppercase">Analysis (Variance)</th>
                        </tr>
                        <tr>
                          {/* Collected */}
                          <th className="px-4 py-2 text-xs font-medium text-green-800 bg-green-50 border-r">Milk (L)</th>
                          <th className="px-4 py-2 text-xs font-medium text-green-800 bg-green-50 border-r">Fat %</th>
                          <th className="px-4 py-2 text-xs font-medium text-green-800 bg-green-50 border-r">SNF %</th>

                          {/* Verified */}
                          <th className="px-4 py-2 text-xs font-medium text-purple-800 bg-purple-50 border-r">Milk (L)</th>
                          <th className="px-4 py-2 text-xs font-medium text-purple-800 bg-purple-50 border-r">Fat %</th>
                          <th className="px-4 py-2 text-xs font-medium text-purple-800 bg-purple-50 border-r">SNF %</th>

                          {/* Analysis */}
                          <th className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50 border-r">Diff (L)</th>
                          <th className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50 border-r">Fat (Kg)</th>
                          <th className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50">SNF (Kg)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {historyModal.data.history.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 border-r">
                              <div className="text-sm font-medium text-gray-900">{new Date(item.date).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-500">{new Date(item.date).toLocaleTimeString()}</div>
                              <div className="text-xs text-gray-400 mt-1">Reg: {item.vehicleReg}</div>
                            </td>

                            {/* Collected */}
                            <td className="px-4 py-3 text-sm text-right font-medium text-green-700 border-r">{(item.collection?.milk || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600 border-r">{(item.collection?.fat || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600 border-r">{(item.collection?.snf || 0).toFixed(2)}</td>

                            {/* Verified */}
                            <td className="px-4 py-3 text-sm text-right font-medium text-purple-700 border-r">{(item.verified?.milk || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600 border-r">{(item.verified?.fat || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600 border-r">{(item.verified?.snf || 0).toFixed(2)}</td>

                            {/* Variance */}
                            <td className={`px-4 py-3 text-sm text-right font-bold border-r ${(item.variance?.milk || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(item.variance?.milk || 0) > 0 ? '+' : ''}{(item.variance?.milk || 0).toFixed(2)}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right font-bold border-r ${(item.variance?.fatKg || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(item.variance?.fatKg || 0) > 0 ? '+' : ''}{(item.variance?.fatKg || 0).toFixed(3)}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right font-bold ${(item.variance?.snfKg || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(item.variance?.snfKg || 0) > 0 ? '+' : ''}{(item.variance?.snfKg || 0).toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p>No history found for this BMC.</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Button variant="secondary" onClick={closeHistory}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <Card title="BMC List">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(bmcs) || bmcs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    No BMCs found. Add your first BMC to get started.
                  </td>
                </tr>
              ) : (
                bmcs.map((bmc) => (
                  <tr key={bmc._id || bmc.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{bmc.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bmc.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bmc.contact}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => viewHistory(bmc)}
                          className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200"
                        >
                          Analysis
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(bmc)}
                          className="text-xs px-2 py-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(bmc._id || bmc.id)}
                          className="text-xs px-2 py-1"
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

    </div>
  );
};

export default BMCManagement;

