import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function AdminFeatures() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    isActive: true
  });

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/features?all=true');
      if (res.ok) {
        const data = await res.json();
        setFeatures(data);
      }
    } catch (err) {
      setErrorMsg('Failed to load features from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', isActive: true });
    setIsAdding(false);
    setEditingId(null);
    setErrorMsg('');
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleStartEdit = (feat) => {
    setEditingId(feat.id);
    setIsAdding(true);
    setFormData({
      title: feat.title || '',
      subtitle: feat.subtitle || '',
      isActive: feat.isActive !== false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('Title is required');
      return;
    }

    try {
      const url = editingId ? `/api/features/${editingId}` : '/api/features';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save feature');

      setSuccessMsg(editingId ? 'Feature updated successfully!' : 'New feature added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      resetForm();
      fetchFeatures();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete feature highlight "${title}"?`)) return;
    try {
      const res = await fetch(`/api/features/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMsg(`Feature "${title}" deleted.`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchFeatures();
      } else {
        throw new Error('Failed to delete feature');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleActive = async (feat) => {
    try {
      const res = await fetch(`/api/features/${feat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !feat.isActive })
      });
      if (res.ok) {
        fetchFeatures();
      }
    } catch (err) {
      setErrorMsg('Failed to update status');
    }
  };

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= features.length) return;

    const reordered = [...features];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);

    const orderIds = reordered.map(f => f.id);
    try {
      const res = await fetch('/api/features/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds })
      });
      if (res.ok) {
        fetchFeatures();
      }
    } catch (err) {
      setErrorMsg('Failed to reorder');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset feature highlights bar to official Limelight defaults?')) return;
    try {
      const res = await fetch('/api/features/reset', { method: 'POST' });
      if (res.ok) {
        setSuccessMsg('Feature highlights reset to defaults!');
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchFeatures();
      }
    } catch (err) {
      setErrorMsg('Failed to reset');
    }
  };

  return (
    <div className="space-y-[25px] font-assistant max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white p-[20px] sm:p-[25px] rounded-[6px] border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-[15px]">
        <div>
          <div className="flex items-center gap-[8px]">
            <Sparkles size={18} className="text-[#cec72e]" />
            <h2 className="text-[20px] font-bold text-[#121212]">
              Feature Highlights Bar Management
            </h2>
          </div>
          <p className="text-[13px] text-gray-500 mt-[2px]">
            Edit, reorder, add, or delete the 4 key value proposition highlights displayed below the hero slider
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            onClick={handleReset}
            className="px-[12px] py-[8px] text-[12px] text-gray-600 hover:text-black border border-gray-300 rounded-[4px] flex items-center gap-[6px] hover:bg-gray-50"
            title="Reset to official 4 highlights"
          >
            <RefreshCw size={13} />
            <span>Reset Defaults</span>
          </button>

          {!isAdding && (
            <button
              onClick={handleStartAdd}
              className="button-primary bg-[#121212] text-white hover:bg-black font-semibold text-[13px] px-[16px] py-[8px] rounded-[4px] flex items-center gap-[6px]"
            >
              <PlusCircle size={15} />
              <span>Add Feature Highlight</span>
            </button>
          )}
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

      {/* Live Preview of the Feature Bar */}
      <div className="bg-white rounded-[6px] border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-[20px] py-[10px] bg-[#f9f9f9] border-b border-gray-200 flex items-center justify-between text-[12px]">
          <span className="font-bold text-[#121212] uppercase tracking-wider">
            Live Storefront Preview
          </span>
          <span className="text-gray-500">
            {features.filter(f => f.isActive !== false).length} items active
          </span>
        </div>

        <div className="py-[20px] px-[15px] border-b border-[#1212121a] bg-white">
          <div className="max-w-[1315px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-[20px] text-center">
            {features
              .filter(f => f.isActive !== false)
              .map((item) => (
                <div key={item.id} className="flex flex-col items-center">
                  <span className="text-[13px] sm:text-[14px] font-semibold text-[#121212] tracking-wider uppercase leading-snug">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className="text-[11px] sm:text-[12px] text-[#121212bf] mt-[3px]">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Form when Adding or Editing */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white rounded-[6px] border border-black p-[25px] shadow-md space-y-[15px] animate-expand">
          <div className="flex items-center justify-between border-b border-gray-200 pb-[10px]">
            <h3 className="text-[16px] font-bold text-[#121212]">
              {editingId ? 'Edit Feature Highlight' : 'Add New Feature Highlight'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-[12px] text-gray-500 hover:text-black underline"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[15px]">
            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#121212] mb-[4px]">
                Headline Title (e.g. FREE NATIONWIDE SHIPPING) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="FREE NATIONWIDE SHIPPING"
                className="w-full text-[14px] font-bold p-[10px] bg-white border border-gray-300 rounded-[4px] outline-none focus:border-black uppercase"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold uppercase tracking-wider text-[#121212] mb-[4px]">
                Subtitle / Details (e.g. On orders above Rs. 2,490)
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="On orders above Rs. 2,490"
                className="w-full text-[13px] p-[10px] bg-white border border-gray-300 rounded-[4px] outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex items-center gap-[8px] pt-[5px]">
            <input
              type="checkbox"
              id="isActiveFeat"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-[16px] h-[16px] accent-black cursor-pointer"
            />
            <label htmlFor="isActiveFeat" className="text-[13px] font-medium text-[#121212] cursor-pointer">
              Show this highlight on website
            </label>
          </div>

          <div className="flex justify-end gap-[10px] pt-[12px] border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-[16px] py-[8px] text-[13px] text-gray-600 hover:text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary bg-[#121212] text-white hover:bg-black font-semibold text-[13px] px-[24px] py-[9px] rounded-[4px] flex items-center gap-[6px]"
            >
              <Check size={16} />
              <span>{editingId ? 'Update Feature' : 'Save Feature'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Feature List */}
      <div className="space-y-[12px]">
        <div className="flex items-center justify-between text-[12px] font-bold text-gray-400 uppercase tracking-wider pb-[4px]">
          <span>Configured Highlights ({features.length})</span>
          <span>Actions</span>
        </div>

        {features.map((feat, idx) => (
          <div
            key={feat.id}
            className={`p-[16px] rounded-[6px] border bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-[15px] transition-all ${
              feat.isActive === false ? 'opacity-50 bg-gray-50' : 'border-gray-200 hover:border-black'
            }`}
          >
            {/* Left: Reorder + Index + Info */}
            <div className="flex items-center gap-[15px] flex-1 min-w-0">
              {/* Up/Down buttons */}
              <div className="flex flex-col gap-[2px] shrink-0">
                <button
                  onClick={() => handleMove(idx, -1)}
                  disabled={idx === 0}
                  className="p-[3px] text-gray-400 hover:text-black hover:bg-gray-100 rounded disabled:opacity-20"
                  title="Move Up"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  onClick={() => handleMove(idx, 1)}
                  disabled={idx === features.length - 1}
                  className="p-[3px] text-gray-400 hover:text-black hover:bg-gray-100 rounded disabled:opacity-20"
                  title="Move Down"
                >
                  <ArrowDown size={15} />
                </button>
              </div>

              <span className="text-[13px] font-bold text-gray-400 w-[24px] text-center">
                #{idx + 1}
              </span>

              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-bold text-[#121212] uppercase tracking-wide truncate">
                  {feat.title}
                </h4>
                {feat.subtitle && (
                  <p className="text-[12px] text-gray-500 mt-[1px]">
                    {feat.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-[8px] shrink-0">
              {/* Active Toggle */}
              <button
                onClick={() => handleToggleActive(feat)}
                className={`px-[10px] py-[6px] rounded-[4px] text-[12px] font-semibold flex items-center gap-[4px] transition-colors ${
                  feat.isActive !== false
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title={feat.isActive !== false ? 'Active (Click to Hide)' : 'Hidden (Click to Show)'}
              >
                {feat.isActive !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{feat.isActive !== false ? 'Live' : 'Hidden'}</span>
              </button>

              {/* Edit */}
              <button
                onClick={() => handleStartEdit(feat)}
                className="px-[10px] py-[6px] bg-gray-100 hover:bg-gray-200 text-[#121212] rounded-[4px] text-[12px] font-medium flex items-center gap-[4px] transition-colors"
                title="Edit this highlight"
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(feat.id, feat.title)}
                className="px-[10px] py-[6px] bg-red-50 hover:bg-red-100 text-[#cf0c1d] rounded-[4px] text-[12px] font-medium flex items-center gap-[4px] transition-colors"
                title="Delete this highlight"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

