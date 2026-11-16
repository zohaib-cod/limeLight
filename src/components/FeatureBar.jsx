import React, { useState, useEffect } from 'react';

const DEFAULT_FEATURES = [
  {
    id: "feat-1",
    title: "FREE NATIONWIDE SHIPPING",
    subtitle: "On orders above Rs. 2,490",
    order: 1,
    isActive: true
  },
  {
    id: "feat-2",
    title: "100% GENUINE FABRIC",
    subtitle: "Pure Cottons, Velvets & Karandi",
    order: 2,
    isActive: true
  },
  {
    id: "feat-3",
    title: "CASH ON DELIVERY",
    subtitle: "Available all across Pakistan",
    order: 3,
    isActive: true
  },
  {
    id: "feat-4",
    title: "EASY EXCHANGE",
    subtitle: "30-Day Hassle Free Returns",
    order: 4,
    isActive: true
  }
];

export default function FeatureBar() {
  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  const fetchFeatures = async () => {
    try {
      const res = await fetch('/api/features');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const activeOnly = data.filter(f => f.isActive !== false);
          if (activeOnly.length > 0) {
            setFeatures(activeOnly);
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch features from API, using defaults:', err);
    }
  };

  useEffect(() => {
    fetchFeatures();
    const interval = setInterval(fetchFeatures, 15000); // sync with backend updates
    return () => clearInterval(interval);
  }, []);

  if (!features || features.length === 0) return null;

  return (
    <div className="border-t border-b border-[#1212121a] bg-white py-[14px] sm:py-[18px] px-[12px] sm:px-[20px] font-assistant select-none">
      <div className="max-w-[1315px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-[12px] sm:gap-[20px] text-center">
        {features.map((item) => (
          <div key={item.id} className="flex flex-col items-center justify-center p-[4px] sm:p-[8px] min-w-0">
            <span className="text-[11px] sm:text-[13px] font-bold text-[#121212] tracking-wider uppercase leading-snug break-words">
              {item.title}
            </span>
            {item.subtitle && (
              <span className="text-[9.5px] sm:text-[11.5px] text-[#121212bf] mt-[2px] leading-normal break-words">
                {item.subtitle}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

