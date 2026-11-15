import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingBag, Phone, Menu, X, ChevronRight } from 'lucide-react';
import { ASSETS } from '../data/products';

const DEFAULT_SETTINGS = {
  logoType: 'text',
  textLogo: {
    part1: 'LIME',
    part2: 'LIGHT',
    color1: '#23ac95',
    color2: '#cec72e',
    fontSize: 23
  },
  imageLogo: {
    url: '',
    height: 36
  },
  whatsappNumber: '+92 345 7867016'
};

const DEFAULT_NAV = [
  {
    id: 'nav-1',
    name: 'NEW IN',
    href: '#new-arrivals',
    isSale: false,
    order: 1,
    isActive: true
  },
  {
    id: 'nav-2',
    name: 'WOMEN',
    href: '#unstitched',
    isSale: false,
    order: 2,
    isActive: true,
    hasDropdown: true,
    columns: [
      {
        title: 'UNSTITCHED',
        href: '#unstitched',
        links: [
          { label: '1 Piece (Printed/Embroidered)', href: '#unstitched' },
          { label: '2 Piece (Shirt + Dupatta)', href: '#unstitched' },
          { label: '3 Piece Embroidered Suits', href: '#unstitched' },
          { label: 'Velvet & Karandi Shawls', href: '#unstitched' }
        ]
      },
      {
        title: 'READY TO WEAR',
        href: '#ready-to-wear',
        links: [
          { label: 'Pret Casual Kurtis', href: '#ready-to-wear' },
          { label: '2 Piece Co-Ord Sets', href: '#ready-to-wear' },
          { label: 'Formal Jacquard Suits', href: '#ready-to-wear' },
          { label: 'Solids & Basics', href: '#ready-to-wear' }
        ]
      },
      {
        title: 'SPECIAL EDITIONS',
        href: '#collections',
        links: [
          { label: 'Winter Velvet Collection', href: '#collections' },
          { label: 'Co-Ord Sets Edition', href: '#ready-to-wear' },
          { label: 'Warm Khaddar & Karandi', href: '#unstitched' }
        ]
      }
    ]
  },
  {
    id: 'nav-3',
    name: 'MEN',
    href: '#men',
    isSale: false,
    order: 3,
    isActive: true,
    hasDropdown: true,
    columns: [
      {
        title: 'MEN APPAREL',
        href: '#men',
        links: [
          { label: 'Unstitched Egyptian Latha (4.5m)', href: '#men' },
          { label: 'Embroidered Kurta Pajama', href: '#men' },
          { label: 'Tailored Waistcoats', href: '#men' },
          { label: 'Lambswool Shawls', href: '#men' }
        ]
      }
    ]
  },
  {
    id: 'nav-4',
    name: 'GIRLS',
    href: '#ready-to-wear',
    isSale: false,
    order: 4,
    isActive: true
  },
  {
    id: 'nav-5',
    name: 'SALE',
    href: '#new-arrivals',
    isSale: true,
    order: 5,
    isActive: true
  }
];

export default function Header({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenSearch,
  onOpenWishlist,
  currentUser,
  onOpenAuth
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

  // Settings & Navigation state
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('limelight_settings');
      return cached ? JSON.parse(cached) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [navItems, setNavItems] = useState(() => {
    try {
      const cached = localStorage.getItem('limelight_navigation');
      return cached ? JSON.parse(cached) : DEFAULT_NAV;
    } catch {
      return DEFAULT_NAV;
    }
  });

  // Sync settings and navigation from API
  useEffect(() => {
    // 1. Fetch settings (branding, logo, whatsapp)
    fetch('/api/settings')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && typeof data === 'object') {
          setSettings(prev => ({ ...prev, ...data }));
          try {
            localStorage.setItem('limelight_settings', JSON.stringify(data));
          } catch (e) {
            // ignore
          }
        }
      })
      .catch(() => {});

    // 2. Fetch navigation routes
    fetch('/api/navigation')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setNavItems(data);
          try {
            localStorage.setItem('limelight_navigation', JSON.stringify(data));
          } catch (e) {
            // ignore
          }
        }
      })
      .catch(() => {});

    // 3. Listen to live changes dispatched from admin panel
    const handleSettingsChange = (e) => {
      if (e.detail) {
        setSettings(prev => ({ ...prev, ...e.detail }));
      }
    };

    const handleNavigationChange = (e) => {
      if (Array.isArray(e.detail)) {
        setNavItems(e.detail);
      }
    };

    window.addEventListener('limelight_settings_change', handleSettingsChange);
    window.addEventListener('limelight_navigation_change', handleNavigationChange);

    return () => {
      window.removeEventListener('limelight_settings_change', handleSettingsChange);
      window.removeEventListener('limelight_navigation_change', handleNavigationChange);
    };
  }, []);

  // WhatsApp cleaned digits
  const whatsappNumber = settings.whatsappNumber || '+92 345 7867016';
  const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const activeRoutes = navItems.filter(item => item.isActive !== false);

  // Render Dynamic Logo Helper
  const renderLogo = (isDrawer = false) => {
    if (settings.logoType === 'image' && settings.imageLogo?.url) {
      return (
        <img
          src={settings.imageLogo.url}
          alt={`${settings.textLogo?.part1 || 'LIME'}${settings.textLogo?.part2 || 'LIGHT'}`}
          style={{
            maxHeight: isDrawer ? '32px' : `${settings.imageLogo.height || 36}px`
          }}
          className="object-contain inline-block transition-transform hover:opacity-95"
          onError={(e) => {
            // Fallback to text if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    const part1 = settings.textLogo?.part1 || 'LIME';
    const part2 = settings.textLogo?.part2 || 'LIGHT';
    const color1 = settings.textLogo?.part1Color || settings.textLogo?.color1 || '#23ac95';
    const color2 = settings.textLogo?.part2Color || settings.textLogo?.color2 || '#cec72e';
    const rawSize = settings.textLogo?.fontSize || 23;
    const fontSize = isDrawer ? 18 : (typeof rawSize === 'string' ? parseInt(rawSize, 10) || 23 : rawSize);

    return (
      <span
        style={{ fontSize: `${fontSize}px` }}
        className="inline-flex items-center tracking-[0.24em] font-bold uppercase transition-opacity hover:opacity-90 font-visbyBold"
      >
        <span style={{ color: color1 }}>{part1}</span>
        <span style={{ color: color2 }}>{part2}</span>
      </span>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#000000] text-white shadow-md select-none font-assistant">
        {/* ROW 1: TOP BAR (Phone + WhatsApp | DYNAMIC LOGO | Search + User + Bag) */}
        <div className="w-full border-b border-[#222222]">
          <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px] h-[46px] sm:h-[50px] flex items-center justify-between">
            {/* Left: Phone icon & WhatsApp icon */}
            <div className="flex items-center space-x-[14px]">
              {/* Phone trigger */}
              <button
                onClick={() => setPhoneModalOpen(true)}
                className="text-white hover:text-white/80 transition-colors p-[3px] flex items-center cursor-pointer"
                title={`Call Limelight Support (${whatsappNumber})`}
                aria-label="Phone Support"
              >
                <Phone size={18} strokeWidth={1.6} />
              </button>

              {/* WhatsApp direct chat icon */}
              <a
                href={`https://wa.me/${cleanWaNumber}?text=Hello%20Limelight%20Customer%20Support`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105 p-[2px] flex items-center"
                title={`Chat with Limelight on WhatsApp (${whatsappNumber})`}
                aria-label="WhatsApp Support"
              >
                <div className="w-[20px] h-[20px] bg-[#25D366] rounded-full flex items-center justify-center shadow-sm">
                  <img
                    src={ASSETS.whatsappIcon}
                    alt="WhatsApp"
                    className="w-[12px] h-[12px]"
                  />
                </div>
              </a>
            </div>

            {/* Center: Dynamic Brand Logo (Text or Image configured by Admin) */}
            <div className="flex-1 flex justify-center items-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center cursor-pointer"
                title="Limelight Pakistan Official"
              >
                {renderLogo(false)}
              </Link>
            </div>

            {/* Right: Search + Profile + Shopping Bag icons */}
            <div className="flex items-center space-x-[14px] sm:space-x-[18px]">
              {/* Search Icon */}
              <button
                onClick={onOpenSearch}
                className="text-white hover:text-white/80 transition-colors p-[3px] cursor-pointer"
                title="Search"
                aria-label="Search Catalog"
              >
                <Search size={19} strokeWidth={1.6} />
              </button>

              {/* User Account Icon */}
              <button
                onClick={onOpenAuth}
                className="text-white hover:text-white/80 transition-colors p-[3px] relative flex items-center gap-[6px] cursor-pointer"
                title={currentUser ? `Logged in as ${currentUser.name}` : "Sign In & Order Tracking"}
                aria-label="User Account"
              >
                <div className="relative">
                  <User size={19} strokeWidth={1.6} />
                  {currentUser && (
                    <span className="absolute -top-[2px] -right-[2px] w-[8px] h-[8px] bg-emerald-400 rounded-full border border-black animate-pulse" />
                  )}
                </div>
                {currentUser && (
                  <span className="hidden md:inline text-[11px] font-medium text-white/90 max-w-[80px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                )}
              </button>

              {/* Shopping Bag Icon with counter badge */}
              <button
                onClick={onOpenCart}
                className="text-white hover:text-white/80 transition-colors p-[3px] relative cursor-pointer"
                title="Shopping Bag"
                aria-label="Shopping Bag"
              >
                <ShoppingBag size={19} strokeWidth={1.6} />
                {cartCount > 0 && (
                  <span className="absolute -top-[3px] -right-[6px] bg-[#cf0c1d] text-white text-[9px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ROW 2: SUB-NAV (Hamburger on left | Dynamic Centered Nav Routes) */}
        <div className="w-full bg-[#000000] border-b border-[#222222]/80 relative">
          <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px] h-[38px] sm:h-[42px] flex items-center justify-between">
            {/* Far Left: Hamburger Menu Icon */}
            <div className="flex items-center w-[60px]">
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-white hover:text-white/80 p-[4px] -ml-[4px] focus:outline-none flex items-center justify-center cursor-pointer"
                title="Navigation Menu"
                aria-label="Open Navigation Menu"
              >
                <Menu size={22} strokeWidth={1.8} />
              </button>
            </div>

            {/* Center: Dynamic Navigation Routes mapped from Backend */}
            <nav className="flex-1 flex items-center justify-center space-x-[22px] sm:space-x-[32px] md:space-x-[42px]">
              {activeRoutes.map((item) => (
                <div
                  key={item.id || item.name}
                  className="relative py-[8px]"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={
                      item.slug
                        ? `/category/${item.slug}`
                        : item.href && !item.href.startsWith('#')
                        ? item.href
                        : `/category/${item.name.toLowerCase().replace(/[\s_]+/g, '-')}`
                    }
                    className={`text-[12.5px] sm:text-[13px] tracking-[0.12em] font-medium uppercase transition-colors inline-block ${
                      item.isSale
                        ? 'text-[#cf0c1d] font-bold hover:text-[#e74040]'
                        : 'text-white hover:text-white/75'
                    }`}
                  >
                    {item.name}
                  </Link>

                  {/* Mega dropdown on hover for desktop (if route has columns defined) */}
                  {item.hasDropdown && activeDropdown === item.name && item.columns && (
                    <div className="hidden lg:block absolute top-full left-1/2 -translate-x-1/2 w-[650px] bg-[#121212] border border-[#262626] rounded-b-[4px] shadow-modal p-[25px] z-50 animate-expand">
                      <div className="grid grid-cols-3 gap-[25px] text-left">
                        {item.columns.map((col, idx) => (
                          <div key={idx}>
                            <h5 className="text-[12px] font-bold tracking-[0.15em] text-[#cec72e] uppercase mb-[12px] pb-[6px] border-b border-[#262626]">
                              {col.title}
                            </h5>
                            <ul className="space-y-[8px]">
                              {col.links.map((link, linkIdx) => (
                                <li key={linkIdx}>
                                  <Link
                                    to={
                                      link.href?.startsWith('/')
                                        ? link.href
                                        : `/category/${link.label.toLowerCase().replace(/[\s_]+/g, '-')}`
                                    }
                                    onClick={() => setActiveDropdown(null)}
                                    className="text-[12px] text-white/80 hover:text-white hover:translate-x-1 inline-block transition-all"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Far Right spacer to keep center nav links mathematically centered */}
            <div className="w-[60px]" />
          </div>
        </div>
      </header>

      {/* Slide-out Menu Drawer from Left Hamburger */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-assistant">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
            <div className="w-screen max-w-sm bg-[#121212] text-white shadow-modal flex flex-col border-r border-[#262626] animate-menu-open">
              {/* Drawer Header */}
              <div className="p-[20px] border-b border-[#262626] flex items-center justify-between">
                <div className="flex items-center">
                  {renderLogo(true)}
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-[6px] text-white/80 hover:text-white rounded-full cursor-pointer"
                  aria-label="Close menu drawer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Dynamic Links */}
              <div className="flex-1 overflow-y-auto p-[20px] space-y-[4px]">
                {activeRoutes.map((route) => (
                  <Link
                    key={route.id || route.name}
                    to={
                      route.slug
                        ? `/category/${route.slug}`
                        : route.href && !route.href.startsWith('#')
                        ? route.href
                        : `/category/${route.name.toLowerCase().replace(/[\s_]+/g, '-')}`
                    }
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between py-[12px] text-[14px] font-medium tracking-[0.1em] border-b border-[#222222] transition-colors ${
                      route.isSale
                        ? 'text-[#cf0c1d] font-bold hover:text-[#e74040]'
                        : 'text-white hover:text-white/80'
                    }`}
                  >
                    <span>{route.name}</span>
                    <ChevronRight size={16} className={route.isSale ? 'text-[#cf0c1d]' : 'text-gray-500'} />
                  </Link>
                ))}
              </div>

              {/* Drawer Footer Contact with updated WhatsApp Number */}
              <div className="p-[20px] bg-[#0a0a0a] border-t border-[#262626] space-y-[12px]">
                <div className="flex items-center gap-[10px] text-[13px] text-white/90">
                  <Phone size={16} />
                  <span>UAN: {whatsappNumber}</span>
                </div>
                <div className="flex items-center gap-[10px] text-[13px] text-white/90">
                  <div className="w-[18px] h-[18px] bg-[#25D366] rounded-full flex items-center justify-center">
                    <img src={ASSETS.whatsappIcon} alt="WhatsApp" className="w-[11px] h-[11px]" />
                  </div>
                  <a
                    href={`https://wa.me/${cleanWaNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    WhatsApp: {whatsappNumber}
                  </a>
                </div>
                <div className="pt-[6px] text-[11px] text-white/50">
                  FREE Nationwide Delivery on orders above Rs. 2,490
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone Contact Dialog Modal */}
      {phoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[20px]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPhoneModalOpen(false)}
          />
          <div className="relative bg-white text-[#121212] rounded-[6px] shadow-modal p-[25px] max-w-sm w-full z-10 animate-expand font-assistant">
            <button
              onClick={() => setPhoneModalOpen(false)}
              className="absolute top-[12px] right-[12px] text-gray-400 hover:text-black p-[4px] cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
            <div className="w-[42px] h-[42px] bg-[#121212] text-white rounded-full flex items-center justify-center mb-[15px]">
              <Phone size={20} />
            </div>
            <h4 className="text-[18px] font-bold mb-[6px]">Limelight Customer Care</h4>
            <p className="text-[13px] text-[#121212bf] mb-[15px] leading-relaxed">
              Our support team is available Monday through Saturday from 9:00 AM to 6:00 PM PKT.
            </p>
            <div className="bg-[#f3f3f3] p-[12px] rounded-[4px] mb-[15px] text-center">
              <span className="text-[11px] text-[#121212bf] uppercase tracking-wider block">Official Helpline / WhatsApp</span>
              <a href={`tel:${cleanWaNumber}`} className="text-[18px] font-bold text-[#121212] hover:underline">
                {whatsappNumber}
              </a>
            </div>
            <div className="flex gap-[10px]">
              <a
                href={`tel:${cleanWaNumber}`}
                className="button-primary flex-1 text-center py-[10px] text-[13px] rounded-[3px]"
              >
                CALL NOW
              </a>
              <a
                href={`https://wa.me/${cleanWaNumber}?text=Hello%20Limelight%20Customer%20Support`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] text-white font-medium py-[10px] text-[13px] rounded-[3px] flex items-center justify-center gap-[6px] hover:bg-[#20ba59]"
              >
                WHATSAPP
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
