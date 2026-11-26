import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Upload,
  Link as LinkIcon,
  Check,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Eye,
  ArrowRight,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminSliderUpload() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    badge: '',
    scriptText: '',
    title: '',
    subtitle: '',
    primaryBtnText: '',
    primaryBtnLink: '',
    secondaryBtnText: '',
    secondaryBtnLink: '',
    imageUrl: '',
    isActive: true
  });

  // If editing, load existing slide
  useEffect(() => {
    if (isEditing) {
      setFetching(true);
      fetch(`/api/slides/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Slide not found');
          return res.json();
        })
        .then(slide => {
          setFormData({
            badge: slide.badge || '',
            scriptText: slide.scriptText || '',
            title: slide.title || '',
            subtitle: slide.subtitle || '',
            primaryBtnText: slide.primaryBtnText || '',
            primaryBtnLink: slide.primaryBtnLink || '',
            secondaryBtnText: slide.secondaryBtnText || '',
            secondaryBtnLink: slide.secondaryBtnLink || '',
            imageUrl: slide.imageUrl || '',
            isActive: slide.isActive !== false
          });
          setPreviewUrl(slide.imageUrl || '');
          setUploadMode('url');
        })
        .catch(err => {
          setErrorMsg(err.message || 'Could not load slide details');
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [id, isEditing]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file (JPEG, PNG, WebP).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('badge', formData.badge);
      data.append('scriptText', formData.scriptText);
      data.append('title', formData.title);
      data.append('subtitle', formData.subtitle);
      data.append('primaryBtnText', formData.primaryBtnText);
      data.append('primaryBtnLink', formData.primaryBtnLink);
      data.append('secondaryBtnText', formData.secondaryBtnText);
      data.append('secondaryBtnLink', formData.secondaryBtnLink);
      data.append('isActive', formData.isActive);

      if (uploadMode === 'file' && selectedFile) {
        data.append('image', selectedFile);
      } else if (formData.imageUrl) {
        data.append('imageUrl', formData.imageUrl);
      } else if (!isEditing) {
        setErrorMsg('Please upload an image file or provide an image URL.');
        setLoading(false);
        return;
      }

      const url = isEditing ? `/api/slides/${id}` : '/api/slides';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: data
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to save slide');
      }

      setSuccessMsg(isEditing ? 'Slide updated successfully!' : 'New slide published successfully!');

      // Redirect back to sliders list after 1 second
      setTimeout(() => {
        navigate('/admin/sliders');
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-[80px] text-gray-500 font-assistant">
        <p>Loading slide configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-[25px] font-assistant max-w-5xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <Link
            to="/admin/sliders"
            className="p-[8px] rounded-[4px] bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
            title="Back to Sliders"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="text-[22px] font-bold text-[#121212]">
              {isEditing ? 'Edit Hero Slider Banner' : 'Upload New Hero Slider Banner'}
            </h2>
            <p className="text-[13px] text-gray-500">
              {isEditing
                ? 'Update banner image, headlines, links, or status'
                : 'Upload as many campaign slides as you want to showcase on your homepage'}
            </p>
          </div>
        </div>

        <Link
          to="/admin/sliders"
          className="text-[13px] text-gray-600 hover:text-black underline"
        >
          View All Sliders
        </Link>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-[16px] py-[12px] rounded-[4px] text-[13px] flex items-center gap-[8px]">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 text-[#cf0c1d] border border-red-200 px-[16px] py-[12px] rounded-[4px] text-[13px] flex items-center gap-[8px]">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Preview Box (Exact Limelight Style) */}
      <div className="bg-[#080808] rounded-[8px] overflow-hidden shadow-lg border border-gray-800 relative">
        <div className="p-[12px] bg-[#121212] border-b border-gray-800 flex items-center justify-between text-white text-[12px]">
          <div className="flex items-center gap-[6px]">
            <Eye size={14} className="text-[#cec72e]" />
            <span className="font-bold tracking-wider uppercase">Live Homepage Preview</span>
          </div>
          <span className="text-white/50 text-[11px]">Real-time rendering</span>
        </div>

        {/* Banner Mockup */}
        <div className="relative h-[280px] sm:h-[340px] overflow-hidden flex items-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Slide Preview"
              className="w-full h-full object-cover filter brightness-[0.88]"
            />
          ) : (
            <div className="w-full h-full bg-[#151515] flex flex-col items-center justify-center text-gray-500">
              <ImageIcon size={48} className="mb-[8px] opacity-40" />
              <p className="text-[13px]">Select or upload a banner image below to preview</p>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

          {/* Overlay text */}
          <div className="absolute inset-0 flex items-center p-[25px] sm:p-[45px]">
            <div className="max-w-[560px] relative z-10">
              {/* Calligraphy Watermark */}
              {formData.scriptText && (
                <span
                  className="absolute -top-[45px] -left-[10px] text-[60px] sm:text-[80px] font-serif italic text-white/20 select-none pointer-events-none"
                  style={{ fontFamily: 'Georgia, "Playfair Display", serif' }}
                >
                  {formData.scriptText}
                </span>
              )}

              {formData.badge && (
                <div className="relative z-10 mb-[8px]">
                  <span className="inline-flex items-center gap-[6px] text-[11px] tracking-[0.25em] text-white/95 uppercase font-medium bg-black/40 backdrop-blur-md px-[10px] py-[3px] rounded-[3px] border border-white/10">
                    <Sparkles size={11} className="text-[#cec72e]" />
                    <span>{formData.badge}</span>
                  </span>
                </div>
              )}

              <h3 className="text-[24px] sm:text-[32px] font-bold text-white tracking-wide uppercase leading-tight mb-[8px] drop-shadow-md">
                {formData.title || 'YOUR SLIDER HEADLINE'}
              </h3>

              {formData.subtitle && (
                <p className="text-[13px] sm:text-[14px] leading-[20px] text-white/90 font-normal mb-[16px] line-clamp-2">
                  {formData.subtitle}
                </p>
              )}

              <div className="flex items-center gap-[12px]">
                {formData.primaryBtnText && (
                  <span className="bg-[#121212] text-white px-[20px] py-[8px] text-[13px] tracking-wider uppercase font-normal border border-white/20">
                    {formData.primaryBtnText}
                  </span>
                )}
                {formData.secondaryBtnText && (
                  <span className="text-white text-[13px] flex items-center gap-[4px] underline tracking-wider">
                    {formData.secondaryBtnText} →
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload & Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-[6px] border border-gray-200 shadow-sm p-[25px] sm:p-[30px] space-y-[20px]">
        {/* Upload Mode Selector */}
        <div>
          <label className="block text-[13px] font-bold uppercase tracking-wider text-[#121212] mb-[8px]">
            Step 1: Banner Image Upload <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-[10px] mb-[15px]">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex-1 py-[10px] text-[13px] font-semibold rounded-[4px] border flex items-center justify-center gap-[8px] transition-colors ${
                uploadMode === 'file'
                  ? 'bg-[#121212] text-white border-[#121212]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Upload size={16} />
              <span>Upload Local Image File (from PC/Laptop)</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('url')}
              className={`flex-1 py-[10px] text-[13px] font-semibold rounded-[4px] border flex items-center justify-center gap-[8px] transition-colors ${
                uploadMode === 'url'
                  ? 'bg-[#121212] text-white border-[#121212]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <LinkIcon size={16} />
              <span>Use Web Image URL</span>
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-black rounded-[6px] p-[30px] text-center cursor-pointer transition-colors bg-[#fafafa]"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Upload size={36} className="mx-auto text-gray-400 mb-[10px]" />
              <p className="text-[14px] font-bold text-[#121212]">
                {selectedFile ? selectedFile.name : 'Click to select or drag & drop high-resolution banner'}
              </p>
              <p className="text-[12px] text-gray-500 mt-[4px]">
                Recommended dimensions: 1920 x 720px (JPEG, PNG, WebP) up to 25MB
              </p>
            </div>
          ) : (
            <div>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => {
                  setFormData({ ...formData, imageUrl: e.target.value });
                  setPreviewUrl(e.target.value);
                }}
                placeholder="https://example.com/banner.jpg"
                className="w-full text-[14px] p-[12px] bg-white border border-gray-300 rounded-[4px] outline-none focus:border-black"
              />
              <p className="text-[11px] text-gray-500 mt-[4px]">
                Paste direct URL to any fashion photography banner image.
              </p>
            </div>
          )}
        </div>

        {/* Content Configuration */}
        <div className="pt-[15px] border-t border-gray-200 space-y-[18px]">
          <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#121212]">
            Step 2: Headlines & Calligraphy
          </h4>

          {/* Badge & Watermark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[15px]">
            <div>
              <label className="block text-[12px] font-bold text-[#121212] mb-[4px]">
                Season / Collection Badge Pill
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="WINTER VOLUME 2026"
                className="w-full text-[13px] p-[10px] bg-white border border-gray-300 rounded-[4px] outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#121212] mb-[4px]">
                Cursive Watermark Script Text
              </label>
              <input
                type="text"
                value={formData.scriptText}
                onChange={(e) => setFormData({ ...formData, scriptText: e.target.value })}
                placeholder="Signature"
                className="w-full text-[13px] p-[10px] bg-white border border-gray-300 rounded-[4px] outline-none focus:border-black"
              />
              <span className="text-[11px] text-gray-400">e.g. Signature, Elegance, Chic, Festive</span>
            </div>
          </div>

          {/* Main Title */}
          <div>
            <label className="block text-[12px] font-bold text-[#121212] mb-[4px]">
              Main Banner Headline (H1) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="UNSTITCHED & READY TO WEAR"
              className="w-full text-[15px] font-bold p-[10px] bg-white border border-gray-300 rounded-[4px] outline-none focus:border-black uppercase"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-[12px] font-bold text-[#121212] mb-[4px]">
              Subtitle / Description Text
            </label>
            <textarea
              rows={2}
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Discover rich textures, intricate embroideries, and statement silhouettes tailored for the contemporary winter wardrobe."
              className="w-full text-[13px] p-[10px] bg-white border border-gray-300 rounded-[4px] outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Buttons & Links */}
        <div className="pt-[15px] border-t border-gray-200 space-y-[15px]">
          <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#121212]">
            Step 3: Call to Action Buttons
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[15px]">
            <div>
              <label className="block text-[12px] font-bold text-[#121212] mb-[4px]">
                Primary Button (Button Style 1)
              </label>
              <input
                type="text"
                value={formData.primaryBtnText}
                onChange={(e) => setFormData({ ...formData, primaryBtnText: e.target.value })}
                placeholder="SHOP UNSTITCHED"
                className="w-full text-[13px] p-[8px] bg-white border border-gray-300 rounded-[4px] mb-[6px]"
              />
              <input
                type="text"
                value={formData.primaryBtnLink}
                onChange={(e) => setFormData({ ...formData, primaryBtnLink: e.target.value })}
                placeholder="#unstitched"
                className="w-full text-[12px] p-[8px] bg-white border border-gray-300 rounded-[4px]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#121212] mb-[4px]">
                Secondary Button (Button Style 2)
              </label>
              <input
                type="text"
                value={formData.secondaryBtnText}
                onChange={(e) => setFormData({ ...formData, secondaryBtnText: e.target.value })}
                placeholder="VIEW READY TO WEAR"
                className="w-full text-[13px] p-[8px] bg-white border border-gray-300 rounded-[4px] mb-[6px]"
              />
              <input
                type="text"
                value={formData.secondaryBtnLink}
                onChange={(e) => setFormData({ ...formData, secondaryBtnLink: e.target.value })}
                placeholder="#ready-to-wear"
                className="w-full text-[12px] p-[8px] bg-white border border-gray-300 rounded-[4px]"
              />
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="pt-[15px] border-t border-gray-200 flex items-center gap-[8px]">
          <input
            type="checkbox"
            id="isActiveCheck"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-[18px] h-[18px] accent-black cursor-pointer"
          />
          <label htmlFor="isActiveCheck" className="text-[13px] font-medium text-[#121212] cursor-pointer">
            Immediately display this slider live on the storefront
          </label>
        </div>

        {/* Submit Actions */}
        <div className="pt-[20px] border-t border-gray-200 flex items-center justify-between">
          <Link
            to="/admin/sliders"
            className="px-[18px] py-[10px] text-[13px] text-gray-600 hover:text-black"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="button-primary bg-[#121212] text-white hover:bg-black text-[14px] font-bold px-[30px] py-[12px] rounded-[4px] flex items-center gap-[8px] shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {loading ? (
              <span>Saving & Uploading...</span>
            ) : (
              <>
                <Check size={18} className="text-[#cec72e]" />
                <span>{isEditing ? 'Update & Publish Slider' : 'Publish Slider to Homepage'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

