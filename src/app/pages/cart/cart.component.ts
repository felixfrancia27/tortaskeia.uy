import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '@app/core/services/cart.service';
import { resolveImageUrl } from '@app/core/utils/image-url';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe],
  template: `
    <section class="cart-page">
      <div class="container">
        <h1>Tu Carrito</h1>

        @if (cart.isEmpty()) {
          <div class="empty-cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <h2>Tu carrito está vacío</h2>
            <p>Explorá nuestra tienda y agregá productos</p>
            <a routerLink="/tienda" class="btn-primary">Ver Productos</a>
          </div>
        } @else {
          <div class="cart-layout">
            <!-- Cart Items -->
            <div class="cart-items">
              @for (item of cart.items(); track item.id) {
                <div class="cart-item">
                  <a [routerLink]="['/tortas', item.product.slug]" class="item-image">
                    <img [src]="resolveImageUrl(item.product.main_image) || 'assets/images/placeholder.jpg'" [alt]="item.product.name" />
                  </a>
                  
                  <div class="item-details">
                    <a [routerLink]="['/tortas', item.product.slug]" class="item-name">
                      {{ item.product.name }}
                    </a>
                    @if (item.size) {
                      <span class="item-size">Tamaño: {{ item.size }}</span>
                    }
                    <span class="item-price">{{ item.product.price | currency:'UYU':'$':'1.0-0' }}</span>
                    @if (item.notes) {
                      <p class="item-notes">{{ item.notes }}</p>
                    }
                  </div>
                  
                  <div class="item-quantity">
                    <button (click)="decrementQuantity(item)" [disabled]="item.quantity <= 1">−</button>
                    <span>{{ item.quantity }}</span>
                    <button (click)="incrementQuantity(item)" [disabled]="item.quantity >= 10">+</button>
                  </div>
                  
                  <div class="item-subtotal">
                    {{ item.subtotal | currency:'UYU':'$':'1.0-0' }}
                  </div>
                  
                  <button class="remove-btn" (click)="removeItem(item)" aria-label="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              }
            </div>

            <!-- Cart Summary -->
            <div class="cart-summary">
              <h2>Resumen del Pedido</h2>
              
              <div class="summary-row">
                <span>Subtotal ({{ cart.itemCount() }} productos)</span>
                <span>{{ cart.total() | currency:'UYU':'$':'1.0-0' }}</span>
              </div>
              
              <div class="summary-row">
                <span>Envío</span>
                <span class="shipping-note">Se calcula en checkout</span>
              </div>
              
              <div class="summary-total">
                <span>Total</span>
                <span>{{ cart.total() | currency:'UYU':'$':'1.0-0' }}</span>
              </div>

              <a routerLink="/checkout" class="btn-checkout">
                Continuar al Checkout
              </a>

              <a routerLink="/tienda" class="btn-continue">
                ← Seguir Comprando
              </a>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .cart-page {
      padding: var(--space-24) 0 var(--space-16);
      min-height: 70vh;
      background-color: var(--surface);

      @media (max-width: 480px) {
        padding: var(--space-8) 0 var(--space-10);
      }
    }

    h1 {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      color: var(--ink);
      margin-bottom: var(--space-8);

      @media (min-width: 768px) {
        font-size: var(--text-3xl);
      }
    }

    .empty-cart {
      text-align: center;
      padding: var(--space-16) var(--space-4);
      background: white;
      border-radius: var(--radius-xl);

      svg {
        color: var(--ink-muted);
        margin-bottom: var(--space-4);
      }

      h2 {
        font-size: var(--text-xl);
        color: var(--ink);
        margin-bottom: var(--space-2);
      }

      p {
        color: var(--ink-light);
        margin-bottom: var(--space-6);
      }

      .btn-primary {
        display: inline-block;
        padding: var(--space-3) var(--space-6);
        background-color: var(--brand);
        color: white;
        border-radius: var(--radius-md);
        font-weight: 600;

        &:hover {
          background-color: var(--brand-dark);
          color: white;
        }
      }
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);

      @media (min-width: 1024px) {
        grid-template-columns: 1fr 380px;
      }
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .cart-item {
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: var(--space-4);
      padding: var(--space-4);
      background: white;
      border-radius: var(--radius-xl);
      align-items: center;

      @media (min-width: 768px) {
        grid-template-columns: 100px 1fr auto auto auto;
        padding: var(--space-5);
      }
    }

    .item-image {
      aspect-ratio: 1;
      border-radius: var(--radius-lg);
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .item-details {
      .item-name {
        display: block;
        font-weight: 600;
        color: var(--ink);
        margin-bottom: var(--space-1);

        &:hover {
          color: var(--brand);
        }
      }

      .item-size {
        display: block;
        font-size: var(--text-xs);
        color: var(--brand);
        font-weight: 500;
        margin-top: var(--space-1);
      }

      .item-price {
        font-size: var(--text-sm);
        color: var(--ink-light);
      }

      .item-notes {
        font-size: var(--text-xs);
        color: var(--ink-muted);
        margin-top: var(--space-2);
        font-style: italic;
      }
    }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      justify-self: end;

      button {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--surface);
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--text-lg);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;

        &:hover:not(:disabled) {
          background: #E0D5C8;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      span {
        width: 32px;
        text-align: center;
        font-weight: 600;
      }
    }

    .item-subtotal {
      font-weight: 600;
      color: var(--ink);
      text-align: right;
      display: none;

      @media (min-width: 768px) {
        display: block;
      }
    }

    .remove-btn {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FEE2E2;
      color: #DC2626;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      -webkit-tap-highlight-color: transparent;

      &:hover {
        background: #FECACA;
      }
    }

    .cart-summary {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      height: fit-content;
      position: sticky;
      top: var(--space-4);

      h2 {
        font-size: var(--text-lg);
        margin-bottom: var(--space-5);
      }
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: var(--space-3) 0;
      border-bottom: 1px solid #E0D5C8;
      font-size: var(--text-sm);
      color: var(--ink-light);

      .shipping-note {
        font-style: italic;
      }
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      padding: var(--space-4) 0;
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--ink);
      border-bottom: 1px solid #E0D5C8;
      margin-bottom: var(--space-5);
    }

    .btn-checkout {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: var(--space-4);
      min-height: 44px;
      background-color: var(--brand);
      color: white;
      text-align: center;
      font-weight: 600;
      border-radius: var(--radius-md);
      margin-bottom: var(--space-3);

      &:hover {
        background-color: var(--brand-dark);
        color: white;
      }
    }

    .btn-continue {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: var(--space-3);
      min-height: 44px;
      text-align: center;
      color: var(--ink-light);
      font-size: var(--text-sm);

      &:hover {
        color: var(--brand);
      }
    }
  `],
})
export class CartComponent implements OnInit {
  cart = inject(CartService);
  readonly resolveImageUrl = resolveImageUrl;

  ngOnInit(): void {
    this.cart.fetchCartFromApi();
  }

  incrementQuantity(item: CartItem) {
    this.cart.updateQuantity(item.id, item.quantity + 1);
  }

  decrementQuantity(item: CartItem) {
    this.cart.updateQuantity(item.id, item.quantity - 1);
  }

  removeItem(item: CartItem) {
    this.cart.removeItem(item.id);
  }
}
