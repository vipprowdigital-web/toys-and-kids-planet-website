// ─────────────────────────────────────────────
// Backend-aligned Types
// These match the Mongoose schemas in the API.
// ─────────────────────────────────────────────

export interface CloudinaryImage {
  url: string;
  publicId: string;
}

/** Matches ProductCategory Mongoose model */
export interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;   // e.g. "🎓", "🧱"
  color: string;  // Tailwind class e.g. "bg-teal", "bg-coral"
  image: CloudinaryImage;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  _id?: string;
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  discountPrice?: number;
  isAvailable: boolean;
}

export interface ProductSpecifications {
  material?: string;
  batteryRequired?: boolean;
  batteryType?: string;
  dimensions?: string;
  weight?: string;
  safetyStandards?: string[];
  includedItems?: string[];
}

/** Matches Product Mongoose model */
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  /** Populated as a ProductCategory object, or a string ObjectId */
  category: ProductCategory | string;
  ageGroup: "0-2" | "3-5" | "6-8" | "9-12" | "13+" | "all";
  images: CloudinaryImage[];
  price: number;
  originalPrice: number | null;
  discount: number;
  specifications?: ProductSpecifications;
  variants?: ProductVariant[];
  rating: number;
  reviewCount: number;
  badge: string | null;
  inStock: boolean;
  stockQuantity: number;
  soldCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

// ─────────────────────────────────────────────
// UI / Frontend-Only Types
// ─────────────────────────────────────────────

export interface AgeGroup {
  id: string;
  label: string;
  slug: string;
  description: string;
  image: string;
  emoji: string;
  color: string;
  borderColor: string;
  productCount: number;
}

export interface Review {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  review: string;
  product: string;
  date: string;
}

/** Matches the backend Review mongoose model */
export interface ProductReview {
  _id: string;
  product: string | { _id: string; name: string; slug: string };
  customer: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  title?: string;
  body: string;
  verified: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhyChooseItem {
  icon: string;
  title: string;
  description: string;
  color: string;
  bg: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
}

export interface NavLink {
  label: string;
  href: string;
}

// ─────────────────────────────────────────────
// Auth Types
// ─────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─────────────────────────────────────────────
// Blog Types
// ─────────────────────────────────────────────

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  category?: BlogCategory | string;
  thumbnail: CloudinaryImage;
  gallery_images?: CloudinaryImage[];
  video_link?: string;
  read_time?: string;
  short_description?: string;
  description?: string;
  isActive: boolean;
  isFeature: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// App Config Types
// ─────────────────────────────────────────────

export interface CompanyAddress {
  address: string;
  googleMapLocation?: string;
}

export interface SocialLinks {
  facebookLink?: string;
  instagramLink?: string;
  twitterLink?: string;
  youtubeLink?: string;
  whatsAppLink?: string;
  googleFormLink?: string;
  linkedinLink?: string;
}

export interface AppStoreLinks {
  googleAppStoreLink?: string;
  appleAppStoreLink?: string;
}

export interface AppConfig {
  _id: string;
  appName: string;
  phoneNumber: string;
  email: string;
  companyAddress?: CompanyAddress[];
  facebookLink?: string;
  instagramLink?: string;
  twitterLink?: string;
  youtubeLink?: string;
  whatsAppLink?: string;
  linkedinLink?: string;
  googleFormLink?: string;
  googleAppStoreLink?: string;
  appleAppStoreLink?: string;
  createdAt: string;
  updatedAt: string;
}
