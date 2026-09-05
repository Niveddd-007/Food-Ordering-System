import { User, Restaurant, Cuisine, MenuCategory, Cart, Order, DbQueryMeta, DbQueryResult } from '../types';

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API Request Failed');
  }
  return data;
}

export const api = {
  // Auth
  register: (userData: any) => request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials: any) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  googleAuth: (payload: any) => request<{ token: string; user: User }>('/auth/google', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request<User>('/auth/me'),
  updateProfile: (profile: any) => request<User>('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  // Restaurants & Cuisines
  getCuisines: () => request<Cuisine[]>('/cuisines'),
  getRestaurants: (params?: { search?: string; cuisine_id?: number; sort_by?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.cuisine_id) query.append('cuisine_id', params.cuisine_id.toString());
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    return request<Restaurant[]>(`/restaurants?${query.toString()}`);
  },
  getRestaurantDetails: (id: number) => request<{ restaurant: Restaurant; categories: MenuCategory[]; reviews: any[] }>(`/restaurants/${id}`),

  // Cart
  getCart: () => request<Cart>('/cart'),
  addToCart: (item_id: number, quantity: number = 1) => request<{ message: string }>('/cart/add', { method: 'POST', body: JSON.stringify({ item_id, quantity }) }),
  updateCartItem: (cart_item_id: number, quantity: number) => request<{ message: string }>('/cart/update', { method: 'PUT', body: JSON.stringify({ cart_item_id, quantity }) }),
  removeCartItem: (cart_item_id: number) => request<{ message: string }>(`/cart/remove/${cart_item_id}`, { method: 'DELETE' }),
  clearCart: () => request<{ message: string }>('/cart/clear', { method: 'DELETE' }),

  // Orders
  placeOrder: (orderData: { delivery_address: string; payment_method: string; notes?: string }) =>
    request<{ message: string; order_id: number; total_amount: number; transaction_ref: string }>('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrderHistory: () => request<Order[]>('/orders/history'),
  getOrderDetails: (id: number) => request<Order>(`/orders/${id}`),
  reorder: (id: number) => request<{ message: string }>(`/orders/${id}/reorder`, { method: 'POST' }),

  // Admin & Restaurant Owner
  getAdminDashboard: () => request<{ restaurant: Restaurant; stats: any; activeOrders: Order[]; topItems: any[] }>('/admin/dashboard'),
  updateOrderStatus: (orderId: number, status: string) => request<{ message: string; new_status: string }>(`/admin/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAdminMenu: () => request<{ items: any[]; categories: any[]; restaurant_id: number }>('/admin/menu'),
  addMenuItem: (item: any) => request<{ message: string; item_id: number }>('/admin/menu', { method: 'POST', body: JSON.stringify(item) }),
  updateMenuItem: (id: number, item: any) => request<{ message: string }>(`/admin/menu/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  deleteMenuItem: (id: number) => request<{ message: string }>(`/admin/menu/${id}`, { method: 'DELETE' }),

  // Delivery
  getAssignedDeliveries: () => request<{ driver: any; orders: Order[] }>('/delivery/assigned'),
  updateDeliveryStatus: (orderId: number, status: string) => request<{ message: string; new_status: string }>(`/delivery/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Reviews & Favorites
  submitReview: (reviewData: { order_id: number; rating: number; comment?: string }) =>
    request<{ message: string; updated_restaurant_rating: number }>('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),
  getFavorites: () => request<Restaurant[]>('/favorites'),
  toggleFavorite: (restaurant_id: number) => request<{ is_favorite: boolean; message: string }>('/favorites/toggle', { method: 'POST', body: JSON.stringify({ restaurant_id }) }),

  // DBMS SQL Showcase
  getDbQueries: () => request<DbQueryMeta[]>('/db/queries'),
  runDbQuery: (payload: { query_id?: number; custom_sql?: string }) => request<DbQueryResult>('/db/queries/run', { method: 'POST', body: JSON.stringify(payload) }),
};
