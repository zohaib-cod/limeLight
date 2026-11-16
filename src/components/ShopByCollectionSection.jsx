import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { COLLECTIONS_DATA } from '../data/products';

export default function ShopByCollectionSection({ onSelectCollection }) {
  const [collections, setCollections] = useState(COLLECTIONS_DATA);

  useEffect(() => {
    fetch('/api/collections')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCollections(data);
        }
      })
      .catch(err => {
        console.warn('Using default curated collections:', err);
      });
  }, []);

  return (
    <section className="shopify-section section py-[50px] bg-transparent border-t border-[#1212121a] dark:border-white/10" id="collections">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        {/* Section Heading */}
        <div className="text-center mb-[30px]">
          <h2 className="text-[13px] font-normal text-[#121212] dark:text-gray-300 tracking-[0.15em] uppercase mb-[6px]">
            CURATED EDITIONS
          </h2>
          <h3 className="text-[20px] font-bold text-[#121212] dark:text-white tracking-wide">
            SHOP BY COLLECTION
          </h3>
          <div className="w-[50px] h-[2px] bg-[#121212] dark:bg-white/40 mx-auto mt-[10px]" />
        </div>

        {/* Dynamic Curated Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[15px] sm:gap-[25px]">
          {collections.map((col, idx) => (
            <a
              key={col.id || idx}
              href={col.linkUrl || '#collections'}
              onClick={(e) => {
                if (col.linkUrl?.startsWith('#')) {
                  // smooth scroll
                  const target = document.querySelector(col.linkUrl);
                  if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }
                onSelectCollection?.(col.title);
              }}
              className="group relative cursor-pointer overflow-hidden rounded-[6px] shadow-soft hover:shadow-modal transition-all duration-300 bg-white dark:bg-[#181818] border border-transparent dark:border-white/10 block"
            >
              {/* Image Frame */}
              <div className="aspect-[4/5] overflow-hidden bg-[#f3f3f3] dark:bg-[#222222]">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = COLLECTIONS_DATA[idx % COLLECTIONS_DATA.length]?.image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              {/* Gradient Scrim & Copy */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-[16px] sm:p-[20px] text-white">
                {col.count && (
                  <span className="text-[10px] sm:text-[11px] text-white/80 tracking-[0.15em] uppercase block mb-[4px] font-medium">
                    {col.count}
                  </span>
                )}
                <h4 className="text-[17px] sm:text-[20px] font-bold tracking-wide uppercase mb-[4px] leading-tight">
                  {col.title}
                </h4>
                {col.tagline && (
                  <p className="text-[12px] sm:text-[13px] text-white/85 line-clamp-1 mb-[10px] sm:mb-[12px] font-light">
                    {col.tagline}
                  </p>
                )}

                <div className="flex items-center gap-[6px] text-[12px] sm:text-[13px] font-medium tracking-wider text-white group-hover:text-white/90">
                  <span className="border-b border-white/60 pb-[1px]">
                    {col.linkText || 'EXPLORE NOW'}
                  </span>
                  <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
