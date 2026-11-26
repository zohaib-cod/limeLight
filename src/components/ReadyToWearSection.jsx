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
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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

    // Fetch dynamic RTW products (even if empty [])
    fetch('/api/products?category=Ready%20To%20Wear')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('RTW fetch failed');
      })
      .then(data => { setProducts(Array.isArray(data) ? data : []); })
      .catch(e => {
        console.warn('Using default RTW products:', e);
        setProducts(RTW_PRODUCTS);
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleSelectSize = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  return (
    <section className="shopify-section section py-[50px] bg-transparent border-t border-[#1212121a] dark:border-white/10" id="ready-to-wear">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        {/* Dual Visual Feature Banners for RTW (Dynamic via Backend API) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px] sm:gap-[20px] mb-[35px]">
          {/* Banner 1: Pret Casuals / Daily Chic & Kurtis */}
          {pretBanner.isActive !== false && (
            <div className="relative rounded-[8px] overflow-hidden shadow-soft group h-[240px] sm:h-[340px]">
              <img
                src={pretBanner.imageUrl || ASSETS.rtwMain}
                alt={pretBanner.title || "Limelight Ready to Wear Pret"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ASSETS.rtwMain;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-[18px] sm:p-[26px] z-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[12px]">
                  {/* Left content */}
                  <div className="max-w-full sm:max-w-[70%]">
                    {pretBanner.badge && (
                      <span className="text-white/90 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-medium block mb-[4px]">
                        {pretBanner.badge}
                      </span>
                    )}
                    <h3 className="text-white text-[18px] sm:text-[22px] font-bold mb-[6px] leading-tight">
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

                  {/* Right CTA */}
                  {pretBanner.secondaryBtnText && (
                    <div className="shrink-0">
                      <a
                        href={pretBanner.secondaryBtnLink || '#rtw-grid'}
                        className="border border-white/70 hover:border-white text-white hover:bg-white hover:text-black text-[10.5px] sm:text-[11.5px] font-semibold px-[14px] py-[6px] rounded-[2px] uppercase tracking-wider transition-colors inline-block"
                      >
                        {pretBanner.secondaryBtnText}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Banner 2: Modern Silhouettes / Western Co-Ords */}
          {coordsBanner.isActive !== false && (
            <div className="relative rounded-[8px] overflow-hidden shadow-soft group h-[240px] sm:h-[340px]">
              <img
                src={coordsBanner.imageUrl || ASSETS.coordsBanner}
                alt={coordsBanner.title || "Limelight Western Co-Ords"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ASSETS.coordsBanner;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-[18px] sm:p-[26px] z-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[12px]">
                  {/* Left content */}
                  <div className="max-w-full sm:max-w-[70%]">
                    {coordsBanner.badge && (
                      <span className="text-white/90 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-medium block mb-[4px]">
                        {coordsBanner.badge}
                      </span>
                    )}
                    <h3 className="text-white text-[18px] sm:text-[22px] font-bold mb-[6px] leading-tight">
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

                  {coordsBanner.subtitle && (
                    <div className="shrink-0 text-white/80 text-[10px] sm:text-[11.5px] font-bold tracking-[0.2em] uppercase bg-black/40 px-[10px] py-[4px] rounded-[3px] border border-white/10">
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
          <h2 className="text-[13px] font-normal text-[#121212] dark:text-gray-300 tracking-[0.15em] uppercase mb-[6px]">
            EFFORTLESS DAILY STYLING
          </h2>
          <h3 className="text-[20px] font-bold text-[#121212] dark:text-white tracking-wide">
            READY TO WEAR
          </h3>
          <div className="w-[50px] h-[2px] bg-[#121212] dark:bg-white/40 mx-auto mt-[10px]" />
        </div>

        {/* RTW Product Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[8px] xs:gap-[12px] sm:gap-[24px]">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] rounded-[6px] bg-gray-100 dark:bg-[#1f1f1f] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-[40px] text-[#121212bf] dark:text-gray-400 border border-dashed border-[#1212121a] dark:border-white/10 rounded-[6px]">
            <p className="text-[14px]">No Ready To Wear products currently published.</p>
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[8px] xs:gap-[12px] sm:gap-[24px]">
          {products.map((product) => {
            const pid = product.id || product._id;
            const isWishlisted = wishlist.includes(pid);
            const chosenSize = selectedSizes[pid] || product.sizes?.[0];

            return (
              <div
                key={pid}
                className="group flex flex-col bg-white dark:bg-[#181818] border border-[#1212121a] dark:border-white/10 rounded-[6px] overflow-hidden shadow-soft hover:shadow-modal transition-all duration-300"
              >
                {/* Image & Quick Action */}
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

                  {/* Quick View Button */}
                  <div className="absolute inset-x-0 bottom-0 p-[8px] sm:p-[10px] bg-gradient-to-t from-black/60 to-transparent flex gap-[6px] sm:gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onQuickView({ ...product, id: pid, selectedSize: chosenSize })}
                      className="flex-1 bg-white dark:bg-[#252525] text-[#121212] dark:text-white text-[12px] sm:text-[13px] py-[6px] sm:py-[8px] font-medium flex items-center justify-center gap-[4px] hover:bg-[#f3f3f3] dark:hover:bg-[#333] transition-colors rounded-[3px] cursor-pointer"
                    >
                      <Eye size={14} />
                      <span className="hidden xs:inline">Quick View</span>
                    </button>
                    <button
                      onClick={() => onAddToCart({ ...product, id: pid, selectedSize: chosenSize })}
                      className="bg-[#121212] dark:bg-white text-white dark:text-black p-[6px] sm:p-[8px] hover:bg-[#333333] dark:hover:bg-gray-200 transition-colors rounded-[3px] cursor-pointer shrink-0"
                      title="Add to Bag"
                    >
                      <ShoppingBag size={15} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-[8px] xs:p-[10px] sm:p-[15px] flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9.5px] sm:text-[11px] tracking-widest text-[#121212bf] dark:text-gray-400 uppercase block mb-[2px] sm:mb-[4px] truncate">
                      {product.subCategory} • {product.fabric}
                    </span>
                    <h4 className="text-[12px] xs:text-[13px] sm:text-[15px] font-medium text-[#121212] dark:text-gray-100 line-clamp-1 mb-[6px] sm:mb-[8px]">
                      {product.title}
                    </h4>

                    {/* Sizing Chips */}
                    {product.sizes && (
                      <div className="flex items-center gap-[4px] sm:gap-[6px] mb-[8px] sm:mb-[10px] flex-wrap">
                        <span className="text-[10px] sm:text-[11px] text-[#121212bf] dark:text-gray-400">Size:</span>
                        {product.sizes.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSelectSize(pid, s)}
                            className={`min-w-[24px] sm:min-w-[26px] h-[20px] sm:h-[22px] px-[4px] text-[10px] sm:text-[11px] rounded-[3px] border transition-colors cursor-pointer ${
                              chosenSize === s
                                ? 'bg-[#121212] text-white border-[#121212] dark:bg-white dark:text-black dark:border-white'
                                : 'bg-[#f3f3f3] text-[#121212] border-transparent hover:border-[#121212] dark:bg-[#252525] dark:text-gray-300 dark:border-white/10'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-[6px] sm:pt-[8px] border-t border-[#1212121a] dark:border-white/10 flex items-center justify-between">
                    <div className="flex flex-wrap items-baseline gap-[4px] sm:gap-[8px]">
                      <span className="text-[12px] xs:text-[13px] sm:text-[16px] font-bold text-[#121212] dark:text-white">
                        Rs. {Number(product.price || 0).toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] xs:text-[11px] sm:text-[13px] text-[#121212b3] dark:text-gray-400 line-through">
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

