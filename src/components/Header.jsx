import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingBag, Phone, Menu, X, ChevronRight, Sun, Moon } from 'lucide-react';
import { ASSETS } from '../data/products';
import { useTheme } from '../context/ThemeContext';

const DEFAULT_SETTINGS = {
  logoType: 'text',
  textLogo: {
    part1: 'ZIMAL ',
    part2: 'COLLECTION',
    color1: '#23ac95',
    color2: '#cec72e',
    fontSize: 22
  },
  headerBg: '#000000',
  subnavBg: '#000000',
  imageLogo: {
    url: '',
    alt: 'Zimal Collection Official (www.zimalcollection.com)',
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
          { label: 'Winter Velvet Drop', href: '#collections' },
          { label: 'Luxury Karandi Edit', href: '#collections' },
          { label: 'Signature Co-Ords', href: '#collections' },
          { label: 'Festive Pret Looks', href: '#collections' }
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
        title: 'EASTERN WEAR',
        href: '#men',
        links: [
          { label: 'Unstitched Latha & Cotton', href: '#men' },
          { label: 'Embroidered Kurta Pajama', href: '#men' },
          { label: 'Solid Casual Kurtas', href: '#men' },
          { label: 'Waistcoats & Nehru Jackets', href: '#men' }
        ]
      }
    ]
  },
  {
    id: 'nav-4',
    name: 'GIRLS',
    href: '#collections',
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

const isColorLight = (hexColor) => {
  if (!hexColor || typeof hexColor !== 'string') return false;
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128;
};

export default function Header({
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenSearch,
  onOpenWishlist,
  currentUser,
  onOpenAuth
}) {
  const { isDark, toggleTheme } = useTheme();
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
    // 1. Fetch settings (branding, logo, whatsapp, header background)
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

    // Listen to admin update events
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

  // Background and luminance handling
  const rawHeaderBg = settings.headerBg || '#000000';
  const rawSubnavBg = settings.subnavBg || settings.headerBg || '#000000';

  // In dark mode: if admin set a bright white header, adapt smoothly or retain
  const headerBg = isDark
    ? (isColorLight(rawHeaderBg) ? '#141414' : rawHeaderBg)
    : rawHeaderBg;

  const subnavBg = isDark
    ? (isColorLight(rawSubnavBg) ? '#181818' : rawSubnavBg)
    : rawSubnavBg;

  const isLightHeader = isColorLight(headerBg);
  const isLightSubnav = isColorLight(subnavBg);

  // Render Dynamic Logo Helper
  const renderLogo = (isDrawer = false) => {
    if (settings.logoType === 'image' && settings.imageLogo?.url) {
      return (
        <img
          src={settings.imageLogo.url}
          alt={settings.imageLogo.alt || 'Zimal Collection'}
          style={{
            maxHeight: isDrawer ? '30px' : `${settings.imageLogo.height || 34}px`
          }}
          className="object-contain inline-block transition-transform hover:opacity-95"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }

    let part1 = settings.textLogo?.part1;
    let part2 = settings.textLogo?.part2;
    if (!part1 || part1.trim() === 'LIME') part1 = 'ZIMAL ';
    if (!part2 || part2.trim() === 'LIGHT') part2 = 'COLLECTION';
    const color1 = settings.textLogo?.part1Color || settings.textLogo?.color1 || '#23ac95';
    const color2 = settings.textLogo?.part2Color || settings.textLogo?.color2 || '#cec72e';
    const rawSize = settings.textLogo?.fontSize || 22;
    const baseFontSize = typeof rawSize === 'string' ? parseInt(rawSize, 10) || 22 : rawSize;

    return (
      <div className="flex flex-col items-center leading-none text-center min-w-0 max-w-full px-[1px]">
        <span
          style={{
            fontSize: isDrawer ? '16px' : `clamp(10.5px, 3.2vw, ${baseFontSize}px)`
          }}
          className="inline-flex items-center tracking-[0.06em] xs:tracking-[0.12em] sm:tracking-[0.2em] font-bold uppercase transition-opacity hover:opacity-90 font-visbyBold max-w-full truncate"
        >
          <span style={{ color: color1 }}>{part1}</span>
          <span style={{ color: color2 }}>{part2}</span>
        </span>
        <span
          style={{
            color: isDrawer
              ? (isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(18, 18, 18, 0.7)')
              : (isLightHeader ? 'rgba(18, 18, 18, 0.75)' : 'rgba(255, 255, 255, 0.7)')
          }}
          className="text-[6.5px] xs:text-[8px] sm:text-[9.5px] tracking-[0.06em] xs:tracking-[0.14em] sm:tracking-[0.22em] font-medium mt-[2px] lowercase font-mono truncate max-w-full"
        >
          www.zimalcollection.com
        </span>
      </div>
    );
  };

  return (
    <>
      <header
        style={{ backgroundColor: headerBg }}
        className={`sticky top-0 z-40 w-full shadow-md select-none font-assistant transition-colors duration-200 ${
          isLightHeader ? 'text-[#121212]' : 'text-white'
        }`}
      >
        {/* ROW 1: TOP BAR (Phone + WhatsApp | DYNAMIC LOGO | Theme + Search + User + Bag) */}
        <div
          className={`w-full border-b transition-colors duration-200 ${
            isLightHeader ? 'border-black/10' : 'border-[#222222]'
          }`}
        >
          <div className="max-w-[1600px] mx-auto px-[8px] xs:px-[14px] sm:px-[30px] h-[46px] sm:h-[50px] flex items-center justify-between gap-[6px]">
            {/* Left: Phone icon & WhatsApp icon */}
            <div className="flex items-center gap-[6px] sm:gap-[12px] shrink-0">
              {/* Phone trigger (hidden on ultra small screens <320px to give room to logo, WhatsApp remains) */}
              <button
                onClick={() => setPhoneModalOpen(true)}
                className={`hover:opacity-80 transition-opacity p-[3px] items-center cursor-pointer hidden xs:flex ${
                  isLightHeader ? 'text-[#121212]' : 'text-white'
                }`}
                title={`Call Support (${whatsappNumber})`}
                aria-label="Phone Support"
              >
                <Phone size={17} strokeWidth={1.7} />
              </button>

              {/* WhatsApp direct chat icon */}
              <a
                href={`https://wa.me/${cleanWaNumber}?text=Hello%20Zimal%20Collection%20Customer%20Support`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105 p-[2px] flex items-center"
                title={`Chat with Zimal Collection on WhatsApp (${whatsappNumber})`}
                aria-label="WhatsApp Support"
              >
                <div className="w-[20px] h-[20px] bg-[#25D366] rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <img
                    src={ASSETS.whatsappIcon}
                    alt="WhatsApp"
                    className="w-[12px] h-[12px]"
                  />
                </div>
              </a>
            </div>

            {/* Center: Dynamic Brand Logo (Centered, responsive text clamp) */}
            <div className="flex-1 flex justify-center items-center min-w-0 px-[4px]">
              <Link
                to="/"
                className="inline-flex items-center justify-center cursor-pointer max-w-full"
                title="Zimal Collection Official - www.zimalcollection.com"
              >
                {renderLogo(false)}
              </Link>
            </div>

            {/* Right: Theme Toggle + Search + Profile + Shopping Bag icons */}
            <div className="flex items-center gap-[4px] xs:gap-[8px] sm:gap-[14px] shrink-0">
              {/* Theme Toggle (Light / Dark Mode) */}
              <button
                onClick={toggleTheme}
                className={`p-[4px] sm:p-[5px] rounded-full transition-colors cursor-pointer flex items-center justify-center ${
                  isLightHeader
                    ? 'text-[#121212] hover:bg-black/10'
                    : 'text-white hover:bg-white/10'
                }`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Light/Dark Theme"
              >
                {isDark ? (
                  <Sun size={17} className="text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon size={17} className="hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* Search Icon */}
              <button
                onClick={onOpenSearch}
                className={`hover:opacity-80 transition-opacity p-[3px] cursor-pointer ${
                  isLightHeader ? 'text-[#121212]' : 'text-white'
                }`}
                title="Search"
                aria-label="Search Catalog"
              >
                <Search size={18} strokeWidth={1.7} />
              </button>

              {/* User Account Icon (hidden on tiny screens <300px, accessible via drawer) */}
              <button
                onClick={onOpenAuth}
                className={`hover:opacity-80 transition-opacity p-[3px] relative items-center gap-[6px] cursor-pointer hidden xs:flex ${
                  isLightHeader ? 'text-[#121212]' : 'text-white'
                }`}
                title={currentUser ? `Logged in as ${currentUser.name}` : "Sign In & Order Tracking"}
                aria-label="User Account"
              >
                <div className="relative">
                  <User size={18} strokeWidth={1.7} />
                  {currentUser && (
                    <span className="absolute -top-[2px] -right-[2px] w-[8px] h-[8px] bg-emerald-400 rounded-full border border-black animate-pulse" />
                  )}
                </div>
                {currentUser && (
                  <span className="hidden md:inline text-[11px] font-medium opacity-90 max-w-[80px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                )}
              </button>

              {/* Shopping Bag Icon with counter badge */}
              <button
                onClick={onOpenCart}
                className={`hover:opacity-80 transition-opacity p-[3px] relative cursor-pointer ${
                  isLightHeader ? 'text-[#121212]' : 'text-white'
                }`}
                title="Shopping Bag"
                aria-label="Shopping Bag"
              >
                <ShoppingBag size={18} strokeWidth={1.7} />
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
        <div
          style={{ backgroundColor: subnavBg }}
          className={`w-full border-b relative overflow-hidden transition-colors duration-200 ${
            isLightSubnav ? 'border-black/10' : 'border-[#222222]/80'
          }`}
        >
          <div className="max-w-[1600px] mx-auto px-[8px] sm:px-[30px] h-[38px] sm:h-[44px] flex items-center justify-between gap-[8px]">
            {/* Far Left: Hamburger Menu Icon */}
            <div className="flex items-center shrink-0 w-[32px] sm:w-[48px]">
              <button
                onClick={() => setDrawerOpen(true)}
                className={`p-[3px] focus:outline-none flex items-center justify-center cursor-pointer hover:opacity-80 ${
                  isLightSubnav ? 'text-[#121212]' : 'text-white'
                }`}
                title="Navigation Menu"
                aria-label="Open Navigation Menu"
              >
                <Menu size={20} strokeWidth={1.8} />
              </button>
            </div>

            {/* Center: Dynamic Navigation Routes (smooth horizontal swipe on mobile, centered on desktop) */}
            <nav className="flex-1 flex items-center overflow-x-auto no-scrollbar whitespace-nowrap justify-start md:justify-center gap-[14px] sm:gap-[24px] md:gap-[34px] lg:gap-[42px] px-[2px] sm:px-[10px]">
              {activeRoutes.map((item) => (
                <div
                  key={item.id || item.name}
                  className="relative py-[6px] sm:py-[8px] shrink-0"
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
                    className={`text-[11.5px] sm:text-[13px] tracking-[0.08em] sm:tracking-[0.12em] font-medium uppercase transition-colors inline-block whitespace-nowrap ${
                      item.isSale
                        ? 'text-[#cf0c1d] font-bold hover:text-[#e74040]'
                        : isLightSubnav
                        ? 'text-[#121212] hover:text-[#121212]/75'
                        : 'text-white hover:text-white/75'
                    }`}
                  >
                    {item.name}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {item.hasDropdown && activeDropdown === item.name && item.columns && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] bg-white dark:bg-[#1a1a1a] text-[#121212] dark:text-white shadow-2xl rounded-b-[6px] border border-gray-200 dark:border-white/10 p-[25px] z-50 animate-fadeIn font-assistant">
                      <div className="grid grid-cols-3 gap-[25px]">
                        {item.columns.map((col, idx) => (
                          <div key={idx} className="space-y-[12px]">
                            <h4 className="text-[13px] font-bold tracking-[0.15em] text-[#121212] dark:text-white uppercase pb-[6px] border-b border-gray-100 dark:border-white/10">
                              {col.title}
                            </h4>
                            <ul className="space-y-[8px]">
                              {col.links.map((link, lIdx) => (
                                <li key={lIdx}>
                                  <Link
                                    to={link.href.startsWith('#') ? `/category/${link.label.toLowerCase().replace(/[\s_]+/g, '-')}` : link.href}
                                    className="text-[13px] text-[#121212bf] dark:text-gray-300 hover:text-[#121212] dark:hover:text-white transition-colors block"
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

            {/* Far Right spacer on desktop to keep center nav links visually centered */}
            <div className="hidden md:block shrink-0 w-[32px] sm:w-[48px]" />
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

          <div className="fixed inset-y-0 left-0 max-w-full flex pr-8">
            <div className="w-screen max-w-xs sm:max-w-sm bg-white dark:bg-[#141414] text-[#121212] dark:text-white shadow-modal flex flex-col border-r border-gray-200 dark:border-white/10 animate-menu-open transition-colors">
              {/* Drawer Header */}
              <div className="p-[16px] sm:p-[20px] border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center">
                  {renderLogo(true)}
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-[6px] text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded-full cursor-pointer"
                  aria-label="Close menu drawer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Appearance Theme Switch Row in Drawer */}
              <div className="px-[16px] py-[12px] bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Theme Appearance
                </span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-[6px] px-[10px] py-[5px] rounded-full text-[12px] font-semibold bg-white dark:bg-white/10 shadow-sm border border-gray-200 dark:border-white/10 cursor-pointer"
                >
                  {isDark ? (
                    <>
                      <Sun size={14} className="text-amber-400" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon size={14} className="text-gray-700" />
                      <span>Light Mode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Account Quick Access in Drawer */}
              <div className="px-[16px] py-[10px] border-b border-gray-200 dark:border-white/10">
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full flex items-center justify-between text-[13px] font-semibold py-[6px] text-[#121212] dark:text-white cursor-pointer"
                >
                  <div className="flex items-center gap-[8px]">
                    <User size={16} />
                    <span>{currentUser ? currentUser.name : 'Sign In / My Account'}</span>
                  </div>
                  <ChevronRight size={15} className="text-gray-400" />
                </button>
              </div>

              {/* Drawer Dynamic Links */}
              <div className="flex-1 overflow-y-auto p-[16px] sm:p-[20px] space-y-[4px]">
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
                    className={`flex items-center justify-between py-[12px] text-[13.5px] font-medium tracking-[0.1em] border-b border-gray-100 dark:border-white/5 transition-colors ${
                      route.isSale
                        ? 'text-[#cf0c1d] font-bold hover:text-[#e74040]'
                        : 'text-[#121212] dark:text-gray-200 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <span>{route.name}</span>
                    <ChevronRight size={16} className={route.isSale ? 'text-[#cf0c1d]' : 'text-gray-400'} />
                  </Link>
                ))}
              </div>

              {/* Drawer Footer Contact with WhatsApp Number */}
              <div className="p-[16px] sm:p-[20px] bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/10 space-y-[10px]">
                <div className="flex items-center gap-[10px] text-[12.5px] text-gray-700 dark:text-gray-300">
                  <Phone size={15} />
                  <span>UAN: {whatsappNumber}</span>
                </div>
                <div className="flex items-center gap-[10px] text-[12.5px] text-gray-700 dark:text-gray-300">
                  <div className="w-[18px] h-[18px] bg-[#25D366] rounded-full flex items-center justify-center shrink-0">
                    <img src={ASSETS.whatsappIcon} alt="WhatsApp" className="w-[11px] h-[11px]" />
                  </div>
                  <a
                    href={`https://wa.me/${cleanWaNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline font-semibold"
                  >
                    WhatsApp Support
                  </a>
                </div>
                <div className="pt-[4px] text-[11px] text-gray-500 dark:text-white/50">
                  FREE Nationwide Delivery on orders above Rs. 2,490
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Care Phone Direct Modal */}
      {phoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[20px] font-assistant">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPhoneModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-[#1a1a1a] text-[#121212] dark:text-white rounded-[6px] shadow-modal p-[25px] max-w-sm w-full z-10 animate-expand font-assistant border dark:border-white/10">
            <button
              onClick={() => setPhoneModalOpen(false)}
              className="absolute top-[12px] right-[12px] text-gray-400 hover:text-black dark:hover:text-white p-[4px] cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
            <div className="w-[42px] h-[42px] bg-[#121212] dark:bg-white text-white dark:text-[#121212] rounded-full flex items-center justify-center mb-[15px]">
              <Phone size={20} />
            </div>
            <h4 className="text-[18px] font-bold mb-[6px]">Zimal Collection Customer Care</h4>
            <p className="text-[13px] text-[#121212bf] dark:text-gray-300 mb-[15px] leading-relaxed">
              Our support team is available Monday through Saturday from 9:00 AM to 6:00 PM PKT.
            </p>
            <div className="bg-[#f3f3f3] dark:bg-white/5 p-[12px] rounded-[4px] mb-[15px] text-center border dark:border-white/10">
              <span className="text-[11px] text-[#121212bf] dark:text-gray-400 uppercase tracking-wider block">Official Helpline / WhatsApp</span>
              <a href={`tel:${cleanWaNumber}`} className="text-[18px] font-bold text-[#121212] dark:text-white hover:underline">
                {whatsappNumber}
              </a>
            </div>
            <div className="flex gap-[10px]">
              <a
                href={`tel:${cleanWaNumber}`}
                className="button-primary flex-1 text-center py-[10px] text-[13px] rounded-[3px] bg-[#121212] dark:bg-white text-white dark:text-black font-semibold"
              >
                CALL NOW
              </a>
              <a
                href={`https://wa.me/${cleanWaNumber}?text=Hello%20Zimal%20Collection%20Customer%20Support`}
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
