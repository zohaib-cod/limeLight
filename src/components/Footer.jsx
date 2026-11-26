import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook, Youtube, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const WhatsAppIcon = ({ className = "w-[17px] h-[17px]" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.414z"/>
  </svg>
);

export default function Footer() {
  const [footer, setFooter] = useState(() => {
    try {
      const saved = localStorage.getItem('limelight_footer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetch('/api/footer')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && typeof data === 'object') {
          setFooter(data);
          try {
            localStorage.setItem('limelight_footer', JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(() => {});

    const handleFooterChange = (e) => {
      if (e.detail) {
        setFooter(prev => ({ ...(prev || {}), ...e.detail }));
      }
    };

    window.addEventListener('limelight_footer_change', handleFooterChange);
    return () => window.removeEventListener('limelight_footer_change', handleFooterChange);
  }, []);

  if (!footer) return null;

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
          message: data.message || footer.newsletter?.successMessage || 'Subscribed successfully!'
        });
        setEmail('');
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to subscribe. Please try again.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const cleanWaNumber = (footer.contact?.whatsapp || '').replace(/[^0-9]/g, '');

  return (
    <footer className="footer color-scheme-2 bg-[#f3f3f3] dark:bg-[#0d0d0d] border-t border-[#1212121a] dark:border-white/10 pt-[45px] sm:pt-[50px] pb-[30px] transition-colors duration-200" id="customer-care">
      <div className="max-w-[1600px] mx-auto px-[15px] sm:px-[30px]">
        {/* Newsletter Section */}
        <div className="max-w-[742px] mx-auto text-center mb-[40px] sm:mb-[50px]">
          {footer.newsletter?.eyebrow && (
            <h2 className="text-[12px] sm:text-[13px] font-normal text-[#121212] dark:text-gray-300 tracking-[0.2em] uppercase mb-[8px]">
              {footer.newsletter.eyebrow}
            </h2>
          )}
          {footer.newsletter?.title && (
            <h3 className="text-[20px] sm:text-[24px] font-bold text-[#121212] dark:text-white tracking-wide mb-[10px]">
              {footer.newsletter.title}
            </h3>
          )}
          {footer.newsletter?.description && (
            <p className="text-[13px] sm:text-[15px] leading-[20px] sm:leading-[26px] text-[#121212bf] dark:text-gray-400 mb-[22px] sm:mb-[25px]">
              {footer.newsletter.description}
            </p>
          )}

          {feedback ? (
            <div className={`p-[14px] rounded-[5px] text-[14px] font-medium flex items-center justify-center gap-[8px] animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-white dark:bg-[#1a1a1a] border border-[#121212] dark:border-emerald-500 text-[#121212] dark:text-white'
                : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 size={18} className="text-[#23ac95] shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-[8px] sm:gap-[10px] items-stretch justify-center max-w-[550px] mx-auto px-[4px] sm:px-[10px]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={footer.newsletter?.placeholder || 'Enter your email address'}
                required
                disabled={submitting}
                className="w-full sm:flex-1 bg-white dark:bg-[#1a1a1a] text-[#121212] dark:text-white text-[13.5px] sm:text-[15px] px-[14px] sm:px-[16px] py-[10px] sm:py-[12px] rounded-[3px] border border-gray-300 dark:border-white/20 focus:border-[#121212] dark:focus:border-white outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="button-primary bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200 transition-colors h-[42px] sm:h-[50px] px-[20px] sm:px-[30px] text-[13px] sm:text-[15px] tracking-[1px] uppercase font-medium rounded-none flex items-center justify-center gap-[6px] sm:gap-[8px] cursor-pointer disabled:opacity-50 shrink-0"
              >
                <span>{submitting ? 'SUBSCRIBING...' : (footer.newsletter?.buttonText || 'SUBSCRIBE')}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[25px] sm:gap-[30px] pt-[30px] border-t border-[rgba(18,18,18,0.1)] dark:border-white/10">
          {/* Column 1: Customer Care */}
          <div>
            {footer.customerCare?.title && (
              <h4 className="text-[13px] sm:text-[14px] font-bold text-[#121212] dark:text-white tracking-[0.1em] uppercase mb-[12px] sm:mb-[15px]">
                {footer.customerCare.title}
              </h4>
            )}
            <ul className="space-y-[8px] sm:space-y-[10px] text-[13px] sm:text-[14px] text-[#121212bf] dark:text-gray-400">
              {(footer.customerCare?.links || []).map((link, idx) => (
                <li key={idx}>
                  {link.url?.startsWith('/') ? (
                    <Link to={link.url} className="hover:text-[#121212] dark:hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.url || '#'} className="hover:text-[#121212] dark:hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Information */}
          <div>
            {footer.information?.title && (
              <h4 className="text-[13px] sm:text-[14px] font-bold text-[#121212] dark:text-white tracking-[0.1em] uppercase mb-[12px] sm:mb-[15px]">
                {footer.information.title}
              </h4>
            )}
            <ul className="space-y-[8px] sm:space-y-[10px] text-[13px] sm:text-[14px] text-[#121212bf] dark:text-gray-400">
              {(footer.information?.links || []).map((link, idx) => (
                <li key={idx}>
                  {link.url?.startsWith('/') ? (
                    <Link to={link.url} className="hover:text-[#121212] dark:hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.url || '#'} className="hover:text-[#121212] dark:hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div>
            {footer.contact?.title && (
              <h4 className="text-[13px] sm:text-[14px] font-bold text-[#121212] dark:text-white tracking-[0.1em] uppercase mb-[12px] sm:mb-[15px]">
                {footer.contact.title}
              </h4>
            )}
            <div className="space-y-[10px] sm:space-y-[12px] text-[13px] sm:text-[14px] text-[#121212bf] dark:text-gray-400">
              {(footer.contact?.uan || footer.contact?.timings) && (
                <div className="flex items-start gap-[10px]">
                  <Phone size={17} className="text-[#121212] dark:text-white mt-[3px] shrink-0" />
                  <div>
                    {footer.contact?.uan && <p className="font-semibold text-[#121212] dark:text-white">UAN: {footer.contact.uan}</p>}
                    {footer.contact?.timings && <p className="text-[11.5px] sm:text-[12px]">{footer.contact.timings}</p>}
                  </div>
                </div>
              )}

              {footer.contact?.whatsapp && (
                <div className="flex items-center gap-[10px]">
                  <div className="w-[20px] h-[20px] bg-[#25D366] text-white rounded-full flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="w-[12px] h-[12px] fill-white" />
                  </div>
                  <a
                    href={`https://wa.me/${cleanWaNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#121212] dark:hover:text-white font-semibold text-[#121212] dark:text-white"
                  >
                    WhatsApp: {footer.contact.whatsapp}
                  </a>
                </div>
              )}

              {footer.contact?.email && (
                <div className="flex items-start gap-[10px]">
                  <Mail size={17} className="text-[#121212] dark:text-white mt-[3px] shrink-0" />
                  <a href={`mailto:${footer.contact.email}`} className="hover:text-[#121212] dark:hover:text-white">
                    {footer.contact.email}
                  </a>
                </div>
              )}

              {footer.contact?.address && (
                <div className="flex items-start gap-[10px]">
                  <MapPin size={17} className="text-[#121212] dark:text-white mt-[3px] shrink-0" />
                  <p className="text-[12.5px] sm:text-[13px]">
                    {footer.contact.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Connect & Payment Imagery */}
          <div>
            {footer.connect?.title && (
              <h4 className="text-[13px] sm:text-[14px] font-bold text-[#121212] dark:text-white tracking-[0.1em] uppercase mb-[12px] sm:mb-[15px]">
                {footer.connect.title}
              </h4>
            )}
            {footer.connect?.description && (
              <p className="text-[12.5px] sm:text-[13px] text-[#121212bf] dark:text-gray-400 mb-[14px] sm:mb-[15px]">
                {footer.connect.description}
              </p>
            )}
            <div className="flex items-center gap-[10px] sm:gap-[12px] mb-[18px] sm:mb-[20px]">
              {footer.connect?.socialLinks?.instagram && (
                <a
                  href={footer.connect.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[34px] sm:w-[36px] h-[34px] sm:h-[36px] bg-white dark:bg-[#1f1f1f] rounded-full flex items-center justify-center text-[#121212] dark:text-white shadow-sm hover:bg-[#121212] dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={17} />
                </a>
              )}
              {footer.connect?.socialLinks?.facebook && (
                <a
                  href={footer.connect.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[34px] sm:w-[36px] h-[34px] sm:h-[36px] bg-white dark:bg-[#1f1f1f] rounded-full flex items-center justify-center text-[#121212] dark:text-white shadow-sm hover:bg-[#121212] dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={17} />
                </a>
              )}
              {footer.connect?.socialLinks?.youtube && (
                <a
                  href={footer.connect.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[34px] sm:w-[36px] h-[34px] sm:h-[36px] bg-white dark:bg-[#1f1f1f] rounded-full flex items-center justify-center text-[#121212] dark:text-white shadow-sm hover:bg-[#121212] dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube size={17} />
                </a>
              )}
            </div>

            {/* Payment security badges */}
            {Array.isArray(footer.connect?.paymentMethods) && footer.connect.paymentMethods.length > 0 && (
              <div>
                <span className="text-[10.5px] sm:text-[11px] font-bold tracking-widest uppercase text-[#121212] dark:text-white block mb-[6px] sm:mb-[8px]">
                  ACCEPTED PAYMENT METHODS
                </span>
                <div className="flex flex-wrap gap-[5px] sm:gap-[6px]">
                  {footer.connect.paymentMethods.map((method) => (
                    <span
                      key={method}
                      className="bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-white/10 text-[#121212] dark:text-gray-200 text-[10.5px] sm:text-[11px] font-medium px-[7px] sm:px-[8px] py-[2px] sm:py-[3px] rounded-[3px] shadow-sm"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-[35px] sm:mt-[40px] pt-[18px] sm:pt-[20px] border-t border-[rgba(18,18,18,0.08)] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-[12px] text-[#121212bf] dark:text-gray-400 gap-[10px]">
          {footer.bottomBar?.copyright && (
            <p className="px-[6px] text-center sm:text-left">
              {footer.bottomBar.copyright}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-[10px] sm:gap-[15px] px-[6px]">
            {(footer.bottomBar?.links || []).map((l, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="opacity-40">•</span>}
                <a href={l.url || '#'} className="hover:text-[#121212] dark:hover:text-white transition-colors">
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
