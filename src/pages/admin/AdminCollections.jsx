import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  UploadCloud,
  Image as ImageIcon,
  Link2,
  Save,
  X,
  Eye,
  ArrowUpRight,
  Sparkles,
  MoveUp,
  MoveDown
} from 'lucide-react';

const COLLECTION_PRESETS = [
  {
    name: 'Winter Velvet (Neon Club)',
    url: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468265/limelight/products/pqcakr8lqfcwiep69tpi.jpg',
    title: 'WINTER VELVET',
    count: '48 Designs',
    tagline: 'Regal textures & opulent hues',
    linkText: 'EXPLORE VELVET',
    linkUrl: '#unstitched'
  },
  {
    name: 'Co-Ord Sets (Rack Hangers)',
    url: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468266/limelight/products/dm9m39psmk0kaoltg2sl.jpg',
    title: 'CO-ORD SETS',
    count: '32 Sets',
    tagline: 'Effortless modern silhouettes',
    linkText: 'SHOP CO-ORDS',
    linkUrl: '#ready-to-wear'
  },
  {
    name: 'Embroidered Organza (Studio)',
    url: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468267/limelight/products/wjpooq3nwwowkcwvmlsf.jpg',
    title: 'EMBROIDERED ORGANZA',
    count: '24 Luxury Suits',
    tagline: 'Intricate metallic thread embroidery',
    linkText: 'VIEW FESTIVE',
    linkUrl: '#unstitched'
  },
  {
    name: 'Warm Khaddar & Karandi (Flatlay)',
    url: 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468268/limelight/products/fqconilr6vvym1wiutor.jpg',
    title: 'WARM KHADDAR & KARANDI',
    count: '65 Articles',
    tagline: 'Timeless warmth for winter days',
    linkText: 'SHOP KHADDAR',
    linkUrl: '#unstitched'
  }
];

export default function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    count: '',
    tagline: '',
    linkText: '',
    linkUrl: '#collections',
    image: '',
    isActive: true
  });

  // Media upload state
  const [imageSource, setImageSource] = useState('upload'); // 'upload' | 'url'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/collections?admin=true');
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
      showFeedback('error', 'Could not load collections from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: 'NEW CURATED COLLECTION',
      count: '35 DESIGNS',
      tagline: 'Contemporary winter aesthetics & silhouettes',
      linkText: 'EXPLORE COLLECTION',
      linkUrl: '#collections',
      image: COLLECTION_PRESETS[0].url,
      isActive: true
    });
    setSelectedFile(null);
    setFilePreview(null);
    setImageSource('upload');
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (col) => {
    setEditingItem(col);
    setFormData({
      title: col.title || '',
      count: col.count || '',
      tagline: col.tagline || '',
      linkText: col.linkText || '',
      linkUrl: col.linkUrl || '#collections',
      image: col.image || '',
      isActive: col.isActive !== false
    });
    setSelectedFile(null);
    setFilePreview(null);
    setImageSource('url');
    setModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setSelectedFile(null);
    setFilePreview(null);
  };

  // Toggle Active
  const handleToggleActive = async (col) => {
    try {
      const newStatus = !col.isActive;
      const res = await fetch(`/api/collections/${col.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
      if (res.ok) {
        showFeedback('success', `Collection "${col.title}" is now ${newStatus ? 'visible' : 'hidden'}.`);
        setCollections(prev => prev.map(c => c.id === col.id ? { ...c, isActive: newStatus } : c));
      }
    } catch (err) {
      showFeedback('error', 'Failed to toggle status.');
    }
  };

  // Delete Collection
  const handleDelete = async (col) => {
    if (!window.confirm(`Delete curated collection "${col.title}"?`)) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/collections/${col.id}`, { method: 'DELETE' });
      if (res.ok) {
        showFeedback('success', `Collection "${col.title}" deleted.`);
        setCollections(prev => prev.filter(c => c.id !== col.id));
      }
    } catch (err) {
      showFeedback('error', 'Error deleting collection.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reset Collections
  const handleReset = async () => {
    if (!window.confirm('Reset all curated collections back to Limelight defaults?')) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/collections/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showFeedback('success', 'Curated collections reset to defaults.');
        setCollections(data.collections || []);
      }
    } catch (err) {
      showFeedback('error', 'Failed to reset collections.');
    } finally {
      setActionLoading(false);
    }
  };

  // File Handlers
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showFeedback('error', 'Please choose a valid image (JPG, PNG, WebP).');
      return;
    }
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  // Save / Submit Collection
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showFeedback('error', 'Collection title is required.');
      return;
    }

    try {
      setActionLoading(true);
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('count', formData.count.trim());
      submitData.append('tagline', formData.tagline.trim());
      submitData.append('linkText', formData.linkText.trim());
      submitData.append('linkUrl', formData.linkUrl.trim());
      submitData.append('isActive', formData.isActive);

      if (selectedFile) {
        submitData.append('image', selectedFile);
      } else {
        submitData.append('image', formData.image || COLLECTION_PRESETS[0].url);
      }

      const endpoint = editingItem ? `/api/collections/${editingItem.id}` : '/api/collections';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        body: submitData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save collection');

      showFeedback('success', `Collection "${formData.title}" saved successfully!`);
      handleCloseModal();
      loadCollections();
    } catch (err) {
      console.error('Error saving collection:', err);
      showFeedback('error', err.message || 'Error saving collection.');
    } finally {
      setActionLoading(false);
    }
  };

  const previewImage = filePreview || formData.image || COLLECTION_PRESETS[0].url;

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
              Curated Collections (Shop By Collection)
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-[8px] py-[2px] rounded-full uppercase tracking-wider">
              {collections.length} Collections
            </span>
          </div>
          <p className="text-[14px] text-gray-500 max-w-[700px]">
            Manage the 4-column Curated Editions grid: upload seasonal photography, customize titles, badges, taglines, and customer action links.
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            onClick={handleReset}
            disabled={actionLoading}
            className="px-[13px] py-[9px] text-[13px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[4px] flex items-center gap-[6px] transition-colors cursor-pointer"
            title="Reset to default 4 Limelight curated editions"
          >
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="button-primary bg-[#cec72e] text-[#121212] hover:bg-[#b8db24] font-bold px-[18px] py-[9px] text-[13px] tracking-wider rounded-[4px] flex items-center gap-[6px] shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle size={17} />
            <span>+ Add New Collection</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
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

      {/* Collections Grid */}
      {loading ? (
        <div className="bg-white p-[60px] text-center rounded-[8px] border border-gray-200 text-gray-500">
          <div className="w-[30px] h-[30px] border-2 border-[#23ac95] border-t-transparent rounded-full animate-spin mx-auto mb-[10px]" />
          <p className="text-[14px]">Loading curated collections...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white p-[60px] text-center rounded-[8px] border border-gray-200 space-y-[12px]">
          <Layers size={40} className="mx-auto text-gray-300" />
          <h3 className="text-[16px] font-bold text-[#121212]">
            No curated collections found
          </h3>
          <p className="text-[13px] text-gray-500 max-w-[400px] mx-auto">
            Click "+ Add New Collection" or "Reset Defaults" to restore the Limelight showcase.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-[16px] py-[8px] text-[13px] font-bold bg-[#121212] text-white rounded-[4px] inline-flex items-center gap-[6px] hover:bg-black cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Add Collection Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
          {collections.map((col, idx) => (
            <div
              key={col.id || idx}
              className="bg-white rounded-[8px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* 1:1 Live Visual Card Frame */}
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = COLLECTION_PRESETS[idx % COLLECTION_PRESETS.length].url;
                  }}
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-[18px] text-white pointer-events-none">
                  {col.count && (
                    <span className="text-[11px] text-white/80 tracking-[0.15em] uppercase block mb-[3px] font-medium">
                      {col.count}
                    </span>
                  )}
                  <h3 className="text-[17px] font-bold tracking-wide uppercase mb-[3px] leading-tight">
                    {col.title}
                  </h3>
                  {col.tagline && (
                    <p className="text-[12px] text-white/85 line-clamp-1 mb-[10px] font-light">
                      {col.tagline}
                    </p>
                  )}

                  <div className="flex items-center gap-[6px] text-[12px] font-medium tracking-wider text-white">
                    <span className="border-b border-white/60 pb-[1px]">
                      {col.linkText || 'EXPLORE NOW'}
                    </span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>

                {/* Inactive Overlay Badge */}
                {col.isActive === false && (
                  <div className="absolute inset-x-0 top-0 bg-amber-500 text-white text-[10px] font-bold py-[3px] text-center tracking-wider">
                    Hidden on Storefront
                  </div>
                )}
              </div>

              {/* Management Controls */}
              <div className="p-[14px] bg-white border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(col)}
                  className="cursor-pointer text-gray-600 hover:text-black flex items-center gap-[4px] text-[12px]"
                  title={col.isActive !== false ? 'Hide from storefront' : 'Publish on storefront'}
                >
                  {col.isActive !== false ? (
                    <>
                      <ToggleRight size={22} className="text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={22} className="text-gray-400" />
                      <span className="text-gray-500">Hidden</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-[6px]">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(col)}
                    className="p-[6px] text-gray-600 hover:text-black hover:bg-gray-100 rounded-[4px] transition-colors cursor-pointer"
                    title="Edit collection details"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(col)}
                    className="p-[6px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-[4px] transition-colors cursor-pointer"
                    title="Delete collection"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-[15px] overflow-y-auto">
          <div className="bg-white rounded-[8px] shadow-2xl max-w-[900px] w-full max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-[20px] border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-[10px]">
                <span className="p-[6px] bg-[#23ac95]/10 text-[#23ac95] rounded-[4px]">
                  <Layers size={18} />
                </span>
                <div>
                  <h2 className="text-[17px] font-bold text-[#121212]">
                    {editingItem ? `Edit Collection: ${formData.title}` : 'Add Curated Collection'}
                  </h2>
                  <p className="text-[12px] text-gray-500">
                    Set up seasonal photography, badge count, headline, and action button.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-[6px] text-gray-400 hover:text-black rounded-[4px] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-[24px] overflow-y-auto flex-1 space-y-[20px]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-[24px]">
                {/* Left (5 cols): Live 1:1 Preview */}
                <div className="md:col-span-5 space-y-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-[4px]">
                      <Eye size={13} className="text-[#23ac95]" />
                      <span>Live Card Preview</span>
                    </span>
                    <span className="text-[10px] text-gray-400">Aspect 4:5</span>
                  </div>

                  <div className="group relative overflow-hidden rounded-[6px] shadow-soft bg-white border border-gray-200 aspect-[4/5]">
                    <img
                      src={previewImage}
                      alt={formData.title}
                      className="w-full h-full object-cover transition-transform duration-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = COLLECTION_PRESETS[0].url;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-[18px] text-white">
                      {formData.count && (
                        <span className="text-[11px] text-white/80 tracking-[0.15em] uppercase block mb-[3px] font-medium">
                          {formData.count}
                        </span>
                      )}
                      <h3 className="text-[18px] font-bold tracking-wide uppercase mb-[3px] leading-tight">
                        {formData.title || 'COLLECTION TITLE'}
                      </h3>
                      {formData.tagline && (
                        <p className="text-[12px] text-white/85 line-clamp-1 mb-[10px] font-light">
                          {formData.tagline}
                        </p>
                      )}

                      <div className="flex items-center gap-[6px] text-[12px] font-medium tracking-wider text-white">
                        <span className="border-b border-white/60 pb-[1px]">
                          {formData.linkText || 'EXPLORE NOW'}
                        </span>
                        <ArrowUpRight size={14} />
                      </div>
                    </div>
                  </div>

                  <div className="p-[10px] bg-gray-50 border border-gray-200 rounded-[6px] text-[11px] text-gray-600 flex items-center justify-between">
                    <span>Storefront Visibility:</span>
                    <span className={`font-bold ${formData.isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formData.isActive ? '● Published' : '● Hidden'}
                    </span>
                  </div>
                </div>

                {/* Right (7 cols): Inputs & Uploader */}
                <div className="md:col-span-7 space-y-[16px]">
                  {/* Photography Uploader */}
                  <div className="border border-gray-200 rounded-[6px] p-[14px] bg-gray-50/50 space-y-[10px]">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-[8px]">
                      <span className="text-[13px] font-bold text-gray-700 flex items-center gap-[6px]">
                        <ImageIcon size={15} className="text-[#23ac95]" />
                        <span>Collection Photography *</span>
                      </span>
                      <div className="flex items-center gap-[4px] bg-gray-200 p-[2px] rounded-[4px]">
                        <button
                          type="button"
                          onClick={() => setImageSource('upload')}
                          className={`px-[8px] py-[3px] text-[11px] font-medium rounded-[3px] transition-colors ${
                            imageSource === 'upload' ? 'bg-white text-black shadow-xs' : 'text-gray-600'
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSource('url')}
                          className={`px-[8px] py-[3px] text-[11px] font-medium rounded-[3px] transition-colors ${
                            imageSource === 'url' ? 'bg-white text-black shadow-xs' : 'text-gray-600'
                          }`}
                        >
                          Image URL
                        </button>
                      </div>
                    </div>

                    {imageSource === 'upload' ? (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-[6px] p-[16px] text-center cursor-pointer transition-all ${
                          dragOver ? 'border-[#23ac95] bg-[#23ac95]/5' : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center gap-[6px]">
                          <div className="w-[36px] h-[36px] rounded-full bg-[#23ac95]/10 text-[#23ac95] flex items-center justify-center">
                            <UploadCloud size={18} />
                          </div>
                          <p className="text-[12px] font-semibold text-[#121212]">
                            Click or drag photo here
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Portrait aspect 4:5 recommended (JPG, PNG, WebP)
                          </p>
                        </div>
                        {selectedFile && (
                          <p className="text-[11px] text-emerald-700 font-bold mt-[6px]">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-[10px] flex items-center pointer-events-none text-gray-400">
                          <Link2 size={15} />
                        </span>
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="https://res.cloudinary.com/antxd4tm/image/upload/v1795468254/limelight/products/wxmrzxlgmlg2tetiiguu.jpg"
                          className="w-full pl-[32px] pr-[10px] py-[8px] text-[12px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212] bg-white"
                        />
                      </div>
                    )}

                    {/* Presets */}
                    <div>
                      <span className="text-[10px] font-semibold text-gray-500 block mb-[4px]">
                        Quick Curated Presets:
                      </span>
                      <div className="grid grid-cols-2 gap-[6px]">
                        {COLLECTION_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setFilePreview(null);
                              setFormData({
                                ...formData,
                                image: preset.url,
                                title: preset.title,
                                count: preset.count,
                                tagline: preset.tagline,
                                linkText: preset.linkText,
                                linkUrl: preset.linkUrl
                              });
                            }}
                            className={`p-[5px] rounded-[4px] border text-left text-[10px] font-medium transition-colors flex items-center gap-[6px] cursor-pointer ${
                              formData.image === preset.url && !selectedFile
                                ? 'border-[#121212] bg-[#121212] text-white'
                                : 'border-gray-200 bg-white hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-[20px] h-[20px] object-cover rounded-[2px] shrink-0"
                            />
                            <span className="truncate">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Text Fields */}
                  <div className="space-y-[12px]">
                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 mb-[3px]">
                        Collection Title * (Uppercase)
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. WINTER VELVET, CO-ORD SETS"
                        className="w-full px-[10px] py-[8px] text-[13px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212] font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-[10px]">
                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-[3px]">
                          Count / Edition Badge
                        </label>
                        <input
                          type="text"
                          value={formData.count}
                          onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                          placeholder="e.g. 48 Designs, 32 Sets"
                          className="w-full px-[10px] py-[8px] text-[12px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212]"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-gray-700 mb-[3px]">
                          Action Button Text
                        </label>
                        <input
                          type="text"
                          value={formData.linkText}
                          onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                          placeholder="e.g. EXPLORE VELVET"
                          className="w-full px-[10px] py-[8px] text-[12px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 mb-[3px]">
                        Tagline / Description
                      </label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        placeholder="e.g. Regal textures & opulent hues"
                        className="w-full px-[10px] py-[8px] text-[12px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212]"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-gray-700 mb-[3px]">
                        Target Link / Route
                      </label>
                      <input
                        type="text"
                        value={formData.linkUrl}
                        onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                        placeholder="e.g. #unstitched, #ready-to-wear, /collections/velvet"
                        className="w-full px-[10px] py-[8px] text-[12px] border border-gray-300 rounded-[5px] focus:outline-none focus:border-[#121212]"
                      />
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex items-center justify-between p-[10px] border border-gray-200 rounded-[5px] bg-white">
                      <div>
                        <span className="text-[12px] font-bold text-[#121212] block">
                          Storefront Visibility
                        </span>
                        <span className="text-[10px] text-gray-500">
                          Show this collection card on the homepage
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                        className="cursor-pointer"
                      >
                        {formData.isActive ? (
                          <ToggleRight size={26} className="text-emerald-600" />
                        ) : (
                          <ToggleLeft size={26} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-[16px] border-t border-gray-200 flex items-center justify-end gap-[10px] bg-gray-50">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-[14px] py-[8px] text-[12px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-[4px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={actionLoading}
                className="button-primary bg-[#121212] hover:bg-black text-white font-bold px-[18px] py-[8px] text-[12px] rounded-[4px] flex items-center gap-[6px] shadow-sm transition-all cursor-pointer"
              >
                <Save size={15} />
                <span>{actionLoading ? 'Saving...' : editingItem ? 'Update Collection' : 'Create & Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

