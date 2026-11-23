import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import UnstitchedSection from '../components/UnstitchedSection';
import ReadyToWearSection from '../components/ReadyToWearSection';
import ShopByCollectionSection from '../components/ShopByCollectionSection';
import MenSection from '../components/MenSection';
import NewArrivalsSection from '../components/NewArrivalsSection';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import QuickViewModal from '../components/QuickViewModal';
import SearchModal from '../components/SearchModal';
import ShoppingAssistantWidget from '../components/ShoppingAssistantWidget';
import CheckoutModal from '../components/CheckoutModal';
import UserAuthModal from '../components/UserAuthModal';

export default function Storefront() {
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState(["rtw-1"]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('limelight_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Dynamic Homepage Sections State (Order & Enabled)
  const [sections, setSections] = useState(() => {
    try {
      const saved = localStorage.getItem('limelight_sections');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // fallback
    }
    return [
      { id: "hero", enabled: true },
      { id: "unstitched", enabled: true },
      { id: "rtw", enabled: true },
      { id: "collections", enabled: true },
      { id: "men", enabled: true },
      { id: "new-arrivals", enabled: true }
    ];
  });

  useEffect(() => {
    fetch('/api/sections')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSections(data);
          try {
            localStorage.setItem('limelight_sections', JSON.stringify(data));
          } catch (e) {
            // ignore
          }
        }
      })
      .catch(() => {});

    const handleSectionsChange = (e) => {
      if (Array.isArray(e.detail)) {
        setSections(e.detail);
      }
    };

    window.addEventListener('limelight_sections_change', handleSectionsChange);
    return () => window.removeEventListener('limelight_sections_change', handleSectionsChange);
  }, []);

  // Section Renderer according to ID
  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'hero':
        return <Hero key="hero" />;
      case 'unstitched':
        return (
          <UnstitchedSection
            key="unstitched"
            onQuickView={setQuickViewProduct}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
          />
        );
      case 'rtw':
        return (
          <ReadyToWearSection
            key="rtw"
            onQuickView={setQuickViewProduct}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
          />
        );
      case 'collections':
        return (
          <ShopByCollectionSection
            key="collections"
            onSelectCollection={(title) => {
              showToast(`Exploring collection: ${title}`);
              const el = document.getElementById('new-arrivals');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        );
      case 'men':
        return (
          <MenSection
            key="men"
            onQuickView={setQuickViewProduct}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
          />
        );
      case 'new-arrivals':
        return (
          <NewArrivalsSection
            key="new-arrivals"
            onQuickView={setQuickViewProduct}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
          />
        );
      default:
        return null;
    }
  };

  React.useEffect(() => {
    const handleAuthChange = (e) => {
      setCurrentUser(e.detail || null);
    };
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('limelight_user');
        setCurrentUser(saved ? JSON.parse(saved) : null);
      } catch (e) {
        /* ignore */
      }
    };
    window.addEventListener('limelight_auth_change', handleAuthChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('limelight_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleDirectOrder = (product, selectedSize, quantity) => {
    setCheckoutItems([
      {
        ...product,
        selectedSize: selectedSize || product.sizes?.[0] || 'Standard',
        quantity: quantity || 1
      }
    ]);
    setQuickViewProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleCartCheckout = (items) => {
    if (!items || items.length === 0) return;
    setCheckoutItems(items);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order) => {
    setCartItems([]);
    showToast(`Order #${order.id} placed! Synced to Admin Panel.`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const sizeKey = product.selectedSize || 'Standard';
      const existing = prev.find(
        (item) => item.id === product.id && (item.selectedSize || 'Standard') === sizeKey
      );

      if (existing) {
        return prev.map((item) =>
          item.id === product.id && (item.selectedSize || 'Standard') === sizeKey
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          quantity: product.quantity || 1,
          selectedSize: sizeKey
        }
      ];
    });

    showToast(`Added "${product.title}" to Shopping Bag!`);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId, selectedSize, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId, selectedSize);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveItem = (productId, selectedSize) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.id === productId && item.selectedSize === selectedSize)
      )
    );
  };

  const handleToggleWishlist = (productId) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast("Removed from Wishlist");
        return prev.filter((id) => id !== productId);
      } else {
        showToast("Added to your Wishlist ❤️");
        return [...prev, productId];
      }
    });
  };

  const handleOpenWishlist = () => {
    if (wishlist.length === 0) {
      alert("Your wishlist is empty. Browse products and click the heart icon to save favorites!");
    } else {
      alert(`You currently have ${wishlist.length} item(s) saved in your Wishlist!`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#111111] text-[#121212] dark:text-[#f3f4f6] selection:bg-[#121212] selection:text-white relative transition-colors duration-200 overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-[85px] right-[20px] z-50 bg-[#121212] text-white text-[13px] font-medium py-[10px] px-[18px] rounded-[4px] shadow-modal animate-expand flex items-center gap-[8px]">
          <span className="w-[8px] h-[8px] bg-emerald-400 rounded-full inline-block"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Header (Pure Customer Storefront) */}
      <Header
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={handleOpenWishlist}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Dynamic Sections (Reorderable via Admin Panel) */}
      <main className="flex-1 w-full">
        {Array.isArray(sections) && sections.length > 0 ? (
          sections
            .filter(s => s && s.enabled !== false)
            .map(sec => (
              <React.Fragment key={sec.id}>
                {renderSection(sec.id)}
              </React.Fragment>
            ))
        ) : (
          <>
            <Hero />
            <UnstitchedSection
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlist={wishlist}
            />
            <ReadyToWearSection
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlist={wishlist}
            />
            <ShopByCollectionSection
              onSelectCollection={(title) => {
                showToast(`Exploring collection: ${title}`);
                const el = document.getElementById('new-arrivals');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <MenSection
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlist={wishlist}
            />
            <NewArrivalsSection
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlist={wishlist}
            />
          </>
        )}
      </main>

      {/* Section 8: Footer - "Customer Care" */}
      <Footer />

      {/* Floating AI Fashion Stylist & Personal Shopping Assistant (Powered by Groq) Centered */}
      <ShoppingAssistantWidget
        onAddToCart={handleAddToCart}
        onQuickView={setQuickViewProduct}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCartCheckout}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        onDirectOrder={handleDirectOrder}
      />

      {/* Direct Order Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        onOrderSuccess={handleOrderSuccess}
        currentUser={currentUser}
      />

      {/* User Sign In, Registration & Order Tracking Modal */}
      <UserAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`);
        }}
        onLogout={() => {
          setCurrentUser(null);
          showToast('Signed out successfully.');
        }}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onQuickView={setQuickViewProduct}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
