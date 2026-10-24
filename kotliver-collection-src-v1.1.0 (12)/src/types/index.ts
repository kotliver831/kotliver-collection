export type ProductType = 'direct' | 'affiliate';

export interface Product {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  category: string;
  images: string[];
  sku: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  featured?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  status: 'active' | 'draft';
  affiliateUrl?: string;
  affiliatePlatform?: 'Daraz' | 'Rokomari' | 'Amazon' | 'Star Tech' | 'Partner Store' | 'Other';
  affiliateButtonText?: string;
  specs?: Record<string, string>;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  image: string;
  description: string;
  productCount?: number;
}

export type BannerPlacement = 'hero_slider' | 'homepage_mid' | 'header_top' | 'category_banner';

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  imageUrl: string;
  targetUrl: string;
  placement: BannerPlacement;
  sortOrder: number;
  isActive: boolean;
  buttonText: string;
}

export type AdLocation = 'header_top' | 'homepage_infeed' | 'sidebar' | 'footer' | 'popunder' | 'social_bar';
export type AdFormat = '728x90' | '300x250' | 'responsive_native' | 'direct_link' | 'popunder' | 'social_bar';

export interface AdPlacement {
  id: string;
  name: string;
  location: AdLocation;
  format: AdFormat;
  adCode: string;
  isActive: boolean;
  notes: string;
  bannerPlaceholderText?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryZone: 'Inside City (৳60)' | 'Outside City (৳120)';
  deliveryFee: number;
  orderNotes?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentMethod: 'Cash on Delivery';
  paymentStatus: 'Pending' | 'Paid';
  status: OrderStatus;
  createdAt: string;
  statusTimeline: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  address: string;
  currency: string;
  insideCityDeliveryFee: number;
  outsideCityDeliveryFee: number;
  affiliateDisclosure: string;
  bKashMerchantNumber: string;
  nagadMerchantNumber: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'superadmin' | 'editor';
}

export interface SourceFile {
  path: string;
  name: string;
  extension: string;
  size: number;
  content: string;
  category: 'core' | 'component' | 'service' | 'config' | 'style' | 'asset' | 'doc';
  lastModified?: string;
}

export type UpdateStatus = 'Draft' | 'Ready for Review' | 'Applied' | 'Failed' | 'Rolled Back';

export interface UpdateRecord {
  id: string;
  fileName: string;
  version: string;
  uploadedAt: string;
  appliedAt?: string;
  description: string;
  status: UpdateStatus;
  fileSize: number;
  author: string;
  changesSummary?: string[];
  errorMessage?: string;
  updateType: 'config' | 'catalog' | 'patch' | 'content';
  payloadData?: any;
}

export interface DeploymentInfo {
  appName: string;
  version: string;
  environment: string;
  appUrl: string;
  lastSuccessfulDeployment: string;
  status: 'Healthy (Online)' | 'Degraded' | 'Offline' | 'Checking';
  nodeEnv: string;
  buildFramework: string;
  port: number;
}

export type FirebaseConnectionState = 'Not Configured' | 'Configured' | 'Connected' | 'Connection Error';

export interface FirebaseStatusInfo {
  state: FirebaseConnectionState;
  projectId: string | null;
  databaseId?: string;
  authConfigured: boolean;
  firestoreConfigured: boolean;
  lastConnectionCheck: string | null;
  diagnosticError: string | null;
  adminCount?: number;
  currentUserEmail?: string | null;
  isCurrentUserAdmin?: boolean;
  testDetails?: {
    initPassed: boolean;
    authPassed: boolean;
    readPassed: boolean;
    productsCount?: number;
    latencyMs?: number;
    summary: string;
  };
}
