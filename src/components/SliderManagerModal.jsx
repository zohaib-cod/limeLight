import React, { useState, useRef } from 'react';
import {
  X, Plus, Upload, Link as LinkIcon, Trash2, Edit2, ArrowUp, ArrowDown,
  Check, Eye, EyeOff, RefreshCw, AlertCircle, Image as ImageIcon
} from 'lucide-react';

export default function SliderManagerModal({
  isOpen,
  onClose,
  slides,
  onSlidesUpdated
}) {
  const [editingSlide, setEditingSlide] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    badge: 'WINTER VOLUME 2026',
    scriptText: 'Signature',
    title: 'UNSTITCHED & READY TO WEAR',
    subtitle: 'Discover rich textures, intricate embroideries, and statement silhouettes tailored for the contemporary winter wardrobe.',
    primaryBtnText: 'SHOP UNSTITCHED',
    primaryBtnLink: '#unstitched',
    secondaryBtnText: 'VIEW READY TO WEAR',
    secondaryBtnLink: '#ready-to-wear',
    imageUrl: '',
    isActive: true
  });

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      badge: 'WINTER VOLUME 2026',
      scriptText: 'Signature',
      title: 'UNSTITCHED & READY TO WEAR',
      subtitle: 'Discover rich textures, intricate embroideries, and statement silhouettes tailored for the contemporary winter wardrobe.',
      primaryBtnText: 'SHOP UNSTITCHED',
      primaryBtnLink: '#unstitched',
      secondaryBtnText: 'VIEW READY TO WEAR',
      secondaryBtnLink: '#ready-to-wear',
      imageUrl: '',
      isActive: true
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingSlide(null);
    setIsAddingNew(false);
    setErrorMsg('');
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAddingNew(true);
  };

  const handleStartEdit = (slide) => {
    setEditingSlide(slide);
    setIsAddingNew(true);
    setFormData({
      badge: slide.badge || '',
      scriptText: slide.scriptText || 'Signature',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      primaryBtnText: slide.primaryBtnText || 'SHOP NOW',
      primaryBtnLink: slide.primaryBtnLink || '#unstitched',
      secondaryBtnText: slide.secondaryBtnText || 'EXPLORE',
      secondaryBtnLink: slide.secondaryBtnLink || '#ready-to-wear',
      imageUrl: slide.imageUrl || '',
      isActive: slide.isActive !== false
    });
    setPreviewUrl(slide.imageUrl || '');
    setUploadMode('url');
    setErrorMsg('');
  };

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
      } else if (!editingSlide) {
        setErrorMsg('Please upload an image file or provide an image URL.');
        setLoading(false);
        return;
      }

      const url = editingSlide
        ? `/api/slides/${editingSlide.id}`
        : '/api/slides';
      const method = editingSlide ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: data
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to save slide');
      }

      setSuccessMsg(editingSlide ? 'Slide updated successfully!' : 'New slide uploaded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      resetForm();
      if (onSlidesUpdated) onSlidesUpdated();
    } catch (err) {
      setErrorMsg(err.message || 'Error saving slide');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slideId) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/slides/${slideId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete slide');
      setSuccessMsg('Slide deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      if (onSlidesUpdated) onSlidesUpdated();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (slide) => {
    try {
      const res = await fetch(`/api/slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slide.isActive })
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      if (onSlidesUpdated) onSlidesUpdated();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIndex, 0, moved);

    const orderIds = newSlides.map(s => s.id);
    try {
      const res = await fetch('/api/slides/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds })
      });
      if (!res.ok) throw new Error('Failed to reorder');
      if (onSlidesUpdated) onSlidesUpdated();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all slides to default Limelight campaign configuration?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/slides/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset');
      setSuccessMsg('Slides reset to default!');
      setTimeout(() => setSuccessMsg(''), 3000);
      if (onSlidesUpdated) onSlidesUpdated();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-assistant">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-modal flex flex-col z-10 text-[#121212]">
          {/* Header */}
          <div className="p-[20px] bg-[#121212] text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-[8px]">
                <ImageIcon size={20} className="text-[#cec72e]" />
                <h3 className="text-[18px] font-bold text-white tracking-wide">
                  Hero Slider Manager
                </h3>
              </div>
              <p className="text-[12px] text-white/70 mt-[2px]">
                Upload unlimited slider banners and manage your homepage campaign
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-[6px] text-white/80 hover:text-white rounded-full hover:bg-white/10"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="bg-red-50 text-[#cf0c1d] px-[20px] py-[10px] text-[13px] flex items-center gap-[8px] border-b border-red-200">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 px-[20px] py-[10px] text-[13px] flex items-center gap-[8px] border-b border-emerald-200">
              <Check size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-[20px] space-y-[20px]">
            {/* Top Action Bar */}
            {!isAddingNew && (
              <div className="flex items-center justify-between pb-[15px] border-b border-gray-200">
                <span className="text-[14px] font-semibold text-[#121212]">
                  Total Active Slides: {slides.filter(s => s.isActive !== false).length} / {slides.length}
                </span>
                <div className="flex items-center gap-[10px]">
                  <button
                    onClick={handleResetDefaults}
                    className="px-[12px] py-[7px] text-[12px] text-[#121212bf] hover:text-[#121212] border border-gray-300 rounded-[3px] flex items-center gap-[5px]"
                    title="Reset to default slides"
                  >
                    <RefreshCw size={13} />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleStartAdd}
                    className="button-primary bg-[#121212] text-white px-[16px] py-[8px] text-[13px] rounded-[3px] flex items-center gap-[6px]"
                  >
                    <Plus size={16} />
                    <span>Add New Slide</span>
                  </button>
                </div>
              </div>
            )}

            {/* Form when adding or editing */}
            {isAddingNew ? (
              <form onSubmit={handleSubmit} className="space-y-[15px] bg-[#f9f9f9] p-[20px] rounded-[6px] border border-gray-200">
                <div className="flex items-center justify-between border-b pb-[10px]">
                  <h4 className="text-[15px] font-bold text-[#121212]">
                    {editingSlide ? 'Edit Slide Details' : 'Upload New Slide Banner'}
                  </h4>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-[12px] text-gray-500 hover:text-black underline"
                  >
                    Cancel
                  </button>
                </div>

                {/* Upload Image Section */}
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-[#121212] mb-[6px]">
                    Slide Image Banner <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-[10px] mb-[10px]">
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`flex-1 py-[7px] text-[12px] rounded-[3px] border flex items-center justify-center gap-[6px] transition-colors ${
                        uploadMode === 'file'
                          ? 'bg-[#121212] text-white border-[#121212]'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      <Upload size={14} />
                      <span>Upload from Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`flex-1 py-[7px] text-[12px] rounded-[3px] border flex items-center justify-center gap-[6px] transition-colors ${
                        uploadMode === 'url'
                          ? 'bg-[#121212] text-white border-[#121212]'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      <LinkIcon size={14} />
                      <span>Image Web URL</span>
                    </button>
                  </div>

                  {uploadMode === 'file' ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-[5px] p-[20px] text-center cursor-pointer hover:border-black transition-colors bg-white"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <Upload size={28} className="mx-auto text-gray-400 mb-[6px]" />
                      <p className="text-[13px] font-medium text-[#121212]">
                        {selectedFile ? selectedFile.name : 'Click to select or drag banner image here'}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-[2px]">
                        Recommended size: 1920 x 720px (JPEG, PNG, WebP)
                      </p>
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, imageUrl: e.target.value });
                        setPreviewUrl(e.target.value);
                      }}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full text-[13px] p-[10px] bg-white border border-gray-300 rounded-[4px] outline-none focus:border-black"
                    />
                  )}

                  {/* Preview Container */}
                  {previewUrl && (
                    <div className="mt-[10px] relative rounded-[4px] overflow-hidden border border-gray-200 bg-black max-h-[160px]">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover max-h-[160px]"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <span className="absolute bottom-[6px] right-[6px] bg-black/70 text-white text-[10px] px-[6px] py-[2px] rounded">
                        Banner Preview
                      </span>
                    </div>
                  )}
                </div>

                {/* Title & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                  <div>
                    <label className="block text-[12px] font-bold text-[#121212] mb-[4px]">
                      Top Badge Text
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="WINTER VOLUME 2026"
                      className="w-full text-[13px] p-[8px] bg-white border border-gray-300 rounded-[4px] outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#121212] mb-[4px]">
                      Watermark Calligraphy Text
                    </label>
                    <input
                      type="text"
                      value={formData.scriptText}
                      onChange={(e) => setFormData({ ...formData, scriptText: e.target.value })}
                      placeholder="Signature"
                      className="w-full text-[13px] p-[8px] bg-white border border-gray-300 rounded-[4px] outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Main Heading Title (H1) */}
                <div>
                  <label className="block text-[12px] font-bold text-[#121212] mb-[4px]">
                    Main Title (H1) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="UNSTITCHED & READY TO WEAR"
                    className="w-full text-[14px] font-bold p-[9px] bg-white border border-gray-300 rounded-[4px] outline-none focus:border-black uppercase"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-[12px] font-bold text-[#121212] mb-[4px]">
                    Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Discover rich textures, intricate embroideries, and statement silhouettes..."
                    className="w-full text-[13px] p-[8px] bg-white border border-gray-300 rounded-[4px] outline-none focus:border-black"
                  />
                </div>

                {/* Buttons Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#121212] mb-[4px]">
                      Button 1 Text & Link
                    </label>
                    <input
                      type="text"
                      value={formData.primaryBtnText}
                      onChange={(e) => setFormData({ ...formData, primaryBtnText: e.target.value })}
                      placeholder="SHOP UNSTITCHED"
                      className="w-full text-[12px] p-[7px] bg-white border border-gray-300 rounded-[4px] mb-[4px]"
                    />
                    <input
                      type="text"
                      value={formData.primaryBtnLink}
                      onChange={(e) => setFormData({ ...formData, primaryBtnLink: e.target.value })}
                      placeholder="#unstitched"
                      className="w-full text-[12px] p-[7px] bg-white border border-gray-300 rounded-[4px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#121212] mb-[4px]">
                      Button 2 Text & Link
                    </label>
                    <input
                      type="text"
                      value={formData.secondaryBtnText}
                      onChange={(e) => setFormData({ ...formData, secondaryBtnText: e.target.value })}
                      placeholder="VIEW READY TO WEAR"
                      className="w-full text-[12px] p-[7px] bg-white border border-gray-300 rounded-[4px] mb-[4px]"
                    />
                    <input
                      type="text"
                      value={formData.secondaryBtnLink}
                      onChange={(e) => setFormData({ ...formData, secondaryBtnLink: e.target.value })}
                      placeholder="#ready-to-wear"
                      className="w-full text-[12px] p-[7px] bg-white border border-gray-300 rounded-[4px]"
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-[8px] pt-[5px]">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-[16px] h-[16px] accent-black cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-[13px] text-[#121212] font-medium cursor-pointer">
                    Enable and display this slide on website
                  </label>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex justify-end gap-[10px] pt-[10px] border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-[16px] py-[8px] text-[13px] text-gray-600 hover:text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="button-primary bg-[#121212] text-white px-[25px] py-[9px] text-[13px] rounded-[3px] flex items-center gap-[6px]"
                  >
                    {loading ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>{editingSlide ? 'Update Slide' : 'Publish Slide'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : null}

            {/* List of existing slides */}
            <div className="space-y-[12px]">
              <div className="flex items-center justify-between text-[13px] font-bold text-gray-500 uppercase tracking-wider pb-[6px]">
                <span>All Slides ({slides.length})</span>
                <span>Actions</span>
              </div>

              {slides.length === 0 ? (
                <div className="text-center py-[40px] text-gray-400 border border-dashed rounded-[6px]">
                  <ImageIcon size={36} className="mx-auto mb-[8px] opacity-40" />
                  <p className="text-[14px]">No slides available yet.</p>
                  <button
                    onClick={handleStartAdd}
                    className="mt-[10px] text-[13px] text-black font-semibold underline"
                  >
                    Click here to upload your first slide
                  </button>
                </div>
              ) : (
                slides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`flex items-center gap-[12px] p-[12px] rounded-[6px] border transition-all ${
                      slide.isActive === false
                        ? 'bg-gray-100 border-gray-200 opacity-60'
                        : 'bg-white border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-[3px]">
                      <button
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        className="p-[3px] text-gray-400 hover:text-black disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === slides.length - 1}
                        className="p-[3px] text-gray-400 hover:text-black disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Order Index */}
                    <span className="text-[12px] font-bold text-gray-400 w-[18px]">
                      #{idx + 1}
                    </span>

                    {/* Image Thumbnail */}
                    <div className="w-[85px] h-[55px] bg-gray-100 rounded-[4px] overflow-hidden shrink-0 border border-gray-200">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-[6px]">
                        <span className="text-[10px] tracking-wider uppercase font-semibold text-[#121212bf] bg-gray-100 px-[5px] py-[1px] rounded">
                          {slide.badge || 'SLIDE'}
                        </span>
                        {slide.scriptText && (
                          <span className="text-[10px] text-gray-400 italic">
                            ({slide.scriptText})
                          </span>
                        )}
                      </div>
                      <h5 className="text-[14px] font-bold text-[#121212] truncate mt-[2px]">
                        {slide.title}
                      </h5>
                      <p className="text-[11px] text-gray-500 truncate">
                        {slide.subtitle || 'No subtitle provided'}
                      </p>
                    </div>

                    {/* Quick Action buttons */}
                    <div className="flex items-center gap-[6px] shrink-0">
                      {/* Active toggle */}
                      <button
                        onClick={() => handleToggleActive(slide)}
                        className={`p-[6px] rounded-[3px] transition-colors ${
                          slide.isActive !== false
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-gray-400 hover:bg-gray-200'
                        }`}
                        title={slide.isActive !== false ? 'Active (Click to hide)' : 'Hidden (Click to show)'}
                      >
                        {slide.isActive !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleStartEdit(slide)}
                        className="p-[6px] text-gray-600 hover:text-black hover:bg-gray-100 rounded-[3px]"
                        title="Edit Slide"
                      >
                        <Edit2 size={16} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(slide.id)}
                        className="p-[6px] text-gray-400 hover:text-[#cf0c1d] hover:bg-red-50 rounded-[3px]"
                        title="Delete Slide"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-[15px] bg-[#f3f3f3] border-t border-gray-200 flex justify-between items-center text-[12px] text-gray-600">
            <span>Changes reflect immediately on your live homepage slider</span>
            <button
              onClick={onClose}
              className="px-[16px] py-[6px] bg-[#121212] text-white text-[13px] rounded-[3px]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

