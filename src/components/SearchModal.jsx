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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const allCatalog = [
    ...UNSTITCHED_PRODUCTS,
    ...RTW_PRODUCTS,
    ...MEN_PRODUCTS,
    ...ACCESSORIES_PRODUCTS,
    ...FRAGRANCES.map(f => ({ ...f, title: f.name, category: "Fragrances" })),
    ...NEW_ARRIVALS
  ];

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

      <div className="relative min-h-screen flex items-start justify-center p-[15px] sm:p-[40px] pt-[60px]">
        <div className="relative bg-white w-full max-w-4xl rounded-[6px] shadow-modal overflow-hidden animate-expand">
          {/* Search Header */}
          <div className="p-[20px] sm:p-[25px] border-b border-[#1212121a] flex items-center gap-[15px]">
            <Search size={22} className="text-[#121212] shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search unstitched, ready to wear, fragrances, accessories..."
              autoFocus
              className="w-full text-[16px] sm:text-[18px] text-[#121212] tracking-[0.4px] outline-none placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-black p-[4px]"
              >
                <X size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#121212] hover:bg-gray-100 p-[8px] rounded-full transition-colors shrink-0"
              aria-label="Close search"
            >
              <X size={22} />
            </button>
          </div>

          {/* Quick Filter Tags */}
          <div className="p-[15px] sm:p-[20px] bg-[#f3f3f3] border-b border-[#1212121a] flex items-center gap-[8px] flex-wrap text-[13px]">
            <span className="font-semibold text-[#121212] mr-[5px]">Popular Searches:</span>
            {quickTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag)}
                className="bg-white px-[12px] py-[4px] rounded-[3px] border border-gray-200 hover:border-[#121212] text-[#121212] transition-colors"
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[15px]">
                    {results.slice(0, 12).map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="group flex flex-col bg-white border border-[#1212121a] rounded-[6px] overflow-hidden shadow-soft hover:shadow-modal transition-all"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f3f3]">
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
                              className="bg-white text-[#121212] p-[6px] rounded-[3px] hover:bg-gray-100"
                              title="Quick View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => onAddToCart(item)}
                              className="bg-[#121212] text-white p-[6px] rounded-[3px] hover:bg-black"
                              title="Add to Bag"
                            >
                              <ShoppingBag size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="p-[10px] flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-[#121212bf] uppercase tracking-wider block mb-[2px]">
                              {item.category}
                            </span>
                            <h5 className="text-[13px] font-medium text-[#121212] line-clamp-1 mb-[4px]">
                              {item.title}
                            </h5>
                          </div>
                          <span className="text-[14px] font-bold text-[#121212]">
                            Rs. {item.price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-[40px] text-[#121212bf]">
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

