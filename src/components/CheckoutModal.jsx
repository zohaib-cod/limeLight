import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Package,
  Clock,
  Phone,
  MapPin,
  User,
  Mail,
  FileText
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
  'Gujrat',
  'Sahiwal',
  'Sheikhupura',
  'Jhelum',
  'Mardan',
  'Kasur',
  'Rahim Yar Khan',
  'Other City'
];

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan'
];

const FREE_SHIPPING_THRESHOLD = 2490;
const STANDARD_SHIPPING_FEE = 250;

export default function CheckoutModal({
  isOpen,
  onClose,
  items = [],
  onOrderSuccess,
  currentUser
}) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    address: currentUser?.address || '',
    city: currentUser?.city || 'Lahore',
    customCity: '',
    province: currentUser?.province || 'Punjab',
    notes: ''
  });

  // Pre-fill when currentUser is loaded
  React.useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        phone: currentUser.phone || prev.phone,
        email: currentUser.email || prev.email,
        address: currentUser.address || prev.address,
        city: currentUser.city || prev.city,
        province: currentUser.province || prev.province
      }));
    }
  }, [currentUser, isOpen]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  if (!isOpen) return null;

  // Calculate pricing
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = items.length === 0 ? 0 : isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = subtotal + shippingFee;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Mobile / WhatsApp number is required';
    } else if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
      errs.phone = 'Please enter a valid 11-digit mobile number';
    }
    if (!formData.address.trim()) errs.address = 'Complete delivery street address is required';
    if (formData.city === 'Other City' && !formData.customCity.trim()) {
      errs.city = 'Please specify your city';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    setIsSubmitting(true);

    const orderId = `LM-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalCity = formData.city === 'Other City' ? formData.customCity.trim() : formData.city;

    const orderPayload = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        city: finalCity,
        province: formData.province,
        notes: formData.notes.trim() || undefined
      },
      items: items.map(item => ({
        id: item.id || `item-${Date.now()}`,
        title: item.title,
        category: item.category || 'Apparel',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        selectedSize: item.selectedSize || item.size || 'Standard',
        fabric: item.fabric || undefined,
        image: item.image
      })),
      subtotal,
      shipping: shippingFee,
      total: grandTotal,
      paymentMethod: 'Cash on Delivery',
      status: 'Pending',
      source: 'Storefront Direct Order',
      userId: currentUser ? currentUser.id : null,
      userEmail: currentUser ? currentUser.email : (formData.email.trim() || undefined),
      isRegisteredUser: Boolean(currentUser),
      registeredCustomerName: currentUser ? currentUser.name : null
    };

    // 1. SAVE DIRECTLY TO LOCALSTORAGE (Primary Requirement)
    try {
      const currentOrders = JSON.parse(localStorage.getItem('limelight_orders') || '[]');
      const updatedOrders = [orderPayload, ...currentOrders.filter(o => o.id !== orderId)];
      localStorage.setItem('limelight_orders', JSON.stringify(updatedOrders));
      // Dispatch custom event to notify any open admin tabs / listeners
      window.dispatchEvent(new CustomEvent('limelight_order_placed', { detail: orderPayload }));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }

    // 2. ALSO SYNC TO BACKEND API (Express server / data/orders.json)
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
    } catch (apiErr) {
      console.warn('Backend sync warning (order already saved locally):', apiErr);
    }

    setIsSubmitting(false);
    setCompletedOrder(orderPayload);
    if (onOrderSuccess) {
      onOrderSuccess(orderPayload);
    }
  };

  const handleClose = () => {
    setCompletedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[6px] xs:p-[12px] sm:p-[25px]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#161616] text-[#121212] dark:text-white rounded-[8px] shadow-2xl overflow-hidden z-10 animate-expand flex flex-col max-h-[94vh] transition-colors duration-200">
        {/* Top Header */}
        <div className="px-[16px] sm:px-[30px] py-[14px] sm:py-[16px] border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#161616] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-[10px]">
            <div className="w-[30px] sm:w-[32px] h-[30px] sm:h-[32px] bg-[#121212] dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-bold text-[13px] sm:text-[14px] shrink-0">
              ZC
            </div>
            <div>
              <h2 className="text-[14px] sm:text-[17px] font-bold text-[#121212] dark:text-white tracking-wider uppercase">
                {completedOrder ? 'Order Confirmation' : 'Direct Checkout — Cash on Delivery'}
              </h2>
              <div className="flex items-center gap-[6px] text-[10.5px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                <Lock size={11} className="text-emerald-600 dark:text-emerald-400" />
                <span>256-bit Secure Checkout • Free Delivery Available</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-[32px] h-[32px] rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-[14px] sm:p-[25px] md:p-[30px]">
          {completedOrder ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="max-w-xl mx-auto py-[20px] text-center space-y-[20px]">
              <div className="w-[70px] h-[70px] bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 size={40} />
              </div>

              <div>
                <span className="inline-block px-[10px] py-[3px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider rounded-full mb-[8px]">
                  Order Placed Successfully!
                </span>
                <h3 className="text-[24px] sm:text-[28px] font-bold text-[#121212]">
                  Thank You, {completedOrder.customer.name}!
                </h3>
                <p className="text-[14px] text-gray-600 mt-[6px]">
                  Your direct order has been registered in the system and synchronized to the Admin Panel.
                </p>
              </div>

              {/* Order Reference Box */}
              <div className="bg-[#f8f9fa] border-2 border-dashed border-gray-300 rounded-[8px] p-[20px] text-left">
                <div className="flex justify-between items-center pb-[12px] border-b border-gray-200 mb-[12px]">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                      Order Reference ID
                    </span>
                    <span className="text-[20px] font-extrabold text-[#cf0c1d] tracking-wider">
                      #{completedOrder.id}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                      Payment Mode
                    </span>
                    <span className="text-[13px] font-bold text-gray-800 bg-amber-100 text-amber-800 px-[8px] py-[2px] rounded-[4px]">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                </div>

                <div className="space-y-[6px] text-[13px] text-gray-700">
                  <div className="flex items-start gap-[8px]">
                    <User size={15} className="text-gray-400 mt-[2px] shrink-0" />
                    <span><strong>Customer:</strong> {completedOrder.customer.name} ({completedOrder.customer.phone})</span>
                  </div>
                  <div className="flex items-start gap-[8px]">
                    <MapPin size={15} className="text-gray-400 mt-[2px] shrink-0" />
                    <span><strong>Delivery To:</strong> {completedOrder.customer.address}, {completedOrder.customer.city}, {completedOrder.customer.province}</span>
                  </div>
                  <div className="flex items-start gap-[8px]">
                    <Clock size={15} className="text-gray-400 mt-[2px] shrink-0" />
                    <span><strong>Estimated Dispatch:</strong> 24–48 Hours (Trax / CallCourier Delivery)</span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="mt-[16px] pt-[12px] border-t border-gray-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-[8px]">
                    Purchased Items ({completedOrder.items.length})
                  </span>
                  <div className="space-y-[8px]">
                    {completedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[13px]">
                        <div className="flex items-center gap-[8px]">
                          <img
                            src={it.image}
                            alt={it.title}
                            className="w-[36px] h-[46px] object-cover rounded-[3px] border border-gray-200"
                          />
                          <div>
                            <span className="font-semibold text-gray-900 block line-clamp-1">{it.title}</span>
                            <span className="text-[11px] text-gray-500">Size: {it.selectedSize} • Qty: {it.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-[#121212]">
                          Rs. {(it.price * it.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-[12px] pt-[10px] border-t border-gray-200 text-[15px] font-extrabold text-[#121212]">
                    <span>Total Payable:</span>
                    <span className="text-[18px] text-[#cf0c1d]">Rs. {completedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps Info */}
              <div className="bg-emerald-50 text-emerald-800 p-[12px] rounded-[6px] text-[12px] flex items-center gap-[10px] text-left">
                <ShieldCheck size={20} className="shrink-0 text-emerald-600" />
                <span>
                  Our dispatch team will verify your phone number via SMS/call and prepare your parcel for fast courier delivery.
                </span>
              </div>

              <div className="pt-[10px]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="button-primary w-full bg-[#121212] text-white hover:bg-black py-[13px] text-[14px] font-bold rounded-[4px] tracking-wider cursor-pointer transition-colors shadow-sm"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM & REVIEW */
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-[20px] sm:gap-[25px]">
              {/* Left Column: Customer & Delivery Info (7 cols) */}
              <div className="lg:col-span-7 space-y-[16px] sm:space-y-[20px]">
                <div>
                  <h3 className="text-[14px] sm:text-[15px] font-bold uppercase tracking-wider text-[#121212] dark:text-white mb-[4px] flex items-center gap-[8px]">
                    <MapPin size={17} className="text-[#cf0c1d]" />
                    <span>1. Shipping & Contact Information</span>
                  </h3>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400">
                    Please provide your correct address for prompt courier delivery.
                  </p>
                </div>

                {/* Logged in member badge */}
                {currentUser && (
                  <div className="p-[10px] bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-[6px] flex items-center justify-between text-[12px] text-purple-900 dark:text-purple-200">
                    <div className="flex items-center gap-[6px]">
                      <span className="w-[8px] h-[8px] rounded-full bg-emerald-500 shrink-0" />
                      <span>Ordering as registered member: <strong>{currentUser.name}</strong></span>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-[6px] py-[2px] rounded uppercase font-mono">
                      #{currentUser.id}
                    </span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-[11.5px] sm:text-[12px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-[5px]">
                    Full Name <span className="text-[#cf0c1d]">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g. Ayesha Khan"
                      className={`w-full pl-[36px] pr-[12px] py-[10px] text-[13.5px] sm:text-[14px] border rounded-[4px] focus:outline-none transition-colors bg-white dark:bg-[#202020] text-[#121212] dark:text-white ${
                        errors.name ? 'border-red-500 bg-red-50/30' : 'border-gray-300 dark:border-white/20 focus:border-[#121212] dark:focus:border-white'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-[11px] mt-[4px]">{errors.name}</p>}
                </div>

                {/* Mobile / WhatsApp & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                  <div>
                    <label className="block text-[11.5px] sm:text-[12px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-[5px]">
                      Mobile / WhatsApp <span className="text-[#cf0c1d]">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="0300 1234567"
                        className={`w-full pl-[36px] pr-[12px] py-[10px] text-[13.5px] sm:text-[14px] border rounded-[4px] focus:outline-none transition-colors bg-white dark:bg-[#202020] text-[#121212] dark:text-white ${
                          errors.phone ? 'border-red-500 bg-red-50/30' : 'border-gray-300 dark:border-white/20 focus:border-[#121212] dark:focus:border-white'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-[11px] mt-[4px]">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-[11.5px] sm:text-[12px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-[5px]">
                      Email Address <span className="text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="customer@example.com"
                        className="w-full pl-[36px] pr-[12px] py-[10px] text-[13.5px] sm:text-[14px] border border-gray-300 dark:border-white/20 rounded-[4px] bg-white dark:bg-[#202020] text-[#121212] dark:text-white focus:outline-none focus:border-[#121212] dark:focus:border-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Complete Address */}
                <div>
                  <label className="block text-[11.5px] sm:text-[12px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-[5px]">
                    Delivery Street Address <span className="text-[#cf0c1d]">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="House / Apartment #, Street #, Sector / Area / Landmark"
                    className={`w-full px-[12px] py-[10px] text-[13.5px] sm:text-[14px] border rounded-[4px] focus:outline-none transition-colors bg-white dark:bg-[#202020] text-[#121212] dark:text-white ${
                      errors.address ? 'border-red-500 bg-red-50/30' : 'border-gray-300 dark:border-white/20 focus:border-[#121212] dark:focus:border-white'
                    }`}
                  />
                  {errors.address && <p className="text-red-500 text-[11px] mt-[4px]">{errors.address}</p>}
                </div>

                {/* City & Province */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                  <div>
                    <label className="block text-[11.5px] sm:text-[12px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-[5px]">
                      City <span className="text-[#cf0c1d]">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-[12px] py-[10px] text-[13.5px] sm:text-[14px] border border-gray-300 dark:border-white/20 rounded-[4px] bg-white dark:bg-[#202020] text-[#121212] dark:text-white focus:outline-none focus:border-[#121212] dark:focus:border-white"
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11.5px] sm:text-[12px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-[5px]">
                      Province
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      className="w-full px-[12px] py-[10px] text-[13.5px] sm:text-[14px] border border-gray-300 dark:border-white/20 rounded-[4px] bg-white dark:bg-[#202020] text-[#121212] dark:text-white focus:outline-none focus:border-[#121212] dark:focus:border-white"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.city === 'Other City' && (
                  <div>
                    <label className="block text-[11.5px] sm:text-[12px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-[5px]">
                      Specify Your City <span className="text-[#cf0c1d]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customCity}
                      onChange={(e) => handleInputChange('customCity', e.target.value)}
                      placeholder="Enter city name in Pakistan"
                      className="w-full px-[12px] py-[10px] text-[13.5px] sm:text-[14px] border border-gray-300 dark:border-white/20 rounded-[4px] bg-white dark:bg-[#202020] text-[#121212] dark:text-white focus:outline-none focus:border-[#121212] dark:focus:border-white"
                    />
                    {errors.city && <p className="text-red-500 text-[11px] mt-[4px]">{errors.city}</p>}
                  </div>
                )}

                {/* Delivery Notes */}
                <div>
                  <label className="block text-[11.5px] sm:text-[12px] font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-[5px]">
                    Delivery Instructions <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="e.g. Call before delivery, Leave with security"
                    className="w-full px-[12px] py-[8px] text-[13px] border border-gray-300 dark:border-white/20 rounded-[4px] bg-white dark:bg-[#202020] text-[#121212] dark:text-white focus:outline-none focus:border-[#121212] dark:focus:border-white"
                  />
                </div>

                {/* Payment Option */}
                <div className="pt-[10px] border-t border-gray-200 dark:border-white/10">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#121212] dark:text-white mb-[10px] flex items-center gap-[6px]">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>Payment Method</span>
                  </h3>
                  <div className="p-[12px] sm:p-[14px] rounded-[6px] border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 flex items-center justify-between">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-emerald-600 flex items-center justify-center">
                        <div className="w-[9px] h-[9px] rounded-full bg-emerald-600" />
                      </div>
                      <div>
                        <span className="text-[13.5px] sm:text-[14px] font-bold text-gray-900 dark:text-white block">Cash on Delivery (COD)</span>
                        <span className="text-[11.5px] sm:text-[12px] text-gray-600 dark:text-gray-300">Pay cash to courier upon package delivery</span>
                      </div>
                    </div>
                    <span className="text-[10.5px] sm:text-[11px] font-bold bg-emerald-600 text-white px-[8px] py-[3px] rounded">
                      Standard
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary (5 cols) */}
              <div className="lg:col-span-5 bg-[#f8f9fa] dark:bg-[#202020] rounded-[8px] p-[16px] sm:p-[20px] flex flex-col justify-between border border-gray-200 dark:border-white/10">
                <div>
                  <div className="flex items-center justify-between pb-[12px] border-b border-gray-200 dark:border-white/10 mb-[15px]">
                    <h3 className="text-[13.5px] sm:text-[14px] font-bold uppercase tracking-wider text-[#121212] dark:text-white flex items-center gap-[6px]">
                      <Package size={16} />
                      <span>Order Items ({items.reduce((s, i) => s + (i.quantity || 1), 0)})</span>
                    </h3>
                  </div>

                  {/* Items list */}
                  <div className="space-y-[10px] sm:space-y-[12px] max-h-[260px] overflow-y-auto pr-[5px] mb-[15px]">
                    {items.map((it, idx) => (
                      <div key={idx} className="flex gap-[10px] sm:gap-[12px] items-center bg-white dark:bg-[#1a1a1a] p-[8px] sm:p-[10px] rounded-[6px] border border-gray-200 dark:border-white/10">
                        <img
                          src={it.image}
                          alt={it.title}
                          className="w-[46px] sm:w-[50px] h-[58px] sm:h-[64px] object-cover rounded-[3px] bg-gray-100 dark:bg-gray-800 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                            {it.category || 'Zimal Collection'}
                          </span>
                          <h4 className="text-[12px] sm:text-[13px] font-bold text-[#121212] dark:text-white truncate">
                            {it.title}
                          </h4>
                          <div className="flex items-center gap-[8px] text-[11px] text-gray-600 dark:text-gray-300 mt-[2px]">
                            {it.selectedSize && (
                              <span className="bg-gray-100 dark:bg-white/10 px-[5px] py-[1px] rounded font-medium">
                                Size: {it.selectedSize}
                              </span>
                            )}
                            <span>Qty: {it.quantity || 1}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[12px] sm:text-[13px] font-bold text-[#121212] dark:text-white block">
                            Rs. {((Number(it.price) || 0) * (Number(it.quantity) || 1)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-[8px] pt-[12px] border-t border-gray-200 dark:border-white/10 text-[13px]">
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Rs. {subtotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-[5px]">
                        <Truck size={14} />
                        <span>Nationwide Shipping</span>
                      </span>
                      {isFreeShipping ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-[6px] py-[1px] rounded text-[12px]">
                          FREE
                        </span>
                      ) : (
                        <span className="font-semibold text-gray-900 dark:text-white">Rs. {STANDARD_SHIPPING_FEE}</span>
                      )}
                    </div>

                    {!isFreeShipping && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-[6px] rounded border border-amber-200 dark:border-amber-800">
                        Add Rs. {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} more to get <strong>FREE SHIPPING</strong>!
                      </p>
                    )}

                    <div className="flex justify-between items-baseline pt-[12px] border-t border-gray-300 dark:border-white/20">
                      <div>
                        <span className="text-[13.5px] sm:text-[14px] font-extrabold text-[#121212] dark:text-white uppercase tracking-wider block">
                          Total Amount
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">Includes all applicable duties & taxes</span>
                      </div>
                      <span className="text-[18px] sm:text-[20px] font-extrabold text-[#cf0c1d]">
                        Rs. {grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="mt-[20px] space-y-[10px]">
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="button-primary w-full bg-[#121212] hover:bg-black text-white py-[14px] text-[14px] font-bold tracking-[1px] rounded-[4px] flex items-center justify-center gap-[8px] shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-[8px]">
                        <span className="w-[16px] h-[16px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>PLACING ORDER...</span>
                      </span>
                    ) : (
                      <>
                        <span>PLACE ORDER — RS. {grandTotal.toLocaleString()}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-[6px] text-[11px] text-gray-500">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>Fast dispatch within 24h • 100% Genuine Brand Guarantee</span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

