import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ArrowRight,
  LogOut,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Calendar,
  CheckCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Gujranwala',
  'Sialkot',
  'Hyderabad',
  'Quetta',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Other City'
];

export default function UserAuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState(currentUser ? 'orders' : 'login'); // 'login' | 'register' | 'orders' | 'profile'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Login form state
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: 'Lahore',
    address: '',
    province: 'Punjab'
  });

  // User's own orders state (auto-populated in profile)
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Fetch orders for current logged-in user automatically from localStorage + API
  const fetchUserOrders = async (user) => {
    if (!user) return;
    try {
      setOrdersLoading(true);

      // 1. Fetch from server API
      let serverOrders = [];
      try {
        const res = await fetch(`/api/users/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          serverOrders = data.orders || [];
        }
      } catch (err) {
        console.warn('API fetch warning:', err);
      }

      // 2. Also read from localStorage to capture freshly placed storefront orders instantly
      let localOrders = [];
      try {
        const stored = localStorage.getItem('limelight_orders');
        if (stored) {
          const all = JSON.parse(stored);
          const cleanUserPhone = (user.phone || '').replace(/[^0-9]/g, '');
          const cleanUserEmail = (user.email || '').trim().toLowerCase();

          localOrders = all.filter((o) => {
            const matchesId = o.userId === user.id;
            const matchesEmail = o.userEmail?.toLowerCase() === cleanUserEmail ||
                                 o.customer?.email?.toLowerCase() === cleanUserEmail;
            const orderPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
            const matchesPhone = cleanUserPhone && orderPhone && (orderPhone.includes(cleanUserPhone) || cleanUserPhone.includes(orderPhone));
            return matchesId || matchesEmail || matchesPhone;
          });
        }
      } catch (err) {
        console.warn('localStorage read warning:', err);
      }

      // Merge and deduplicate by ID, keeping newest first
      const orderMap = new Map();
      serverOrders.forEach(o => orderMap.set(o.id, o));
      localOrders.forEach(o => orderMap.set(o.id, o));

      const combined = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
      );

      setUserOrders(combined);
      // Auto expand the latest order for instant tracking visibility
      if (combined.length > 0 && !expandedOrder) {
        setExpandedOrder(combined[0].id);
      }
    } catch (err) {
      console.warn('Error loading user orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Sync tab & auto-fetch orders whenever modal opens or user logs in
  useEffect(() => {
    if (currentUser) {
      setActiveTab('orders');
      fetchUserOrders(currentUser);
    } else {
      setActiveTab('login');
      setUserOrders([]);
    }
  }, [currentUser, isOpen]);

  // Listen to storage and custom order placed events for real-time reactivity
  useEffect(() => {
    const handleOrderPlaced = () => {
      if (currentUser) {
        fetchUserOrders(currentUser);
      }
    };
    window.addEventListener('limelight_order_placed', handleOrderPlaced);
    window.addEventListener('storage', handleOrderPlaced);

    return () => {
      window.removeEventListener('limelight_order_placed', handleOrderPlaced);
      window.removeEventListener('storage', handleOrderPlaced);
    };
  }, [currentUser]);

  if (!isOpen) return null;

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!loginForm.identifier.trim()) {
      setError('Please enter your email or mobile number');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('limelight_user', JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent('limelight_auth_change', { detail: data.user }));

      setSuccessMsg(`Welcome, ${data.user.name}!`);
      setTimeout(() => {
        setSuccessMsg(null);
        if (onLoginSuccess) onLoginSuccess(data.user);
      }, 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login helper
  const handleQuickLogin = (demoUser) => {
    setLoginForm({ identifier: demoUser.email, password: 'password123' });
    localStorage.setItem('limelight_user', JSON.stringify(demoUser));
    window.dispatchEvent(new CustomEvent('limelight_auth_change', { detail: demoUser }));
    if (onLoginSuccess) onLoginSuccess(demoUser);
  };

  // Handle Registration Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!registerForm.name.trim()) return setError('Full Name is required');
    if (!registerForm.email.trim()) return setError('Email address is required');
    if (!registerForm.password || registerForm.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('limelight_user', JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent('limelight_auth_change', { detail: data.user }));

      setSuccessMsg('Account created successfully! Your order profile is now active.');
      setTimeout(() => {
        setSuccessMsg(null);
        if (onLoginSuccess) onLoginSuccess(data.user);
      }, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('limelight_user');
    window.dispatchEvent(new CustomEvent('limelight_auth_change', { detail: null }));
    if (onLogout) onLogout();
    setActiveTab('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[15px] sm:p-[25px]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-[8px] shadow-2xl overflow-hidden z-10 animate-expand flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-[20px] sm:px-[25px] py-[16px] bg-[#121212] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-[10px]">
            <div className="w-[34px] h-[34px] bg-white text-[#121212] rounded-full flex items-center justify-center font-bold text-[14px]">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'LM'}
            </div>
            <div>
              <h3 className="text-[16px] font-bold tracking-wider uppercase text-white">
                {currentUser ? `Hi, ${currentUser.name}` : 'Customer Portal & Order Tracking'}
              </h3>
              <p className="text-[11px] text-white/70">
                {currentUser
                  ? 'Your orders are tracked automatically below with live courier status'
                  : 'Please sign in or create an account to view and track your orders'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs (Only Sign In / Register if not logged in; My Orders / Profile if logged in) */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-[20px] gap-[8px] shrink-0">
          {currentUser ? (
            <>
              <button
                onClick={() => { setActiveTab('orders'); fetchUserOrders(currentUser); }}
                className={`py-[12px] px-[14px] text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-[6px] ${
                  activeTab === 'orders'
                    ? 'border-[#121212] text-[#121212]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Package size={15} />
                <span>My Orders & Live Tracking ({userOrders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`py-[12px] px-[14px] text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-[6px] ${
                  activeTab === 'profile'
                    ? 'border-[#121212] text-[#121212]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <User size={15} />
                <span>My Profile</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setActiveTab('login'); setError(null); }}
                className={`py-[12px] px-[16px] text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'login'
                    ? 'border-[#121212] text-[#121212]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>

              <button
                onClick={() => { setActiveTab('register'); setError(null); }}
                className={`py-[12px] px-[16px] text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'register'
                    ? 'border-[#121212] text-[#121212]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Create Account
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-[20px] sm:p-[25px]">
          {error && (
            <div className="mb-[15px] p-[10px] bg-red-50 border border-red-200 text-red-700 text-[12px] rounded-[4px] flex items-center gap-[8px]">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-[15px] p-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] rounded-[4px] flex items-center gap-[8px]">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= IF NOT LOGGED IN ================= */}

          {/* SIGN IN TAB */}
          {!currentUser && activeTab === 'login' && (
            <div className="space-y-[20px]">
              <div className="bg-purple-50 p-[12px] rounded-[6px] border border-purple-200 text-purple-900 text-[12px] flex items-start gap-[10px]">
                <ShieldCheck size={18} className="text-purple-600 mt-[1px] shrink-0" />
                <div>
                  <span className="font-bold block">Exclusive Member Order Tracking:</span>
                  <span>Sign in to your account. All your orders and real-time courier tracking will automatically appear right in your profile without entering any order numbers!</span>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-[14px]">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-700 mb-[6px]">
                    Email or Mobile Number <span className="text-[#cf0c1d]">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={loginForm.identifier}
                      onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                      placeholder="e.g. ali.zohaib@example.com or 0300-1234567"
                      className="w-full pl-[36px] pr-[12px] py-[10px] text-[14px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[#121212]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-700 mb-[6px]">
                    Password <span className="text-[#cf0c1d]">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-[36px] pr-[40px] py-[10px] text-[14px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[#121212]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-[12px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="button-primary w-full bg-[#121212] hover:bg-black text-white py-[12px] text-[14px] font-bold rounded-[4px] tracking-wider flex items-center justify-center gap-[8px] transition-all cursor-pointer"
                >
                  {loading ? (
                    <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>SIGN IN & VIEW MY ORDERS</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* Instant Test Accounts */}
              <div className="pt-[15px] border-t border-gray-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-[8px]">
                  One-Click Demo Customers:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[8px]">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin({
                      id: 'usr-1',
                      name: 'Ali Zohaib',
                      email: 'ali.zohaib@example.com',
                      phone: '0300-1234567',
                      city: 'Lahore',
                      address: 'House 12, Main Boulevard, Gulberg III',
                      province: 'Punjab'
                    })}
                    className="p-[10px] text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-[4px] text-[12px] transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-gray-900">Ali Zohaib</div>
                    <div className="text-[11px] text-gray-500">ali.zohaib@example.com (Lahore)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin({
                      id: 'usr-2',
                      name: 'Ayesha Khan',
                      email: 'ayesha.khan@example.com',
                      phone: '0300-8472910',
                      city: 'Lahore',
                      address: 'House 42, Block C, Phase 5, DHA',
                      province: 'Punjab'
                    })}
                    className="p-[10px] text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-[4px] text-[12px] transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-gray-900">Ayesha Khan</div>
                    <div className="text-[11px] text-gray-500">ayesha.khan@example.com (Order #LM-849201)</div>
                  </button>
                </div>
              </div>

              <div className="text-center pt-[5px]">
                <p className="text-[13px] text-gray-600">
                  New to Zimal Collection?{' '}
                  <button
                    onClick={() => setActiveTab('register')}
                    className="font-bold text-[#121212] underline hover:text-[#cf0c1d]"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* CREATE ACCOUNT TAB */}
          {!currentUser && activeTab === 'register' && (
            <div className="space-y-[16px]">
              <div>
                <h4 className="text-[18px] font-bold text-[#121212]">Create Zimal Collection Account</h4>
                <p className="text-[13px] text-gray-500 mt-[2px]">
                  Register once. Whenever you place an order, it will automatically appear in your profile with live courier tracking.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-[12px]">
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-700 mb-[4px]">
                    Full Name <span className="text-[#cf0c1d]">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      placeholder="e.g. Fatima Noor"
                      className="w-full pl-[36px] pr-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[#121212]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-700 mb-[4px]">
                      Email Address <span className="text-[#cf0c1d]">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        placeholder="fatima@example.com"
                        className="w-full pl-[36px] pr-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[#121212]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-700 mb-[4px]">
                      Mobile / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        placeholder="0300 1234567"
                        className="w-full pl-[36px] pr-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[#121212]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-700 mb-[4px]">
                      City
                    </label>
                    <select
                      value={registerForm.city}
                      onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                      className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[4px] bg-white focus:outline-none focus:border-[#121212]"
                    >
                      {PAKISTAN_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-700 mb-[4px]">
                      Password <span className="text-[#cf0c1d]">*</span>
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        placeholder="Min. 6 characters"
                        className="w-full pl-[36px] pr-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[#121212]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-700 mb-[4px]">
                    Delivery Address
                  </label>
                  <textarea
                    rows={2}
                    value={registerForm.address}
                    onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                    placeholder="House / Apartment #, Street, Area"
                    className="w-full px-[12px] py-[8px] text-[13px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[#121212]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="button-primary w-full bg-[#121212] hover:bg-black text-white py-[12px] text-[14px] font-bold rounded-[4px] tracking-wider flex items-center justify-center gap-[8px] cursor-pointer"
                >
                  {loading ? (
                    <span className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>CREATE ACCOUNT & START TRACKING</span>
                  )}
                </button>
              </form>

              <div className="text-center pt-[5px]">
                <p className="text-[13px] text-gray-600">
                  Already registered?{' '}
                  <button
                    onClick={() => setActiveTab('login')}
                    className="font-bold text-[#121212] underline hover:text-[#cf0c1d]"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ================= IF LOGGED IN: AUTOMATIC PROFILE ORDER TRACKING ================= */}

          {/* TAB 1: MY ORDERS & AUTOMATED LIVE TRACKING */}
          {currentUser && activeTab === 'orders' && (
            <div className="space-y-[18px]">
              {/* Profile Bar */}
              <div className="bg-[#f8f9fa] p-[14px] rounded-[6px] border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-[10px]">
                <div className="flex items-center gap-[10px]">
                  <div className="w-[40px] h-[40px] bg-[#121212] text-white rounded-full flex items-center justify-center font-bold text-[15px]">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-[6px]">
                      <span className="font-bold text-[15px] text-gray-900">{currentUser.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-[6px] py-[1px] rounded">
                        Member #{currentUser.id}
                      </span>
                    </div>
                    <span className="text-[12px] text-gray-500">{currentUser.email} • {currentUser.city || 'Pakistan'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-[8px]">
                  <button
                    onClick={() => fetchUserOrders(currentUser)}
                    className="px-[10px] py-[5px] bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-[12px] font-semibold flex items-center gap-[4px] cursor-pointer"
                    title="Reload orders"
                  >
                    <RefreshCw size={13} className={ordersLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {ordersLoading ? (
                <div className="py-[40px] text-center space-y-[10px]">
                  <div className="w-[30px] h-[30px] border-2 border-gray-300 border-t-[#121212] rounded-full animate-spin mx-auto" />
                  <p className="text-[12px] text-gray-500">Checking your live orders...</p>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="py-[40px] text-center space-y-[12px] bg-gray-50 rounded-[6px] p-[20px] border border-gray-200">
                  <Package size={38} className="text-gray-300 mx-auto" />
                  <div>
                    <h5 className="text-[15px] font-bold text-gray-800">No Orders Placed Yet</h5>
                    <p className="text-[12px] text-gray-500 max-w-sm mx-auto mt-[4px]">
                      When you place an order, it will appear here automatically with complete live courier tracking — no need to enter any tracking code!
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="button-primary bg-[#121212] text-white px-[18px] py-[9px] text-[13px] font-bold rounded"
                  >
                    Explore Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-[16px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500">
                      Your Orders ({userOrders.length}) — Click any order to view tracking
                    </span>
                  </div>

                  {userOrders.map((order) => {
                    const status = order.status || 'Pending';
                    const isConfirmed = ['Confirmed', 'Shipped', 'Delivered'].includes(status);
                    const isShipped = ['Shipped', 'Delivered'].includes(status);
                    const isDelivered = status === 'Delivered';
                    const isCancelled = status === 'Cancelled';
                    const isExpanded = expandedOrder === order.id;

                    const statusStyles = {
                      Pending: 'bg-amber-100 text-amber-900 border-amber-200',
                      Confirmed: 'bg-blue-100 text-blue-900 border-blue-200',
                      Shipped: 'bg-purple-100 text-purple-900 border-purple-200',
                      Delivered: 'bg-emerald-100 text-emerald-900 border-emerald-200',
                      Cancelled: 'bg-rose-100 text-rose-900 border-rose-200'
                    };

                    return (
                      <div
                        key={order.id}
                        className={`bg-white border rounded-[8px] overflow-hidden transition-all shadow-sm ${
                          isExpanded ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Order Summary Header (Clickable to Toggle) */}
                        <div
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="p-[16px] cursor-pointer bg-white hover:bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-[10px]"
                        >
                          <div className="space-y-[2px]">
                            <div className="flex items-center gap-[8px]">
                              <span className="text-[16px] font-extrabold text-[#cf0c1d] tracking-wide">
                                #{order.id}
                              </span>
                              <span className={`text-[11px] font-bold px-[8px] py-[2px] rounded-full uppercase tracking-wider border ${
                                statusStyles[status] || statusStyles.Pending
                              }`}>
                                {status}
                              </span>
                            </div>
                            <div className="flex items-center gap-[8px] text-[12px] text-gray-500">
                              <span className="flex items-center gap-[4px]">
                                <Calendar size={12} />
                                {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span>•</span>
                              <span>{order.items?.length || 1} Item(s)</span>
                              <span>•</span>
                              <span className="text-gray-700">{order.paymentMethod || 'Cash on Delivery'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-[15px]">
                            <div className="text-right">
                              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                                Total Amount
                              </span>
                              <span className="text-[16px] font-extrabold text-gray-900">
                                Rs. {Number(order.total || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-gray-400">
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Order & Live Tracking Details */}
                        {isExpanded && (
                          <div className="p-[16px] bg-[#fafafa] border-t border-gray-200 space-y-[16px]">
                            {/* LIVE COURIER TRACKING JOURNEY BOX */}
                            <div className="bg-white p-[16px] rounded-[6px] border border-gray-200 shadow-xs space-y-[14px]">
                              <div className="flex items-center justify-between pb-[10px] border-b border-gray-200">
                                <div className="flex items-center gap-[8px]">
                                  <Truck size={17} className="text-[#cf0c1d]" />
                                  <span className="text-[13px] font-bold uppercase tracking-wider text-gray-900">
                                    Live Courier Tracking & Dispatch Journey
                                  </span>
                                </div>
                                {isShipped && (
                                  <span className="text-[11px] font-mono font-bold bg-purple-50 text-purple-700 px-[7px] py-[2px] rounded border border-purple-200">
                                    Trax Courier: TRX-{order.id}-PK
                                  </span>
                                )}
                              </div>

                              {/* 5-Step Visual Timeline */}
                              <div className="relative pl-[22px] space-y-[14px] before:absolute before:left-[8px] before:top-[6px] before:bottom-[6px] before:w-[2px] before:bg-gray-200">
                                {/* Step 1: Placed */}
                                <div className="relative">
                                  <span className="absolute -left-[22px] top-[2px] w-[18px] h-[18px] rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                    <CheckCircle2 size={12} />
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-[6px]">
                                      <span className="text-[13px] font-bold text-gray-900">Order Placed & Received</span>
                                      <span className="text-[11px] text-gray-400">
                                        ({new Date(order.createdAt || order.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500">Order confirmed in Zimal Collection (www.zimalcollection.com) system via Direct Checkout.</p>
                                  </div>
                                </div>

                                {/* Step 2: Quality Inspection */}
                                <div className="relative">
                                  <span className={`absolute -left-[22px] top-[2px] w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                                    isConfirmed && !isCancelled
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : status === 'Pending' && !isCancelled
                                      ? 'bg-amber-500 border-amber-500 text-white animate-pulse'
                                      : 'bg-white border-gray-300'
                                  }`}>
                                    {isConfirmed && !isCancelled && <CheckCircle2 size={12} />}
                                  </span>
                                  <div>
                                    <span className={`text-[13px] font-bold ${
                                      isConfirmed && !isCancelled
                                        ? 'text-gray-900'
                                        : status === 'Pending'
                                        ? 'text-amber-800 font-extrabold'
                                        : 'text-gray-400'
                                    }`}>
                                      Confirmed & Quality Inspection
                                    </span>
                                    <p className="text-[11px] text-gray-500">
                                      {isConfirmed
                                        ? 'Fabric and garments verified by warehouse inspection team.'
                                        : 'Awaiting warehouse confirmation.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Step 3: Courier Handover */}
                                <div className="relative">
                                  <span className={`absolute -left-[22px] top-[2px] w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                                    isShipped && !isCancelled
                                      ? 'bg-purple-600 border-purple-600 text-white'
                                      : status === 'Confirmed' && !isCancelled
                                      ? 'bg-purple-500 border-purple-500 text-white animate-pulse'
                                      : 'bg-white border-gray-300'
                                  }`}>
                                    {isShipped && !isCancelled && <CheckCircle2 size={12} />}
                                  </span>
                                  <div>
                                    <span className={`text-[13px] font-bold ${
                                      isShipped && !isCancelled
                                        ? 'text-gray-900'
                                        : status === 'Confirmed'
                                        ? 'text-purple-800 font-extrabold'
                                        : 'text-gray-400'
                                    }`}>
                                      Dispatched via Trax Express Courier
                                    </span>
                                    <p className="text-[11px] text-gray-500">
                                      {isShipped
                                        ? `Handed over to Trax Courier. Waybill tracking: TRX-${order.id}-PK`
                                        : 'Courier pickup scheduled.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Step 4: Out for Delivery */}
                                <div className="relative">
                                  <span className={`absolute -left-[22px] top-[2px] w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                                    isDelivered && !isCancelled
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : status === 'Shipped' && !isCancelled
                                      ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                                      : 'bg-white border-gray-300'
                                  }`}>
                                    {isDelivered && !isCancelled && <CheckCircle2 size={12} />}
                                  </span>
                                  <div>
                                    <span className={`text-[13px] font-bold ${
                                      isDelivered
                                        ? 'text-gray-900'
                                        : status === 'Shipped'
                                        ? 'text-blue-800 font-extrabold'
                                        : 'text-gray-400'
                                    }`}>
                                      Out for Doorstep Delivery
                                    </span>
                                    <p className="text-[11px] text-gray-500">
                                      {status === 'Shipped'
                                        ? 'Courier rider is out for delivery to your doorstep.'
                                        : 'Pending arrival at your destination city hub.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Step 5: Delivered */}
                                <div className="relative">
                                  <span className={`absolute -left-[22px] top-[2px] w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                                    isDelivered
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : isCancelled
                                      ? 'bg-rose-600 border-rose-600 text-white'
                                      : 'bg-white border-gray-300'
                                  }`}>
                                    {isDelivered && <CheckCheck size={12} />}
                                    {isCancelled && <X size={12} />}
                                  </span>
                                  <div>
                                    <span className={`text-[13px] font-bold ${
                                      isDelivered
                                        ? 'text-emerald-700 font-extrabold'
                                        : isCancelled
                                        ? 'text-rose-700 font-extrabold'
                                        : 'text-gray-400'
                                    }`}>
                                      {isCancelled ? 'Order Cancelled' : 'Delivered & Cash Collected'}
                                    </span>
                                    <p className="text-[11px] text-gray-500">
                                      {isDelivered
                                        ? 'Parcel delivered successfully and Cash on Delivery collected.'
                                        : isCancelled
                                        ? 'This order was cancelled by administration.'
                                        : 'Cash on Delivery payment due upon receipt.'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Destination Address & Purchased Items */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] text-[12px]">
                              {/* Shipping address */}
                              <div className="bg-white p-[12px] rounded-[6px] border border-gray-200 space-y-[4px]">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                                  Delivery Address
                                </span>
                                <p className="font-bold text-gray-800">{order.customer?.name}</p>
                                <p className="text-gray-600">{order.customer?.address}</p>
                                <p className="text-gray-800 font-medium">{order.customer?.city}, {order.customer?.province || 'Pakistan'}</p>
                                <p className="text-gray-500 font-mono text-[11px]">Phone: {order.customer?.phone}</p>
                              </div>

                              {/* Purchased items list */}
                              <div className="bg-white p-[12px] rounded-[6px] border border-gray-200 space-y-[8px]">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                                  Purchased Articles
                                </span>
                                <div className="space-y-[6px]">
                                  {(order.items || []).map((it, iIdx) => (
                                    <div key={iIdx} className="flex items-center gap-[8px]">
                                      <img
                                        src={it.image}
                                        alt={it.title}
                                        className="w-[30px] h-[38px] object-cover rounded border border-gray-200 shrink-0"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <span className="font-semibold text-gray-900 block truncate text-[11px]">{it.title}</span>
                                        <span className="text-[10px] text-gray-500">
                                          Size: {it.selectedSize || 'Std'} • Qty: {it.quantity}
                                        </span>
                                      </div>
                                      <span className="font-bold text-gray-800 text-[11px]">
                                        Rs. {(it.price * it.quantity).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE DETAILS (When Logged In) */}
          {currentUser && activeTab === 'profile' && (
            <div className="space-y-[20px]">
              <div className="flex items-center gap-[15px] p-[16px] bg-gray-50 rounded-[6px] border border-gray-200">
                <div className="w-[50px] h-[50px] bg-[#121212] text-white rounded-full flex items-center justify-center font-bold text-[18px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-gray-900">{currentUser.name}</h4>
                  <p className="text-[12px] text-gray-500">{currentUser.email}</p>
                  <span className="inline-block mt-[4px] text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-[6px] py-[1px] rounded">
                    Verified Customer #{currentUser.id}
                  </span>
                </div>
              </div>

              <div className="space-y-[12px] text-[13px]">
                <div className="p-[12px] border border-gray-200 rounded-[4px] space-y-[4px]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Contact Information
                  </span>
                  <p><strong>Mobile:</strong> {currentUser.phone || 'Not specified'}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                </div>

                <div className="p-[12px] border border-gray-200 rounded-[4px] space-y-[4px]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Saved Delivery Address
                  </span>
                  <p>{currentUser.address || 'No default address saved.'}</p>
                  <p><strong>City:</strong> {currentUser.city || 'Lahore'}, {currentUser.province || 'Punjab'}</p>
                </div>
              </div>

              <div className="pt-[10px] border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full py-[10px] border border-red-300 text-red-600 hover:bg-red-50 rounded-[4px] text-[13px] font-bold flex items-center justify-center gap-[6px] transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>SIGN OUT FROM ACCOUNT</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
