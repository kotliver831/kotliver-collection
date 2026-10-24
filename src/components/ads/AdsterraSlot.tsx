import React, { useMemo, useRef, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { AdLocation } from '../../types';
import { ShieldCheck, Info, Sparkles, Layers } from 'lucide-react';

interface AdsterraSlotProps {
  location: AdLocation;
  className?: string;
  showPlacementLabel?: boolean;
}

/**
 * Checks if the ad code contains actual live ad script/creative
 * versus an unconfigured placeholder or placeholder comment.
 */
export function isLiveAdCode(code: string | undefined | null): boolean {
  if (!code || !code.trim()) return false;
  const lower = code.toLowerCase();

  // If it has standard script execution tags, atOptions, or invoke.js, it's live code
  if (
    lower.includes('<script') ||
    lower.includes('atoptions') ||
    lower.includes('invoke.js') ||
    lower.includes('<iframe')
  ) {
    return true;
  }

  // If it has real HTML image or anchor tags and is not placeholder markup
  if (
    (lower.includes('<a ') || lower.includes('<img ')) &&
    !lower.includes('placeholder') &&
    !lower.includes('border: 1px dashed')
  ) {
    return true;
  }

  return false;
}

export const AdsterraSlot: React.FC<AdsterraSlotProps> = ({
  location,
  className = '',
  showPlacementLabel = false
}) => {
  const placement = storageService.getAdPlacementByLocation(location);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const locationTitles: Record<AdLocation, { title: string; dimensions: string; height: number; maxWidth?: string }> = {
    header_top: { title: 'Header Top Leaderboard', dimensions: '728x90', height: 90, maxWidth: '728px' },
    homepage_infeed: { title: 'Homepage In-Feed Showcase', dimensions: 'Responsive Native', height: 120, maxWidth: '900px' },
    sidebar: { title: 'Sidebar Recommended', dimensions: '300x250', height: 250, maxWidth: '300px' },
    footer: { title: 'Footer Leaderboard Banner', dimensions: '728x90', height: 90, maxWidth: '728px' },
    popunder: { title: 'Global Popunder', dimensions: 'Full Window', height: 0 },
    social_bar: { title: 'Social Bar Push', dimensions: 'Floating', height: 0 }
  };

  const currentMeta = locationTitles[location] || {
    title: 'Adsterra Ad Placement',
    dimensions: 'Responsive',
    height: 90
  };

  // If placement doesn't exist or is toggled off in Admin panel, render nothing
  if (!placement || !placement.isActive) {
    return null;
  }

  const rawCode = placement.adCode?.trim() || '';
  const isLive = isLiveAdCode(rawCode);

  // When live ad code is present, inject it inside a sandboxed friendly iframe
  // This ensures document.write / atOptions / invoke.js execute cleanly without
  // React innerHTML script-blocking, global window variable collisions, or layout breaking.
  useEffect(() => {
    if (!isLive || !iframeRef.current || !rawCode) return;

    const iframe = iframeRef.current;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8">
              <base target="_blank">
              <style>
                *, *::before, *::after { box-sizing: border-box; }
                html, body {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: transparent;
                  overflow: hidden;
                }
              </style>
            </head>
            <body>
              ${rawCode}
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (err) {
      console.warn(`[Adsterra] Execution notice for slot "${location}":`, err);
    }
  }, [rawCode, isLive, location]);

  return (
    <div
      className={`w-full overflow-hidden transition-all duration-300 my-3 relative z-10 ${className}`}
      data-ad-location={location}
      data-ad-status={isLive ? 'live' : 'placeholder'}
      data-testid={`adsterra-${location}`}
    >
      <div className={`mx-auto max-w-5xl rounded-xl p-2.5 transition-colors ${
        isLive
          ? 'bg-white border border-gray-200/90 shadow-xs'
          : 'bg-gradient-to-r from-emerald-50/50 via-gray-50 to-emerald-50/40 border border-dashed border-emerald-300/80'
      }`}>
        {/* Safety, Compliance & Placement Badge */}
        <div className="flex items-center justify-between text-[11px] mb-1.5 px-2">
          <div className="flex items-center gap-1.5 font-medium tracking-wide">
            <ShieldCheck className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-600' : 'text-emerald-700'}`} />
            <span className="text-gray-700 font-semibold">
              {currentMeta.title} ({currentMeta.dimensions})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Advertisement
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Adsterra Slot Ready &bull; Placeholder
              </span>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div 
          className="w-full flex items-center justify-center overflow-hidden rounded-lg bg-white/80"
          style={{ minHeight: `${currentMeta.height}px` }}
        >
          {isLive ? (
            /* Sandboxed Live Ad Iframe: Clean script execution */
            <iframe
              ref={iframeRef}
              title={`Adsterra Ad - ${currentMeta.title}`}
              className="w-full border-0 transition-opacity duration-300"
              style={{
                height: `${currentMeta.height}px`,
                maxWidth: currentMeta.maxWidth || '100%',
                display: 'block'
              }}
              scrolling="no"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
            />
          ) : (
            /* Clear, Transparent Placeholder State (Distinct from live ad) */
            <div className="w-full py-4 px-3 flex flex-col items-center justify-center text-center space-y-1 text-gray-500">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>Adsterra Partner Placement ({currentMeta.dimensions})</span>
              </div>
              <p className="text-[11px] text-gray-500 max-w-md">
                Slot is active on website. Paste your official Adsterra publisher script snippet in{' '}
                <strong className="text-emerald-800 font-semibold">Admin Panel &gt; Ads</strong> to display live advertising.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
