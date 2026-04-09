export interface User {
  id: string;
  phoneNumber: string;
  displayName?: string;
  email?: string;
  role: 'customer' | 'admin';
  address?: Address;
  createdAt: Date;
}

export interface Address {
  province: string;
  district: string;
  khoroo: string;
  detailedAddress: string;
}

export interface Product {
  id: string;
  name: {
    en: string;
    mn: string;
  };
  description: {
    en: string;
    mn: string;
  };
  price: number;
  category: string;
  images: string[];
  inStock: boolean;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: Address;
  paymentProof?: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'payment_verified'
  | 'in_production'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Category {
  id: string;
  name: {
    en: string;
    mn: string;
  };
  slug: string;
  image?: string;
}

export interface Service {
  id: string;
  name: {
    en: string;
    mn: string;
  };
  description: {
    en: string;
    mn: string;
  };
  image: string;
  features: string[];
  visible: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: {
    en: string;
    mn: string;
  };
  userId?: string;
  customerName: string;
  phoneNumber: string;
  email?: string;
  message: string;
  status: 'pending' | 'contacted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
