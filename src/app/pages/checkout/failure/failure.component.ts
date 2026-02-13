import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersService, Order } from '@app/core/services/orders.service';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="failure-page">
      <div class="container">
        <div class="failure-card">
          <div class="failure-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="m15 9-6 6"/>
              <path d="m9 9 6 6"/>
            </svg>
          </div>
          
          <h1>Pago no completado</h1>
          
          @if (order()) {
            <p class="order-number">Orden: <strong>{{ order()!.order_number }}</strong></p>
          }
          
          <p class="message">
            El pago no pudo ser procesado. No te preocupes, tu orden sigue guardada 
            y podés intentar pagar nuevamente.
          </p>

          <div class="reasons">
            <h3>Posibles razones:</h3>
            <ul>
              <li>Fondos insuficientes en la cuenta</li>
              <li>Datos de tarjeta incorrectos</li>
              <li>Tarjeta vencida o bloqueada</li>
              <li>Límite de crédito alcanzado</li>
              <li>Problemas temporales con el banco</li>
            </ul>
          </div>

          <div class="actions">
            @if (order()) {
              <button class="btn-primary" (click)="retryPayment()" [disabled]="retrying()">
                @if (retrying()) {
                  <span class="spinner"></span>
                  Procesando...
                } @else {
                  Reintentar Pago
                }
              </button>
            }
            <a routerLink="/contacto" class="btn-secondary">Contactar Soporte</a>
          </div>

          <div class="whatsapp-help">
            <p>¿Necesitás ayuda? Escribinos por WhatsApp</p>
            <a 
              [href]="'https://wa.me/59899123456?text=' + encodeWhatsApp()" 
              target="_blank" 
              class="btn-whatsapp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .failure-page {
      padding: var(--space-24) 0 var(--space-16);
      background-color: var(--surface);
      min-height: 80vh;
    }

    .failure-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-10);
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .failure-icon {
      color: #EF4444;
      margin-bottom: var(--space-4);
    }

    h1 {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      margin-bottom: var(--space-3);

      @media (min-width: 768px) {
        font-size: var(--text-3xl);
      }
    }

    .order-number {
      font-size: var(--text-lg);
      margin-bottom: var(--space-2);

      strong {
        color: var(--ink);
      }
    }

    .message {
      color: var(--ink-light);
      margin-bottom: var(--space-6);
      line-height: 1.6;
    }

    .reasons {
      text-align: left;
      background: var(--surface);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin-bottom: var(--space-6);

      h3 {
        font-size: var(--text-sm);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--ink-light);
        margin-bottom: var(--space-3);
      }

      ul {
        margin: 0;
        padding-left: var(--space-5);

        li {
          font-size: var(--text-sm);
          color: var(--ink);
          margin-bottom: var(--space-2);
        }
      }
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-6);

      @media (min-width: 480px) {
        flex-direction: row;
        justify-content: center;
      }
    }

    .btn-primary, .btn-secondary {
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-md);
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
    }

    .btn-primary {
      background-color: var(--brand);
      color: white;
      border: none;

      &:hover:not(:disabled) {
        background-color: var(--brand-dark);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .whatsapp-help {
      padding-top: var(--space-5);
      border-top: 1px solid #E0D5C8;

      p {
        font-size: var(--text-sm);
        color: var(--ink-light);
        margin-bottom: var(--space-3);
      }
    }

    .btn-whatsapp {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      background: var(--whatsapp);
      color: white;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: 600;

      &:hover {
        opacity: 0.9;
        color: white;
      }
    }
  `],
})
export class PaymentFailureComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ordersService = inject(OrdersService);

  order = signal<Order | null>(null);
  retrying = signal(false);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const orderNumber = params['order'];
      if (orderNumber) {
        this.loadOrder(orderNumber);
      }
    });
  }

  loadOrder(orderNumber: string) {
    this.ordersService.getOrder(orderNumber).subscribe({
      next: (order) => this.order.set(order),
      error: () => {},
    });
  }

  retryPayment() {
    const order = this.order();
    if (!order) return;

    this.retrying.set(true);

    this.ordersService.createPaymentPreference(order.order_number).subscribe({
      next: (preference) => {
        // Redirect to Mercado Pago
        window.location.href = preference.init_point;
      },
      error: () => {
        this.retrying.set(false);
        alert('No se pudo procesar el pago. Por favor contactá a soporte.');
      },
    });
  }

  encodeWhatsApp(): string {
    const o = this.order();
    const msg = o 
      ? `Hola! Tuve un problema con el pago de mi pedido ${o.order_number}`
      : 'Hola! Tuve un problema con el pago de mi pedido';
    return encodeURIComponent(msg);
  }
}
