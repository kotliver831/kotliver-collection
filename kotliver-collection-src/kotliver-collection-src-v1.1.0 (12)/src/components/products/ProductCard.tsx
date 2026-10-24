import React from 'react';
import { Product } from '../../types';
import { 
  Star, 
  ShoppingCart, 
  ExternalLink, 
  Eye, 
  Zap, 
  CheckCircle2, 
  Tag
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  currency?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onAddToCart,
  onBuyNow,
  currency = '৳'
}) => {
  const isDirect = product.type === 'direct';
  const isOutOfStock = isDirect && product.stock <= 0;

  const handleAffiliateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.recordAffiliateClick(product.id);
    if (product.affiliateUrl) {
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer,sponsored');
    }
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group relative bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer hover:border-emerald-700/40"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* Product Type & Status Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isDirect ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#176B4D] text-white shadow-xs">
              <CheckCircle2 className="w-3 h-3 text-[#D4A72C]" />
              Kotliver Direct
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white shadow-xs">
              <ExternalLink className="w-3 h-3 text-white" />
              {product.affiliatePlatform || 'Partner'} Deal
            </span>
          )}

          {product.discountPercent && product.discountPercent > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#D4A72C] text-gray-950 shadow-xs">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          className="absolute right-2.5 top-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-gray-700 hover:text-emerald-800 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md z-10"
          title="Quick view"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Out of Stock Ribbon */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & SKU */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
          <span className="font-medium text-emerald-800">{product.category}</span>
          <span className="text-gray-400 font-mono text-[10px]">{product.sku}</span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
          {product.name}
        </h3>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center text-[#D4A72C]">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-xs font-semibold text-gray-800">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviewsCount})</span>

          {isDirect ? (
            <span className="ml-auto text-[10px] text-emerald-800 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
              COD Ready
            </span>
          ) : (
            <span className="ml-auto text-[10px] text-amber-800 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
              Verified Link
            </span>
          )}
        </div>

        {/* Price Row */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg sm:text-xl font-bold text-gray-950 font-serif-brand">
            {currency}{product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {currency}{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
          {isDirect ? (
            /* Direct Product Actions: Add to Cart & Buy Now */
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isOutOfStock}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.(product);
                }}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-emerald-50 text-[#176B4D] border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>

              <button
                disabled={isOutOfStock}
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyNow?.(product);
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#176B4D] hover:bg-[#115039]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>Buy Now</span>
              </button>
            </div>
          ) : (
            /* Affiliate Product Action: Visit Store / Partner Link */
            <button
              onClick={handleAffiliateClick}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{product.affiliateButtonText || `Buy on ${product.affiliatePlatform || 'Partner Store'}`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
