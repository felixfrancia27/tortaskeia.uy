import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <!-- Barra superior móvil: menú hamburguesa -->
      <header class="admin-mobile-header" aria-label="Menú del panel">
        <button type="button" class="menu-toggle" (click)="toggleSidebar()" aria-label="Abrir menú">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/>
          </svg>
        </button>
        <a routerLink="/admin" class="mobile-logo">Admin · Tortaskeia</a>
      </header>

      <!-- Overlay para cerrar sidebar al tocar fuera (solo móvil) -->
      @if (sidebarOpen()) {
        <div class="sidebar-overlay" (click)="closeSidebar()" role="button" tabindex="0" aria-label="Cerrar menú"></div>
      }

      <aside class="admin-sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-header">
          <a routerLink="/" class="logo" (click)="closeSidebar()">
            <span>Tortaskeia</span>
            <small>Admin Panel</small>
          </a>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
            </svg>
            Dashboard
          </a>
          <a routerLink="/admin/productos" routerLinkActive="active" (click)="closeSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
            </svg>
            Productos
          </a>
          <a routerLink="/admin/categorias" routerLinkActive="active" (click)="closeSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/>
            </svg>
            Categorías
          </a>
          <a routerLink="/admin/diseños" routerLinkActive="active" (click)="closeSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
            Diseños
          </a>
          <a routerLink="/admin/portadas" routerLinkActive="active" (click)="closeSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="m3 9 9-6 9 6"/><path d="M3 15h18"/>
            </svg>
            Portadas
          </a>
          <a routerLink="/admin/eventos" routerLinkActive="active" (click)="closeSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Eventos
          </a>
          <a routerLink="/admin/ordenes" routerLinkActive="active" (click)="closeSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
            </svg>
            Órdenes
          </a>
          <a routerLink="/admin/usuarios" routerLinkActive="active" (click)="closeSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Usuarios
          </a>
          <a routerLink="/cambiar-password" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Cambiar contraseña
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/" class="back-link" (click)="closeSidebar()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
            Volver al sitio
          </a>
          <button (click)="logout()" class="logout-btn" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main class="admin-main">
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--surface);
    }

    .admin-sidebar {
      width: 260px;
      background: var(--surface-white);
      color: var(--ink);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 350;
      border-right: 2px solid rgba(var(--brand-rgb), 0.2);
      box-shadow: 2px 0 12px rgba(0, 0, 0, 0.06);
    }

    .sidebar-header {
      padding: var(--space-6);
      border-bottom: 1px solid rgba(var(--brand-rgb), 0.15);
    }

    .logo {
      display: flex;
      flex-direction: column;
      color: var(--ink);
      text-decoration: none;

      span {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--ink);
      }

      small {
        font-size: var(--text-xs);
        color: var(--brand);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-top: 2px;
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);

      a {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        color: var(--ink-light);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: 500;
        transition: all var(--transition-fast);
        text-decoration: none;

        &:hover {
          background-color: rgba(var(--brand-rgb), 0.1);
          color: var(--brand-dark);
        }

        &.active {
          background-color: var(--brand);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 107, 0, 0.25);
        }
      }
    }

    .sidebar-footer {
      padding: var(--space-4);
      border-top: 1px solid rgba(var(--brand-rgb), 0.15);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);

      .back-link,
      .logout-btn {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        color: var(--ink-light);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        background: none;
        border: none;
        cursor: pointer;
        width: 100%;
        text-align: left;
        text-decoration: none;

        &:hover {
          background-color: rgba(var(--brand-rgb), 0.1);
          color: var(--brand-dark);
        }
      }
    }

    .admin-main {
      flex: 1;
      margin-left: 260px;
      padding: var(--space-6);
      padding-right: calc(var(--space-6) + 220px);
      padding-top: var(--space-4);
      background-color: var(--surface);
    }

    /* ——— Responsive: iPhone 11 y móviles (≤768px) ——— */
    @media (max-width: 768px) {
      .admin-mobile-header {
        display: flex;
      }

      .admin-sidebar {
        width: 280px;
        max-width: 85vw;
        transform: translateX(-100%);
        transition: transform 0.25s ease-out;
      }

      .admin-sidebar.open {
        transform: translateX(0);
      }

      .sidebar-overlay {
        display: block;
      }

      .admin-main {
        margin-left: 0;
        padding: var(--space-4);
        padding-top: calc(56px + env(safe-area-inset-top, 0px) + var(--space-4));
        padding-right: var(--space-4);
        padding-left: var(--space-4);
      }
    }

    .admin-mobile-header {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: calc(56px + env(safe-area-inset-top, 0px));
      padding-top: env(safe-area-inset-top, 0px);
      z-index: 340;
      background: var(--surface-white);
      border-bottom: 2px solid rgba(var(--brand-rgb), 0.2);
      align-items: center;
      padding: 0 var(--space-4);
      gap: var(--space-3);
    }

    .menu-toggle {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      border-radius: var(--radius-md);
      color: var(--ink);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .menu-toggle:hover {
      background: rgba(var(--brand-rgb), 0.1);
      color: var(--brand);
    }

    .mobile-logo {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: var(--text-lg);
      color: var(--ink);
      text-decoration: none;
    }

    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 345;
      -webkit-tap-highlight-color: transparent;
    }

    /* Touch targets mínimos 44px en sidebar (móvil) */
    @media (max-width: 768px) {
      .sidebar-nav a {
        min-height: 44px;
        padding: var(--space-3) var(--space-4);
      }

      .sidebar-footer .back-link,
      .sidebar-footer .logout-btn {
        min-height: 44px;
      }
    }
  `],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal(false);
  private sub?: Subscription;

  ngOnInit() {
    this.sub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(() => this.closeSidebar());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
