import React from 'react';
import { Eye, ShoppingBag, Heart } from 'lucide-react';
import { ACCESSORIES_PRODUCTS } from '../data/products';

export default function AccessoriesSection({ onQuickView, onAddToCart, onToggleWishlist, wishlist }) {
  return (
    <section className="shopify-section section py-[50px] bg-transparent border-t border-[#1212121a]" id="accessories">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        {/* Section Heading */}
        <div className="text-center mb-[30px]">
          <h2 className="text-[13px] font-normal text-[#121212] tracking-[0.15em] uppercase mb-[6px]">
            STATEMENT PIECES & FINISHING TOUCHES
          </h2>
          <h3 className="text-[20px] font-bold text-[#121212] tracking-wide">
            ACCESSORIES
          </h3>
          <div className="w-[50px] h-[2px] bg-[#121212] mx-auto mt-[10px]" />
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[15px] sm:gap-[24px]">
          {ACCESSORIES_PRODUCTS.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                className="group flex flex-col bg-white border border-[#1212121a] rounded-[6px] overflow-hidden shadow-soft hover:shadow-modal transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-[#f3f3f3]">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {product.discount && (
                    <div className="absolute top-[10px] left-[10px] bg-[#cf0c1d] text-white text-[11px] font-bold px-[8px] py-[3px] rounded-[3px] tracking-wider">
                      {product.discount}
                    </div>
                  )}

                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className="absolute top-[10px] right-[10px] w-[34px] h-[34px] bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#121212] hover:text-[#cf0c1d] shadow-sm transition-colors"
                    aria-label="Wishlist"
                  >
                    <Heart size={17} className={isWishlisted ? "fill-[#cf0c1d] text-[#cf0c1d]" : ""} />
                  </button>

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
                      title="Add to Bag"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-[15px] flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] tracking-widest text-[#121212bf] uppercase block mb-[4px]">
                      {product.category}
                    </span>
                    <h4 className="text-[15px] font-medium text-[#121212] line-clamp-1 mb-[4px]">
                      {product.title}
                    </h4>
                    <p className="text-[12px] text-[#121212b3] line-clamp-1 mb-[6px]">
                      {product.color}
                    </p>
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

