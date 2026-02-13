import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersService, Order } from '@app/core/services/orders.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <section class="success-page">
      <div class="container">
        @if (loading()) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Cargando tu pedido...</p>
          </div>
        } @else if (!order()) {
          <div class="success-card">
            <div class="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1>¡Pedido Recibido!</h1>
            <p>Tu pedido fue registrado correctamente. Te contactaremos pronto para coordinar el pago y la entrega.</p>
            <div class="actions">
              <a routerLink="/" class="btn-primary">Volver al Inicio</a>
            </div>
          </div>
        } @else {
          <div class="success-card">
            <div class="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1>¡Pedido Confirmado!</h1>
            <p class="order-number">Número de orden: <strong>{{ order()!.order_number }}</strong></p>
            <p class="order-info">Te enviamos un email a <strong>{{ order()!.customer_email }}</strong> con los detalles de tu pedido.</p>
          </div>

          <div class="order-details">
            <h2>Detalles del Pedido</h2>
            
            <div class="details-grid">
              <div class="detail-card">
                <h3>Productos</h3>
                <div class="items-list">
                  @for (item of order()!.items; track item.id) {
                    <div class="order-item">
                      <div class="order-item-main">
                        <span class="item-qty">{{ item.quantity }}x</span>
                        <span class="item-name">{{ item.product_name }}</span>
                        <span class="item-price">{{ item.subtotal | currency:'UYU':'$':'1.0-0' }}</span>
                      </div>
                      @if (item.notes) {
                        <p class="order-item-notes">{{ item.notes }}</p>
                      }
                    </div>
                  }
                </div>
                <div class="totals">
                  <div class="total-row">
                    <span>Subtotal</span>
                    <span>{{ order()!.subtotal | currency:'UYU':'$':'1.0-0' }}</span>
                  </div>
                  @if (order()!.delivery_fee > 0) {
                    <div class="total-row">
                      <span>Envío</span>
                      <span>{{ order()!.delivery_fee | currency:'UYU':'$':'1.0-0' }}</span>
                    </div>
                  }
                  <div class="total-row final">
                    <span>Total</span>
                    <span>{{ order()!.total | currency:'UYU':'$':'1.0-0' }}</span>
                  </div>
                </div>
              </div>

              <div class="detail-card">
                <h3>Entrega</h3>
                <p><strong>{{ order()!.delivery_type === 'delivery' ? 'Delivery a domicilio' : 'Retiro en local' }}</strong></p>
                @if (order()!.delivery_type === 'delivery') {
                  <p>{{ order()!.delivery_address }}</p>
                  <p>{{ order()!.delivery_city }}</p>
                }
                @if (order()!.delivery_date) {
                  <p>Fecha: {{ order()!.delivery_date | date:'dd/MM/yyyy' }}</p>
                }
                @if (order()!.delivery_time_slot) {
                  <p>Horario: {{ order()!.delivery_time_slot }}</p>
                }
              </div>

              <div class="detail-card">
                <h3>Estado</h3>
                <span class="status-badge" [style.background-color]="ordersService.getStatusColor(order()!.status)">
                  {{ ordersService.getStatusLabel(order()!.status) }}
                </span>
                <p class="status-info">Te notificaremos cuando haya cambios en tu pedido.</p>
                
                @if (paymentUnavailable()) {
                  <p class="payment-unavailable-msg">El pago con Mercado Pago no estuvo disponible al confirmar. Podés intentar pagar ahora con el botón de abajo o contactarnos por WhatsApp.</p>
                }
                @if (paymentError()) {
                  <p class="payment-error-msg">{{ paymentError() }}</p>
                }
                @if (showPayButton()) {
                  <button 
                    class="btn-pay" 
                    (click)="initiatePayment()" 
                    [disabled]="processingPayment()"
                  >
                    @if (processingPayment()) {
                      <span class="spinner"></span>
                      Procesando...
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect width="20" height="14" x="2" y="5" rx="2"/>
                        <line x1="2" x2="22" y1="10" y2="10"/>
                      </svg>
                      {{ paymentUnavailable() ? 'Intentar pagar con Mercado Pago' : 'Pagar con Mercado Pago' }}
                    }
                  </button>
                }
              </div>

              <div class="detail-card">
                <h3>¿Necesitás ayuda?</h3>
                <p>Contactanos por WhatsApp para cualquier consulta sobre tu pedido.</p>
                <a 
                  [href]="'https://wa.me/59899123456?text=' + encodeWhatsApp()" 
                  target="_blank" 
                  class="btn-whatsapp"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Escribinos por WhatsApp
                </a>
              </div>
            </div>

            <div class="actions">
              <a routerLink="/tienda" class="btn-secondary">Seguir Comprando</a>
              <a routerLink="/" class="btn-primary">Volver al Inicio</a>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .success-page {
      padding: var(--space-24) 0 var(--space-16);
      background-color: var(--surface);
      min-height: 80vh;
    }

    .loading {
      text-align: center;
      padding: var(--space-16);

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--surface);
        border-top-color: var(--brand);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto var(--space-4);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .success-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-10);
      text-align: center;
      max-width: 600px;
      margin: 0 auto var(--space-8);
    }

    .success-icon {
      color: #10B981;
      margin-bottom: var(--space-4);
    }

    h1 {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      margin-bottom: var(--space-4);

      @media (min-width: 768px) {
        font-size: var(--text-3xl);
      }
    }

    .order-number {
      font-size: var(--text-lg);
      margin-bottom: var(--space-2);

      strong {
        color: var(--brand);
      }
    }

    .order-info {
      color: var(--ink-light);
      font-size: var(--text-sm);
    }

    .order-details {
      max-width: 900px;
      margin: 0 auto;

      h2 {
        font-size: var(--text-xl);
        margin-bottom: var(--space-6);
        text-align: center;
      }
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-4);
      margin-bottom: var(--space-8);

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .detail-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-5);

      h3 {
        font-size: var(--text-sm);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--ink-light);
        margin-bottom: var(--space-3);
      }

      p {
        font-size: var(--text-sm);
        margin-bottom: 4px;
      }
    }

    .items-list {
      margin-bottom: var(--space-4);
    }

    .order-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      padding: var(--space-2) 0;
      border-bottom: 1px solid var(--surface);
      font-size: var(--text-sm);

      .order-item-main {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }

      .order-item-notes {
        font-size: var(--text-xs);
        color: var(--ink-light);
        margin: 0;
        padding-left: 38px;
        line-height: 1.4;
      }

      .item-qty {
        color: var(--ink-light);
        min-width: 30px;
      }

      .item-name {
        flex: 1;
      }

      .item-price {
        font-weight: 500;
      }
    }

    .totals {
      padding-top: var(--space-3);
      border-top: 1px solid var(--surface);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: var(--space-1) 0;
      font-size: var(--text-sm);

      &.final {
        font-weight: 700;
        font-size: var(--text-base);
        padding-top: var(--space-2);
        margin-top: var(--space-2);
        border-top: 1px solid var(--surface);
      }
    }

    .status-badge {
      display: inline-block;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-full);
      color: white;
      font-size: var(--text-sm);
      font-weight: 600;
      margin-bottom: var(--space-3);
    }

    .status-info {
      color: var(--ink-muted);
      font-size: var(--text-xs);
    }

    .payment-unavailable-msg {
      font-size: var(--text-sm);
      color: var(--ink-light);
      margin-bottom: var(--space-3);
      padding: var(--space-2) var(--space-3);
      background: rgba(var(--brand-rgb), 0.08);
      border-radius: var(--radius-md);
    }

    .payment-error-msg {
      font-size: var(--text-sm);
      color: #b91c1c;
      margin-bottom: var(--space-3);
      padding: var(--space-2) var(--space-3);
      background: #fef2f2;
      border-radius: var(--radius-md);
      border: 1px solid #fecaca;
    }

    .btn-pay {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      width: 100%;
      padding: var(--space-3) var(--space-4);
      margin-top: var(--space-4);
      background: linear-gradient(135deg, #009EE3 0%, #00B1EA 100%);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 158, 227, 0.3);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    }

    .btn-whatsapp {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      background: var(--whatsapp);
      color: white;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: 600;
      margin-top: var(--space-3);

      &:hover {
        opacity: 0.9;
        color: white;
      }
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .btn-primary, .btn-secondary {
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-md);
      font-weight: 600;
      text-decoration: none;
    }

    .btn-primary {
      background-color: var(--brand);
      color: white;

      &:hover {
        background-color: var(--brand-dark);
        color: white;
      }
    }

    .btn-secondary {
      background: white;
      color: var(--ink);
      border: 1px solid #E0D5C8;

      &:hover {
        background: var(--surface);
        color: var(--ink);
      }
    }
  `],
})
export class SuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  ordersService = inject(OrdersService);

  order = signal<Order | null>(null);
  loading = signal(true);
  processingPayment = signal(false);
  paymentUnavailable = signal(false);
  /** Mensaje de error del backend (ej. al crear preferencia) para mostrar causa del fallo */
  paymentError = signal<string | null>(null);

  showPayButton = signal(false);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.paymentUnavailable.set(params['payment_unavailable'] === '1');
      const errParam = params['payment_error'];
      if (errParam) {
        try {
          this.paymentError.set(decodeURIComponent(errParam));
        } catch {
          this.paymentError.set('Error al crear el pago.');
        }
      }
      const orderNumber = params['order'];
      if (orderNumber) {
        this.loadOrder(orderNumber);
      } else {
        this.loading.set(false);
      }
    });
  }

  loadOrder(orderNumber: string) {
    this.ordersService.getOrder(orderNumber).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
        // Show pay button for orders that can be paid
        const s = (order.status || '').toLowerCase();
        this.showPayButton.set(['creada', 'fallida'].includes(s));
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  initiatePayment() {
    const order = this.order();
    if (!order || !isPlatformBrowser(this.platformId)) return;

    this.processingPayment.set(true);

    this.ordersService.createPaymentPreference(order.order_number).subscribe({
      next: (preference) => {
        // Redirect to Mercado Pago checkout
        window.location.href = preference.init_point;
      },
      error: (err) => {
        this.processingPayment.set(false);
        const detail = err.error?.detail || 'Error al procesar el pago. Por favor intentá de nuevo.';
        this.paymentError.set(detail);
        alert(detail);
      },
    });
  }

  encodeWhatsApp(): string {
    const o = this.order();
    if (!o) return '';
    return encodeURIComponent(`Hola! Tengo una consulta sobre mi pedido ${o.order_number}`);
  }
}
