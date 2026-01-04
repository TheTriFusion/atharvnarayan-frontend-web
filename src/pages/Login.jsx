import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const Login = () => {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'superadmin'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Super Admin credentials (hardcoded)
  const SUPER_ADMIN_CREDENTIALS = {
    phoneNumber: '9999999999',
    password: 'superadmin123',
    role: 'superadmin',
    name: 'Super Admin',
    id: 'superadmin1',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!phoneNumber || !password) {
      setError('Please enter both phone number and password');
      setLoading(false);
      return;
    }

    try {
      let result;

      // Use appropriate login method based on active tab
      if (activeTab === 'superadmin') {
        result = await loginSuperAdmin(phoneNumber, password);
      } else {
        result = await login(phoneNumber, password);
      }

      if (result.success) {
        // Navigate based on role
        const userRole = result.user.role;
        if (userRole === 'superadmin') {
          navigate('/superadmin/dashboard');
        } else if (userRole === 'cattleFeedOwner') {
          navigate('/cattle-feed/owner/dashboard');
        } else if (userRole === 'cattleFeedSeller') {
          navigate('/cattle-feed/seller/sales');
        } else if (userRole === 'milkTruckOwner') {
          navigate('/milk-truck/owner/dashboard');
        } else if (userRole === 'milkTruckDriver') {
          navigate('/milk-truck/driver/dashboard');
        } else if (userRole === 'cattleFeedTruckOwner') {
          navigate('/cattle-feed-truck/owner/dashboard');
        } else if (userRole === 'cattleFeedTruckDriver') {
          navigate('/cattle-feed-truck/driver/dashboard');
        } else {
          navigate('/login');
        }
      } else {
        setError(result.message || 'Invalid phone number or password');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Language Switcher */}
        <div className="flex justify-center">
          <LanguageSwitcher />
        </div>
        {/* Demo Credentials Card */}
        <Card className="bg-blue-50 border-2 border-blue-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Demo Credentials</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Super Admin */}
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">🔑 Super Admin</h3>
              <div className="space-y-1 text-xs">
                <p className="text-gray-700">
                  <span className="font-medium">Phone:</span>{' '}
                  <span className="bg-gray-200 px-2 py-0.5 rounded font-mono">{SUPER_ADMIN_CREDENTIALS.phoneNumber}</span>
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Password:</span>{' '}
                  <span className="bg-gray-200 px-2 py-0.5 rounded font-mono">{SUPER_ADMIN_CREDENTIALS.password}</span>
                </p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">ℹ️ Note</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <p>• Two separate login systems</p>
                <p>• Super Admin: Use "Super Admin Login" tab</p>
                <p>• Owners/Drivers/Sellers: Use "User Login" tab</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Default Users (after seeding):</span>
            </p>
            <ul className="text-xs text-gray-600 mt-1 ml-4 list-disc">
              <li>Cattle Feed Admin: Phone <span className="font-mono">9876543200</span>, Password <span className="font-mono">cfadmin123</span></li>
              <li>Cattle Feed Seller: Phone <span className="font-mono">9876543210</span>, Password <span className="font-mono">seller123</span></li>
              <li>Milk Truck Owner: Phone <span className="font-mono">9876543210</span>, Password <span className="font-mono">owner123</span></li>
              <li>Milk Truck Driver: Phone <span className="font-mono">1234567890</span>, Password <span className="font-mono">driver1</span></li>
            </ul>
          </div>
        </Card>

        {/* Login Card with Tabs */}
        <Card className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Atharvnarayana</h1>
          <h2 className="text-xl font-semibold text-center mb-6 text-gray-600">{t('login.title')}</h2>

          {/* Tab Buttons */}
          <div className="flex mb-6 border-b border-gray-300">
            <button
              type="button"
              onClick={() => {
                setActiveTab('user');
                setError('');
                setPhoneNumber('');
                setPassword('');
              }}
              className={`flex-1 py-3 px-4 font-semibold transition-colors ${activeTab === 'user'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {t('login.userLogin')}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('superadmin');
                setError('');
                setPhoneNumber('');
                setPassword('');
              }}
              className={`flex-1 py-3 px-4 font-semibold transition-colors ${activeTab === 'superadmin'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {t('login.superAdminLogin')}
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                {activeTab === 'superadmin'
                  ? '🔑 Login as Super Admin to manage all systems'
                  : '👤 Login as Owner, Driver, or Seller'}
              </p>
            </div>

            <Input
              label={t('forms.phone')}
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setError('');
              }}
              required
              placeholder={t('login.enterPhone')}
              disabled={loading}
            />

            <Input
              label={t('forms.password')}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              required
              placeholder={t('login.enterPassword')}
              disabled={loading}
            />

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className={`w-full ${activeTab === 'superadmin' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
              disabled={loading}
            >
              {loading ? t('login.loggingIn') : `${t('login.loginAs')} ${activeTab === 'superadmin' ? t('login.superAdminLogin') : t('login.userLogin')}`}
            </Button>

            {activeTab === 'user' && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  New Partner?{' '}
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Register your company here
                  </Link>
                </p>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
