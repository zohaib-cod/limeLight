import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled Storefront Rendering Error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('limelight_sections');
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-[20px] font-assistant text-[#121212]">
          <div className="max-w-[480px] w-full bg-white rounded-[12px] p-[32px] shadow-xl border border-gray-200 text-center">
            <div className="w-[52px] h-[52px] mx-auto mb-[16px] rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-[20px] font-bold uppercase tracking-wider mb-[8px]">
              Display Notice
            </h2>
            <p className="text-[14px] text-gray-600 mb-[22px] leading-relaxed">
              We encountered a temporary rendering issue. Please click below to refresh and load the latest store view.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-[8px] bg-[#121212] hover:bg-black text-white px-[24px] py-[12px] rounded-[4px] font-semibold text-[13px] tracking-wider uppercase transition-all shadow-md cursor-pointer active:scale-95"
            >
              <RefreshCw size={15} />
              <span>Reload Storefront</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
