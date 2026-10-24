import React, { useState, useEffect, useCallback } from 'react';
import { Banner } from '../../types';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface HeroBannerSliderProps {
  banners: Banner[];
  onCtaClick?: (url: string) => void;
}

export const HeroBannerSlider: React.FC<HeroBannerSliderProps> = ({ banners, onCtaClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const heroBanners = banners.filter((b) => b.placement === 'hero_slider' && b.isActive);

  const nextSlide = useCallback(() => {
    if (heroBanners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % heroBanners.length);
  }, [heroBanners.length]);

  const prevSlide = useCallback(() => {
    if (heroBanners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  }, [heroBanners.length]);

  // Autoplay effect
  useEffect(() => {
    if (isPaused || heroBanners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, heroBanners.length]);

  if (heroBanners.length === 0) {
    return (
      <div className="w-full h-64 bg-gradient-to-r from-[#176B4D] to-[#0A2F22] rounded-2xl flex items-center justify-center text-white px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-serif-brand text-[#D4A72C]">Kotliver Collection</h2>
          <p className="text-sm text-emerald-100 mt-1">Everything You Love, All in One Place.</p>
        </div>
      </div>
    );
  }

  const currentBanner = heroBanners[currentIndex] || heroBanners[0];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-900 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Image with Gradient Overlay */}
      <div className="relative min-h-[380px] sm:min-h-[440px] md:min-h-[480px] w-full overflow-hidden flex items-center">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 transform scale-100 group-hover:scale-105"
        />
        {/* Dark Vignette & Emerald Tint Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/70 to-emerald-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />

        {/* Content Box */}
        <div className="relative z-10 max-w-2xl px-6 sm:px-10 md:px-14 py-12 text-white">
          {currentBanner.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#D4A72C] text-gray-950 mb-3 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentBanner.badge}</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold font-serif-brand tracking-tight text-white leading-tight drop-shadow-sm">
            {currentBanner.title}
          </h2>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-200 line-clamp-3 leading-relaxed max-w-xl">
            {currentBanner.subtitle}
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (onCtaClick) {
                  onCtaClick(currentBanner.targetUrl);
                } else if (currentBanner.targetUrl.startsWith('#')) {
                  const el = document.querySelector(currentBanner.targetUrl);
                  el?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = currentBanner.targetUrl;
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#176B4D] hover:bg-[#12533B] text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-emerald-900/30 transition-all duration-200 transform hover:-translate-y-0.5 border border-[#D4A72C]/40 cursor-pointer"
            >
              <span>{currentBanner.buttonText || 'Explore Now'}</span>
              <ArrowRight className="w-4 h-4 text-[#D4A72C]" />
            </button>

            <span className="text-xs text-gray-300 font-medium bg-black/40 px-3 py-2 rounded-lg backdrop-blur-xs border border-white/10">
              ⚡ Cash on Delivery Available
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {heroBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors duration-200 opacity-80 group-hover:opacity-100 z-20 cursor-pointer border border-white/15"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors duration-200 opacity-80 group-hover:opacity-100 z-20 cursor-pointer border border-white/15"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-8 bg-[#D4A72C]'
                    : 'w-2.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
