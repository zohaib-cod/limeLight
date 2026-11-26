import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sliders,
  PlusCircle,
  Eye,
  CheckCircle2,
  Package,
  Truck,
  Activity,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Clock,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Bookmark,
  ShoppingBag,
  Users,
  Compass
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [slides, setSlides] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, slidesRes, actRes, bannersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/slides?all=true'),
        fetch('/api/activities'),
        fetch('/api/banners?admin=true')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (slidesRes.ok) setSlides(await slidesRes.json());
      if (actRes.ok) setActivities(await actRes.json());
      if (bannersRes.ok) setBanners(await bannersRes.json());
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-[30px] font-assistant">
      {/* Welcome Banner with Direct Action Buttons */}
      <div className="bg-[#121212] text-white p-[25px] sm:p-[35px] rounded-[8px] shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-[20px]">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-[40px] -bottom-[40px] w-[250px] h-[250px] bg-[#23ac95]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-[650px]">
          <div className="inline-flex items-center gap-[6px] bg-white/10 px-[10px] py-[4px] rounded-[3px] text-[11px] font-semibold tracking-wider text-[#cec72e] uppercase mb-[10px]">
            <Sparkles size={13} />
            <span>Zimal Collection Control Center • www.zimalcollection.com</span>
          </div>
          <h2 className="text-[24px] sm:text-[30px] font-bold tracking-tight mb-[8px] leading-tight">
            Homepage Hero Slider & Catalog Overview
          </h2>
          <p className="text-[14px] text-white/80 leading-[22px]">
            Manage your seasonal banners, upload high-definition campaign photography, and reorder slider priority instantly for your online shoppers.
          </p>
        </div>

        {/* Action Buttons to navigate to upload page and management */}
        <div className="relative z-10 flex flex-wrap items-center gap-[10px]">
          {/* Main button to directly upload product */}
          <button
            onClick={() => navigate('/admin/products/new?category=Ready%20To%20Wear')}
            className="button-primary bg-[#cec72e] text-[#121212] hover:bg-[#b8db24] font-bold px-[16px] py-[11px] text-[13px] tracking-wider rounded-[4px] flex items-center gap-[6px] shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle size={17} />
            <span>+ Add Ready To Wear</span>
          </button>

          <button
            onClick={() => navigate('/admin/products/new?category=Unstitched')}
            className="bg-white/10 hover:bg-white/20 text-white font-medium px-[15px] py-[11px] text-[13px] rounded-[4px] border border-white/20 flex items-center gap-[6px] transition-colors cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>+ Add Unstitched</span>
          </button>

          <Link
            to="/admin/products"
            className="bg-white/10 hover:bg-white/20 text-white font-medium px-[15px] py-[11px] text-[13px] rounded-[4px] border border-white/20 flex items-center gap-[6px] transition-colors"
          >
            <Package size={16} />
            <span>Products ({stats?.totalProducts ?? 0})</span>
          </Link>

          <Link
            to="/admin/collections"
            className="bg-white/10 hover:bg-white/20 text-white font-medium px-[15px] py-[11px] text-[13px] rounded-[4px] border border-white/20 flex items-center gap-[6px] transition-colors"
          >
            <Bookmark size={16} />
            <span>Collections ({stats?.totalCollections ?? 0})</span>
          </Link>

          <Link
            to="/admin/new-arrivals"
            className="bg-[#cf0c1d] hover:bg-[#b00a18] text-white font-bold px-[15px] py-[11px] text-[13px] rounded-[4px] flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles size={16} />
            <span>New Arrivals ({stats?.totalNewArrivals ?? 0})</span>
          </Link>

          <Link
            to="/admin/banners"
            className="bg-[#23ac95] hover:bg-[#1c8c79] text-white font-bold px-[15px] py-[11px] text-[13px] rounded-[4px] flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
          >
            <Layers size={16} />
            <span>Banners ({banners.length})</span>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-[#121212] hover:bg-black text-white font-bold px-[15px] py-[11px] text-[13px] rounded-[4px] border border-white/20 flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
          >
            <ShoppingBag size={16} className="text-[#cec72e]" />
            <span>Orders ({stats?.totalOrders ?? 0})</span>
          </Link>

          <Link
            to="/admin/users"
            className="bg-purple-900/60 hover:bg-purple-900 text-white font-bold px-[15px] py-[11px] text-[13px] rounded-[4px] border border-purple-400/30 flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
          >
            <Users size={16} className="text-purple-300" />
            <span>Customers ({stats?.totalUsers ?? 0})</span>
          </Link>

          <Link
            to="/admin/navigation"
            className="bg-[#23ac95] hover:bg-[#1c8c79] text-white font-bold px-[15px] py-[11px] text-[13px] rounded-[4px] border border-[#23ac95]/40 flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
          >
            <Compass size={16} />
            <span>Navigation & Logo ({stats?.totalRoutes ?? 0})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-[15px]">
        {/* Card 0: Customer Orders */}
        <div className="bg-white p-[20px] rounded-[6px] border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block">
              Customer Orders
            </span>
            <div className="flex items-baseline gap-[8px] mt-[4px]">
              <span className="text-[28px] font-extrabold text-[#121212]">
                {stats?.totalOrders ?? 0}
              </span>
              {stats?.pendingOrders > 0 && (
                <span className="text-[11px] text-amber-700 bg-amber-100 font-bold px-[6px] py-[1px] rounded">
                  {stats.pendingOrders} New
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-500 mt-[2px]">
              Revenue: <b className="text-[#cf0c1d]">Rs. {(stats?.totalRevenue || 0).toLocaleString()}</b>
            </div>
            <Link
              to="/admin/orders"
              className="text-[12px] text-[#cf0c1d] font-semibold hover:underline inline-flex items-center gap-[4px] mt-[6px]"
            >
              <span>Manage orders</span>
              <ChevronRight size={13} />
            </Link>
          </div>
          <div className="w-[48px] h-[48px] bg-rose-50 text-[#cf0c1d] rounded-[6px] flex items-center justify-center">
            <ShoppingBag size={24} />
          </div>
        </div>
        {/* Card 1: Total Sliders */}
        <div className="bg-white p-[20px] rounded-[6px] border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Sliders
            </span>
            <div className="flex items-baseline gap-[8px] mt-[4px]">
              <span className="text-[28px] font-extrabold text-[#121212]">
                {stats?.totalSlides || slides.length}
              </span>
              <span className="text-[12px] text-emerald-600 font-semibold">
                ({stats?.activeSlides || slides.filter(s => s.isActive !== false).length} Active)
              </span>
            </div>
            <Link
              to="/admin/sliders"
              className="text-[12px] text-[#23ac95] font-semibold hover:underline inline-flex items-center gap-[4px] mt-[6px]"
            >
              <span>View collection</span>
              <ChevronRight size={13} />
            </Link>
          </div>
          <div className="w-[48px] h-[48px] bg-emerald-50 text-emerald-600 rounded-[6px] flex items-center justify-center">
            <Sliders size={24} />
          </div>
        </div>

        {/* Card 2: Catalog Products */}
        <div className="bg-white p-[20px] rounded-[6px] border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block">
              Store Catalog
            </span>
            <div className="flex items-baseline gap-[8px] mt-[4px]">
              <span className="text-[28px] font-extrabold text-[#121212]">
                {stats?.totalProducts ?? 0}
              </span>
              <span className="text-[12px] text-emerald-600 font-semibold">
                ({stats?.activeProducts ?? 0} Active)
              </span>
            </div>
            <div className="text-[11px] text-gray-500 mt-[2px] flex items-center gap-[6px]">
              <span>Unstitched: <b className="text-gray-700">{stats?.unstitchedCount ?? 0}</b></span>
              <span>•</span>
              <span>RTW: <b className="text-purple-700">{stats?.rtwCount ?? 0}</b></span>
            </div>
            <Link
              to="/admin/products"
              className="text-[12px] text-[#23ac95] font-semibold hover:underline inline-flex items-center gap-[4px] mt-[6px]"
            >
              <span>Manage catalog</span>
              <ChevronRight size={13} />
            </Link>
          </div>
          <div className="w-[48px] h-[48px] bg-blue-50 text-blue-600 rounded-[6px] flex items-center justify-center">
            <Package size={24} />
          </div>
        </div>

        {/* Card 3: Feature Highlights */}
        <div className="bg-white p-[20px] rounded-[6px] border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block">
              Feature Highlights
            </span>
            <div className="flex items-baseline gap-[8px] mt-[4px]">
              <span className="text-[28px] font-extrabold text-[#121212]">
                {stats?.totalFeatures ?? 0}
              </span>
              <span className="text-[12px] text-emerald-600 font-semibold">
                ({stats?.activeFeatures ?? 0} Active)
              </span>
            </div>
            <Link
              to="/admin/features"
              className="text-[12px] text-[#23ac95] font-semibold hover:underline inline-flex items-center gap-[4px] mt-[6px]"
            >
              <span>Manage & edit</span>
              <ChevronRight size={13} />
            </Link>
          </div>
          <div className="w-[48px] h-[48px] bg-amber-50 text-amber-600 rounded-[6px] flex items-center justify-center">
            <Sparkles size={24} />
          </div>
        </div>

        {/* Card 4: Navigation Routes & Logo */}
        <div className="bg-white p-[20px] rounded-[6px] border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block">
              Nav Routes & Logo
            </span>
            <div className="flex items-baseline gap-[8px] mt-[4px]">
              <span className="text-[28px] font-extrabold text-[#121212]">
                {stats?.totalRoutes ?? 0}
              </span>
              <span className="text-[12px] text-[#23ac95] font-semibold">
                Routes
              </span>
            </div>
            <div className="text-[11px] text-gray-500 mt-[2px] truncate max-w-[130px]" title={stats?.whatsappNumber || 'Not set'}>
              WA: <b>{stats?.whatsappNumber || 'Not set'}</b>
            </div>
            <Link
              to="/admin/navigation"
              className="text-[12px] text-[#23ac95] font-semibold hover:underline inline-flex items-center gap-[4px] mt-[6px]"
            >
              <span>Manage routes</span>
              <ChevronRight size={13} />
            </Link>
          </div>
          <div className="w-[48px] h-[48px] bg-teal-50 text-[#23ac95] rounded-[6px] flex items-center justify-center">
            <Compass size={24} />
          </div>
        </div>

        {/* Card 5: Backend Health */}
        <div className="bg-white p-[20px] rounded-[6px] border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block">
              System Status
            </span>
            <div className="flex items-center gap-[6px] mt-[6px]">
              <span className="w-[9px] h-[9px] bg-emerald-500 rounded-full inline-block animate-ping"></span>
              <span className="text-[18px] font-bold text-emerald-700">Healthy</span>
            </div>
            <span className="text-[11px] text-gray-500 block mt-[8px]">
              Node.js Express (Port 5000)
            </span>
          </div>
          <div className="w-[48px] h-[48px] bg-purple-50 text-purple-600 rounded-[6px] flex items-center justify-center">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid: Active Sliders Preview + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[25px]">
        {/* Left Column (2 Cols): Active Sliders Table & Management */}
        <div className="lg:col-span-2 bg-white rounded-[6px] border border-gray-200 shadow-sm p-[20px] sm:p-[25px]">
          <div className="flex items-center justify-between pb-[15px] border-b border-gray-200 mb-[20px]">
            <div>
              <h3 className="text-[16px] font-bold text-[#121212]">
                Current Homepage Sliders
              </h3>
              <p className="text-[12px] text-gray-500">
                These banners rotate on your live website in this exact order
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/sliders/new')}
              className="text-[13px] font-bold text-[#23ac95] hover:text-[#198270] flex items-center gap-[4px]"
            >
              <span>+ Upload New</span>
            </button>
          </div>

          {/* Sliders Grid List */}
          <div className="space-y-[12px]">
            {slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="flex items-center gap-[15px] p-[12px] rounded-[6px] bg-[#f9f9f9] border border-gray-200 hover:border-black transition-colors"
              >
                {/* Index */}
                <span className="text-[13px] font-bold text-gray-400 w-[24px]">
                  #{idx + 1}
                </span>

                {/* Thumbnail */}
                <div className="w-[90px] h-[55px] rounded-[4px] overflow-hidden bg-black shrink-0 relative">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[10px] font-bold bg-white text-[#121212] px-[6px] py-[1px] rounded border border-gray-200 uppercase">
                      {slide.badge || 'CAMPAIGN'}
                    </span>
                    {slide.scriptText && (
                      <span className="text-[11px] text-gray-400 italic font-serif">
                        "{slide.scriptText}"
                      </span>
                    )}
                  </div>
                  <h4 className="text-[14px] font-bold text-[#121212] truncate mt-[3px]">
                    {slide.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate">
                    {slide.primaryBtnText} → {slide.primaryBtnLink}
                  </p>
                </div>

                {/* Status & Edit */}
                <div className="flex items-center gap-[10px] shrink-0">
                  <span
                    className={`text-[11px] font-bold px-[8px] py-[3px] rounded-full ${
                      slide.isActive !== false
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {slide.isActive !== false ? 'Live' : 'Hidden'}
                  </span>

                  <button
                    onClick={() => navigate('/admin/sliders')}
                    className="text-[12px] font-medium text-gray-600 hover:text-black underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[20px] pt-[15px] border-t border-gray-200 flex justify-between items-center text-[13px]">
            <span className="text-gray-500">
              Total {slides.length} banners configured
            </span>
            <Link
              to="/admin/sliders"
              className="font-bold text-[#121212] hover:text-[#23ac95] flex items-center gap-[4px]"
            >
              <span>Manage & Reorder All Sliders</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Activity & Quick Store Links */}
        <div className="space-y-[25px]">
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-[6px] border border-gray-200 shadow-sm p-[20px]">
            <h3 className="text-[15px] font-bold text-[#121212] mb-[12px]">
              Direct Navigation
            </h3>
            <div className="space-y-[8px]">
              <button
                onClick={() => navigate('/admin/sliders/new')}
                className="w-full text-left p-[10px] rounded-[5px] bg-[#f8f9fa] hover:bg-black hover:text-white transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-[8px] text-[13px] font-medium">
                  <PlusCircle size={16} className="text-[#23ac95] group-hover:text-[#cec72e]" />
                  <span>Upload Slider Page</span>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => navigate('/admin/sliders')}
                className="w-full text-left p-[10px] rounded-[5px] bg-[#f8f9fa] hover:bg-black hover:text-white transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-[8px] text-[13px] font-medium">
                  <Sliders size={16} className="text-[#23ac95] group-hover:text-[#cec72e]" />
                  <span>All Sliders Grid</span>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => navigate('/admin/features')}
                className="w-full text-left p-[10px] rounded-[5px] bg-[#f8f9fa] hover:bg-black hover:text-white transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-[8px] text-[13px] font-medium">
                  <Sparkles size={16} className="text-[#23ac95] group-hover:text-[#cec72e]" />
                  <span>Feature Highlights Bar (Edit / Update)</span>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => navigate('/admin/products')}
                className="w-full text-left p-[10px] rounded-[5px] bg-[#f8f9fa] hover:bg-black hover:text-white transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-[8px] text-[13px] font-medium">
                  <Package size={16} className="text-[#23ac95] group-hover:text-[#cec72e]" />
                  <span>Product Catalog ({stats?.totalProducts ?? 0} Items)</span>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => navigate('/admin/products/new')}
                className="w-full text-left p-[10px] rounded-[5px] bg-[#f8f9fa] hover:bg-black hover:text-white transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-[8px] text-[13px] font-medium">
                  <PlusCircle size={16} className="text-[#23ac95] group-hover:text-[#cec72e]" />
                  <span>+ Add New Product</span>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-white" />
              </button>

              <button
                onClick={() => navigate('/admin/banners')}
                className="w-full text-left p-[10px] rounded-[5px] bg-[#f8f9fa] hover:bg-black hover:text-white transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-[8px] text-[13px] font-medium">
                  <Layers size={16} className="text-[#23ac95] group-hover:text-[#cec72e]" />
                  <span>Section Banners (Unstitched, RTW)</span>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-white" />
              </button>

              <Link
                to="/"
                className="w-full text-left p-[10px] rounded-[5px] bg-[#f8f9fa] hover:bg-black hover:text-white transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-[8px] text-[13px] font-medium">
                  <ExternalLink size={16} className="text-[#23ac95] group-hover:text-[#cec72e]" />
                  <span>View Public Storefront</span>
                </div>
                <ChevronRight size={14} className="text-gray-400 group-hover:text-white" />
              </Link>
            </div>
          </div>

          {/* Section Banners Quick Card */}
          <div className="bg-white rounded-[6px] border border-gray-200 shadow-sm p-[20px]">
            <div className="flex items-center justify-between mb-[12px]">
              <h3 className="text-[15px] font-bold text-[#121212] flex items-center gap-[6px]">
                <Layers size={16} className="text-[#23ac95]" />
                <span>Editorial Section Banners</span>
              </h3>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-[7px] py-[2px] rounded-full">
                {banners.length} Configured
              </span>
            </div>

            {banners.length > 0 && (
              <div className="space-y-[10px]">
                {banners.slice(0, 2).map((b) => (
                  <div key={b.id} className="p-[10px] bg-gray-50 rounded-[6px] border border-gray-100 flex items-center gap-[10px]">
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-[48px] h-[36px] object-cover rounded-[3px] shrink-0 border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-[#121212] truncate">
                        {b.title}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {b.sectionName || b.watermark || 'Section Banner'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/admin/banners')}
                      className="px-[8px] py-[4px] text-[11px] font-bold bg-white hover:bg-black hover:text-white text-[#121212] border border-gray-300 rounded-[3px] transition-colors cursor-pointer shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/admin/banners')}
              className="w-full mt-[12px] py-[8px] text-[12px] font-bold bg-[#121212] hover:bg-black text-white rounded-[4px] transition-colors cursor-pointer"
            >
              Manage & Upload Banners
            </button>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-[6px] border border-gray-200 shadow-sm p-[20px]">
            <div className="flex items-center justify-between mb-[15px]">
              <h3 className="text-[15px] font-bold text-[#121212] flex items-center gap-[6px]">
                <Clock size={16} className="text-gray-400" />
                <span>Recent System Activity</span>
              </h3>
            </div>

            <div className="space-y-[12px]">
              {activities.slice(0, 6).map((act, i) => (
                <div key={act.id || i} className="flex items-start gap-[10px] pb-[10px] border-b border-gray-100 last:border-none last:pb-0">
                  <div className="w-[8px] h-[8px] rounded-full bg-[#23ac95] mt-[6px] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#121212] leading-tight">
                      {act.action}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate mt-[1px]">
                      {act.details}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-[2px] block">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

