import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  PlusCircle,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  UploadCloud,
  Image as ImageIcon,
  Link2,
  Save,
  X,
  Eye,
  Heart,
  ShoppingBag,
  Tag,
  Filter
} from 'lucide-react';

const BADGE_PRESETS = [
  'JUST ARRIVED',
  'TRENDING',
  'NEW IN',
  'SELLING FAST',
  'LIMITED EDITION',
  'HOT SELLER'
];

const CATEGORY_OPTIONS = [
  'Unstitched',
  'Ready To Wear',
  'Accessories'
];

const NEW_ARRIVALS_PRESETS = [
  {
    name: 'Embroidered Velvet Shawl',
    url: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468270/limelight/products/fortmr7iconwcdksozs9.jpg',
    title: 'Embroidered Velvet Shawl 3 Piece Suit',
    category: 'Unstitched',
    badge: 'JUST ARRIVED',
    price: 9990,
    originalPrice: 12990,
    fabric: 'Premium Micro Velvet with Golden Zari Work'
  },
  {
    name: 'Contemporary Minimalist Co-Ord',
    url: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468273/limelight/products/upuqz5frkmo8iqjp3c9z.jpg',
    title: 'Contemporary Minimalist Co-Ord Set',
    category: 'Ready To Wear',
    badge: 'TRENDING',
    price: 5990,
    originalPrice: 6990,
    fabric: 'Super Fine Slub Twill'
  },
  {
    name: 'Festive Raw Silk Kurti',
    url: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468274/limelight/products/izkgkkyn9nzjfcqgf6xl.jpg',
    title: 'Festive Raw Silk Jacquard Kurti',
    category: 'Ready To Wear',
    badge: 'NEW IN',
    price: 4690,
    originalPrice: 5490,
    fabric: 'Self Weave Jacquard'
  },
  {
    name: 'Laser-Cut Festive Clutch',
    url: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468275/limelight/products/egff9lsbnlq4rxgrc6p4.jpg',
    title: 'Laser-Cut Festive Evening Clutch',
    category: 'Accessories',
    badge: 'SELLING FAST',
    price: 3290,
    originalPrice: 3890,
    fabric: 'Faux Suede with Metal Clasp'
  }
];

export default function AdminNewArrivals() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Unstitched',
    badge: 'NEW IN',
    fabric: '',
    price: '',
    originalPrice: '',
    discount: '',
    sku: '',
    image: '',
    isActive: true,
    inStock: true
  });

  // Media
  const [imageSource, setImageSource] = useState('upload'); // 'upload' | 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/new-arrivals?admin=true');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        applyFilter(data, selectedCategory);
      }
    } catch (err) {
      console.error('Failed to load new arrivals:', err);
      showFeedback('error', 'Could not load new arrivals from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const applyFilter = (list, cat) => {
    if (cat === 'ALL') {
      setFilteredItems(list);
    } else {
      setFilteredItems(list.filter(i => i.category?.toLowerCase() === cat.toLowerCase()));
    }
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    applyFilter(items, cat);
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Price & Discount auto calc
  const handlePriceChange = (priceVal, origVal) => {
    const p = parseFloat(priceVal);
    const orig = parseFloat(origVal);
    let autoDiscount = formData.discount;

    if (!isNaN(p) && !isNaN(orig) && orig > p) {
      const pct = Math.round(((orig - p) / orig) * 100);
      autoDiscount = `${pct}% OFF`;
    }

    setFormData(prev => ({
      ...prev,
      price: priceVal,
      originalPrice: origVal,
      discount: autoDiscount
    }));
  };

  // Open Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: 'Embroidered Velvet Shawl 3 Piece Suit',
      category: 'Unstitched',
      badge: 'JUST ARRIVED',
      fabric: 'Premium Micro Velvet with Golden Zari Work',
      price: '9990',
      originalPrice: '12990',
      discount: '23% OFF',
      sku: `NA-VLV-${Date.now().toString().slice(-4)}`,
      image: NEW_ARRIVALS_PRESETS[0].url,
      isActive: true,
      inStock: true
    });
    setSelectedFile(null);
    setFilePreview(null);
    setImageSource('upload');
    setModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      category: item.category || 'Unstitched',
      badge: item.badge || 'NEW IN',
      fabric: item.fabric || '',
      price: item.price !== undefined ? item.price : '',
      originalPrice: item.originalPrice !== undefined && item.originalPrice !== null ? item.originalPrice : '',
      discount: item.discount || '',
      sku: item.sku || '',
      image: item.image || '',
      isActive: item.isActive !== false,
      inStock: item.inStock !== false
    });
    setSelectedFile(null);
    setFilePreview(null);
    setImageSource('url');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setSelectedFile(null);
    setFilePreview(null);
  };

  // Toggle Active
  const handleToggleActive = async (item) => {
    try {
      const newStatus = !item.isActive;
      const res = await fetch(`/api/new-arrivals/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
      if (res.ok) {
        showFeedback('success', `Item "${item.title}" is now ${newStatus ? 'visible' : 'hidden'}.`);
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: newStatus } : i));
        setFilteredItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: newStatus } : i));
      }
    } catch (err) {
      showFeedback('error', 'Failed to toggle status.');
    }
  };

  // Delete
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete new arrival "${item.title}"?`)) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/new-arrivals/${item.id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', `Item "${item.title}" deleted.`);
        setItems(prev => prev.filter(i => i.id !== item.id));
        setFilteredItems(prev => prev.filter(i => i.id !== item.id));
      }
    } catch (err) {
      showFeedback('error', 'Error deleting item.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reset
  const handleReset = async () => {
    if (!window.confirm('Reset all new arrivals back to Limelight default items?')) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/new-arrivals/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showFeedback('success', 'New Arrivals reset to defaults.');
        setItems(data.items || []);
        applyFilter(data.items || [], selectedCategory);
      }
    } catch (err) {
      showFeedback('error', 'Failed to reset items.');
    } finally {
      setActionLoading(false);
    }
  };

  // File Handlers
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Please choose a valid image (JPG, PNG, WebP).');
      return;
    }
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showFeedback('error', 'Product title is required.');
      return;
    }
    if (!formData.price) {
      showFeedback('error', 'Product price is required.');
      return;
    }

    try {
      setActionLoading(true);
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('category', formData.category);
      submitData.append('badge', formData.badge.trim().toUpperCase());
      submitData.append('fabric', formData.fabric.trim());
      submitData.append('price', formData.price);
      if (formData.originalPrice) {
        submitData.append('originalPrice', formData.originalPrice);
      }
      submitData.append('discount', formData.discount);
      submitData.append('sku', formData.sku);
      submitData.append('isActive', formData.isActive);
      submitData.append('inStock', formData.inStock);

      if (selectedFile) {
        submitData.append('image', selectedFile);
      } else {
        submitData.append('image', formData.image || NEW_ARRIVALS_PRESETS[0].url);
      }

      const endpoint = editingItem ? `/api/new-arrivals/${editingItem.id}` : '/api/new-arrivals';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        body: submitData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      showFeedback('success', `Product "${formData.title}" saved successfully!`);
      handleCloseModal();
      loadItems();
    } catch (err) {
      console.error('Error saving new arrival:', err);
      showFeedback('error', err.message || 'Error saving product.');
    } finally {
      setActionLoading(false);
    }
  };

  const previewImage = filePreview || formData.image || NEW_ARRIVALS_PRESETS[0].url;

  return (
    <div className="space-y-[28px] font-assistant">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] bg-white p-[24px] rounded-[8px] border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-[8px] mb-[4px]">
            <span className="p-[6px] bg-[#cf0c1d]/10 text-[#cf0c1d] rounded-[4px]">
              <Sparkles size={20} />
            </span>
            <h1 className="text-[24px] font-bold text-[#121212]">
              New Arrivals (Just Dropped In Stores & Online)
            </h1>
            <span className="bg-rose-100 text-rose-800 text-[11px] font-semibold px-[8px] py-[2px] rounded-full uppercase tracking-wider">
              {items.length} Items
            </span>
          </div>
          <p className="text-[14px] text-gray-500 max-w-[700px]">
            Manage the New Arrivals showcase: upload fresh seasonal items across Unstitched, Ready to Wear, and Accessories with custom promotional badges.
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            onClick={handleReset}
            disabled={actionLoading}
            className="px-[13px] py-[9px] text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[4px] flex items-center gap-[6px] transition-colors cursor-pointer"
            title="Reset to default seed New Arrivals"
          >
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="button-primary bg-[#cec72e] text-[#121212] hover:bg-[#b8db24] font-bold px-[18px] py-[9px] text-[13px] tracking-wider rounded-[4px] flex items-center gap-[6px] shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle size={17} />
            <span>+ Add New Arrival</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-[14px] rounded-[6px] text-[13px] flex items-center gap-[10px] shadow-sm animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="bg-white p-[16px] rounded-[8px] border border-gray-200 shadow-sm flex items-center gap-[10px] overflow-x-auto">
        {['ALL', 'UNSTITCHED', 'READY TO WEAR', 'ACCESSORIES'].map((cat) => {
          const count = cat === 'ALL' ? items.length : items.filter(i => i.category?.toLowerCase() === cat.toLowerCase()).length;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-[16px] py-[7px] text-[12px] font-bold rounded-[6px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-[6px] ${
                selectedCategory === cat
                  ? 'bg-[#121212] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-[6px] py-[1px] rounded-full ${
                selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-white p-[60px] text-center rounded-[8px] border border-gray-200 text-gray-500">
          <div className="w-[30px] h-[30px] border-2 border-[#cf0c1d] border-t-transparent rounded-full animate-spin mx-auto mb-[10px]" />
          <p className="text-[14px]">Loading New Arrivals...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-[60px] text-center rounded-[8px] border border-gray-200 space-y-[12px]">
          <Sparkles size={40} className="mx-auto text-gray-300" />
          <h3 className="text-[16px] font-bold text-[#121212]">
            No items found in {selectedCategory}
          </h3>
          <p className="text-[13px] text-gray-500 max-w-[400px] mx-auto">
            Click "+ Add New Arrival" to add fresh products to this category.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-[16px] py-[8px] text-[13px] font-bold bg-[#121212] text-white rounded-[4px] inline-flex items-center gap-[6px] hover:bg-black cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Add Item Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[8px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Image Frame */}
              <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = NEW_ARRIVALS_PRESETS[0].url;
                  }}
                />

                {/* Promotional Badge (e.g. JUST ARRIVED, TRENDING, NEW IN, SELLING FAST) */}
                {item.badge && (
                  <span className="absolute top-[10px] left-[10px] bg-[#cf0c1d] text-white text-[10px] font-bold px-[8px] py-[3px] rounded-[3px] tracking-wider shadow-xs">
                    {item.badge}
                  </span>
                )}

                {/* Wishlist Heart Icon */}
                <div className="absolute top-[10px] right-[10px] w-[32px] h-[32px] bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center text-[#121212] shadow-sm">
                  <Heart size={16} />
                </div>

                {/* Inactive Overlay Badge */}
                {item.isActive === false && (
                  <div className="absolute inset-x-0 bottom-0 bg-amber-500 text-white text-[10px] font-bold py-[3px] text-center tracking-wider">
                    Hidden on Storefront
                  </div>
                )}
              </div>

              {/* Meta & Info */}
              <div className="p-[14px] flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#23ac95] uppercase tracking-wider block mb-[2px]">
                    {item.category}
                  </span>
                  <h3 className="text-[14px] font-bold text-[#121212] line-clamp-1 mb-[2px]" title={item.title}>
                    {item.title}
                  </h3>
                  {item.fabric && (
                    <p className="text-[11px] text-gray-500 truncate mb-[6px]">
                      {item.fabric}
                    </p>
                  )}
                </div>

                <div>
                  <div className="pt-[8px] border-t border-gray-100 flex items-baseline justify-between mb-[10px]">
                    <div className="flex items-baseline gap-[6px]">
                      <span className="text-[15px] font-extrabold text-[#121212]">
                        Rs. {item.price?.toLocaleString()}
                      </span>
                      {item.originalPrice && (
                        <span className="text-[11px] text-gray-400 line-through">
                          Rs. {item.originalPrice?.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {item.discount && (
                      <span className="text-[10px] font-bold text-[#cf0c1d]">
                        {item.discount}
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-[8px] border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      className="cursor-pointer text-gray-600 hover:text-black flex items-center gap-[4px] text-[11px]"
                      title={item.isActive !== false ? 'Hide from storefront' : 'Publish on storefront'}
                    >
                      {item.isActive !== false ? (
                        <>
                          <ToggleRight size={20} className="text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={20} className="text-gray-400" />
                          <span className="text-gray-500">Hidden</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-[6px]">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-[5px] text-gray-600 hover:text-black hover:bg-gray-100 rounded-[4px] transition-colors cursor-pointer"
                        title="Edit new arrival"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-[5px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-[4px] transition-colors cursor-pointer"
                        title="Delete new arrival"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add / Edit New Arrival */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-[15px] overflow-y-auto">
          <div className="bg-white rounded-[8px] shadow-2xl max-w-[900px] w-full max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-[20px] border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-[10px]">
                <span className="p-[6px] bg-[#cf0c1d]/10 text-[#cf0c1d] rounded-[4px]">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h2 className="text-[17px] font-bold text-[#121212]">
                    {editingItem ? `Edit: ${formData.title}` : 'Add New Arrival Item'}
                  </h2>
                  <p className="text-[12px] text-gray-500">
                    Upload new drop with promotional tag (JUST ARRIVED, TRENDING, NEW IN, SELLING FAST).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-[6px] text-gray-400 hover:text-black rounded-[4px] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-[24px] overflow-y-auto flex-1 space-y-[20px]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-[24px]">
                {/* Left (5 cols): Live 1:1 Preview */}
                <div className="md:col-span-5 space-y-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-[4px]">
                      <Eye size={13} className="text-[#cf0c1d]" />
                      <span>Live Card Preview</span>
                    </span>
                    <span className="text-[10px] text-gray-400">Storefront View</span>
                  </div>

                  <div className="group relative overflow-hidden rounded-[6px] shadow-soft bg-white border border-gray-200 aspect-[3/4]">
                    <img
                      src={previewImage}
                      alt={formData.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = NEW_ARRIVALS_PRESETS[0].url;
                      }}
                    />

                    {formData.badge && (
                      <span className="absolute top-[10px] left-[10px] bg-[#cf0c1d] text-white text-[10px] font-bold px-[8px] py-[3px] rounded-[3px] tracking-wider shadow-xs">
                        {formData.badge}
                      </span>
                    )}

                    <div className="absolute top-[10px] right-[10px] w-[32px] h-[32px] bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center text-[#121212] shadow-sm">
                      <Heart size={16} />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-[10px] bg-gradient-to-t from-black/60 to-transparent flex gap-[6px] opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex-1 bg-white text-[#121212] text-[12px] py-[6px] font-medium flex items-center justify-center gap-[4px] rounded-[3px]">
                        <Eye size={13} />
                        <span>Quick View</span>
                      </div>
                      <div className="bg-[#121212] text-white p-[6px] rounded-[3px]">
                        <ShoppingBag size={14} />
                      </div>
                    </div>
                  </div>

                  <div className="p-[10px] bg-gray-50 border border-gray-200 rounded-[6px] text-[11px] text-gray-600 flex items-center justify-between">
                    <span>Storefront Visibility:</span>
                    <span className={`font-bold ${formData.isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formData.isActive ? '● Published' : '● Hidden'}
                    </span>
                  </div>
                </div>

                {/* Right (7 cols): Inputs & Uploader */}
                <div className="md:col-span-7 space-y-[16px]">
                  {/* Badge Pills */}
                  <div>
                    <label className="block text-[12px] font-bold text-gray-700 mb-[4px]">
                      Promotional Tag Badge *
                    </label>
                    <div className="flex items-center gap-[6px] flex-wrap mb-[6px]">
                      {BADGE_PRESETS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setFormData({ ...formData, badge: b })}
                          className={`text-[10px] px-[8px] py-[3px] rounded-[3px] font-bold transition-colors cursor-pointer ${
                            formData.badge === b
                              ? 'bg-[#cf0c1d] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value.toUpperCase() })}
                      placeholder="e.g. JUST ARRIVED"
                      className="w-full px-[10px] py-[7px] text-[12px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212] font-bold text-[#cf0c1d]"
                    />
                  </div>

                  {/* Photography Uploader */}
                  <div className="border border-gray-200 rounded-[6px] p-[14px] bg-gray-50/50 space-y-[10px]">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-[8px]">
                      <span className="text-[12px] font-bold text-gray-700 flex items-center gap-[6px]">
                        <ImageIcon size={15} className="text-[#cf0c1d]" />
                        <span>Product Photography *</span>
                      </span>
                      <div className="flex items-center gap-[4px] bg-gray-200 p-[2px] rounded-[4px]">
                        <button
                          type="button"
                          onClick={() => setImageSource('upload')}
                          className={`px-[8px] py-[3px] text-[11px] font-medium rounded-[3px] transition-colors ${
                            imageSource === 'upload' ? 'bg-white text-black shadow-xs' : 'text-gray-600'
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSource('url')}
                          className={`px-[8px] py-[3px] text-[11px] font-medium rounded-[3px] transition-colors ${
                            imageSource === 'url' ? 'bg-white text-black shadow-xs' : 'text-gray-600'
                          }`}
                        >
                          Image URL
                        </button>
                      </div>
                    </div>

                    {imageSource === 'upload' ? (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-[6px] p-[16px] text-center cursor-pointer transition-all ${
                          dragOver ? 'border-[#cf0c1d] bg-[#cf0c1d]/5' : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center gap-[6px]">
                          <div className="w-[36px] h-[36px] rounded-full bg-[#cf0c1d]/10 text-[#cf0c1d] flex items-center justify-center">
                            <UploadCloud size={18} />
                          </div>
                          <p className="text-[12px] font-semibold text-[#121212]">
                            Click or drag photo here
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Portrait aspect 3:4 recommended (JPG, PNG, WebP)
                          </p>
                        </div>
                        {selectedFile && (
                          <p className="text-[11px] text-emerald-700 font-bold mt-[6px]">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-[10px] flex items-center pointer-events-none text-gray-400">
                          <Link2 size={15} />
                        </span>
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="https://res.cloudinary.com/antxd4tm/image/upload/v1795468254/limelight/products/wxmrzxlgmlg2tetiiguu.jpg"
                          className="w-full pl-[32px] pr-[10px] py-[8px] text-[12px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212] bg-white"
                        />
                      </div>
                    )}

                    {/* Presets */}
                    <div>
                      <span className="text-[10px] font-semibold text-gray-500 block mb-[4px]">
                        Quick Presets:
                      </span>
                      <div className="grid grid-cols-2 gap-[6px]">
                        {NEW_ARRIVALS_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setFilePreview(null);
                              setFormData({
                                ...formData,
                                image: preset.url,
                                title: preset.title,
                                category: preset.category,
                                badge: preset.badge,
                                price: preset.price.toString(),
                                originalPrice: preset.originalPrice.toString(),
                                fabric: preset.fabric
                              });
                            }}
                            className={`p-[5px] rounded-[4px] border text-left text-[10px] font-medium transition-colors flex items-center gap-[6px] cursor-pointer ${
                              formData.image === preset.url && !selectedFile
                                ? 'border-[#121212] bg-[#121212] text-white'
                                : 'border-gray-200 bg-white hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-[20px] h-[20px] object-cover rounded-[2px] shrink-0"
                            />
                            <span className="truncate">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Core Details */}
                  <div className="space-y-[10px]">
                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 mb-[3px]">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Embroidered Velvet Shawl 3 Piece Suit"
                        className="w-full px-[10px] py-[8px] text-[13px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212] font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-[10px]">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-[3px]">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-[10px] py-[8px] text-[12px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212] bg-white cursor-pointer"
                        >
                          {CATEGORY_OPTIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-[3px]">
                          Fabric / Description
                        </label>
                        <input
                          type="text"
                          value={formData.fabric}
                          onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                          placeholder="e.g. Premium Micro Velvet"
                          className="w-full px-[10px] py-[8px] text-[12px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212]"
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-3 gap-[10px]">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-[3px]">
                          Sale Price (Rs.) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => handlePriceChange(e.target.value, formData.originalPrice)}
                          placeholder="9990"
                          className="w-full px-[10px] py-[8px] text-[13px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212] font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-[3px]">
                          Original Price (Rs.)
                        </label>
                        <input
                          type="number"
                          value={formData.originalPrice}
                          onChange={(e) => handlePriceChange(formData.price, e.target.value)}
                          placeholder="12990"
                          className="w-full px-[10px] py-[8px] text-[13px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212]"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-[3px]">
                          Discount Badge
                        </label>
                        <input
                          type="text"
                          value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                          placeholder="23% OFF"
                          className="w-full px-[10px] py-[8px] text-[12px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212] font-semibold text-[#cf0c1d]"
                        />
                      </div>
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex items-center justify-between p-[10px] border border-gray-200 rounded-[5px] bg-white">
                      <div>
                        <span className="text-[12px] font-bold text-[#121212] block">
                          Storefront Visibility
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Publish in the New Arrivals section
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                        className="cursor-pointer"
                      >
                        {formData.isActive ? (
                          <ToggleRight size={26} className="text-emerald-600" />
                        ) : (
                          <ToggleLeft size={26} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-[16px] border-t border-gray-200 flex items-center justify-end gap-[10px] bg-gray-50">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-[14px] py-[8px] text-[12px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[4px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={actionLoading}
                className="button-primary bg-[#121212] hover:bg-black text-white font-bold px-[18px] py-[8px] text-[12px] rounded-[4px] flex items-center gap-[6px] shadow-sm transition-all cursor-pointer"
              >
                <Save size={15} />
                <span>{actionLoading ? 'Saving...' : editingItem ? 'Update New Arrival' : 'Create & Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

