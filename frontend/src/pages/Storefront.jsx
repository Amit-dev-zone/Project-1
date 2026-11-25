import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ShoppingBag,
  Check,
  AlertCircle,
  Sparkles,
  Store,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  ArrowUpDown,
} from 'lucide-react';
import { productService } from '../api/productService';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import FilterSidebar from '../components/FilterSidebar';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'stock_desc', label: 'Highest Stock' },
];

export default function Storefront() {
  // Products and Pagination
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(true);

  // Mobile Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Cart Feedback Toast
  const [addedNotice, setAddedNotice] = useState(null);

  const { addToCart, isInCart, getItemQuantity } = useCart();

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1); // Reset to page 1 on new search
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page to 1 when filters change
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const handleMinPriceChange = (val) => {
    setMinPrice(val);
    setPage(1);
  };

  const handleMaxPriceChange = (val) => {
    setMaxPrice(val);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
  };

  const handleToggleInStock = (checked) => {
    setInStockOnly(checked);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setInStockOnly(true);
    setPage(1);
  };

  // Determine if active filters exist
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      category ||
      minPrice !== '' ||
      maxPrice !== '' ||
      debouncedSearch !== '' ||
      sort !== 'newest' ||
      !inStockOnly
    );
  }, [category, minPrice, maxPrice, debouncedSearch, sort, inStockOnly]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    if (minPrice !== '' || maxPrice !== '') count++;
    if (debouncedSearch) count++;
    if (sort !== 'newest') count++;
    if (!inStockOnly) count++;
    return count;
  }, [category, minPrice, maxPrice, debouncedSearch, sort, inStockOnly]);

  // Fetch products from backend API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 12,
        sort,
        inStockOnly: inStockOnly ? 'true' : 'false',
      };

      if (category && category !== 'ALL') params.category = category;
      if (debouncedSearch) params.search = debouncedSearch;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;

      const res = await productService.getPublicProducts(params);

      setProducts(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
      setError('Unable to load listings. Please verify that the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [page, category, debouncedSearch, minPrice, maxPrice, sort, inStockOnly]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add to cart handler
  const handleAddToCart = (product) => {
    const result = addToCart(product, 1);
    if (result.success) {
      setAddedNotice({
        productId: product.id || product._id,
        message: result.message || `Added "${product.title}" to cart!`,
        isError: false,
      });
    } else {
      setAddedNotice({
        productId: product.id || product._id,
        message: result.message || 'Cannot add item to cart',
        isError: true,
      });
    }

    setTimeout(() => {
      setAddedNotice(null);
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Vendor Discovery Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Explore Verified Merchant Stores
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Discover and purchase authentic products across independent sellers with unified
            multi-vendor cart aggregation and real-time inventory limits.
          </p>

          {/* Quick Search Input */}
          <div className="max-w-xl mx-auto pt-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by title, category, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 shadow-xl shadow-indigo-950/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cart Notification Toast */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl border text-sm flex items-center gap-2.5 ${
              addedNotice.isError
                ? 'bg-rose-950 border-rose-800 text-rose-200'
                : 'bg-emerald-950 border-emerald-800 text-emerald-200'
            }`}
          >
            {addedNotice.isError ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{addedNotice.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex items-start gap-8">
          {/* Sidebar Filter */}
          <FilterSidebar
            selectedCategory={category}
            onSelectCategory={handleCategoryChange}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onChangeMinPrice={handleMinPriceChange}
            onChangeMaxPrice={handleMaxPriceChange}
            inStockOnly={inStockOnly}
            onToggleInStockOnly={handleToggleInStock}
            onResetFilters={handleResetFilters}
            isOpenMobile={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Product Feed & Toolbar */}
          <main className="flex-1 min-w-0">
            {/* Top Toolbar: Counter, Active Badges, Sort & Mobile Filter Toggle */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl px-4 py-3">
                {/* Result count & Mobile button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <div className="text-xs text-slate-400">
                    {loading ? (
                      <span>Loading listings...</span>
                    ) : (
                      <span>
                        Showing <strong className="text-white">{products.length}</strong> of{' '}
                        <strong className="text-white">{total}</strong> products
                      </span>
                    )}
                  </div>
                </div>

                {/* Sort Control */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400 hidden sm:inline">Sort by:</span>
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    Active Filters:
                  </span>

                  {category && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-xs">
                      <span>Category: {category}</span>
                      <button
                        onClick={() => handleCategoryChange('')}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {debouncedSearch && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-xs">
                      <span>Keyword: "{debouncedSearch}"</span>
                      <button onClick={() => setSearchQuery('')} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {(minPrice !== '' || maxPrice !== '') && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-xs">
                      <span>
                        Price:{' '}
                        {minPrice !== '' && maxPrice !== ''
                          ? `$${minPrice} - $${maxPrice}`
                          : minPrice !== ''
                          ? `Min $${minPrice}`
                          : `Max $${maxPrice}`}
                      </span>
                      <button
                        onClick={() => {
                          setMinPrice('');
                          setMaxPrice('');
                        }}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {!inStockOnly && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800 text-indigo-300 text-xs">
                      <span>Include Out of Stock</span>
                      <button
                        onClick={() => setInStockOnly(true)}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium ml-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-8 rounded-2xl bg-rose-950/30 border border-rose-900 text-center max-w-md mx-auto space-y-3 mb-8">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                <p className="text-sm text-rose-300">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-xs text-white font-medium transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Product Grid or Skeletons */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-96 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse p-4 flex flex-col justify-between"
                  >
                    <div className="h-52 bg-slate-800/80 rounded-xl" />
                    <div className="space-y-3 mt-4">
                      <div className="h-4 bg-slate-800 rounded w-3/4" />
                      <div className="h-4 bg-slate-800 rounded w-1/2" />
                    </div>
                    <div className="h-10 bg-slate-800/50 rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty Search / Filter State */
              <div className="text-center py-20 px-4 bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-200">
                    No matching marketplace products
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    We couldn't find any products matching your current filters or search query.
                  </p>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </div>
            ) : (
              /* Populated Product Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const productId = product.id || product._id;
                  const inCart = isInCart(productId);
                  const qtyInCart = getItemQuantity(productId);
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <div
                      key={productId}
                      className="group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5"
                    >
                      <div>
                        {/* Image Canvas */}
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-800/70 mb-3.5">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <Store className="w-12 h-12" />
                            </div>
                          )}

                          {/* Category Tag */}
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-sm text-[11px] font-medium text-slate-300 border border-slate-700/60">
                            {product.category || 'General'}
                          </span>

                          {/* Stock Status Badge */}
                          <span
                            className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              isOutOfStock
                                ? 'bg-rose-950/90 text-rose-300 border border-rose-800'
                                : product.stock <= 5
                                ? 'bg-amber-950/90 text-amber-300 border border-amber-800'
                                : 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {isOutOfStock
                              ? 'Out of Stock'
                              : product.stock <= 5
                              ? `Only ${product.stock} left`
                              : `${product.stock} in stock`}
                          </span>
                        </div>

                        {/* Vendor Attribution */}
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-semibold mb-1">
                          <Store className="w-3.5 h-3.5" />
                          <span className="truncate">{product.vendorName || 'Verified Merchant'}</span>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-slate-100 text-sm line-clamp-2 group-hover:text-indigo-300 transition-colors">
                          {product.title}
                        </h3>

                        {product.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Pricing & Add to Cart Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 block leading-tight">
                            Price
                          </span>
                          <span className="text-lg font-bold text-white">
                            ${Number(product.price).toFixed(2)}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isOutOfStock}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 ${
                            isOutOfStock
                              ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-800'
                              : inCart
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95'
                          }`}
                        >
                          {inCart ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>In Cart ({qtyInCart})</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Bar */}
            {totalPages > 1 && !loading && (
              <div className="mt-10 pt-6 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-xs text-slate-400">
                  Page <strong className="text-white">{page}</strong> of{' '}
                  <strong className="text-white">{totalPages}</strong>
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
