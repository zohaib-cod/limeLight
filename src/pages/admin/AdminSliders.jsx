import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  AlertCircle,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function AdminSliders() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/slides?all=true');
      if (res.ok) {
        const data = await res.json();
        setSlides(data);
      }
    } catch (err) {
      setErrorMsg('Could not fetch slides from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the slide "${title}"?`)) return;
    try {
      const res = await fetch(`/api/slides/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMsg(`Slide "${title}" removed.`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchSlides();
      } else {
        throw new Error('Failed to delete slide');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleActive = async (slide) => {
    try {
      const res = await fetch(`/api/slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slide.isActive })
      });
      if (res.ok) {
        fetchSlides();
      }
    } catch (err) {
      setErrorMsg('Failed to update status');
    }
  };

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;

    const reordered = [...slides];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);

    const orderIds = reordered.map(s => s.id);
    try {
      const res = await fetch('/api/slides/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds })
      });
      if (res.ok) {
        fetchSlides();
      }
    } catch (err) {
      setErrorMsg('Failed to reorder');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all slides to standard official campaign configuration?')) return;
    try {
      const res = await fetch('/api/slides/reset', { method: 'POST' });
      if (res.ok) {
        setSuccessMsg('Reset to default campaign slides.');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchSlides();
      }
    } catch (err) {
      setErrorMsg('Failed to reset');
    }
  };

  return (
    <div className="space-y-[25px] font-assistant">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[15px] bg-white p-[20px] rounded-[6px] border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-[20px] font-bold text-[#121212]">
            Hero Banners & Sliders ({slides.length})
          </h2>
          <p className="text-[13px] text-gray-500">
            Control the sequence, visibility, and links of all banners shown on your storefront
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            onClick={handleReset}
            className="px-[12px] py-[8px] text-[12px] text-gray-600 hover:text-black border border-gray-300 rounded-[4px] flex items-center gap-[6px] hover:bg-gray-50"
            title="Reset to defaults"
          >
            <RefreshCw size={13} />
            <span>Reset Defaults</span>
          </button>

          {/* Upload Button that navigates to the upload route */}
          <Link
            to="/admin/sliders/new"
            className="button-primary bg-[#121212] text-white hover:bg-black font-semibold text-[13px] px-[18px] py-[9px] rounded-[4px] flex items-center gap-[6px] shadow-sm transition-transform active:scale-95"
          >
            <PlusCircle size={16} />
            <span>Upload New Slider</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-[16px] py-[10px] rounded-[4px] text-[13px] flex items-center gap-[8px]">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 text-[#cf0c1d] border border-red-200 px-[16px] py-[10px] rounded-[4px] text-[13px] flex items-center gap-[8px]">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Sliders Grid / Cards */}
      <div className="space-y-[15px]">
        {loading ? (
          <div className="text-center py-[50px] text-gray-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-[8px]" />
            <p>Loading slides from backend...</p>
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center py-[60px] bg-white rounded-[6px] border border-dashed border-gray-300">
            <Layers size={40} className="mx-auto text-gray-300 mb-[10px]" />
            <h4 className="text-[16px] font-bold text-[#121212] mb-[4px]">
              No Sliders Available
            </h4>
            <p className="text-[13px] text-gray-500 mb-[15px]">
              You can upload as many banners as you like to populate your homepage carousel.
            </p>
            <Link
              to="/admin/sliders/new"
              className="button-primary bg-[#121212] text-white text-[13px] px-[20px] py-[8px] rounded-[4px] inline-flex items-center gap-[6px]"
            >
              <PlusCircle size={15} />
              <span>Upload First Slide</span>
            </Link>
          </div>
        ) : (
          slides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className={`bg-white rounded-[6px] border p-[15px] sm:p-[20px] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-[20px] transition-all ${
                slide.isActive === false ? 'opacity-60 bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-black'
              }`}
            >
              {/* Left: Reorder controls + Thumbnail + Details */}
              <div className="flex items-center gap-[15px] flex-1 min-w-0">
                {/* Reorder Arrows */}
                <div className="flex flex-col gap-[3px] shrink-0">
                  <button
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    className="p-[4px] text-gray-400 hover:text-black hover:bg-gray-100 rounded disabled:opacity-20"
                    title="Move Up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === slides.length - 1}
                    className="p-[4px] text-gray-400 hover:text-black hover:bg-gray-100 rounded disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>

                {/* Sequence Badge */}
                <span className="text-[14px] font-bold text-gray-400 w-[24px] text-center shrink-0">
                  #{idx + 1}
                </span>

                {/* Banner Thumbnail */}
                <div className="w-[140px] sm:w-[180px] h-[75px] sm:h-[90px] rounded-[4px] overflow-hidden bg-black shrink-0 relative border border-gray-200">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://res.cloudinary.com/antxd4tm/image/upload/v1795468254/limelight/products/wxmrzxlgmlg2tetiiguu.jpg';
                    }}
                  />
                  {slide.isActive === false && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[11px] font-bold">
                      HIDDEN
                    </div>
                  )}
                </div>

                {/* Meta details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[8px] flex-wrap mb-[4px]">
                    <span className="text-[10px] font-bold bg-[#121212] text-white px-[6px] py-[2px] rounded uppercase tracking-wider">
                      {slide.badge || 'CAMPAIGN'}
                    </span>
                    {slide.scriptText && (
                      <span className="text-[11px] text-[#23ac95] font-serif italic">
                        Watermark: "{slide.scriptText}"
                      </span>
                    )}
                  </div>

                  <h3 className="text-[16px] font-bold text-[#121212] truncate">
                    {slide.title}
                  </h3>

                  {slide.subtitle && (
                    <p className="text-[12px] text-gray-500 line-clamp-1 mt-[2px]">
                      {slide.subtitle}
                    </p>
                  )}

                  <div className="flex items-center gap-[12px] mt-[6px] text-[11px] text-gray-600 flex-wrap">
                    <span><strong>Button 1:</strong> {slide.primaryBtnText} ({slide.primaryBtnLink})</span>
                    {slide.secondaryBtnText && (
                      <span>• <strong>Button 2:</strong> {slide.secondaryBtnText} ({slide.secondaryBtnLink})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-[10px] w-full md:w-auto justify-end border-t md:border-t-0 pt-[10px] md:pt-0">
                {/* Active toggle */}
                <button
                  onClick={() => handleToggleActive(slide)}
                  className={`px-[10px] py-[6px] rounded-[4px] text-[12px] font-semibold flex items-center gap-[5px] transition-colors ${
                    slide.isActive !== false
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title={slide.isActive !== false ? 'Click to Hide on Homepage' : 'Click to Show on Homepage'}
                >
                  {slide.isActive !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{slide.isActive !== false ? 'Active' : 'Hidden'}</span>
                </button>

                {/* Edit Button */}
                <Link
                  to={`/admin/sliders/edit/${slide.id}`}
                  className="px-[10px] py-[6px] bg-gray-100 hover:bg-gray-200 text-[#121212] rounded-[4px] text-[12px] font-medium flex items-center gap-[5px] transition-colors"
                  title="Edit Slide Details"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </Link>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(slide.id, slide.title)}
                  className="px-[10px] py-[6px] bg-red-50 hover:bg-red-100 text-[#cf0c1d] rounded-[4px] text-[12px] font-medium flex items-center gap-[5px] transition-colors"
                  title="Delete Slide"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

