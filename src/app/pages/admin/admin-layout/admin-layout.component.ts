import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <a routerLink="/" class="logo">
            <span>Tortaskeia</span>
            <small>Admin Panel</small>
          </a>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
            </svg>
            Dashboard
          </a>
          <a routerLink="/admin/productos" routerLinkActive="active">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
            </svg>
            Productos
          </a>
          <a routerLink="/admin/categorias" routerLinkActive="active">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/>
            </svg>
            Categorías
          </a>
          <a routerLink="/admin/diseños" routerLinkActive="active">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
            Diseños
          </a>
          <a routerLink="/admin/portadas" routerLinkActive="active">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="m3 9 9-6 9 6"/><path d="M3 15h18"/>
            </svg>
            Portadas
          </a>
          <a routerLink="/admin/ordenes" routerLinkActive="active">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
            </svg>
            Órdenes
          </a>
          <a routerLink="/admin/usuarios" routerLinkActive="active">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Usuarios
          </a>
          <a routerLink="/cambiar-password" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Cambiar contraseña
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
            Volver al sitio
          </a>
          <button (click)="logout()" class="logout-btn">
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
  `],
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
