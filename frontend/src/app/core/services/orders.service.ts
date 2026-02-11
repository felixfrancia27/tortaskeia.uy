import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
  subtotal: number;
  notes: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_type: 'delivery' | 'pickup';
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_date: string | null;
  delivery_time_slot: string | null;
  notes: string | null;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string | null;
  payment_status: string | null;
  items: OrderItem[];
  created_at: string;
}

export type OrderStatus = 
  | 'creada'
  | 'pagando'
  | 'pagada'
  | 'fallida'
  | 'en_preparacion'
  | 'lista'
  | 'entregada'
  | 'cancelada';

export interface CreateOrderData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_type: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_city?: string;
  delivery_date?: string;
  delivery_time_slot?: string;
  notes?: string;
}

export interface PaymentPreference {
  preference_id: string;
  init_point: string;
}

export interface PaymentStatus {
  order_number: string;
  status: OrderStatus;
  payment_status: string | null;
  payment_method: string | null;
}

export interface DayAvailability {
  reserved: number;
  capacity: number;
}

export interface AvailabilityResponse {
  dates: Record<string, DayAvailability>;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private api = inject(ApiService);

  /** Disponibilidad por día (reservado/capacidad). Máx 2 tortas por día. */
  getAvailability(fromDate: string, toDate: string): Observable<AvailabilityResponse> {
    return this.api.get<AvailabilityResponse>('/orders/availability', {
      from_date: fromDate,
      to_date: toDate,
    });
  }

  createOrder(data: CreateOrderData): Observable<Order> {
    return this.api.post<Order>('/orders', data);
  }

  getOrder(orderNumber: string): Observable<Order> {
    return this.api.get<Order>(`/orders/${orderNumber}`);
  }

  getMyOrders(): Observable<Order[]> {
    return this.api.get<Order[]>('/orders');
  }

  createPaymentPreference(orderNumber: string): Observable<PaymentPreference> {
    return this.api.post<PaymentPreference>(`/payments/preference/${orderNumber}`, {});
  }

  getPaymentStatus(orderNumber: string): Observable<PaymentStatus> {
    return this.api.get<PaymentStatus>(`/payments/status/${orderNumber}`);
  }

  // Check if order can be paid
  canPay(order: Order): boolean {
    return ['creada', 'fallida'].includes(order.status);
  }

  // Check if order is completed
  isCompleted(order: Order): boolean {
    return ['pagada', 'en_preparacion', 'lista', 'entregada'].includes(order.status);
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      creada: 'Creada',
      pagando: 'Procesando pago',
      pagada: 'Pagada',
      fallida: 'Pago fallido',
      en_preparacion: 'En preparación',
      lista: 'Lista para entregar',
      entregada: 'Entregada',
      cancelada: 'Cancelada',
    };
    return labels[status] || status;
  }

  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      creada: '#6366F1',
      pagando: '#F59E0B',
      pagada: '#10B981',
      fallida: '#EF4444',
      en_preparacion: '#3B82F6',
      lista: '#EC4899',
      entregada: '#10B981',
      cancelada: '#6B7280',
    };
    return colors[status] || '#6B7280';
  }
}
