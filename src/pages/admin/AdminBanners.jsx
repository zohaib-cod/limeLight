import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Eye,
  ExternalLink,
  Save,
  Link2,
  Type,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    name: 'Unstitched Top Editorial',
    url: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468256/limelight/products/vjsl0kwf5brmmt39d5qu.jpg'
  },
  {
    name: 'Unstitched Embroidered (Wide)',
    url: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468263/limelight/products/pyqxtr8aazfj9uqpbivj.jpg'
  },
  {
    name: 'Limelight RTW Pret Main',
    url: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468259/limelight/products/hm2htjcsqo4ia2g0cv0b.jpg'
  },
  {
    name: 'Limelight Western Co-Ords',
    url: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468257/limelight/products/cwygrr1yik37o2gpohnb.jpg'
  }
];

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [selectedBannerId, setSelectedBannerId] = useState('unstitched');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    id: 'unstitched',
    section: 'unstitched',
    sectionName: 'Unstitched Section',
    badge: 'LUXURY WINTER EDIT',
    watermark: 'UNSTITCHED',
    title: 'UNSTITCHED FABRICS',
    subtitle: 'Tailor your distinctive look with our finest unstitched velvets, warm karandi, and embroidered khaddar fabrics.',
    scriptText: 'Style it your way.',
    buttonText: 'EXPLORE DESIGNS',
    buttonLink: '#unstitched-grid',
    secondaryBtnText: 'SHOP NOW',
    secondaryBtnLink: '#unstitched',
    imageUrl: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468256/limelight/products/vjsl0kwf5brmmt39d5qu.jpg',
    isActive: true
  });

  // Image upload state
  const [imageSource, setImageSource] = useState('upload'); // 'upload' | 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Load banners from API
  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/banners?admin=true');
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
        if (data.length > 0) {
          const current = data.find(b => b.id === selectedBannerId) || data[0];
          populateForm(current);
        }
      }
    } catch (err) {
      console.error('Failed to load banners:', err);
      showFeedback('error', 'Could not connect to backend API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const populateForm = (banner) => {
    setSelectedBannerId(banner.id);
    setFormData({
      id: banner.id,
      section: banner.section || banner.id,
      sectionName: banner.sectionName || 'Category Banner',
      badge: banner.badge || '',
      watermark: banner.watermark || '',
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      scriptText: banner.scriptText || '',
      buttonText: banner.buttonText || '',
      buttonLink: banner.buttonLink || '',
      secondaryBtnText: banner.secondaryBtnText || '',
      secondaryBtnLink: banner.secondaryBtnLink || '',
      imageUrl: banner.imageUrl || '',
      isActive: banner.isActive !== false
    });
    setSelectedFile(null);
    setFilePreview(null);
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Please choose a valid image file (JPG, PNG, WebP).');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setFilePreview(objectUrl);
    }
  };

  // Current display image in preview
  const displayImage = filePreview || formData.imageUrl || PRESET_IMAGES[0].url;

  // Submit / Save
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      showFeedback('error', 'Banner title is required.');
      return;
    }

    try {
      setSaving(true);
      const submitData = new FormData();
      submitData.append('id', formData.id);
      submitData.append('section', formData.section);
      submitData.append('sectionName', formData.sectionName);
      submitData.append('badge', formData.badge);
      submitData.append('watermark', formData.watermark);
      submitData.append('title', formData.title);
      submitData.append('subtitle', formData.subtitle);
      submitData.append('scriptText', formData.scriptText);
      submitData.append('buttonText', formData.buttonText);
      submitData.append('buttonLink', formData.buttonLink);
      submitData.append('secondaryBtnText', formData.secondaryBtnText || '');
      submitData.append('secondaryBtnLink', formData.secondaryBtnLink || '');
      submitData.append('isActive', formData.isActive);

      if (selectedFile) {
        submitData.append('image', selectedFile);
      } else {
        submitData.append('imageUrl', formData.imageUrl);
      }

      // Check if banner exists on backend
      const exists = banners.some(b => b.id === formData.id);
      const endpoint = exists ? `/api/banners/${formData.id}` : '/api/banners';
      const method = exists ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        body: submitData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save banner');
      }

      showFeedback('success', `Banner "${formData.title}" published successfully!`);
      setSelectedFile(null);
      setFilePreview(null);
      await loadBanners();
    } catch (err) {
      console.error('Save banner error:', err);
      showFeedback('error', err.message || 'Error saving banner.');
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (!window.confirm('Reset all section banners to official Limelight default settings?')) return;
    try {
      setSaving(true);
      const res = await fetch('/api/banners/reset', { method: 'POST' });
      if (res.ok) {
        showFeedback('success', 'Section banners reset to official defaults.');
        await loadBanners();
      }
    } catch (err) {
      showFeedback('error', 'Failed to reset banners.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-[28px] font-assistant">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] bg-white p-[24px] rounded-[8px] border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-[8px] mb-[4px]">
            <span className="p-[6px] bg-[#23ac95]/10 text-[#23ac95] rounded-[4px]">
              <Layers size={20} />
            </span>
            <h1 className="text-[24px] font-bold text-[#121212]">
              Section Editorial Banners
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-[8px] py-[2px] rounded-full uppercase tracking-wider">
              Backend Connected
            </span>
          </div>
          <p className="text-[14px] text-gray-500 max-w-[700px]">
            Upload custom high-definition campaign photography, watermark branding, titles, cursive script, and explore buttons for section headers like Unstitched.
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-[14px] py-[9px] text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[4px] flex items-center gap-[6px] transition-colors cursor-pointer"
            title="Reset banner to default Limelight configuration"
          >
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>

          <a
            href="/#unstitched"
            target="_blank"
            rel="noopener noreferrer"
            className="px-[14px] py-[9px] text-[13px] font-medium text-[#121212] bg-[#f0f0f0] hover:bg-[#e4e4e4] rounded-[4px] flex items-center gap-[6px] transition-colors"
          >
            <ExternalLink size={15} />
            <span>View Live Section</span>
          </a>
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
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Section Switcher Tabs */}
      <div className="flex items-center gap-[8px] border-b border-gray-200 pb-[10px]">
        {banners.map((b) => (
          <button
            key={b.id}
            onClick={() => populateForm(b)}
            className={`px-[16px] py-[8px] rounded-[6px] text-[13px] font-bold tracking-wide transition-all cursor-pointer flex items-center gap-[8px] ${
              selectedBannerId === b.id
                ? 'bg-[#121212] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Layers size={14} />
            <span>{b.sectionName || b.title || 'Banner'}</span>
            <span
              className={`w-[7px] h-[7px] rounded-full ${
                b.isActive !== false ? 'bg-emerald-400' : 'bg-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Main Grid: Live Preview (Top/Left) + Form Controls */}
      <div className="space-y-[24px]">
        {/* Real-time Interactive Live Preview */}
        <div className="bg-white p-[20px] rounded-[8px] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-[14px]">
            <div className="flex items-center gap-[8px]">
              <Eye size={17} className="text-[#23ac95]" />
              <h2 className="text-[14px] font-bold text-[#121212] uppercase tracking-wider">
                Live Storefront Real-time Preview
              </h2>
            </div>
            <span className="text-[12px] text-gray-400">
              Matches your customer-facing storefront exactly
            </span>
          </div>

          {/* Banner Card Preview Container */}
          <div className="overflow-hidden rounded-[8px] shadow-md relative group bg-neutral-900 min-h-[220px]">
            <img
              src={displayImage}
              alt={formData.title || 'Preview Banner'}
              className="w-full h-[220px] sm:h-[340px] lg:h-[390px] object-cover transition-transform duration-700 group-hover:scale-[1.01]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = PRESET_IMAGES[0].url;
              }}
            />

            {/* Visual Gradient/Content Overlay */}
            {formData.id === 'rtw-pret' ? (
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end justify-between p-[22px] sm:p-[32px] z-10">
                <div className="max-w-[65%]">
                  {formData.badge && (
                    <span className="text-white/90 text-[11px] tracking-[0.2em] uppercase font-medium block mb-[4px]">
                      {formData.badge}
                    </span>
                  )}
                  <h3 className="text-white text-[20px] sm:text-[24px] font-bold mb-[8px] leading-tight">
                    {formData.title || 'DAILY CHIC & KURTIS'}
                  </h3>
                  <div className="text-white text-[12px] sm:text-[13px] font-normal inline-flex">
                    {formData.buttonText || 'SHOP PRET CASUALS →'}
                  </div>
                </div>

                <div className="flex flex-col items-end text-right select-none pb-[4px]">
                  {formData.watermark && (
                    <div className="font-serif italic text-white/75 text-[32px] sm:text-[44px] leading-none mb-[8px] drop-shadow-sm">
                      {formData.watermark}
                    </div>
                  )}
                  {formData.secondaryBtnText && (
                    <div className="border border-white/60 text-white text-[10px] sm:text-[11px] font-semibold px-[14px] py-[6px] rounded-[2px] uppercase tracking-wider inline-block">
                      {formData.secondaryBtnText}
                    </div>
                  )}
                </div>
              </div>
            ) : formData.id === 'rtw-coords' ? (
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end justify-between p-[22px] sm:p-[32px] z-10">
                <div className="max-w-[60%]">
                  {formData.badge && (
                    <span className="text-white/90 text-[11px] tracking-[0.2em] uppercase font-medium block mb-[4px]">
                      {formData.badge}
                    </span>
                  )}
                  <h3 className="text-white text-[20px] sm:text-[24px] font-bold mb-[8px] leading-tight">
                    {formData.title || 'WESTERN CO-ORDS'}
                  </h3>
                  <div className="text-white text-[12px] sm:text-[13px] font-normal inline-flex">
                    {formData.buttonText || 'DISCOVER CO-ORDS →'}
                  </div>
                </div>

                <div className="flex flex-col items-end text-right select-none pb-[4px]">
                  {formData.watermark && (
                    <div className="font-extrabold text-[#0f3b6a] text-[34px] sm:text-[48px] leading-none tracking-tight drop-shadow-xs">
                      {formData.watermark}
                    </div>
                  )}
                  {formData.subtitle && (
                    <div className="text-[#2563eb] text-[10px] sm:text-[12px] font-bold tracking-[0.22em] uppercase mt-[3px]">
                      {formData.subtitle}
                    </div>
                  )}
                </div>
              </div>
            ) : formData.id === 'unstitched-wide' ? (
              <div className="absolute inset-0 bg-black/35 flex items-center justify-between p-[20px] sm:p-[45px] lg:p-[60px] z-10">
                {/* Center Content */}
                <div className="mx-auto text-center max-w-[650px] z-10">
                  {formData.badge && (
                    <span className="text-white text-[11px] sm:text-[12px] tracking-[0.25em] uppercase font-medium block mb-[6px] drop-shadow-sm">
                      {formData.badge}
                    </span>
                  )}
                  <h3 className="text-white text-[20px] sm:text-[28px] lg:text-[32px] font-bold mb-[15px] uppercase tracking-wide drop-shadow-md leading-tight">
                    {formData.title || 'SIGNATURE WINTER SHAWLS & SUITS'}
                  </h3>
                  <div className="inline-block bg-[#121212] text-white text-[12px] sm:text-[13px] font-semibold px-[24px] py-[11px] rounded-[3px] shadow-sm uppercase tracking-wider">
                    {formData.buttonText || 'VIEW FULL COLLECTION'}
                  </div>
                </div>

                {/* Right Side Watermark Typography & Secondary Button */}
                <div className="hidden md:flex flex-col items-end text-right z-10 pr-[10px] select-none">
                  <div className="font-serif text-white/50 text-[36px] lg:text-[48px] font-extrabold tracking-wider leading-none uppercase drop-shadow-sm">
                    UNSTITCHED
                  </div>
                  <div className="text-white/45 text-[18px] lg:text-[24px] font-bold tracking-[0.35em] leading-none uppercase mt-[3px] drop-shadow-sm">
                    EMBROIDERED
                  </div>
                  <div className="mt-[15px] border border-white/70 text-white text-[11px] lg:text-[12px] font-semibold px-[20px] py-[8px] rounded-[2px] tracking-widest uppercase inline-block">
                    {formData.secondaryBtnText || 'SHOP NOW'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center p-[20px] sm:p-[45px] z-10">
                <div className="max-w-[550px] relative">
                  {/* Watermark text behind headline */}
                  {formData.watermark && (
                    <div className="absolute -top-[15px] sm:-top-[30px] -left-[5px] text-[36px] sm:text-[70px] lg:text-[88px] font-black uppercase tracking-wider text-white/20 select-none pointer-events-none leading-none z-0">
                      {formData.watermark}
                    </div>
                  )}

                  <div className="relative z-10">
                    {/* Badge */}
                    {formData.badge && (
                      <span className="block text-[11px] sm:text-[12px] font-medium text-white tracking-[0.22em] uppercase mb-[6px] drop-shadow-sm">
                        {formData.badge}
                      </span>
                    )}

                    {/* Title / Headline */}
                    <h3 className="text-[22px] sm:text-[32px] lg:text-[38px] font-bold text-white mb-[8px] leading-tight drop-shadow-md">
                      {formData.title || 'UNSTITCHED FABRICS'}
                    </h3>

                    {/* Subtitle */}
                    {formData.subtitle && (
                      <p className="text-white/85 text-[13px] sm:text-[14px] leading-[22px] mb-[8px] hidden sm:block drop-shadow-sm max-w-[480px]">
                        {formData.subtitle}
                      </p>
                    )}

                    {/* Cursive script text */}
                    {formData.scriptText && (
                      <div className="font-serif italic text-white/95 text-[18px] sm:text-[23px] mb-[16px] tracking-wide drop-shadow-sm">
                        {formData.scriptText}
                      </div>
                    )}

                    {/* Button */}
                    <div className="inline-flex items-center text-[12px] sm:text-[13px] font-semibold px-[20px] py-[10px] rounded-[3px] shadow-sm tracking-wider uppercase bg-[#121212] text-white">
                      {formData.buttonText || 'EXPLORE DESIGNS'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inactive Banner Watermark Banner Flag */}
            {!formData.isActive && (
              <div className="absolute top-[12px] right-[12px] bg-amber-500 text-white text-[11px] font-bold px-[10px] py-[4px] rounded-[4px] shadow-md z-20 flex items-center gap-[5px]">
                <AlertCircle size={14} />
                <span>Currently Hidden from Customers</span>
              </div>
            )}
          </div>
        </div>

        {/* Upload & Form Controls */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
          {/* Left Column: Image Upload Area (7 Cols) */}
          <div className="lg:col-span-6 space-y-[20px] bg-white p-[24px] rounded-[8px] border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-[12px]">
              <div className="flex items-center gap-[8px]">
                <ImageIcon size={18} className="text-[#23ac95]" />
                <h3 className="text-[15px] font-bold text-[#121212]">
                  Banner Photography Source
                </h3>
              </div>
              <div className="flex items-center gap-[6px] bg-gray-100 p-[3px] rounded-[6px]">
                <button
                  type="button"
                  onClick={() => setImageSource('upload')}
                  className={`px-[10px] py-[4px] text-[12px] font-medium rounded-[4px] transition-colors ${
                    imageSource === 'upload'
                      ? 'bg-white text-[#121212] shadow-xs'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageSource('url')}
                  className={`px-[10px] py-[4px] text-[12px] font-medium rounded-[4px] transition-colors ${
                    imageSource === 'url'
                      ? 'bg-white text-[#121212] shadow-xs'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* File Upload Mode */}
            {imageSource === 'upload' ? (
              <div className="space-y-[12px]">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[8px] p-[28px] text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-[#23ac95] bg-[#23ac95]/5'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-[10px]">
                    <div className="w-[50px] h-[50px] rounded-full bg-[#23ac95]/10 text-[#23ac95] flex items-center justify-center">
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#121212]">
                        Click to upload or drag & drop banner image
                      </p>
                      <p className="text-[12px] text-gray-500 mt-[2px]">
                        JPG, PNG, WebP up to 25MB (Recommended: 1920 × 450px)
                      </p>
                    </div>
                  </div>
                </div>

                {selectedFile && (
                  <div className="p-[12px] bg-emerald-50 border border-emerald-200 rounded-[6px] flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-[8px] truncate">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span className="font-semibold text-emerald-900 truncate">
                        {selectedFile.name}
                      </span>
                      <span className="text-emerald-700 text-[11px]">
                        ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                      className="text-emerald-800 hover:text-emerald-950 font-bold ml-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* URL Mode */
              <div className="space-y-[10px]">
                <label className="block text-[13px] font-medium text-gray-700">
                  Image Direct URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-[12px] flex items-center pointer-events-none text-gray-400">
                    <Link2 size={16} />
                  </span>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://www.limelight.pk/cdn/shop/files/..."
                    className="w-full pl-[36px] pr-[12px] py-[10px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
                  />
                </div>
              </div>
            )}

            {/* Quick Presets */}
            <div>
              <span className="text-[12px] font-semibold text-gray-500 block mb-[8px]">
                Or select official Limelight presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[8px]">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                      setFormData({ ...formData, imageUrl: preset.url });
                    }}
                    className={`p-[8px] rounded-[6px] border text-left text-[11px] font-medium transition-colors flex items-center gap-[6px] cursor-pointer ${
                      formData.imageUrl === preset.url && !selectedFile
                        ? 'border-[#121212] bg-[#121212] text-white'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-[28px] h-[28px] object-cover rounded-[3px] shrink-0"
                    />
                    <span className="truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status Active Toggle */}
            <div className="pt-[14px] border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[13px] font-bold text-[#121212] block">
                  Storefront Banner Visibility
                </span>
                <span className="text-[12px] text-gray-500">
                  Enable or disable this banner on customer view
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className="cursor-pointer text-[#121212]"
              >
                {formData.isActive ? (
                  <ToggleRight size={34} className="text-emerald-600" />
                ) : (
                  <ToggleLeft size={34} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Editorial Text & Typography Form (6 Cols) */}
          <div className="lg:col-span-6 space-y-[16px] bg-white p-[24px] rounded-[8px] border border-gray-200 shadow-sm">
            <div className="border-b border-gray-100 pb-[12px] flex items-center gap-[8px]">
              <Type size={18} className="text-[#23ac95]" />
              <h3 className="text-[15px] font-bold text-[#121212]">
                Banner Copywriting & Typography
              </h3>
            </div>

            {/* Watermark branding */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-[4px] flex items-center justify-between">
                <span>Watermark Background Text</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  Translucent text behind title
                </span>
              </label>
              <input
                type="text"
                value={formData.watermark}
                onChange={(e) => setFormData({ ...formData, watermark: e.target.value })}
                placeholder="UNSTITCHED"
                className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212] font-semibold tracking-wider uppercase"
              />
            </div>

            {/* Badge */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                Top Label / Badge
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="LUXURY WINTER EDIT"
                className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
              />
            </div>

            {/* Headline Title */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                Main Headline Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="UNSTITCHED FABRICS"
                className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212] font-bold"
              />
            </div>

            {/* Description Subtitle */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                Description / Subtitle
              </label>
              <textarea
                rows={2}
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Tailor your distinctive look with our finest unstitched velvets, warm karandi, and embroidered khaddar fabrics."
                className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212] resize-none"
              />
            </div>

            {/* Cursive script text */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-[4px] flex items-center justify-between">
                <span>Cursive Script Accent</span>
                <span className="text-[11px] text-gray-400 font-normal">
                  Shown in elegant italic font
                </span>
              </label>
              <input
                type="text"
                value={formData.scriptText}
                onChange={(e) => setFormData({ ...formData, scriptText: e.target.value })}
                placeholder="Style it your way."
                className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212] font-serif italic"
              />
            </div>

            {/* Button Text & Button Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="EXPLORE DESIGNS"
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                  Button Link Target
                </label>
                <input
                  type="text"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  placeholder="#unstitched-grid"
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
                />
              </div>
            </div>

            {/* Secondary Button for Wide Banner & RTW Pret (e.g. SHOP NOW) */}
            {(formData.id === 'unstitched-wide' || formData.id === 'rtw-pret') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] pt-[6px] border-t border-gray-100">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                    Secondary Outline Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryBtnText}
                    onChange={(e) => setFormData({ ...formData, secondaryBtnText: e.target.value })}
                    placeholder="SHOP NOW"
                    className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-[4px]">
                    Secondary Button Link Target
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryBtnLink}
                    onChange={(e) => setFormData({ ...formData, secondaryBtnLink: e.target.value })}
                    placeholder="#unstitched"
                    className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded-[6px] focus:outline-none focus:border-[#121212]"
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-[10px]">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#121212] hover:bg-black text-white font-bold py-[12px] px-[20px] rounded-[6px] text-[14px] flex items-center justify-center gap-[8px] shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                {saving ? (
                  <>
                    <span className="w-[16px] h-[16px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    <span>Save & Publish Banner</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

