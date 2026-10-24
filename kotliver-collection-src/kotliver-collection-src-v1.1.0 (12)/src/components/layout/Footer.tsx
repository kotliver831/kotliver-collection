import React from 'react';
import { Logo } from '../brand/Logo';
import { SiteSettings } from '../../types';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  CreditCard,
  Heart
} from 'lucide-react';
import { AdsterraSlot } from '../ads/AdsterraSlot';

interface FooterProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  onOpenTrackOrder: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenAdmin,
  onOpenTrackOrder,
  onSelectCategory
}) => {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-12 pb-8 border-t border-emerald-950">
      {/* Adsterra Footer Placement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <AdsterraSlot location="footer" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-800 flex items-center justify-center text-[#D4A72C] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Cash on Delivery</h4>
              <p className="text-[11px] text-gray-400">Pay when your parcel arrives</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-800 flex items-center justify-center text-[#D4A72C] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">100% Genuine Items</h4>
              <p className="text-[11px] text-gray-400">Handcrafted leather & verified tech</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-800 flex items-center justify-center text-[#D4A72C] shrink-0">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Verified Partners</h4>
              <p className="text-[11px] text-gray-400">Daraz, Rokomari & top platforms</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-800 flex items-center justify-center text-[#D4A72C] shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">7-Day Return Policy</h4>
              <p className="text-[11px] text-gray-400">Easy exchange for direct items</p>
            </div>
          </div>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-10">
          {/* Brand Info & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" light />
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Kotliver Collection brings together premium lifestyle handcrafted goods and curated top deals from Bangladesh's trusted e-commerce ecosystems under one convenient shopping experience.
            </p>

            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>{settings.contactPhone} (9 AM - 10 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>{settings.contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Explore Store
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => onSelectCategory('Fashion & Apparel')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Fashion & Leather
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Gadgets & Tech')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Gadgets & Electronics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Books & Literature')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Rokomari Curated Books
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Home & Living')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home & Living Decor
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTrackOrder}
                  className="text-[#D4A72C] hover:underline font-semibold cursor-pointer"
                >
                  Track Order Status
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>Cash on Delivery Terms</li>
              <li>Delivery Zone Rates (৳60 / ৳120)</li>
              <li>Return & Replacement Policy</li>
              <li>Privacy & Data Protection</li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  Admin Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Future Payment Gateway Architecture info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Payment Methods
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-[11px]">
                <span className="text-emerald-400 font-bold block mb-1">
                  ✓ Cash on Delivery (Active)
                </span>
                <span className="text-gray-400">
                  Pay upon doorstep receipt. Zero risk for customers.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800/80 text-[10px] text-gray-400">
                <span className="text-gray-300 font-semibold block mb-0.5">
                  Future Gateways: bKash, Nagad, Visa
                </span>
                <span>
                  Merchant account endpoints ready for live credential provisioning.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Affiliate Disclosure Box (Full Transparency Requirement) */}
        <div className="p-4 rounded-xl bg-gray-900/90 border border-gray-800 text-xs text-gray-400 leading-relaxed my-4">
          <div className="flex items-center gap-2 text-[#D4A72C] font-bold text-[11px] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Affiliate Transparency & Regulatory Disclosure</span>
          </div>
          <p className="text-[11px] text-gray-400">
            {settings.affiliateDisclosure}
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© {new Date().getFullYear()} Kotliver Collection. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-[#D4A72C] fill-current" />
            <span>for seamless shopping in Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
