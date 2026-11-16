import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Save,
  RotateCcw,
  PlusCircle,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  Users,
  Check,
  X,
  Download,
  Send,
  Layers,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

const DEFAULT_FOOTER_CONFIG = {
  newsletter: {
    eyebrow: "STAY CONNECTED WITH WWW.ZIMALCOLLECTION.COM",
    title: "SUBSCRIBE TO OUR NEWSLETTER",
    description: "Subscribe to be the first to receive updates on new seasonal collections, limited pret drops, and exclusive seasonal promotions.",
    placeholder: "Enter your email address",
    buttonText: "SUBSCRIBE",
    successMessage: "Thank you for subscribing to Zimal Collection updates! Check your inbox for your welcome voucher."
  },
  customerCare: {
    title: "CUSTOMER CARE",
    links: [
      { label: "Contact Us", url: "#customer-care" },
      { label: "Shipping & Handling", url: "/category/new-in" },
      { label: "Exchange & Returns Policy", url: "/category/women" },
      { label: "Frequently Asked Questions", url: "#customer-care" },
      { label: "Track Your Order", url: "#track-order" },
      { label: "Store Locator", url: "#store-locator" }
    ]
  },
  information: {
    title: "INFORMATION",
    links: [
      { label: "About Zimal Collection", url: "/category/women" },
      { label: "Our Craft & Heritage", url: "/category/unstitched" },
      { label: "Careers & Job Openings", url: "#careers" },
      { label: "Privacy Policy", url: "#privacy" },
      { label: "Terms & Conditions", url: "#terms" },
      { label: "Fabric Care Instructions", url: "#fabric-care" }
    ]
  },
  contact: {
    title: "CONTACT US",
    uan: "+92 345 7867016",
    timings: "Monday - Saturday: 9:00 AM - 6:00 PM",
    whatsapp: "+92 345 7867016",
    email: "online@zimalcollection.com",
    address: "Zimal Collection Flagship Store, Pakistan"
  },
  connect: {
    title: "CONNECT & PAYMENTS",
    description: "Follow our official social accounts for style inspirations and daily looks:",
    socialLinks: {
      instagram: "https://instagram.com/zimalcollection",
      facebook: "https://facebook.com/zimalcollection",
      youtube: "https://youtube.com/@zimalcollection"
    },
    paymentMethods: [
      "VISA",
      "Mastercard",
      "PayPak",
      "UnionPay",
      "COD (Cash on Delivery)"
    ]
  },
  bottomBar: {
    copyright: "© 2026 www.zimalcollection.com. All rights reserved. Registered Trademark.",
    links: [
      { label: "Privacy Policy", url: "#privacy" },
      { label: "Terms of Service", url: "#terms" },
      { label: "Sitemap", url: "#sitemap" }
    ]
  }
};

export default function AdminFooter() {
  const [activeTab, setActiveTab] = useState('newsletter'); // 'newsletter' | 'contact' | 'links'
  const [footer, setFooter] = useState(DEFAULT_FOOTER_CONFIG);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Subscribers search & modal
  const [searchQuery, setSearchQuery] = useState('');
  const [addSubscriberModal, setAddSubscriberModal] = useState(false);
  const [newSubEmail, setNewSubEmail] = useState('');

  // Payment tag input
  const [newPaymentTag, setNewPaymentTag] = useState('');

  // Link Add/Edit state
  const [linkModal, setLinkModal] = useState(null); // { column: 'customerCare' | 'information', index: number | null, label: '', url: '' }

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [footerRes, subsRes] = await Promise.all([
        fetch('/api/footer'),
        fetch('/api/newsletter/subscribers')
      ]);

      if (footerRes.ok) {
        const footerData = await footerRes.json();
        setFooter(prev => ({ ...prev, ...footerData }));
      }
      if (subsRes.ok) {
        const subsData = await subsRes.json();
        setSubscribers(subsData);
      }
    } catch (err) {
      console.warn('Error loading footer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Footer
  const handleSaveFooter = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footer)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save footer');

      localStorage.setItem('limelight_footer', JSON.stringify(footer));
      window.dispatchEvent(new CustomEvent('limelight_footer_change', { detail: footer }));

      showFeedback('success', 'Footer & Newsletter changes saved live to database!');
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset Footer to Default
  const handleResetFooter = async () => {
    if (!window.confirm('Reset all footer & newsletter content to original defaults?')) return;
    try {
      setSaving(true);
      const res = await fetch('/api/footer/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset footer');

      setFooter(data.footer || DEFAULT_FOOTER_CONFIG);
      localStorage.setItem('limelight_footer', JSON.stringify(data.footer));
      window.dispatchEvent(new CustomEvent('limelight_footer_change', { detail: data.footer }));

      showFeedback('success', 'Footer restored to default layout.');
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Manual Add Subscriber
  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newSubEmail || !newSubEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const res = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newSubEmail, source: 'Admin Manual Entry' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add subscriber');

      setSubscribers(prev => [data.subscriber, ...prev]);
      setAddSubscriberModal(false);
      setNewSubEmail('');
      showFeedback('success', `Added ${newSubEmail} to subscriber list!`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Subscriber
  const handleDeleteSubscriber = async (sub) => {
    if (!window.confirm(`Remove subscriber "${sub.email}" from mailing list?`)) return;

    try {
      const res = await fetch(`/api/newsletter/subscribers/${sub.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubscribers(prev => prev.filter(s => s.id !== sub.id));
        showFeedback('success', `Removed ${sub.email}`);
      }
    } catch (err) {
      showFeedback('error', 'Failed to delete subscriber');
    }
  };

  // Export Subscribers to CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export.');
      return;
    }
    const header = 'ID,Email,Status,Source,SubscribedAt\n';
    const rows = subscribers.map(s => `"${s.id}","${s.email}","${s.status || 'active'}","${s.source || ''}","${s.subscribedAt || ''}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `limelight-newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Payment Methods Tag Handlers
  const handleAddPaymentTag = () => {
    const tag = newPaymentTag.trim();
    if (!tag) return;
    const current = footer.connect?.paymentMethods || [];
    if (!current.includes(tag)) {
      setFooter(prev => ({
        ...prev,
        connect: {
          ...prev.connect,
          paymentMethods: [...current, tag]
        }
      }));
    }
    setNewPaymentTag('');
  };

  const handleRemovePaymentTag = (tagToRemove) => {
    setFooter(prev => ({
      ...prev,
      connect: {
        ...prev.connect,
        paymentMethods: (prev.connect?.paymentMethods || []).filter(t => t !== tagToRemove)
      }
    }));
  };

  // Link Management
  const handleSaveLink = (e) => {
    e.preventDefault();
    if (!linkModal || !linkModal.label.trim()) return;

    const { column, index, label, url } = linkModal;
    const currentLinks = [...(footer[column]?.links || [])];

    if (index !== null && index >= 0) {
      currentLinks[index] = { label, url };
    } else {
      currentLinks.push({ label, url });
    }

    setFooter(prev => ({
      ...prev,
      [column]: {
        ...prev[column],
        links: currentLinks
      }
    }));

    setLinkModal(null);
  };

  const handleDeleteLink = (column, idx) => {
    const currentLinks = [...(footer[column]?.links || [])];
    currentLinks.splice(idx, 1);
    setFooter(prev => ({
      ...prev,
      [column]: {
        ...prev[column],
        links: currentLinks
      }
    }));
  };

  const filteredSubscribers = subscribers.filter(s =>
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-[25px] font-assistant">
      {/* Top Header */}
      <div className="bg-white p-[25px] rounded-[8px] border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-[20px]">
        <div>
          <div className="flex items-center gap-[8px] text-[12px] font-bold text-[#23ac95] uppercase tracking-wider mb-[4px]">
            <Mail size={15} />
            <span>Storefront Customer Care & Newsletter Manager</span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#121212] tracking-tight">
            Footer Content & Newsletter Center
          </h1>
          <p className="text-[13px] text-gray-500 mt-[2px]">
            Customize newsletter banner copy, manage subscriber list (CRUD), edit official support hotlines, social links, and footer navigation columns.
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            onClick={handleResetFooter}
            disabled={saving}
            className="px-[12px] py-[9px] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-[4px] text-[13px] font-semibold flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Reset Default</span>
          </button>

          <button
            onClick={handleSaveFooter}
            disabled={saving}
            className="px-[18px] py-[9px] bg-[#121212] hover:bg-black text-white rounded-[4px] text-[13px] font-semibold flex items-center gap-[6px] shadow-sm transition-colors cursor-pointer"
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Footer Changes'}</span>
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-[20px] rounded-t-[8px] gap-[8px]">
        <button
          onClick={() => setActiveTab('newsletter')}
          className={`py-[14px] px-[16px] text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-[8px] ${
            activeTab === 'newsletter'
              ? 'border-[#121212] text-[#121212]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Mail size={16} />
          <span>Newsletter & Subscribers ({subscribers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`py-[14px] px-[16px] text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-[8px] ${
            activeTab === 'contact'
              ? 'border-[#121212] text-[#121212]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Phone size={16} />
          <span>Contact Hotline & Socials</span>
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`py-[14px] px-[16px] text-[13px] font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer flex items-center gap-[8px] ${
            activeTab === 'links'
              ? 'border-[#121212] text-[#121212]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers size={16} />
          <span>Customer Care & Info Columns</span>
        </button>
      </div>

      {/* ================= TAB 1: NEWSLETTER & SUBSCRIBERS ================= */}
      {activeTab === 'newsletter' && (
        <div className="space-y-[25px]">
          {/* Top: Newsletter Banner Copy Customizer */}
          <div className="bg-white p-[25px] rounded-[8px] border border-gray-200 shadow-sm space-y-[20px]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-[12px]">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900">
                  Newsletter Banner Content (Above Footer)
                </h3>
                <p className="text-[12px] text-gray-500 mt-[2px]">
                  Customize the headline, subtitle, placeholder and success voucher message shown to customers.
                </p>
              </div>
              <button
                onClick={handleSaveFooter}
                disabled={saving}
                className="px-[14px] py-[7px] bg-[#121212] hover:bg-black text-white text-[12px] font-bold rounded flex items-center gap-[5px] cursor-pointer"
              >
                <Save size={13} />
                <span>Save Banner Copy</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-[4px]">
                  Eyebrow Text (Small Top)
                </label>
                <input
                  type="text"
                  value={footer.newsletter?.eyebrow || ''}
                  onChange={(e) => setFooter(prev => ({
                    ...prev,
                    newsletter: { ...prev.newsletter, eyebrow: e.target.value }
                  }))}
                  placeholder="STAY CONNECTED WITH LIMELIGHT"
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-[4px]">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={footer.newsletter?.title || ''}
                  onChange={(e) => setFooter(prev => ({
                    ...prev,
                    newsletter: { ...prev.newsletter, title: e.target.value }
                  }))}
                  placeholder="SUBSCRIBE TO OUR NEWSLETTER"
                  className="w-full px-[12px] py-[9px] text-[13px] font-bold border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-[4px]">
                  Description / Pitch
                </label>
                <textarea
                  rows={2}
                  value={footer.newsletter?.description || ''}
                  onChange={(e) => setFooter(prev => ({
                    ...prev,
                    newsletter: { ...prev.newsletter, description: e.target.value }
                  }))}
                  placeholder="Subscribe to be the first to receive updates on new seasonal collections..."
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-[4px]">
                  Input Placeholder
                </label>
                <input
                  type="text"
                  value={footer.newsletter?.placeholder || ''}
                  onChange={(e) => setFooter(prev => ({
                    ...prev,
                    newsletter: { ...prev.newsletter, placeholder: e.target.value }
                  }))}
                  placeholder="Enter your email address"
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-[4px]">
                  Button Text
                </label>
                <input
                  type="text"
                  value={footer.newsletter?.buttonText || ''}
                  onChange={(e) => setFooter(prev => ({
                    ...prev,
                    newsletter: { ...prev.newsletter, buttonText: e.target.value }
                  }))}
                  placeholder="SUBSCRIBE"
                  className="w-full px-[12px] py-[9px] text-[13px] font-bold border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-[4px]">
                  Success Thank You Message
                </label>
                <input
                  type="text"
                  value={footer.newsletter?.successMessage || ''}
                  onChange={(e) => setFooter(prev => ({
                    ...prev,
                    newsletter: { ...prev.newsletter, successMessage: e.target.value }
                  }))}
                  placeholder="Thank you for subscribing to Limelight updates! Check your inbox for your welcome voucher."
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>
            </div>
          </div>

          {/* Bottom: Subscribers List (CRUD Table) */}
          <div className="bg-white rounded-[8px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-[18px] bg-[#f8f9fa] border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-[12px]">
              <div>
                <div className="flex items-center gap-[8px]">
                  <h3 className="text-[16px] font-bold text-gray-900">
                    Newsletter Subscribers
                  </h3>
                  <span className="bg-[#121212] text-white text-[11px] font-bold px-[8px] py-[2px] rounded-full">
                    {subscribers.length} Emails
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-[1px]">
                  Customers who subscribed via the footer newsletter box on the live website.
                </p>
              </div>

              <div className="flex items-center gap-[8px]">
                {/* Search box */}
                <div className="relative">
                  <Search size={14} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search subscribers..."
                    className="pl-[30px] pr-[12px] py-[6px] text-[12px] border border-gray-300 rounded focus:outline-none focus:border-black bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-[10px] py-[7px] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[12px] font-bold rounded flex items-center gap-[4px] cursor-pointer"
                  title="Export to CSV"
                >
                  <Download size={13} />
                  <span>Export</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddSubscriberModal(true)}
                  className="px-[12px] py-[7px] bg-[#23ac95] hover:bg-[#1f9883] text-white text-[12px] font-bold rounded flex items-center gap-[4px] cursor-pointer shadow-xs"
                >
                  <PlusCircle size={14} />
                  <span>+ Add Email</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50">
                    <th className="py-[12px] px-[16px]">#</th>
                    <th className="py-[12px] px-[16px]">Subscriber Email</th>
                    <th className="py-[12px] px-[16px]">Status</th>
                    <th className="py-[12px] px-[16px]">Acquisition Source</th>
                    <th className="py-[12px] px-[16px]">Subscribed Date</th>
                    <th className="py-[12px] px-[16px] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-[40px] text-center text-gray-400">
                        No subscribers found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((sub, idx) => (
                      <tr key={sub.id || sub.email} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-[12px] px-[16px] font-mono text-gray-400 font-bold">
                          #{idx + 1}
                        </td>
                        <td className="py-[12px] px-[16px] font-semibold text-[#121212]">
                          {sub.email}
                        </td>
                        <td className="py-[12px] px-[16px]">
                          <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-[5px] h-[5px] rounded-full bg-emerald-500" />
                            <span>{sub.status || 'Active'}</span>
                          </span>
                        </td>
                        <td className="py-[12px] px-[16px] text-gray-500 text-[12px]">
                          {sub.source || 'Storefront Footer'}
                        </td>
                        <td className="py-[12px] px-[16px] text-gray-400 text-[12px]">
                          {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString() : 'Recent'}
                        </td>
                        <td className="py-[12px] px-[16px] text-right">
                          <button
                            onClick={() => handleDeleteSubscriber(sub)}
                            className="p-[6px] text-red-600 hover:text-white hover:bg-red-600 bg-red-50 rounded transition-colors cursor-pointer"
                            title="Unsubscribe & Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CONTACT HOTLINE & SOCIALS ================= */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[25px]">
          {/* Left Form: Contact & Socials (7 cols) */}
          <div className="lg:col-span-7 bg-white p-[25px] rounded-[8px] border border-gray-200 shadow-sm space-y-[22px]">
            <div>
              <h3 className="text-[17px] font-bold text-gray-900">
                Official Helpline, WhatsApp & Social Links
              </h3>
              <p className="text-[12px] text-gray-500 mt-[2px]">
                These details are displayed in the Contact Us column of the customer storefront footer.
              </p>
            </div>

            <div className="space-y-[14px]">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-700 mb-[4px] flex items-center gap-[6px]">
                  <Phone size={13} className="text-[#121212]" />
                  <span>UAN Helpline Phone</span>
                </label>
                <input
                  type="text"
                  value={footer.contact?.uan || ''}
                  onChange={(e) => setFooter(prev => ({
                    ...prev,
                    contact: { ...prev.contact, uan: e.target.value }
                  }))}
                  placeholder="+92 345 7867016"
                  className="w-full px-[12px] py-[9px] text-[13px] font-bold border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-700 mb-[4px]">
                  Working Hours / Timings
                </label>
                <input
                  type="text"
                  value={footer.contact?.timings || ''}
                  onChange={(e) => setFooter(prev => ({
                    ...prev,
                    contact: { ...prev.contact, timings: e.target.value }
                  }))}
                  placeholder="Monday - Saturday: 9:00 AM - 6:00 PM"
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-700 mb-[4px] flex items-center gap-[6px]">
                  <Phone size={13} className="text-[#25D366]" />
                  <span>WhatsApp Support Hotline</span>
                </label>
                <input
                  type="text"
                  value={footer.contact?.whatsapp || ''}
                  onChange={(e) => setFooter(prev => ({
                    ...prev,
                    contact: { ...prev.contact, whatsapp: e.target.value }
                  }))}
                  placeholder="+92 345 7867016"
                  className="w-full px-[12px] py-[9px] text-[13px] font-bold border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-700 mb-[4px] flex items-center gap-[6px]">
                  <Mail size={13} className="text-[#121212]" />
                  <span>Customer Support Email</span>
                </label>
                <input
                  type="email"
                  value={footer.contact?.email || ''}
                  onChange={(e) => setFooter(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                  placeholder="online@limelight.pk"
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-700 mb-[4px] flex items-center gap-[6px]">
                  <MapPin size={13} className="text-[#121212]" />
                  <span>Head Office Address</span>
                </label>
                <input
                  type="text"
                  value={footer.contact?.address || ''}
                  onChange={(e) => setFooter(prev => ({
                    ...prev,
                    contact: { ...prev.contact, address: e.target.value }
                  }))}
                  placeholder="Limelight Head Office, Lahore, Pakistan"
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-[16px] border-t border-gray-200 space-y-[14px]">
              <span className="text-[12px] font-bold uppercase tracking-wider text-gray-800 block">
                Official Social Media Channels
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-[4px] flex items-center gap-[5px]">
                    <Instagram size={13} className="text-pink-600" />
                    <span>Instagram URL</span>
                  </label>
                  <input
                    type="text"
                    value={footer.connect?.socialLinks?.instagram || ''}
                    onChange={(e) => setFooter(prev => ({
                      ...prev,
                      connect: {
                        ...prev.connect,
                        socialLinks: { ...prev.connect?.socialLinks, instagram: e.target.value }
                      }
                    }))}
                    placeholder="https://instagram.com/..."
                    className="w-full px-[10px] py-[8px] text-[12px] border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-[4px] flex items-center gap-[5px]">
                    <Facebook size={13} className="text-blue-600" />
                    <span>Facebook URL</span>
                  </label>
                  <input
                    type="text"
                    value={footer.connect?.socialLinks?.facebook || ''}
                    onChange={(e) => setFooter(prev => ({
                      ...prev,
                      connect: {
                        ...prev.connect,
                        socialLinks: { ...prev.connect?.socialLinks, facebook: e.target.value }
                      }
                    }))}
                    placeholder="https://facebook.com/..."
                    className="w-full px-[10px] py-[8px] text-[12px] border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-[4px] flex items-center gap-[5px]">
                    <Youtube size={13} className="text-red-600" />
                    <span>YouTube URL</span>
                  </label>
                  <input
                    type="text"
                    value={footer.connect?.socialLinks?.youtube || ''}
                    onChange={(e) => setFooter(prev => ({
                      ...prev,
                      connect: {
                        ...prev.connect,
                        socialLinks: { ...prev.connect?.socialLinks, youtube: e.target.value }
                      }
                    }))}
                    placeholder="https://youtube.com/..."
                    className="w-full px-[10px] py-[8px] text-[12px] border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods Badges */}
            <div className="pt-[16px] border-t border-gray-200 space-y-[10px]">
              <span className="text-[12px] font-bold uppercase tracking-wider text-gray-800 block">
                Accepted Payment Methods Tags
              </span>
              <div className="flex flex-wrap gap-[6px]">
                {(footer.connect?.paymentMethods || []).map((method) => (
                  <span
                    key={method}
                    className="bg-gray-100 border border-gray-300 text-[#121212] text-[12px] font-semibold px-[10px] py-[4px] rounded flex items-center gap-[6px]"
                  >
                    <span>{method}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePaymentTag(method)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-[8px] max-w-sm pt-[4px]">
                <input
                  type="text"
                  value={newPaymentTag}
                  onChange={(e) => setNewPaymentTag(e.target.value)}
                  placeholder="e.g. JazzCash, EasyPaisa, SadaPay"
                  className="flex-1 px-[10px] py-[6px] text-[12px] border border-gray-300 rounded"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPaymentTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddPaymentTag}
                  className="px-[12px] py-[6px] bg-[#121212] hover:bg-black text-white text-[12px] font-bold rounded"
                >
                  + Add Tag
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveFooter}
              disabled={saving}
              className="button-primary w-full bg-[#121212] hover:bg-black text-white py-[11px] text-[13px] font-bold rounded flex items-center justify-center gap-[6px] cursor-pointer shadow-sm"
            >
              <Save size={15} />
              <span>{saving ? 'SAVING CHANGES...' : 'SAVE CONTACT & SOCIALS'}</span>
            </button>
          </div>

          {/* Right Live Preview: Mockup of Contact Column */}
          <div className="lg:col-span-5 space-y-[15px]">
            <div className="bg-[#f3f3f3] p-[20px] rounded-[8px] border border-gray-200 shadow-sm space-y-[15px]">
              <div className="flex items-center justify-between pb-[10px] border-b border-gray-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-[5px]">
                  <Eye size={13} className="text-[#23ac95]" />
                  <span>Storefront Contact Column Preview</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-[6px] py-[1px] rounded">
                  Live Sync
                </span>
              </div>

              {/* Column 3 Mock */}
              <div>
                <h4 className="text-[14px] font-bold text-[#121212] tracking-[0.1em] uppercase mb-[12px]">
                  {footer.contact?.title || 'CONTACT US'}
                </h4>
                <div className="space-y-[12px] text-[13px] text-[#121212bf]">
                  <div className="flex items-start gap-[10px]">
                    <Phone size={16} className="text-[#121212] mt-[3px] shrink-0" />
                    <div>
                      <p className="font-semibold text-[#121212]">UAN: {footer.contact?.uan}</p>
                      <p className="text-[12px] text-gray-500">{footer.contact?.timings}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-[10px]">
                    <div className="w-[18px] h-[18px] bg-[#25D366] rounded-full flex items-center justify-center text-white font-bold text-[10px]">
                      W
                    </div>
                    <span className="font-semibold text-[#121212]">
                      WhatsApp: {footer.contact?.whatsapp}
                    </span>
                  </div>

                  <div className="flex items-start gap-[10px]">
                    <Mail size={16} className="text-[#121212] mt-[3px] shrink-0" />
                    <span>{footer.contact?.email}</span>
                  </div>

                  <div className="flex items-start gap-[10px]">
                    <MapPin size={16} className="text-[#121212] mt-[3px] shrink-0" />
                    <p className="text-[12px]">{footer.contact?.address}</p>
                  </div>
                </div>
              </div>

              {/* Column 4 Mock */}
              <div className="pt-[14px] border-t border-gray-200">
                <h4 className="text-[13px] font-bold text-[#121212] tracking-[0.1em] uppercase mb-[10px]">
                  {footer.connect?.title || 'CONNECT & PAYMENTS'}
                </h4>
                <div className="flex items-center gap-[10px] mb-[12px]">
                  <span className="w-[32px] h-[32px] bg-white rounded-full flex items-center justify-center text-[#121212] shadow-xs">
                    <Instagram size={16} />
                  </span>
                  <span className="w-[32px] h-[32px] bg-white rounded-full flex items-center justify-center text-[#121212] shadow-xs">
                    <Facebook size={16} />
                  </span>
                  <span className="w-[32px] h-[32px] bg-white rounded-full flex items-center justify-center text-[#121212] shadow-xs">
                    <Youtube size={16} />
                  </span>
                </div>
                <div className="flex flex-wrap gap-[4px]">
                  {(footer.connect?.paymentMethods || []).map(method => (
                    <span key={method} className="bg-white border border-gray-200 text-[10px] font-semibold px-[6px] py-[2px] rounded">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CUSTOMER CARE & INFO COLUMNS ================= */}
      {activeTab === 'links' && (
        <div className="space-y-[25px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px]">
            {/* Column 1: Customer Care Links */}
            <div className="bg-white p-[20px] rounded-[8px] border border-gray-200 shadow-sm space-y-[14px]">
              <div className="flex items-center justify-between border-b border-gray-100 pb-[10px]">
                <div>
                  <h4 className="text-[15px] font-bold text-[#121212] uppercase tracking-wider">
                    {footer.customerCare?.title || 'CUSTOMER CARE'}
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    {(footer.customerCare?.links || []).length} Links
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkModal({ column: 'customerCare', index: null, label: '', url: '' })}
                  className="px-[10px] py-[5px] bg-[#121212] text-white text-[11px] font-bold rounded flex items-center gap-[4px] cursor-pointer"
                >
                  <PlusCircle size={13} />
                  <span>+ Add Link</span>
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {(footer.customerCare?.links || []).map((link, idx) => (
                  <div key={idx} className="py-[10px] flex items-center justify-between gap-[10px]">
                    <div>
                      <span className="text-[13px] font-semibold text-[#121212] block">
                        {link.label}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {link.url}
                      </span>
                    </div>
                    <div className="flex items-center gap-[4px]">
                      <button
                        type="button"
                        onClick={() => setLinkModal({ column: 'customerCare', index: idx, label: link.label, url: link.url })}
                        className="p-[5px] text-gray-500 hover:text-black hover:bg-gray-100 rounded"
                        title="Edit Link"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLink('customerCare', idx)}
                        className="p-[5px] text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete Link"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Information Links */}
            <div className="bg-white p-[20px] rounded-[8px] border border-gray-200 shadow-sm space-y-[14px]">
              <div className="flex items-center justify-between border-b border-gray-100 pb-[10px]">
                <div>
                  <h4 className="text-[15px] font-bold text-[#121212] uppercase tracking-wider">
                    {footer.information?.title || 'INFORMATION'}
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    {(footer.information?.links || []).length} Links
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkModal({ column: 'information', index: null, label: '', url: '' })}
                  className="px-[10px] py-[5px] bg-[#121212] text-white text-[11px] font-bold rounded flex items-center gap-[4px] cursor-pointer"
                >
                  <PlusCircle size={13} />
                  <span>+ Add Link</span>
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {(footer.information?.links || []).map((link, idx) => (
                  <div key={idx} className="py-[10px] flex items-center justify-between gap-[10px]">
                    <div>
                      <span className="text-[13px] font-semibold text-[#121212] block">
                        {link.label}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {link.url}
                      </span>
                    </div>
                    <div className="flex items-center gap-[4px]">
                      <button
                        type="button"
                        onClick={() => setLinkModal({ column: 'information', index: idx, label: link.label, url: link.url })}
                        className="p-[5px] text-gray-500 hover:text-black hover:bg-gray-100 rounded"
                        title="Edit Link"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLink('information', idx)}
                        className="p-[5px] text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete Link"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar Settings */}
          <div className="bg-white p-[20px] rounded-[8px] border border-gray-200 shadow-sm space-y-[14px]">
            <h4 className="text-[15px] font-bold text-[#121212]">
              Footer Copyright & Policy Notice Bar
            </h4>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-700 mb-[4px]">
                Copyright Line
              </label>
              <input
                type="text"
                value={footer.bottomBar?.copyright || ''}
                onChange={(e) => setFooter(prev => ({
                  ...prev,
                  bottomBar: { ...prev.bottomBar, copyright: e.target.value }
                }))}
                placeholder="© 2026 Limelightpk. All rights reserved. Registered Trademark."
                className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
              />
            </div>

            <div className="flex justify-end pt-[10px]">
              <button
                type="button"
                onClick={handleSaveFooter}
                disabled={saving}
                className="px-[16px] py-[8px] bg-[#121212] hover:bg-black text-white text-[12px] font-bold rounded flex items-center gap-[5px] cursor-pointer"
              >
                <Save size={14} />
                <span>Save Navigation Columns</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBSCRIBER */}
      {addSubscriberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[15px]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setAddSubscriberModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[8px] shadow-2xl p-[25px] z-10 animate-expand space-y-[15px]">
            <div className="flex justify-between items-center pb-[10px] border-b border-gray-200">
              <h3 className="text-[16px] font-bold text-gray-900">Add Newsletter Subscriber</h3>
              <button onClick={() => setAddSubscriberModal(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-[12px]">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-[4px]">Customer Email Address *</label>
                <input
                  type="email"
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  placeholder="customer@example.com"
                  required
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div className="flex justify-end gap-[8px] pt-[10px] border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setAddSubscriberModal(false)}
                  className="px-[14px] py-[8px] text-[12px] font-bold border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-[16px] py-[8px] text-[12px] font-bold bg-[#121212] text-white rounded hover:bg-black"
                >
                  Save Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT FOOTER LINK */}
      {linkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[15px]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setLinkModal(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[8px] shadow-2xl p-[25px] z-10 animate-expand space-y-[15px]">
            <div className="flex justify-between items-center pb-[10px] border-b border-gray-200">
              <h3 className="text-[16px] font-bold text-gray-900">
                {linkModal.index !== null ? 'Edit Footer Link' : 'Add New Footer Link'}
              </h3>
              <button onClick={() => setLinkModal(null)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-[12px]">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-[4px]">Link Label *</label>
                <input
                  type="text"
                  value={linkModal.label}
                  onChange={(e) => setLinkModal({ ...linkModal, label: e.target.value })}
                  placeholder="e.g. Shipping & Handling"
                  required
                  className="w-full px-[12px] py-[9px] text-[13px] border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-[4px]">Target URL / Path *</label>
                <input
                  type="text"
                  value={linkModal.url}
                  onChange={(e) => setLinkModal({ ...linkModal, url: e.target.value })}
                  placeholder="e.g. /category/women or #customer-care"
                  required
                  className="w-full px-[12px] py-[9px] text-[13px] font-mono border border-gray-300 rounded focus:outline-none focus:border-[#121212]"
                />
              </div>

              <div className="flex justify-end gap-[8px] pt-[10px] border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setLinkModal(null)}
                  className="px-[14px] py-[8px] text-[12px] font-bold border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-[16px] py-[8px] text-[12px] font-bold bg-[#121212] text-white rounded hover:bg-black"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

