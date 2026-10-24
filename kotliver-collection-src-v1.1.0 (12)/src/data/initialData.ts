import { Product, Category, Banner, AdPlacement, Order, SiteSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-fashion',
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    iconName: 'Shirt',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
    description: 'Premium clothing, genuine leather goods, and timeless accessories.',
    productCount: 0
  },
  {
    id: 'cat-gadgets',
    name: 'Gadgets & Tech',
    slug: 'gadgets-tech',
    iconName: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    description: 'Smart watches, premium audio, chargers, and computing accessories.',
    productCount: 0
  },
  {
    id: 'cat-books',
    name: 'Books & Literature',
    slug: 'books-literature',
    iconName: 'BookOpen',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    description: 'Rokomari curated bestsellers, personal development, and fiction.',
    productCount: 0
  },
  {
    id: 'cat-home',
    name: 'Home & Living',
    slug: 'home-living',
    iconName: 'Home',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    description: 'Minimalist decor, kitchen ceramics, aroma diffusers, and organizers.',
    productCount: 0
  },
  {
    id: 'cat-beauty',
    name: 'Health & Personal Care',
    slug: 'health-beauty',
    iconName: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    description: 'Organic skincare, wellness packs, and daily grooming essentials.',
    productCount: 0
  },
  {
    id: 'cat-watches',
    name: 'Timepieces & Jewelry',
    slug: 'timepieces-jewelry',
    iconName: 'Watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    description: 'Classic analog watches, smart bands, and minimalist accessories.',
    productCount: 0
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Direct Product 1
  {
    id: 'prod-kc-001',
    name: 'Kotliver Signature Top-Grain Leather Bi-Fold Wallet',
    slug: 'kotliver-leather-bifold-wallet',
    type: 'direct',
    category: 'Fashion & Apparel',
    price: 1450,
    originalPrice: 1950,
    discountPercent: 25,
    description: 'Handcrafted from 100% genuine top-grain cowhide leather with RFID blocking technology. Features 8 card slots, 2 cash compartments, and an elegant golden embossed KC monogram emblem.',
    shortDescription: '100% genuine handcrafted top-grain leather with RFID protection.',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80'
    ],
    sku: 'KC-WAL-001',
    stock: 24,
    rating: 4.9,
    reviewsCount: 48,
    featured: true,
    isNew: true,
    isPopular: true,
    status: 'active',
    specs: {
      'Material': 'Genuine Top-Grain Cowhide Leather',
      'Card Slots': '8 + 2 Hidden',
      'RFID Shield': 'Certified 13.56 MHz',
      'Warranty': '1 Year Craftsmanship Warranty'
    },
    createdAt: '2026-09-01T10:00:00Z'
  },
  // Direct Product 2
  {
    id: 'prod-kc-002',
    name: 'Kotliver Apex Pro Smart Watch with AMOLED Display',
    slug: 'kotliver-apex-pro-smart-watch',
    type: 'direct',
    category: 'Gadgets & Tech',
    price: 3850,
    originalPrice: 4800,
    discountPercent: 20,
    description: 'Featuring an ultra-bright 1.43-inch Always-On AMOLED screen, Bluetooth calling with noise reduction microphone, 24/7 heart rate and SpO2 tracking, and up to 10 days battery life.',
    shortDescription: '1.43" AMOLED screen, Bluetooth HD calling, 10-day battery.',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80'
    ],
    sku: 'KC-WTC-042',
    stock: 18,
    rating: 4.8,
    reviewsCount: 34,
    featured: true,
    isPopular: true,
    status: 'active',
    specs: {
      'Display': '1.43" AMOLED 466x466',
      'Battery': '350mAh (7-10 Days)',
      'Waterproof': 'IP68 Certified',
      'Sensors': 'Optical Heart Rate, SpO2, Sleep Tracker'
    },
    createdAt: '2026-09-05T12:00:00Z'
  },
  // Affiliate Product 1 - Daraz
  {
    id: 'prod-aff-001',
    name: 'Anker Soundcore Life P2i True Wireless Earbuds',
    slug: 'anker-soundcore-life-p2i-earbuds',
    type: 'affiliate',
    category: 'Gadgets & Tech',
    price: 2690,
    originalPrice: 3200,
    discountPercent: 16,
    description: 'Verified official partner offer on Daraz. Features 10mm drivers with BassUp technology, 28-hour playtime, dual EQ modes, and crystal-clear call quality.',
    shortDescription: 'Daraz Verified Deal: 10mm graphene drivers with 28-hour playtime.',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
    ],
    sku: 'AFF-DAR-9812',
    stock: 99,
    rating: 4.7,
    reviewsCount: 182,
    featured: true,
    isPopular: true,
    status: 'active',
    affiliatePlatform: 'Daraz',
    affiliateUrl: 'https://www.daraz.com.bd/catalog/?q=anker+soundcore+life+p2i',
    affiliateButtonText: 'Buy on Daraz',
    specs: {
      'Seller': 'Daraz Official Mall',
      'Playtime': '8 hrs (Buds) / 28 hrs with Case',
      'Connectivity': 'Bluetooth 5.2',
      'Warranty': '18 Months Official Brand Warranty'
    },
    createdAt: '2026-09-08T14:00:00Z'
  },
  // Affiliate Product 2 - Rokomari
  {
    id: 'prod-aff-002',
    name: 'Atomic Habits (বাংলা অনুবাদ) by James Clear',
    slug: 'atomic-habits-bangla-translation',
    type: 'affiliate',
    category: 'Books & Literature',
    price: 420,
    originalPrice: 550,
    discountPercent: 24,
    description: 'The international bestseller now in standard Bengali translation available through Rokomari. Learn how small changes lead to remarkable results.',
    shortDescription: 'Rokomari Best Seller: James Clear\'s habit blueprint in Bengali.',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80'
    ],
    sku: 'AFF-ROK-4421',
    stock: 150,
    rating: 4.95,
    reviewsCount: 310,
    featured: true,
    isNew: true,
    status: 'active',
    affiliatePlatform: 'Rokomari',
    affiliateUrl: 'https://www.rokomari.com/book/search?term=atomic+habits',
    affiliateButtonText: 'Order on Rokomari',
    specs: {
      'Publisher': 'Rokomari Partner Press',
      'Binding': 'Hardcover Deluxe',
      'Language': 'Bengali',
      'Pages': '288'
    },
    createdAt: '2026-09-10T11:00:00Z'
  },
  // Direct Product 3
  {
    id: 'prod-kc-003',
    name: 'Kotliver Minimalist Hand-Poured Soy Wax Scented Candle Set',
    slug: 'kotliver-soy-wax-scented-candle-set',
    type: 'direct',
    category: 'Home & Living',
    price: 890,
    originalPrice: 1150,
    discountPercent: 22,
    description: 'Set of 3 luxury aromatherapy candles infused with natural essential oils (Amber Vanilla, Sandalwood & Cedar, Wild Jasmine). 100% clean-burning natural soy wax.',
    shortDescription: 'Set of 3 hand-poured aromatherapy candles with natural oils.',
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80'
    ],
    sku: 'KC-HME-108',
    stock: 45,
    rating: 4.85,
    reviewsCount: 19,
    featured: false,
    isNew: true,
    status: 'active',
    specs: {
      'Wax': '100% Eco Soy Wax',
      'Burn Time': '35 Hours Per Jar',
      'Wick': 'Natural Lead-Free Cotton',
      'Quantity': '3 x 180g Jars'
    },
    createdAt: '2026-09-14T09:00:00Z'
  },
  // Direct Product 4
  {
    id: 'prod-kc-004',
    name: 'Kotliver Executive Ceramic Matte Coffee Mug & Warmer Pad Set',
    slug: 'kotliver-executive-coffee-mug-warmer',
    type: 'direct',
    category: 'Home & Living',
    price: 1250,
    originalPrice: 1650,
    discountPercent: 24,
    description: 'Maintain your hot beverage at the ideal 55°C temperature all day. Includes a premium 400ml matte ceramic mug with gold-plated spoon and USB gravity-induction warming coaster.',
    shortDescription: 'Constant 55°C thermostat warming base with golden spoon.',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ],
    sku: 'KC-MUG-009',
    stock: 32,
    rating: 4.75,
    reviewsCount: 27,
    featured: false,
    isPopular: true,
    status: 'active',
    specs: {
      'Mug Capacity': '400 ml Ceramic',
      'Power': 'USB-C 16W Smart Thermostat',
      'Constant Temp': '55°C Automatic Sensor'
    },
    createdAt: '2026-09-18T16:00:00Z'
  },
  // Affiliate Product 3 - Daraz
  {
    id: 'prod-aff-003',
    name: 'Redragon K552 Kumara RGB Mechanical Gaming Keyboard',
    slug: 'redragon-k552-mechanical-keyboard',
    type: 'affiliate',
    category: 'Gadgets & Tech',
    price: 3250,
    originalPrice: 3800,
    discountPercent: 14,
    description: 'Compact 87-key tenkeyless mechanical keyboard with dust-proof red mechanical switches, rainbow RGB backlighting, and solid aluminum-ABS construction.',
    shortDescription: 'Tactile mechanical red switches with customizable RGB lighting.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    sku: 'AFF-DAR-2209',
    stock: 50,
    rating: 4.65,
    reviewsCount: 142,
    featured: false,
    isPopular: true,
    status: 'active',
    affiliatePlatform: 'Daraz',
    affiliateUrl: 'https://www.daraz.com.bd/catalog/?q=redragon+k552',
    affiliateButtonText: 'Visit Daraz Store',
    specs: {
      'Switch Type': 'Dustproof Red Switches',
      'Layout': 'Tenkeyless (87 Keys)',
      'Cable': 'Gold-Plated Braided USB'
    },
    createdAt: '2026-09-20T10:30:00Z'
  },
  // Affiliate Product 4 - Rokomari
  {
    id: 'prod-aff-004',
    name: 'The Psychology of Money (বাংলা অনুবাদ) by Morgan Housel',
    slug: 'the-psychology-of-money-bangla',
    type: 'affiliate',
    category: 'Books & Literature',
    price: 380,
    originalPrice: 500,
    discountPercent: 24,
    description: 'Timeless lessons on wealth, greed, and happiness. Explore the psychological behaviors that drive financial decisions.',
    shortDescription: 'Rokomari Top Finance Book: Bengali edition of Morgan Housel\'s masterwork.',
    images: [
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80'
    ],
    sku: 'AFF-ROK-1102',
    stock: 120,
    rating: 4.9,
    reviewsCount: 220,
    featured: true,
    isPopular: true,
    status: 'active',
    affiliatePlatform: 'Rokomari',
    affiliateUrl: 'https://www.rokomari.com/book/search?term=psychology+of+money',
    affiliateButtonText: 'Order on Rokomari',
    specs: {
      'Category': 'Personal Finance & Mindset',
      'Publisher': 'Prothoma / Rokomari Certified',
      'Format': 'Paperback'
    },
    createdAt: '2026-09-22T08:00:00Z'
  },
  // Affiliate Product 5 - Rokomari (Charger Rack Shelf Phone Charging Holder)
  {
    id: 'prod-rok-429342',
    name: 'Charger Rack Shelf Phone Charging Holder',
    slug: 'charger-rack-shelf-phone-charging-holder',
    type: 'affiliate',
    category: 'Gadgets & Tech',
    price: 59,
    originalPrice: 99,
    discountPercent: 40,
    description: 'Durable universal mobile phone charging bracket and wall socket shelf. Keeps your smartphone secure, elevated, and tangle-free while charging near any standard electrical wall outlet.',
    shortDescription: 'Wall socket hanging charging shelf with cable routing slot.',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    sku: 'ROK-429342',
    stock: 999,
    rating: 4.8,
    reviewsCount: 86,
    featured: true,
    isNew: true,
    isPopular: true,
    status: 'active',
    affiliatePlatform: 'Rokomari',
    affiliateUrl: 'https://www.rokomari.com/electronics/product/429342/mobile-phone-charging-hanging-holder',
    affiliateButtonText: 'Order on Rokomari',
    specs: {
      'Partner': 'Rokomari Electronics',
      'Material': 'Flame-Retardant ABS Polymer',
      'Compatibility': 'Universal Smartphone Support',
      'Installation': 'Plug-over Wall Adapter (Zero Tools)'
    },
    createdAt: '2026-10-01T10:00:00Z'
  },
  // Affiliate Product 6 - Rokomari (Travelling Folding Kettle)
  {
    id: 'prod-rok-sw06j002',
    name: 'Travelling Folding Kettle',
    slug: 'travelling-folding-kettle',
    type: 'affiliate',
    category: 'Home & Living',
    price: 699,
    originalPrice: 950,
    discountPercent: 26,
    description: 'Ultralight portable collapsible silicone electric kettle with 600ml capacity. Features dual voltage 110V/220V support, rapid boiling in 4 minutes, and heat-resistant BPA-free food-grade silicone body that folds flat for travel luggage.',
    shortDescription: 'Collapsible food-grade silicone 600ml portable travel kettle.',
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80'
    ],
    sku: 'ROK-SW06J002',
    stock: 999,
    rating: 4.9,
    reviewsCount: 142,
    featured: true,
    isNew: true,
    isPopular: true,
    status: 'active',
    affiliatePlatform: 'Rokomari',
    affiliateUrl: 'https://www.rokomari.com/electronics/product/SW06J002/portable-collapsible-silicone-electric-travel-kettle',
    affiliateButtonText: 'Order on Rokomari',
    specs: {
      'Capacity': '600 ml',
      'Material': 'Food-Grade BPA-Free Silicone + 304 Stainless Steel Heating Plate',
      'Voltage': '100-240V Dual Voltage (Worldwide Compatible)',
      'Boil Speed': 'Approx. 4 Minutes'
    },
    createdAt: '2026-10-05T12:00:00Z'
  },
  // Affiliate Product 7 - Rokomari (VISION Room Comforter Easy Heaters)
  {
    id: 'prod-rok-823439',
    name: 'VISION Room Comforter Easy Heaters',
    slug: 'vision-room-comforter-easy-heaters',
    type: 'affiliate',
    category: 'Home & Living',
    price: 1419,
    originalPrice: 1850,
    discountPercent: 23,
    description: 'Genuine VISION Room Comforter Easy Heater designed for cozy winter warmth. Features adjustable dual temperature settings (1000W / 2000W), rapid ceramic convection heating, overheat thermal protection, and ultra-quiet airflow operation.',
    shortDescription: 'High-efficiency dual heat portable room heater with safety cutoff.',
    images: [
      'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=800&q=80'
    ],
    sku: 'ROK-823439',
    stock: 999,
    rating: 4.85,
    reviewsCount: 118,
    featured: true,
    isNew: true,
    isPopular: true,
    status: 'active',
    affiliatePlatform: 'Rokomari',
    affiliateUrl: 'https://www.rokomari.com/electronics/product/823439/vision-room-heater-easy-comforter',
    affiliateButtonText: 'Order on Rokomari',
    specs: {
      'Brand': 'VISION Official Partner',
      'Heat Power': 'Dual Setting: 1000W / 2000W',
      'Safety': 'Auto Overheat Cutoff & Safety Thermal Fuse',
      'Heating Coverage': '120 - 180 Sq. Ft.'
    },
    createdAt: '2026-10-10T14:30:00Z'
  },
  // Affiliate Product 8 - Rokomari (Jmary KP-2209 Multifunctional Professional Tripod)
  {
    id: 'prod-1792770499231',
    name: 'Jmary KP-2209 Multifunctional Professional Tripod',
    slug: 'jmary-kp-2209-multifunctional-professional-tripod',
    type: 'affiliate',
    category: 'Gadgets & Tech',
    price: 1889,
    originalPrice: 2600,
    discountPercent: 27,
    description: 'Jmary KP-2209 Multifunctional Professional Tripod features an adjustable height of 47–173 cm, a 360° rotating head, and a durable aluminum alloy construction. Ideal for mobile photography, video recording, vlogging, and overhead flat-lay shooting.',
    shortDescription: 'Adjustable 47–173 cm professional tripod with 360° pan head.',
    images: [
      'https://rokbucket.rokomari.io/ProductNew20190903/1104X1581/Jmary_KP_2209_Multifunctional_Profession-Jmary-cad72-466525.png'
    ],
    sku: 'ROK-KP2209',
    stock: 20,
    rating: 4.8,
    reviewsCount: 12,
    featured: true,
    status: 'active',
    affiliatePlatform: 'Rokomari',
    affiliateUrl: 'https://rkmri.co/5REomERo50N0/',
    affiliateButtonText: 'Order on Rokomari',
    specs: { 'Material': 'Aluminum Alloy', 'Max Load': '1 kg' },
    createdAt: '2026-10-23T15:48:19.231Z'
  },
  // Affiliate Product 9 - Rokomari (Ulanzi BG-3 Power Bank Handle 10000mAh)
  {
    id: 'prod-1792770729079',
    name: 'Ulanzi BG-3 Power Bank Handle 10000mAh',
    slug: 'ulanzi-bg-3-power-bank-handle-10000mah',
    type: 'affiliate',
    category: 'Gadgets & Tech',
    price: 3599,
    originalPrice: 4100,
    discountPercent: 12,
    description: 'Ulanzi BG-3 is a 10,000mAh power bank handle designed for cameras, smartphones, GoPro, and Insta360 action cameras. Features USB-C connectivity and 18W PD/QC 3.0 fast charging.',
    shortDescription: '10,000mAh camera handgrip with 18W PD/QC fast charging.',
    images: [
      'https://rokbucket.rokomari.io/ProductNew20190903/1104X1581/Ulanzi_BG_3_Power_Bank_Handle_10000_mAh_-Ulanzi-833fa-473539.png'
    ],
    sku: 'ROK-ULANZI-BG3',
    stock: 20,
    rating: 4.8,
    reviewsCount: 12,
    featured: false,
    status: 'active',
    affiliatePlatform: 'Rokomari',
    affiliateUrl: 'https://rkmri.co/AMRMAIeSem5N/',
    affiliateButtonText: 'Order on Rokomari',
    specs: { 'Battery Capacity': '10,000mAh', 'Output': '18W PD/QC 3.0' },
    createdAt: '2026-10-23T15:52:09.079Z'
  },
  // Affiliate Product 10 - Rokomari (Ulanzi ST-17 360° Rotatable Mobile Holder)
  {
    id: 'prod-1792770884998',
    name: 'Ulanzi ST-17 360° Rotatable Mobile Holder with Cold Shoe Mount',
    slug: 'ulanzi-st-17-360-rotatable-mobile-holder-with-cold-shoe-mount',
    type: 'affiliate',
    category: 'Gadgets & Tech',
    price: 709,
    originalPrice: 900,
    discountPercent: 21,
    description: 'Ulanzi ST-17 360° Rotatable Mobile Holder is designed for smartphones, tripods, and mobile video recording setups. Features an adjustable 55–100 mm phone clamp and integrated cold shoe mount.',
    shortDescription: '360° rotation smartphone clamp with integrated cold shoe mount.',
    images: [
      'https://rokbucket.rokomari.io/ProductNew20190903/1104X1581/Ulanzi_ST_17_360_Rotatable_Mobile_Holder-Ulanzi-218b6-467399.png'
    ],
    sku: 'ROK-ULANZI-ST17',
    stock: 20,
    rating: 4.8,
    reviewsCount: 12,
    featured: false,
    status: 'active',
    affiliatePlatform: 'Rokomari',
    affiliateUrl: 'https://rkmri.co/eeeAIAeelmy2/',
    affiliateButtonText: 'Order on Rokomari',
    specs: { 'Clamp Width': '55–100 mm', 'Mount': '1/4"-20 & Cold Shoe' },
    createdAt: '2026-10-23T15:54:44.998Z'
  },
  // Affiliate Product 11 - Rokomari (Jmary KP-2205 Tripod Stand)
  {
    id: 'prod-1792771045463',
    name: 'Jmary KP-2205 Tripod Stand for Camera and Mobile',
    slug: 'jmary-kp-2205-tripod-stand-for-camera-and-mobile',
    type: 'affiliate',
    category: 'Gadgets & Tech',
    price: 1459,
    originalPrice: 1800,
    discountPercent: 19,
    description: 'Jmary KP-2205 Tripod Stand is designed for mobile photography, vlogging, and video recording. Features an adjustable height of 39.5–134 cm and 3-way pan head.',
    shortDescription: 'Compact 39.5–134 cm lightweight tripod with mobile holder included.',
    images: [
      'https://rokbucket.rokomari.io/ProductNew20190903/1104X1581/Jmary_KP_2205_Tripod_Stand_for_Camera_an-Jmary-968af-473689.png'
    ],
    sku: 'ROK-JMARY-KP2205',
    stock: 20,
    rating: 4.8,
    reviewsCount: 12,
    featured: false,
    status: 'active',
    affiliatePlatform: 'Rokomari',
    affiliateUrl: 'https://rkmri.co/NM0SMeMMRIAp/',
    affiliateButtonText: 'Order on Rokomari',
    specs: { 'Height': '39.5–134 cm', 'Load Capacity': '2 kg' },
    createdAt: '2026-10-23T15:57:25.463Z'
  },
  // Affiliate Product 12 - Rokomari (COTECi OF-026-WH Magic Crystal IV Wireless Mouse)
  {
    id: 'prod-1792771229499',
    name: 'COTECi OF-026-WH Magic Crystal IV Wireless & Bluetooth Mouse',
    slug: 'coteci-of-026-wh-magic-crystal-iv-wireless-bluetooth-mouse',
    type: 'affiliate',
    category: 'Gadgets & Tech',
    price: 1599,
    originalPrice: 2000,
    discountPercent: 20,
    description: 'The COTECi OF-026-WH Magic Crystal IV Mouse features dual-mode wireless connectivity through Bluetooth and 2.4GHz USB. Includes optical sensor and rechargeable battery.',
    shortDescription: 'Dual-mode Bluetooth & 2.4G rechargeable mouse with crystal design.',
    images: [
      'https://rokbucket.rokomari.io/ProductNew20190903/1104X1581/COTECi_OF_026_WH_Magic_Crystal_IV_Wirele-Coteci-57560-509200.png'
    ],
    sku: 'ROK-COTECI-OF026',
    stock: 20,
    rating: 4.8,
    reviewsCount: 12,
    featured: false,
    status: 'active',
    affiliatePlatform: 'Rokomari',
    affiliateUrl: 'https://rkmri.co/eAe5MSNMl33I/',
    affiliateButtonText: 'Order on Rokomari',
    specs: { 'Connectivity': 'Bluetooth + 2.4GHz', 'Battery': 'Rechargeable' },
    createdAt: '2026-10-23T16:00:29.499Z'
  },
  // Affiliate Product 13 - Rokomari (WiWU WM105 Crystal Transparent Wireless Mouse)
  {
    id: 'prod-1792771525359',
    name: 'WiWU WM105 Crystal Transparent Wireless Mouse 2.4G',
    slug: 'wiwu-wm105-crystal-transparent-wireless-mouse-2-4g',
    type: 'affiliate',
    category: 'Gadgets & Tech',
    price: 1369,
    originalPrice: 1600,
    discountPercent: 14,
    description: 'The WiWU WM105 Crystal Transparent Wireless Mouse features dual-mode connectivity with Bluetooth 5.1 and 2.4GHz USB receiver. Features a transparent magnetic cover and rechargeable 400mAh battery.',
    shortDescription: 'Transparent magnetic cover dual-mode mouse with adjustable DPI.',
    images: [
      'https://rokbucket.rokomari.io/ProductNew20190903/1104X1581/Wiwu_Crystal_Transparent_Wireless_Mouse_-Wiwu-aac68-355133.png'
    ],
    sku: 'ROK-WIWU-WM105',
    stock: 20,
    rating: 4.8,
    reviewsCount: 12,
    featured: false,
    status: 'active',
    affiliatePlatform: 'Rokomari',
    affiliateUrl: 'https://rkmri.co/3TeTeeoNR2o0/',
    affiliateButtonText: 'Order on Rokomari',
    specs: { 'DPI': '800 - 2400', 'Battery': '400mAh Rechargeable' },
    createdAt: '2026-10-23T16:05:25.359Z'
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-001',
    title: 'Festive Grand Collection',
    subtitle: 'Experience handcrafted luxury leather, curated fashion & instant Cash on Delivery nationwide.',
    badge: 'KOTLIVER EXCLUSIVE',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    targetUrl: '#products-section',
    placement: 'hero_slider',
    sortOrder: 1,
    isActive: true,
    buttonText: 'Shop Direct Collection'
  },
  {
    id: 'ban-002',
    title: 'Curated Daraz & Rokomari Deals',
    subtitle: 'Save time and money! We hand-select genuine electronics and bestselling books with verified partner guarantees.',
    badge: 'VERIFIED AFFILIATE DEALS',
    imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1600&q=80',
    targetUrl: '#affiliate-section',
    placement: 'hero_slider',
    sortOrder: 2,
    isActive: true,
    buttonText: 'Explore Partner Picks'
  },
  {
    id: 'ban-003',
    title: 'Smart Tech & Minimal Living',
    subtitle: 'Upgrade your daily productivity with AMOLED smart gear, workspace essentials and lifestyle gadgets.',
    badge: 'TRENDING 2026',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80',
    targetUrl: '#products-section',
    placement: 'hero_slider',
    sortOrder: 3,
    isActive: true,
    buttonText: 'View Gadgets'
  },
  {
    id: 'ban-mid-001',
    title: '100% Genuine Guarantee & Easy COD',
    subtitle: 'Order directly with complete peace of mind. Pay when your parcel arrives at your doorstep.',
    badge: 'TRUSTED SERVICE',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80',
    targetUrl: '#products-section',
    placement: 'homepage_mid',
    sortOrder: 4,
    isActive: true,
    buttonText: 'Explore Collection'
  }
];

export const INITIAL_AD_PLACEMENTS: AdPlacement[] = [
  {
    id: 'ad-header',
    name: 'Header Top Leaderboard',
    location: 'header_top',
    format: '728x90',
    adCode: '<!-- Adsterra Header Ad Slot 728x90 (Configured via Admin) -->\n<div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px dashed #10b981; border-radius: 8px; padding: 12px; text-align: center; color: #065f46; font-size: 13px; font-weight: 500;">Sponsored Partner Space &bull; Adsterra Verified Placement (728x90)</div>',
    isActive: true,
    notes: 'Displays above or right beneath top promotional banner on desktop screens.',
    bannerPlaceholderText: 'Adsterra 728x90 Header Ad Placement'
  },
  {
    id: 'ad-homepage',
    name: 'Homepage Mid-Feed Banner',
    location: 'homepage_infeed',
    format: 'responsive_native',
    adCode: '<!-- Adsterra Mid-Feed Native Ad Slot -->\n<div style="background: #f8fafc; border: 1px dashed #94a3b8; border-radius: 8px; padding: 18px; text-align: center; color: #475569; font-size: 13px;">Sponsored Partner Showcase &bull; Adsterra Responsive Native Ad Placement</div>',
    isActive: true,
    notes: 'Embedded between Featured Categories and Products without interrupting product shopping flow.',
    bannerPlaceholderText: 'Adsterra Native In-Feed Placement'
  },
  {
    id: 'ad-sidebar',
    name: 'Product Details Sidebar',
    location: 'sidebar',
    format: '300x250',
    adCode: '<!-- Adsterra 300x250 Sidebar Slot -->\n<div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 24px 12px; text-align: center; color: #64748b; font-size: 12px;">Recommended Partner Sponsor &bull; Adsterra 300x250 Rectangle</div>',
    isActive: true,
    notes: 'Placed in the sidebar or below product specifications. Guarded from checkout/cart.',
    bannerPlaceholderText: 'Adsterra 300x250 Sidebar Banner'
  },
  {
    id: 'ad-footer',
    name: 'Footer Leaderboard Banner',
    location: 'footer',
    format: '728x90',
    adCode: '<!-- Adsterra Footer 728x90 Banner -->\n<div style="background: #1e293b; border: 1px dashed #64748b; border-radius: 8px; padding: 14px; text-align: center; color: #cbd5e1; font-size: 12px;">Adsterra Footer Banner Slot &bull; Clean Non-Intrusive Display</div>',
    isActive: true,
    notes: 'Displayed above the footer links.',
    bannerPlaceholderText: 'Adsterra Footer 728x90 Banner'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'KC-2026-9140',
    customerName: 'Tanvir Hossain',
    customerPhone: '01711223344',
    customerEmail: 'tanvir.h@example.com',
    deliveryAddress: 'House 14, Road 7, Sector 3, Uttara, Dhaka',
    deliveryZone: 'Inside City (৳60)',
    deliveryFee: 60,
    orderNotes: 'Please call before delivery in the afternoon.',
    items: [
      {
        productId: 'prod-kc-001',
        name: 'Kotliver Signature Top-Grain Leather Bi-Fold Wallet',
        price: 1450,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
        sku: 'KC-WAL-001'
      }
    ],
    subtotal: 1450,
    total: 1510,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    status: 'Processing',
    createdAt: '2026-10-12T14:22:00Z',
    statusTimeline: [
      { status: 'Pending', timestamp: '2026-10-12T14:22:00Z', note: 'Order placed by customer via Cash on Delivery' },
      { status: 'Confirmed', timestamp: '2026-10-12T15:00:00Z', note: 'Customer confirmed order by phone' },
      { status: 'Processing', timestamp: '2026-10-13T09:30:00Z', note: 'Packaging at Kotliver warehouse' }
    ]
  },
  {
    id: 'ord-102',
    orderNumber: 'KC-2026-8872',
    customerName: 'Farhana Ahmed',
    customerPhone: '01819556677',
    customerEmail: 'farhana.a@example.com',
    deliveryAddress: 'Apartment 4B, Green Villa, Dhanmondi 27, Dhaka',
    deliveryZone: 'Inside City (৳60)',
    deliveryFee: 60,
    orderNotes: 'Leave with security guard if not available.',
    items: [
      {
        productId: 'prod-kc-003',
        name: 'Kotliver Minimalist Hand-Poured Soy Wax Scented Candle Set',
        price: 890,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
        sku: 'KC-HME-108'
      }
    ],
    subtotal: 1780,
    total: 1840,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    status: 'Pending',
    createdAt: '2026-10-14T08:15:00Z',
    statusTimeline: [
      { status: 'Pending', timestamp: '2026-10-14T08:15:00Z', note: 'Awaiting phone verification' }
    ]
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  storeName: 'Kotliver Collection',
  tagline: 'Everything You Love, All in One Place.',
  contactPhone: '+880 1700-123456',
  contactEmail: 'support@kotliver.com',
  whatsappNumber: '+880 1700-123456',
  address: 'Gulshan 2, Dhaka 1212, Bangladesh',
  currency: '৳',
  insideCityDeliveryFee: 60,
  outsideCityDeliveryFee: 120,
  affiliateDisclosure: 'Affiliate Transparency Disclosure: Kotliver Collection is an independent curated marketplace. Some links on this website are affiliate links with approved partners including Daraz and Rokomari. When you click these links and purchase items on partner platforms, we may earn an affiliate commission at no additional cost to you. All direct Kotliver items are dispatched directly by us with Cash on Delivery.',
  bKashMerchantNumber: '01700123456 (Merchant - In Preparation)',
  nagadMerchantNumber: '01800123456 (Merchant - In Preparation)',
  socialLinks: {
    facebook: 'https://facebook.com/kotlivercollection',
    instagram: 'https://instagram.com/kotlivercollection',
    youtube: 'https://youtube.com/@kotlivercollection'
  }
};
