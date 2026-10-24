import React, { useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  Category, 
  Banner, 
  AdPlacement, 
  CartItem, 
  Order, 
  SiteSettings 
} from './types';
import { 
  storageService, 
  initializeStorage, 
  subscribeToStorageChanges 
} from './services/storageService';
import { firebaseService, getFirebaseInstances } from './services/firebaseService';
import { onAuthStateChanged } from 'firebase/auth';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroBannerSlider } from './components/home/HeroBannerSlider';
import { CategoryGrid } from './components/home/CategoryGrid';
import { ProductCard } from './components/products/ProductCard';
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderSuccessModal } from './components/orders/OrderSuccessModal';
import { TrackOrderModal } from './components/orders/TrackOrderModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdsterraSlot } from './components/ads/AdsterraSlot';
import { 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Sparkles, 
  ExternalLink, 
  ShoppingBag, 
  ArrowRight, 
  Star,
  CheckCircle2,
  Package,
  Layers,
  Search
} from 'lucide-react';

export default function App() {
  // Initialize storage and eagerly sync live products from Cloud Firestore on mount
  useEffect(() => {
    initializeStorage();
    firebaseService.loadProductsFromFirestore().then((liveProds) => {
      if (liveProds && liveProds.length > 0) {
        storageService.setAllProducts(liveProds);
        setProducts(liveProds);
      }
    }).catch((e) => {
      console.warn('Initial mount Firestore sync notice:', e);
    });
  }, []);

  // Reactive state
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());
  const [banners, setBanners] = useState<Banner[]>(() => storageService.getBanners());
  const [settings, setSettings] = useState<SiteSettings>(() => storageService.getSettings());

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kc_cart_items_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('kc_cart_items_v1', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cartItems]);

  // Subscribe to storage changes (e.g. when Admin adds a product or banner)
  useEffect(() => {
    const unsubscribe = subscribeToStorageChanges(() => {
      setProducts(storageService.getProducts());
      setCategories(storageService.getCategories());
      setBanners(storageService.getBanners());
      setSettings(storageService.getSettings());
    });
    return unsubscribe;
  }, []);

  // Real-time synchronization of products with Cloud Firestore
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = firebaseService.subscribeToProducts(
      (liveProducts) => {
        if (!isMounted) return;
        if (liveProducts && liveProducts.length > 0) {
          // Cloud Firestore is the live source of truth
          storageService.setAllProducts(liveProducts);
          setProducts(liveProducts);
        }
      },
      (err) => {
        console.warn('Storefront live catalog real-time sync notice:', err?.message);
        if (isMounted) {
          setProducts(storageService.getProducts());
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Helper to check if current URL points to the admin route (/admin or #admin)
  const isExplicitAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path === '/admin' || path === '/admin/' || hash === '#admin' || hash === '#/admin';
  };

  // Synchronize Firebase Authentication state with strict authorization checks
  useEffect(() => {
    const { auth } = getFirebaseInstances();
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email?.toLowerCase() === 'jamjam8314@gmail.com') {
        const authResult = await firebaseService.verifyAdminAuthorization(user);
        if (authResult.authorized) {
          setAdminUserEmail(user.email);
          // If on admin route or active admin session, keep dashboard open
          if (isExplicitAdminRoute() || localStorage.getItem('kc_admin_session_active') === 'true') {
            setIsAdminDashboardOpen(true);
          }
        } else {
          setAdminUserEmail(null);
          setIsAdminDashboardOpen(false);
          localStorage.removeItem('kc_admin_session_active');
          localStorage.removeItem('kc_admin_logged_in_email');
        }
      } else {
        setAdminUserEmail(null);
        setIsAdminDashboardOpen(false);
        localStorage.removeItem('kc_admin_session_active');
        localStorage.removeItem('kc_admin_logged_in_email');
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen for browser navigation (popstate / hashchange / initial load) for /admin route
  useEffect(() => {
    const handleRouteSync = async () => {
      if (!isExplicitAdminRoute()) return;

      const { auth } = getFirebaseInstances();
      const currentUser = auth?.currentUser;

      if (currentUser && currentUser.email?.toLowerCase() === 'jamjam8314@gmail.com') {
        const authResult = await firebaseService.verifyAdminAuthorization(currentUser);
        if (authResult.authorized) {
          setAdminUserEmail(currentUser.email);
          localStorage.setItem('kc_admin_session_active', 'true');
          setIsAdminDashboardOpen(true);
          return;
        }
      }

      // If not authenticated, open login gate
      setIsAdminLoginOpen(true);
    };

    handleRouteSync();

    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('hashchange', handleRouteSync);
    return () => {
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('hashchange', handleRouteSync);
    };
  }, []);

  // Global Adsterra scripts handler (for full-page popunder or social-bar formats across all pages)
  useEffect(() => {
    const placements = storageService.getAdPlacements();
    const globalPlacements = placements.filter(
      (p) =>
        p.isActive &&
        (p.location === 'popunder' ||
          p.location === 'social_bar' ||
          p.format === 'popunder' ||
          p.format === 'social_bar' ||
          (p.adCode && (p.adCode.includes('popunder') || p.adCode.includes('socialbar'))))
    );

    const scriptIds: string[] = [];
    globalPlacements.forEach((p, idx) => {
      if (!p.adCode) return;
      const srcMatch = p.adCode.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        const id = `adsterra-global-${p.id || idx}`;
        if (!document.getElementById(id)) {
          const script = document.createElement('script');
          script.id = id;
          script.src = srcMatch[1];
          script.async = true;
          script.setAttribute('data-cfasync', 'false');
          document.body.appendChild(script);
          scriptIds.push(id);
        }
      }
    });

    return () => {
      scriptIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, []);

  // Check if store currently has active direct Cash on Delivery items
  const hasDirectCodProducts = useMemo(() => {
    return products.some((p) => p.type === 'direct' && p.status === 'active' && p.stock > 0);
  }, [products]);

  // Compute live product counts per category dynamically from active products
  const categoriesWithLiveCounts = useMemo(() => {
    const activeProds = products.filter((p) => p.status === 'active');
    const knownCatNames = new Set(categories.map((c) => c.name.trim().toLowerCase()));

    const updated = categories.map((cat) => {
      const trimmed = cat.name.trim().toLowerCase();
      const count = activeProds.filter(
        (p) => p.category && p.category.trim().toLowerCase() === trimmed
      ).length;
      return {
        ...cat,
        productCount: count
      };
    });

    // In case products have a category not yet in categories list
    const extraCats: Category[] = [];
    for (const prod of activeProds) {
      const pCat = prod.category?.trim();
      if (pCat && !knownCatNames.has(pCat.toLowerCase())) {
        knownCatNames.add(pCat.toLowerCase());
        const count = activeProds.filter(
          (p) => p.category && p.category.trim().toLowerCase() === pCat.toLowerCase()
        ).length;
        extraCats.push({
          id: `cat-${pCat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name: pCat,
          slug: pCat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          iconName: 'Layers',
          image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
          description: `Explore all ${pCat} curated items.`,
          productCount: count
        });
      }
    }

    return [...updated, ...extraCats];
  }, [categories, products]);

  // UI state & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'affiliate'>('all');
  const [activeFilterPill, setActiveFilterPill] = useState<'all' | 'featured' | 'new' | 'popular'>('all');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackOrderQuery, setTrackOrderQuery] = useState('');

  // Admin Authentication State
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const isRoute = path === '/admin' || path === '/admin/' || hash === '#admin' || hash === '#/admin';
    const hasSession = localStorage.getItem('kc_admin_session_active') === 'true';
    return isRoute && hasSession;
  });
  const [adminUserEmail, setAdminUserEmail] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('kc_admin_logged_in_email') || null;
  });

  // Cart Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.type !== 'direct') {
      // Affiliate items do not go into local cart
      if (product.affiliateUrl) {
        window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer,sponsored');
      }
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(product.stock, i.quantity + quantity) }
            : i
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });

    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    if (product.type !== 'direct') {
      if (product.affiliateUrl) {
        window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer,sponsored');
      }
      return;
    }

    // Set cart to this single item and open checkout directly
    setCartItems([{ product, quantity }]);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleOrderSuccess = (order: Order) => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    setLastPlacedOrder(order);
  };

  // Admin Access Handlers
  const handleOpenAdmin = async () => {
    const { auth } = getFirebaseInstances();
    const currentUser = auth?.currentUser;
    if (
      currentUser &&
      currentUser.email?.toLowerCase() === 'jamjam8314@gmail.com'
    ) {
      const authResult = await firebaseService.verifyAdminAuthorization(currentUser);
      if (authResult.authorized) {
        setAdminUserEmail(currentUser.email);
        localStorage.setItem('kc_admin_session_active', 'true');
        setIsAdminDashboardOpen(true);
        if (!isExplicitAdminRoute()) {
          window.history.pushState(null, '', '/admin');
        }
        return;
      }
    }
    // If not authenticated or verification fails, invalidate stale local state and open login
    setAdminUserEmail(null);
    localStorage.removeItem('kc_admin_logged_in_email');
    localStorage.removeItem('kc_admin_session_active');
    setIsAdminLoginOpen(true);
  };

  const handleAdminLoginSuccess = (email: string) => {
    setAdminUserEmail(email);
    localStorage.setItem('kc_admin_logged_in_email', email);
    localStorage.setItem('kc_admin_session_active', 'true');
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
    if (!isExplicitAdminRoute()) {
      window.history.pushState(null, '', '/admin');
    }
  };

  const handleAdminLogout = async () => {
    try {
      await firebaseService.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setAdminUserEmail(null);
    localStorage.removeItem('kc_admin_logged_in_email');
    localStorage.removeItem('kc_admin_session_active');
    setIsAdminDashboardOpen(false);
    if (isExplicitAdminRoute()) {
      window.history.pushState(null, '', '/');
    }
  };

  const handleCloseAdminDashboard = () => {
    setIsAdminDashboardOpen(false);
    if (isExplicitAdminRoute()) {
      window.history.pushState(null, '', '/');
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    // Status check
    if (p.status !== 'active') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesCategory = p.category.toLowerCase().includes(q);
      const matchesSku = p.sku.toLowerCase().includes(q);
      const matchesDesc = p.description.toLowerCase().includes(q);
      if (!matchesName && !matchesCategory && !matchesSku && !matchesDesc) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory && p.category?.trim().toLowerCase() !== selectedCategory.trim().toLowerCase()) {
      return false;
    }

    // Direct vs Affiliate tab filter
    if (activeTab === 'direct' && p.type !== 'direct') return false;
    if (activeTab === 'affiliate' && p.type !== 'affiliate') return false;

    // Filter pills (Featured, New, Popular)
    if (activeFilterPill === 'featured' && !p.featured) return false;
    if (activeFilterPill === 'new' && !p.isNew) return false;
    if (activeFilterPill === 'popular' && !p.isPopular) return false;

    return true;
  });

  const midPageBanner = banners.find(
    (b) => b.placement === 'homepage_mid' && b.isActive
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans selection:bg-[#176B4D] selection:text-white">
      {/* Top Header */}
      <Header
        categories={categoriesWithLiveCounts}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTrackOrder={() => {
          setTrackOrderQuery('');
          setIsTrackOrderOpen(true);
        }}
        onOpenAdmin={handleOpenAdmin}
        settings={settings}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          const el = document.getElementById('products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        hasDirectCodProducts={hasDirectCodProducts}
      />

      {/* Header Adsterra Ad Placement Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 w-full">
        <AdsterraSlot location="header_top" />
      </div>

      {/* Main Homepage Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
        {/* Promotional Hero Slider */}
        <section className="mb-6">
          <HeroBannerSlider
            banners={banners}
            onCtaClick={(url) => {
              if (url.startsWith('#')) {
                const el = document.querySelector(url);
                el?.scrollIntoView({ behavior: 'smooth' });
              } else if (url.includes('affiliate')) {
                setActiveTab('affiliate');
                const el = document.getElementById('products-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              } else {
                const el = document.getElementById('products-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        </section>

        {/* Value Proposition & Trust Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
          {hasDirectCodProducts ? (
            <>
              <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#176B4D] flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">Cash on Delivery</h4>
                  <p className="text-[11px] text-gray-500">On Kotliver Direct items</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D4A72C] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">Kotliver Direct</h4>
                  <p className="text-[11px] text-gray-500">Handcrafted leather & goods</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#176B4D] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">Curated Partner Deals</h4>
                  <p className="text-[11px] text-gray-500">Hand-selected from Daraz & Rokomari</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D4A72C] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">Official Partner Deals</h4>
                  <p className="text-[11px] text-gray-500">Verified authentic merchant prices</p>
                </div>
              </div>
            </>
          )}

          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Daraz & Rokomari Deals</h4>
              <p className="text-[11px] text-gray-500">Hand-curated partner bargains</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#176B4D] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Genuine Guarantee</h4>
              <p className="text-[11px] text-gray-500">100% verified authentic listings</p>
            </div>
          </div>
        </section>

        {/* Product Categories Grid */}
        <CategoryGrid
          categories={categoriesWithLiveCounts}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            const el = document.getElementById('products-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Homepage In-Feed Adsterra Placement */}
        <AdsterraSlot location="homepage_infeed" />

        {/* Products Section */}
        <section id="products-section" className="my-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#176B4D]">
                <span className="w-2 h-2 rounded-full bg-[#D4A72C]" />
                <span>Kotliver Collection Catalog</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif-brand text-gray-900 mt-1">
                {selectedCategory ? `${selectedCategory} Collection` : 'Explore All Products & Deals'}
              </h2>
            </div>

            {/* Filter Pills (All, Featured, New Arrivals, Popular Picks) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveFilterPill('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeFilterPill === 'all'
                    ? 'bg-[#176B4D] text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                All Picks ({products.filter((p) => p.status === 'active').length})
              </button>

              <button
                onClick={() => setActiveFilterPill('featured')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeFilterPill === 'featured'
                    ? 'bg-[#176B4D] text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                Featured
              </button>

              <button
                onClick={() => setActiveFilterPill('new')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeFilterPill === 'new'
                    ? 'bg-[#176B4D] text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                New Arrivals
              </button>

              <button
                onClick={() => setActiveFilterPill('popular')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeFilterPill === 'popular'
                    ? 'bg-[#176B4D] text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                Popular
              </button>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(selectedCategory || searchQuery || activeTab !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 mb-5 text-xs">
              <span className="text-gray-500 font-medium">Active filters:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-semibold">
                  <span>Category: {selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="hover:text-black cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              {activeTab !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold">
                  <span>Type: {activeTab === 'direct' ? 'Kotliver Direct (COD)' : 'Affiliate Partners'}</span>
                  <button
                    onClick={() => setActiveTab('all')}
                    className="hover:text-black cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-200 text-gray-800 font-semibold">
                  <span>Query: "{searchQuery}"</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-black cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="text-xs text-red-600 hover:underline font-semibold cursor-pointer ml-2"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No matching products found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Try searching with different terms or reset your selected category filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setActiveTab('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  currency={settings.currency}
                  onViewDetails={setSelectedProduct}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          )}
        </section>

        {/* Mid-Page Promotional Feature Banner */}
        {midPageBanner && (
          <section className="my-10">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 to-gray-950 p-8 sm:p-12 text-white border border-[#D4A72C]/30 shadow-xl">
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
                <img
                  src={midPageBanner.imageUrl}
                  alt={midPageBanner.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="relative z-10 max-w-xl">
                {midPageBanner.badge && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#D4A72C] text-gray-950 uppercase mb-3">
                    {midPageBanner.badge}
                  </span>
                )}
                <h3 className="text-2xl sm:text-3xl font-extrabold font-serif-brand leading-tight">
                  {midPageBanner.title}
                </h3>
                <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                  {midPageBanner.subtitle}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById('products-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3 rounded-xl bg-[#176B4D] hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 border border-[#D4A72C]/40 cursor-pointer transition-all shadow-md"
                  >
                    <span>{midPageBanner.buttonText}</span>
                    <ArrowRight className="w-4 h-4 text-[#D4A72C]" />
                  </button>

                  <span className="text-xs text-emerald-200">
                    ✓ Verified Customer Protection
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Why Choose Kotliver Collection - Brand Highlights */}
        <section className="my-12 p-8 rounded-3xl bg-white border border-gray-200/90 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-[#176B4D] uppercase tracking-wider block">
              The Kotliver Promise
            </span>
            <h2 className="text-2xl font-bold font-serif-brand text-gray-900 mt-1">
              Everything You Love, All in One Place
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              We eliminate endless browsing across scattered sites by bringing together our own handcrafted artisan products alongside verified top-rated deals from approved platforms like Daraz and Rokomari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#176B4D] flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-gray-900">Direct COD Fulfillment</h4>
              <p className="text-xs text-gray-500 mt-1">
                For our direct products, we store, pack, and ship directly to your door with Cash on Delivery nationwide.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#D4A72C] flex items-center justify-center mb-3">
                <ExternalLink className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-gray-900">Curated Affiliate Hub</h4>
              <p className="text-xs text-gray-500 mt-1">
                We scour Daraz and Rokomari to filter out counterfeit items and curate only verified bestsellers for you.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#176B4D] flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-gray-900">Absolute Transparency</h4>
              <p className="text-xs text-gray-500 mt-1">
                Zero hidden charges, clean advertising with Adsterra non-intrusive banners, and full affiliate disclosure.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={handleOpenAdmin}
        onOpenTrackOrder={() => {
          setTrackOrderQuery('');
          setIsTrackOrderOpen(true);
        }}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* MODALS */}
      {/* 1. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        currency={settings.currency}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onBuyNow={(p, qty) => handleBuyNow(p, qty)}
      />

      {/* 2. Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        currency={settings.currency}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={handleOrderSuccess}
        settings={settings}
        currency={settings.currency}
      />

      {/* 4. Order Confirmation Success Modal */}
      <OrderSuccessModal
        order={lastPlacedOrder}
        onClose={() => setLastPlacedOrder(null)}
        onTrackOrder={(orderNum) => {
          setTrackOrderQuery(orderNum);
          setIsTrackOrderOpen(true);
        }}
        currency={settings.currency}
      />

      {/* 5. Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        initialQuery={trackOrderQuery}
        currency={settings.currency}
      />

      {/* 6. Admin Login Gate */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* 7. Fullscreen Admin Dashboard Panel */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          adminEmail={adminUserEmail || 'jamjam8314@gmail.com'}
          onLogout={handleAdminLogout}
          onClose={handleCloseAdminDashboard}
          currency={settings.currency}
        />
      )}
    </div>
  );
}
