import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Youtube, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../data/products';

const DEFAULT_FOOTER = {
  newsletter: {
    eyebrow: "STAY CONNECTED WITH LIMELIGHT",
    title: "SUBSCRIBE TO OUR NEWSLETTER",
    description: "Subscribe to be the first to receive updates on new seasonal collections, limited pret drops, and exclusive seasonal promotions.",
    placeholder: "Enter your email address",
    buttonText: "SUBSCRIBE",
    successMessage: "Thank you for subscribing to Limelight updates! Check your inbox for your welcome voucher."
  },
  customerCare: {
    title: "CUSTOMER CARE",
    links: [
      { label: "Contact Us", url: "#customer-care" },
      { label: "Shipping & Handling", url: "/category/new-in" },
      { label: "Exchange & Returns Policy", url: "/category/women" },
      { label: "Frequently Asked Questions", url: "#customer-care" },
      { label: "Track Your Order", url: "#track-order" },
      { label: "Store Locator (80+ Outlets)", url: "#store-locator" }
    ]
  },
  information: {
    title: "INFORMATION",
    links: [
      { label: "About Limelight Pakistan", url: "/category/women" },
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
    email: "online@limelight.pk",
    address: "Limelight Head Office, Lahore, Pakistan"
  },
  connect: {
    title: "CONNECT & PAYMENTS",
    description: "Follow our official social accounts for style inspirations and daily looks:",
    socialLinks: {
      instagram: "https://instagram.com/limelight.pk",
      facebook: "https://facebook.com/limelight.pk",
      youtube: "https://youtube.com/@limelightpk"
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
    copyright: "© 2026 Limelightpk. All rights reserved. Registered Trademark.",
    links: [
      { label: "Privacy Policy", url: "#privacy" },
      { label: "Terms of Service", url: "#terms" },
      { label: "Sitemap", url: "#sitemap" }
    ]
  }
};

export default function Footer() {
  const [footer, setFooter] = useState(() => {
    try {
      const saved = localStorage.getItem('limelight_footer');
      return saved ? { ...DEFAULT_FOOTER, ...JSON.parse(saved) } : DEFAULT_FOOTER;
    } catch {
      return DEFAULT_FOOTER;
    }
  });

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Load live footer configuration from backend
  useEffect(() => {
    fetch('/api/footer')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          setFooter(prev => ({ ...prev, ...data }));
          localStorage.setItem('limelight_footer', JSON.stringify(data));
        }
      })
      .catch(() => {});

    const handleFooterChange = (e) => {
      if (e.detail) {
        setFooter(prev => ({ ...prev, ...e.detail }));
      }
    };

    window.addEventListener('limelight_footer_change', handleFooterChange);
    return () => window.removeEventListener('limelight_footer_change', handleFooterChange);
  }, []);

  // Handle Newsletter Subscription
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, source: 'Storefront Footer' })
      });
      const data = await res.json();

      if (res.ok) {
        setFeedback({
          type: 'success',
          message: data.message || footer.newsletter?.successMessage || 'Thank you for subscribing to Limelight updates!'
        });
        setEmail('');
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to subscribe. Please try again.' });
      }
    } catch (err) {
      setFeedback({
        type: 'success',
        message: footer.newsletter?.successMessage || 'Thank you for subscribing to Limelight updates!'
      });
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  const cleanWaNumber = (footer.contact?.whatsapp || '923457867016').replace(/[^0-9]/g, '');

  return (
    <footer className="footer color-scheme-2 bg-[#f3f3f3] border-t border-[#1212121a] pt-[50px] pb-[30px]" id="customer-care">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        {/* Newsletter Section */}
        <div className="max-w-[742px] mx-auto text-center mb-[50px]">
          <h2 className="text-[13px] font-normal text-[#121212] tracking-[0.2em] uppercase mb-[8px]">
            {footer.newsletter?.eyebrow || 'STAY CONNECTED WITH LIMELIGHT'}
          </h2>
          <h3 className="text-[24px] font-bold text-[#121212] tracking-wide mb-[10px]">
            {footer.newsletter?.title || 'SUBSCRIBE TO OUR NEWSLETTER'}
          </h3>
          <p className="text-[16px] leading-[28.8px] text-[#121212bf] mb-[25px]">
            {footer.newsletter?.description || 'Subscribe to be the first to receive updates on new seasonal collections, limited pret drops, and exclusive seasonal promotions.'}
          </p>

          {feedback ? (
            <div className={`p-[15px] rounded-[5px] text-[15px] font-medium flex items-center justify-center gap-[8px] animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-white border border-[#121212] text-[#121212]'
                : 'bg-rose-50 border border-rose-300 text-rose-800'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 size={18} className="text-[#23ac95] shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-[10px] items-stretch justify-center max-w-[550px] mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={footer.newsletter?.placeholder || 'Enter your email address'}
                required
                disabled={submitting}
                className="input flex-1 bg-white text-[#121212] text-[16px] tracking-[0.4px] rounded-[5px] border border-gray-300 focus:border-[#121212]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="button-primary bg-[#121212] text-white hover:bg-black transition-colors h-[50px] px-[30px] text-[15px] tracking-[1px] uppercase font-medium rounded-none flex items-center justify-center gap-[8px] cursor-pointer disabled:opacity-50"
              >
                <span>{submitting ? 'SUBSCRIBING...' : (footer.newsletter?.buttonText || 'SUBSCRIBE')}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px] pt-[30px] border-t border-[rgba(18,18,18,0.1)]">
          {/* Column 1: Customer Care */}
          <div>
            <h4 className="text-[14px] font-bold text-[#121212] tracking-[0.1em] uppercase mb-[15px]">
              {footer.customerCare?.title || 'CUSTOMER CARE'}
            </h4>
            <ul className="space-y-[10px] text-[14px] text-[#121212bf]">
              {(footer.customerCare?.links || []).map((link, idx) => (
                <li key={idx}>
                  {link.url?.startsWith('/') ? (
                    <Link to={link.url} className="hover:text-[#121212] transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.url || '#'} className="hover:text-[#121212] transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Information */}
          <div>
            <h4 className="text-[14px] font-bold text-[#121212] tracking-[0.1em] uppercase mb-[15px]">
              {footer.information?.title || 'INFORMATION'}
            </h4>
            <ul className="space-y-[10px] text-[14px] text-[#121212bf]">
              {(footer.information?.links || []).map((link, idx) => (
                <li key={idx}>
                  {link.url?.startsWith('/') ? (
                    <Link to={link.url} className="hover:text-[#121212] transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.url || '#'} className="hover:text-[#121212] transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div>
            <h4 className="text-[14px] font-bold text-[#121212] tracking-[0.1em] uppercase mb-[15px]">
              {footer.contact?.title || 'CONTACT US'}
            </h4>
            <div className="space-y-[12px] text-[14px] text-[#121212bf]">
              <div className="flex items-start gap-[10px]">
                <Phone size={17} className="text-[#121212] mt-[3px] shrink-0" />
                <div>
                  <p className="font-semibold text-[#121212]">UAN: {footer.contact?.uan || '+92 345 7867016'}</p>
                  <p className="text-[12px]">{footer.contact?.timings || 'Monday - Saturday: 9:00 AM - 6:00 PM'}</p>
                </div>
              </div>

              <div className="flex items-center gap-[10px]">
                <img src={ASSETS.whatsappIcon} alt="WhatsApp" className="w-[17px] h-[17px] shrink-0" />
                <a
                  href={`https://wa.me/${cleanWaNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#121212] font-semibold text-[#121212]"
                >
                  WhatsApp: {footer.contact?.whatsapp || '+92 345 7867016'}
                </a>
              </div>

              <div className="flex items-start gap-[10px]">
                <Mail size={17} className="text-[#121212] mt-[3px] shrink-0" />
                <a href={`mailto:${footer.contact?.email || 'online@limelight.pk'}`} className="hover:text-[#121212]">
                  {footer.contact?.email || 'online@limelight.pk'}
                </a>
              </div>

              <div className="flex items-start gap-[10px]">
                <MapPin size={17} className="text-[#121212] mt-[3px] shrink-0" />
                <p className="text-[13px]">
                  {footer.contact?.address || 'Limelight Head Office, Lahore, Pakistan'}
                </p>
              </div>
            </div>
          </div>

          {/* Column 4: Connect & Payment Imagery */}
          <div>
            <h4 className="text-[14px] font-bold text-[#121212] tracking-[0.1em] uppercase mb-[15px]">
              {footer.connect?.title || 'CONNECT & PAYMENTS'}
            </h4>
            <p className="text-[13px] text-[#121212bf] mb-[15px]">
              {footer.connect?.description || 'Follow our official social accounts for style inspirations and daily looks:'}
            </p>
            <div className="flex items-center gap-[12px] mb-[20px]">
              <a
                href={footer.connect?.socialLinks?.instagram || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[36px] h-[36px] bg-white rounded-full flex items-center justify-center text-[#121212] shadow-sm hover:bg-[#121212] hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href={footer.connect?.socialLinks?.facebook || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[36px] h-[36px] bg-white rounded-full flex items-center justify-center text-[#121212] shadow-sm hover:bg-[#121212] hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href={footer.connect?.socialLinks?.youtube || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[36px] h-[36px] bg-white rounded-full flex items-center justify-center text-[#121212] shadow-sm hover:bg-[#121212] hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>

            {/* Payment security badges */}
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#121212] block mb-[8px]">
                ACCEPTED PAYMENT METHODS
              </span>
              <div className="flex flex-wrap gap-[6px]">
                {(footer.connect?.paymentMethods || ['VISA', 'Mastercard', 'PayPak', 'UnionPay', 'COD (Cash on Delivery)']).map((method) => (
                  <span
                    key={method}
                    className="bg-white border border-gray-200 text-[#121212] text-[11px] font-medium px-[8px] py-[3px] rounded-[3px] shadow-sm"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-[40px] pt-[20px] border-t border-[rgba(18,18,18,0.08)] flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#121212bf] gap-[10px]" style={{ backgroundColor: 'var(--payment-terms-background-color)' }}>
          <p className="px-[10px]">
            {footer.bottomBar?.copyright || `© ${new Date().getFullYear()} Limelightpk. All rights reserved. Registered Trademark.`}
          </p>
          <div className="flex items-center gap-[15px] px-[10px]">
            {(footer.bottomBar?.links || [
              { label: 'Privacy Policy', url: '#privacy' },
              { label: 'Terms of Service', url: '#terms' },
              { label: 'Sitemap', url: '#sitemap' }
            ]).map((l, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>•</span>}
                <a href={l.url || '#'} className="hover:text-[#121212] transition-colors">
                  {l.label}
                </a>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
