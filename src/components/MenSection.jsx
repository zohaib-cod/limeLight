import React from 'react';
import { Eye, ShoppingBag, Heart } from 'lucide-react';
import { MEN_PRODUCTS } from '../data/products';

export default function MenSection({ onQuickView, onAddToCart, onToggleWishlist, wishlist }) {
  return (
    <section className="shopify-section section py-[50px] bg-transparent border-t border-[#1212121a] dark:border-white/10" id="men">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        {/* Section Heading */}
        <div className="text-center mb-[30px]">
          <h2 className="text-[13px] font-normal text-[#121212] dark:text-gray-300 tracking-[0.15em] uppercase mb-[6px]">
            SARTORIAL TRADITION & FINESSE
          </h2>
          <h3 className="text-[20px] font-bold text-[#121212] dark:text-white tracking-wide">
            MEN
          </h3>
          <div className="w-[50px] h-[2px] bg-[#121212] dark:bg-white/40 mx-auto mt-[10px]" />
        </div>

        {/* Feature Split Banner for Men */}
        <div className="mb-[30px] sm:mb-[35px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[12px] sm:gap-[20px]">
          <div className="relative rounded-[6px] overflow-hidden shadow-soft group h-[180px] sm:h-[220px]">
            <img
              src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"
              alt="Men Unstitched Latha"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-[14px] sm:p-[20px] text-white">
              <span className="text-[9.5px] sm:text-[11px] uppercase tracking-wider text-white/80">PURE EGYPTIAN COTTON</span>
              <h4 className="text-[15px] sm:text-[18px] font-bold">UNSTITCHED LATHA</h4>
            </div>
          </div>

          <div className="relative rounded-[6px] overflow-hidden shadow-soft group h-[180px] sm:h-[220px]">
            <img
              src="https://images.unsplash.com/photo-1622445268462-337f1688c49c?auto=format&fit=crop&w=800&q=80"
              alt="Men Embroidered Kurta"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-[14px] sm:p-[20px] text-white">
              <span className="text-[9.5px] sm:text-[11px] uppercase tracking-wider text-white/80">STITCHED KURTA PAJAMA</span>
              <h4 className="text-[15px] sm:text-[18px] font-bold">EMBROIDERED KURTAS</h4>
            </div>
          </div>

          <div className="relative rounded-[6px] overflow-hidden shadow-soft group h-[180px] sm:h-[220px] sm:col-span-2 md:col-span-1">
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
              alt="Men Waistcoats and Shawls"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-[14px] sm:p-[20px] text-white">
              <span className="text-[9.5px] sm:text-[11px] uppercase tracking-wider text-white/80">WARM ACCESSORIES</span>
              <h4 className="text-[15px] sm:text-[18px] font-bold">WAISTCOATS & SHAWLS</h4>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[8px] xs:gap-[12px] sm:gap-[20px]">
          {MEN_PRODUCTS.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white dark:bg-[#181818] border border-[#1212121a] dark:border-white/10 rounded-[6px] overflow-hidden shadow-soft hover:shadow-modal transition-all duration-300"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f3f3] dark:bg-[#222222]">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {product.discount && (
                    <div className="absolute top-[8px] sm:top-[10px] left-[8px] sm:left-[10px] bg-[#cf0c1d] text-white text-[10px] sm:text-[11px] font-bold px-[6px] sm:px-[8px] py-[2px] sm:py-[3px] rounded-[3px] tracking-wider">
                      {product.discount}
                    </div>
                  )}

                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className="absolute top-[8px] sm:top-[10px] right-[8px] sm:right-[10px] w-[30px] sm:w-[34px] h-[30px] sm:h-[34px] bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#121212] dark:text-white hover:text-[#cf0c1d] hover:bg-white dark:hover:bg-[#252525] shadow-sm transition-colors cursor-pointer"
                    aria-label="Wishlist"
                  >
                    <Heart size={16} className={isWishlisted ? "fill-[#cf0c1d] text-[#cf0c1d]" : ""} />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 p-[8px] sm:p-[10px] bg-gradient-to-t from-black/60 to-transparent flex gap-[6px] sm:gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => onQuickView(product)}
                      className="flex-1 bg-white dark:bg-[#252525] text-[#121212] dark:text-white text-[12px] sm:text-[13px] py-[6px] sm:py-[8px] font-medium flex items-center justify-center gap-[4px] hover:bg-[#f3f3f3] dark:hover:bg-[#333] transition-colors rounded-[3px] cursor-pointer"
                    >
                      <Eye size={14} />
                      <span className="hidden xs:inline">Quick View</span>
                    </button>
                    <button
                      onClick={() => onAddToCart(product)}
                      className="bg-[#121212] dark:bg-white text-white dark:text-black p-[6px] sm:p-[8px] hover:bg-[#333333] dark:hover:bg-gray-200 transition-colors rounded-[3px] cursor-pointer shrink-0"
                      title="Add to Bag"
                    >
                      <ShoppingBag size={15} />
                    </button>
                  </div>
                </div>

                <div className="p-[8px] xs:p-[10px] sm:p-[14px] flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9.5px] sm:text-[11px] tracking-widest text-[#121212bf] dark:text-gray-400 uppercase block mb-[2px] sm:mb-[3px] truncate">
                      {product.subCategory} • {product.color}
                    </span>
                    <h4 className="text-[12px] xs:text-[13px] sm:text-[14px] font-medium text-[#121212] dark:text-gray-100 line-clamp-1 mb-[4px]">
                      {product.title}
                    </h4>
                    <p className="text-[10px] xs:text-[11px] sm:text-[12px] text-[#121212b3] dark:text-gray-400 line-clamp-1 mb-[4px]">
                      {product.fabric}
                    </p>
                  </div>

                  <div className="pt-[6px] border-t border-[#1212121a] dark:border-white/10 flex items-center justify-between">
                    <div className="flex flex-wrap items-baseline gap-[4px] sm:gap-[6px]">
                      <span className="text-[12px] xs:text-[13px] sm:text-[15px] font-bold text-[#121212] dark:text-white">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] xs:text-[11px] sm:text-[12px] text-[#121212b3] dark:text-gray-400 line-through">
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

