import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye } from 'lucide-react';

export default function FragrancesSection({ onQuickView, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?category=Fragrances')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="shopify-section section py-[50px] bg-transparent border-t border-[#1212121a] dark:border-white/10" id="fragrances">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        <div className="text-center mb-[30px]" id="fragrance-grid">
          <h2 className="text-[13px] font-normal text-[#121212] dark:text-gray-300 tracking-[0.15em] uppercase mb-[6px]">
            OLFACTORY ARTISTRY
          </h2>
          <h3 className="text-[20px] font-bold text-[#121212] dark:text-white tracking-wide">
            FRAGRANCES
          </h3>
          <div className="w-[50px] h-[2px] bg-[#121212] dark:bg-white/40 mx-auto mt-[10px]" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-[15px] sm:gap-[24px]">
          {products.map((item) => {
            const pid = item.id || item._id;
            return (
              <div
                key={pid}
                className="group flex flex-col bg-white dark:bg-[#181818] border border-[#1212121a] dark:border-white/10 rounded-[6px] overflow-hidden shadow-soft hover:shadow-modal transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-[#f3f3f3] dark:bg-[#222222] p-[20px] flex items-center justify-center">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title || item.name}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  )}

                  {item.discount && (
                    <span className="absolute top-[10px] left-[10px] bg-[#121212] text-white text-[10px] font-bold px-[7px] py-[3px] rounded-[3px] tracking-wider">
                      {item.discount}
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-[10px] bg-gradient-to-t from-black/60 to-transparent flex gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onQuickView({ ...item, id: pid })}
                      className="flex-1 bg-white text-[#121212] text-[13px] py-[8px] font-medium flex items-center justify-center gap-[5px] hover:bg-[#f3f3f3] transition-colors rounded-[3px] cursor-pointer"
                    >
                      <Eye size={15} />
                      <span>Quick View</span>
                    </button>
                    <button
                      onClick={() => onAddToCart({ ...item, id: pid })}
                      className="bg-[#121212] text-white p-[8px] hover:bg-[#333333] transition-colors rounded-[3px] cursor-pointer"
                      title="Add to Bag"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-[15px] flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-[#121212bf] dark:text-gray-400 uppercase tracking-wider block mb-[2px]">
                      {item.subCategory || item.fabric}
                    </span>
                    <h4 className="text-[15px] font-semibold text-[#121212] dark:text-white mb-[4px] leading-tight">
                      {item.title || item.name}
                    </h4>
                  </div>

                  <div className="pt-[8px] border-t border-[#1212121a] dark:border-white/10 flex items-center justify-between">
                    <span className="text-[16px] font-bold text-[#121212] dark:text-white">
                      Rs. {Number(item.price || 0).toLocaleString()}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[13px] text-[#121212b3] dark:text-gray-400 line-through">
                        Rs. {Number(item.originalPrice).toLocaleString()}
                      </span>
                    )}
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
