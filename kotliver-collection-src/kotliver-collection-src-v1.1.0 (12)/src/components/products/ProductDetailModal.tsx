import React, { useState } from 'react';
import { Product } from '../../types';
import { 
  X, 
  Star, 
  ShoppingCart, 
  ExternalLink, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  Minus,
  Sparkles,
  Zap,
  Share2,
  Info
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { AdsterraSlot } from '../ads/AdsterraSlot';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
  currency?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  currency = '৳'
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    product?.images[0] || ''
  );
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) return null;

  const isDirect = product.type === 'direct';
  const isOutOfStock = isDirect && product.stock <= 0;

  const handleAffiliateClick = () => {
    storageService.recordAffiliateClick(product.id);
    if (product.affiliateUrl) {
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer,sponsored');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Left Column: Image Gallery */}
          <div className="p-6 bg-gray-50 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-gray-200">
            {/* Main Featured Image */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-xs border border-gray-200/80">
              <img
                src={selectedImage || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              
              {/* Type Badge */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {isDirect ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#176B4D] text-white shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A72C]" />
                    Kotliver Direct Collection
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-600 text-white shadow-sm">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Verified Partner Deal ({product.affiliatePlatform})
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto py-1 max-w-full">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                      (selectedImage || product.images[0]) === img
                        ? 'border-[#176B4D] ring-2 ring-[#176B4D]/30 scale-105'
                        : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Share / Trust Pills */}
            <div className="w-full mt-6 pt-4 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500">
              <span className="font-mono">SKU: {product.sku}</span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-emerald-800 hover:text-emerald-900 font-semibold cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="font-semibold text-emerald-800 uppercase tracking-wider">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-[#D4A72C]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-gray-800 text-sm">{product.rating}</span>
                  <span className="text-gray-400">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Price Banner */}
              <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#176B4D] font-serif-brand">
                  {currency}{product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">
                    {currency}{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.discountPercent && (
                  <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold bg-[#D4A72C] text-gray-950">
                    Save {product.discountPercent}%
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  About this item
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications / Highlights */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Key Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                          {key}
                        </span>
                        <span className="font-medium text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transparency Notice for Affiliate Products */}
              {!isDirect && (
                <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Affiliate Item:</strong> This product is sold and fulfilled by our verified partner{' '}
                    <strong className="underline">{product.affiliatePlatform || 'Partner Store'}</strong>. Clicking the button below takes you directly to their official store. Kotliver Collection does not collect payment for this item.
                  </p>
                </div>
              )}

              {/* Trust Badges for Direct Products */}
              {isDirect && (
                <div className="mt-5 grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-center text-[11px] text-gray-600">
                  <div className="flex flex-col items-center">
                    <Truck className="w-4 h-4 text-emerald-800 mb-1" />
                    <span className="font-medium">Cash on Delivery</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-800 mb-1" />
                    <span className="font-medium">100% Genuine</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <RotateCcw className="w-4 h-4 text-emerald-800 mb-1" />
                    <span className="font-medium">7-Day Returns</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="mt-6 pt-4">
              {isDirect ? (
                /* Direct Product: Quantity + Cart + Buy Now */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Quantity</span>
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        disabled={quantity >= product.stock || isOutOfStock}
                        className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={isOutOfStock}
                      onClick={() => {
                        onAddToCart?.(product, quantity);
                        onClose();
                      }}
                      className="py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-emerald-50 text-[#176B4D] border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      disabled={isOutOfStock}
                      onClick={() => {
                        onBuyNow?.(product, quantity);
                        onClose();
                      }}
                      className="py-3 px-4 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 bg-[#176B4D] hover:bg-[#115039] shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 text-[#D4A72C]" />
                      <span>Buy Now (COD)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Affiliate Product: External Partner Direct Link */
                <button
                  onClick={handleAffiliateClick}
                  className="w-full py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 flex items-center justify-center gap-2.5 shadow-lg shadow-amber-900/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>
                    {product.affiliateButtonText || `Proceed to ${product.affiliatePlatform || 'Partner Store'}`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
