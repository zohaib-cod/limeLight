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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[15px] sm:p-[30px]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl bg-white rounded-[6px] shadow-modal overflow-hidden z-10 animate-expand flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-[12px] right-[12px] z-20 w-[32px] h-[32px] bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#121212] hover:bg-gray-100 transition-colors shadow-sm"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Product Media */}
        <div className="w-full md:w-1/2 bg-[#f3f3f3] relative overflow-hidden flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-[320px] md:h-full max-h-[500px] object-cover"
          />
          {product.discount && (
            <span className="absolute top-[15px] left-[15px] bg-[#cf0c1d] text-white text-[11px] font-bold px-[8px] py-[3px] rounded-[3px]">
              {product.discount}
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 p-[25px] sm:p-[30px] overflow-y-auto flex flex-col justify-between">
          <div>
            <span className="text-[12px] tracking-[0.15em] text-[#121212bf] uppercase font-medium block mb-[4px]">
              {product.category} {product.subCategory && `• ${product.subCategory}`}
            </span>
            <h3 className="text-[20px] font-bold text-[#121212] leading-snug mb-[10px]">
              {product.title}
            </h3>

            {/* Price Row */}
            <div className="flex items-baseline gap-[12px] mb-[15px]">
              <span className="text-[22px] font-bold text-[#121212]">
                Rs. {product.price?.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-[15px] text-[#121212b3] line-through">
                  Rs. {product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Fabric or Description */}
            <div className="space-y-[6px] text-[13px] text-[#121212bf] mb-[20px] bg-[#f3f3f3] p-[12px] rounded-[5px]">
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
              <div className="mb-[20px]">
                <div className="flex justify-between items-center mb-[8px]">
                  <span className="text-[12px] font-semibold text-[#121212] uppercase tracking-wider">
                    Select Size:
                  </span>
                  <button className="text-[11px] text-[#121212bf] underline hover:text-[#121212]">
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-[8px]">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`h-[36px] px-[14px] text-[12px] font-medium rounded-[3px] border transition-colors ${
                        selectedSize === s
                          ? 'bg-[#121212] text-white border-[#121212]'
                          : 'bg-white text-[#121212] border-gray-300 hover:border-[#121212]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-[15px] mb-[25px]">
              <span className="text-[12px] font-semibold text-[#121212] uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-[3px]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-[12px] py-[6px] text-[14px] hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-[12px] text-[13px] font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-[12px] py-[6px] text-[14px] hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-[10px]">
            {/* Direct Order / Buy Now Button */}
            <button
              type="button"
              onClick={() => {
                if (onDirectOrder) {
                  onDirectOrder(product, selectedSize, quantity);
                }
              }}
              className="button-primary w-full bg-[#cf0c1d] hover:bg-[#b00a18] text-white py-[14px] text-[15px] font-bold tracking-[1px] rounded-[3px] flex items-center justify-center gap-[8px] transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <Zap size={18} className="fill-white" />
              <span>BUY NOW — DIRECT ORDER</span>
            </button>

            <button
              onClick={handleAdd}
              className="button-primary w-full bg-[#121212] text-white hover:bg-black py-[13px] text-[14px] font-medium tracking-[1px] rounded-[3px] flex items-center justify-center gap-[8px] transition-all"
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
              className="w-full py-[10px] text-[13px] font-medium text-[#121212] border border-gray-300 rounded-[3px] hover:bg-gray-50 flex items-center justify-center gap-[6px] transition-colors"
            >
              <Heart
                size={16}
                className={isWishlisted ? "fill-[#cf0c1d] text-[#cf0c1d]" : ""}
              />
              <span>{isWishlisted ? 'IN WISHLIST' : 'ADD TO WISHLIST'}</span>
            </button>

            <div className="flex items-center justify-center gap-[6px] text-[11px] text-[#121212bf] pt-[5px]">
              <Shield size={13} className="text-emerald-600" />
              <span>100% Original Brand Guarantee • Fast Dispatch</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

