import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Sliders,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Server,
  Sparkles,
  Layers,
  Package,
  ArrowLeft,
  Bookmark,
  ShoppingBag,
  Users,
  Compass,
  Mail,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.warn('Could not load stats:', err));
  }, [location.pathname]);

  const navLinks = [
    {
      name: 'Main Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Customer Orders',
      path: '/admin/orders',
      icon: ShoppingBag,
      badge: stats?.pendingOrders ? `${stats.pendingOrders} NEW` : (stats?.totalOrders ? `${stats.totalOrders}` : null)
    },
    {
      name: 'Registered Customers',
      path: '/admin/users',
      icon: Users,
      badge: stats ? `${stats.totalUsers || 3}` : '3'
    },
    {
      name: 'Navigation & Branding',
      path: '/admin/navigation',
      icon: Compass,
      badge: stats ? `${stats.totalRoutes || 5}` : '5'
    },
    {
      name: 'Footer & Newsletter',
      path: '/admin/footer',
      icon: Mail,
      badge: stats?.totalSubscribers !== undefined ? `${stats.totalSubscribers}` : null
    },
    {
      name: 'Manage Sliders',
      path: '/admin/sliders',
      icon: Sliders,
      badge: stats ? `${stats.totalSlides}` : null
    },
    {
      name: 'Upload Slider',
      path: '/admin/sliders/new',
      icon: PlusCircle,
      badge: 'NEW'
    },
    {
      name: 'Feature Highlights',
      path: '/admin/features',
      icon: Sparkles,
      badge: stats ? `${stats.totalFeatures || 4}` : '4'
    },
    {
      name: 'Section Banners',
      path: '/admin/banners',
      icon: Layers,
      badge: stats ? `${stats.totalBanners || 1}` : '1'
    },
    {
      name: 'Curated Collections',
      path: '/admin/collections',
      icon: Bookmark,
      badge: stats ? `${stats.totalCollections || 4}` : '4'
    },
    {
      name: 'New Arrivals',
      path: '/admin/new-arrivals',
      icon: Sparkles,
      badge: stats ? `${stats.totalNewArrivals || 4}` : '4'
    },
    {
      name: 'Product Catalog',
      path: '/admin/products',
      icon: Package,
      badge: stats ? `${stats.totalProducts}` : null
    },
    {
      name: 'Add Product',
      path: '/admin/products/new',
      icon: PlusCircle,
      badge: 'NEW'
    }
  ];

  return (
    <div className="min-h-screen flex bg-[#f8f9fa] text-[#121212] font-assistant antialiased relative">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Responsive drawer on mobile, fixed sidebar on desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#121212] text-white flex flex-col justify-between shrink-0 shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Brand header */}
          <div className="p-[20px] border-b border-[#262626] flex items-center justify-between">
            <Link to="/admin" className="flex flex-col group">
              <div className="flex items-center tracking-[0.2em] text-[16px] font-bold">
                <span className="text-[#23ac95]">ZIMAL</span>
                <span className="text-[#cec72e] ml-[4px]">COLLECTION</span>
              </div>
              <span className="text-[8.5px] tracking-[0.2em] text-white/50 lowercase mt-[2px]">
                www.zimalcollection.com
              </span>
            </Link>
            <div className="flex items-center gap-[6px]">
              <span className="bg-[#23ac95]/20 text-[#23ac95] text-[10px] font-bold px-[6px] py-[2px] rounded border border-[#23ac95]/40">
                v1.0
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden text-white/60 hover:text-white p-[2px]"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-[15px] space-y-[4px]">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] px-[12px] py-[8px]">
              Store Management
            </div>

            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-[14px] py-[10px] rounded-[5px] text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-white text-[#121212] font-bold shadow-md'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-[10px]">
                    <Icon size={17} className={isActive ? 'text-[#121212]' : 'text-white/70'} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-[6px] py-[1px] rounded ${
                        isActive
                          ? 'bg-[#121212] text-white'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] px-[12px] pt-[20px] pb-[8px]">
              Public Website
            </div>

            {/* Direct button to public store */}
            <Link
              to="/"
              className="flex items-center justify-between px-[14px] py-[10px] rounded-[5px] text-[13px] text-white/80 hover:bg-white/10 hover:text-white transition-all border border-white/10 hover:border-white/30"
            >
              <div className="flex items-center gap-[10px]">
                <ExternalLink size={16} className="text-[#cec72e]" />
                <span>View Live Storefront</span>
              </div>
              <ChevronRight size={14} className="text-white/40" />
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer System status */}
        <div className="p-[15px] border-t border-[#262626] bg-[#0c0c0c] text-[11px] text-white/60 space-y-[6px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-[6px]">
              <span className="w-[7px] h-[7px] bg-emerald-400 rounded-full inline-block animate-pulse"></span>
              <span>MongoDB Atlas</span>
            </span>
            <span className="text-emerald-400 font-bold">Connected</span>
          </div>
          <div className="flex items-center justify-between text-white/50 text-[10px]">
            <span>Cloudinary: <b>qzkctjzg</b></span>
            <span className="text-emerald-400">Groq AI: <b>Active</b></span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-[56px] sm:h-[60px] bg-white border-b border-gray-200 px-[15px] sm:px-[25px] flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-[8px] sm:gap-[10px] min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-[6px] text-gray-700 hover:text-black hover:bg-gray-100 rounded-[4px] cursor-pointer mr-[4px]"
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>
            <span className="text-[12px] text-gray-500 font-medium hidden sm:inline">Admin Panel</span>
            <ChevronRight size={14} className="text-gray-400 hidden sm:inline" />
            <span className="text-[13px] sm:text-[14px] font-bold text-[#121212] truncate">
              {location.pathname === '/admin' && 'Overview Dashboard'}
              {location.pathname === '/admin/orders' && 'Customer Orders'}
              {location.pathname === '/admin/users' && 'Registered Customers'}
              {location.pathname === '/admin/navigation' && 'Navigation Routes & Brand Logo'}
              {location.pathname === '/admin/sliders' && 'Hero Slider Management'}
              {location.pathname === '/admin/sliders/new' && 'Upload New Slider'}
              {location.pathname === '/admin/features' && 'Feature Highlights Bar'}
              {location.pathname === '/admin/banners' && 'Section Editorial Banners'}
              {location.pathname === '/admin/collections' && 'Curated Collections'}
              {location.pathname === '/admin/new-arrivals' && 'New Arrivals'}
              {location.pathname === '/admin/products' && 'Product Catalog'}
              {location.pathname === '/admin/products/new' && 'Add Product'}
            </span>
          </div>

          {/* Action buttons on top bar */}
          <div className="flex items-center gap-[12px]">
            {/* Quick Upload Button */}
            <Link
              to="/admin/sliders/new"
              className="button-primary bg-[#121212] text-white hover:bg-black text-[12px] font-semibold px-[14px] py-[8px] rounded-[4px] flex items-center gap-[6px] shadow-sm transition-transform active:scale-95"
            >
              <PlusCircle size={15} />
              <span>Upload Slider</span>
            </Link>

            {/* View Storefront Button */}
            <Link
              to="/"
              className="bg-[#f3f3f3] hover:bg-gray-200 text-[#121212] text-[12px] font-semibold px-[14px] py-[8px] rounded-[4px] flex items-center gap-[6px] border border-gray-300 transition-colors"
            >
              <ExternalLink size={14} />
              <span>Open Storefront</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-[25px] sm:p-[35px] max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

