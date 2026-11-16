import React, { useState, useEffect } from 'react';
import { Eye, ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { NEW_ARRIVALS } from '../data/products';

export default function NewArrivalsSection({ onQuickView, onAddToCart, onToggleWishlist, wishlist }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [products, setProducts] = useState(NEW_ARRIVALS);

  useEffect(() => {
    fetch('/api/new-arrivals')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(err => {
        console.warn('Using default new arrivals:', err);
      });
  }, []);

  const filteredProducts = activeTab === 'ALL'
    ? products
    : products.filter((p) => p.category?.toUpperCase().includes(activeTab));

  return (
    <section className="shopify-section section py-[50px] bg-transparent border-t border-[#1212121a]" id="new-arrivals">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        {/* Section Heading */}
        <div className="text-center mb-[25px]">
          <h2 className="text-[13px] font-normal text-[#121212] tracking-[0.15em] uppercase mb-[6px] flex items-center justify-center gap-[6px]">
            <Sparkles size={14} className="text-[#cf0c1d]" />
            <span>JUST DROPPED IN STORES & ONLINE</span>
          </h2>
          <h3 className="text-[20px] font-bold text-[#121212] tracking-wide">
            NEW ARRIVALS
          </h3>
          <div className="w-[50px] h-[2px] bg-[#121212] mx-auto mt-[10px]" />
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center items-center gap-[8px] sm:gap-[15px] mb-[25px] sm:mb-[30px] flex-wrap">
          {['ALL', 'UNSTITCHED', 'READY TO WEAR'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-[14px] sm:px-[18px] py-[6px] sm:py-[8px] text-[12px] sm:text-[13px] tracking-wider uppercase transition-all rounded-[3px] cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#121212] text-white font-medium shadow-sm'
                  : 'bg-[#f3f3f3] text-[#121212] hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] sm:gap-[20px]">
          {filteredProducts.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                className="card flex flex-col overflow-hidden shadow-soft hover:shadow-modal transition-all duration-300 group bg-white border border-[#1212121a] rounded-[6px]"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#ffffff]">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Badge (e.g. JUST ARRIVED, TRENDING, NEW IN, SELLING FAST) */}
                  {product.badge && (
                    <span className="absolute top-[10px] left-[10px] bg-[#cf0c1d] text-white text-[10px] font-bold px-[8px] py-[3px] rounded-[3px] tracking-wider shadow-xs">
                      {product.badge}
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className="absolute top-[10px] right-[10px] w-[34px] h-[34px] bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#121212] hover:text-[#cf0c1d] shadow-sm transition-colors cursor-pointer"
                    aria-label="Wishlist"
                  >
                    <Heart size={17} className={isWishlisted ? "fill-[#cf0c1d] text-[#cf0c1d]" : ""} />
                  </button>

                  {/* Hover Quick Actions */}
                  <div className="absolute inset-x-0 bottom-0 p-[10px] bg-gradient-to-t from-black/60 to-transparent flex gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onQuickView(product)}
                      className="flex-1 bg-white text-[#121212] text-[13px] py-[8px] font-medium flex items-center justify-center gap-[5px] hover:bg-[#f3f3f3] transition-colors rounded-[3px] cursor-pointer"
                    >
                      <Eye size={15} />
                      <span>Quick View</span>
                    </button>
                    <button
                      onClick={() => onAddToCart(product)}
                      className="bg-[#121212] text-white p-[8px] hover:bg-[#333333] transition-colors rounded-[3px] cursor-pointer"
                      title="Add to Bag"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-[10px] sm:p-[14px] flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] sm:text-[11px] tracking-widest text-[#121212bf] uppercase block mb-[3px] font-semibold truncate">
                      {product.category}
                    </span>
                    <h4 className="text-[13px] sm:text-[14px] font-medium text-[#121212] line-clamp-1 mb-[4px]" title={product.title}>
                      {product.title}
                    </h4>
                    {product.fabric && (
                      <p className="text-[11px] sm:text-[12px] text-[#121212b3] line-clamp-1 mb-[4px]">
                        {product.fabric}
                      </p>
                    )}
                  </div>

                  <div className="pt-[6px] border-t border-[#1212121a] flex items-center justify-between">
                    <div className="flex flex-wrap items-baseline gap-[6px]">
                      <span className="text-[13px] sm:text-[15px] font-bold text-[#121212]">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[11px] sm:text-[12px] text-[#121212b3] line-through">
                          Rs. {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
