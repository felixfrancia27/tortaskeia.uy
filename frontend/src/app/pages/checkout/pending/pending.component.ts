import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersService, Order } from '@app/core/services/orders.service';

@Component({
  selector: 'app-payment-pending',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <section class="pending-page">
      <div class="container">
        <div class="pending-card">
          <div class="pending-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          
          <h1>Pago en proceso</h1>
          
          @if (order()) {
            <p class="order-number">Orden: <strong>{{ order()!.order_number }}</strong></p>
          }
          
          <p class="message">
            Tu pago está siendo procesado. Esto puede tomar algunos minutos dependiendo 
            del método de pago elegido.
          </p>

          @if (order()) {
            <div class="order-summary">
              <h3>Resumen de tu pedido</h3>
              <div class="summary-row">
                <span>Total a pagar:</span>
                <strong>{{ order()!.total | currency:'UYU':'$':'1.0-0' }}</strong>
              </div>
              <div class="summary-row">
                <span>Estado:</span>
                <span class="status-badge">{{ ordersService.getStatusLabel(order()!.status) }}</span>
              </div>
            </div>
          }

          <div class="info-box">
            <h3>¿Qué pasa ahora?</h3>
            <ul>
              <li>
                <strong>Pago con efectivo (ej: Abitab, RedPagos):</strong>
                Tenés hasta 3 días para completar el pago en el local indicado.
              </li>
              <li>
                <strong>Transferencia bancaria:</strong>
                El pago puede demorar hasta 2 días hábiles en acreditarse.
              </li>
              <li>
                <strong>Tarjeta de débito/crédito:</strong>
                La aprobación suele ser inmediata, pero puede demorar unos minutos.
              </li>
            </ul>
          </div>

          <div class="notification-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            <p>
              Te notificaremos por email cuando el pago sea confirmado. 
              También podés verificar el estado en <a routerLink="/mis-pedidos">Mis Pedidos</a>.
            </p>
          </div>

          <div class="actions">
            <a routerLink="/" class="btn-primary">Volver al Inicio</a>
            <a routerLink="/mis-pedidos" class="btn-secondary">Ver Mis Pedidos</a>
          </div>

          <div class="whatsapp-help">
            <p>¿Tenés dudas sobre tu pago?</p>
            <a 
              [href]="'https://wa.me/59899123456?text=' + encodeWhatsApp()" 
              target="_blank" 
              class="btn-whatsapp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Escribinos
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .pending-page {
      padding: var(--space-24) 0 var(--space-16);
      background-color: var(--surface);
      min-height: 80vh;
    }

    .pending-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-10);
      text-align: center;
      max-width: 650px;
      margin: 0 auto;
    }

    .pending-icon {
      color: #F59E0B;
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

    .order-summary {
      background: var(--surface);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin-bottom: var(--space-6);
      text-align: left;

      h3 {
        font-size: var(--text-sm);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--ink-light);
        margin-bottom: var(--space-3);
      }
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-2) 0;

      &:not(:last-child) {
        border-bottom: 1px solid #E0D5C8;
      }

      strong {
        font-size: var(--text-lg);
        color: var(--brand);
      }
    }

    .status-badge {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      background: #FEF3C7;
      color: #D97706;
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      font-weight: 600;
    }

    .info-box {
      text-align: left;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin-bottom: var(--space-6);

      h3 {
        font-size: var(--text-base);
        color: #1E40AF;
        margin-bottom: var(--space-3);
      }

      ul {
        margin: 0;
        padding-left: var(--space-5);

        li {
          font-size: var(--text-sm);
          color: #1E3A8A;
          margin-bottom: var(--space-3);
          line-height: 1.5;

          strong {
            display: block;
            margin-bottom: 2px;
          }
        }
      }
    }

    .notification-info {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--surface);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-6);
      text-align: left;

      svg {
        flex-shrink: 0;
        color: var(--brand);
      }

      p {
        font-size: var(--text-sm);
        color: var(--ink-light);
        margin: 0;

        a {
          color: var(--brand);
          font-weight: 600;

          &:hover {
            text-decoration: underline;
          }
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
export class PaymentPendingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  ordersService = inject(OrdersService);

  order = signal<Order | null>(null);

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

  encodeWhatsApp(): string {
    const o = this.order();
    const msg = o 
      ? `Hola! Tengo una consulta sobre el pago de mi pedido ${o.order_number}`
      : 'Hola! Tengo una consulta sobre el pago de mi pedido';
    return encodeURIComponent(msg);
  }
}
