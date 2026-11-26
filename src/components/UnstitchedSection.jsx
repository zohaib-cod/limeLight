import React, { useState, useEffect } from 'react';
import { Eye, ShoppingBag, Heart } from 'lucide-react';

export default function UnstitchedSection({ onQuickView, onAddToCart, onToggleWishlist, wishlist }) {
  const [banner, setBanner] = useState(null);
  const [wideBanner, setWideBanner] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetch('/api/banners/unstitched')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && typeof data === 'object') setBanner(data);
      })
      .catch(err => {
        console.warn('Could not load unstitched banner:', err);
      });

    fetch('/api/banners/unstitched-wide')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && typeof data === 'object') setWideBanner(data);
      })
      .catch(err => {
        console.warn('Could not load wide banner:', err);
      });

    fetch('/api/products?category=Unstitched')
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.warn('Failed to fetch unstitched products:', err);
        setProducts([]);
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  }, []);

  if (!loadingProducts && !banner && !wideBanner && products.length === 0) {
    return null;
  }

  return (
    <section className="shopify-section section py-[50px] bg-transparent" id="unstitched">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        {banner && banner.isActive !== false && banner.imageUrl && (
          <div className="mb-[35px] overflow-hidden rounded-[8px] shadow-soft relative group">
            <img
              src={banner.imageUrl}
              alt={banner.title || "Unstitched Collection"}
              className="w-full h-[240px] sm:h-[360px] lg:h-[430px] object-cover transition-transform duration-700 group-hover:scale-[1.01]"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {/* Visual Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex items-center p-[20px] sm:p-[45px] z-10">
              <div className="max-w-[550px] relative z-10">
                {/* Badge */}
                {banner.badge && (
                  <span className="inline-block text-[10.5px] sm:text-[12px] font-medium text-white/90 tracking-[0.2em] uppercase mb-[6px] drop-shadow-sm bg-black/40 px-[8px] py-[3px] rounded-[3px] border border-white/10">
                    {banner.badge}
                  </span>
                )}

                {/* Title / Headline */}
                <h3 className="text-[22px] sm:text-[32px] lg:text-[38px] font-bold text-white mb-[8px] leading-tight drop-shadow-md">
                  {banner.title}
                </h3>

                {/* Subtitle */}
                {banner.subtitle && (
                  <p className="text-white/90 text-[12.5px] sm:text-[14px] leading-[20px] sm:leading-[24px] mb-[8px] hidden sm:block drop-shadow-sm max-w-[480px]">
                    {banner.subtitle}
                  </p>
                )}

                {/* Cursive script text */}
                {banner.scriptText && (
                  <div className="font-serif italic text-[#cec72e] text-[16px] sm:text-[22px] mb-[14px] tracking-wide drop-shadow-sm">
                    {banner.scriptText}
                  </div>
                )}

                {/* Button */}
                <a
                  href={banner.buttonLink || '#unstitched-grid'}
                  className="button-style-1 bg-[#121212] text-white hover:bg-black inline-flex items-center text-[12px] sm:text-[13px] font-semibold px-[20px] py-[9px] rounded-[3px] shadow-sm tracking-wider uppercase transition-all duration-200"
                >
                  {banner.buttonText || 'EXPLORE DESIGNS'}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Section Heading */}
        <div className="text-center mb-[30px]" id="unstitched-grid">
          <h2 className="text-[13px] font-normal text-[#121212] dark:text-gray-300 tracking-[0.15em] uppercase mb-[6px]">
            PREMIUM WINTER UNSTITCHED
          </h2>
          <h3 className="text-[20px] font-bold text-[#121212] dark:text-white tracking-wide">
            UNSTITCHED
          </h3>
          <div className="w-[50px] h-[2px] bg-[#121212] dark:bg-white/40 mx-auto mt-[10px]" />
        </div>

        {/* Product Cards Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[8px] xs:gap-[12px] sm:gap-[20px]">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] rounded-[6px] bg-gray-100 dark:bg-[#1f1f1f] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-[40px] text-[#121212bf] dark:text-gray-400 border border-dashed border-[#1212121a] dark:border-white/10 rounded-[6px]">
            <p className="text-[14px]">No unstitched products currently published.</p>
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[8px] xs:gap-[12px] sm:gap-[20px]">
          {products.map((product) => {
            const pid = product.id || product._id;
            const isWishlisted = wishlist.includes(pid);
            return (
              <div
                key={pid}
                className="group flex flex-col bg-white dark:bg-[#181818] border border-[#1212121a] dark:border-white/10 rounded-[6px] overflow-hidden shadow-soft hover:shadow-modal transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f3f3] dark:bg-[#222222]">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Discount Badge */}
                  {product.discount && (
                    <div className="absolute top-[8px] sm:top-[10px] left-[8px] sm:left-[10px] bg-[#cf0c1d] text-white text-[10px] sm:text-[11px] font-bold px-[6px] sm:px-[8px] py-[2px] sm:py-[3px] rounded-[3px] tracking-wider">
                      {product.discount}
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={() => onToggleWishlist(pid)}
                    className="absolute top-[8px] sm:top-[10px] right-[8px] sm:right-[10px] w-[30px] sm:w-[34px] h-[30px] sm:h-[34px] bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#121212] dark:text-white hover:text-[#cf0c1d] hover:bg-white dark:hover:bg-[#252525] shadow-sm transition-colors cursor-pointer"
                    aria-label="Wishlist"
                  >
                    <Heart
                      size={16}
                      className={isWishlisted ? "fill-[#cf0c1d] text-[#cf0c1d]" : ""}
                    />
                  </button>

                  {/* Quick View & Add to Cart Overlay on Hover */}
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
                      title="Add to Cart"
                    >
                      <ShoppingBag size={15} />
                    </button>
                  </div>
                </div>

                {/* Product Meta */}
                <div className="p-[8px] xs:p-[10px] sm:p-[14px] flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9.5px] sm:text-[11px] tracking-widest text-[#121212bf] dark:text-gray-400 uppercase block mb-[2px] sm:mb-[3px] truncate">
                      {product.subCategory} • {product.fabric}
                    </span>
                    <h4 className="text-[12px] xs:text-[13px] sm:text-[14px] font-medium text-[#121212] dark:text-gray-100 line-clamp-1 mb-[4px]">
                      {product.title}
                    </h4>
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

        {/* Mid-section Wide Image Highlight (Dynamic via Backend API) */}
        {wideBanner && wideBanner.isActive !== false && wideBanner.imageUrl && (
          <div className="mt-[40px] overflow-hidden rounded-[8px] shadow-soft relative group">
            <img
              src={wideBanner.imageUrl}
              alt={wideBanner.title || "Unstitched Embroidered"}
              className="w-full h-[220px] sm:h-[300px] lg:h-[360px] object-cover transition-transform duration-700 group-hover:scale-[1.01]"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {/* Visual Subtle Dark Overlay */}
            <div className="absolute inset-0 bg-black/45 flex flex-col md:flex-row items-center justify-between p-[20px] sm:p-[40px] lg:p-[50px] gap-[20px]">
              {/* Content */}
              <div className="text-center md:text-left max-w-[550px] z-10">
                {wideBanner.badge && (
                  <span className="text-white/90 text-[10px] sm:text-[11.5px] tracking-[0.25em] uppercase font-medium block mb-[6px] drop-shadow-sm">
                    {wideBanner.badge}
                  </span>
                )}
                <h3 className="text-white text-[18px] sm:text-[26px] lg:text-[30px] font-bold mb-[12px] uppercase tracking-wide drop-shadow-md leading-tight">
                  {wideBanner.title}
                </h3>
                {wideBanner.buttonText && (
                  <a
                    href={wideBanner.buttonLink || '#unstitched'}
                    className="button-primary bg-[#121212] text-white hover:bg-black inline-block text-[12px] sm:text-[13px] font-semibold px-[20px] py-[9px] rounded-[3px] shadow-sm uppercase tracking-wider transition-all duration-200"
                  >
                    {wideBanner.buttonText}
                  </a>
                )}
              </div>

              {/* Secondary CTA */}
              {wideBanner.secondaryBtnText && (
                <div className="z-10 shrink-0">
                  <a
                    href={wideBanner.secondaryBtnLink || '#unstitched'}
                    className="border border-white/80 hover:border-white text-white hover:bg-white hover:text-[#121212] text-[11px] lg:text-[12px] font-semibold px-[20px] py-[9px] rounded-[2px] tracking-widest uppercase transition-all duration-200 inline-block"
                  >
                    {wideBanner.secondaryBtnText}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

