import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  ShoppingBag,
  Eye,
  Heart,
  Sparkles,
  ArrowLeft,
  Check,
  PackageOpen,
  Filter
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import QuickViewModal from '../components/QuickViewModal';
import CheckoutModal from '../components/CheckoutModal';
import UserAuthModal from '../components/UserAuthModal';
import ShoppingAssistantWidget from '../components/ShoppingAssistantWidget';
import SearchModal from '../components/SearchModal';
import { UNSTITCHED_PRODUCTS, READY_TO_WEAR_PRODUCTS, MEN_PRODUCTS } from '../data/products';

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Page state
  const [routes, setRoutes] = useState([]);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort State
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'newest'
  const [selectedFabric, setSelectedFabric] = useState('all');
  const [saleOnly, setSaleOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Store Modals & User state
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
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch Navigation Routes and Products
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [navRes, prodRes] = await Promise.all([
          fetch('/api/navigation?all=true'),
          fetch('/api/products?all=true')
        ]);

        let loadedRoutes = [];
        let loadedProducts = [];

        if (navRes.ok) {
          loadedRoutes = await navRes.json();
          setRoutes(loadedRoutes);
        }

        if (prodRes.ok) {
          loadedProducts = await prodRes.json();
        }

        // Combine fallback data if products list is minimal
        if (!loadedProducts || loadedProducts.length === 0) {
          loadedProducts = [
            ...UNSTITCHED_PRODUCTS,
            ...READY_TO_WEAR_PRODUCTS,
            ...MEN_PRODUCTS
          ];
        }

        setAllProducts(loadedProducts);

        // Find matching route by slug or name
        const cleanSlug = (slug || '').toLowerCase().trim();
        const matched = loadedRoutes.find(r => 
          (r.slug && r.slug.toLowerCase() === cleanSlug) ||
          r.name.toLowerCase().replace(/[\s_]+/g, '-') === cleanSlug ||
          r.name.toLowerCase() === cleanSlug
        );

        if (matched) {
          setCurrentRoute(matched);
        } else {
          // Synthetic route if not in list
          const formattedName = cleanSlug.replace(/-/g, ' ').toUpperCase();
          setCurrentRoute({
            id: `route-${cleanSlug}`,
            name: formattedName,
            slug: cleanSlug,
            description: `Explore our exclusive ${formattedName} collection designed for modern Pakistani style.`
          });
        }
      } catch (err) {
        console.warn('Failed to load category data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // 2. Filter products for this specific route / category
  const filteredProducts = useMemo(() => {
    if (!currentRoute) return [];

    const routeName = (currentRoute.name || '').toLowerCase();
    const routeSlug = (currentRoute.slug || slug || '').toLowerCase();

    let list = allProducts.filter(p => {
      const pCat = (p.category || '').toLowerCase();
      const pSub = (p.subCategory || '').toLowerCase();
      const pTitle = (p.title || '').toLowerCase();

      // Rule for "SALE": any discounted product
      if (routeSlug === 'sale' || routeName === 'sale') {
        return (p.originalPrice && p.originalPrice > p.price) || Boolean(p.discount) || p.isSale;
      }

      // Rule for "NEW IN": recent arrivals
      if (routeSlug === 'new-in' || routeName === 'new in') {
        return true; // showcase all newest items
      }

      // Rule for "WOMEN": Unstitched, Ready to wear, Pret
      if (routeSlug === 'women' || routeName === 'women') {
        return (
          pCat.includes('unstitched') ||
          pCat.includes('ready') ||
          pCat.includes('women') ||
          pSub.includes('kurti') ||
          pSub.includes('suit') ||
          pSub.includes('co-ord')
        );
      }

      // Rule for "MEN": Men category
      if (routeSlug === 'men' || routeName === 'men') {
        return pCat.includes('men') || pTitle.includes('men') || pSub.includes('kurta');
      }

      // Rule for "GIRLS": Girls category
      if (routeSlug === 'girls' || routeName === 'girls') {
        return pCat.includes('girls') || pCat.includes('ready') || pTitle.includes('girl');
      }

      // Exact match for custom route (e.g. user created "WINTER COATS", "LAWN 2026")
      const matchesCat = pCat === routeName || pCat.includes(routeName) || pCat === routeSlug;
      const matchesSub = pSub === routeName || pSub.includes(routeName);
      const matchesTitle = pTitle.includes(routeName);

      return matchesCat || matchesSub || matchesTitle;
    });

    // Apply secondary fabric filter
    if (selectedFabric !== 'all') {
      list = list.filter(p => p.fabric && p.fabric.toLowerCase().includes(selectedFabric.toLowerCase()));
    }

    // Apply Sale only toggle
    if (saleOnly) {
      list = list.filter(p => (p.originalPrice && p.originalPrice > p.price) || p.discount);
    }

    // Apply Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'newest') return (b.id > a.id ? 1 : -1);
      return 0; // featured
    });

    return list;
  }, [allProducts, currentRoute, slug, selectedFabric, saleOnly, sortBy]);

  // Unique fabrics in current view for filter pills
  const availableFabrics = useMemo(() => {
    const set = new Set();
    filteredProducts.forEach(p => {
      if (p.fabric) {
        const primary = p.fabric.split('&')[0].split('+')[0].trim();
        if (primary) set.add(primary);
      }
    });
    return Array.from(set).slice(0, 8);
  }, [filteredProducts]);

  // Handlers for cart & direct checkout
  const handleAddToCart = (product, selectedSize = null) => {
    const sizeToUse = selectedSize || (product.sizes?.[0] || 'Standard');
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === sizeToUse);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === sizeToUse
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1,
        selectedSize: sizeToUse
      }];
    });
    showToast(`Added "${product.title}" to bag!`);
    setIsCartOpen(true);
  };

  const handleToggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleDirectOrder = (product, selectedSize = null) => {
    const sizeToUse = selectedSize || (product.sizes?.[0] || 'Standard');
    setCheckoutItems([{
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
      selectedSize: sizeToUse,
      category: product.category,
      fabric: product.fabric
    }]);
    setIsCheckoutOpen(true);
  };

  const displayName = currentRoute?.name || (slug || '').toUpperCase();
  const routeDescription = currentRoute?.description || `Shop all authentic ${displayName} designs, crafted in premium winter fabrics.`;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#121212] font-assistant antialiased selection:bg-[#23ac95] selection:text-white">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-[65px] left-1/2 -translate-x-1/2 z-50 bg-[#121212] text-white px-[20px] py-[10px] rounded-[4px] shadow-2xl text-[13px] font-medium tracking-wide flex items-center gap-[8px] animate-fadeIn border border-[#23ac95]/40">
          <Sparkles size={15} className="text-[#cec72e]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Store Header */}
      <Header
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => showToast('Wishlist view opened')}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1">
        {/* Breadcrumb Bar */}
        <div className="bg-[#f8f9fa] border-b border-gray-200">
          <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px] py-[12px] flex items-center text-[12px] text-gray-500 gap-[6px]">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight size={13} className="text-gray-400" />
            <span className="text-gray-400">Collections</span>
            <ChevronRight size={13} className="text-gray-400" />
            <span className="font-bold text-[#121212] uppercase tracking-wider">{displayName}</span>
          </div>
        </div>

        {/* Category Hero Banner */}
        <div className="relative bg-[#121212] text-white py-[40px] sm:py-[55px] px-[20px] overflow-hidden text-center">
          {/* Subtle decorative glow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-[#23ac95]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-[800px] mx-auto space-y-[10px]">
            <span className="inline-block text-[11px] font-bold tracking-[0.25em] text-[#cec72e] uppercase">
              OFFICIAL ZIMAL COLLECTION • WWW.ZIMALCOLLECTION.COM
            </span>
            <h1 className="text-[28px] sm:text-[40px] font-extrabold tracking-[0.1em] uppercase font-visbyBold">
              {displayName}
            </h1>
            <p className="text-[13px] sm:text-[14px] text-white/80 max-w-[600px] mx-auto leading-relaxed">
              {routeDescription}
            </p>
            <div className="pt-[4px]">
              <span className="inline-flex items-center gap-[6px] bg-white/10 px-[12px] py-[4px] rounded-full text-[11px] font-bold text-white/90">
                <span>{filteredProducts.length} Article(s) Available</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Sort Control Bar */}
        <div className="sticky top-[86px] sm:top-[92px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 py-[12px]">
          <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px] flex flex-wrap items-center justify-between gap-[12px]">
            {/* Left: Quick Fabric Pills */}
            <div className="flex items-center gap-[6px] overflow-x-auto py-[2px] no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedFabric('all')}
                className={`px-[12px] py-[6px] text-[11px] font-bold uppercase rounded-full transition-all cursor-pointer ${
                  selectedFabric === 'all'
                    ? 'bg-[#121212] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Fabrics ({filteredProducts.length})
              </button>

              {availableFabrics.map(fabric => (
                <button
                  key={fabric}
                  type="button"
                  onClick={() => setSelectedFabric(fabric)}
                  className={`px-[12px] py-[6px] text-[11px] font-bold uppercase rounded-full transition-all cursor-pointer ${
                    selectedFabric === fabric
                      ? 'bg-[#121212] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {fabric}
                </button>
              ))}

              <label className="flex items-center gap-[6px] text-[12px] font-bold text-[#cf0c1d] ml-[6px] cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={saleOnly}
                  onChange={(e) => setSaleOnly(e.target.checked)}
                  className="w-[15px] h-[15px] accent-[#cf0c1d]"
                />
                <span>Sale Only</span>
              </label>
            </div>

            {/* Right: Sort dropdown */}
            <div className="flex items-center gap-[8px] ml-auto">
              <span className="text-[12px] text-gray-500 hidden sm:inline">Sort By:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#f8f9fa] border border-gray-300 text-[12px] font-bold py-[6px] px-[10px] rounded focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="featured">Featured Collection</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px] py-[35px]">
          {loading ? (
            <div className="py-[80px] text-center space-y-[12px]">
              <div className="w-[36px] h-[36px] border-3 border-[#121212] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[14px] text-gray-500">Loading {displayName} catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty State */
            <div className="py-[70px] px-[20px] text-center max-w-md mx-auto space-y-[16px] bg-[#fbfbfb] rounded-[12px] border border-dashed border-gray-300">
              <div className="w-[60px] h-[60px] bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <PackageOpen size={30} />
              </div>
              <h3 className="text-[18px] font-bold text-[#121212]">
                No items found in {displayName}
              </h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                We are currently replenishing stock for this section. Check back shortly or explore our active winter editions!
              </p>
              <div className="pt-[10px] flex justify-center gap-[10px]">
                <Link
                  to="/"
                  className="button-primary bg-[#121212] text-white hover:bg-black px-[20px] py-[10px] text-[13px] rounded font-bold"
                >
                  Back to Storefront
                </Link>
              </div>
            </div>
          ) : (
            /* Real Products Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[15px] sm:gap-x-[20px] gap-y-[30px] sm:gap-y-[40px]">
              {filteredProducts.map((product) => {
                const isDiscounted = product.originalPrice && product.originalPrice > product.price;
                const isFavorited = wishlist.includes(product.id);

                return (
                  <div key={product.id} className="group flex flex-col justify-between">
                    {/* Media Card */}
                    <div className="relative aspect-[3/4] bg-[#f5f5f5] overflow-hidden mb-[12px] rounded-[2px]">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Sale / Discount Badge */}
                      {product.discount && (
                        <span className="absolute top-[8px] left-[8px] bg-[#cf0c1d] text-white text-[10px] font-extrabold uppercase px-[8px] py-[3px] tracking-wider rounded-[2px] shadow-sm">
                          {product.discount}
                        </span>
                      )}

                      {/* Wishlist Button */}
                      <button
                        onClick={() => handleToggleWishlist(product.id)}
                        className={`absolute top-[8px] right-[8px] w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all shadow-sm ${
                          isFavorited
                            ? 'bg-[#cf0c1d] text-white'
                            : 'bg-white/90 text-gray-700 hover:bg-white hover:text-black'
                        }`}
                        title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        aria-label="Wishlist toggle"
                      >
                        <Heart size={15} className={isFavorited ? 'fill-current' : ''} />
                      </button>

                      {/* Hover Action Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-[10px] bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-[6px]">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-white hover:bg-gray-100 text-[#121212] py-[9px] text-[12px] font-bold rounded-[2px] tracking-wider uppercase flex items-center justify-center gap-[6px] shadow-md transition-colors cursor-pointer"
                        >
                          <ShoppingBag size={14} />
                          <span>Add to Bag</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickViewProduct(product)}
                          className="w-full bg-black/60 hover:bg-black text-white py-[7px] text-[11px] font-medium rounded-[2px] tracking-wider uppercase flex items-center justify-center gap-[5px] backdrop-blur-xs transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Quick View</span>
                        </button>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-[4px]">
                      <span className="text-[11px] tracking-widest text-[#121212bf] uppercase block">
                        {product.fabric || product.category || 'ZIMAL COLLECTION'}
                        {product.pieces ? ` • ${product.pieces}` : ''}
                      </span>

                      <h3
                        onClick={() => setQuickViewProduct(product)}
                        className="text-[14px] font-medium text-[#121212] line-clamp-1 hover:underline cursor-pointer"
                        title={product.title}
                      >
                        {product.title}
                      </h3>

                      <div className="flex items-baseline gap-[8px] pt-[2px]">
                        <span className="text-[15px] font-bold text-[#121212]">
                          Rs. {Number(product.price).toLocaleString()}
                        </span>
                        {isDiscounted && (
                          <span className="text-[12px] text-[#121212b3] line-through">
                            Rs. {Number(product.originalPrice).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Direct Order Button */}
                      <div className="pt-[6px]">
                        <button
                          type="button"
                          onClick={() => handleDirectOrder(product)}
                          className="w-full py-[6px] bg-[#f8f9fa] hover:bg-[#121212] text-[#121212] hover:text-white border border-gray-300 hover:border-black text-[11px] font-bold tracking-wider rounded-[2px] transition-all cursor-pointer flex items-center justify-center gap-[4px]"
                        >
                          <span>Direct Order</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Centered AI Shopping Assistant */}
      <ShoppingAssistantWidget
        onAddToCart={handleAddToCart}
        onQuickView={setQuickViewProduct}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={(id, size, delta) => {
          setCartItems(prev => prev.map(item => {
            if (item.id === id && item.selectedSize === size) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          }).filter(Boolean));
        }}
        onRemoveItem={(id, size) => {
          setCartItems(prev => prev.filter(item => !(item.id === id && item.selectedSize === size)));
        }}
        onCheckout={() => {
          setIsCartOpen(false);
          setCheckoutItems(cartItems);
          setIsCheckoutOpen(true);
        }}
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

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        onOrderSuccess={(order) => {
          setCartItems([]);
          showToast(`Order #${order.orderNumber} placed successfully!`);
        }}
        currentUser={currentUser}
      />

      {/* User Auth Modal */}
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

