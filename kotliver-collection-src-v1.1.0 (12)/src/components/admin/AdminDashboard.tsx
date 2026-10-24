import React, { useState, useEffect } from 'react';
import { 
  Product, 
  Category, 
  Banner, 
  AdPlacement, 
  Order, 
  SiteSettings, 
  OrderStatus,
  ProductType,
  BannerPlacement
} from '../../types';
import { storageService, subscribeToStorageChanges } from '../../services/storageService';
import { Logo } from '../brand/Logo';
import { 
  LayoutDashboard, 
  Package, 
  Image as ImageIcon, 
  Megaphone, 
  ShoppingBag, 
  Settings, 
  BookOpen, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Search, 
  Filter, 
  X,
  Save,
  RotateCcw,
  ShieldCheck,
  Globe,
  HelpCircle,
  Truck,
  Code2
} from 'lucide-react';
import { SourceCodeUpdatesManager } from './SourceCodeUpdatesManager';
import { firebaseService, getFirebaseInstances } from '../../services/firebaseService';

interface AdminDashboardProps {
  adminEmail: string;
  onLogout: () => void;
  onClose: () => void;
  currency?: string;
}

type AdminTab = 'overview' | 'products' | 'banners' | 'ads' | 'orders' | 'settings' | 'source_updates' | 'guide';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminEmail,
  onLogout,
  onClose,
  currency = '৳'
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Reactive state from storage
  const [products, setProducts] = useState<Product[]>(storageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(storageService.getCategories());
  const [banners, setBanners] = useState<Banner[]>(storageService.getBanners());
  const [adPlacements, setAdPlacements] = useState<AdPlacement[]>(storageService.getAdPlacements());
  const [orders, setOrders] = useState<Order[]>(storageService.getOrders());
  const [settings, setSettings] = useState<SiteSettings>(storageService.getSettings());
  const [affiliateClicks, setAffiliateClicks] = useState<number>(storageService.getAffiliateClickCount());

  // Email verification tracking
  const [isEmailVerified, setIsEmailVerified] = useState(() => {
    const { auth } = getFirebaseInstances();
    return auth?.currentUser ? auth.currentUser.emailVerified : true;
  });
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  // Storage subscription
  useEffect(() => {
    const unsubscribe = subscribeToStorageChanges(() => {
      setProducts(storageService.getProducts());
      setCategories(storageService.getCategories());
      setBanners(storageService.getBanners());
      setAdPlacements(storageService.getAdPlacements());
      setOrders(storageService.getOrders());
      setSettings(storageService.getSettings());
      setAffiliateClicks(storageService.getAffiliateClickCount());
    });
    return unsubscribe;
  }, []);

  // PRODUCT MANAGEMENT STATE
  const [productSearch, setProductSearch] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'direct' | 'affiliate'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);
  const [productFeedback, setProductFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Sync catalog from Cloud Firestore on mount or on demand
  const handleSyncFromFirestore = async () => {
    setIsSyncingProducts(true);
    try {
      const firestoreProds = await firebaseService.loadProductsFromFirestore();
      if (firestoreProds && firestoreProds.length > 0) {
        storageService.setAllProducts(firestoreProds);
        setProducts(firestoreProds);
        setProductFeedback({
          type: 'success',
          message: `Synced ${firestoreProds.length} products from Cloud Firestore successfully.`
        });
      } else {
        setProductFeedback({
          type: 'success',
          message: 'Catalog is currently in sync with Cloud Firestore.'
        });
      }
    } catch (e: any) {
      setProductFeedback({
        type: 'error',
        message: `Catalog sync notice: ${e?.message || 'Could not fetch remote products'}`
      });
    } finally {
      setIsSyncingProducts(false);
    }
  };

  // BANNER MANAGEMENT STATE
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  // ORDER MANAGEMENT STATE
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');

  // SETTINGS STATE FORM
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // COMPUTED STATS
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const directProductsCount = products.filter((p) => p.type === 'direct').length;
  const affiliateProductsCount = products.filter((p) => p.type === 'affiliate').length;

  // HANDLERS FOR PRODUCTS
  const handleOpenAddProduct = () => {
    setProductFormError(null);
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: '',
      slug: '',
      type: 'direct',
      category: categories[0]?.name || 'Fashion & Apparel',
      price: 1000,
      originalPrice: 1200,
      discountPercent: 15,
      description: '',
      shortDescription: '',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
      sku: `KC-${Math.floor(100 + Math.random() * 900)}`,
      stock: 20,
      rating: 4.8,
      reviewsCount: 12,
      status: 'active',
      specs: {},
      createdAt: new Date().toISOString()
    };
    setEditingProduct(newProd);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setProductFormError(null);
    setEditingProduct({
      ...prod,
      images: prod.images && prod.images.length > 0 ? [...prod.images] : ['']
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingProduct) return; // Prevent duplicate submissions

    if (!editingProduct) return;

    // Strict client-side validation
    const name = editingProduct.name.trim();
    if (!name) {
      setProductFormError('Please enter a product title.');
      return;
    }

    if (!editingProduct.category?.trim()) {
      setProductFormError('Please select a product category.');
      return;
    }

    const price = Number(editingProduct.price);
    if (isNaN(price) || price <= 0) {
      setProductFormError('Selling price must be greater than ৳0.');
      return;
    }

    const originalPrice = editingProduct.originalPrice ? Number(editingProduct.originalPrice) : undefined;
    if (originalPrice !== undefined && (isNaN(originalPrice) || originalPrice < price)) {
      setProductFormError('Original price must be greater than or equal to selling price.');
      return;
    }

    const sku = (editingProduct.sku || '').trim();
    if (!sku) {
      setProductFormError('SKU code is required.');
      return;
    }

    if (editingProduct.type === 'direct') {
      const stock = Number(editingProduct.stock);
      if (isNaN(stock) || stock < 0) {
        setProductFormError('Stock quantity must be a non-negative number.');
        return;
      }
    }

    if (editingProduct.type === 'affiliate') {
      const affUrl = (editingProduct.affiliateUrl || '').trim();
      if (!affUrl) {
        setProductFormError('Affiliate destination URL is required for affiliate items.');
        return;
      }
      if (!affUrl.startsWith('http://') && !affUrl.startsWith('https://')) {
        setProductFormError('Affiliate URL must start with http:// or https://');
        return;
      }
    }

    const firstImage = (editingProduct.images && editingProduct.images[0] ? editingProduct.images[0] : '').trim();
    if (!firstImage) {
      setProductFormError('At least one product image URL is required.');
      return;
    }
    if (!firstImage.startsWith('http://') && !firstImage.startsWith('https://')) {
      setProductFormError('Product image URL must start with http:// or https://');
      return;
    }

    // Validation passed - proceed with saving
    setProductFormError(null);
    setIsSavingProduct(true);
    setProductFeedback(null);

    // Calculate discount percent
    let discount = 0;
    if (originalPrice && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    const payload: Product = {
      ...editingProduct,
      name,
      sku,
      price,
      originalPrice: originalPrice || price,
      discountPercent: discount,
      stock: editingProduct.type === 'affiliate' ? 999 : Number(editingProduct.stock || 0),
      images: [firstImage, ...editingProduct.images.slice(1).filter((img) => img && img.trim().length > 0)],
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `prod-${Date.now()}`
    };

    try {
      // 1. Confirm write in Cloud Firestore first
      const result = await firebaseService.persistProduct(payload);

      if (result.success) {
        // 2. Confirmed by Firestore! Update local storage & refresh list immediately
        storageService.saveProduct(payload);
        setProducts(storageService.getProducts());
        setIsProductModalOpen(false);
        setEditingProduct(null);
        setProductFeedback({
          type: 'success',
          message: `Product "${payload.name}" was successfully confirmed and saved to Cloud Firestore and storefront.`
        });
      } else {
        // Do not close modal or clear inputs if Firestore write failed
        setProductFormError(result.error || 'Failed to save product to Cloud Firestore. Please check permissions or connection.');
      }
    } catch (err: any) {
      setProductFormError(err?.message || 'Unexpected network failure saving to Cloud Firestore.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProductPrompt = (prod: Product) => {
    setDeleteError(null);
    setProductToDelete(prod);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete || isDeletingProduct) return;
    const { id, name } = productToDelete;
    setIsDeletingProduct(true);
    setDeleteError(null);
    setProductFeedback(null);

    try {
      // 1. Delete from Cloud Firestore first
      const result = await firebaseService.deleteProduct(id);

      if (result.success) {
        // 2. Confirmed by Firestore! Remove from local storage & refresh list immediately
        storageService.deleteProduct(id);
        setProducts(storageService.getProducts());
        setProductToDelete(null);
        setProductFeedback({
          type: 'success',
          message: `Product "${name}" was successfully confirmed deleted from Cloud Firestore and storefront.`
        });
      } else {
        // Show error inside confirmation modal, do NOT claim success or delete locally
        setDeleteError(result.error || 'Cloud Firestore could not delete this product.');
      }
    } catch (err: any) {
      setDeleteError(err?.message || 'Network error occurred while deleting from Cloud Firestore.');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // HANDLERS FOR BANNERS
  const handleOpenAddBanner = () => {
    const newBanner: Banner = {
      id: `ban-${Date.now()}`,
      title: '',
      subtitle: '',
      badge: 'NEW ARRIVAL',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
      targetUrl: '#products-section',
      placement: 'hero_slider',
      sortOrder: banners.length + 1,
      isActive: true,
      buttonText: 'Shop Now'
    };
    setEditingBanner(newBanner);
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner || !editingBanner.title.trim()) return;

    storageService.saveBanner(editingBanner);
    firebaseService.persistBanner(editingBanner).catch((err) => {
      console.warn('Firestore banner note:', err.message);
    });

    setIsBannerModalOpen(false);
    setEditingBanner(null);
  };

  const handleDeleteBanner = (id: string) => {
    if (window.confirm('Are you sure you want to remove this banner?')) {
      storageService.deleteBanner(id);
    }
  };

  // HANDLERS FOR ADSTERRA PLACEMENTS
  const handleUpdateAdPlacement = (placement: AdPlacement) => {
    storageService.saveAdPlacement(placement);
  };

  // HANDLERS FOR ORDERS
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = storageService.updateOrderStatus(orderId, status, statusUpdateNote || undefined);
    if (updated) {
      firebaseService.persistOrder(updated).catch((err) => {
        console.warn('Firestore order note:', err.message);
      });
    }
    setStatusUpdateNote('');
  };

  // HANDLERS FOR SETTINGS
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settingsForm);
    firebaseService.persistSettings(settingsForm).catch((err) => {
      console.warn('Firestore settings note:', err.message);
    });
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-100 flex flex-col font-sans">
      {/* Top Admin Navigation Header */}
      <header className="bg-gray-950 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <Logo size="sm" light showTagline={false} />
          <div className="hidden sm:block border-l border-gray-800 pl-3">
            <span className="text-xs font-bold text-[#D4A72C] uppercase tracking-wider block">
              Control Panel
            </span>
            <span className="text-xs text-gray-400">Secure Store Administration</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-xs text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4A72C]" />
            <span>Admin: {adminEmail}</span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Website</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-900 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Email Verification Advisory Bar (for Firestore rules compliance) */}
      {!isEmailVerified && (
        <div className="bg-amber-500 text-amber-950 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-amber-600 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-950" />
            <span>
              <strong>Email Verification Advisory:</strong> Firebase Authentication reports {adminEmail} is not yet email-verified. Cloud Firestore security rules enforce <code>email_verified == true</code> for permanent database writes.
            </span>
          </div>
          <div className="flex items-center gap-2">
            {verificationFeedback && (
              <span className="font-semibold text-amber-950 bg-amber-200 px-2 py-0.5 rounded text-[11px]">
                {verificationFeedback}
              </span>
            )}
            <button
              onClick={async () => {
                setIsSendingVerification(true);
                try {
                  await firebaseService.sendVerificationEmail();
                  setVerificationFeedback('Verification email sent! Check your inbox.');
                } catch (e: any) {
                  setVerificationFeedback(e?.message || 'Failed to send.');
                } finally {
                  setIsSendingVerification(false);
                }
              }}
              disabled={isSendingVerification}
              className="px-2.5 py-1 bg-amber-950 text-amber-100 rounded-lg font-semibold hover:bg-black transition-colors cursor-pointer text-[11px] disabled:opacity-50"
            >
              {isSendingVerification ? 'Sending...' : 'Send Verification Email'}
            </button>
            <button
              onClick={async () => {
                setIsCheckingVerification(true);
                try {
                  const u = await firebaseService.reloadCurrentUser();
                  if (u?.emailVerified) {
                    setIsEmailVerified(true);
                    setVerificationFeedback('Verified! Full Firestore write access enabled.');
                  } else {
                    setVerificationFeedback('Still unverified. Click the link in your email, or check Firebase Console.');
                  }
                } catch (e: any) {
                  setVerificationFeedback(e?.message || 'Status check failed.');
                } finally {
                  setIsCheckingVerification(false);
                }
              }}
              disabled={isCheckingVerification}
              className="px-2.5 py-1 bg-white text-amber-950 rounded-lg font-semibold hover:bg-amber-100 transition-colors cursor-pointer text-[11px] disabled:opacity-50"
            >
              {isCheckingVerification ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        </div>
      )}

      {/* Main Body: Sidebar + Dynamic Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-16 sm:w-60 bg-gray-900 text-gray-300 border-r border-gray-800 flex flex-col justify-between shrink-0">
          <nav className="p-2 sm:p-4 space-y-1 sm:space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#176B4D] text-white shadow-sm'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
              title="Overview"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-[#D4A72C]" />
              <span className="hidden sm:inline">Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#176B4D] text-white shadow-sm'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
              title="Products"
            >
              <Package className="w-4 h-4 shrink-0 text-[#D4A72C]" />
              <div className="hidden sm:flex flex-1 items-center justify-between">
                <span>Products</span>
                <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded-full">
                  {products.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'banners'
                  ? 'bg-[#176B4D] text-white shadow-sm'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
              title="Banners"
            >
              <ImageIcon className="w-4 h-4 shrink-0 text-[#D4A72C]" />
              <div className="hidden sm:flex flex-1 items-center justify-between">
                <span>Banner Manager</span>
                <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded-full">
                  {banners.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ads'
                  ? 'bg-[#176B4D] text-white shadow-sm'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
              title="Adsterra Ads"
            >
              <Megaphone className="w-4 h-4 shrink-0 text-[#D4A72C]" />
              <span className="hidden sm:inline">Adsterra Ads</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#176B4D] text-white shadow-sm'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
              title="Orders"
            >
              <ShoppingBag className="w-4 h-4 shrink-0 text-[#D4A72C]" />
              <div className="hidden sm:flex flex-1 items-center justify-between">
                <span>Customer Orders</span>
                {pendingOrdersCount > 0 && (
                  <span className="text-[10px] bg-amber-500 text-gray-950 font-bold px-1.5 py-0.5 rounded-full">
                    {pendingOrdersCount}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#176B4D] text-white shadow-sm'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4 shrink-0 text-[#D4A72C]" />
              <span className="hidden sm:inline">Website Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('source_updates')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'source_updates'
                  ? 'bg-[#176B4D] text-white shadow-sm'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
              title="Source Code & Updates"
            >
              <Code2 className="w-4 h-4 shrink-0 text-[#D4A72C]" />
              <span className="hidden sm:inline">Source Code & Updates</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-[#176B4D] text-white shadow-sm'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
              title="Setup & Deployment"
            >
              <BookOpen className="w-4 h-4 shrink-0 text-[#D4A72C]" />
              <span className="hidden sm:inline">Setup & Deployment</span>
            </button>
          </nav>

          <div className="p-3 sm:p-4 border-t border-gray-800 text-[11px] text-gray-500 hidden sm:block">
            <span>Kotliver v1.0 Production</span>
          </div>
        </aside>

        {/* Dynamic Panel Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-serif-brand text-gray-900">
                    Store Performance Overview
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Real-time metrics for direct Cash on Delivery sales and partner affiliate referrals
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#D4A72C]" />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">
                      Direct COD Revenue
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-[#176B4D] font-serif-brand mt-1 block">
                      {currency}{totalRevenue.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium mt-1 inline-block">
                      {orders.length} total orders recorded
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">
                      Pending COD Orders
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-amber-600 font-serif-brand mt-1 block">
                      {pendingOrdersCount}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-1 inline-block">
                      Requires phone confirmation
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">
                      Products in Catalog
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-gray-900 font-serif-brand mt-1 block">
                      {products.length}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-1 inline-block">
                      {directProductsCount} Direct | {affiliateProductsCount} Affiliate
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">
                      Affiliate Link Clicks
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-purple-600 font-serif-brand mt-1 block">
                      {affiliateClicks}
                    </span>
                    <span className="text-[11px] text-purple-700 font-medium mt-1 inline-block">
                      Daraz & Rokomari referrals
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders List */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-gray-900">
                      Recent Cash on Delivery Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#176B4D] hover:underline font-semibold cursor-pointer"
                    >
                      View All ({orders.length})
                    </button>
                  </div>

                  <div className="space-y-3">
                    {orders.slice(0, 4).map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-emerald-900 block">
                            {ord.orderNumber}
                          </span>
                          <span className="text-gray-500">
                            {ord.customerName} &bull; {ord.customerPhone}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-gray-900 block">
                            {currency}{ord.total.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : ord.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Info & Health */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-gray-900">
                    Platform Status
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                      <span className="font-medium text-emerald-900">COD Checkout System</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                      <span className="font-medium text-amber-900">Adsterra Ad Manager</span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                        {adPlacements.filter((a) => a.isActive).length} Placements Live
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                      <span className="font-medium text-blue-900">Hero Slider Banners</span>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-200/80 px-2 py-0.5 rounded">
                        {banners.filter((b) => b.isActive).length} Active
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <button
                      onClick={() => setActiveTab('guide')}
                      className="w-full py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#176B4D]" />
                      <span>Firebase & Hosting Deployment Guide</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-serif-brand text-gray-900">
                    Product Management
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manage direct inventory (Cash on Delivery) and affiliate partner deals (Daraz & Rokomari)
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={handleSyncFromFirestore}
                    disabled={isSyncingProducts}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                    title="Fetch and sync latest catalog from Cloud Firestore"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 text-[#176B4D] ${isSyncingProducts ? 'animate-spin' : ''}`} />
                    <span>{isSyncingProducts ? 'Syncing...' : 'Sync Firestore'}</span>
                  </button>

                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#D4A72C]" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* Feedback Banner */}
              {productFeedback && (
                <div
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
                    productFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {productFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="text-xs font-bold block">
                        {productFeedback.type === 'success' ? 'Product Operation Completed' : 'Cloud Firestore Notice'}
                      </span>
                      <span className="text-xs mt-0.5 block leading-relaxed">{productFeedback.message}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setProductFeedback(null)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Filters & Search */}
              <div className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by name or SKU..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#176B4D]"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setProductTypeFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      productTypeFilter === 'all'
                        ? 'bg-[#176B4D] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All ({products.length})
                  </button>

                  <button
                    onClick={() => setProductTypeFilter('direct')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      productTypeFilter === 'direct'
                        ? 'bg-[#176B4D] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Direct COD ({directProductsCount})
                  </button>

                  <button
                    onClick={() => setProductTypeFilter('affiliate')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      productTypeFilter === 'affiliate'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Affiliates ({affiliateProductsCount})
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products
                        .filter((p) => {
                          const matchesSearch =
                            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.sku.toLowerCase().includes(productSearch.toLowerCase());
                          const matchesType =
                            productTypeFilter === 'all' || p.type === productTypeFilter;
                          return matchesSearch && matchesType;
                        })
                        .map((prod) => (
                          <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.images[0]}
                                  alt={prod.name}
                                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100"
                                />
                                <div>
                                  <span className="font-bold text-gray-900 block max-w-xs truncate">
                                    {prod.name}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    SKU: {prod.sku}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              {prod.type === 'direct' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Kotliver Direct
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  <ExternalLink className="w-3 h-3" />
                                  {prod.affiliatePlatform || 'Partner'}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-gray-600 font-medium">
                              {prod.category}
                            </td>

                            <td className="py-3 px-4 font-bold text-gray-900">
                              {currency}{prod.price.toLocaleString()}
                            </td>

                            <td className="py-3 px-4">
                              {prod.type === 'direct' ? (
                                <span
                                  className={`font-semibold ${
                                    prod.stock <= 5 ? 'text-red-600' : 'text-gray-700'
                                  }`}
                                >
                                  {prod.stock} units
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">Partner Managed</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  prod.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {prod.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                                  title={`Edit ${prod.name}`}
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteProductPrompt(prod)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                                  title={`Delete ${prod.name}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BANNERS */}
          {activeTab === 'banners' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-serif-brand text-gray-900">
                    Banner Manager
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure promotional carousel slides, mid-page banners, and call-to-actions
                  </p>
                </div>

                <button
                  onClick={handleOpenAddBanner}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 text-[#D4A72C]" />
                  <span>Add New Banner</span>
                </button>
              </div>

              {/* Banners List & Live Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((ban) => (
                  <div
                    key={ban.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs p-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3">
                        <img
                          src={ban.imageUrl}
                          alt={ban.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4A72C] text-gray-950 uppercase">
                            {ban.badge || 'PROMO'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white">
                            Order: #{ban.sortOrder}
                          </span>
                        </div>

                        <div className="absolute top-2 right-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ban.isActive
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-400 text-white'
                            }`}
                          >
                            {ban.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <h3 className="font-bold text-gray-900 text-base">{ban.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ban.subtitle}</p>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Placement: <strong className="text-gray-700">{ban.placement}</strong></span>
                        <span>CTA: <strong className="text-gray-700">{ban.buttonText}</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t flex items-center justify-between">
                      <button
                        onClick={() => {
                          const updated = { ...ban, isActive: !ban.isActive };
                          storageService.saveBanner(updated);
                        }}
                        className={`text-xs font-semibold cursor-pointer px-2.5 py-1 rounded-lg ${
                          ban.isActive
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {ban.isActive ? 'Disable' : 'Enable'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingBanner(ban);
                            setIsBannerModalOpen(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-emerald-800 hover:bg-gray-100 rounded-lg cursor-pointer"
                          title="Edit Banner"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(ban.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ADSTERRA AD MANAGER */}
          {activeTab === 'ads' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-serif-brand text-gray-900">
                    Adsterra Ad Placement Manager
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Safely configure approved advertising slots with sandboxed boundary protection
                  </p>
                </div>
              </div>

              {/* Security & Non-Intrusion Guarantee Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-sm">
                    Sandboxed Layout Protection Guarantee
                  </span>
                  <p className="text-emerald-800 leading-relaxed">
                    All Adsterra advertising slots are rendered inside strict CSS overflow containers. They will never cover navigation menus, shopping carts, or the Cash on Delivery checkout modal. Only verified placements will display on live pages.
                  </p>
                </div>
              </div>

              {/* Placements Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adPlacements.map((ad) => (
                  <div
                    key={ad.id}
                    className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-900">{ad.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-100 text-gray-600">
                          {ad.format}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mb-3">{ad.notes}</p>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-semibold text-gray-700">
                          Adsterra Publisher / Placement Code (HTML or Script Tag)
                        </label>
                        <textarea
                          rows={4}
                          value={ad.adCode}
                          onChange={(e) => {
                            const updated = { ...ad, adCode: e.target.value };
                            handleUpdateAdPlacement(updated);
                          }}
                          placeholder="Paste official Adsterra banner or script snippet here..."
                          className="w-full font-mono text-[11px] p-2.5 rounded-xl border border-gray-300 focus:ring-1 focus:ring-[#176B4D] bg-gray-50 text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t flex items-center justify-between">
                      <span className="text-xs text-gray-500">Placement Status:</span>
                      <button
                        onClick={() => {
                          const updated = { ...ad, isActive: !ad.isActive };
                          handleUpdateAdPlacement(updated);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          ad.isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {ad.isActive ? 'Active on Website' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adsterra Publisher Setup Guide */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-800" />
                  <span>How to Get Official Adsterra Publisher Code</span>
                </h3>

                <ol className="list-decimal list-inside text-xs text-gray-600 space-y-2 pl-1 leading-relaxed">
                  <li>
                    Register an official publisher account at{' '}
                    <strong className="underline text-gray-800">publishers.adsterra.com</strong>.
                  </li>
                  <li>
                    Add <strong>Kotliver Collection</strong> as your verified website domain.
                  </li>
                  <li>
                    Choose recommended non-intrusive formats: <strong>728x90 Leaderboard</strong> for Header/Footer, <strong>300x250 Medium Rectangle</strong> for Sidebar, and <strong>Native Banner</strong> for Homepage.
                  </li>
                  <li>
                    Once approved by Adsterra, copy the snippet and paste it into the respective placement above.
                  </li>
                  <li>
                    Toggle "Active on Website" to start showing ads safely!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-serif-brand text-gray-900">
                    Customer Order Management
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Track and update customer Cash on Delivery orders, delivery logistics, and status updates
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search order ID, phone, customer name..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#176B4D]"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-[#176B4D] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {orders
                  .filter((o) => {
                    const matchesSearch =
                      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                      o.customerPhone.includes(orderSearch);
                    const matchesStatus =
                      orderStatusFilter === 'all' || o.status === orderStatusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                            Order ID
                          </span>
                          <span className="font-mono text-base font-bold text-emerald-900">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Placed: {new Date(ord.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                            Customer
                          </span>
                          <span className="font-bold text-gray-900 text-sm block">
                            {ord.customerName}
                          </span>
                          <span className="text-xs text-gray-600 font-mono">
                            {ord.customerPhone}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                            Total (COD)
                          </span>
                          <span className="font-serif-brand text-lg font-extrabold text-[#176B4D] block">
                            {currency}{ord.total.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            Fee: {currency}{ord.deliveryFee}
                          </span>
                        </div>

                        {/* Status Change Dropdown */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-gray-600">Status:</label>
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                            }
                            className="px-3 py-1.5 rounded-xl border border-gray-300 font-bold text-xs bg-gray-50 focus:ring-2 focus:ring-[#176B4D] cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Items & Address */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 rounded-xl bg-gray-50 space-y-1.5">
                          <span className="font-bold text-gray-700 block">
                            Delivery Address ({ord.deliveryZone})
                          </span>
                          <p className="text-gray-600">{ord.deliveryAddress}</p>
                          {ord.orderNotes && (
                            <p className="text-amber-800 font-medium">
                              Note: {ord.orderNotes}
                            </p>
                          )}
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 space-y-2">
                          <span className="font-bold text-gray-700 block">
                            Ordered Items ({ord.items.length})
                          </span>
                          <div className="space-y-1">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-gray-700">
                                <span>
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="font-semibold font-mono">
                                  {currency}{(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif-brand text-gray-900">
                  Website Settings & Configuration
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update store branding, contact details, delivery rates, and affiliate disclaimer
                </p>
              </div>

              {settingsSavedMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#176B4D]" />
                  <span>Website settings saved successfully! Changes are active.</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.storeName}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, storeName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, tagline: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={settingsForm.contactPhone}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, contactPhone: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.contactEmail}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, contactEmail: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Store Physical Address
                  </label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, address: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Inside City Delivery Fee (৳)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.insideCityDeliveryFee}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          insideCityDeliveryFee: Number(e.target.value)
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Outside City Delivery Fee (৳)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.outsideCityDeliveryFee}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          outsideCityDeliveryFee: Number(e.target.value)
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Affiliate Disclosure Statement (Displayed in Footer)
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.affiliateDisclosure}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        affiliateDisclosure: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reset all demo data back to factory defaults?')) {
                        storageService.resetToDefaults();
                        alert('Reset complete.');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Reset Store Data to Default
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#D4A72C]" />
                    <span>Save Website Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: SOURCE CODE & UPDATES */}
          {activeTab === 'source_updates' && (
            <SourceCodeUpdatesManager
              adminEmail={adminEmail}
              currency={currency}
            />
          )}

          {/* TAB 7: SETUP & DEPLOYMENT GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif-brand text-gray-900">
                  Firebase, Store & Deployment Guide
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Complete documentation for live cloud deployment, security rules, and monetization
                </p>
              </div>

              {/* Step 1: Firebase Configuration */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176B4D] flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <span>How to Configure Firebase (Firestore & Auth)</span>
                </h3>
                <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
                  <p>
                    Kotliver Collection is built with a decoupled persistence architecture. To connect your own live Firebase project:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-2">
                    <li>Go to <strong>console.firebase.google.com</strong> and create a project (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded">kotliver-collection</code>).</li>
                    <li>In the left sidebar, click <strong>Authentication</strong> &gt; enable <strong>Google Sign-In</strong> or <strong>Email/Password</strong>.</li>
                    <li>Click <strong>Firestore Database</strong> &gt; Create Database (Start in test mode or production mode).</li>
                    <li>Click <strong>Project Settings (gear icon)</strong> &gt; General &gt; Under "Your apps", register a Web App and copy your Firebase config object into <code className="bg-gray-100 px-1 py-0.5 rounded">firebase-applet-config.json</code>.</li>
                  </ol>
                </div>
              </div>

              {/* Step 2: Creating First Admin User */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176B4D] flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <span>How to Create Your First Secure Admin Account</span>
                </h3>
                <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
                  <p>
                    By default, the application recognizes your account email (<strong>{adminEmail}</strong>) and <strong>admin@kotliver.com</strong> as authorized store administrators.
                  </p>
                  <p>
                    In production Firestore, create an <code className="bg-gray-100 px-1 py-0.5 rounded">admins</code> collection where document IDs match the Firebase Auth UID of authorized administrators. Security rules enforce that only records inside <code className="bg-gray-100 px-1 py-0.5 rounded">/admins/$(request.auth.uid)</code> can modify products, banners, and advertising codes.
                  </p>
                </div>
              </div>

              {/* Step 3: Managing Products & Affiliate Links */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176B4D] flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <span>Adding Direct Products vs. Affiliate Links</span>
                </h3>
                <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
                  <p>
                    <strong>Direct Products:</strong> Choose type "My Own Product". These will feature "Add to Cart" and "Buy Now" with local Cash on Delivery checkout. Inventory is automatically deducted upon order placement.
                  </p>
                  <p>
                    <strong>Affiliate Products (Daraz, Rokomari):</strong> Choose type "Affiliate Product". Enter your verified partner affiliate link (e.g., from Daraz Affiliate or Rokomari Partner portal). Visitors will see a prominent "Visit Store" button that opens your partner link with <code className="bg-gray-100 px-1 py-0.5 rounded">rel="noopener noreferrer sponsored"</code>, ensuring compliance with Google search and affiliate platform guidelines.
                  </p>
                </div>
              </div>

              {/* Step 4: Adsterra Ads */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176B4D] flex items-center justify-center font-bold text-xs">
                    4
                  </span>
                  <span>Adsterra Advertising Setup & Safety</span>
                </h3>
                <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
                  <p>
                    In the <strong>Adsterra Ads</strong> tab, we have created 4 standard placements: Header (728x90), Homepage Mid-Feed, Product Sidebar (300x250), and Footer.
                  </p>
                  <p>
                    Never place pop-unders or full-screen redirect scripts that disrupt user checkout. Standard banner codes paste directly into the manager and are sandboxed inside isolated CSS containers to prevent layout shifting.
                  </p>
                </div>
              </div>

              {/* Step 5: Hosting & Deployment */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#176B4D] flex items-center justify-center font-bold text-xs">
                    5
                  </span>
                  <span>Deploying Kotliver Collection to Free / Low-Cost Hosting</span>
                </h3>
                <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
                  <ul className="list-disc list-inside space-y-1.5 pl-2">
                    <li>
                      <strong>Google Cloud Run (Recommended for full-stack):</strong> Build with <code className="bg-gray-100 px-1 py-0.5 rounded">npm run build</code> and deploy using containerized Cloud Run with automated free tier scaling.
                    </li>
                    <li>
                      <strong>Firebase Hosting:</strong> Run <code className="bg-gray-100 px-1 py-0.5 rounded">firebase init hosting</code> &gt; specify <code className="bg-gray-100 px-1 py-0.5 rounded">dist</code> directory &gt; run <code className="bg-gray-100 px-1 py-0.5 rounded">firebase deploy</code>. Free on Spark plan!
                    </li>
                    <li>
                      <strong>Vercel / Netlify:</strong> Connect your Git repository, set build command <code className="bg-gray-100 px-1 py-0.5 rounded">npm run build</code> and output folder to <code className="bg-gray-100 px-1 py-0.5 rounded">dist</code>.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* EDIT / ADD PRODUCT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div 
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8 p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b">
              <h2 className="text-lg font-bold font-serif-brand text-gray-900">
                {products.some((p) => p.id === editingProduct.id) ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {productFormError && (
              <div className="mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Please Review:</span>
                  <span className="mt-0.5 block leading-relaxed">{productFormError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="py-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Product Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, type: 'direct' })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      editingProduct.type === 'direct'
                        ? 'border-[#176B4D] bg-emerald-50 ring-1 ring-[#176B4D]'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="block text-xs font-bold text-gray-900">My Own Product</span>
                    <span className="text-[11px] text-gray-500">Direct COD checkout & inventory</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, type: 'affiliate' })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      editingProduct.type === 'affiliate'
                        ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="block text-xs font-bold text-gray-900">Affiliate Product</span>
                    <span className="text-[11px] text-gray-500">Daraz, Rokomari partner link</span>
                  </button>
                </div>
              </div>

              {/* Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    placeholder="e.g. Kotliver Genuine Leather Bag"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, Original Price, SKU, Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Selling Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Original Price (৳)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    disabled={editingProduct.type === 'affiliate'}
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Affiliate Details (Conditional) */}
              {editingProduct.type === 'affiliate' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <span className="font-bold text-xs text-amber-900 block">
                    Affiliate Partner Configuration
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Partner Platform
                      </label>
                      <select
                        value={editingProduct.affiliatePlatform || 'Daraz'}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            affiliatePlatform: e.target.value as any
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                      >
                        <option value="Daraz">Daraz</option>
                        <option value="Rokomari">Rokomari</option>
                        <option value="Amazon">Amazon</option>
                        <option value="Star Tech">Star Tech</option>
                        <option value="Partner Store">Partner Store</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={editingProduct.affiliateButtonText || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            affiliateButtonText: e.target.value
                          })
                        }
                        placeholder="e.g. Buy on Daraz"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Affiliate Destination URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={editingProduct.affiliateUrl || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          affiliateUrl: e.target.value
                        })
                      }
                      placeholder="https://www.daraz.com.bd/... or https://www.rokomari.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Image URL & Preview */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Image URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={editingProduct.images[0] || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        images: [e.target.value, ...editingProduct.images.slice(1)]
                      })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                  {editingProduct.images[0] && (
                    <img
                      src={editingProduct.images[0]}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border"
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  disabled={isSavingProduct}
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                >
                  {isSavingProduct ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <span>Save Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div 
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Delete Product
                </h3>
                <p className="text-xs text-gray-500">
                  This action removes the item from catalog & Cloud Firestore.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3.5 mb-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Could Not Delete From Firestore:</span>
                  <span className="mt-0.5 block leading-relaxed">{deleteError}</span>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 mb-5 text-xs text-gray-700">
              <p className="leading-relaxed">
                Are you sure you want to delete <strong className="text-gray-900 font-bold">{productToDelete.name}</strong>?
              </p>
              <div className="mt-2 text-[11px] text-gray-500 flex flex-wrap items-center gap-2">
                <span>SKU: {productToDelete.sku}</span>
                <span>&bull;</span>
                <span>Category: {productToDelete.category}</span>
                <span>&bull;</span>
                <span>Price: {currency}{productToDelete.price.toLocaleString()}</span>
              </div>
              <p className="mt-2.5 text-[11px] text-red-600 font-medium">
                Storefront inventory and Cloud Firestore records will be updated immediately.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                disabled={isDeletingProduct}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProduct}
                onClick={handleConfirmDeleteProduct}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isDeletingProduct ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Deleting from Firestore...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / ADD BANNER MODAL */}
      {isBannerModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div 
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8 p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b">
              <h2 className="text-lg font-bold font-serif-brand text-gray-900">
                {banners.some((b) => b.id === editingBanner.id) ? 'Edit Banner' : 'Add Banner'}
              </h2>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="py-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingBanner.title}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, title: e.target.value })
                  }
                  placeholder="e.g. Exclusive Festive Leather Collection"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subtitle / Promo Text
                </label>
                <input
                  type="text"
                  value={editingBanner.subtitle}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, subtitle: e.target.value })
                  }
                  placeholder="e.g. Handcrafted from top-grain cowhide leather..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={editingBanner.badge || ''}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, badge: e.target.value })
                    }
                    placeholder="e.g. FESTIVE DEALS"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Button CTA Text
                  </label>
                  <input
                    type="text"
                    value={editingBanner.buttonText}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, buttonText: e.target.value })
                    }
                    placeholder="e.g. Shop Now"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Display Placement
                  </label>
                  <select
                    value={editingBanner.placement}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        placement: e.target.value as BannerPlacement
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                  >
                    <option value="hero_slider">Hero Main Carousel Slider</option>
                    <option value="homepage_mid">Homepage Mid-Page Feature</option>
                    <option value="header_top">Header Top Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Sort Priority (1 = first)
                  </label>
                  <input
                    type="number"
                    value={editingBanner.sortOrder}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        sortOrder: Number(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Banner Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={editingBanner.imageUrl}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, imageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Destination URL (e.g. #products-section or link)
                </label>
                <input
                  type="text"
                  value={editingBanner.targetUrl}
                  onChange={(e) =>
                    setEditingBanner({ ...editingBanner, targetUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              {/* Live Preview Card */}
              {editingBanner.imageUrl && (
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <span className="block text-[11px] font-bold text-gray-500 uppercase mb-2">
                    Live Banner Preview
                  </span>
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-xs">
                    <img
                      src={editingBanner.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 p-4 flex flex-col justify-end text-white">
                      {editingBanner.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4A72C] text-gray-950 w-fit mb-1">
                          {editingBanner.badge}
                        </span>
                      )}
                      <h4 className="font-bold text-sm">{editingBanner.title || 'Banner Title'}</h4>
                      <p className="text-[11px] text-gray-200 line-clamp-1">{editingBanner.subtitle}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#176B4D] hover:bg-emerald-800 cursor-pointer"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
