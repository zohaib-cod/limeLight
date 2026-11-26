import React, { useState, useEffect } from 'react';
import { Eye, ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { NEW_ARRIVALS } from '../data/products';

export default function NewArrivalsSection({ onQuickView, onAddToCart, onToggleWishlist, wishlist }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/new-arrivals')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('New arrivals fetch failed');
      })
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.warn('Using default new arrivals:', err);
        setProducts(NEW_ARRIVALS);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = activeTab === 'ALL'
    ? products
    : products.filter((p) => p.category?.toUpperCase().includes(activeTab));

  return (
    <section className="shopify-section section py-[50px] bg-transparent border-t border-[#1212121a] dark:border-white/10" id="new-arrivals">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        {/* Section Heading */}
        <div className="text-center mb-[25px]">
          <h2 className="text-[13px] font-normal text-[#121212] dark:text-gray-300 tracking-[0.15em] uppercase mb-[6px] flex items-center justify-center gap-[6px]">
            <Sparkles size={14} className="text-[#cf0c1d]" />
            <span>JUST DROPPED IN STORES & ONLINE</span>
          </h2>
          <h3 className="text-[20px] font-bold text-[#121212] dark:text-white tracking-wide">
            NEW ARRIVALS
          </h3>
          <div className="w-[50px] h-[2px] bg-[#121212] dark:bg-white/40 mx-auto mt-[10px]" />
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center items-center gap-[6px] xs:gap-[8px] sm:gap-[15px] mb-[25px] sm:mb-[30px] flex-wrap">
          {['ALL', 'UNSTITCHED', 'READY TO WEAR'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-[12px] xs:px-[14px] sm:px-[18px] py-[6px] sm:py-[8px] text-[11.5px] sm:text-[13px] tracking-wider uppercase transition-all rounded-[3px] cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#121212] text-white font-medium shadow-sm dark:bg-white dark:text-black'
                  : 'bg-[#f3f3f3] text-[#121212] hover:bg-gray-200 dark:bg-[#222222] dark:text-gray-300 dark:hover:bg-[#2c2c2c]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[8px] xs:gap-[12px] sm:gap-[20px]">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] rounded-[6px] bg-gray-100 dark:bg-[#1f1f1f] animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-[40px] text-[#121212bf] dark:text-gray-400 border border-dashed border-[#1212121a] dark:border-white/10 rounded-[6px]">
            <p className="text-[14px]">No items currently listed under New Arrivals{activeTab !== 'ALL' ? ` (${activeTab})` : ''}.</p>
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[8px] xs:gap-[12px] sm:gap-[20px]">
          {filteredProducts.map((product) => {
            const pid = product.id || product._id;
            const isWishlisted = wishlist.includes(pid);
            return (
              <div
                key={pid}
                className="card flex flex-col overflow-hidden shadow-soft hover:shadow-modal transition-all duration-300 group bg-white dark:bg-[#181818] border border-[#1212121a] dark:border-white/10 rounded-[6px]"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#ffffff] dark:bg-[#222222]">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468254/limelight/products/wxmrzxlgmlg2tetiiguu.jpg';
                    }}
                  />

                  {/* Badge (e.g. JUST ARRIVED, TRENDING, NEW IN, SELLING FAST) */}
                  {product.badge && (
                    <span className="absolute top-[8px] sm:top-[10px] left-[8px] sm:left-[10px] bg-[#cf0c1d] text-white text-[9.5px] sm:text-[10px] font-bold px-[6px] sm:px-[8px] py-[2px] sm:py-[3px] rounded-[3px] tracking-wider shadow-xs">
                      {product.badge}
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={() => onToggleWishlist(pid)}
                    className="absolute top-[8px] sm:top-[10px] right-[8px] sm:right-[10px] w-[30px] sm:w-[34px] h-[30px] sm:h-[34px] bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#121212] dark:text-white hover:text-[#cf0c1d] hover:bg-white dark:hover:bg-[#252525] shadow-sm transition-colors cursor-pointer"
                    aria-label="Wishlist"
                  >
                    <Heart size={16} className={isWishlisted ? "fill-[#cf0c1d] text-[#cf0c1d]" : ""} />
                  </button>

                  {/* Hover Quick Actions */}
                  <div className="absolute inset-x-0 bottom-0 p-[8px] sm:p-[10px] bg-gradient-to-t from-black/60 to-transparent flex gap-[6px] sm:gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onQuickView({ ...product, id: pid })}
                      className="flex-1 bg-white dark:bg-[#252525] text-[#121212] dark:text-white text-[12px] sm:text-[13px] py-[6px] sm:py-[8px] font-medium flex items-center justify-center gap-[4px] hover:bg-[#f3f3f3] dark:hover:bg-[#333] transition-colors rounded-[3px] cursor-pointer"
                    >
                      <Eye size={14} />
                      <span className="hidden xs:inline">Quick View</span>
                    </button>
                    <button
                      onClick={() => onAddToCart({ ...product, id: pid })}
                      className="bg-[#121212] dark:bg-white text-white dark:text-black p-[6px] sm:p-[8px] hover:bg-[#333333] dark:hover:bg-gray-200 transition-colors rounded-[3px] cursor-pointer shrink-0"
                      title="Add to Bag"
                    >
                      <ShoppingBag size={15} />
                    </button>
                  </div>
                </div>

                <div className="p-[8px] xs:p-[10px] sm:p-[14px] flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9.5px] sm:text-[11px] tracking-widest text-[#121212bf] dark:text-gray-400 uppercase block mb-[2px] sm:mb-[3px] font-semibold truncate">
                      {product.category}
                    </span>
                    <h4 className="text-[12px] xs:text-[13px] sm:text-[14px] font-medium text-[#121212] dark:text-gray-100 line-clamp-1 mb-[4px]" title={product.title}>
                      {product.title}
                    </h4>
                    {product.fabric && (
                      <p className="text-[10px] xs:text-[11px] sm:text-[12px] text-[#121212b3] dark:text-gray-400 line-clamp-1 mb-[4px]">
                        {product.fabric}
                      </p>
                    )}
                  </div>

                  <div className="pt-[6px] border-t border-[#1212121a] dark:border-white/10 flex items-center justify-between">
                    <div className="flex flex-wrap items-baseline gap-[4px] sm:gap-[6px]">
                      <span className="text-[12px] xs:text-[13px] sm:text-[15px] font-bold text-[#121212] dark:text-white">
                        Rs. {Number(product.price || 0).toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] xs:text-[11px] sm:text-[12px] text-[#121212b3] dark:text-gray-400 line-through">
                          Rs. {Number(product.originalPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
