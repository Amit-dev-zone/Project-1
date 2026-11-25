import React from 'react';
import { Filter, X, RotateCcw, Check, DollarSign, Tag, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Footwear',
  'Electronics',
  'Audio',
  'Apparel',
  'Accessories',
  'Home & Living',
  'Fitness',
];

const PRICE_PRESETS = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under $50', min: '', max: '50' },
  { label: '$50 to $100', min: '50', max: '100' },
  { label: '$100 to $250', min: '100', max: '250' },
  { label: '$250+', min: '250', max: '' },
];

export default function FilterSidebar({
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onChangeMinPrice,
  onChangeMaxPrice,
  inStockOnly,
  onToggleInStockOnly,
  onResetFilters,
  isOpenMobile,
  onCloseMobile,
  hasActiveFilters,
}) {
  const handlePresetClick = (preset) => {
    onChangeMinPrice(preset.min);
    onChangeMaxPrice(preset.max);
  };

  const isPresetActive = (preset) => {
    return minPrice === preset.min && maxPrice === preset.max;
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Category Facet */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Tag className="w-3.5 h-3.5 text-indigo-400" />
          <span>Category</span>
        </div>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isSelected =
              cat === 'ALL'
                ? !selectedCategory || selectedCategory === 'ALL'
                : selectedCategory?.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat === 'ALL' ? '' : cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Facet */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
          <span>Price Range</span>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {PRICE_PRESETS.map((preset) => {
            const active = isPresetActive(preset);
            return (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">Min ($)</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => onChangeMinPrice(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">Max ($)</label>
            <input
              type="number"
              placeholder="1000"
              value={maxPrice}
              onChange={(e) => onChangeMaxPrice(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Stock Availability */}
      <div className="pt-4 border-t border-slate-800">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={`w-4 h-4 transition-colors ${
                inStockOnly ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'
              }`}
            />
            <span className="text-xs font-medium text-slate-300 group-hover:text-white">
              In Stock Only
            </span>
          </div>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 backdrop-blur-sm">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs h-full bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <span className="font-bold text-white text-base">Filters</span>
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
            </div>

            <div className="pt-6 border-t border-slate-800 mt-6">
              <button
                onClick={onCloseMobile}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
