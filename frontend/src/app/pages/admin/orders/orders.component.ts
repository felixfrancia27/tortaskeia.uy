import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';
import { ApiService } from '@app/core/services/api.service';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  total: number;
  delivery_type: string;
  created_at: string;
  items: { product_name: string; quantity: number }[];
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent, CurrencyPipe, DatePipe],
  template: `
    <app-admin-layout>
      <div class="orders-page">
        <header class="page-header">
          <div>
            <h1>Órdenes</h1>
            <p>Gestiona los pedidos de clientes</p>
          </div>
          <div class="filters">
            <select [(ngModel)]="statusFilter" (change)="loadOrders()" class="input">
              <option value="">Todos los estados</option>
              <option value="creada">Creada</option>
              <option value="pagada">Pagada</option>
              <option value="en_preparacion">En preparación</option>
              <option value="lista">Lista</option>
              <option value="entregada">Entregada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </header>

        @if (loading()) {
          <div class="loading">Cargando órdenes...</div>
        } @else {
          <div class="orders-list">
            @for (order of orders(); track order.id) {
              <div class="order-card">
                <div class="order-header">
                  <div class="order-number">
                    <strong>{{ order.order_number }}</strong>
                    <span class="order-date">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <span class="status-badge" [attr.data-status]="order.status">
                    {{ getStatusLabel(order.status) }}
                  </span>
                </div>
                
                <div class="order-body">
                  <div class="customer-info">
                    <p><strong>{{ order.customer_name }}</strong></p>
                    <p>{{ order.customer_email }}</p>
                    <p>{{ order.customer_phone }}</p>
                  </div>
                  
                  <div class="order-items">
                    @for (item of order.items; track item.product_name) {
                      <span class="item">{{ item.quantity }}x {{ item.product_name }}</span>
                    }
                  </div>
                  
                  <div class="order-total">
                    <span class="delivery-type">{{ order.delivery_type === 'delivery' ? 'Delivery' : 'Retiro' }}</span>
                    <strong>{{ order.total | currency:'UYU':'$':'1.0-0' }}</strong>
                  </div>
                </div>
                
                <div class="order-actions">
                  <select 
                    [value]="order.status" 
                    (change)="updateStatus(order, $event)"
                    class="status-select"
                  >
                    <option value="creada">Creada</option>
                    <option value="pagando">Pagando</option>
                    <option value="pagada">Pagada</option>
                    <option value="en_preparacion">En preparación</option>
                    <option value="lista">Lista para entregar</option>
                    <option value="entregada">Entregada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <p>No hay órdenes {{ statusFilter ? 'con este estado' : '' }}</p>
              </div>
            }
          </div>
        }
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .orders-page {
      max-width: 900px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
      flex-wrap: wrap;
      gap: var(--space-4);

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        color: var(--ink);
        margin-bottom: var(--space-1);
      }

      p {
        color: var(--ink-light);
        font-size: var(--text-sm);
      }
    }

    .input {
      padding: var(--space-2) var(--space-3);
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);

      &:focus {
        outline: none;
        border-color: var(--brand);
      }
    }

    .loading {
      text-align: center;
      padding: var(--space-8);
      color: var(--ink-light);
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .order-card {
      background: white;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4);
      background-color: #F9FAFB;
      border-bottom: 1px solid #E5E7EB;
    }

    .order-number {
      strong {
        font-size: var(--text-base);
        color: var(--ink);
      }

      .order-date {
        display: block;
        font-size: var(--text-xs);
        color: var(--ink-muted);
        margin-top: 2px;
      }
    }

    .status-badge {
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;

      &[data-status="creada"] {
        background-color: #E0E7FF;
        color: #3730A3;
      }

      &[data-status="pagando"] {
        background-color: #FEF3C7;
        color: #92400E;
      }

      &[data-status="pagada"] {
        background-color: #D1FAE5;
        color: #065F46;
      }

      &[data-status="en_preparacion"] {
        background-color: #DBEAFE;
        color: #1E40AF;
      }

      &[data-status="lista"] {
        background-color: #FCE7F3;
        color: #9D174D;
      }

      &[data-status="entregada"] {
        background-color: #D1FAE5;
        color: #065F46;
      }

      &[data-status="cancelada"],
      &[data-status="fallida"] {
        background-color: #FEE2E2;
        color: #991B1B;
      }
    }

    .order-body {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: var(--space-4);
      padding: var(--space-4);
      align-items: center;

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .customer-info {
      p {
        font-size: var(--text-sm);
        color: var(--ink-light);
        margin-bottom: 2px;

        strong {
          color: var(--ink);
        }
      }
    }

    .order-items {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);

      .item {
        padding: var(--space-1) var(--space-2);
        background-color: var(--surface);
        border-radius: var(--radius-sm);
        font-size: var(--text-xs);
        color: var(--ink);
      }
    }

    .order-total {
      text-align: right;

      .delivery-type {
        display: block;
        font-size: var(--text-xs);
        color: var(--ink-muted);
        margin-bottom: 2px;
      }

      strong {
        font-size: var(--text-lg);
        color: var(--brand);
      }
    }

    .order-actions {
      padding: var(--space-3) var(--space-4);
      background-color: #F9FAFB;
      border-top: 1px solid #E5E7EB;
    }

    .status-select {
      padding: var(--space-2) var(--space-3);
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: var(--brand);
      }
    }

    .empty-state {
      text-align: center;
      padding: var(--space-8);
      background: white;
      border-radius: var(--radius-xl);
      color: var(--ink-light);
    }
  `],
})
export class AdminOrdersComponent implements OnInit {
  private api = inject(ApiService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  statusFilter = '';

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    
    const params: Record<string, string> = {};
    if (this.statusFilter) {
      params['status_filter'] = this.statusFilter;
    }

    this.api.get<Order[]>('/admin/orders', params).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        // Mock data
        this.orders.set([
          {
            id: 1,
            order_number: 'TK-ABC12345',
            customer_name: 'María García',
            customer_email: 'maria@email.com',
            customer_phone: '099 123 456',
            status: 'pagada',
            total: 2550,
            delivery_type: 'delivery',
            created_at: new Date().toISOString(),
            items: [
              { product_name: 'Torta de Chocolate', quantity: 1 },
              { product_name: 'Cupcakes x6', quantity: 2 },
            ],
          },
          {
            id: 2,
            order_number: 'TK-DEF67890',
            customer_name: 'Juan Pérez',
            customer_email: 'juan@email.com',
            customer_phone: '098 765 432',
            status: 'en_preparacion',
            total: 1800,
            delivery_type: 'pickup',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            items: [
              { product_name: 'Torta Personalizada Floral', quantity: 1 },
            ],
          },
          {
            id: 3,
            order_number: 'TK-GHI11111',
            customer_name: 'Ana López',
            customer_email: 'ana@email.com',
            customer_phone: '099 111 222',
            status: 'creada',
            total: 950,
            delivery_type: 'delivery',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            items: [
              { product_name: 'Box Dulce Sorpresa', quantity: 1 },
            ],
          },
        ]);
        this.loading.set(false);
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      creada: 'Creada',
      pagando: 'Pagando',
      pagada: 'Pagada',
      fallida: 'Fallida',
      en_preparacion: 'En preparación',
      lista: 'Lista',
      entregada: 'Entregada',
      cancelada: 'Cancelada',
    };
    return labels[status] || status;
  }

  updateStatus(order: Order, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value;
    
    this.api.put(`/admin/orders/${order.id}/status`, { status: newStatus }).subscribe({
      next: () => {
        this.orders.update(list =>
          list.map(o => o.id === order.id ? { ...o, status: newStatus } : o)
        );
      },
      error: () => {
        // Mock: update locally anyway
        this.orders.update(list =>
          list.map(o => o.id === order.id ? { ...o, status: newStatus } : o)
        );
      },
    });
  }
}
