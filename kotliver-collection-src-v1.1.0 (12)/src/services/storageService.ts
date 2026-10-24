import { Product, Category, Banner, AdPlacement, Order, SiteSettings, OrderStatus } from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_BANNERS, 
  INITIAL_AD_PLACEMENTS, 
  INITIAL_ORDERS, 
  INITIAL_SETTINGS 
} from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'kc_products_v1',
  CATEGORIES: 'kc_categories_v1',
  BANNERS: 'kc_banners_v1',
  AD_PLACEMENTS: 'kc_ads_v1',
  ORDERS: 'kc_orders_v1',
  SETTINGS: 'kc_settings_v1',
  AFFILIATE_CLICKS: 'kc_affiliate_clicks_v1',
  ADMIN_SESSION: 'kc_admin_session_v1',
};

// Event-based subscription for reactive UI updates
type ChangeListener = () => void;
const listeners: Set<ChangeListener> = new Set();

export const subscribeToStorageChanges = (callback: ChangeListener) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error running storage listener:', e);
    }
  });
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    // Never trap products or categories in an empty 0-item state if defaults are available
    if (
      key === STORAGE_KEYS.PRODUCTS &&
      Array.isArray(parsed) &&
      parsed.length === 0 &&
      Array.isArray(defaultValue) &&
      defaultValue.length > 0
    ) {
      return defaultValue;
    }
    return parsed;
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// Initialize storage with seeds if not present or empty
export const initializeStorage = () => {
  const existingProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!existingProds || existingProds === '[]') {
    safeSet(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    safeSet(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BANNERS)) {
    safeSet(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.AD_PLACEMENTS)) {
    safeSet(STORAGE_KEYS.AD_PLACEMENTS, INITIAL_AD_PLACEMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    safeSet(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    safeSet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.AFFILIATE_CLICKS)) {
    safeSet(STORAGE_KEYS.AFFILIATE_CLICKS, 38);
  }
};

export const storageService = {
  // PRODUCTS
  getProducts(): Product[] {
    return safeGet<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  setAllProducts(products: Product[]): void {
    safeSet(STORAGE_KEYS.PRODUCTS, products);
  },
  
  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  },
  
  saveProduct(product: Product): Product {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    safeSet(STORAGE_KEYS.PRODUCTS, products);
    return product;
  },
  
  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length !== products.length) {
      safeSet(STORAGE_KEYS.PRODUCTS, filtered);
      return true;
    }
    return false;
  },

  // CATEGORIES
  getCategories(): Category[] {
    return safeGet<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  saveCategory(category: Category): Category {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    safeSet(STORAGE_KEYS.CATEGORIES, categories);
    return category;
  },

  // BANNERS
  getBanners(): Banner[] {
    const banners = safeGet<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    return [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  getActiveBanners(placement?: Banner['placement']): Banner[] {
    const banners = this.getBanners().filter((b) => b.isActive);
    if (placement) {
      return banners.filter((b) => b.placement === placement);
    }
    return banners;
  },

  saveBanner(banner: Banner): Banner {
    const banners = this.getBanners();
    const index = banners.findIndex((b) => b.id === banner.id);
    if (index >= 0) {
      banners[index] = banner;
    } else {
      banners.push(banner);
    }
    safeSet(STORAGE_KEYS.BANNERS, banners);
    return banner;
  },

  deleteBanner(id: string): boolean {
    const banners = this.getBanners();
    const filtered = banners.filter((b) => b.id !== id);
    if (filtered.length !== banners.length) {
      safeSet(STORAGE_KEYS.BANNERS, filtered);
      return true;
    }
    return false;
  },

  // AD PLACEMENTS (Adsterra)
  getAdPlacements(): AdPlacement[] {
    return safeGet<AdPlacement[]>(STORAGE_KEYS.AD_PLACEMENTS, INITIAL_AD_PLACEMENTS);
  },

  getAdPlacementByLocation(location: AdPlacement['location']): AdPlacement | undefined {
    return this.getAdPlacements().find((ad) => ad.location === location && ad.isActive);
  },

  saveAdPlacement(placement: AdPlacement): AdPlacement {
    const placements = this.getAdPlacements();
    const index = placements.findIndex((p) => p.id === placement.id);
    if (index >= 0) {
      placements[index] = placement;
    } else {
      placements.push(placement);
    }
    safeSet(STORAGE_KEYS.AD_PLACEMENTS, placements);
    return placement;
  },

  // ORDERS
  getOrders(): Order[] {
    return safeGet<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.orderNumber === id);
  },

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'statusTimeline'>): Order {
    const orders = this.getOrders();
    const orderNumber = `KC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      statusTimeline: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: 'Order submitted via Cash on Delivery'
        }
      ]
    };

    // Deduct stock for direct products
    const products = this.getProducts();
    let productsUpdated = false;
    newOrder.items.forEach((item) => {
      const pIndex = products.findIndex((p) => p.id === item.productId);
      if (pIndex >= 0 && products[pIndex].type === 'direct') {
        products[pIndex].stock = Math.max(0, products[pIndex].stock - item.quantity);
        productsUpdated = true;
      }
    });

    if (productsUpdated) {
      safeSet(STORAGE_KEYS.PRODUCTS, products);
    }

    orders.unshift(newOrder);
    safeSet(STORAGE_KEYS.ORDERS, orders);

    // Sync order to Firestore if Firebase is active
    try {
      import('./firebaseService').then(({ firebaseService }) => {
        firebaseService.persistOrder(newOrder).catch((e) => {
          console.warn('Firestore order sync note (safe fallback):', e.message);
        });
      });
    } catch {
      // safe fallback
    }

    return newOrder;
  },

  updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = status;
    order.statusTimeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order marked as ${status}`
    });

    safeSet(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  // SETTINGS
  getSettings(): SiteSettings {
    return safeGet<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  saveSettings(settings: SiteSettings): SiteSettings {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },

  // AFFILIATE CLICKS COUNTER
  recordAffiliateClick(productId: string): number {
    const current = safeGet<number>(STORAGE_KEYS.AFFILIATE_CLICKS, 0);
    const updated = current + 1;
    safeSet(STORAGE_KEYS.AFFILIATE_CLICKS, updated);
    return updated;
  },

  getAffiliateClickCount(): number {
    return safeGet<number>(STORAGE_KEYS.AFFILIATE_CLICKS, 38);
  },

  // RESET TO DEFAULTS
  resetToDefaults(): void {
    safeSet(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    safeSet(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    safeSet(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    safeSet(STORAGE_KEYS.AD_PLACEMENTS, INITIAL_AD_PLACEMENTS);
    safeSet(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    safeSet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    safeSet(STORAGE_KEYS.AFFILIATE_CLICKS, 38);
  }
};
