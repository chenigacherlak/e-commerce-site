export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  discount_price: number | null;
  stock: number;
  sku: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  featured: boolean;
  vendor_id: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  tax_amount: number;
  shipping_cost: number;
  subtotal: number;
  shipping_address: string;
  billing_address: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  subtotal: number;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  payment_method: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
  transaction_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  room_type: 'direct' | 'group';
  created_by: string;
  is_active: boolean;
  last_message_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  file_url: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'order' | 'message' | 'promotion' | 'system' | 'review';
  related_id: string | null;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  created_at: string;
  user?: {
    username: string;
    avatar_url: string | null;
  };
}
