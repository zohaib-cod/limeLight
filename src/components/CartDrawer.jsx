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

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white dark:bg-[#161616] text-[#121212] dark:text-white shadow-modal flex flex-col transition-colors duration-200">
          {/* Header */}
          <div className="p-[16px] sm:p-[20px] border-b border-[#1212121a] dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-[8px] sm:gap-[10px]">
              <ShoppingBag size={20} className="text-[#121212] dark:text-white" />
              <h3 className="text-[16px] sm:text-[18px] font-bold text-[#121212] dark:text-white tracking-wide">
                SHOPPING BAG ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-[6px] text-[#121212] dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Calculator */}
          <div className="bg-[#f3f3f3] dark:bg-[#202020] p-[12px] sm:p-[15px] border-b border-[#1212121a] dark:border-white/10">
            <div className="flex items-center gap-[8px] text-[12px] sm:text-[13px] text-[#121212] dark:text-gray-200 mb-[6px] font-medium">
              <Truck size={16} className="text-[#cf0c1d] shrink-0" />
              {remainingForFreeShipping > 0 ? (
                <span>Add <strong>Rs. {remainingForFreeShipping.toLocaleString()}</strong> more to enjoy FREE SHIPPING!</span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">🎉 Congratulations! You have unlocked FREE Nationwide Shipping!</span>
              )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-[6px] rounded-full overflow-hidden">
              <div
                className="bg-[#121212] dark:bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-[14px] sm:p-[20px] divide-y divide-gray-100 dark:divide-white/10">
            {cartItems.length === 0 ? (
              <div className="text-center py-[50px] text-[#121212bf] dark:text-gray-400">
                <ShoppingBag size={48} className="mx-auto mb-[15px] text-gray-300 dark:text-gray-600" />
                <p className="text-[16px] font-medium text-[#121212] dark:text-white mb-[6px]">Your shopping bag is empty</p>
                <p className="text-[13px] mb-[20px]">Explore our new arrivals and unstitched collections.</p>
                <button
                  onClick={onClose}
                  className="button-primary bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200 text-[13px] px-[20px] py-[10px] rounded-[3px] cursor-pointer"
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedSize || 'default'}`} className="py-[12px] sm:py-[15px] flex gap-[12px] sm:gap-[15px]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-[64px] sm:w-[72px] h-[86px] sm:h-[96px] object-cover rounded-[3px] bg-[#f3f3f3] dark:bg-[#252525] shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-[8px]">
                        <h4 className="text-[13px] sm:text-[14px] font-medium text-[#121212] dark:text-white truncate">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id, item.selectedSize)}
                          className="text-gray-400 hover:text-[#cf0c1d] transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {item.selectedSize && (
                        <span className="text-[10.5px] sm:text-[11px] text-[#121212bf] dark:text-gray-300 bg-[#f3f3f3] dark:bg-[#252525] px-[6px] py-[2px] rounded-[3px] inline-block mt-[4px]">
                          Size: {item.selectedSize}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-[10px]">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-gray-300 dark:border-white/20 rounded-[3px]">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="px-[8px] py-[2px] text-[13px] hover:bg-gray-100 dark:hover:bg-white/10 text-[#121212] dark:text-white cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-[8px] text-[12px] font-semibold text-[#121212] dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="px-[8px] py-[2px] text-[13px] hover:bg-gray-100 dark:hover:bg-white/10 text-[#121212] dark:text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-[13px] sm:text-[14px] font-bold text-[#121212] dark:text-white">
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
            <div className="p-[16px] sm:p-[20px] border-t border-[#1212121a] dark:border-white/10 bg-[#f3f3f3] dark:bg-[#1a1a1a]">
              <div className="flex justify-between text-[13.5px] sm:text-[14px] text-[#121212bf] dark:text-gray-300 mb-[6px]">
                <span>Subtotal</span>
                <span className="text-[15px] sm:text-[16px] font-bold text-[#121212] dark:text-white">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[12px] text-[#121212bf] dark:text-gray-400 mb-[15px]">
                <span>Shipping</span>
                <span className="text-[#121212] dark:text-white font-medium">
                  {subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : 'Rs. 250'}
                </span>
              </div>

              <button
                onClick={() => {
                  if (onCheckout) {
                    onCheckout(cartItems);
                  }
                }}
                className="button-primary w-full bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200 py-[12px] sm:py-[14px] text-[14px] sm:text-[15px] font-medium tracking-[1px] flex items-center justify-center gap-[8px] cursor-pointer active:scale-[0.99] transition-all rounded-[3px]"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-[6px] text-[10.5px] sm:text-[11px] text-[#121212bf] dark:text-gray-400 mt-[10px]">
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Encrypted 256-bit SSL Checkout & COD Available</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

