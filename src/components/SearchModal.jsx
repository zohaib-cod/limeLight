import React, { useState, useEffect } from 'react';
import { Search, X, ShoppingBag, Eye, ArrowRight } from 'lucide-react';
import {
  UNSTITCHED_PRODUCTS,
  RTW_PRODUCTS,
  MEN_PRODUCTS,
  ACCESSORIES_PRODUCTS,
  FRAGRANCES,
  NEW_ARRIVALS
} from '../data/products';

export default function SearchModal({ isOpen, onClose, onQuickView, onAddToCart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [liveCatalog, setLiveCatalog] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      fetch('/api/products').then(r => (r.ok ? r.json() : null)),
      fetch('/api/new-arrivals').then(r => (r.ok ? r.json() : null))
    ])
      .then(([prods, na]) => {
        const merged = [];
        const seen = new Set();
        const pushUnique = (item) => {
          if (!item) return;
          const key = item.id || item._id || item.title;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push({ ...item, id: item.id || item._id });
          }
        };
        if (Array.isArray(prods)) prods.forEach(pushUnique);
        if (Array.isArray(na)) na.forEach(pushUnique);
        setLiveCatalog(merged);
      })
      .catch(() => {
        setLiveCatalog([
          ...UNSTITCHED_PRODUCTS,
          ...RTW_PRODUCTS,
          ...MEN_PRODUCTS,
          ...ACCESSORIES_PRODUCTS,
          ...FRAGRANCES.map(f => ({ ...f, title: f.name, category: "Fragrances" })),
          ...NEW_ARRIVALS
        ]);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const allCatalog = liveCatalog;

  const results = searchTerm.trim()
    ? allCatalog.filter((item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fabric?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.color?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const quickTags = ['Velvet', 'Co-Ord', 'Khaddar', 'Karandi', 'Mist', 'Latha', 'Shawl', 'Pret'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-start justify-center p-[8px] xs:p-[15px] sm:p-[40px] pt-[50px] sm:pt-[60px]">
        <div className="relative bg-white dark:bg-[#161616] text-[#121212] dark:text-white w-full max-w-4xl rounded-[6px] shadow-modal overflow-hidden animate-expand transition-colors duration-200">
          {/* Search Header */}
          <div className="p-[14px] xs:p-[20px] sm:p-[25px] border-b border-[#1212121a] dark:border-white/10 flex items-center gap-[10px] sm:gap-[15px]">
            <Search size={22} className="text-[#121212] dark:text-white shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search unstitched, ready to wear, fragrances..."
              autoFocus
              className="w-full text-[14px] xs:text-[16px] sm:text-[18px] text-[#121212] dark:text-white bg-transparent tracking-[0.4px] outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-black dark:hover:text-white p-[4px] cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#121212] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 p-[6px] sm:p-[8px] rounded-full transition-colors shrink-0 cursor-pointer"
              aria-label="Close search"
            >
              <X size={22} />
            </button>
          </div>

          {/* Quick Filter Tags */}
          <div className="p-[10px] sm:p-[15px] sm:px-[20px] bg-[#f3f3f3] dark:bg-[#202020] border-b border-[#1212121a] dark:border-white/10 flex items-center gap-[6px] sm:gap-[8px] flex-wrap text-[12px] sm:text-[13px]">
            <span className="font-semibold text-[#121212] dark:text-gray-300 mr-[3px]">Popular:</span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag)}
                className="bg-white dark:bg-[#282828] px-[10px] sm:px-[12px] py-[3px] sm:py-[4px] rounded-[3px] border border-gray-200 dark:border-white/10 hover:border-[#121212] dark:hover:border-white text-[#121212] dark:text-white transition-colors cursor-pointer text-[11px] sm:text-[12px]"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Results Area */}
          <div className="p-[20px] sm:p-[30px] max-h-[60vh] overflow-y-auto">
            {searchTerm.trim() ? (
              results.length > 0 ? (
                <div>
                  <p className="text-[13px] text-[#121212bf] mb-[15px]">
                    Found <strong>{results.length}</strong> items matching "{searchTerm}"
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[8px] xs:gap-[12px] sm:gap-[15px]">
                    {results.slice(0, 12).map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="group flex flex-col bg-white dark:bg-[#1a1a1a] border border-[#1212121a] dark:border-white/10 rounded-[6px] overflow-hidden shadow-soft hover:shadow-modal transition-all"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f3f3] dark:bg-[#252525]">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-[6px] p-[10px]">
                            <button
                              onClick={() => {
                                onQuickView(item);
                                onClose();
                              }}
                              className="bg-white dark:bg-[#252525] text-[#121212] dark:text-white p-[6px] rounded-[3px] hover:bg-gray-100 cursor-pointer"
                              title="Quick View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => onAddToCart(item)}
                              className="bg-[#121212] dark:bg-white text-white dark:text-black p-[6px] rounded-[3px] hover:bg-black cursor-pointer"
                              title="Add to Bag"
                            >
                              <ShoppingBag size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="p-[8px] xs:p-[10px] flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[9.5px] text-[#121212bf] dark:text-gray-400 uppercase tracking-wider block mb-[2px] truncate">
                              {item.category}
                            </span>
                            <h5 className="text-[12px] xs:text-[13px] font-medium text-[#121212] dark:text-white line-clamp-1 mb-[4px]">
                              {item.title}
                            </h5>
                          </div>
                          <span className="text-[12px] xs:text-[13px] font-bold text-[#121212] dark:text-white mt-[4px]">
                            Rs. {item.price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-[40px] text-[#121212bf] dark:text-gray-400">
                  <p className="text-[16px] font-medium text-[#121212] mb-[6px]">
                    No matches found for "{searchTerm}"
                  </p>
                  <p className="text-[13px]">
                    Try searching for broader keywords like "Unstitched", "Kurti", "Velvet", or "Fragrance".
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-[40px] text-[#121212bf]">
                <Search size={40} className="mx-auto mb-[10px] text-gray-300" />
                <p className="text-[15px] font-medium text-[#121212] mb-[4px]">
                  Explore Zimal Collection's Catalog (www.zimalcollection.com)
                </p>
                <p className="text-[13px]">
                  Type a keyword above or select a trending filter to begin your search.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

