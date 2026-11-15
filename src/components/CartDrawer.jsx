import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) {
  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 2490;
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-modal flex flex-col">
          {/* Header */}
          <div className="p-[20px] border-b border-[#1212121a] flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <ShoppingBag size={20} className="text-[#121212]" />
              <h3 className="text-[18px] font-bold text-[#121212] tracking-wide">
                SHOPPING BAG ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-[6px] text-[#121212] hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Calculator */}
          <div className="bg-[#f3f3f3] p-[15px] border-b border-[#1212121a]">
            <div className="flex items-center gap-[8px] text-[13px] text-[#121212] mb-[6px] font-medium">
              <Truck size={16} className="text-[#cf0c1d]" />
              {remainingForFreeShipping > 0 ? (
                <span>Add <strong>Rs. {remainingForFreeShipping.toLocaleString()}</strong> more to enjoy FREE SHIPPING!</span>
              ) : (
                <span className="text-emerald-700 font-bold">🎉 Congratulations! You have unlocked FREE Nationwide Shipping!</span>
              )}
            </div>
            <div className="w-full bg-gray-200 h-[6px] rounded-full overflow-hidden">
              <div
                className="bg-[#121212] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-[20px] divide-y divide-gray-100">
            {cartItems.length === 0 ? (
              <div className="text-center py-[50px] text-[#121212bf]">
                <ShoppingBag size={48} className="mx-auto mb-[15px] text-gray-300" />
                <p className="text-[16px] font-medium text-[#121212] mb-[6px]">Your shopping bag is empty</p>
                <p className="text-[13px] mb-[20px]">Explore our new arrivals and unstitched collections.</p>
                <button
                  onClick={onClose}
                  className="button-primary bg-[#121212] text-white text-[13px]"
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedSize || 'default'}`} className="py-[15px] flex gap-[15px]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-[72px] h-[96px] object-cover rounded-[3px] bg-[#f3f3f3]"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-[10px]">
                        <h4 className="text-[14px] font-medium text-[#121212] line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id, item.selectedSize)}
                          className="text-gray-400 hover:text-[#cf0c1d] transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {item.selectedSize && (
                        <span className="text-[11px] text-[#121212bf] bg-[#f3f3f3] px-[6px] py-[2px] rounded-[3px] inline-block mt-[4px]">
                          Size: {item.selectedSize}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-[10px]">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-gray-300 rounded-[3px]">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="px-[8px] py-[2px] text-[13px] hover:bg-gray-100 text-[#121212]"
                        >
                          -
                        </button>
                        <span className="px-[8px] text-[12px] font-semibold text-[#121212]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="px-[8px] py-[2px] text-[13px] hover:bg-gray-100 text-[#121212]"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-[14px] font-bold text-[#121212]">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-[20px] border-t border-[#1212121a] bg-[#f3f3f3]">
              <div className="flex justify-between text-[14px] text-[#121212bf] mb-[6px]">
                <span>Subtotal</span>
                <span className="text-[16px] font-bold text-[#121212]">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[12px] text-[#121212bf] mb-[15px]">
                <span>Shipping</span>
                <span className="text-[#121212]">
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Rs. 250'}
                </span>
              </div>

              <button
                onClick={() => {
                  if (onCheckout) {
                    onCheckout(cartItems);
                  }
                }}
                className="button-primary w-full bg-[#121212] text-white hover:bg-black py-[14px] text-[15px] font-medium tracking-[1px] flex items-center justify-center gap-[8px] cursor-pointer active:scale-[0.99] transition-all"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-[6px] text-[11px] text-[#121212bf] mt-[10px]">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Encrypted 256-bit SSL Checkout & COD Available</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

