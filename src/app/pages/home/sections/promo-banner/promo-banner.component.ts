import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="promo" aria-label="Información y beneficios">
      <div class="top-bars">
        @if (announcement(); as msg) {
          <div class="announcement-bar">
            <p class="announcement-text">
              {{ msg }}
              @if (announcementLink(); as link) {
                <a [routerLink]="link" class="announcement-link">Ver más</a>
              }
            </p>
          </div>
        }

        <div class="trust-bar">
          <div class="trust-bar-inner">
            <span class="trust-bar-item">
              <span class="trust-bar-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              Retiro sin costo · Ciudad de la Costa
            </span>
            <span class="trust-bar-item">
              <span class="trust-bar-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h2"/><path d="M19 18h2c.6 0 1-.4 1-1v-3.65a1 1 0 0 0-.684-.948l-1.923-.615a1 1 0 0 0-.578-.042l-2.843.948a1 1 0 0 1-.578-.042l-2.843-.948a1 1 0 0 0-.578-.042L5.684 8.402a1 1 0 0 0-.684.948V17c0 .6.4 1 1 1h2"/><path d="M14 18V8"/><path d="M2 8h4"/><path d="M18 8h4"/></svg>
              </span>
              Delivery · Montevideo y zona metropolitana
            </span>
            <span class="trust-bar-item trust-bar-mp">
              <img src="assets/mercadopago-logo.svg" alt="Mercado Pago" class="trust-bar-mp-logo" width="44" height="30" loading="lazy" />
              Tarjeta en cuotas, transferencia o efectivo
            </span>
            <span class="trust-bar-item">
              <span class="trust-bar-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </span>
              Listo en 48-72 hs
            </span>
            <span class="trust-bar-secure">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Tu pago y datos están protegidos con Mercado Pago.
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .promo {
      background: var(--surface-white);
    }

    .announcement-bar {
      background: var(--ink);
      color: white;
      padding: var(--space-2) var(--space-4);
      text-align: center;
    }

    .announcement-text {
      font-family: var(--font-sans);
      font-size: 12px;
      font-weight: 500;
      margin: 0;
      letter-spacing: 0.03em;

      @media (min-width: 768px) {
        font-size: 13px;
      }
    }

    .announcement-link {
      margin-left: var(--space-2);
      color: white;
      text-decoration: underline;
      text-underline-offset: 3px;
      font-weight: 600;

      &:hover {
        color: var(--surface-alt);
      }
    }

    .trust-bar {
      background: var(--surface);
      color: var(--ink);
      padding: var(--space-2) var(--space-4);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);

      @media (min-width: 768px) {
        padding: var(--space-3) var(--space-6);
      }
    }

    .trust-bar-inner {
      max-width: var(--container-xl);
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: var(--space-3) var(--space-5);
      font-family: var(--font-sans);
      font-size: 11px;
      color: var(--ink-light);

      @media (min-width: 768px) {
        font-size: 12px;
        gap: var(--space-4) var(--space-6);
      }
    }

    .trust-bar-item {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }

    .trust-bar-icon {
      flex-shrink: 0;
      color: var(--brand);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .trust-bar-mp {
      gap: var(--space-2);
    }

    .trust-bar-mp-logo {
      height: 22px;
      width: auto;
      object-fit: contain;
      display: block;

      @media (min-width: 768px) {
        height: 26px;
      }
    }

    .trust-bar-secure {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      color: var(--ink-muted);
      font-size: 10px;

      @media (min-width: 768px) {
        font-size: 11px;
      }
    }

    .trust-bar-secure svg {
      flex-shrink: 0;
      color: var(--success);
    }
  `],
})
export class PromoBannerComponent {
  /** Mensaje de anuncio (ej. oferta por temporada). Vacío = no se muestra la barra. */
  announcement = signal('Envío gratis en compras mayores a $3.000 · Pedidos con 48-72 hs de anticipación');

  /** Ruta opcional para "Ver más" en el anuncio (ej. /tienda). Null = no se muestra el enlace. */
  announcementLink = signal<string | null>(null);
}

