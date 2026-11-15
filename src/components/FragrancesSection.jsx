import React from 'react';
import { Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { ASSETS, FRAGRANCES } from '../data/products';

export default function FragrancesSection({ onQuickView, onAddToCart }) {
  return (
    <section className="shopify-section section py-[50px] bg-transparent border-t border-[#1212121a]" id="fragrances">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        {/* Fragrance Panoramic Banner (Key Image 6) */}
        <div className="mb-[35px] overflow-hidden rounded-[6px] shadow-soft relative group">
          <img
            src={ASSETS.fragranceBanner}
            alt="Limelight Fragrances Collection"
            className="w-full h-[180px] sm:h-[260px] lg:h-[330px] object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent flex items-center p-[20px] sm:p-[45px]">
            <div className="max-w-[520px]">
              <span className="text-white/90 text-[11px] tracking-[0.25em] uppercase font-medium flex items-center gap-[6px] mb-[6px]">
                <Sparkles size={14} className="text-amber-300" />
                <span>EAU DE PARFUM & BODY MISTS</span>
              </span>
              <h3 className="text-white text-[24px] sm:text-[32px] font-bold leading-tight mb-[10px]">
                SIGNATURE SCENTS
              </h3>
              <p className="text-white/80 text-[14px] leading-[22px] hidden sm:block mb-[17px]">
                Formulated by master perfumers with exotic florals, warm amber, and French vanilla notes for lasting all-day allure.
              </p>
              <a
                href="#fragrance-grid"
                className="button-style-1 bg-[#121212] text-white hover:bg-black/90 inline-flex items-center text-[13px]"
              >
                DISCOVER PERFUMES
              </a>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="text-center mb-[30px]" id="fragrance-grid">
          <h2 className="text-[13px] font-normal text-[#121212] tracking-[0.15em] uppercase mb-[6px]">
            OLFACTORY ARTISTRY
          </h2>
          <h3 className="text-[20px] font-bold text-[#121212] tracking-wide">
            FRAGRANCES
          </h3>
          <div className="w-[50px] h-[2px] bg-[#121212] mx-auto mt-[10px]" />
        </div>

        {/* Fragrance Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[15px] sm:gap-[24px]">
          {FRAGRANCES.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col bg-white border border-[#1212121a] rounded-[6px] overflow-hidden shadow-soft hover:shadow-modal transition-all duration-300"
            >
              {/* Product Photo */}
              <div className="relative aspect-square overflow-hidden bg-[#f3f3f3] p-[20px] flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Badge */}
                {item.badge && (
                  <span className="absolute top-[10px] left-[10px] bg-[#121212] text-white text-[10px] font-bold px-[7px] py-[3px] rounded-[3px] tracking-wider">
                    {item.badge}
                  </span>
                )}

                {/* Quick Add / View Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-[10px] bg-gradient-to-t from-black/60 to-transparent flex gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => onQuickView({ ...item, title: item.name, category: "Fragrances" })}
                    className="flex-1 bg-white text-[#121212] text-[13px] py-[8px] font-medium flex items-center justify-center gap-[5px] hover:bg-[#f3f3f3] transition-colors rounded-[3px]"
                  >
                    <Eye size={15} />
                    <span>View Notes</span>
                  </button>
                  <button
                    onClick={() => onAddToCart({ ...item, title: item.name, category: "Fragrances" })}
                    className="bg-[#121212] text-white p-[8px] hover:bg-[#333333] transition-colors rounded-[3px]"
                    title="Add to Bag"
                  >
                    <ShoppingBag size={16} />
                  </button>
                </div>
              </div>

              {/* Fragrance Meta */}
              <div className="p-[15px] flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-[#121212bf] uppercase tracking-wider block mb-[2px]">
                    {item.volume}
                  </span>
                  <h4 className="text-[15px] font-semibold text-[#121212] mb-[4px] leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-[12px] text-[#121212b3] line-clamp-2 leading-[18px] mb-[10px]">
                    {item.notes}
                  </p>
                </div>

                <div className="pt-[8px] border-t border-[#1212121a] flex items-center justify-between">
                  <span className="text-[16px] font-bold text-[#121212]">
                    Rs. {item.price.toLocaleString()}
                  </span>
                  {item.originalPrice && (
                    <span className="text-[13px] text-[#121212b3] line-through">
                      Rs. {item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

