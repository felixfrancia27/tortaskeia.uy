import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';
import { ApiService } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';

interface DashboardStats {
  total_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  total_users: number;
}

interface OrderSummary {
  id: number;
  order_number: string;
  customer_name: string;
  status: string;
  total: number;
  created_at: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminLayoutComponent, CurrencyPipe, DatePipe],
  template: `
    <app-admin-layout>
      <div class="dashboard">
        <header class="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Hola{{ adminName() ? ', ' + adminName() : '' }}. Acá tenés el resumen y todas las herramientas del panel.</p>
          </div>
        </header>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon products">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats().total_products }}</span>
              <span class="stat-label">Productos</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon orders">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats().total_orders }}</span>
              <span class="stat-label">Órdenes totales</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon pending">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats().pending_orders }}</span>
              <span class="stat-label">Órdenes pendientes</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon revenue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats().total_revenue | currency:'UYU':'$':'1.0-0' }}</span>
              <span class="stat-label">Ingresos totales</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon users">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats().total_users }}</span>
              <span class="stat-label">Usuarios</span>
            </div>
          </div>
        </div>

        <div class="tools-section">
          <h2>Herramientas administrativas</h2>
          <p class="section-desc">Accedé a cada sección del panel desde acá.</p>
          <div class="tools-grid">
            <a routerLink="/admin/productos" class="tool-card">
              <span class="tool-icon products">📦</span>
              <div class="tool-body">
                <h3>Productos</h3>
                <p>Listar, crear y editar productos de la tienda.</p>
              </div>
              <span class="tool-arrow">→</span>
            </a>
            <a routerLink="/admin/productos/nuevo" class="tool-card highlight">
              <span class="tool-icon new">➕</span>
              <div class="tool-body">
                <h3>Nuevo producto</h3>
                <p>Agregar un producto nuevo al catálogo.</p>
              </div>
              <span class="tool-arrow">→</span>
            </a>
            <a routerLink="/admin/categorias" class="tool-card">
              <span class="tool-icon categories">🏷️</span>
              <div class="tool-body">
                <h3>Categorías</h3>
                <p>Gestionar categorías (Tortas, Boxes, etc.).</p>
              </div>
              <span class="tool-arrow">→</span>
            </a>
            <a routerLink="/admin/diseños" class="tool-card">
              <span class="tool-icon site">🎂</span>
              <div class="tool-body">
                <h3>Diseños</h3>
                <p>Galería de diseños para Crea tu torta.</p>
              </div>
              <span class="tool-arrow">→</span>
            </a>
            <a routerLink="/admin/portadas" class="tool-card">
              <span class="tool-icon site">🖼️</span>
              <div class="tool-body">
                <h3>Portadas</h3>
                <p>Imágenes del carrusel del inicio (hero).</p>
              </div>
              <span class="tool-arrow">→</span>
            </a>
            <a routerLink="/admin/ordenes" class="tool-card">
              <span class="tool-icon orders">🛒</span>
              <div class="tool-body">
                <h3>Órdenes</h3>
                <p>Ver pedidos, cambiar estados y gestionar entregas.</p>
              </div>
              <span class="tool-arrow">→</span>
            </a>
            <a routerLink="/admin/usuarios" class="tool-card">
              <span class="tool-icon users">👥</span>
              <div class="tool-body">
                <h3>Usuarios</h3>
                <p>Listar usuarios, activar/desactivar y dar rol admin.</p>
              </div>
              <span class="tool-arrow">→</span>
            </a>
            <a routerLink="/cambiar-password" class="tool-card">
              <span class="tool-icon security">🔐</span>
              <div class="tool-body">
                <h3>Cambiar contraseña</h3>
                <p>Actualizar tu contraseña de administrador.</p>
              </div>
              <span class="tool-arrow">→</span>
            </a>
            <a href="/" target="_blank" rel="noopener" class="tool-card">
              <span class="tool-icon site">🌐</span>
              <div class="tool-body">
                <h3>Ver sitio público</h3>
                <p>Abrir la tienda como la ve el cliente.</p>
              </div>
              <span class="tool-arrow">→</span>
            </a>
          </div>
        </div>

        <div class="recent-orders">
          <h2>Últimas órdenes</h2>
          @if (loadingOrders()) {
            <p class="muted">Cargando...</p>
          } @else if (recentOrders().length === 0) {
            <p class="muted">No hay órdenes aún.</p>
          } @else {
            <div class="orders-table-wrap">
              <table class="orders-table">
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of recentOrders(); track order.id) {
                    <tr>
                      <td><strong>{{ order.order_number }}</strong></td>
                      <td>{{ order.customer_name }}</td>
                      <td><span class="status-badge" [attr.data-status]="order.status">{{ getStatusLabel(order.status) }}</span></td>
                      <td>{{ order.total | currency:'UYU':'$':'1.0-0' }}</td>
                      <td>{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td><a [routerLink]="['/admin/ordenes']" [queryParams]="{ id: order.id }" class="link">Ver</a></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <a routerLink="/admin/ordenes" class="view-all">Ver todas las órdenes</a>
          }
        </div>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
    }

    .page-header {
      margin-bottom: var(--space-8);

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        color: var(--ink);
        margin-bottom: var(--space-2);
        padding-bottom: var(--space-2);
        border-bottom: 3px solid var(--brand);
        display: inline-block;
      }

      p {
        color: var(--ink-light);
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-4);
      margin-bottom: var(--space-8);

      @media (min-width: 420px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(6, 1fr);
      }
    }

    .stat-card {
      background: var(--surface-white);
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      display: flex;
      align-items: center;
      gap: var(--space-4);
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(var(--brand-rgb), 0.12);
      transition: all var(--transition-fast);

      &:hover {
        border-color: rgba(var(--brand-rgb), 0.3);
        box-shadow: 0 4px 12px rgba(var(--brand-rgb), 0.08);
      }
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;

      &.products {
        background-color: rgba(var(--brand-rgb), 0.12);
        color: var(--brand);
      }

      &.orders {
        background-color: #D1FAE5;
        color: #059669;
      }

      &.pending {
        background-color: #FEF3C7;
        color: #D97706;
      }

      &.revenue {
        background-color: rgba(var(--brand-rgb), 0.15);
        color: var(--brand-dark);
      }

      &.users {
        background-color: #E0E7FF;
        color: #4338CA;
      }
    }

    .stat-card.warning {
      border-color: var(--brand);
      background: linear-gradient(135deg, var(--surface-white) 0%, rgba(var(--brand-rgb), 0.06) 100%);
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--ink);
    }

    .stat-label {
      font-size: var(--text-sm);
      color: var(--ink-light);
    }

    .tools-section {
      margin-top: var(--space-10);
      margin-bottom: var(--space-8);

      h2 {
        font-size: var(--text-lg);
        margin-bottom: var(--space-1);
        color: var(--ink);
        padding-left: var(--space-3);
        border-left: 4px solid var(--brand);
      }

      .section-desc {
        color: var(--ink-light);
        font-size: var(--text-sm);
        margin-bottom: var(--space-6);
      }

      .tools-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-4);

        @media (min-width: 640px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (min-width: 1024px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .tool-card {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        background: var(--surface-white);
        border-radius: var(--radius-xl);
        padding: var(--space-5);
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-fast);
        color: var(--ink);
        text-decoration: none;
        border: 1px solid rgba(var(--brand-rgb), 0.15);
        min-height: 44px;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(var(--brand-rgb), 0.15);
          border-color: var(--brand);
          background: var(--surface-alt);
        }

        &.highlight {
          border-color: var(--brand);
          background: linear-gradient(135deg, var(--surface-white) 0%, rgba(var(--brand-rgb), 0.08) 100%);

          &:hover {
            background: linear-gradient(135deg, rgba(var(--brand-rgb), 0.06) 0%, rgba(var(--brand-rgb), 0.12) 100%);
          }

          .tool-icon.new {
            background: var(--brand);
            color: white;
          }
        }

        .tool-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;

          &.products { background: rgba(var(--brand-rgb), 0.12); }
          &.new { background: rgba(34, 197, 94, 0.2); color: #059669; }
          &.categories { background: #FEF3C7; }
          &.orders { background: #E0E7FF; }
          &.users { background: #FCE7F3; }
          &.security { background: #E5E7EB; }
          &.site { background: rgba(var(--brand-rgb), 0.12); }
        }

        .tool-body {
          flex: 1;
          min-width: 0;

          h3 {
            font-size: var(--text-base);
            font-weight: 600;
            margin: 0 0 var(--space-1);
            color: var(--ink);
          }

          p {
            font-size: var(--text-sm);
            color: var(--ink-light);
            margin: 0;
            line-height: 1.4;
          }
        }

        .tool-arrow {
          color: var(--brand);
          font-size: var(--text-xl);
          flex-shrink: 0;
        }
      }
    }

    .recent-orders {
      margin-top: var(--space-10);
      background: var(--surface-white);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(var(--brand-rgb), 0.12);

      h2 {
        font-size: var(--text-lg);
        margin-bottom: var(--space-4);
        color: var(--ink);
        padding-left: var(--space-3);
        border-left: 4px solid var(--brand);
      }

      .muted {
        color: var(--ink-light);
        margin: 0;
      }

      .orders-table-wrap {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .orders-table {
        width: 100%;
        min-width: 320px;
        border-collapse: collapse;

        th, td {
          padding: var(--space-3) var(--space-4);
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        @media (max-width: 768px) {
          th, td {
            padding: var(--space-2) var(--space-3);
            font-size: var(--text-sm);
          }
        }

        th {
          font-size: var(--text-xs);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--ink-light);
        }

        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: var(--text-xs);
          font-weight: 500;

          &[data-status="creada"] { background: #E5E7EB; color: #374151; }
          &[data-status="pagada"] { background: #D1FAE5; color: #059669; }
          &[data-status="en_preparacion"] { background: #FEF3C7; color: #D97706; }
          &[data-status="entregada"] { background: #DBEAFE; color: #2563EB; }
          &[data-status="cancelada"] { background: #FEE2E2; color: #DC2626; }
        }

        .link {
          color: var(--brand);
          font-weight: 500;
        }
      }

      .view-all {
        display: inline-block;
        margin-top: var(--space-4);
        font-size: var(--text-sm);
        color: var(--brand);
        font-weight: 500;
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  stats = signal<DashboardStats>({
    total_products: 0,
    total_orders: 0,
    pending_orders: 0,
    total_revenue: 0,
    total_users: 0,
  });
  recentOrders = signal<OrderSummary[]>([]);
  loadingOrders = signal(false);

  adminName(): string {
    const u = this.auth.user();
    if (u?.full_name) return u.full_name.split(' ')[0] || u.full_name;
    return '';
  }

  ngOnInit() {
    const defaultStats: DashboardStats = {
      total_products: 0,
      total_orders: 0,
      pending_orders: 0,
      total_revenue: 0,
      total_users: 0,
    };
    this.api.get<DashboardStats>('/admin/stats').pipe(
      catchError(() => of(defaultStats))
    ).subscribe(s => this.stats.set(s));

    this.loadingOrders.set(true);
    this.api.get<OrderSummary[]>('/admin/orders', { limit: 5 }).pipe(
      catchError(() => of([])),
      tap(() => this.loadingOrders.set(false))
    ).subscribe(orders => this.recentOrders.set(orders));
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
    return labels[(status || '').toLowerCase()] || status;
  }
}
