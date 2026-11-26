import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  CheckCheck,
  XCircle,
  ExternalLink,
  Printer,
  Trash2,
  Phone,
  MapPin,
  User,
  Eye,
  RefreshCw,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Package
} from 'lucide-react';

const STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock
  },
  Confirmed: {
    label: 'Confirmed',
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    icon: CheckCircle2
  },
  Shipped: {
    label: 'Shipped',
    bg: 'bg-purple-50 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
    icon: Truck
  },
  Delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCheck
  },
  Cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
    icon: XCircle
  }
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  // Sync and load orders from both localStorage and backend API
  const loadOrders = async () => {
    try {
      setLoading(true);

      // 1. Read from localStorage (primary requirement)
      let localList = [];
      try {
        const stored = localStorage.getItem('limelight_orders');
        if (stored) {
          localList = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Could not read orders from localStorage:', e);
      }

      // 2. Fetch from backend API
      let serverList = [];
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          serverList = await res.json();
        }
      } catch (e) {
        console.warn('Could not fetch orders from backend API:', e);
      }

      // 3. Merge both sources (deduplicate by id, prefer local edits if newer)
      const mergedMap = new Map();

      // Put server orders first
      serverList.forEach((order) => {
        if (order && order.id) mergedMap.set(order.id, order);
      });

      // Overlay local storage orders
      localList.forEach((order) => {
        if (order && order.id) {
          const existing = mergedMap.get(order.id);
          if (!existing) {
            mergedMap.set(order.id, order);
          } else {
            // Keep the one with latest status or timestamp
            mergedMap.set(order.id, { ...existing, ...order });
          }
        }
      });

      const combined = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
      );

      setOrders(combined);

      // Keep localStorage in sync with combined
      try {
        localStorage.setItem('limelight_orders', JSON.stringify(combined));
      } catch (err) {
        /* ignore */
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    // Listen for storage events (orders placed from storefront in same or other tab)
    const handleStorageChange = () => {
      loadOrders();
    };
    const handleOrderPlaced = (e) => {
      if (e.detail) {
        setOrders(prev => [e.detail, ...prev.filter(o => o.id !== e.detail.id)]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('limelight_order_placed', handleOrderPlaced);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('limelight_order_placed', handleOrderPlaced);
    };
  }, []);

  // Update Status Handler
  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusUpdating(orderId);
    try {
      // 1. Update in local state
      const updatedList = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updatedList);

      // 2. Update localStorage
      localStorage.setItem('limelight_orders', JSON.stringify(updatedList));

      // 3. Update backend API
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setStatusUpdating(null);
    }
  };

  // Delete Order Handler
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}?`)) return;

    try {
      // 1. Remove from state
      const updatedList = orders.filter(o => o.id !== orderId);
      setOrders(updatedList);

      // 2. Remove from localStorage
      localStorage.setItem('limelight_orders', JSON.stringify(updatedList));

      // 3. Delete from backend API
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  // Seed sample test order (picks live product from catalog API)
  const handleAddSampleOrder = async () => {
    const sampleId = `LM-${Math.floor(100000 + Math.random() * 900000)}`;
    let firstProduct = null;
    try {
      const pRes = await fetch('/api/products');
      if (pRes.ok) {
        const list = await pRes.json();
        if (Array.isArray(list) && list.length > 0) firstProduct = list[0];
      }
    } catch (e) {}
    if (!firstProduct) {
      alert('Please add at least one product first to create a test order.');
      return;
    }
    const unitPrice = firstProduct.price || 0;
    const sample = {
      id: sampleId,
      createdAt: new Date().toISOString(),
      customer: {
        name: 'Test Customer',
        phone: '',
        email: 'customer@example.com',
        address: '',
        city: '',
        province: '',
        notes: ''
      },
      items: [
        {
          id: firstProduct.id,
          title: firstProduct.title,
          category: firstProduct.category,
          price: unitPrice,
          quantity: 1,
          selectedSize: firstProduct.sizes?.[0] || 'Standard',
          image: firstProduct.image || ''
        }
      ],
      subtotal: unitPrice,
      shipping: 0,
      total: unitPrice,
      paymentMethod: 'Cash on Delivery',
      status: 'Pending',
      source: 'Direct Order (Demo)'
    };

    const next = [sample, ...orders];
    setOrders(next);
    localStorage.setItem('limelight_orders', JSON.stringify(next));

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sample)
      });
    } catch (e) {
      /* ignore */
    }
  };

  // Compute metrics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'Pending').length;
    const confirmed = orders.filter(o => o.status === 'Confirmed').length;
    const shipped = orders.filter(o => o.status === 'Shipped').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const cancelled = orders.filter(o => o.status === 'Cancelled').length;
    const revenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return { total, pending, confirmed, shipped, delivered, cancelled, revenue };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Status filter
      if (statusFilter !== 'ALL' && o.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (o.id || '').toLowerCase().includes(q);
        const matchesName = (o.customer?.name || '').toLowerCase().includes(q);
        const matchesPhone = (o.customer?.phone || '').toLowerCase().includes(q);
        const matchesCity = (o.customer?.city || '').toLowerCase().includes(q);
        const matchesItem = (o.items || []).some(it => (it.title || '').toLowerCase().includes(q));
        return matchesId || matchesName || matchesPhone || matchesCity || matchesItem;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="space-y-[25px] font-assistant">
      {/* Top Header & Quick Actions */}
      <div className="bg-white p-[25px] rounded-[8px] border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-[20px]">
        <div>
          <div className="flex items-center gap-[8px] text-[12px] font-bold text-[#cf0c1d] uppercase tracking-wider mb-[4px]">
            <ShoppingBag size={15} />
            <span>Storefront Direct Orders & LocalStorage Hub</span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#121212] tracking-tight">
            Customer Orders Management
          </h1>
          <p className="text-[13px] text-gray-500 mt-[2px]">
            All orders placed via Storefront "Direct Order" & Cart Checkout are synchronized here via <strong>localStorage</strong> and the backend API.
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            onClick={handleAddSampleOrder}
            className="px-[14px] py-[9px] bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-[4px] text-[13px] font-semibold flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
            title="Create a mock test order to verify"
          >
            <Sparkles size={15} className="text-amber-500" />
            <span>+ Add Test Order</span>
          </button>

          <button
            onClick={loadOrders}
            className="px-[14px] py-[9px] bg-[#121212] hover:bg-black text-white rounded-[4px] text-[13px] font-semibold flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
            title="Reload from localStorage and backend"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Sync Orders</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-[15px]">
        {/* Card 1: Total Orders */}
        <div className="bg-white p-[18px] rounded-[8px] border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Orders
          </span>
          <div className="flex items-baseline gap-[8px] mt-[4px]">
            <span className="text-[26px] font-extrabold text-[#121212]">{stats.total}</span>
          </div>
          <span className="text-[11px] text-gray-500 block mt-[2px]">Stored in localStorage</span>
        </div>

        {/* Card 2: Pending Orders */}
        <div className="bg-white p-[18px] rounded-[8px] border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block flex items-center gap-[5px]">
            <Clock size={12} />
            <span>Pending Action</span>
          </span>
          <div className="flex items-baseline gap-[8px] mt-[4px]">
            <span className="text-[26px] font-extrabold text-amber-900">{stats.pending}</span>
            {stats.pending > 0 && (
              <span className="text-[11px] bg-amber-500 text-white font-bold px-[6px] py-[1px] rounded-full animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <span className="text-[11px] text-amber-600 block mt-[2px]">Awaiting verification</span>
        </div>

        {/* Card 3: Shipped / In Transit */}
        <div className="bg-white p-[18px] rounded-[8px] border border-purple-200 bg-purple-50/20 shadow-sm">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block flex items-center gap-[5px]">
            <Truck size={12} />
            <span>Shipped / Dispatch</span>
          </span>
          <div className="flex items-baseline gap-[8px] mt-[4px]">
            <span className="text-[26px] font-extrabold text-purple-900">{stats.shipped}</span>
            <span className="text-[11px] text-gray-500">({stats.confirmed} Confirmed)</span>
          </div>
          <span className="text-[11px] text-purple-600 block mt-[2px]">En route with courier</span>
        </div>

        {/* Card 4: Delivered */}
        <div className="bg-white p-[18px] rounded-[8px] border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center gap-[5px]">
            <CheckCheck size={12} />
            <span>Delivered</span>
          </span>
          <div className="flex items-baseline gap-[8px] mt-[4px]">
            <span className="text-[26px] font-extrabold text-emerald-900">{stats.delivered}</span>
          </div>
          <span className="text-[11px] text-emerald-600 block mt-[2px]">Completed successfully</span>
        </div>

        {/* Card 5: Total Revenue */}
        <div className="bg-white p-[18px] rounded-[8px] border border-gray-200 shadow-sm col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Revenue
          </span>
          <div className="flex items-baseline gap-[6px] mt-[4px]">
            <span className="text-[22px] font-extrabold text-[#cf0c1d]">
              Rs. {stats.revenue.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-gray-500 block mt-[2px]">Excl. cancelled</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-[16px] rounded-[8px] border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-[15px]">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-[6px] overflow-x-auto pb-[4px] md:pb-0 scrollbar-none">
          {['ALL', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => {
            const count = st === 'ALL' ? orders.length : orders.filter(o => o.status === st).length;
            const active = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-[12px] py-[7px] text-[12px] font-bold rounded-[4px] tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-[6px] ${
                  active
                    ? 'bg-[#121212] text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{st.toUpperCase()}</span>
                <span className={`px-[6px] py-[1px] text-[10px] rounded-full ${
                  active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-[320px]">
          <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, name, phone, city..."
            className="w-full pl-[36px] pr-[12px] py-[8px] text-[13px] border border-gray-300 rounded-[4px] focus:outline-none focus:border-[#121212]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-[10px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XCircle size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-[8px] border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-[60px] text-center space-y-[12px]">
            <div className="w-[36px] h-[36px] border-3 border-gray-300 border-t-[#121212] rounded-full animate-spin mx-auto" />
            <p className="text-[13px] text-gray-500">Loading orders from localStorage & API...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-[70px] text-center space-y-[14px]">
            <div className="w-[56px] h-[56px] bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-gray-800">No Orders Found</h3>
              <p className="text-[13px] text-gray-500 max-w-sm mx-auto mt-[4px]">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No orders match your current filter or search criteria.'
                  : 'No customer orders have been placed yet. Test by placing a direct order from the Storefront!'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-[10px] pt-[8px]">
              {(searchQuery || statusFilter !== 'ALL') && (
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
                  className="px-[14px] py-[8px] text-[12px] font-bold text-[#121212] border border-gray-300 rounded hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={handleAddSampleOrder}
                className="px-[14px] py-[8px] text-[12px] font-bold bg-[#121212] text-white rounded hover:bg-black"
              >
                + Add Sample Order
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-[14px] px-[16px]">Order ID & Date</th>
                  <th className="py-[14px] px-[16px]">Customer & Destination</th>
                  <th className="py-[14px] px-[16px]">Purchased Items</th>
                  <th className="py-[14px] px-[16px]">Total / Payment</th>
                  <th className="py-[14px] px-[16px]">Order Status</th>
                  <th className="py-[14px] px-[16px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-[13px]">
                {filteredOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                  const StatusIcon = cfg.icon;
                  const cleanPhone = (order.customer?.phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Column 1: Order ID & Date */}
                      <td className="py-[16px] px-[16px] align-top">
                        <div className="space-y-[4px]">
                          <span className="font-extrabold text-[14px] text-[#cf0c1d] tracking-wide block">
                            #{order.id}
                          </span>
                          <span className="text-[11px] text-gray-500 flex items-center gap-[4px]">
                            <Calendar size={12} />
                            {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            {new Date(order.createdAt || order.date || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {order.source && (
                            <span className="inline-block text-[10px] font-semibold bg-gray-100 text-gray-600 px-[6px] py-[1px] rounded">
                              {order.source}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 2: Customer & Delivery Address */}
                      <td className="py-[16px] px-[16px] align-top max-w-[240px]">
                        <div className="space-y-[4px]">
                          {/* Member status pill */}
                          {order.isRegisteredUser || order.userId ? (
                            <div className="inline-flex items-center gap-[4px] text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 px-[6px] py-[2px] rounded uppercase tracking-wider mb-[2px]">
                              <Sparkles size={11} className="text-purple-600" />
                              <span>Registered Member {order.userId ? `(${order.userId})` : ''}</span>
                            </div>
                          ) : (
                            <div className="inline-block text-[10px] font-semibold bg-gray-100 text-gray-500 px-[6px] py-[1px] rounded mb-[2px]">
                              Guest Order
                            </div>
                          )}

                          <div className="flex items-center gap-[6px]">
                            <User size={14} className="text-gray-400 shrink-0" />
                            <span className="font-bold text-gray-900 truncate">
                              {order.customer?.name || 'Customer'}
                            </span>
                          </div>

                          {order.customer?.email && (
                            <div className="text-[11px] text-gray-500 truncate">
                              {order.customer.email}
                            </div>
                          )}

                          <div className="flex items-center gap-[6px]">
                            <Phone size={13} className="text-gray-400 shrink-0" />
                            <span className="text-gray-700 font-mono text-[12px]">
                              {order.customer?.phone || 'No phone'}
                            </span>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/92${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-[5px] py-[1px] rounded flex items-center gap-[2px]"
                                title="Chat on WhatsApp"
                              >
                                <span>WA</span>
                                <ArrowUpRight size={10} />
                              </a>
                            )}
                          </div>

                          <div className="flex items-start gap-[6px] text-gray-600 text-[12px]">
                            <MapPin size={13} className="text-gray-400 shrink-0 mt-[2px]" />
                            <span className="line-clamp-2">
                              {order.customer?.address}, <strong>{order.customer?.city}</strong>
                              {order.customer?.province ? `, ${order.customer.province}` : ''}
                            </span>
                          </div>

                          {order.customer?.notes && (
                            <div className="bg-amber-50 text-amber-800 text-[11px] p-[6px] rounded border border-amber-200 mt-[4px]">
                              <strong>Note:</strong> {order.customer.notes}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Items */}
                      <td className="py-[16px] px-[16px] align-top max-w-[260px]">
                        <div className="space-y-[8px]">
                          {(order.items || []).map((it, idx) => (
                            <div key={idx} className="flex items-center gap-[10px]">
                              <img
                                src={it.image}
                                alt={it.title}
                                className="w-[36px] h-[46px] object-cover rounded-[3px] border border-gray-200 bg-gray-100 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold text-gray-900 block truncate text-[12px]">
                                  {it.title}
                                </span>
                                <div className="text-[11px] text-gray-500 flex items-center gap-[6px]">
                                  {it.selectedSize && (
                                    <span className="bg-gray-100 px-[4px] py-[1px] rounded text-[10px] font-bold">
                                      {it.selectedSize}
                                    </span>
                                  )}
                                  <span>Qty: {it.quantity}</span>
                                  <span>•</span>
                                  <span className="font-medium text-gray-700">
                                    Rs. {(it.price * it.quantity).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Column 4: Total & Payment */}
                      <td className="py-[16px] px-[16px] align-top whitespace-nowrap">
                        <div className="space-y-[4px]">
                          <span className="text-[16px] font-extrabold text-[#121212] block">
                            Rs. {Number(order.total || 0).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-gray-500 block">
                            Subtotal: Rs. {Number(order.subtotal || order.total || 0).toLocaleString()}
                          </span>
                          <span className="text-[11px] text-gray-500 block">
                            Shipping: {order.shipping === 0 ? 'FREE' : `Rs. ${order.shipping || 0}`}
                          </span>
                          <span className="inline-block text-[11px] font-bold bg-emerald-50 text-emerald-700 px-[7px] py-[2px] rounded border border-emerald-200">
                            {order.paymentMethod || 'Cash on Delivery'}
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Status Dropdown */}
                      <td className="py-[16px] px-[16px] align-top whitespace-nowrap">
                        <div className="space-y-[6px]">
                          <select
                            value={order.status || 'Pending'}
                            disabled={statusUpdating === order.id}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className={`w-full text-[12px] font-bold py-[6px] px-[10px] rounded-[4px] border focus:outline-none cursor-pointer transition-colors ${cfg.bg}`}
                          >
                            <option value="Pending">🟡 Pending</option>
                            <option value="Confirmed">🔵 Confirmed</option>
                            <option value="Shipped">🟣 Shipped</option>
                            <option value="Delivered">🟢 Delivered</option>
                            <option value="Cancelled">🔴 Cancelled</option>
                          </select>

                          <div className="flex items-center gap-[4px] text-[10px] text-gray-400">
                            <span className={`w-[6px] h-[6px] rounded-full ${cfg.dot}`} />
                            <span>Status: {order.status}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 6: Actions */}
                      <td className="py-[16px] px-[16px] align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-[6px]">
                          {/* Printable Invoice */}
                          <button
                            onClick={() => setSelectedInvoice(order)}
                            className="p-[7px] text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-[4px] transition-colors cursor-pointer"
                            title="Print Packing Slip / Dispatch Invoice"
                          >
                            <Printer size={15} />
                          </button>

                          {/* Delete Order */}
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-[7px] text-red-600 hover:text-white hover:bg-red-600 bg-red-50 rounded-[4px] transition-colors cursor-pointer"
                            title="Delete Order"
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

      {/* INVOICE / PACKING SLIP MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[15px] sm:p-[30px]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedInvoice(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-[8px] shadow-2xl overflow-hidden z-10 animate-expand flex flex-col max-h-[90vh]">
            {/* Modal Actions Bar */}
            <div className="px-[20px] py-[12px] bg-[#121212] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-[8px] text-[13px] font-bold">
                <Printer size={16} />
                <span>Zimal Collection Order Dispatch Slip — #{selectedInvoice.id}</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <button
                  onClick={() => window.print()}
                  className="px-[12px] py-[5px] bg-[#cf0c1d] hover:bg-[#b00a18] text-white text-[12px] font-bold rounded flex items-center gap-[5px]"
                >
                  <Printer size={13} />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="w-[28px] h-[28px] rounded-full hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>

            {/* Printable Slip Content */}
            <div className="p-[25px] sm:p-[35px] overflow-y-auto space-y-[20px] font-assistant text-[#121212]">
              {/* Slip Header */}
              <div className="flex justify-between items-start border-b-2 border-black pb-[18px]">
                <div>
                  <h2 className="text-[28px] font-extrabold tracking-tight">ZIMAL COLLECTION</h2>
                  <span className="text-[11px] font-bold tracking-[2px] text-gray-500 uppercase block">
                    Luxury Pret & Unstitched Pakistan • www.zimalcollection.com
                  </span>
                  <p className="text-[11px] text-gray-500 mt-[4px]">
                    Zimal Collection Flagship Logistics Center • www.zimalcollection.com
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                    Dispatch Order #
                  </span>
                  <span className="text-[22px] font-black text-[#cf0c1d]">
                    #{selectedInvoice.id}
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Date: {new Date(selectedInvoice.createdAt || selectedInvoice.date || Date.now()).toLocaleDateString()}
                  </span>
                  <span className="inline-block mt-[4px] px-[8px] py-[2px] bg-gray-100 text-gray-800 text-[11px] font-bold rounded">
                    COD Parcel
                  </span>
                </div>
              </div>

              {/* Customer Delivery Details Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[15px] bg-[#f8f9fa] p-[16px] rounded-[6px] border border-gray-200">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-[4px]">
                    Consignee / Customer
                  </span>
                  <p className="text-[14px] font-bold text-gray-900">{selectedInvoice.customer?.name}</p>
                  <p className="text-[13px] font-semibold text-gray-700 font-mono mt-[2px]">
                    Phone: {selectedInvoice.customer?.phone}
                  </p>
                  {selectedInvoice.customer?.email && (
                    <p className="text-[11px] text-gray-500">{selectedInvoice.customer?.email}</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-[4px]">
                    Shipping Address
                  </span>
                  <p className="text-[13px] text-gray-800 leading-snug">
                    {selectedInvoice.customer?.address}
                  </p>
                  <p className="text-[13px] font-bold text-gray-900 mt-[2px]">
                    {selectedInvoice.customer?.city}, {selectedInvoice.customer?.province || 'Pakistan'}
                  </p>
                  {selectedInvoice.customer?.notes && (
                    <p className="text-[11px] text-amber-700 mt-[4px]">
                      <strong>Courier Note:</strong> {selectedInvoice.customer?.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-[8px]">
                  Package Contents
                </span>
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-gray-300 text-[11px] font-bold uppercase text-gray-500">
                      <th className="py-[6px]">Item Description</th>
                      <th className="py-[6px] text-center">Size</th>
                      <th className="py-[6px] text-center">Qty</th>
                      <th className="py-[6px] text-right">Price</th>
                      <th className="py-[6px] text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(selectedInvoice.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-[8px]">
                          <span className="font-semibold block">{item.title}</span>
                          <span className="text-[11px] text-gray-400">{item.category}</span>
                        </td>
                        <td className="py-[8px] text-center font-bold text-[12px]">
                          {item.selectedSize || 'Standard'}
                        </td>
                        <td className="py-[8px] text-center font-bold">
                          {item.quantity}
                        </td>
                        <td className="py-[8px] text-right">
                          Rs. {Number(item.price).toLocaleString()}
                        </td>
                        <td className="py-[8px] text-right font-bold">
                          Rs. {(Number(item.price) * Number(item.quantity)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Price Calculation */}
              <div className="pt-[10px] border-t border-gray-300 flex justify-end">
                <div className="w-[260px] space-y-[6px] text-[13px]">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>Rs. {Number(selectedInvoice.subtotal || selectedInvoice.total).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Charges:</span>
                    <span>{selectedInvoice.shipping === 0 ? 'FREE' : `Rs. ${selectedInvoice.shipping}`}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-[8px] border-t border-gray-400 text-[16px] font-black text-[#cf0c1d]">
                    <span>Cash to Collect (COD):</span>
                    <span>Rs. {Number(selectedInvoice.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Barcode & Footer Instructions */}
              <div className="pt-[20px] border-t-2 border-dashed border-gray-300 text-center space-y-[6px]">
                <div className="font-mono tracking-[8px] text-[18px] font-black text-gray-800">
                  ||||| | |||| |||| || | ||||| | |||
                </div>
                <span className="text-[11px] font-mono text-gray-500 block">
                  TRX-{selectedInvoice.id}-PK
                </span>
                <p className="text-[11px] text-gray-400">
                  Zimal Collection Official COD Dispatch Voucher. Please verify recipient identity and collect exact cash amount upon delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

