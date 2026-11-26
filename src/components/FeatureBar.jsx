import React, { useState, useEffect } from 'react';

export default function FeatureBar() {
  const [features, setFeatures] = useState([]);

  const fetchFeatures = async () => {
    try {
      const res = await fetch('/api/features');
      if (res.ok) {
        const data = await res.json();
        const activeOnly = Array.isArray(data) ? data.filter(f => f.isActive !== false) : [];
        setFeatures(activeOnly);
      }
    } catch (err) {
      console.warn('Could not fetch features from API:', err);
    }
  };

  useEffect(() => {
    fetchFeatures();
    const interval = setInterval(fetchFeatures, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!features || features.length === 0) return null;

  return (
    <div className="border-t border-b border-[#1212121a] dark:border-white/10 bg-white dark:bg-[#161616] py-[10px] sm:py-[18px] px-[6px] sm:px-[20px] font-assistant select-none transition-colors duration-200">
      <div className="max-w-[1315px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-[6px] sm:gap-[20px] text-center">
        {features.map((item) => (
          <div key={item.id || item._id} className="flex flex-col items-center justify-center p-[2px] sm:p-[8px] min-w-0">
            <span className="text-[10px] sm:text-[13px] font-bold text-[#121212] dark:text-white tracking-wider uppercase leading-tight break-words">
              {item.title}
            </span>
            {item.subtitle && (
              <span className="text-[8.5px] sm:text-[11.5px] text-[#121212bf] dark:text-gray-400 mt-[2px] leading-tight break-words line-clamp-1 sm:line-clamp-none">
                {item.subtitle}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
