import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  ShoppingBag,
  Heart,
  Save,
  ArrowLeft,
  Link2,
  DollarSign,
  Tag,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Shirt,
  Scissors,
  Check
} from 'lucide-react';

const UNSTITCHED_PRESETS = [
  {
    name: '3 Piece Velvet Emerald',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    fabric: 'Velvet & Chiffon',
    pieces: 'Shirt + Trouser + Embroidered Dupatta',
    subCategory: '3 Piece'
  },
  {
    name: '2 Piece Khaddar Gold',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    fabric: 'Warm Khaddar',
    pieces: 'Shirt + Woolen Shawl',
    subCategory: '2 Piece'
  },
  {
    name: '2 Piece Karandi Ruby',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    fabric: 'Karandi',
    pieces: 'Shirt + Trouser',
    subCategory: '2 Piece'
  },
  {
    name: '1 Piece Cambric Blue',
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
    fabric: 'Cambric Cotton',
    pieces: 'Unstitched Shirt Piece 3m',
    subCategory: '1 Piece'
  }
];

const RTW_PRESETS = [
  {
    name: '2 Piece Co-Ord Yellow',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    fabric: 'Linen Viscose Blend',
    fit: 'Relaxed Boxy Fit',
    subCategory: 'Co-Ords',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    name: 'Jacquard Kurti Blue',
    url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    fabric: 'Woven Jacquard',
    fit: 'Straight Cut with Slits',
    subCategory: 'Pret Kurti',
    sizes: ['S', 'M', 'L']
  },
  {
    name: 'Everyday Kurta Sage',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    fabric: 'Slub Cotton',
    fit: 'A-Line Flare',
    subCategory: 'Pret Kurti',
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    name: 'Festive Silk Ensemble',
    url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    fabric: 'Raw Silk & Organza',
    fit: 'Royal Anarkali Cut',
    subCategory: '3 Piece Pret',
    sizes: ['S', 'M', 'L']
  }
];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Free Size'];

const UNSTITCHED_SUBCATEGORIES = ['3 Piece', '2 Piece', '1 Piece', 'Shawl Suit', 'Velvet Suit'];
const RTW_SUBCATEGORIES = ['Co-Ords', 'Pret Kurti', '2 Piece Pret', '3 Piece Pret', 'Western Co-Ords', 'Everyday Casual'];

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);

  const rawCat = searchParams.get('category');
  const initialCategory = rawCat || 'Unstitched';

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [navRoutes, setNavRoutes] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: initialCategory,
    subCategory: initialCategory === 'Ready To Wear' ? 'Co-Ords' : '3 Piece',
    fabric: initialCategory === 'Ready To Wear' ? 'Linen Viscose Blend' : 'Velvet & Chiffon',
    pieces: initialCategory === 'Ready To Wear' ? 'Top + Bottom' : 'Shirt + Trouser + Embroidered Dupatta',
    fit: initialCategory === 'Ready To Wear' ? 'Relaxed Boxy Fit' : '',
    sizes: initialCategory === 'Ready To Wear' ? ['XS', 'S', 'M', 'L', 'XL'] : [],
    color: '',
    price: '',
    originalPrice: '',
    discount: '',
    sku: '',
    image: '',
    isActive: true,
    inStock: true
  });

  // Image upload
  const [imageSource, setImageSource] = useState('upload'); // 'upload' | 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch('/api/navigation')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setNavRoutes(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isEditing) {
      fetch(`/api/products/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Product not found');
          return res.json();
        })
        .then(data => {
          setFormData({
            title: data.title || '',
            category: data.category || 'Unstitched',
            subCategory: data.subCategory || '3 Piece',
            fabric: data.fabric || '',
            pieces: data.pieces || '',
            fit: data.fit || '',
            sizes: Array.isArray(data.sizes) ? data.sizes : (data.category === 'Ready To Wear' ? ['S', 'M', 'L'] : []),
            color: data.color || '',
            price: data.price !== undefined ? data.price : '',
            originalPrice: data.originalPrice !== undefined && data.originalPrice !== null ? data.originalPrice : '',
            discount: data.discount || '',
            sku: data.sku || '',
            image: data.image || '',
            isActive: data.isActive !== false,
            inStock: data.inStock !== false
          });
        })
        .catch(err => {
          showFeedback('error', 'Could not load product details.');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Auto calculate discount percentage when price or originalPrice changes
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

  // Category switch handler
  const handleCategorySwitch = (newCat) => {
    if (newCat === formData.category) return;
    const isRTW = newCat === 'Ready To Wear';
    setFormData(prev => ({
      ...prev,
      category: newCat,
      subCategory: isRTW ? 'Co-Ords' : '3 Piece',
      fabric: isRTW ? (prev.fabric || 'Linen Viscose Blend') : (prev.fabric || 'Velvet & Chiffon'),
      pieces: isRTW ? 'Top + Bottom' : 'Shirt + Trouser + Embroidered Dupatta',
      fit: isRTW ? (prev.fit || 'Relaxed Boxy Fit') : '',
      sizes: isRTW ? (prev.sizes && prev.sizes.length > 0 ? prev.sizes : ['XS', 'S', 'M', 'L', 'XL']) : [],
      sku: isRTW ? `RTW-24-${Date.now().toString().slice(-4)}` : `U3P-24-${Date.now().toString().slice(-4)}`
    }));
  };

  // Toggle size chip
  const toggleSize = (size) => {
    setFormData(prev => {
      const currentSizes = Array.isArray(prev.sizes) ? prev.sizes : [];
      if (currentSizes.includes(size)) {
        return { ...prev, sizes: currentSizes.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...currentSizes, size] };
      }
    });
  };

  // File change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Please choose a valid image file (JPG, PNG, WebP).');
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  // Drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  // Presets based on selected category
  const activePresets = formData.category === 'Ready To Wear' ? RTW_PRESETS : UNSTITCHED_PRESETS;
  const displayImage = filePreview || formData.image || activePresets[0].url;

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
      setSaving(true);
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('category', formData.category);
      submitData.append('subCategory', formData.subCategory);
      submitData.append('fabric', formData.fabric);
      submitData.append('pieces', formData.pieces);
      submitData.append('fit', formData.fit || '');
      submitData.append('color', formData.color);
      submitData.append('price', formData.price);
      if (formData.originalPrice) {
        submitData.append('originalPrice', formData.originalPrice);
      }
      submitData.append('discount', formData.discount);
      submitData.append('sku', formData.sku);
      submitData.append('isActive', formData.isActive);
      submitData.append('inStock', formData.inStock);

      if (formData.category === 'Ready To Wear' && formData.sizes) {
        submitData.append('sizes', JSON.stringify(formData.sizes));
      }

      if (selectedFile) {
        submitData.append('image', selectedFile);
      } else {
        submitData.append('image', formData.image || activePresets[0].url);
      }

      const endpoint = isEditing ? `/api/products/${id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        body: submitData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      showFeedback('success', `Product "${formData.title}" saved successfully!`);
      setTimeout(() => {
        navigate('/admin/products');
      }, 700);
    } catch (err) {
      console.error('Save product error:', err);
      showFeedback('error', err.message || 'Error saving product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-[60px] text-center rounded-[8px] border border-gray-200 text-gray-500 font-assistant">
        <div className="w-[30px] h-[30px] border-2 border-[#23ac95] border-t-transparent rounded-full animate-spin mx-auto mb-[10px]" />
        <p className="text-[14px]">Loading product data...</p>
      </div>
    );
  }

  const isRTW = formData.category === 'Ready To Wear';

  return (
    <div className="space-y-[28px] font-assistant">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] bg-white p-[24px] rounded-[8px] border border-gray-200 shadow-sm">
        <div className="flex items-center gap-[12px]">
          <Link
            to="/admin/products"
            className="p-[8px] bg-gray-100 hover:bg-gray-200 rounded-[6px] text-gray-700 transition-colors"
            title="Back to products list"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-[8px]">
              <h1 className="text-[22px] font-bold text-[#121212]">
                {isEditing ? `Edit Product: ${formData.title}` : `Add New ${isRTW ? 'Ready To Wear' : 'Unstitched'} Product`}
              </h1>
              <span className={`text-[11px] font-bold px-[8px] py-[2px] rounded-full uppercase tracking-wider ${
                isRTW ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {formData.category}
              </span>
            </div>
            <p className="text-[13px] text-gray-500">
              {isEditing
                ? 'Update product details, pricing, discount, sizes, and high-resolution photography'
                : 'Upload product imagery and publish instantly to the customer storefront'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-[10px]">
          <Link
            to="/admin/products"
            className="px-[14px] py-[8px] text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[4px] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="button-primary bg-[#121212] hover:bg-black text-white font-bold px-[18px] py-[8px] text-[13px] rounded-[4px] flex items-center gap-[6px] shadow-sm transition-all cursor-pointer"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save & Publish Product'}</span>
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

      {/* Main Grid: Live Preview (Left) + Form Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
        {/* Left Column: Live Storefront Card Preview (4 Cols) */}
        <div className="lg:col-span-4 space-y-[16px]">
          <div className="bg-white p-[20px] rounded-[8px] border border-gray-200 shadow-sm sticky top-[20px]">
            <div className="flex items-center justify-between mb-[12px]">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-[6px]">
                <Eye size={14} className="text-[#23ac95]" />
                <span>Live Card Preview</span>
              </span>
              <span className="text-[11px] text-gray-400">
                1:1 Storefront Card
              </span>
            </div>

            {/* Exactly matches customer storefront cards */}
            <div className="group flex flex-col bg-white border border-[#1212121a] rounded-[6px] overflow-hidden shadow-soft hover:shadow-modal transition-all duration-300">
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f3f3]">
                <img
                  src={displayImage}
                  alt={formData.title || 'Product Preview'}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = activePresets[0].url;
                  }}
                />

                {/* Discount Badge (e.g. 15% OFF) */}
                {formData.discount && (
                  <div className="absolute top-[10px] left-[10px] bg-[#cf0c1d] text-white text-[11px] font-bold px-[8px] py-[3px] rounded-[3px] tracking-wider shadow-xs">
                    {formData.discount}
                  </div>
                )}

                {/* Wishlist Button */}
                <div className="absolute top-[10px] right-[10px] w-[34px] h-[34px] bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#121212] shadow-sm">
                  <Heart size={17} />
                </div>

                {/* Quick View & Add to Cart Overlay on Hover */}
                <div className="absolute inset-x-0 bottom-0 p-[10px] bg-gradient-to-t from-black/60 to-transparent flex gap-[8px] opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex-1 bg-white text-[#121212] text-[13px] py-[8px] font-medium flex items-center justify-center gap-[5px] rounded-[3px] shadow-xs">
                    <Eye size={15} />
                    <span>Quick View</span>
                  </div>
                  <div className="bg-[#121212] text-white p-[8px] rounded-[3px]">
                    <ShoppingBag size={16} />
                  </div>
                </div>
              </div>

              {/* Product Meta */}
              <div className="p-[15px] flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] tracking-widest text-[#121212bf] uppercase block mb-[4px]">
                    {formData.subCategory || (isRTW ? 'CO-ORDS' : '3 PIECE')} • {formData.fabric || (isRTW ? 'LINEN VISCOSE' : 'VELVET')}
                  </span>
                  <h4 className="text-[15px] font-medium text-[#121212] line-clamp-1 mb-[6px]">
                    {formData.title || (isRTW ? '2 Piece Printed Co-Ord Set' : '3 Piece Embroidered Velvet Suit')}
                  </h4>

                  {/* Ready To Wear Sizes Chips */}
                  {isRTW && formData.sizes && formData.sizes.length > 0 && (
                    <div className="flex items-center gap-[4px] mb-[8px] flex-wrap">
                      <span className="text-[10px] text-gray-500 mr-[2px]">Size:</span>
                      {formData.sizes.map((s, idx) => (
                        <span
                          key={s}
                          className={`text-[10px] px-[6px] py-[1px] rounded-[2px] border ${
                            idx === 0 ? 'bg-[#121212] text-white border-[#121212]' : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Cut / Fit or Pieces */}
                  {isRTW && formData.fit ? (
                    <p className="text-[11px] text-gray-500 truncate mb-[6px]">
                      Fit: {formData.fit}
                    </p>
                  ) : formData.pieces ? (
                    <p className="text-[11px] text-gray-500 truncate mb-[6px]">
                      {formData.pieces}
                    </p>
                  ) : null}
                </div>

                <div className="pt-[6px] border-t border-[#1212121a] flex items-center justify-between">
                  <div className="flex items-baseline gap-[8px]">
                    <span className="text-[16px] font-bold text-[#121212]">
                      Rs. {formData.price ? Number(formData.price).toLocaleString() : (isRTW ? '5,490' : '8,990')}
                    </span>
                    {formData.originalPrice && (
                      <span className="text-[13px] text-[#121212b3] line-through">
                        Rs. {Number(formData.originalPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Visibility Tag */}
            <div className="mt-[14px] pt-[12px] border-t border-gray-100 flex items-center justify-between text-[12px]">
              <span className="text-gray-500">Storefront Status:</span>
              <span className={`font-bold ${formData.isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                {formData.isActive ? '● Visible to Customers' : '● Hidden from Storefront'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Form Inputs & Media (8 Cols) */}
        <div className="lg:col-span-8 space-y-[20px]">
          {/* Card 0: Category Selector Switcher */}
          <div className="bg-white p-[20px] rounded-[8px] border border-gray-200 shadow-sm space-y-[12px]">
            <label className="block text-[13px] font-bold text-gray-700">
              Select Target Collection / Section *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
              <button
                type="button"
                onClick={() => handleCategorySwitch('Unstitched')}
                className={`p-[14px] rounded-[6px] border-2 text-left transition-all flex items-start gap-[12px] cursor-pointer ${
                  !isRTW
                    ? 'border-[#121212] bg-gray-50/70 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`p-[8px] rounded-[6px] ${!isRTW ? 'bg-[#121212] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Scissors size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[14px] font-bold text-[#121212]">Unstitched Fabrics</span>
                    {!isRTW && <Check size={16} className="text-[#23ac95]" />}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-[2px]">
                    3-Piece, 2-Piece, Karandi, Khaddar, and Velvet fabric suits
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySwitch('Ready To Wear')}
                className={`p-[14px] rounded-[6px] border-2 text-left transition-all flex items-start gap-[12px] cursor-pointer ${
                  isRTW
                    ? 'border-[#121212] bg-gray-50/70 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`p-[8px] rounded-[6px] ${isRTW ? 'bg-[#121212] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Shirt size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[14px] font-bold text-[#121212]">Ready To Wear</span>
                    {isRTW && <Check size={16} className="text-[#23ac95]" />}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-[2px]">
                    Western Co-Ords, Pret Kurtis, stitched casuals, and sizes (XS-XL)
                  </p>
                </div>
              </button>
            </div>

            {/* Dynamic Navigation Routes Selection */}
            {navRoutes.length > 0 && (
              <div className="pt-[14px] border-t border-gray-100">
                <div className="flex items-center justify-between mb-[8px]">
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                    Assign Directly to Navigation Route:
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Active category: <b className="text-[#121212]">{formData.category}</b>
                  </span>
                </div>
                <div className="flex flex-wrap gap-[6px]">
                  {navRoutes.map(r => {
                    const isSelected = formData.category.toLowerCase() === r.name.toLowerCase();
                    return (
                      <button
                        key={r.id || r.name}
                        type="button"
                        onClick={() => handleCategorySwitch(r.name)}
                        className={`px-[12px] py-[6px] text-[12px] font-semibold rounded-[4px] border transition-all cursor-pointer flex items-center gap-[5px] ${
                          isSelected
                            ? 'bg-[#121212] text-white border-[#121212] shadow-sm'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span>{r.name}</span>
                        {isSelected && <Check size={12} className="text-[#23ac95]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card 1: Photography / Media */}
          <div className="bg-white p-[24px] rounded-[8px] border border-gray-200 shadow-sm space-y-[16px]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-[12px]">
              <div className="flex items-center gap-[8px]">
                <ImageIcon size={18} className="text-[#23ac95]" />
                <h3 className="text-[15px] font-bold text-[#121212]">
                  {isRTW ? 'Ready To Wear Photography' : 'Unstitched Photography'}
                </h3>
              </div>
              <div className="flex items-center gap-[6px] bg-gray-100 p-[3px] rounded-[6px]">
                <button
                  type="button"
                  onClick={() => setImageSource('upload')}
                  className={`px-[10px] py-[4px] text-[12px] font-medium rounded-[4px] transition-colors ${
                    imageSource === 'upload'
                      ? 'bg-white text-[#121212] shadow-xs'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource('url')}
                  className={`px-[10px] py-[4px] text-[12px] font-medium rounded-[4px] transition-colors ${
                    imageSource === 'url'
                      ? 'bg-white text-[#121212] shadow-xs'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* Upload Area */}
            {imageSource === 'upload' ? (
              <div className="space-y-[12px]">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[8px] p-[24px] text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-[#23ac95] bg-[#23ac95]/5'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-[8px]">
                    <div className="w-[44px] h-[44px] rounded-full bg-[#23ac95]/10 text-[#23ac95] flex items-center justify-center">
                      <UploadCloud size={22} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#121212]">
                        Click to upload or drag & drop product photo
                      </p>
                      <p className="text-[11px] text-gray-500 mt-[2px]">
                        JPG, PNG, WebP up to 25MB (Aspect ratio 3:4 portrait recommended)
                      </p>
                    </div>
                  </div>
                </div>

                {selectedFile && (
                  <div className="p-[10px] bg-emerald-50 border border-emerald-200 rounded-[6px] flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-emerald-900 truncate">
                      {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                      className="text-emerald-800 hover:text-emerald-950 font-bold ml-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-[8px]">
                <label className="block text-[13px] font-medium text-gray-700">
                  Direct Image Web URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none text-gray-400">
                    <Link2 size={16} />
                  </span>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-[36px] pr-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
                  />
                </div>
              </div>
            )}

            {/* Presets */}
            <div>
              <span className="text-[11px] font-semibold text-gray-500 block mb-[6px]">
                Or select from {isRTW ? 'Ready To Wear' : 'Unstitched'} presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-[8px]">
                {activePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                      setFormData(prev => ({
                        ...prev,
                        image: preset.url,
                        fabric: preset.fabric || prev.fabric,
                        subCategory: preset.subCategory || prev.subCategory,
                        fit: preset.fit || prev.fit,
                        sizes: preset.sizes || prev.sizes,
                        pieces: preset.pieces || prev.pieces
                      }));
                    }}
                    className={`p-[6px] rounded-[6px] border text-left text-[11px] font-medium transition-colors flex items-center gap-[6px] cursor-pointer ${
                      formData.image === preset.url && !selectedFile
                        ? 'border-[#121212] bg-[#121212] text-white'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-[26px] h-[26px] object-cover rounded-[3px] shrink-0"
                    />
                    <span className="truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Core Details */}
          <div className="bg-white p-[24px] rounded-[8px] border border-gray-200 shadow-sm space-y-[16px]">
            <h3 className="text-[15px] font-bold text-[#121212] border-b border-gray-100 pb-[10px]">
              General Information
            </h3>

            {/* Title */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={isRTW ? 'e.g. 2 Piece Printed Co-Ord Set' : 'e.g. 3 Piece Embroidered Velvet Suit'}
                className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212] font-semibold"
              />
            </div>

            {/* SubCategory with Quick Pills */}
            <div>
              <div className="flex items-center justify-between mb-[4px]">
                <label className="block text-[13px] font-bold text-gray-700">
                  Sub-Category / Type
                </label>
                <div className="flex items-center gap-[4px]">
                  {(isRTW ? RTW_SUBCATEGORIES : UNSTITCHED_SUBCATEGORIES).map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setFormData({ ...formData, subCategory: sc })}
                      className={`text-[10px] px-[6px] py-[2px] rounded-[3px] transition-colors ${
                        formData.subCategory === sc
                          ? 'bg-[#121212] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                placeholder={isRTW ? 'e.g. Co-Ords, Pret Kurti' : 'e.g. 3 Piece, 2 Piece, 1 Piece'}
                className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
              />
            </div>

            {/* Fabric & (Fit or Pieces) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                  Fabric Quality
                </label>
                <input
                  type="text"
                  value={formData.fabric}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                  placeholder={isRTW ? 'e.g. Linen Viscose Blend, Woven Jacquard' : 'e.g. Velvet & Chiffon, Karandi'}
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
                />
              </div>

              {isRTW ? (
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                    Cut / Silhouette Fit
                  </label>
                  <input
                    type="text"
                    value={formData.fit}
                    onChange={(e) => setFormData({ ...formData, fit: e.target.value })}
                    placeholder="e.g. Relaxed Boxy Fit, Straight Cut"
                    className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                    Included Pieces / Breakdown
                  </label>
                  <input
                    type="text"
                    value={formData.pieces}
                    onChange={(e) => setFormData({ ...formData, pieces: e.target.value })}
                    placeholder="e.g. Shirt + Trouser + Embroidered Dupatta"
                    className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
                  />
                </div>
              )}
            </div>

            {/* Sizing Chips for Ready To Wear */}
            {isRTW && (
              <div className="bg-purple-50/60 border border-purple-200/80 rounded-[6px] p-[14px] space-y-[8px]">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-purple-950 uppercase tracking-wider flex items-center gap-[6px]">
                    <Shirt size={15} className="text-purple-700" />
                    <span>Available In-Stock Sizes (Click to toggle)</span>
                  </label>
                  <span className="text-[11px] text-purple-700 font-medium">
                    {formData.sizes?.length || 0} selected
                  </span>
                </div>
                <div className="flex items-center gap-[8px] flex-wrap">
                  {AVAILABLE_SIZES.map((size) => {
                    const isChecked = formData.sizes?.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-[12px] py-[6px] text-[12px] font-bold rounded-[4px] border transition-all cursor-pointer flex items-center gap-[5px] ${
                          isChecked
                            ? 'bg-[#121212] text-white border-[#121212] shadow-xs'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {isChecked && <Check size={13} className="text-[#23ac95]" />}
                        <span>{size}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                  Color / Shade
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder={isRTW ? 'e.g. Yellow & Terracotta, Sky Blue' : 'e.g. Deep Emerald, Ruby Red'}
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                  SKU Code
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder={isRTW ? 'e.g. RTW-24-CRD-01' : 'e.g. U3P-24-EMB-01'}
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Pricing & Discounts */}
          <div className="bg-white p-[24px] rounded-[8px] border border-gray-200 shadow-sm space-y-[16px]">
            <h3 className="text-[15px] font-bold text-[#121212] border-b border-gray-100 pb-[10px]">
              Pricing & Discounts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px]">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                  Sale Price (Rs.) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none text-gray-400 font-bold text-[12px]">
                    Rs.
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => handlePriceChange(e.target.value, formData.originalPrice)}
                    placeholder={isRTW ? '5490' : '8990'}
                    className="w-full pl-[38px] pr-[12px] py-[9px] text-[14px] font-bold border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                  Original Price (Rs.)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none text-gray-400 font-bold text-[12px]">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => handlePriceChange(formData.price, e.target.value)}
                    placeholder={isRTW ? '6490' : '11990'}
                    className="w-full pl-[38px] pr-[12px] py-[9px] text-[14px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                  Discount Badge
                </label>
                <input
                  type="text"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="e.g. 15% OFF"
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212] font-semibold text-[#cf0c1d]"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Inventory & Visibility Settings */}
          <div className="bg-white p-[24px] rounded-[8px] border border-gray-200 shadow-sm space-y-[16px]">
            <h3 className="text-[15px] font-bold text-[#121212] border-b border-gray-100 pb-[10px]">
              Inventory & Visibility
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              {/* Active Toggle */}
              <div className="flex items-center justify-between p-[12px] border border-gray-200 rounded-[6px]">
                <div>
                  <h4 className="text-[13px] font-bold text-[#121212]">
                    Customer Visibility
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Publish immediately on live storefront
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className="cursor-pointer"
                >
                  {formData.isActive ? (
                    <ToggleRight size={28} className="text-emerald-600" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-400" />
                  )}
                </button>
              </div>

              {/* In Stock Toggle */}
              <div className="flex items-center justify-between p-[12px] border border-gray-200 rounded-[6px]">
                <div>
                  <h4 className="text-[13px] font-bold text-[#121212]">
                    Stock Availability
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Allow customers to add item to bag
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, inStock: !formData.inStock })}
                  className="cursor-pointer"
                >
                  {formData.inStock ? (
                    <ToggleRight size={28} className="text-emerald-600" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons at bottom */}
          <div className="flex items-center justify-end gap-[12px] pt-[8px]">
            <Link
              to="/admin/products"
              className="px-[16px] py-[10px] text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[4px] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="button-primary bg-[#121212] hover:bg-black text-white font-bold px-[24px] py-[10px] text-[13px] rounded-[4px] flex items-center gap-[8px] shadow-sm transition-all cursor-pointer"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save & Publish Product'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
