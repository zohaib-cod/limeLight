import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingBag, Phone, Menu, X, ChevronRight, Sun, Moon } from 'lucide-react';
import { ASSETS } from '../data/products';
import { useTheme } from '../context/ThemeContext';

const WhatsAppIcon = ({ className = "w-[12px] h-[12px]" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.414z"/>
  </svg>
);

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
  const renderLogo = (isDrawer = false, isMobileTop = false) => {
    if (settings.logoType === 'image' && settings.imageLogo?.url) {
      return (
        <img
          src={settings.imageLogo.url}
          alt={settings.imageLogo.alt || 'Zimal Collection'}
          style={{
            maxHeight: isDrawer ? '30px' : isMobileTop ? '38px' : `${settings.imageLogo.height || 34}px`
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

    const fontSize = isDrawer
      ? '13px'
      : isMobileTop
      ? `clamp(14px, 4.8vw, ${baseFontSize}px)`
      : `clamp(16px, 2.2vw, ${baseFontSize}px)`;

    const subtitleColor = isDrawer
      ? (isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(18, 18, 18, 0.7)')
      : (isLightHeader ? 'rgba(18, 18, 18, 0.75)' : 'rgba(255, 255, 255, 0.7)');

    return (
      <div className={`flex flex-col ${isDrawer ? 'items-start text-left' : 'items-center text-center'} leading-none min-w-0 max-w-full px-[2px]`}>
        <span
          style={{ fontSize }}
          className={`inline-flex items-center font-bold uppercase transition-opacity hover:opacity-90 font-visbyBold max-w-full truncate ${
            isDrawer
              ? 'tracking-[0.05em]'
              : isMobileTop
              ? 'tracking-[0.14em]'
              : 'tracking-[0.14em] sm:tracking-[0.2em]'
          }`}
        >
          <span style={{ color: color1 }}>{part1}</span>
          <span style={{ color: color2 }}>{part2}</span>
        </span>
        <span
          style={{ color: subtitleColor }}
          className={`${
            isDrawer
              ? 'text-[6.5px] tracking-[0.05em]'
              : 'text-[7.5px] xs:text-[8.5px] sm:text-[9.5px] tracking-[0.16em] sm:tracking-[0.22em]'
          } font-medium mt-[2px] lowercase font-mono truncate max-w-full`}
        >
          www.zimalcollection.com
        </span>
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full shadow-md select-none font-assistant">
        {/* ========================================================= */}
        {/* =================== MOBILE HEADER (< md) ================= */}
        {/* ========================================================= */}
        <div className="block md:hidden w-full">
          {/* MOBILE ROW 1: BRAND LOGO DEDICATED TOP ROW (Alone on top - "ye uper k side py a jaye akela") */}
          <div
            style={{ backgroundColor: headerBg }}
            className={`w-full border-b transition-colors duration-200 h-[46px] xs:h-[50px] px-[12px] flex items-center justify-center ${
              isLightHeader ? 'border-black/10 text-[#121212]' : 'border-[#222222] text-white'
            }`}
          >
            <Link
              to="/"
              className="inline-flex items-center justify-center cursor-pointer max-w-full text-center"
              title="Zimal Collection Official - www.zimalcollection.com"
            >
              {renderLogo(false, true)}
            </Link>
          </div>

          {/* MOBILE ROW 2: CLEAN ACTION BAR (Menu on Left, Search + User + Bag on Right) */}
          <div
            style={{ backgroundColor: subnavBg }}
            className={`w-full border-b transition-colors duration-200 px-[10px] xs:px-[14px] h-[40px] xs:h-[44px] flex items-center justify-between gap-[8px] ${
              isLightSubnav ? 'border-black/10 text-[#121212]' : 'border-[#222222]/80 text-white'
            }`}
          >
            {/* Left: Clean Hamburger Menu Button */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => setDrawerOpen(true)}
                className={`py-[4px] px-[2px] flex items-center gap-[6px] cursor-pointer hover:opacity-80 transition-opacity ${
                  isLightSubnav ? 'text-[#121212]' : 'text-white'
                }`}
                title="Open Navigation Menu"
                aria-label="Navigation Menu"
              >
                <Menu size={22} strokeWidth={2} />
                <span className="text-[12px] font-bold uppercase tracking-wider">Menu</span>
              </button>
            </div>

            {/* Right: Search + Account + Bag (WhatsApp & Theme Toggle moved into Hamburger Menu) */}
            <div className="flex items-center gap-[10px] xs:gap-[14px] shrink-0">
              {/* Search Icon */}
              <button
                onClick={onOpenSearch}
                className={`p-[4px] cursor-pointer hover:opacity-80 transition-opacity ${
                  isLightSubnav ? 'text-[#121212]' : 'text-white'
                }`}
                title="Search"
                aria-label="Search Catalog"
              >
                <Search size={19} strokeWidth={1.8} />
              </button>

              {/* User Account Icon */}
              <button
                onClick={onOpenAuth}
                className={`p-[4px] relative items-center cursor-pointer hover:opacity-80 transition-opacity ${
                  isLightSubnav ? 'text-[#121212]' : 'text-white'
                }`}
                title={currentUser ? `Logged in as ${currentUser.name}` : "Sign In & Order Tracking"}
                aria-label="User Account"
              >
                <div className="relative">
                  <User size={19} strokeWidth={1.8} />
                  {currentUser && (
                    <span className="absolute -top-[2px] -right-[2px] w-[7px] h-[7px] bg-emerald-400 rounded-full border border-black animate-pulse" />
                  )}
                </div>
              </button>

              {/* Shopping Bag Icon with counter badge */}
              <button
                onClick={onOpenCart}
                className={`p-[4px] relative cursor-pointer hover:opacity-80 transition-opacity ${
                  isLightSubnav ? 'text-[#121212]' : 'text-white'
                }`}
                title="Shopping Bag"
                aria-label="Shopping Bag"
              >
                <ShoppingBag size={19} strokeWidth={1.8} />
                {cartCount > 0 && (
                  <span className="absolute -top-[2px] -right-[4px] bg-[#cf0c1d] text-white text-[9px] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ================== DESKTOP HEADER (>= md) =============== */}
        {/* ========================================================= */}
        <div className="hidden md:block w-full">
          {/* DESKTOP ROW 1: TOP BAR (Phone + WhatsApp | DYNAMIC LOGO | Theme + Search + User + Bag) */}
          <div
            style={{ backgroundColor: headerBg }}
            className={`w-full border-b transition-colors duration-200 ${
              isLightHeader ? 'border-black/10 text-[#121212]' : 'border-[#222222] text-white'
            }`}
          >
            <div className="max-w-[1600px] mx-auto px-[20px] sm:px-[30px] h-[50px] flex items-center justify-between gap-[10px]">
              {/* Left: Phone icon & WhatsApp icon */}
              <div className="flex items-center gap-[12px] shrink-0">
                <button
                  onClick={() => setPhoneModalOpen(true)}
                  className={`hover:opacity-80 transition-opacity p-[3px] flex items-center cursor-pointer ${
                    isLightHeader ? 'text-[#121212]' : 'text-white'
                  }`}
                  title={`Call Support (${whatsappNumber})`}
                  aria-label="Phone Support"
                >
                  <Phone size={17} strokeWidth={1.7} />
                </button>

                <a
                  href={`https://wa.me/${cleanWaNumber}?text=Hello%20Zimal%20Collection%20Customer%20Support`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105 p-[2px] flex items-center"
                  title={`Chat with Zimal Collection on WhatsApp (${whatsappNumber})`}
                  aria-label="WhatsApp Support"
                >
                  <div className="w-[20px] h-[20px] bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <WhatsAppIcon className="w-[12px] h-[12px] fill-white" />
                  </div>
                </a>
              </div>

              {/* Center: Dynamic Brand Logo */}
              <div className="flex-1 flex justify-center items-center min-w-0 px-[4px]">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center cursor-pointer max-w-full"
                  title="Zimal Collection Official - www.zimalcollection.com"
                >
                  {renderLogo(false, false)}
                </Link>
              </div>

              {/* Right: Theme Toggle + Search + Profile + Shopping Bag icons */}
              <div className="flex items-center gap-[14px] shrink-0">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-[5px] rounded-full transition-colors cursor-pointer flex items-center justify-center ${
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

                {/* User Account Icon */}
                <button
                  onClick={onOpenAuth}
                  className={`hover:opacity-80 transition-opacity p-[3px] relative flex items-center gap-[6px] cursor-pointer ${
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
                    <span className="text-[11px] font-medium opacity-90 max-w-[80px] truncate">
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

          {/* DESKTOP ROW 2: SUB-NAV (Hamburger on left | Dynamic Centered Nav Routes) */}
          <div
            style={{ backgroundColor: subnavBg }}
            className={`w-full border-b relative overflow-hidden transition-colors duration-200 ${
              isLightSubnav ? 'border-black/10' : 'border-[#222222]/80'
            }`}
          >
            <div className="max-w-[1600px] mx-auto px-[30px] h-[44px] flex items-center justify-between gap-[8px]">
              {/* Far Left: Hamburger Menu Icon */}
              <div className="flex items-center shrink-0 w-[48px]">
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

              {/* Center: Dynamic Navigation Routes */}
              <nav className="flex-1 flex items-center justify-center gap-[24px] md:gap-[34px] lg:gap-[42px] px-[10px]">
                {activeRoutes.map((item) => (
                  <div
                    key={item.id || item.name}
                    className="relative py-[8px] shrink-0"
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
                      className={`text-[12px] sm:text-[13px] tracking-[0.12em] font-medium uppercase transition-colors inline-block whitespace-nowrap ${
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
              <div className="shrink-0 w-[48px]" />
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Menu Drawer from Left Hamburger */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-assistant">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu backdrop"
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex pr-0 xs:pr-4 sm:pr-8">
            <div className="w-[85vw] max-w-[320px] sm:max-w-sm bg-white dark:bg-[#141414] text-[#121212] dark:text-white shadow-2xl flex flex-col border-r border-gray-200 dark:border-white/10 animate-menu-open transition-colors">
              {/* Drawer Header with Brand Logo & High-Contrast Cut / Close 'X' Button */}
              <div className="px-3.5 py-3 border-b border-gray-200 dark:border-white/10 flex items-center justify-between gap-2 bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="min-w-0 flex-1 flex items-center">
                  {renderLogo(true)}
                </div>
                {/* PROMINENT CLOSE / CUT BUTTON */}
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/15 dark:hover:bg-white/25 text-gray-800 dark:text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm ml-2"
                  title="Close Menu (Cut)"
                  aria-label="Close menu drawer"
                >
                  <X size={18} strokeWidth={2.4} />
                </button>
              </div>

              {/* Direct WhatsApp Support Card */}
              <div className="px-3 py-2 bg-[#25D366]/10 dark:bg-[#25D366]/15 border-b border-[#25D366]/25">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 bg-[#25D366] text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-bold text-gray-900 dark:text-white leading-tight truncate">
                        WhatsApp Support
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {whatsappNumber}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${cleanWaNumber}?text=Hello%20Zimal%20Collection%20Customer%20Support`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-2.5 py-1 bg-[#25D366] text-white text-[10.5px] font-bold rounded-full shadow-sm hover:bg-[#20ba5a] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Chat
                  </a>
                </div>
              </div>

              {/* Theme Mode Switch */}
              <div className="px-3 py-2 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {isDark ? (
                    <Moon size={14} className="text-amber-400 shrink-0" />
                  ) : (
                    <Sun size={14} className="text-amber-500 shrink-0" />
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 truncate">
                    Theme
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-white dark:bg-white/15 shadow-sm border border-gray-200 dark:border-white/20 cursor-pointer text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/25 transition-all"
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDark ? (
                    <>
                      <Sun size={12} className="text-amber-400" />
                      <span>Dark</span>
                    </>
                  ) : (
                    <>
                      <Moon size={12} className="text-gray-700" />
                      <span>Light</span>
                    </>
                  )}
                </button>
              </div>

              {/* Account Quick Access in Drawer */}
              <div className="px-3.5 py-2.5 border-b border-gray-200 dark:border-white/10">
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full flex items-center justify-between text-[13px] font-semibold py-1 text-[#121212] dark:text-white cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-2.5">
                    <User size={16} />
                    <span>{currentUser ? currentUser.name : 'Sign In / My Account'}</span>
                  </div>
                  <ChevronRight size={15} className="text-gray-400" />
                </button>
              </div>

              {/* Drawer Dynamic Links */}
              <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-[2px]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pt-2 pb-1">
                  Categories
                </p>
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
                    className={`flex items-center justify-between py-[11px] text-[13.5px] font-medium tracking-[0.08em] border-b border-gray-100 dark:border-white/5 transition-colors ${
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

              {/* Drawer Bottom Close (Cut) Button */}
              <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0f0f0f] space-y-2">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-[#121212] dark:text-white text-[12px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                  title="Cut / Close Hamburger Menu"
                >
                  <X size={15} strokeWidth={2.4} />
                  <span>Close Menu</span>
                </button>
                <div className="text-[10.5px] text-center text-gray-500 dark:text-white/50">
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
