import React from 'react';
import { Category } from '../../types';
import { 
  Shirt, 
  Smartphone, 
  BookOpen, 
  Home, 
  Sparkles, 
  Watch,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryName: string | null) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Shirt':
        return <Shirt className="w-5 h-5" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Watch':
        return <Watch className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <section className="my-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#D4A72C]" />
            Curated Collections
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-brand text-gray-900 mt-1">
            Shop by Category
          </h2>
        </div>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer underline"
          >
            Show All Categories
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.name)}
              className={`group relative flex flex-col items-center p-3.5 sm:p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer overflow-hidden ${
                isSelected
                  ? 'bg-emerald-50 border-[#176B4D] ring-2 ring-[#176B4D]/30 shadow-md'
                  : 'bg-white border-gray-200/90 hover:border-[#176B4D]/50 hover:shadow-md'
              }`}
            >
              {/* Category Icon Container */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 transition-all duration-300 ${
                  isSelected
                    ? 'bg-[#176B4D] text-[#D4A72C] shadow-sm'
                    : 'bg-emerald-50 text-[#176B4D] group-hover:bg-[#176B4D] group-hover:text-white'
                }`}
              >
                {getIcon(cat.iconName)}
              </div>

              {/* Title & Item Count */}
              <span className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-emerald-800 line-clamp-1">
                {cat.name}
              </span>
              <span className={`text-[11px] mt-0.5 ${cat.productCount && cat.productCount > 0 ? 'text-gray-500 font-medium' : 'text-gray-400'}`}>
                {cat.productCount === 1 ? '1 item' : `${cat.productCount ?? 0} items`}
              </span>

              {/* Selection indicator pill */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#176B4D]" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
