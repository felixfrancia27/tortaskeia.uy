import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '@app/core/services/cart.service';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <!-- Línea blanca gruesa que cruza el logo (como referencia) -->
      <div class="header-line" aria-hidden="true"></div>

      <div class="header-container">
        <!-- Left Nav - 3 links -->
        <nav class="nav nav-left">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Inicio</a>
          <a routerLink="/tienda" routerLinkActive="active">Tienda</a>
          <a routerLink="/agenda" routerLinkActive="active">Crea tu torta</a>
        </nav>

        <!-- Logo Central - Imagen real del badge -->
        <a routerLink="/" class="logo">
          <img 
            src="assets/logo-keia.png" 
            alt="Tortaskeia - Repostería Artesanal" 
            class="logo-image"
            width="120"
            height="120"
            loading="eager"
            fetchpriority="high"
          />
        </a>

        <!-- Right Nav - links + admin (si aplica) + carrito -->
        <nav class="nav nav-right">
          <a routerLink="/trabajos" routerLinkActive="active">Trabajos</a>
          <a routerLink="/keia" routerLinkActive="active">Keia</a>
          <a routerLink="/contacto" routerLinkActive="active">Contacto</a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin" class="admin-link" aria-label="Panel de administración" title="Panel Admin">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </a>
          }
          <a routerLink="/carrito" class="cart-link" aria-label="Carrito de compras">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            @if (cart.itemCount() > 0) {
              <span class="cart-badge">{{ cart.itemCount() }}</span>
            }
          </a>
        </nav>

        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" (click)="toggleMobile()" [class.open]="mobileOpen()" aria-label="Menú">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- Mobile Menu -->
      @if (mobileOpen()) {
        <div class="mobile-menu">
          <nav class="mobile-nav">
            <a routerLink="/" (click)="closeMobile()">Inicio</a>
            <a routerLink="/tienda" (click)="closeMobile()">Tienda</a>
            <a routerLink="/agenda" (click)="closeMobile()">Crea tu torta</a>
            <a routerLink="/trabajos" (click)="closeMobile()">Trabajos</a>
            <a routerLink="/keia" (click)="closeMobile()">Keia</a>
            <a routerLink="/contacto" (click)="closeMobile()">Contacto</a>
            <a routerLink="/carrito" (click)="closeMobile()">
              Carrito 
              @if (cart.itemCount() > 0) {
                ({{ cart.itemCount() }})
              }
            </a>
            @if (auth.isAuthenticated()) {
              <a routerLink="/mis-pedidos" (click)="closeMobile()">Mis Pedidos</a>
              @if (auth.isAdmin()) {
                <a routerLink="/admin" (click)="closeMobile()">Admin Panel</a>
              }
              <button (click)="auth.logout(); closeMobile()" class="mobile-logout">Cerrar Sesión</button>
            } @else {
              <a routerLink="/login" (click)="closeMobile()">Iniciar Sesión</a>
              <a routerLink="/registro" (click)="closeMobile()">Registrarse</a>
            }
          </nav>
        </div>
      }
    </header>
  `,
  styles: [`
    :host {
      /* Header termina exactamente en la línea blanca (sin franja naranja debajo) */
      --logo-size: 110px;
      --nav-top: 32px;
      --header-gap: 16px;
      --header-height: calc(var(--logo-size) * 0.72 + 2px);
    }

    @media (min-width: 768px) {
      :host {
        --logo-size: 126px;
        --nav-top: 36px;
        --header-gap: 18px;
        --header-height: calc(var(--logo-size) * 0.72 + 2px);
      }
    }

    @media (min-width: 1024px) {
      :host {
        --logo-size: 140px;
        --nav-top: 40px;
        --header-gap: 20px;
        --header-height: calc(var(--logo-size) * 0.72 + 2px);
      }
    }

    @media (min-width: 1280px) {
      :host {
        --logo-size: 148px;
        --nav-top: 42px;
        --header-gap: 22px;
        --header-height: calc(var(--logo-size) * 0.72 + 2px);
      }
    }

    .header {
      position: relative;
      width: 100%;
      z-index: var(--z-sticky);
      height: var(--header-height);
      padding: 0;
      background: var(--brand);
      overflow: visible;
    }

    /* Línea blanca a la altura del subrayado; SIEMPRE por debajo del logo (z-index menor) */
    .header-line {
      position: absolute;
      left: 0;
      right: 0;
      top: calc(var(--logo-size) * 0.72);
      height: 2px;
      background: white;
      z-index: 1;
      pointer-events: none;
    }

    .header-container {
      position: relative;
      z-index: 2;
      max-width: var(--container-2xl);
      margin: 0 auto;
      height: 100%;
      padding: 0 var(--space-4) var(--header-gap);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      @media (min-width: 768px) {
        padding: 0 var(--space-6) var(--header-gap);
      }

      @media (min-width: 1024px) {
        padding: 0 var(--space-8) var(--header-gap);
      }
    }

    .nav {
      display: none;
      align-items: center;
      gap: var(--space-8);
      margin-top: var(--nav-top);

      @media (min-width: 768px) {
        display: flex;
        gap: var(--space-10);
      }

      @media (min-width: 1024px) {
        gap: var(--space-12);
      }

      @media (min-width: 1200px) {
        gap: 2rem;
      }

      a {
        color: white;
        font-family: 'Cormorant Garamond', var(--font-serif);
        font-size: 19px;
        font-weight: 600;
        letter-spacing: 0.08em;
        transition: color var(--transition-base), opacity var(--transition-base),
          border-color var(--transition-base), letter-spacing var(--transition-base);
        padding: 0 0 4px;
        white-space: nowrap;
        border-bottom: 2px solid transparent;

        @media (min-width: 768px) {
          font-size: 20px;
          letter-spacing: 0.1em;
        }

        @media (min-width: 1024px) {
          font-size: 21px;
          letter-spacing: 0.12em;
        }

        @media (min-width: 1200px) {
          font-size: 22px;
          letter-spacing: 0.14em;
        }

        &:hover {
          opacity: 0.95;
          color: white;
          border-bottom-color: rgba(255, 255, 255, 0.8);
          letter-spacing: 0.15em;
        }

        &.active {
          opacity: 1;
          border-bottom-color: white;
        }
      }
    }

    .nav-left {
      flex: 1;
      justify-content: flex-end;
      padding-right: var(--space-6);

      @media (min-width: 768px) {
        padding-right: var(--space-8);
      }

      @media (min-width: 1024px) {
        padding-right: var(--space-10);
      }
    }

    .nav-right {
      flex: 1;
      justify-content: flex-start;
      padding-left: var(--space-6);

      @media (min-width: 768px) {
        padding-left: var(--space-8);
      }

      @media (min-width: 1024px) {
        padding-left: var(--space-10);
      }
    }

    .admin-link {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-2) var(--space-3);
      margin-top: -2px;
      color: white;

      &:hover {
        opacity: 0.95;
      }
    }

    .cart-link {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: var(--space-2) var(--space-3);
      margin-top: -2px;

      &:hover {
        opacity: 0.95;
      }

      .cart-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        color: var(--brand);
        font-size: 11px;
        font-weight: 700;
        border-radius: 999px;
        line-height: 1;
      }
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      z-index: 10; /* SIEMPRE por encima de la línea blanca */
      transition: transform var(--transition-base);

      &:hover {
        opacity: 1;
        transform: scale(1.05);
      }
    }

    .logo-image {
      display: block;
      width: var(--logo-size);
      height: var(--logo-size);
      object-fit: contain;
    }

    .mobile-menu-btn {
      display: flex;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      z-index: 1001;

      @media (min-width: 768px) {
        display: none;
      }

      span {
        width: 24px;
        height: 2px;
        background: white;
        border-radius: 2px;
        transition: all var(--transition-fast);
      }

      &.open {
        span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        span:nth-child(2) {
          opacity: 0;
        }
        span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }
      }
    }

    .mobile-menu {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--brand);
      z-index: 1000;
      padding: 100px var(--space-6) var(--space-6);
      overflow-y: auto;

      @media (min-width: 768px) {
        display: none;
      }
    }

    .mobile-nav {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);

      a, button {
        display: block;
        color: white;
        font-size: var(--text-lg);
        font-weight: 500;
        padding: var(--space-3) 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        background: none;
        border-top: none;
        border-left: none;
        border-right: none;
        text-align: left;
        width: 100%;
        cursor: pointer;
      }

      .mobile-logout {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  `],
})
export class HeaderComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  
  mobileOpen = signal(false);

  toggleMobile() {
    this.mobileOpen.update(v => !v);
  }

  closeMobile() {
    this.mobileOpen.set(false);
  }
}
