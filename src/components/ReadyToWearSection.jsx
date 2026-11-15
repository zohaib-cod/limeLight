import React, { useState, useEffect } from 'react';
import { Eye, ShoppingBag, Heart } from 'lucide-react';
import { ASSETS, RTW_PRODUCTS } from '../data/products';

export default function ReadyToWearSection({ onQuickView, onAddToCart, onToggleWishlist, wishlist }) {
  const [selectedSizes, setSelectedSizes] = useState({});
  const [pretBanner, setPretBanner] = useState({
    id: "rtw-pret",
    badge: "PRET CASUALS",
    watermark: "Ready to",
    title: "DAILY CHIC & KURTIS",
    buttonText: "SHOP PRET CASUALS →",
    buttonLink: "#rtw-grid",
    secondaryBtnText: "SHOP NOW",
    secondaryBtnLink: "#rtw-grid",
    imageUrl: ASSETS.rtwMain,
    isActive: true
  });
  const [coordsBanner, setCoordsBanner] = useState({
    id: "rtw-coords",
    badge: "MODERN SILHOUETTES",
    watermark: "CO-ORDS",
    title: "WESTERN CO-ORDS",
    subtitle: "MADE TO MATCH",
    buttonText: "DISCOVER CO-ORDS →",
    buttonLink: "#rtw-grid",
    imageUrl: ASSETS.coordsBanner,
    isActive: true
  });
  const [products, setProducts] = useState(RTW_PRODUCTS);

  useEffect(() => {
    // Fetch RTW Pret Banner
    fetch('/api/banners/rtw-pret')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setPretBanner(data); })
      .catch(e => console.warn('Using default RTW Pret banner:', e));

    // Fetch RTW Coords Banner
    fetch('/api/banners/rtw-coords')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setCoordsBanner(data); })
      .catch(e => console.warn('Using default RTW Coords banner:', e));

    // Fetch dynamic RTW products
    fetch('/api/products?category=Ready%20To%20Wear')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setProducts(data); })
      .catch(e => console.warn('Using default RTW products:', e));
  }, []);

  const handleSelectSize = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  return (
    <section className="shopify-section section py-[50px] bg-transparent border-t border-[#1212121a]" id="ready-to-wear">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        {/* Dual Visual Feature Banners for RTW (Dynamic via Backend API) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mb-[35px]">
          {/* Banner 1: Pret Casuals / Daily Chic & Kurtis */}
          {pretBanner.isActive !== false && (
            <div className="relative rounded-[8px] overflow-hidden shadow-soft group h-[260px] sm:h-[340px]">
              <img
                src={pretBanner.imageUrl || ASSETS.rtwMain}
                alt={pretBanner.title || "Limelight Ready to Wear Pret"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ASSETS.rtwMain;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end justify-between p-[22px] sm:p-[28px] z-10">
                {/* Left content */}
                <div className="max-w-[65%]">
                  {pretBanner.badge && (
                    <span className="text-white/90 text-[11px] tracking-[0.2em] uppercase font-medium block mb-[4px]">
                      {pretBanner.badge}
                    </span>
                  )}
                  <h3 className="text-white text-[20px] sm:text-[23px] font-bold mb-[8px] leading-tight">
                    {pretBanner.title}
                  </h3>
                  {pretBanner.buttonText && (
                    <a
                      href={pretBanner.buttonLink || '#rtw-grid'}
                      className="button-style-2 text-white text-[12px] sm:text-[13px] hover:underline font-normal inline-flex"
                    >
                      {pretBanner.buttonText}
                    </a>
                  )}
                </div>

                {/* Right content: Stylized "Ready to" watermark & outlined button */}
                <div className="flex flex-col items-end text-right select-none pb-[4px]">
                  {pretBanner.watermark && (
                    <div className="font-serif italic text-white/75 text-[30px] sm:text-[42px] leading-none mb-[8px] drop-shadow-sm">
                      {pretBanner.watermark}
                    </div>
                  )}
                  {pretBanner.secondaryBtnText && (
                    <a
                      href={pretBanner.secondaryBtnLink || '#rtw-grid'}
                      className="border border-white/60 hover:border-white text-white hover:bg-white hover:text-black text-[10px] sm:text-[11px] font-semibold px-[14px] py-[6px] rounded-[2px] uppercase tracking-wider transition-colors inline-block"
                    >
                      {pretBanner.secondaryBtnText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Banner 2: Modern Silhouettes / Western Co-Ords */}
          {coordsBanner.isActive !== false && (
            <div className="relative rounded-[8px] overflow-hidden shadow-soft group h-[260px] sm:h-[340px]">
              <img
                src={coordsBanner.imageUrl || ASSETS.coordsBanner}
                alt={coordsBanner.title || "Limelight Western Co-Ords"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ASSETS.coordsBanner;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end justify-between p-[22px] sm:p-[28px] z-10">
                {/* Left content */}
                <div className="max-w-[60%]">
                  {coordsBanner.badge && (
                    <span className="text-white/90 text-[11px] tracking-[0.2em] uppercase font-medium block mb-[4px]">
                      {coordsBanner.badge}
                    </span>
                  )}
                  <h3 className="text-white text-[20px] sm:text-[23px] font-bold mb-[8px] leading-tight">
                    {coordsBanner.title}
                  </h3>
                  {coordsBanner.buttonText && (
                    <a
                      href={coordsBanner.buttonLink || '#rtw-grid'}
                      className="button-style-2 text-white text-[12px] sm:text-[13px] hover:underline font-normal inline-flex"
                    >
                      {coordsBanner.buttonText}
                    </a>
                  )}
                </div>

                {/* Right content: Stylized "CO-ORDS" and "MADE TO MATCH" typography */}
                <div className="flex flex-col items-end text-right select-none pb-[4px]">
                  {coordsBanner.watermark && (
                    <div className="font-extrabold text-[#0f3b6a] text-[34px] sm:text-[46px] leading-none tracking-tight drop-shadow-xs">
                      {coordsBanner.watermark}
                    </div>
                  )}
                  {coordsBanner.subtitle && (
                    <div className="text-[#2563eb] text-[10px] sm:text-[12px] font-bold tracking-[0.22em] uppercase mt-[3px]">
                      {coordsBanner.subtitle}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section Heading */}
        <div className="text-center mb-[30px]" id="rtw-grid">
          <h2 className="text-[13px] font-normal text-[#121212] tracking-[0.15em] uppercase mb-[6px]">
            EFFORTLESS DAILY STYLING
          </h2>
          <h3 className="text-[20px] font-bold text-[#121212] tracking-wide">
            READY TO WEAR
          </h3>
          <div className="w-[50px] h-[2px] bg-[#121212] mx-auto mt-[10px]" />
        </div>

        {/* RTW Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[15px] sm:gap-[24px]">
          {products.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            const chosenSize = selectedSizes[product.id] || product.sizes?.[0];

            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white border border-[#1212121a] rounded-[6px] overflow-hidden shadow-soft hover:shadow-modal transition-all duration-300"
              >
                {/* Image & Quick Action */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f3f3]">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Discount Badge */}
                  {product.discount && (
                    <div className="absolute top-[10px] left-[10px] bg-[#cf0c1d] text-white text-[11px] font-bold px-[8px] py-[3px] rounded-[3px] tracking-wider">
                      {product.discount}
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className="absolute top-[10px] right-[10px] w-[34px] h-[34px] bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#121212] hover:text-[#cf0c1d] hover:bg-white shadow-sm transition-colors"
                    aria-label="Wishlist"
                  >
                    <Heart
                      size={17}
                      className={isWishlisted ? "fill-[#cf0c1d] text-[#cf0c1d]" : ""}
                    />
                  </button>

                  {/* Quick View Button */}
                  <div className="absolute inset-x-0 bottom-0 p-[10px] bg-gradient-to-t from-black/60 to-transparent flex gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onQuickView({ ...product, selectedSize: chosenSize })}
                      className="flex-1 bg-white text-[#121212] text-[13px] py-[8px] font-medium flex items-center justify-center gap-[5px] hover:bg-[#f3f3f3] transition-colors rounded-[3px]"
                    >
                      <Eye size={15} />
                      <span>Quick View</span>
                    </button>
                    <button
                      onClick={() => onAddToCart({ ...product, selectedSize: chosenSize })}
                      className="bg-[#121212] text-white p-[8px] hover:bg-[#333333] transition-colors rounded-[3px]"
                      title="Add to Bag"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-[15px] flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] tracking-widest text-[#121212bf] uppercase block mb-[4px]">
                      {product.subCategory} • {product.fabric}
                    </span>
                    <h4 className="text-[15px] font-medium text-[#121212] line-clamp-1 mb-[8px]">
                      {product.title}
                    </h4>

                    {/* Sizing Chips */}
                    {product.sizes && (
                      <div className="flex items-center gap-[6px] mb-[10px]">
                        <span className="text-[11px] text-[#121212bf]">Size:</span>
                        {product.sizes.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSelectSize(product.id, s)}
                            className={`w-[26px] h-[22px] text-[11px] rounded-[3px] border transition-colors ${
                              chosenSize === s
                                ? 'bg-[#121212] text-white border-[#121212]'
                                : 'bg-[#f3f3f3] text-[#121212] border-transparent hover:border-[#121212]'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-[8px] border-t border-[#1212121a] flex items-center justify-between">
                    <div className="flex items-baseline gap-[8px]">
                      <span className="text-[16px] font-bold text-[#121212]">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[13px] text-[#121212b3] line-through">
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

