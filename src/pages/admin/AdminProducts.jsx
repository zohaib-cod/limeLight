import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  ChevronRight,
  Tag,
  Shirt,
  Scissors
} from 'lucide-react';

const CATEGORIES = ['All', 'Unstitched', 'Ready To Wear'];

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products?admin=true');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        applyFilters(data, selectedCategory, searchQuery);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      showFeedback('error', 'Could not load products from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const applyFilters = (list, category, query) => {
    let result = [...list];
    if (category !== 'All') {
      result = result.filter(
        p => p.category?.toLowerCase() === category.toLowerCase()
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        p =>
          p.title?.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.subCategory?.toLowerCase().includes(q) ||
          p.fit?.toLowerCase().includes(q)
      );
    }
    setFilteredProducts(result);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    applyFilters(products, category, searchQuery);
  };

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    applyFilters(products, selectedCategory, q);
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Toggle active status
  const handleToggleActive = async (product) => {
    try {
      const newStatus = !product.isActive;
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
      if (res.ok) {
        showFeedback(
          'success',
          `Product "${product.title}" is now ${newStatus ? 'visible' : 'hidden'} on storefront.`
        );
        setProducts(prev =>
          prev.map(p => (p.id === product.id ? { ...p, isActive: newStatus } : p))
        );
        setFilteredProducts(prev =>
          prev.map(p => (p.id === product.id ? { ...p, isActive: newStatus } : p))
        );
      }
    } catch (err) {
      showFeedback('error', 'Failed to toggle product status.');
    }
  };

  // Delete product
  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${product.title}"?`)) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showFeedback('success', `Product "${product.title}" deleted.`);
        setProducts(prev => prev.filter(p => p.id !== product.id));
        setFilteredProducts(prev => prev.filter(p => p.id !== product.id));
      } else {
        const err = await res.json();
        showFeedback('error', err.error || 'Failed to delete product.');
      }
    } catch (err) {
      showFeedback('error', 'Error deleting product.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reset to default seed catalog
  const handleReset = async () => {
    if (!window.confirm('Reset catalog to the default Limelight Unstitched and Ready To Wear products? Any custom additions will be cleared.')) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch('/api/products/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showFeedback('success', 'Catalog reset to Limelight default items.');
        setProducts(data.products || []);
        applyFilters(data.products || [], selectedCategory, searchQuery);
      }
    } catch (err) {
      showFeedback('error', 'Failed to reset products.');
    } finally {
      setActionLoading(false);
    }
  };

  const unstitchedCount = products.filter(p => p.category?.toLowerCase() === 'unstitched').length;
  const rtwCount = products.filter(p => p.category?.toLowerCase() === 'ready to wear').length;

  return (
    <div className="space-y-[28px] font-assistant">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] bg-white p-[24px] rounded-[8px] border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-[8px] mb-[4px]">
            <span className="p-[6px] bg-[#23ac95]/10 text-[#23ac95] rounded-[4px]">
              <Package size={20} />
            </span>
            <h1 className="text-[24px] font-bold text-[#121212]">
              Product Catalog & Inventory
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-[8px] py-[2px] rounded-full uppercase tracking-wider">
              {products.length} Products
            </span>
          </div>
          <p className="text-[14px] text-gray-500 max-w-[700px]">
            Manage Unstitched fabrics & Ready To Wear pret collections. Upload high-res photography, edit prices, set discounts, select sizes, and toggle customer visibility.
          </p>
        </div>

        <div className="flex items-center gap-[10px] flex-wrap">
          <button
            onClick={handleReset}
            disabled={actionLoading}
            className="px-[12px] py-[9px] text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[4px] flex items-center gap-[6px] transition-colors cursor-pointer"
            title="Reset to default seed products"
          >
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>

          {/* Add Ready To Wear Product */}
          <button
            onClick={() => navigate('/admin/products/new?category=Ready%20To%20Wear')}
            className="button-primary bg-[#121212] text-white hover:bg-black font-bold px-[15px] py-[9px] text-[13px] rounded-[4px] flex items-center gap-[6px] shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Add a new Ready To Wear pret item"
          >
            <Shirt size={16} className="text-[#23ac95]" />
            <span>+ Add Ready To Wear</span>
          </button>

          {/* Add Unstitched Product */}
          <button
            onClick={() => navigate('/admin/products/new?category=Unstitched')}
            className="button-primary bg-[#cec72e] text-[#121212] hover:bg-[#b8db24] font-bold px-[15px] py-[9px] text-[13px] rounded-[4px] flex items-center gap-[6px] shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Add a new Unstitched fabric suit"
          >
            <Scissors size={16} />
            <span>+ Add Unstitched</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-[18px] rounded-[8px] border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-[16px]">
        {/* Category Pills */}
        <div className="flex items-center gap-[8px] w-full sm:w-auto overflow-x-auto pb-[4px] sm:pb-0">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'All'
                ? products.length
                : cat === 'Unstitched'
                ? unstitchedCount
                : rtwCount;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-[14px] py-[7px] rounded-[6px] text-[13px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center gap-[6px] ${
                  selectedCategory === cat
                    ? 'bg-[#121212] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[11px] px-[6px] py-[1px] rounded-full ${
                  selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-[320px]">
          <span className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by title, fabric, SKU, fit..."
            className="w-full pl-[36px] pr-[12px] py-[8px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="bg-white p-[60px] text-center rounded-[8px] border border-gray-200 text-gray-500">
          <div className="w-[30px] h-[30px] border-2 border-[#23ac95] border-t-transparent rounded-full animate-spin mx-auto mb-[10px]" />
          <p className="text-[14px]">Loading product catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-[60px] text-center rounded-[8px] border border-gray-200 space-y-[12px]">
          <Package size={40} className="mx-auto text-gray-300" />
          <h3 className="text-[16px] font-bold text-[#121212]">
            No products found
          </h3>
          <p className="text-[13px] text-gray-500 max-w-[400px] mx-auto">
            {searchQuery
              ? `No products matched "${searchQuery}". Try a different term or clear the search.`
              : `No products currently in ${selectedCategory}. Click below to add one.`}
          </p>
          <button
            onClick={() => navigate(selectedCategory === 'Ready To Wear' ? '/admin/products/new?category=Ready%20To%20Wear' : '/admin/products/new')}
            className="px-[16px] py-[8px] text-[13px] font-bold bg-[#121212] text-white rounded-[4px] inline-flex items-center gap-[6px] hover:bg-black cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Add {selectedCategory === 'Ready To Wear' ? 'Ready To Wear' : 'Product'} Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[20px]">
          {filteredProducts.map((product) => {
            const isRTW = product.category?.toLowerCase() === 'ready to wear';
            return (
              <div
                key={product.id}
                className="bg-white rounded-[8px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468254/limelight/products/wxmrzxlgmlg2tetiiguu.jpg';
                    }}
                  />

                  {/* Discount Badge */}
                  {product.discount && (
                    <span className="absolute top-[10px] left-[10px] bg-[#cf0c1d] text-white text-[11px] font-bold px-[8px] py-[3px] rounded-[3px] tracking-wider shadow-xs">
                      {product.discount}
                    </span>
                  )}

                  {/* Category Pill */}
                  <span className={`absolute top-[10px] right-[10px] text-white text-[10px] font-bold px-[8px] py-[3px] rounded-[3px] uppercase tracking-wider ${
                    isRTW ? 'bg-purple-900/90' : 'bg-black/75'
                  }`}>
                    {product.category}
                  </span>

                  {/* Inactive Overlay Badge */}
                  {product.isActive === false && (
                    <div className="absolute inset-x-0 bottom-0 bg-amber-500 text-white text-[11px] font-bold py-[4px] text-center">
                      Hidden from Storefront
                    </div>
                  )}
                </div>

                {/* Product Meta & Details */}
                <div className="p-[16px] flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 uppercase tracking-wider mb-[4px]">
                      <span className="font-semibold text-[#23ac95]">
                        {product.subCategory} • {product.fabric}
                      </span>
                      <span className="text-[10px] bg-gray-100 px-[6px] py-[2px] rounded font-mono">
                        {product.sku}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-bold text-[#121212] line-clamp-1 mb-[4px]" title={product.title}>
                      {product.title}
                    </h3>

                    {/* Ready To Wear Sizes */}
                    {isRTW && product.sizes && product.sizes.length > 0 && (
                      <div className="flex items-center gap-[4px] my-[6px] flex-wrap">
                        <span className="text-[10px] text-gray-500">Sizes:</span>
                        {product.sizes.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] bg-gray-100 border border-gray-200 px-[5px] py-[1px] rounded-[2px] font-semibold text-gray-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Cut / Fit or Pieces */}
                    {isRTW && product.fit ? (
                      <p className="text-[12px] text-gray-500 truncate mb-[6px]">
                        Fit: {product.fit}
                      </p>
                    ) : product.pieces ? (
                      <p className="text-[12px] text-gray-500 truncate mb-[6px]">
                        {product.pieces} {product.color ? `• ${product.color}` : ''}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    {/* Price */}
                    <div className="pt-[10px] border-t border-gray-100 flex items-baseline justify-between mb-[12px]">
                      <div className="flex items-baseline gap-[8px]">
                        <span className="text-[16px] font-extrabold text-[#121212]">
                          Rs. {product.price?.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[12px] text-gray-400 line-through">
                            Rs. {product.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] font-semibold ${product.inStock !== false ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-[10px] border-t border-gray-100">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className="cursor-pointer text-gray-600 hover:text-black flex items-center gap-[4px] text-[12px]"
                        title={product.isActive !== false ? 'Hide from storefront' : 'Publish on storefront'}
                      >
                        {product.isActive !== false ? (
                          <>
                            <ToggleRight size={22} className="text-emerald-600" />
                            <span className="text-emerald-700 font-medium">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={22} className="text-gray-400" />
                            <span className="text-gray-500">Hidden</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-[6px]">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          className="p-[6px] text-gray-600 hover:text-black hover:bg-gray-100 rounded-[4px] transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => handleDelete(product)}
                          className="p-[6px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-[4px] transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
