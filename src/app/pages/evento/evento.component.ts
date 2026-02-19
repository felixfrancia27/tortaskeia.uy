import { Component, computed, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '@app/core/services/cart.service';

export type EventoTipo = 'desayunos' | 'cumpleanos' | 'meriendas' | 'bodas';

interface AddOn {
  id: string;
  label: string;
  description?: string;
  price: number;
  /** Si tiene cantidad, se muestra un selector 1..maxQty */
  maxQty?: number;
}

interface EventoConfig {
  id: EventoTipo;
  title: string;
  subtitle: string;
  addOns: AddOn[];
}

const EVENTOS_CONFIG: Record<EventoTipo, EventoConfig> = {
  desayunos: {
    id: 'desayunos',
    title: 'Desayunos',
    subtitle: 'Mesa dulce y tortas para empezar el día con amor',
    addOns: [
      { id: 'torta-principal', label: 'Torta principal', description: 'Torta para 8-10 porciones', price: 2200 },
      { id: 'mesa-dulce', label: 'Mesa dulce básica', description: 'Brownies, cookies, mini muffins', price: 1800 },
      { id: 'cafe-jugos', label: 'Café y jugos', description: 'Servicio de bebidas calientes y frías', price: 600 },
      { id: 'porciones-extra', label: 'Porciones extra', description: 'Porción adicional', price: 150, maxQty: 20 },
      { id: 'presentacion', label: 'Servicio de presentación', description: 'Montaje y decoración en mesa', price: 500 },
    ],
  },
  cumpleanos: {
    id: 'cumpleanos',
    title: 'Cumpleaños',
    subtitle: 'La torta que soñaste para tu día especial',
    addOns: [
      { id: 'torta-principal', label: 'Torta principal', description: 'Torta personalizada 15-20 porciones', price: 2500 },
      { id: 'cupcakes', label: 'Cupcakes (docena)', description: '12 cupcakes decorados', price: 1200, maxQty: 5 },
      { id: 'mesa-dulce', label: 'Mesa dulce', description: 'Variedad de tortas y postres', price: 2000 },
      { id: 'velas-decoracion', label: 'Velas y decoración', description: 'Velas, topper, detalle temático', price: 400 },
      { id: 'candy-bar', label: 'Candy bar', description: 'Golosinas y dulces para invitados', price: 1500 },
    ],
  },
  meriendas: {
    id: 'meriendas',
    title: 'Meriendas',
    subtitle: 'Tortas y delicias para la tarde',
    addOns: [
      { id: 'torta-principal', label: 'Torta principal', description: 'Torta para 10-12 porciones', price: 2000 },
      { id: 'scones-muffins', label: 'Scones y muffins', description: 'Surrido de 12 piezas', price: 900 },
      { id: 'te-cafe', label: 'Té y café', description: 'Servicio de infusiones', price: 500 },
      { id: 'mesa-dulce-pequena', label: 'Mesa dulce pequeña', description: 'Tortas frutales y budines', price: 1200 },
    ],
  },
  bodas: {
    id: 'bodas',
    title: 'Bodas',
    subtitle: 'Torta de novios y mesa dulce inolvidable',
    addOns: [
      { id: 'torta-novios', label: 'Torta de novios', description: 'Torta principal elegante (porciones según invitados)', price: 4500 },
      { id: 'mesa-dulce-premium', label: 'Mesa dulce premium', description: 'Variedad gourmet y presentación', price: 3500 },
      { id: 'cupcakes-invitados', label: 'Cupcakes para invitados', description: 'Docena de cupcakes', price: 1200, maxQty: 10 },
      { id: 'servicio-corte', label: 'Servicio de corte', description: 'Personal para corte y servicio', price: 800 },
    ],
  },
};

@Component({
  selector: 'app-evento',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (!config()) {
      <div class="evento-page evento-error">
        <div class="container">
          <p>Tipo de evento no encontrado.</p>
          <a routerLink="/">Volver al inicio</a>
        </div>
      </div>
    } @else {
      <section class="evento-page">
        <div class="hero">
          <div class="hero-inner container">
            <div class="hero-copy">
              <p class="eyebrow">EVENTOS PERSONALIZADOS</p>
              <h1>{{ config()!.title }}</h1>
              <p class="subtitle">{{ config()!.subtitle }}</p>
              <ul class="hero-list">
                <li><strong>1.</strong> Elegí qué incluir en tu evento</li>
                <li><strong>2.</strong> Revisá el resumen y el precio estimado</li>
                <li><strong>3.</strong> Continuá al checkout para fecha y pago</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="container builder-layout">
          <section class="builder">
            <div class="builder-step">
              <h2><span>1</span> ¿Qué querés incluir?</h2>
              <p class="step-help">Marcá las opciones que forman parte de tu evento. Los precios son de referencia.</p>
              <div class="addons-grid">
                @for (addon of config()!.addOns; track addon.id) {
                  <div class="addon-card" [class.selected]="isSelected(addon.id)">
                    <label class="addon-label">
                      <input
                        type="checkbox"
                        [checked]="isSelected(addon.id)"
                        (change)="toggleAddon(addon)"
                      />
                      <div class="addon-body">
                        <div class="addon-header">
                          <h3>{{ addon.label }}</h3>
                          <span class="addon-price">{{ formatPrice(addon.price) }}</span>
                        </div>
                        @if (addon.description) {
                          <p class="addon-desc">{{ addon.description }}</p>
                        }
                        @if (addon.maxQty && isSelected(addon.id)) {
                          <div class="addon-qty">
                            <span>Cantidad:</span>
                            <select
                              [value]="getQty(addon.id)"
                              (change)="setQty(addon.id, $any($event.target).value)"
                            >
                              @for (n of range(1, addon.maxQty); track n) {
                                <option [value]="n">{{ n }}</option>
                              }
                            </select>
                          </div>
                        }
                      </div>
                    </label>
                  </div>
                }
              </div>
            </div>
          </section>

          <aside class="summary">
            <h2>Resumen de tu evento</h2>
            <p class="summary-event-type">{{ config()!.title }}</p>

            <div class="summary-block">
              <h3>Incluido</h3>
              @if (selectedLines().length === 0) {
                <p class="summary-sub">Elegí al menos una opción arriba.</p>
              } @else {
                @for (line of selectedLines(); track line.id) {
                  <p class="summary-main">{{ line.label }} @if (line.qty > 1) { × {{ line.qty }} }</p>
                  <p class="summary-sub">{{ formatPrice(line.subtotal) }}</p>
                }
              }
            </div>

            <div class="summary-total">
              <div>
                <p class="total-label">Precio estimado total</p>
                <p class="total-price">{{ formatPrice(totalEstimated()) }}</p>
              </div>
              <p class="total-note">Valores de referencia. El precio final puede ajustarse según detalles acordados.</p>
            </div>

            @if (checkoutError()) {
              <p class="checkout-error">{{ checkoutError() }}</p>
            }
            <button
              type="button"
              class="btn-primary-full"
              (click)="goToCheckout()"
              [disabled]="addingToCart() || totalEstimated() === 0"
            >
              @if (addingToCart()) {
                Agregando al carrito...
              } @else {
                Continuar al Checkout
              }
            </button>

            <p class="secondary-link">
              <a routerLink="/">Volver al inicio</a>
            </p>
          </aside>
        </div>
      </section>
    }
  `,
  styles: [`
    .evento-page {
      background: var(--surface);
      padding-bottom: var(--space-16);
      margin-top: 0;
      padding-top: 0;
    }

    .evento-error {
      padding: var(--space-12);
      text-align: center;
    }
    .evento-error a {
      color: var(--brand);
      font-weight: 600;
    }

    .hero {
      background: #fff;
      padding: var(--space-8) 0 var(--space-10);
      color: var(--ink);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .hero-copy h1 {
      font-family: var(--font-display);
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1.2;
      margin: 0 0 var(--space-3);
      color: var(--ink);
    }

    .eyebrow {
      font-family: var(--font-sans);
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: var(--text-xs);
      color: var(--ink-light);
      margin-bottom: var(--space-2);
    }

    .subtitle {
      font-family: var(--font-sans);
      font-size: var(--text-base);
      max-width: 520px;
      margin-bottom: var(--space-4);
      color: var(--ink);
    }

    .hero-list {
      font-family: var(--font-sans);
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--ink);
    }

    .hero-list li strong { margin-right: var(--space-1); }

    .builder-layout {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(0, 1.1fr);
      gap: var(--space-8);
      margin-top: var(--space-10);
    }
    @media (max-width: 1024px) {
      .builder-layout { grid-template-columns: minmax(0, 1fr); }
    }

    .builder-step {
      background: #fff;
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      margin-bottom: var(--space-4);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
    }

    .builder-step h2 {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 600;
      letter-spacing: 0.02em;
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin: 0 0 var(--space-4);
      color: var(--ink);
    }

    .builder-step h2 span {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      background: var(--brand);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      font-family: var(--font-sans);
      flex-shrink: 0;
    }

    .step-help {
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      color: var(--ink-light);
      margin-bottom: var(--space-3);
    }

    .addons-grid {
      display: grid;
      gap: var(--space-3);
    }

    .addon-card {
      border-radius: var(--radius-lg);
      border: 2px solid #f3e2d5;
      background: #fffaf5;
      transition: all var(--transition-fast);
    }
    .addon-card.selected {
      border-color: var(--brand);
      box-shadow: 0 0 0 3px rgba(var(--brand-rgb), 0.25);
      background: #fff7ed;
    }

    .addon-label {
      display: block;
      cursor: pointer;
      padding: var(--space-4);
      margin: 0;
    }

    .addon-label input {
      display: none;
    }

    .addon-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-2);
      margin-bottom: var(--space-1);
    }

    .addon-body h3 {
      font-family: var(--font-display);
      font-size: var(--text-base);
      font-weight: 600;
      margin: 0;
      color: var(--ink);
    }

    .addon-price {
      font-family: var(--font-sans);
      font-weight: 700;
      font-size: var(--text-sm);
      color: var(--ink);
      flex-shrink: 0;
    }

    .addon-desc {
      font-size: var(--text-xs);
      color: var(--ink-light);
      margin: 0 0 var(--space-2);
      line-height: 1.4;
    }

    .addon-qty {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-xs);
      color: var(--ink-light);
    }
    .addon-qty select {
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-md);
      border: 1px solid #e4d4c4;
      font-size: var(--text-sm);
    }

    .summary {
      background: #fff;
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
      height: fit-content;
      position: sticky;
      top: var(--space-6);
    }

    .summary h2 {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 600;
      margin-bottom: var(--space-2);
      color: var(--ink);
    }

    .summary-event-type {
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      color: var(--ink-light);
      margin: 0 0 var(--space-4);
    }

    .summary-block {
      padding-bottom: var(--space-3);
      margin-bottom: var(--space-3);
      border-bottom: 1px dashed #e5d4c6;
    }

    .summary-block h3 {
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--ink-light);
      margin-bottom: var(--space-2);
    }

    .summary-main {
      font-family: var(--font-display);
      font-size: var(--text-sm);
      font-weight: 600;
      margin: 0 0 2px;
      color: var(--ink);
    }

    .summary-sub {
      font-size: var(--text-xs);
      color: var(--ink-light);
      margin: 0 0 var(--space-2);
    }

    .summary-total {
      padding-top: var(--space-3);
      margin-top: var(--space-1);
      border-top: 1px solid #e5d4c6;
    }

    .total-label {
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--ink-light);
      margin-bottom: 2px;
    }

    .total-price {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: 700;
      margin: 0;
      color: var(--ink);
    }

    .total-note {
      font-size: var(--text-xs);
      color: var(--ink-light);
      margin-top: var(--space-2);
    }

    .btn-primary-full {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      text-align: center;
      margin-top: var(--space-5);
      padding: var(--space-3) var(--space-4);
      min-height: 44px;
      background: var(--brand);
      color: #fff;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: var(--text-xs);
      transition: all var(--transition-fast);
      cursor: pointer;
    }
    .btn-primary-full:hover:not(:disabled) {
      background: var(--brand-dark);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(249, 115, 22, 0.35);
    }
    .btn-primary-full:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .checkout-error {
      margin-top: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: #fef2f2;
      color: #b91c1c;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      margin-bottom: 0;
    }

    .secondary-link {
      margin-top: var(--space-3);
      font-size: var(--text-xs);
      color: var(--ink-light);
    }
    .secondary-link a {
      color: var(--brand);
      font-weight: 600;
    }
  `],
})
export class EventoComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartService = inject(CartService);

  /** Tipo desde la URL */
  config = computed<EventoConfig | null>(() => {
    const t = this.route.snapshot.paramMap.get('tipo') as EventoTipo | null;
    if (!t || !EVENTOS_CONFIG[t]) return null;
    return EVENTOS_CONFIG[t];
  });

  /** id -> quantity (1 por defecto) */
  selectedQties = signal<Record<string, number>>({});

  addingToCart = signal(false);
  checkoutError = signal<string | null>(null);

  formatPrice(value: number): string {
    return '$' + value.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  range(start: number, end: number): number[] {
    const r: number[] = [];
    for (let i = start; i <= end; i++) r.push(i);
    return r;
  }

  isSelected(id: string): boolean {
    return this.selectedQties().hasOwnProperty(id) && this.selectedQties()[id] > 0;
  }

  getQty(id: string): number {
    return this.selectedQties()[id] ?? 0;
  }

  setQty(id: string, value: string): void {
    const n = Math.max(0, parseInt(value, 10) || 0);
    this.selectedQties.update((q) => ({ ...q, [id]: n }));
  }

  toggleAddon(addon: AddOn): void {
    const cur = this.selectedQties()[addon.id];
    const isOn = cur !== undefined && cur > 0;
    const defaultQty = addon.maxQty ? 1 : 1;
    this.selectedQties.update((q) => {
      const next = { ...q };
      if (isOn) {
        delete next[addon.id];
      } else {
        next[addon.id] = defaultQty;
      }
      return next;
    });
  }

  /** Líneas para el resumen: { id, label, qty, subtotal } */
  selectedLines = computed(() => {
    const cfg = this.config();
    const qties = this.selectedQties();
    if (!cfg) return [];
    return cfg.addOns
      .filter((a) => qties[a.id] && qties[a.id] > 0)
      .map((a) => ({
        id: a.id,
        label: a.label,
        qty: qties[a.id],
        subtotal: a.price * qties[a.id],
      }));
  });

  totalEstimated = computed(() => {
    return this.selectedLines().reduce((sum, l) => sum + l.subtotal, 0);
  });

  goToCheckout(): void {
    const cfg = this.config();
    if (!cfg || this.totalEstimated() <= 0) return;
    this.checkoutError.set(null);
    this.addingToCart.set(true);

    const lines = this.selectedLines();
    const name = `Evento ${cfg.title} — ${lines.map((l) => (l.qty > 1 ? `${l.label} ×${l.qty}` : l.label)).join(', ')}`;
    const notes = lines.map((l) => `${l.label}${l.qty > 1 ? ` × ${l.qty}` : ''}: $${l.subtotal}`).join(' | ');

    this.cartService
      .addCustomItem({
        name,
        price: this.totalEstimated(),
        quantity: 1,
        notes: `[Evento] ${cfg.id}\n${notes}`,
      })
      .subscribe({
        next: (cart) => {
          this.addingToCart.set(false);
          if (cart) {
            this.router.navigate(['/checkout']);
          } else {
            this.checkoutError.set('No se pudo agregar al carrito. Verificá que el backend esté corriendo.');
          }
        },
        error: () => {
          this.addingToCart.set(false);
          this.checkoutError.set('No se pudo agregar al carrito. Verificá tu conexión e intentá de nuevo.');
        },
      });
  }
}
