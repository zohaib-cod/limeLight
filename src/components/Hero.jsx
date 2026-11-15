import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';
import { ASSETS } from '../data/products';
import FeatureBar from './FeatureBar';

export default function Hero() {
  const [slides, setSlides] = useState([
    {
      id: "slide-1",
      badge: "WINTER VOLUME 2026",
      scriptText: "Signature",
      title: "UNSTITCHED & READY TO WEAR",
      subtitle: "Discover rich textures, intricate embroideries, and statement silhouettes tailored for the contemporary winter wardrobe. STYLE FOR EVERY OCCASION.",
      primaryBtnText: "SHOP UNSTITCHED",
      primaryBtnLink: "#unstitched",
      secondaryBtnText: "VIEW READY TO WEAR",
      secondaryBtnLink: "#ready-to-wear",
      imageUrl: ASSETS.heroBanner,
      isActive: true
    },
    {
      id: "slide-2",
      badge: "LUXURY UNSTITCHED",
      scriptText: "Elegance",
      title: "EMBROIDERED WINTER VELVET",
      subtitle: "Exquisite zari and threadwork on micro velvet paired with printed pashmina and karandi shawls.",
      primaryBtnText: "EXPLORE VELVET",
      primaryBtnLink: "#unstitched",
      secondaryBtnText: "SHOP 3-PIECE SUITS",
      secondaryBtnLink: "#unstitched",
      imageUrl: ASSETS.unstitchedMain,
      isActive: true
    },
    {
      id: "slide-3",
      badge: "WESTERN & PRET",
      scriptText: "Chic",
      title: "CO-ORD SETS & CASUALS",
      subtitle: "Effortless day-to-evening style crafted in premium linen blends and structured slub fabrics.",
      primaryBtnText: "SHOP CO-ORDS",
      primaryBtnLink: "#ready-to-wear",
      secondaryBtnText: "VIEW PRET LOOKS",
      secondaryBtnLink: "#ready-to-wear",
      imageUrl: ASSETS.coordsBanner,
      isActive: true
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  // Fetch dynamic slides from backend API
  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/slides');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const activeOnly = data.filter(s => s.isActive !== false);
          if (activeOnly.length > 0) {
            setSlides(activeOnly);
            if (currentIndex >= activeOnly.length) {
              setCurrentIndex(0);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Backend API not reachable, using local slides:', err);
    }
  };

  useEffect(() => {
    fetchSlides();
    const interval = setInterval(fetchSlides, 10000); // Check for backend updates periodically
    return () => clearInterval(interval);
  }, []);

  // Autoplay slider logic
  useEffect(() => {
    if (slides.length <= 1 || !isPlaying || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPlaying, isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#080808] font-assistant select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider Viewport */}
      <div className="relative w-full h-[540px] sm:h-[620px] lg:h-[720px] max-h-[88vh]">
        {/* Slides stack with cross-fade transition */}
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Slide Image */}
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover object-center filter brightness-[0.88] transition-transform duration-7000 ease-out transform scale-100 group-hover:scale-102"
                loading={idx === 0 ? "eager" : "lazy"}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ASSETS.heroBanner;
                }}
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

              {/* Content Box */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-[1600px] w-full mx-auto px-[20px] sm:px-[50px] relative">
                  <div className="max-w-[742px] relative z-10">
                    {/* Calligraphy Watermark Script (Signature / Elegance / Festive) */}
                    <div className="relative">
                      {slide.scriptText && (
                        <span
                          className="absolute -top-[55px] -left-[10px] text-[75px] sm:text-[110px] font-serif italic text-white/20 select-none pointer-events-none tracking-normal font-light leading-none"
                          style={{ fontFamily: 'Georgia, "Playfair Display", serif' }}
                        >
                          {slide.scriptText}
                        </span>
                      )}

                      {/* Top Badge */}
                      {slide.badge && (
                        <div className="relative z-10 inline-block mb-[12px]">
                          <span className="inline-flex items-center gap-[6px] text-[11.5px] sm:text-[12.5px] tracking-[0.25em] text-white/95 uppercase font-medium bg-black/40 backdrop-blur-md px-[12px] py-[5px] rounded-[3px] border border-white/10">
                            <Sparkles size={12} className="text-[#cec72e]" />
                            <span>{slide.badge}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Exact H1: 40px, weight 700, color #ffffff */}
                    <h1 className="text-[32px] sm:text-[40px] font-bold text-[#ffffff] tracking-wide mb-[14px] leading-[1.15] drop-shadow-md uppercase">
                      {slide.title}
                    </h1>

                    {/* Subtitle / Description */}
                    {slide.subtitle && (
                      <p className="text-[15px] sm:text-[16px] leading-[26px] sm:leading-[28.8px] text-white/90 font-normal mb-[28px] max-w-[620px] drop-shadow-sm">
                        {slide.subtitle}
                      </p>
                    )}

                    {/* Action Buttons: Button style 1 & Button style 2 */}
                    <div className="flex flex-wrap items-center gap-[15px] sm:gap-[20px]">
                      {slide.primaryBtnText && (
                        <a
                          href={slide.primaryBtnLink || '#unstitched'}
                          className="button-style-1 bg-[#121212] text-[#ffffff] hover:bg-black border border-white/20 transition-all shadow-md active:scale-95"
                        >
                          {slide.primaryBtnText}
                        </a>
                      )}

                      {slide.secondaryBtnText && (
                        <a
                          href={slide.secondaryBtnLink || '#ready-to-wear'}
                          className="button-style-2 text-[#ffffff] hover:underline flex items-center gap-[6px] tracking-wider text-[14px] font-medium"
                        >
                          <span>{slide.secondaryBtnText}</span>
                          <ArrowRight size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Previous & Next Navigation Arrows (appear on hover) */}
        {slides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-[15px] sm:left-[25px] top-1/2 -translate-y-1/2 z-20 w-[42px] h-[42px] rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-[15px] sm:right-[25px] top-1/2 -translate-y-1/2 z-20 w-[42px] h-[42px] rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Bottom Bar: Indicators & Slider Manager Action */}
        <div className="absolute bottom-[20px] inset-x-0 z-20">
          <div className="max-w-[1600px] mx-auto px-[20px] sm:px-[50px] flex items-center justify-between">
            {/* Slide Dots / Bars */}
            <div className="flex items-center gap-[8px]">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-[4px] rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-[32px] bg-[#ffffff]'
                      : 'w-[12px] bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}

              {/* Index counter (01 / 04) */}
              <span className="text-[12px] font-mono text-white/75 ml-[8px]">
                0{currentIndex + 1} / 0{slides.length}
              </span>

              {/* Pause/Play toggle */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-[4px] text-white/60 hover:text-white transition-colors ml-[4px]"
                title={isPlaying ? "Pause autoplay" : "Resume autoplay"}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Feature highlights bar below banner (connected to backend) */}
      <FeatureBar />
    </section>
  );
}
