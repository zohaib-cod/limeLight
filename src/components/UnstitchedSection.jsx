import React, { useState, useEffect } from 'react';
import { Eye, ShoppingBag, Heart } from 'lucide-react';
import { ASSETS, UNSTITCHED_PRODUCTS } from '../data/products';

export default function UnstitchedSection({ onQuickView, onAddToCart, onToggleWishlist, wishlist }) {
  const [banner, setBanner] = useState({
    id: "unstitched",
    badge: "LUXURY WINTER EDIT",
    watermark: "UNSTITCHED",
    title: "UNSTITCHED FABRICS",
    subtitle: "Tailor your distinctive look with our finest unstitched velvets, warm karandi, and embroidered khaddar fabrics.",
    scriptText: "Style it your way.",
    buttonText: "EXPLORE DESIGNS",
    buttonLink: "#unstitched-grid",
    imageUrl: ASSETS.unstitchedMain,
    isActive: true
  });
  const [wideBanner, setWideBanner] = useState({
    id: "unstitched-wide",
    badge: "EMBROIDERED EMBELLISHMENTS",
    watermark: "UNSTITCHED EMBROIDERED",
    title: "SIGNATURE WINTER SHAWLS & SUITS",
    buttonText: "VIEW FULL COLLECTION",
    buttonLink: "#unstitched",
    secondaryBtnText: "SHOP NOW",
    secondaryBtnLink: "#unstitched",
    imageUrl: ASSETS.unstitchedEmbroidered,
    isActive: true
  });
  const [products, setProducts] = useState(UNSTITCHED_PRODUCTS);

  useEffect(() => {
    // Fetch top banner
    fetch('/api/banners/unstitched')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Banner not found');
      })
      .then(data => {
        if (data) setBanner(data);
      })
      .catch(err => {
        console.warn('Using default unstitched banner:', err);
      });

    // Fetch wide embroidered banner
    fetch('/api/banners/unstitched-wide')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Wide banner not found');
      })
      .then(data => {
        if (data) setWideBanner(data);
      })
      .catch(err => {
        console.warn('Using default wide banner:', err);
      });

    // Fetch dynamic products
    fetch('/api/products?category=Unstitched')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Products fetch failed');
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(err => {
        console.warn('Using default unstitched products:', err);
      });
  }, []);

  return (
    <section className="shopify-section section py-[50px] bg-transparent" id="unstitched">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        {/* Editorial Top Banner for Unstitched (Dynamic via Backend API) */}
        {banner.isActive !== false && (
          <div className="mb-[35px] overflow-hidden rounded-[8px] shadow-soft relative group">
            <img
              src={banner.imageUrl || ASSETS.unstitchedMain}
              alt={banner.title || "Limelight Unstitched Collection"}
              className="w-full h-[240px] sm:h-[360px] lg:h-[430px] object-cover transition-transform duration-700 group-hover:scale-[1.01]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = ASSETS.unstitchedMain;
              }}
            />
            {/* Visual Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent flex items-center p-[20px] sm:p-[45px] z-10">
              <div className="max-w-[550px] relative">
                {/* Watermark text behind headline */}
                {banner.watermark && (
                  <div className="absolute -top-[15px] sm:-top-[30px] -left-[5px] text-[40px] sm:text-[75px] lg:text-[95px] font-black uppercase tracking-wider text-white/20 select-none pointer-events-none leading-none z-0">
                    {banner.watermark}
                  </div>
                )}

                <div className="relative z-10">
                  {/* Badge */}
                  {banner.badge && (
                    <span className="block text-[11px] sm:text-[12px] font-medium text-white tracking-[0.22em] uppercase mb-[6px] drop-shadow-sm">
                      {banner.badge}
                    </span>
                  )}

                  {/* Title / Headline */}
                  <h3 className="text-[24px] sm:text-[34px] lg:text-[40px] font-bold text-white mb-[8px] leading-tight drop-shadow-md">
                    {banner.title}
                  </h3>

                  {/* Subtitle */}
                  {banner.subtitle && (
                    <p className="text-white/85 text-[13px] sm:text-[14px] leading-[22px] mb-[8px] hidden sm:block drop-shadow-sm max-w-[480px]">
                      {banner.subtitle}
                    </p>
                  )}

                  {/* Cursive script text (matching screenshot "Style it your way.") */}
                  {banner.scriptText && (
                    <div className="font-serif italic text-white/95 text-[18px] sm:text-[24px] mb-[16px] tracking-wide drop-shadow-sm">
                      {banner.scriptText}
                    </div>
                  )}

                  {/* Button */}
                  <a
                    href={banner.buttonLink || '#unstitched-grid'}
                    className="button-style-1 bg-[#121212] text-white hover:bg-black/90 inline-flex items-center text-[12px] sm:text-[13px] font-semibold px-[20px] py-[10px] rounded-[3px] shadow-sm tracking-wider uppercase transition-all duration-200"
                  >
                    {banner.buttonText || 'EXPLORE DESIGNS'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Heading */}
        <div className="text-center mb-[30px]" id="unstitched-grid">
          <h2 className="text-[13px] font-normal text-[#121212] tracking-[0.15em] uppercase mb-[6px]">
            PREMIUM WINTER UNSTITCHED
          </h2>
          <h3 className="text-[20px] font-bold text-[#121212] tracking-wide">
            UNSTITCHED
          </h3>
          <div className="w-[50px] h-[2px] bg-[#121212] mx-auto mt-[10px]" />
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[15px] sm:gap-[24px]">
          {products.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white border border-[#1212121a] rounded-[6px] overflow-hidden shadow-soft hover:shadow-modal transition-all duration-300"
              >
                {/* Image Container */}
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

                  {/* Quick View & Add to Cart Overlay on Hover */}
                  <div className="absolute inset-x-0 bottom-0 p-[10px] bg-gradient-to-t from-black/60 to-transparent flex gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onQuickView(product)}
                      className="flex-1 bg-white text-[#121212] text-[13px] py-[8px] font-medium flex items-center justify-center gap-[5px] hover:bg-[#f3f3f3] transition-colors rounded-[3px]"
                    >
                      <Eye size={15} />
                      <span>Quick View</span>
                    </button>
                    <button
                      onClick={() => onAddToCart(product)}
                      className="bg-[#121212] text-white p-[8px] hover:bg-[#333333] transition-colors rounded-[3px]"
                      title="Add to Cart"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>

                {/* Product Meta */}
                <div className="p-[15px] flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] tracking-widest text-[#121212bf] uppercase block mb-[4px]">
                      {product.subCategory} • {product.fabric}
                    </span>
                    <h4 className="text-[15px] font-medium text-[#121212] line-clamp-1 mb-[6px]">
                      {product.title}
                    </h4>
                  </div>

                  <div className="pt-[6px] border-t border-[#1212121a] flex items-center justify-between">
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

        {/* Mid-section Wide Image Highlight (Dynamic via Backend API) */}
        {wideBanner.isActive !== false && (
          <div className="mt-[40px] overflow-hidden rounded-[8px] shadow-soft relative group">
            <img
              src={wideBanner.imageUrl || ASSETS.unstitchedEmbroidered}
              alt={wideBanner.title || "Limelight Unstitched Embroidered"}
              className="w-full h-[220px] sm:h-[300px] lg:h-[360px] object-cover transition-transform duration-700 group-hover:scale-[1.01]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = ASSETS.unstitchedEmbroidered;
              }}
            />
            {/* Visual Subtle Dark Overlay */}
            <div className="absolute inset-0 bg-black/35 flex items-center justify-between p-[20px] sm:p-[45px] lg:p-[60px]">
              {/* Center Content */}
              <div className="mx-auto text-center max-w-[650px] z-10">
                {wideBanner.badge && (
                  <span className="text-white text-[11px] sm:text-[12px] tracking-[0.25em] uppercase font-medium block mb-[6px] drop-shadow-sm">
                    {wideBanner.badge}
                  </span>
                )}
                <h3 className="text-white text-[20px] sm:text-[28px] lg:text-[32px] font-bold mb-[15px] uppercase tracking-wide drop-shadow-md leading-tight">
                  {wideBanner.title}
                </h3>
                {wideBanner.buttonText && (
                  <a
                    href={wideBanner.buttonLink || '#unstitched'}
                    className="button-primary bg-[#121212] text-white hover:bg-black inline-block text-[12px] sm:text-[13px] font-semibold px-[24px] py-[11px] rounded-[3px] shadow-sm uppercase tracking-wider transition-all duration-200"
                  >
                    {wideBanner.buttonText}
                  </a>
                )}
              </div>

              {/* Right Side Watermark Typography & Secondary Button (Matching Screenshot) */}
              <div className="hidden md:flex flex-col items-end text-right z-10 pr-[10px] select-none pointer-events-none">
                <div className="font-serif text-white/50 text-[36px] lg:text-[52px] font-extrabold tracking-wider leading-none uppercase drop-shadow-sm">
                  UNSTITCHED
                </div>
                <div className="text-white/45 text-[18px] lg:text-[26px] font-bold tracking-[0.35em] leading-none uppercase mt-[3px] drop-shadow-sm">
                  EMBROIDERED
                </div>
                {wideBanner.secondaryBtnText && (
                  <a
                    href={wideBanner.secondaryBtnLink || '#unstitched'}
                    className="mt-[15px] border border-white/70 hover:border-white text-white hover:bg-white hover:text-[#121212] text-[11px] lg:text-[12px] font-semibold px-[20px] py-[8px] rounded-[2px] tracking-widest uppercase transition-all duration-200 inline-block pointer-events-auto"
                  >
                    {wideBanner.secondaryBtnText}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

