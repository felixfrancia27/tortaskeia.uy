import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminLayoutComponent, CurrencyPipe],
  template: `
    <app-admin-layout>
      <div class="dashboard">
        <header class="page-header">
          <h1>Dashboard</h1>
          <p>Bienvenido al panel de administración de Tortaskeia</p>
        </header>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon products">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats().totalProducts }}</span>
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
              <span class="stat-value">{{ stats().totalOrders }}</span>
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
              <span class="stat-value">{{ stats().pendingOrders }}</span>
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
              <span class="stat-value">{{ stats().totalRevenue | currency:'UYU':'$':'1.0-0' }}</span>
              <span class="stat-label">Ingresos totales</span>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h2>Acciones rápidas</h2>
          <div class="actions-grid">
            <a routerLink="/admin/productos/nuevo" class="action-card">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              <span>Nuevo Producto</span>
            </a>
            <a routerLink="/admin/ordenes" class="action-card">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/>
              </svg>
              <span>Ver Órdenes</span>
            </a>
            <a routerLink="/admin/categorias" class="action-card">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
              </svg>
              <span>Gestionar Categorías</span>
            </a>
            <a routerLink="/" class="action-card">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <span>Ver Sitio</span>
            </a>
          </div>
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
      }

      p {
        color: var(--ink-light);
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
      margin-bottom: var(--space-8);

      @media (min-width: 768px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .stat-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      display: flex;
      align-items: center;
      gap: var(--space-4);
      box-shadow: var(--shadow-sm);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;

      &.products {
        background-color: #DBEAFE;
        color: #2563EB;
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
        background-color: #FCE7F3;
        color: #DB2777;
      }
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

    .quick-actions {
      h2 {
        font-size: var(--text-lg);
        margin-bottom: var(--space-4);
        color: var(--ink);
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);

      @media (min-width: 768px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .action-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      text-align: center;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
      color: var(--ink);

      svg {
        color: var(--brand);
      }

      span {
        font-size: var(--text-sm);
        font-weight: 500;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        color: var(--ink);
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  ngOnInit() {
    // Load mock stats for now
    this.stats.set({
      totalProducts: 10,
      totalOrders: 25,
      pendingOrders: 3,
      totalRevenue: 45000,
    });
  }
}
