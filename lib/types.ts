export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
};

export type ProductVariant = {
  id: string;
  productId: string;
  size?: string; // e.g. "0", "1", "2", "3", "4", "5", "6"
  colour?: string; // e.g. "Yellow", "Pink", "Blue", "Red"
  price: number; // in rupees
  discountPrice?: number;
  stock: number;
};

export type ProductImage = {
  id: string;
  productId: string;
  imageUrl: string;
  displayOrder: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  description: string;
  material?: string;
  featured: boolean;
  isActive: boolean;
  badge?: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  variants: ProductVariant[];
  collectionSlugs: string[];
  createdAt: string;
};

export type CartItem = {
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  size?: string;
  colour?: string;
  price: number;
  quantity: number;
  maxStock: number;
};

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus = "Pending" | "Paid" | "Failed";

export type OrderItem = {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  size?: string;
  colour?: string;
  price: number;
  quantity: number;
  image: string;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
};
