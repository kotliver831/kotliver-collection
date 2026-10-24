import React, { useState } from 'react';
import { Logo } from '../brand/Logo';
import { 
  Search, 
  ShoppingCart, 
  Package, 
  ShieldCheck, 
  Phone, 
  Menu, 
  X, 
  ExternalLink, 
  Sparkles,
  Lock
} from 'lucide-react';
import { Category, SiteSettings } from '../../types';

interface HeaderProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenTrackOrder: () => void;
  onOpenAdmin: () => void;
  settings: SiteSettings;
  activeTab: 'all' | 'direct' | 'affiliate';
  onTabChange: (tab: 'all' | 'direct' | 'affiliate') => void;
  hasDirectCodProducts?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenTrackOrder,
  onOpenAdmin,
  settings,
  activeTab,
  onTabChange,
  hasDirectCodProducts = true
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-gray-100">
      {/* Top Promotional & Trust Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#176B4D] to-emerald-950 text-white text-[11px] sm:text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#D4A72C] text-gray-950 font-bold text-[10px]">
              FESTIVE OFFER
            </span>
            {hasDirectCodProducts ? (
              <>
                <span className="hidden sm:inline font-medium text-emerald-100">
                  Cash on Delivery Available on Direct Items &bull; Official Partner Deals
                </span>
                <span className="sm:hidden font-medium text-emerald-100">
                  COD on Direct &bull; Partner Deals
                </span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline font-medium text-emerald-100">
                  Official Partner Deals &bull; Curated Daraz & Rokomari Catalog
                </span>
                <span className="sm:hidden font-medium text-emerald-100">
                  Partner Deals &bull; Curated Catalog
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 text-emerald-100">
            <a
              href={`tel:${settings.contactPhone}`}
              className="hidden md:flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-[#D4A72C]" />
              <span>{settings.contactPhone}</span>
            </a>
            <button
              onClick={onOpenTrackOrder}
              className="flex items-center gap-1 hover:text-white cursor-pointer font-medium"
            >
              <Package className="w-3 h-3 text-[#D4A72C]" />
              <span>Track Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => {
            onTabChange('all');
            onSelectCategory(null);
          }}
          className="cursor-pointer"
        >
          <Logo size="md" />
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-lg mx-6">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search genuine leather, smart watch, books on Rokomari..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#176B4D] focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Dashboard Entry Button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors cursor-pointer"
            title="Administrator Control Panel"
          >
            <Lock className="w-3.5 h-3.5 text-[#176B4D]" />
            <span className="hidden sm:inline">Admin Panel</span>
          </button>

          {/* Cart Button with Counter */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#176B4D] text-white hover:bg-[#12533B] transition-all duration-200 shadow-sm cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4 text-[#D4A72C]" />
            <span className="hidden md:inline font-bold text-xs">Cart</span>
            {cartCount > 0 && (
              <span className="bg-[#D4A72C] text-gray-950 font-extrabold text-[11px] px-1.5 py-0.2 rounded-full min-w-[20px] text-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden px-4 pb-3">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products or partner deals..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#176B4D]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Secondary Navigation Bar: Store Tabs & Filter Pills */}
      <div className="bg-gray-50/90 border-t border-gray-200/80 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                onTabChange('all');
                onSelectCategory(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' && selectedCategory === null
                  ? 'bg-[#176B4D] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All Items
            </button>

            {hasDirectCodProducts && (
              <button
                onClick={() => onTabChange('direct')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'direct'
                    ? 'bg-[#176B4D] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#D4A72C]" />
                <span>Kotliver Direct (COD)</span>
              </button>
            )}

            <button
              onClick={() => onTabChange('affiliate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'affiliate'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <ExternalLink className="w-3 h-3" />
              <span>Daraz & Rokomari Deals</span>
            </button>
          </div>

          {/* Quick Category Link Chips */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto text-xs">
            {categories.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCategory(selectedCategory === c.name ? null : c.name)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedCategory === c.name
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-gray-600 hover:text-emerald-800'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 p-4 space-y-3">
          <div className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">
            Browse Categories
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectCategory(c.name);
                  setMobileMenuOpen(false);
                }}
                className="text-left p-2 rounded-lg bg-gray-50 hover:bg-emerald-50 text-xs font-medium text-gray-800"
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <button
              onClick={() => {
                onOpenTrackOrder();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-gray-50 text-gray-800"
            >
              <Package className="w-4 h-4 text-emerald-800" />
              <span>Track Your Order</span>
            </button>

            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900"
            >
              <Lock className="w-4 h-4 text-emerald-800" />
              <span>Admin Management Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
