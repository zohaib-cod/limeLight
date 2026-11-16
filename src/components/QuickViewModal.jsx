import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Check, Shield, Zap } from 'lucide-react';

export default function QuickViewModal({ product, onClose, onAddToCart, onToggleWishlist, isWishlisted, onDirectOrder }) {
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart({ ...product, selectedSize, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[8px] xs:p-[15px] sm:p-[30px]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#161616] text-[#121212] dark:text-white rounded-[6px] shadow-modal overflow-hidden z-10 animate-expand flex flex-col md:flex-row max-h-[92vh] transition-colors duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-[10px] right-[10px] z-20 w-[32px] h-[32px] bg-white/90 dark:bg-[#202020]/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#121212] dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-colors shadow-sm cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Product Media */}
        <div className="w-full md:w-1/2 bg-[#f3f3f3] dark:bg-[#222222] relative overflow-hidden flex items-center justify-center shrink-0">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-[240px] sm:h-[320px] md:h-full max-h-[500px] object-cover"
          />
          {product.discount && (
            <span className="absolute top-[12px] left-[12px] bg-[#cf0c1d] text-white text-[10.5px] sm:text-[11px] font-bold px-[8px] py-[3px] rounded-[3px]">
              {product.discount}
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 p-[16px] sm:p-[25px] md:p-[30px] overflow-y-auto flex flex-col justify-between">
          <div>
            <span className="text-[11px] sm:text-[12px] tracking-[0.15em] text-[#121212bf] dark:text-gray-400 uppercase font-medium block mb-[4px]">
              {product.category} {product.subCategory && `• ${product.subCategory}`}
            </span>
            <h3 className="text-[17px] sm:text-[20px] font-bold text-[#121212] dark:text-white leading-snug mb-[8px] sm:mb-[10px]">
              {product.title}
            </h3>

            {/* Price Row */}
            <div className="flex items-baseline gap-[10px] sm:gap-[12px] mb-[12px] sm:mb-[15px]">
              <span className="text-[18px] sm:text-[22px] font-bold text-[#121212] dark:text-white">
                Rs. {product.price?.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-[13px] sm:text-[15px] text-[#121212b3] dark:text-gray-400 line-through">
                  Rs. {product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Fabric or Description */}
            <div className="space-y-[5px] text-[12px] sm:text-[13px] text-[#121212bf] dark:text-gray-300 mb-[16px] sm:mb-[20px] bg-[#f3f3f3] dark:bg-[#202020] p-[10px] sm:p-[12px] rounded-[5px]">
              {product.fabric && (
                <p><strong>Fabric:</strong> {product.fabric}</p>
              )}
              {product.pieces && (
                <p><strong>Includes:</strong> {product.pieces}</p>
              )}
              {product.notes && (
                <p><strong>Fragrance Profile:</strong> {product.notes}</p>
              )}
              {product.color && (
                <p><strong>Color:</strong> {product.color}</p>
              )}
              <p><strong>SKU:</strong> {product.sku || 'LL-PK-2026-AUT'}</p>
            </div>

            {/* Sizing options if applicable */}
            {product.sizes && (
              <div className="mb-[16px] sm:mb-[20px]">
                <div className="flex justify-between items-center mb-[8px]">
                  <span className="text-[11.5px] sm:text-[12px] font-semibold text-[#121212] dark:text-white uppercase tracking-wider">
                    Select Size:
                  </span>
                  <button className="text-[11px] text-[#121212bf] dark:text-gray-400 underline hover:text-[#121212] dark:hover:text-white">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-[6px] sm:gap-[8px]">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`h-[32px] sm:h-[36px] px-[12px] sm:px-[14px] text-[11.5px] sm:text-[12px] font-medium rounded-[3px] border transition-colors cursor-pointer ${
                        selectedSize === s
                          ? 'bg-[#121212] dark:bg-white text-white dark:text-black border-[#121212] dark:border-white'
                          : 'bg-white dark:bg-[#202020] text-[#121212] dark:text-white border-gray-300 dark:border-white/20 hover:border-[#121212]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-[12px] sm:gap-[15px] mb-[20px] sm:mb-[25px]">
              <span className="text-[11.5px] sm:text-[12px] font-semibold text-[#121212] dark:text-white uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-gray-300 dark:border-white/20 rounded-[3px]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-[10px] sm:px-[12px] py-[4px] sm:py-[6px] text-[13px] sm:text-[14px] hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                >
                  -
                </button>
                <span className="px-[10px] sm:px-[12px] text-[12px] sm:text-[13px] font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-[10px] sm:px-[12px] py-[4px] sm:py-[6px] text-[13px] sm:text-[14px] hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-[8px] sm:space-y-[10px]">
            {/* Direct Order / Buy Now Button */}
            <button
              type="button"
              onClick={() => {
                if (onDirectOrder) {
                  onDirectOrder(product, selectedSize, quantity);
                }
              }}
              className="button-primary w-full bg-[#cf0c1d] hover:bg-[#b00a18] text-white py-[12px] sm:py-[14px] text-[14px] sm:text-[15px] font-bold tracking-[1px] rounded-[3px] flex items-center justify-center gap-[8px] transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <Zap size={18} className="fill-white" />
              <span>BUY NOW — DIRECT ORDER</span>
            </button>

            <button
              onClick={handleAdd}
              className="button-primary w-full bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200 py-[11px] sm:py-[13px] text-[13px] sm:text-[14px] font-medium tracking-[1px] rounded-[3px] flex items-center justify-center gap-[8px] transition-all cursor-pointer"
            >
              {added ? (
                <>
                  <Check size={18} className="text-emerald-400" />
                  <span>ADDED TO BAG!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>ADD TO SHOPPING BAG</span>
                </>
              )}
            </button>

            <button
              onClick={() => onToggleWishlist(product.id)}
              className="w-full py-[9px] sm:py-[10px] text-[12px] sm:text-[13px] font-medium text-[#121212] dark:text-white border border-gray-300 dark:border-white/20 rounded-[3px] hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center gap-[6px] transition-colors cursor-pointer"
            >
              <Heart
                size={16}
                className={isWishlisted ? "fill-[#cf0c1d] text-[#cf0c1d]" : ""}
              />
              <span>{isWishlisted ? 'IN WISHLIST' : 'ADD TO WISHLIST'}</span>
            </button>

            <div className="flex items-center justify-center gap-[6px] text-[10.5px] sm:text-[11px] text-[#121212bf] dark:text-gray-400 pt-[4px]">
              <Shield size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>100% Original Brand Guarantee • Fast Dispatch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

