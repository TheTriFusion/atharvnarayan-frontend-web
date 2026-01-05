import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input'; // Assuming these exist
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { usersAPI } from '../../utils/api'; // Or direct fetch if api utils are not generic enough yet

const OwnerRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        password: '',
        email: '',
        systemType: 'milkTruck', // Default
        companyName: '',
        companyType: 'sole_proprietorship',
        address: '',
        panCard: '',
        aadhaarCard: '',
        registrationNumber: '',
        gstNumber: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://15.206.212.140:5000/api/auth/register-owner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Card className="text-center p-8">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Registration Successful!</h3>
                        <div className="mt-2 text-sm text-gray-500">
                            <p>Your account has been created and is pending approval.</p>
                            <p>You will be notified once the Super Admin approves your request.</p>
                        </div>
                        <div className="mt-6">
                            <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                Return to Login
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Partner Registration
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Register your company with us
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Personal Info */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Owner Details</h3>
                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                <Input
                                    label="Full Name *"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Phone Number *"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    type="tel"
                                    maxLength="10"
                                />
                                <Input
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    type="email"
                                />
                                <Input
                                    label="Password *"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    type="password"
                                />
                            </div>
                        </div>

                        {/* Company Info */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Company Details</h3>
                            <div className="space-y-4">
                                <Input
                                    label="Company Name *"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Atharv Transports"
                                />

                                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Business Type
                                        </label>
                                        <select
                                            name="companyType"
                                            value={formData.companyType}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        >
                                            <option value="sole_proprietorship">Sole Proprietorship</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="private_limited">Private Limited</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            System Type
                                        </label>
                                        <select
                                            name="systemType"
                                            value={formData.systemType}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        >
                                            <option value="milkTruck">Milk Truck System</option>
                                            <option value="cattleFeed">Retail Shop System (POS/Inventory)</option>
                                        </select>
                                    </div>
                                </div>

                                {formData.systemType === 'cattleFeed' && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Shop Category
                                        </label>
                                        <select
                                            name="businessCategory"
                                            value={formData.businessCategory || 'agro_cattle_feed'}
                                            onChange={handleChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        >
                                            <option value="agro_cattle_feed">Agro / Cattle Feed</option>
                                            <option value="grocery">Grocery / Kirana</option>
                                            <option value="medical">Medical / Pharmacy</option>
                                            <option value="hardware">Hardware / Electronics</option>
                                            <option value="clothing">Clothing / Textile</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                )}

                                <Input
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    textarea
                                />
                            </div>
                        </div>

                        {/* Documents */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Documents (Numbers)</h3>
                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                <Input
                                    label="PAN Card Number"
                                    name="panCard"
                                    value={formData.panCard}
                                    onChange={handleChange}
                                    placeholder="ABCDE1234F"
                                />
                                <Input
                                    label="Aadhaar Card Number"
                                    name="aadhaarCard"
                                    value={formData.aadhaarCard}
                                    onChange={handleChange}
                                    placeholder="12 digit number"
                                />
                                <Input
                                    label="Registration/Shop Act No."
                                    name="registrationNumber"
                                    value={formData.registrationNumber}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="GST Number (Optional)"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full flex justify-center py-3 text-lg"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Register Company'}
                            </Button>
                        </div>

                        <div className="text-center mt-4">
                            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
                                Already have an account? Login here
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default OwnerRegistration;
