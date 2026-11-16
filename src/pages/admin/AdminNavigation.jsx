import React, { useState, useEffect } from 'react';
import {
  Compass,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Package,
  Layers,
  Image as ImageIcon,
  Type,
  Phone,
  Save,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  ArrowUpRight,
  Upload,
  Link as LinkIcon,
  Tag,
  XCircle,
  X,
  Power,
  ArrowUp,
  ArrowDown,
  GripVertical,
  RotateCcw,
  Check,
  CheckCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

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

export default function AdminNavigation() {
  const navigate = useNavigate();
  const [activeTab, setActiveTabState] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'branding' || tab === 'sections' || tab === 'routes') return tab;
    } catch (e) {}
    return 'routes';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
  };
  const [routes, setRoutes] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [savingSections, setSavingSections] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    logoType: 'text',
    textLogo: {
      part1: 'ZIMAL ',
      part2: 'COLLECTION',
      part1Color: '#23ac95',
      part2Color: '#cec72e',
      singleText: 'www.zimalcollection.com',
      letterSpacing: '0.22em',
      fontSize: '22px'
    },
    headerBg: '#000000',
    subnavBg: '#000000',
    imageLogo: {
      url: '',
      alt: 'Zimal Collection Official (www.zimalcollection.com)',
      height: 34
    },
    whatsappNumber: '+92 345 7867016'
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Route Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [routeForm, setRouteForm] = useState({
    name: '',
    slug: '',
    href: '',
    isSale: false,
    isActive: true,
    description: ''
  });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Load Navigation, Settings and Sections
  const loadData = async () => {
    try {
      setLoading(true);
      const [navRes, setRes, secRes] = await Promise.all([
        fetch('/api/navigation?all=true'),
        fetch('/api/settings'),
        fetch('/api/sections')
      ]);

      if (navRes.ok) {
        const navData = await navRes.json();
        setRoutes(navData);
      }
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettings(setData);
      }
      if (secRes.ok) {
        const secData = await secRes.json();
        setSections(secData);
      }
    } catch (err) {
      console.warn('Error loading navigation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Settings Handler
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      // Update localStorage & notify storefront
      localStorage.setItem('limelight_settings', JSON.stringify(data.settings));
      window.dispatchEvent(new CustomEvent('limelight_settings_change', { detail: data.settings }));

      showFeedback('success', 'Brand Logo & Site Settings saved successfully!');
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Logo file upload handler
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      setUploadingLogo(true);
      const res = await fetch('/api/settings/logo-upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload logo');

      setSettings(prev => ({
        ...prev,
        logoType: 'image',
        imageLogo: {
          ...prev.imageLogo,
          url: data.logoUrl
        }
      }));

      localStorage.setItem('limelight_settings', JSON.stringify(data.settings));
      window.dispatchEvent(new CustomEvent('limelight_settings_change', { detail: data.settings }));

      showFeedback('success', 'Custom logo uploaded and applied!');
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Add / Edit Route Submit
  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    if (!routeForm.name.trim()) {
      alert('Route name is required');
      return;
    }

    try {
      const url = editingRoute ? `/api/navigation/${editingRoute.id}` : '/api/navigation';
      const method = editingRoute ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save route');

      setModalOpen(false);
      setEditingRoute(null);
      setRouteForm({
        name: '',
        slug: '',
        href: '',
        isSale: false,
        isActive: true,
        description: ''
      });

      loadData();
      showFeedback('success', editingRoute ? 'Route updated!' : 'New route added successfully!');
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  // Delete Route
  const handleDeleteRoute = async (route) => {
    if (!window.confirm(`Are you sure you want to delete navigation route "${route.name}"?`)) return;

    try {
      const res = await fetch(`/api/navigation/${route.id}`, { method: 'DELETE' });
      if (res.ok) {
        setRoutes(prev => prev.filter(r => r.id !== route.id));
        showFeedback('success', `Route "${route.name}" deleted.`);
      }
    } catch (err) {
      showFeedback('error', 'Failed to delete route');
    }
  };

  // Toggle Route Active / Deactivate (hide without deleting)
  const handleToggleActive = async (route) => {
    const newStatus = route.isActive === false ? true : false;
    try {
      const res = await fetch(`/api/navigation/${route.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update route status');

      const updatedRoutes = routes.map(r => r.id === route.id ? { ...r, isActive: newStatus } : r);
      setRoutes(updatedRoutes);

      // Sync with localStorage and notify Storefront Header
      localStorage.setItem('limelight_navigation', JSON.stringify(updatedRoutes));
      window.dispatchEvent(new CustomEvent('limelight_navigation_change', { detail: updatedRoutes }));

      showFeedback(
        'success',
        newStatus
          ? `Route "${route.name}" is now ACTIVE and visible on Storefront.`
          : `Route "${route.name}" is now DEACTIVATED (hidden from Storefront).`
      );
    } catch (err) {
      showFeedback('error', err.message || 'Failed to toggle route status');
    }
  };

  // Section Reorder & Visibility Handlers
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newSections = [...sections];
    const temp = newSections[index - 1];
    newSections[index - 1] = newSections[index];
    newSections[index] = temp;
    newSections.forEach((s, i) => s.order = i + 1);
    setSections(newSections);
  };

  const handleMoveDown = (index) => {
    if (index >= sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index + 1];
    newSections[index + 1] = newSections[index];
    newSections[index] = temp;
    newSections.forEach((s, i) => s.order = i + 1);
    setSections(newSections);
  };

  const handleReorder = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const newSections = [...sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);
    newSections.forEach((s, i) => s.order = i + 1);
    setSections(newSections);
  };

  const handleToggleSection = (sectionId) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, enabled: s.enabled === false ? true : false };
      }
      return s;
    }));
  };

  const handleSaveSections = async () => {
    try {
      setSavingSections(true);
      const res = await fetch('/api/sections/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save section layout');

      setSections(data.sections);
      localStorage.setItem('limelight_sections', JSON.stringify(data.sections));
      window.dispatchEvent(new CustomEvent('limelight_sections_change', { detail: data.sections }));

      showFeedback('success', 'Homepage sections order updated and saved live to database!');
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setSavingSections(false);
    }
  };

  const handleResetSections = async () => {
    if (!window.confirm('Reset homepage sections to the original default layout?')) return;
    try {
      setSavingSections(true);
      const res = await fetch('/api/sections/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset sections');

      setSections(data.sections);
      localStorage.setItem('limelight_sections', JSON.stringify(data.sections));
      window.dispatchEvent(new CustomEvent('limelight_sections_change', { detail: data.sections }));

      showFeedback('success', 'Homepage sections restored to default layout.');
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setSavingSections(false);
    }
  };

  const openAddModal = () => {
    setEditingRoute(null);
    setRouteForm({
      name: '',
      slug: '',
      href: '',
      isSale: false,
      isActive: true,
      description: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (route) => {
    setEditingRoute(route);
    setRouteForm({
      name: route.name || '',
      slug: route.slug || '',
      href: route.href || (route.slug ? `/category/${route.slug}` : ''),
      isSale: Boolean(route.isSale),
      isActive: route.isActive !== false,
      description: route.description || ''
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-[25px] font-assistant">
      {/* Top Header */}
      <div className="bg-white p-[25px] rounded-[8px] border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-[20px]">
        <div>
          <div className="flex items-center gap-[8px] text-[12px] font-bold text-[#23ac95] uppercase tracking-wider mb-[4px]">
            <Compass size={15} />
            <span>Storefront Layout, Routes & Brand Center</span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#121212] tracking-tight">
            Navigation Routes, Sections & Branding
          </h1>
          <p className="text-[13px] text-gray-500 mt-[2px]">
            Manage dedicated route category pages, drag and drop homepage sections to reorder them, and customize your brand logo and hotline.
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          {activeTab === 'routes' && (
            <button
              onClick={openAddModal}
              className="px-[14px] py-[9px] bg-[#cf0c1d] hover:bg-[#b00a18] text-white rounded-[4px] text-[13px] font-semibold flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>+ Add Navigation Route</span>
            </button>
          )}

          {activeTab === 'sections' && (
            <div className="flex items-center gap-[8px]">
              <button
                onClick={handleResetSections}
                disabled={savingSections}
                className="px-[12px] py-[9px] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-[4px] text-[13px] font-semibold flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
                title="Reset to default order"
              >
                <RotateCcw size={14} />
                <span>Reset Layout</span>
              </button>
              <button
                onClick={handleSaveSections}
                disabled={savingSections}
                className="px-[16px] py-[9px] bg-[#121212] hover:bg-black text-white rounded-[4px] text-[13px] font-semibold flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
              >
                <Save size={15} />
                <span>{savingSections ? 'Saving Layout...' : 'Save Section Order'}</span>
              </button>
            </div>
          )}

          {activeTab === 'branding' && (
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-[16px] py-[9px] bg-[#121212] hover:bg-black text-white rounded-[4px] text-[13px] font-semibold flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
            >
              <Save size={15} />
              <span>{savingSettings ? 'Saving...' : 'Save Branding'}</span>
            </button>
          )}

          <button
            onClick={loadData}
            className="px-[12px] py-[9px] bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-[4px] text-[13px] font-semibold flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-[14px] rounded-[6px] text-[13px] flex items-center gap-[10px] shadow-sm animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex border-b border-gray-200 bg-white px-[20px] rounded-t-[8px] gap-[8px]">
        <button
          onClick={() => setActiveTab('routes')}
          className={`py-[14px] px-[16px] text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-[8px] ${
            activeTab === 'routes'
              ? 'border-[#121212] text-[#121212]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Compass size={16} />
          <span>Storefront Routes & Pages ({routes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`py-[14px] px-[16px] text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-[8px] ${
            activeTab === 'sections'
              ? 'border-[#121212] text-[#121212]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers size={16} />
          <span>Homepage Sections Reorder ({sections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`py-[14px] px-[16px] text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-[8px] ${
            activeTab === 'branding'
              ? 'border-[#121212] text-[#121212]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Type size={16} />
          <span>Brand Logo & Settings</span>
        </button>
      </div>

      {/* ================= TAB 1: NAVIGATION ROUTES & CATEGORIES ================= */}
      {activeTab === 'routes' && (
        <div className="space-y-[20px]">
          {/* Routes Table */}
          <div className="bg-white rounded-[8px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-[16px] bg-[#f8f9fa] border-b border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-[13px] font-bold text-gray-800">
                  Header Navigation Items ({routes.length})
                </span>
                <p className="text-[11px] text-gray-500">
                  These routes appear horizontally across the top sub-nav bar of the storefront. Click "+ Add Product" on any route to upload items directly to it.
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="px-[12px] py-[6px] bg-[#121212] text-white text-[12px] font-bold rounded hover:bg-black flex items-center gap-[5px]"
              >
                <PlusCircle size={14} />
                <span>+ Add Route</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50">
                    <th className="py-[12px] px-[16px]">Order</th>
                    <th className="py-[12px] px-[16px]">Route Name & Display</th>
                    <th className="py-[12px] px-[16px]">Target Link / Anchor</th>
                    <th className="py-[12px] px-[16px]">Mapped Products</th>
                    <th className="py-[12px] px-[16px]">Style Badge</th>
                    <th className="py-[12px] px-[16px]">Status</th>
                    <th className="py-[12px] px-[16px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {routes.map((route, idx) => (
                    <tr key={route.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Order Position */}
                      <td className="py-[14px] px-[16px] font-mono font-bold text-gray-400">
                        #{idx + 1}
                      </td>

                      {/* Route Name */}
                      <td className="py-[14px] px-[16px]">
                        <div>
                          <span className={`font-extrabold tracking-wider text-[14px] ${
                            route.isSale ? 'text-[#cf0c1d]' : 'text-[#121212]'
                          }`}>
                            {route.name}
                          </span>
                          {route.description && (
                            <span className="text-[11px] text-gray-400 block line-clamp-1">{route.description}</span>
                          )}
                        </div>
                      </td>

                      {/* Target Link */}
                      <td className="py-[14px] px-[16px]">
                        <Link
                          to={route.href && route.href.startsWith('/') ? route.href : `/category/${route.slug || route.id}`}
                          target="_blank"
                          className="font-mono text-[12px] text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-[4px] bg-blue-50 px-[8px] py-[3px] rounded border border-blue-100"
                          title="Open live category page"
                        >
                          <span>{route.href && route.href.startsWith('/') ? route.href : `/category/${route.slug || route.id}`}</span>
                          <ExternalLink size={11} />
                        </Link>
                      </td>

                      {/* Products Count */}
                      <td className="py-[14px] px-[16px]">
                        <div className="flex items-center gap-[6px]">
                          <span className="font-bold text-gray-800">
                            {route.productCount || 0} Article(s)
                          </span>
                        </div>
                      </td>

                      {/* Sale Badge */}
                      <td className="py-[14px] px-[16px]">
                        {route.isSale ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-[#cf0c1d] border border-red-200 px-[6px] py-[2px] rounded">
                            Sale Tag (Red)
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">Standard</span>
                        )}
                      </td>

                      {/* Status: Interactive Activate / Deactivate Toggle */}
                      <td className="py-[14px] px-[16px]">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(route)}
                          className={`inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                            route.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-xs'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-xs'
                          }`}
                          title={route.isActive !== false ? 'Click to Deactivate (Hide from Storefront)' : 'Click to Activate (Show on Storefront)'}
                        >
                          <span className={`w-[7px] h-[7px] rounded-full ${route.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span>{route.isActive !== false ? 'Active' : 'Deactivated'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-[14px] px-[16px] text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-[6px]">
                          {/* View Dedicated Page */}
                          <Link
                            to={route.href && route.href.startsWith('/') ? route.href : `/category/${route.slug || route.id}`}
                            target="_blank"
                            className="px-[8px] py-[5px] bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-[11px] font-bold flex items-center gap-[4px] border border-gray-300 transition-colors"
                            title={`View dedicated live page for ${route.name}`}
                          >
                            <ExternalLink size={12} />
                            <span>View Page</span>
                          </Link>

                          {/* Upload Product directly into this route */}
                          <button
                            onClick={() => navigate(`/admin/products/new?category=${encodeURIComponent(route.name)}`)}
                            className="px-[8px] py-[5px] bg-[#cec72e] hover:bg-[#b8db24] text-[#121212] rounded text-[11px] font-bold flex items-center gap-[4px] cursor-pointer"
                            title={`Upload a new product into ${route.name}`}
                          >
                            <PlusCircle size={13} />
                            <span>+ Upload Item</span>
                          </button>

                          {/* Quick Toggle Active / Deactivate */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(route)}
                            className={`p-[6px] rounded transition-colors cursor-pointer border ${
                              route.isActive !== false
                                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                                : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200'
                            }`}
                            title={route.isActive !== false ? 'Deactivate Route (Hide from Storefront)' : 'Activate Route (Show on Storefront)'}
                          >
                            {route.isActive !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>

                          {/* Edit Route */}
                          <button
                            onClick={() => openEditModal(route)}
                            className="p-[6px] text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 rounded transition-colors cursor-pointer border border-gray-200"
                            title="Edit Route Name & Settings"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Delete Route */}
                          <button
                            onClick={() => handleDeleteRoute(route)}
                            className="p-[6px] text-red-600 hover:text-white hover:bg-red-600 bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Route"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: HOMEPAGE SECTIONS LAYOUT (DRAG & REORDER) ================= */}
      {activeTab === 'sections' && (
        <div className="space-y-[20px]">
          {/* Top Banner Explainer */}
          <div className="bg-white p-[20px] rounded-[8px] border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-[15px]">
            <div>
              <div className="flex items-center gap-[8px] text-[12px] font-bold text-[#23ac95] uppercase tracking-wider mb-[2px]">
                <Layers size={14} />
                <span>Homepage Layout Customizer</span>
              </div>
              <h3 className="text-[18px] font-bold text-gray-900">
                Drag & Reorder Storefront Homepage Sections
              </h3>
              <p className="text-[12px] text-gray-500 mt-[2px]">
                Grab any section with the grip handle or use the Up & Down arrows to reorder sections. Toggle sections on or off to show or hide them from the homepage.
              </p>
            </div>

            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                onClick={handleResetSections}
                disabled={savingSections}
                className="px-[14px] py-[8px] bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-[12px] font-bold rounded flex items-center gap-[5px] transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Reset to Default</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSections}
                disabled={savingSections}
                className="px-[16px] py-[8px] bg-[#121212] hover:bg-black text-white text-[12px] font-bold rounded flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
              >
                <Save size={14} />
                <span>{savingSections ? 'Saving Layout...' : 'Save Section Order'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[25px]">
            {/* Left: Draggable list of sections (8 cols) */}
            <div className="lg:col-span-8 space-y-[12px]">
              {sections.map((sec, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === sections.length - 1;
                const isEnabled = sec.enabled !== false;

                return (
                  <div
                    key={sec.id}
                    draggable
                    onDragStart={() => setDraggedIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedIndex !== null && draggedIndex !== idx) {
                        handleReorder(draggedIndex, idx);
                      }
                      setDraggedIndex(null);
                    }}
                    className={`bg-white p-[18px] rounded-[8px] border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] shadow-xs select-none ${
                      !isEnabled
                        ? 'opacity-65 bg-gray-50/80 border-dashed border-gray-300'
                        : 'border-gray-200 hover:border-gray-400'
                    } ${draggedIndex === idx ? 'opacity-40 scale-[0.99] border-black' : ''}`}
                  >
                    {/* Left: Drag Handle + Order Badge + Details */}
                    <div className="flex items-center gap-[14px]">
                      <div
                        className="cursor-grab active:cursor-grabbing p-[6px] text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                        title="Drag to reorder"
                      >
                        <GripVertical size={20} />
                      </div>

                      <div className="w-[34px] h-[34px] rounded-full bg-[#121212] text-white flex items-center justify-center text-[12px] font-extrabold shrink-0 shadow-xs">
                        #{idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-[8px] flex-wrap">
                          <h4 className="text-[15px] font-bold text-[#121212] tracking-wide">
                            {sec.name}
                          </h4>
                          <span className="font-mono text-[11px] bg-gray-100 px-[6px] py-[1px] rounded text-gray-500">
                            ID: {sec.id}
                          </span>
                          {!isEnabled && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-[6px] py-[2px] rounded border border-amber-200">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-gray-500 mt-[2px]">
                          {sec.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Move Buttons & Visibility Toggle */}
                    <div className="flex items-center gap-[8px] self-end sm:self-center">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveUp(idx)}
                        className={`p-[8px] rounded border transition-colors ${
                          isFirst
                            ? 'text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-black cursor-pointer'
                        }`}
                        title="Move Up"
                      >
                        <ArrowUp size={16} />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveDown(idx)}
                        className={`p-[8px] rounded border transition-colors ${
                          isLast
                            ? 'text-gray-300 border-gray-200 cursor-not-allowed bg-gray-50'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-black cursor-pointer'
                        }`}
                        title="Move Down"
                      >
                        <ArrowDown size={16} />
                      </button>

                      {/* Enable / Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleSection(sec.id)}
                        className={`px-[12px] py-[8px] text-[12px] font-bold rounded border transition-colors cursor-pointer flex items-center gap-[5px] ${
                          isEnabled
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                            : 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100'
                        }`}
                        title={isEnabled ? 'Click to hide this section' : 'Click to show this section'}
                      >
                        {isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span>{isEnabled ? 'Active' : 'Disabled'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Live Homepage Schematic Preview (4 cols) */}
            <div className="lg:col-span-4">
              <div className="bg-[#121212] text-white p-[20px] rounded-[8px] shadow-lg sticky top-[20px] space-y-[15px]">
                <div className="flex items-center justify-between pb-[10px] border-b border-white/20">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-[5px]">
                    <Eye size={13} className="text-emerald-400" />
                    <span>Storefront Flow Preview</span>
                  </span>
                  <span className="text-[10px] bg-white/10 px-[6px] py-[2px] rounded text-emerald-300">
                    Live Order
                  </span>
                </div>

                <p className="text-[11px] text-white/70 leading-relaxed">
                  This preview shows the sequential top-to-bottom layout customers experience as they browse your homepage:
                </p>

                <div className="space-y-[8px] max-h-[460px] overflow-y-auto pr-[4px]">
                  {/* Fixed Header */}
                  <div className="bg-white/10 p-[10px] rounded border border-white/15 text-center text-[11px] font-bold tracking-wider text-white/90">
                    TOP HEADER (Navigation & Search)
                  </div>

                  {/* Flow items */}
                  {sections.map((sec, i) => (
                    <div
                      key={sec.id}
                      className={`p-[12px] rounded text-left transition-all border ${
                        sec.enabled !== false
                          ? 'bg-white/5 border-white/20 text-white'
                          : 'bg-white/2 border-dashed border-white/10 text-white/40 line-through'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold uppercase tracking-wider text-[#cec72e]">
                          {sec.enabled !== false ? `Section #${i + 1}` : 'Disabled'}
                        </span>
                        <span className="text-[10px] text-white/40">{sec.id}</span>
                      </div>
                      <div className="font-bold text-[13px] mt-[2px]">{sec.name}</div>
                    </div>
                  ))}

                  {/* Fixed Footer */}
                  <div className="bg-white/10 p-[10px] rounded border border-white/15 text-center text-[11px] font-bold tracking-wider text-white/90">
                    FOOTER (Customer Care & Policies)
                  </div>
                </div>

                <div className="pt-[10px] border-t border-white/15 space-y-[8px]">
                  <button
                    type="button"
                    onClick={handleSaveSections}
                    disabled={savingSections}
                    className="w-full bg-[#23ac95] hover:bg-[#1f9883] text-white py-[10px] text-[13px] font-bold rounded flex items-center justify-center gap-[6px] cursor-pointer shadow-md transition-colors"
                  >
                    <Save size={14} />
                    <span>{savingSections ? 'Saving...' : 'Apply Layout to Live Site'}</span>
                  </button>
                  <p className="text-[10px] text-white/50 text-center">
                    Instant sync with MongoDB Atlas & Storefront
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: BRAND LOGO & WHATSAPP CUSTOMIZER ================= */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[25px]">
          {/* Left Column: Form Settings (7 cols) */}
          <div className="lg:col-span-7 bg-white p-[25px] rounded-[8px] border border-gray-200 shadow-sm space-y-[22px]">
            <div>
              <h3 className="text-[17px] font-bold text-gray-900">Header Brand Logo Customizer</h3>
              <p className="text-[12px] text-gray-500 mt-[2px]">
                Choose between Limelight's signature two-tone text logo or upload a custom brand image logo.
              </p>
            </div>

            {/* Logo Type Selector */}
            <div className="space-y-[8px]">
              <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-700">
                Logo Style Mode:
              </label>
              <div className="grid grid-cols-2 gap-[12px]">
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, logoType: 'text' }))}
                  className={`p-[14px] rounded-[6px] border-2 text-left flex items-start gap-[10px] cursor-pointer transition-all ${
                    settings.logoType === 'text'
                      ? 'border-[#121212] bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Type size={20} className={settings.logoType === 'text' ? 'text-[#23ac95]' : 'text-gray-400'} />
                  <div>
                    <span className="font-bold text-[13px] block">Text Logo (Two-Tone)</span>
                    <span className="text-[11px] text-gray-500">Customizable typography & colors</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, logoType: 'image' }))}
                  className={`p-[14px] rounded-[6px] border-2 text-left flex items-start gap-[10px] cursor-pointer transition-all ${
                    settings.logoType === 'image'
                      ? 'border-[#121212] bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ImageIcon size={20} className={settings.logoType === 'image' ? 'text-[#23ac95]' : 'text-gray-400'} />
                  <div>
                    <span className="font-bold text-[13px] block">Image Logo (PNG / JPG)</span>
                    <span className="text-[11px] text-gray-500">Upload your brand logo file or URL</span>
                  </div>
                </button>
              </div>
            </div>

            {/* If TEXT LOGO */}
            {settings.logoType === 'text' && (
              <div className="space-y-[14px] p-[16px] bg-[#f8f9fa] rounded-[6px] border border-gray-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Two-Tone Text Configuration
                </span>

                <div className="grid grid-cols-2 gap-[12px]">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-600 mb-[4px]">Part 1 Text</label>
                    <input
                      type="text"
                      value={settings.textLogo?.part1 || 'ZIMAL '}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        textLogo: { ...prev.textLogo, part1: e.target.value }
                      }))}
                      className="w-full px-[10px] py-[8px] text-[13px] font-bold border border-gray-300 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-600 mb-[4px]">Part 1 Color</label>
                    <div className="flex items-center gap-[8px]">
                      <input
                        type="color"
                        value={settings.textLogo?.part1Color || '#23ac95'}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          textLogo: { ...prev.textLogo, part1Color: e.target.value }
                        }))}
                        className="w-[36px] h-[36px] rounded border border-gray-300 cursor-pointer p-[2px]"
                      />
                      <input
                        type="text"
                        value={settings.textLogo?.part1Color || '#23ac95'}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          textLogo: { ...prev.textLogo, part1Color: e.target.value }
                        }))}
                        className="flex-1 px-[8px] py-[8px] text-[12px] font-mono border border-gray-300 rounded bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[12px]">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-600 mb-[4px]">Part 2 Text</label>
                    <input
                      type="text"
                      value={settings.textLogo?.part2 || 'COLLECTION'}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        textLogo: { ...prev.textLogo, part2: e.target.value }
                      }))}
                      className="w-full px-[10px] py-[8px] text-[13px] font-bold border border-gray-300 rounded bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gray-600 mb-[4px]">Part 2 Color</label>
                    <div className="flex items-center gap-[8px]">
                      <input
                        type="color"
                        value={settings.textLogo?.part2Color || '#cec72e'}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          textLogo: { ...prev.textLogo, part2Color: e.target.value }
                        }))}
                        className="w-[36px] h-[36px] rounded border border-gray-300 cursor-pointer p-[2px]"
                      />
                      <input
                        type="text"
                        value={settings.textLogo?.part2Color || '#cec72e'}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          textLogo: { ...prev.textLogo, part2Color: e.target.value }
                        }))}
                        className="flex-1 px-[8px] py-[8px] text-[12px] font-mono border border-gray-300 rounded bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* If IMAGE LOGO */}
            {settings.logoType === 'image' && (
              <div className="space-y-[14px] p-[16px] bg-[#f8f9fa] rounded-[6px] border border-gray-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Image Logo Upload & Configuration
                </span>

                {/* File Upload Button */}
                <div>
                  <label className="block text-[12px] font-bold uppercase text-gray-700 mb-[4px]">
                    Upload Logo File (PNG / JPG / SVG)
                  </label>
                  <label className="flex items-center justify-center gap-[8px] w-full py-[14px] border-2 border-dashed border-gray-300 rounded-[6px] bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                    <Upload size={18} className="text-gray-400" />
                    <span className="text-[13px] font-semibold text-gray-700">
                      {uploadingLogo ? 'Uploading file...' : 'Choose or Drag Logo Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* OR Enter URL */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-[4px]">
                    Or Enter Image URL Directly:
                  </label>
                  <input
                    type="text"
                    value={settings.imageLogo?.url || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      imageLogo: { ...prev.imageLogo, url: e.target.value }
                    }))}
                    placeholder="https://example.com/logo.png or /uploads/logo.png"
                    className="w-full px-[10px] py-[8px] text-[13px] border border-gray-300 rounded bg-white"
                  />
                </div>

                {/* Logo Height Slider */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold uppercase text-gray-600 mb-[4px]">
                    <span>Logo Height</span>
                    <span>{settings.imageLogo?.height || 34}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="65"
                    value={settings.imageLogo?.height || 34}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      imageLogo: { ...prev.imageLogo, height: Number(e.target.value) }
                    }))}
                    className="w-full accent-[#121212]"
                  />
                </div>
              </div>
            )}

            {/* Header & Sub-Navigation Background Styling (Color & Contrast Control) */}
            <div className="space-y-[14px] p-[16px] bg-[#f8f9fa] rounded-[6px] border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                  Header Background & Bar Styling
                </span>
                <span className="text-[10px] bg-gray-200 text-gray-700 px-[6px] py-[1px] rounded font-semibold">
                  Contrast Control
                </span>
              </div>

              {/* Row 1 Header BG */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-700 mb-[4px]">
                  Header Top Bar Background Color
                </label>
                <div className="flex items-center gap-[8px]">
                  <input
                    type="color"
                    value={settings.headerBg || '#000000'}
                    onChange={(e) => setSettings(prev => ({ ...prev, headerBg: e.target.value }))}
                    className="w-[38px] h-[38px] rounded border border-gray-300 cursor-pointer p-[2px]"
                  />
                  <input
                    type="text"
                    value={settings.headerBg || '#000000'}
                    onChange={(e) => setSettings(prev => ({ ...prev, headerBg: e.target.value }))}
                    placeholder="#000000"
                    className="flex-1 px-[10px] py-[8px] text-[12px] font-mono border border-gray-300 rounded bg-white"
                  />
                </div>
                {/* Presets */}
                <div className="flex flex-wrap gap-[6px] mt-[8px]">
                  {[
                    { label: 'Black', hex: '#000000' },
                    { label: 'White', hex: '#ffffff' },
                    { label: 'Charcoal', hex: '#18181b' },
                    { label: 'Navy', hex: '#0f172a' },
                    { label: 'Emerald', hex: '#064e3b' }
                  ].map(p => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, headerBg: p.hex }))}
                      className={`text-[10.5px] px-[8px] py-[3px] rounded border flex items-center gap-[4px] cursor-pointer transition-colors ${
                        (settings.headerBg || '#000000').toLowerCase() === p.hex.toLowerCase()
                          ? 'border-[#121212] bg-[#121212] text-white font-bold'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="w-[8px] h-[8px] rounded-full border border-black/20" style={{ backgroundColor: p.hex }} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-nav BG */}
              <div className="pt-[10px] border-t border-gray-200">
                <div className="flex items-center justify-between mb-[4px]">
                  <label className="text-[11px] font-bold uppercase text-gray-700">
                    Sub-Nav (Category Menu) Background Color
                  </label>
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, subnavBg: prev.headerBg || '#000000' }))}
                    className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Match Top Bar
                  </button>
                </div>
                <div className="flex items-center gap-[8px]">
                  <input
                    type="color"
                    value={settings.subnavBg || settings.headerBg || '#000000'}
                    onChange={(e) => setSettings(prev => ({ ...prev, subnavBg: e.target.value }))}
                    className="w-[38px] h-[38px] rounded border border-gray-300 cursor-pointer p-[2px]"
                  />
                  <input
                    type="text"
                    value={settings.subnavBg || settings.headerBg || '#000000'}
                    onChange={(e) => setSettings(prev => ({ ...prev, subnavBg: e.target.value }))}
                    placeholder="#000000"
                    className="flex-1 px-[10px] py-[8px] text-[12px] font-mono border border-gray-300 rounded bg-white"
                  />
                </div>
              </div>

              {/* Contrast Guidance Notice */}
              {isColorLight(settings.headerBg) ? (
                <div className="p-[10px] rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11.5px] leading-relaxed flex items-start gap-[8px]">
                  <CheckCircle size={15} className="shrink-0 mt-[1px] text-emerald-600" />
                  <span>
                    <strong>Light Header Active:</strong> Header icons (Search, Profile, Bag, WhatsApp) and category links automatically adapt to dark contrast so dark/black text and icons remain crisp and readable!
                  </span>
                </div>
              ) : (
                <div className="p-[10px] rounded bg-gray-100 border border-gray-300 text-gray-700 text-[11.5px] leading-relaxed flex items-start gap-[8px]">
                  <Sparkles size={15} className="shrink-0 mt-[1px] text-amber-500" />
                  <span>
                    <strong>Dark Header Active:</strong> If you select dark or black text for your logo, click the <strong>White (#ffffff)</strong> background preset above so black text stands out with high contrast.
                  </span>
                </div>
              )}
            </div>

            {/* Official WhatsApp Hotline */}
            <div className="pt-[10px] border-t border-gray-200">
              <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-700 mb-[6px] flex items-center gap-[6px]">
                <Phone size={14} className="text-[#25D366]" />
                <span>Store WhatsApp Support Number</span>
              </label>
              <input
                type="text"
                value={settings.whatsappNumber || '+92 345 7867016'}
                onChange={(e) => setSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                placeholder="+92 345 7867016"
                className="w-full px-[12px] py-[10px] text-[14px] font-bold border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
              />
              <p className="text-[11px] text-gray-500 mt-[4px]">
                This phone number powers the floating WhatsApp widget, header direct links, and footer support.
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="button-primary w-full bg-[#121212] hover:bg-black text-white py-[12px] text-[14px] font-bold rounded flex items-center justify-center gap-[8px] cursor-pointer shadow-md"
            >
              <Save size={16} />
              <span>{savingSettings ? 'SAVING CHANGES...' : 'SAVE & APPLY BRANDING TO STOREFRONT'}</span>
            </button>
          </div>

          {/* Right Column: Live Header Mockup Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-[15px]">
            <div className="bg-[#121212] text-white p-[20px] rounded-[8px] shadow-lg sticky top-[20px] space-y-[15px]">
              <div className="flex items-center justify-between pb-[10px] border-b border-white/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-[5px]">
                  <Eye size={13} className="text-emerald-400" />
                  <span>Live Storefront Header Preview</span>
                </span>
                <span className="text-[10px] bg-white/10 px-[6px] py-[2px] rounded text-emerald-300">
                  Instant Sync
                </span>
              </div>

              {/* Header Container Mock */}
              <div
                style={{ backgroundColor: settings.headerBg || '#000000' }}
                className={`p-[20px] rounded-[6px] border text-center flex flex-col items-center justify-center min-h-[120px] transition-colors duration-200 ${
                  isColorLight(settings.headerBg) ? 'border-black/15 shadow-inner' : 'border-white/10'
                }`}
              >
                {settings.logoType === 'image' && settings.imageLogo?.url ? (
                  <img
                    src={settings.imageLogo.url}
                    alt={settings.imageLogo.alt || 'Logo'}
                    style={{ height: `${settings.imageLogo.height || 34}px` }}
                    className="object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/180x45/121212/ffffff?text=ZIMAL';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center leading-none">
                    <div className="tracking-[0.2em] text-[24px] font-extrabold uppercase font-visbyBold">
                      <span style={{ color: settings.textLogo?.part1Color || '#23ac95' }}>
                        {settings.textLogo?.part1 || 'ZIMAL '}
                      </span>
                      <span style={{ color: settings.textLogo?.part2Color || '#cec72e' }}>
                        {settings.textLogo?.part2 || 'COLLECTION'}
                      </span>
                    </div>
                    <span
                      style={{
                        color: isColorLight(settings.headerBg) ? 'rgba(18, 18, 18, 0.7)' : 'rgba(255, 255, 255, 0.7)'
                      }}
                      className="text-[9.5px] tracking-[0.22em] font-medium mt-[4px] lowercase font-mono"
                    >
                      www.zimalcollection.com
                    </span>
                  </div>
                )}
              </div>

              {/* Sub-nav preview */}
              <div
                style={{ backgroundColor: settings.subnavBg || settings.headerBg || '#1a1a1a' }}
                className={`p-[10px] rounded-[4px] flex items-center justify-center gap-[15px] overflow-x-auto text-[11px] font-medium tracking-wider transition-colors duration-200 border ${
                  isColorLight(settings.subnavBg || settings.headerBg) ? 'border-black/15' : 'border-white/10'
                }`}
              >
                {routes.map(r => (
                  <span
                    key={r.id}
                    style={{
                      color: r.isSale
                        ? '#cf0c1d'
                        : (isColorLight(settings.subnavBg || settings.headerBg) ? '#121212' : 'rgba(255, 255, 255, 0.85)')
                    }}
                    className={r.isSale ? 'font-bold' : ''}
                  >
                    {r.name}
                  </span>
                ))}
              </div>

              <div className="p-[12px] bg-white/5 rounded-[6px] text-[12px] text-white/80 space-y-[4px]">
                <div className="flex items-center gap-[6px]">
                  <Phone size={14} className="text-[#25D366]" />
                  <span>WhatsApp Hotline: <strong>{settings.whatsappNumber || '+92 345 7867016'}</strong></span>
                </div>
                <p className="text-[11px] text-white/50">
                  Changes save immediately to the backend and reflect on the public customer storefront.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ROUTE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[15px]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-[8px] shadow-2xl overflow-hidden z-10 animate-expand p-[25px] space-y-[15px]">
            <div className="flex justify-between items-center pb-[10px] border-b border-gray-200">
              <h3 className="text-[17px] font-bold text-gray-900">
                {editingRoute ? `Edit Route: ${editingRoute.name}` : 'Add New Navigation Route'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-[4px] rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRouteSubmit} className="space-y-[12px]">
              <div>
                <label className="block text-[12px] font-bold uppercase text-gray-700 mb-[4px]">
                  Route / Category Name *
                </label>
                <input
                  type="text"
                  value={routeForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    setRouteForm(prev => ({
                      ...prev,
                      name: val,
                      slug: !editingRoute || !prev.slug ? autoSlug : prev.slug,
                      href: !editingRoute || !prev.href || prev.href.startsWith('/category/') ? `/category/${autoSlug}` : prev.href
                    }));
                  }}
                  placeholder="e.g. LAWN 2026, KIDS, WINTER SPECIAL"
                  className="w-full px-[12px] py-[9px] text-[13px] font-bold border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-[10px]">
                <div>
                  <label className="block text-[12px] font-bold uppercase text-gray-700 mb-[4px]">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={routeForm.slug}
                    onChange={(e) => {
                      const s = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setRouteForm(prev => ({
                        ...prev,
                        slug: s,
                        href: `/category/${s}`
                      }));
                    }}
                    placeholder="e.g. lawn-2026"
                    className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold uppercase text-gray-700 mb-[4px]">
                    Dedicated Page Link
                  </label>
                  <input
                    type="text"
                    value={routeForm.href}
                    onChange={(e) => setRouteForm({ ...routeForm, href: e.target.value })}
                    placeholder="/category/lawn-2026"
                    className="w-full px-[12px] py-[9px] text-[13px] font-mono border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-500">
                A dedicated storefront page with filters, catalog grid, and instant checkout is automatically activated at this URL.
              </p>

              <div>
                <label className="block text-[12px] font-bold uppercase text-gray-700 mb-[4px]">
                  Description / Subtitle
                </label>
                <input
                  type="text"
                  value={routeForm.description}
                  onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                  placeholder="Short tagline for this section"
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-[8px] pt-[6px]">
                <label className="flex items-center gap-[8px] text-[13px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={routeForm.isSale}
                    onChange={(e) => setRouteForm({ ...routeForm, isSale: e.target.checked })}
                    className="w-[16px] h-[16px] accent-[#cf0c1d]"
                  />
                  <span className="font-semibold text-gray-800">
                    Mark as Sale Route (Displays in bold red font)
                  </span>
                </label>

                <label className="flex items-center gap-[8px] text-[13px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={routeForm.isActive}
                    onChange={(e) => setRouteForm({ ...routeForm, isActive: e.target.checked })}
                    className="w-[16px] h-[16px] accent-[#121212]"
                  />
                  <span className="text-gray-700">
                    Active & visible in Storefront Navigation bar
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-[8px] pt-[12px] border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-[14px] py-[8px] text-[12px] font-bold border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-[18px] py-[8px] text-[12px] font-bold bg-[#121212] text-white rounded hover:bg-black"
                >
                  {editingRoute ? 'Save Changes' : 'Add Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

