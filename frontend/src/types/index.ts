export interface User {
  user_id: number;
  name: string;
  email: string;
  role: 'customer' | 'restaurant_admin' | 'delivery' | 'admin';
  phone?: string;
  profile_image_url?: string;
  auth_provider: 'local' | 'google';
}

export interface Cuisine {
  cuisine_id: number;
  name: string;
  image_url?: string;
}

export interface Restaurant {
  restaurant_id: number;
  owner_id: number;
  name: string;
  description?: string;
  phone: string;
  address: string;
  cover_image_url?: string;
  logo_url?: string;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  avg_rating: number;
  delivery_time_mins: number;
  cuisines?: string[];
  cuisine_ids?: number[];
}

export interface MenuItem {
  item_id: number;
  restaurant_id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_veg: boolean;
  variants?: MenuItemVariant[];
  addons?: MenuItemAddon[];
}

export interface MenuCategory {
  category_id: number;
  restaurant_id: number;
  name: string;
  sort_order: number;
  items: MenuItem[];
}

export interface CartItem {
  cart_item_id: number;
  quantity: number;
  item_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_veg: boolean;
  is_available: boolean;
  restaurant_id: number;
  restaurant_name: string;
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

export interface Cart {
  cart_id: number;
  restaurant?: {
    restaurant_id: number;
    name: string;
    delivery_time_mins: number;
  };
  items: CartItem[];
  summary: CartSummary;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  price_at_order_time: number;
  name: string;
  image_url?: string;
  selected_variant?: string;
  selected_addons?: string;
}

export interface Order {
  order_id: number;
  customer_id: number;
  customer_name?: string;
  customer_phone?: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_phone?: string;
  restaurant_address?: string;
  restaurant_image?: string;
  delivery_person_id?: number;
  delivery_driver_name?: string;
  delivery_driver_phone?: string;
  vehicle_type?: string;
  license_plate?: string;
  delivery_address: string;
  order_status: 'Placed' | 'Accepted' | 'Preparing' | 'Ready for Pickup' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  subtotal_amount: number;
  tax_amount: number;
  delivery_fee: number;
  total_amount: number;
  notes?: string;
  payment_method?: string;
  payment_status?: string;
  transaction_ref?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
  review?: {
    rating: number;
    comment?: string;
  };
  discount_amount?: number;
  coupon_code?: string;
}

export interface DbQueryMeta {
  id: number;
  title: string;
  description: string;
  sql: string;
}

export interface DbQueryResult {
  meta?: DbQueryMeta;
  sql: string;
  rowCount: number;
  executionTimeMs: number;
  rows: Record<string, any>[];
}

export interface MenuItemVariant {
  variant_id: number;
  item_id?: number;
  name: string;
  price_adjustment: number;
}

export interface MenuItemAddon {
  addon_id: number;
  item_id?: number;
  name: string;
  price: number;
}

export interface Coupon {
  coupon_id?: number;
  code: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  discount_amount?: number;
  min_order_amount?: number;
  expiry_date?: string;
  is_active?: boolean;
  [key: string]: any;
}


export interface AcidSimulateResult {
  outcome: 'COMMITTED' | 'ROLLED_BACK';
  message: string;
  audit: {
    orphan_records_prevented: boolean;
    before: {
      orders: number;
      order_items: number;
      payments: number;
    };
    after: {
      orders: number;
      order_items: number;
      payments: number;
    };
    net_change: {
      orders: number;
      order_items: number;
      payments: number;
    };
  };
  logs: {
    step: number;
    name: string;
    sql: string;
    details: string;
    status: string;
  }[];
}
