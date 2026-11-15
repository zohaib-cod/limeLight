import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  ArrowUpRight,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Package
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerOrdersLoading, setCustomerOrdersLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'password123',
    city: 'Lahore',
    address: '',
    province: 'Punjab'
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.warn('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // View Customer Orders details
  const handleViewCustomerOrders = async (user) => {
    setSelectedCustomer(user);
    setCustomerOrders([]);
    setCustomerOrdersLoading(true);

    try {
      const res = await fetch(`/api/users/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerOrders(data.orders || []);
      }
    } catch (err) {
      console.warn('Error loading customer orders:', err);
    } finally {
      setCustomerOrdersLoading(false);
    }
  };

  // Delete Customer
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete customer account "${user.name}" (${user.email})?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  // Add Customer Submit
  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add customer');

      setShowAddModal(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        password: 'password123',
        city: 'Lahore',
        address: '',
        province: 'Punjab'
      });
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const withOrders = users.filter(u => (u.orderCount || 0) > 0).length;
    const totalSpend = users.reduce((sum, u) => sum + (Number(u.totalSpent) || 0), 0);
    return { total, active, withOrders, totalSpend };
  }, [users]);

  // Filtered
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(q) ||
      (u.city || '').toLowerCase().includes(q) ||
      (u.id || '').toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <div className="space-y-[25px] font-assistant">
      {/* Top Header */}
      <div className="bg-white p-[25px] rounded-[8px] border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-[20px]">
        <div>
          <div className="flex items-center gap-[8px] text-[12px] font-bold text-purple-700 uppercase tracking-wider mb-[4px]">
            <Users size={15} />
            <span>Customer Accounts & Authentication Directory</span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#121212] tracking-tight">
            Registered Customers & Shopper Profiles
          </h1>
          <p className="text-[13px] text-gray-500 mt-[2px]">
            View all customers who created accounts or signed in to track their orders. Orders placed by registered members are tagged automatically.
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-[14px] py-[9px] bg-[#cf0c1d] hover:bg-[#b00a18] text-white rounded-[4px] text-[13px] font-semibold flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>+ Add Customer</span>
          </button>

          <button
            onClick={loadUsers}
            className="px-[14px] py-[9px] bg-[#121212] hover:bg-black text-white rounded-[4px] text-[13px] font-semibold flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[15px]">
        <div className="bg-white p-[18px] rounded-[8px] border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Customers
          </span>
          <div className="flex items-baseline gap-[8px] mt-[4px]">
            <span className="text-[26px] font-extrabold text-[#121212]">{stats.total}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">({stats.active} Active)</span>
          </div>
          <span className="text-[11px] text-gray-500 block mt-[2px]">Registered user accounts</span>
        </div>

        <div className="bg-white p-[18px] rounded-[8px] border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block flex items-center gap-[4px]">
            <ShoppingBag size={12} />
            <span>Purchased Customers</span>
          </span>
          <div className="flex items-baseline gap-[8px] mt-[4px]">
            <span className="text-[26px] font-extrabold text-purple-900">{stats.withOrders}</span>
            <span className="text-[11px] text-gray-500">
              ({stats.total > 0 ? Math.round((stats.withOrders / stats.total) * 100) : 0}% Conversion)
            </span>
          </div>
          <span className="text-[11px] text-purple-600 block mt-[2px]">Placed at least 1 order</span>
        </div>

        <div className="bg-white p-[18px] rounded-[8px] border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Customer Lifetime Spend
          </span>
          <div className="flex items-baseline gap-[6px] mt-[4px]">
            <span className="text-[22px] font-extrabold text-[#cf0c1d]">
              Rs. {stats.totalSpend.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-gray-500 block mt-[2px]">Total registered orders value</span>
        </div>

        <div className="bg-white p-[18px] rounded-[8px] border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-[4px]">
            <ShieldCheck size={12} />
            <span>Auth & Security</span>
          </span>
          <div className="flex items-baseline gap-[6px] mt-[4px]">
            <span className="text-[18px] font-bold text-emerald-800">256-bit Encrypted</span>
          </div>
          <span className="text-[11px] text-gray-500 block mt-[2px]">Local & API sync enabled</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-[16px] rounded-[8px] border border-gray-200 shadow-sm flex items-center justify-between gap-[15px]">
        <div className="relative w-full md:w-[360px]">
          <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, phone, city..."
            className="w-full pl-[36px] pr-[12px] py-[8px] text-[13px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[#121212]"
          />
        </div>
        <span className="text-[12px] text-gray-500">
          Showing <strong>{filteredUsers.length}</strong> of {users.length} customer(s)
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[8px] border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-[60px] text-center space-y-[10px]">
            <div className="w-[32px] h-[32px] border-2 border-gray-300 border-t-[#121212] rounded-full animate-spin mx-auto" />
            <p className="text-[13px] text-gray-500">Loading customers directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-[60px] text-center space-y-[12px]">
            <Users size={32} className="text-gray-300 mx-auto" />
            <h3 className="text-[15px] font-bold text-gray-800">No Customers Found</h3>
            <p className="text-[12px] text-gray-500">
              {searchQuery ? 'No customer matched your search.' : 'No registered customers exist yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-[14px] px-[16px]">Customer Profile</th>
                  <th className="py-[14px] px-[16px]">Contact & Mobile</th>
                  <th className="py-[14px] px-[16px]">Address & City</th>
                  <th className="py-[14px] px-[16px]">Orders Placed</th>
                  <th className="py-[14px] px-[16px]">Total Spent (PKR)</th>
                  <th className="py-[14px] px-[16px]">Status</th>
                  <th className="py-[14px] px-[16px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const cleanPhone = (user.phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Customer Name & ID */}
                      <td className="py-[14px] px-[16px] align-top">
                        <div className="flex items-center gap-[10px]">
                          <div className="w-[36px] h-[36px] rounded-full bg-[#121212] text-white flex items-center justify-center font-bold text-[13px] shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{user.name}</span>
                            <span className="text-[11px] font-mono text-gray-400">#{user.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-[14px] px-[16px] align-top">
                        <div className="space-y-[2px]">
                          <span className="text-[12px] text-gray-800 block">{user.email}</span>
                          <div className="flex items-center gap-[6px]">
                            <span className="text-[12px] font-mono text-gray-600">{user.phone || 'No phone'}</span>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/92${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-[4px] py-[1px] rounded flex items-center gap-[2px]"
                              >
                                <span>WA</span>
                                <ArrowUpRight size={10} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* City & Address */}
                      <td className="py-[14px] px-[16px] align-top max-w-[200px]">
                        <div className="space-y-[2px]">
                          <span className="font-bold text-gray-800 block">{user.city || 'Lahore'}</span>
                          <span className="text-[11px] text-gray-500 line-clamp-1">
                            {user.address || 'No saved street address'}
                          </span>
                        </div>
                      </td>

                      {/* Orders Count */}
                      <td className="py-[14px] px-[16px] align-top">
                        <div>
                          <span className={`inline-block px-[8px] py-[2px] rounded text-[11px] font-bold ${
                            (user.orderCount || 0) > 0
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {user.orderCount || 0} Order(s)
                          </span>
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="py-[14px] px-[16px] align-top font-bold text-gray-900">
                        Rs. {Number(user.totalSpent || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-[14px] px-[16px] align-top">
                        <span className="inline-flex items-center gap-[4px] text-[11px] font-bold text-emerald-700 bg-emerald-50 px-[6px] py-[2px] rounded">
                          <CheckCircle2 size={12} />
                          <span>{user.status || 'Active'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-[14px] px-[16px] align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-[6px]">
                          {/* View Orders */}
                          <button
                            onClick={() => handleViewCustomerOrders(user)}
                            className="p-[6px] text-gray-600 hover:text-[#121212] bg-gray-100 hover:bg-gray-200 rounded-[4px] transition-colors cursor-pointer"
                            title="View Orders Placed by Customer"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-[6px] text-red-600 hover:text-white hover:bg-red-600 bg-red-50 rounded-[4px] transition-colors cursor-pointer"
                            title="Delete Customer Profile"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW CUSTOMER ORDERS MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[15px] sm:p-[25px]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedCustomer(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-[8px] shadow-2xl overflow-hidden z-10 animate-expand flex flex-col max-h-[88vh]">
            <div className="px-[20px] py-[15px] bg-[#121212] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-[8px]">
                <ShoppingBag size={17} />
                <h3 className="text-[15px] font-bold uppercase tracking-wider">
                  Order History: {selectedCustomer.name} (#{selectedCustomer.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-[28px] h-[28px] rounded-full hover:bg-white/20 flex items-center justify-center text-white"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="p-[20px] overflow-y-auto space-y-[15px]">
              {customerOrdersLoading ? (
                <div className="py-[30px] text-center space-y-[8px]">
                  <div className="w-[26px] h-[26px] border-2 border-gray-300 border-t-[#121212] rounded-full animate-spin mx-auto" />
                  <p className="text-[12px] text-gray-500">Loading customer orders...</p>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="py-[40px] text-center space-y-[8px] bg-gray-50 rounded">
                  <Package size={30} className="text-gray-300 mx-auto" />
                  <p className="text-[13px] text-gray-600 font-semibold">
                    No orders have been recorded under this customer yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-[12px]">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="border border-gray-200 rounded-[6px] p-[14px] bg-[#f8f9fa] space-y-[8px]">
                      <div className="flex justify-between items-center pb-[6px] border-b border-gray-200">
                        <div>
                          <span className="font-extrabold text-[13px] text-[#cf0c1d]">
                            #{ord.id}
                          </span>
                          <span className="text-[11px] text-gray-500 ml-[8px]">
                            {new Date(ord.createdAt || ord.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-[8px]">
                          <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-[6px] py-[1px] rounded uppercase">
                            {ord.status}
                          </span>
                          <span className="text-[13px] font-black text-gray-900">
                            Rs. {Number(ord.total).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-[4px]">
                        {(ord.items || []).map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[12px] text-gray-700">
                            <span className="truncate max-w-[320px]">
                              {it.quantity}x {it.title} ({it.selectedSize || 'Std'})
                            </span>
                            <span className="font-semibold">Rs. {(it.price * it.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[15px]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-[8px] shadow-2xl overflow-hidden z-10 animate-expand p-[25px] space-y-[15px]">
            <div className="flex justify-between items-center pb-[10px] border-b border-gray-200">
              <h3 className="text-[16px] font-bold text-gray-900">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-[12px]">
              <div>
                <label className="block text-[12px] font-bold uppercase text-gray-700 mb-[4px]">Full Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Zainab Malik"
                  className="w-full px-[12px] py-[8px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <label className="block text-[12px] font-bold uppercase text-gray-700 mb-[4px]">Email Address *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="zainab@example.com"
                    className="w-full px-[12px] py-[8px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold uppercase text-gray-700 mb-[4px]">Mobile / WhatsApp</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="0300 1234567"
                    className="w-full px-[12px] py-[8px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <label className="block text-[12px] font-bold uppercase text-gray-700 mb-[4px]">City</label>
                  <input
                    type="text"
                    value={newUser.city}
                    onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                    className="w-full px-[12px] py-[8px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold uppercase text-gray-700 mb-[4px]">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-[12px] py-[8px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase text-gray-700 mb-[4px]">Address</label>
                <textarea
                  rows={2}
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  placeholder="Street / Area"
                  className="w-full px-[12px] py-[8px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div className="flex justify-end gap-[8px] pt-[8px]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-[14px] py-[8px] text-[12px] font-bold border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-[16px] py-[8px] text-[12px] font-bold bg-[#121212] text-white rounded hover:bg-black"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

