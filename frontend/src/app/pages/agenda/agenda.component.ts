import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '@app/core/services/cart.service';

interface SizeOption {
  id: string;
  label: string;
  description: string;
  basePrice: number;
  badge?: string;
}

interface Option {
  id: string;
  label: string;
  note?: string;
}

/** Relleno unificado (simple o premium) para mostrar en un solo bloque */
interface FillingOption {
  id: string;
  label: string;
  isPremium: boolean;
}

interface SimpleDesign {
  id: string;
  name: string;
  imageUrl: string;
}

/** Galería de diseños simples. Imágenes en assets/designs/ */
const SIMPLE_DESIGNS: SimpleDesign[] = [
  { id: 'clasico-blanco', name: 'Clásico blanco', imageUrl: 'assets/designs/simple-1.png' },
  { id: 'floral-delicate', name: 'Floral delicado', imageUrl: 'assets/designs/simple-2.png' },
  { id: 'frutos-rojos', name: 'Frutas y crema', imageUrl: 'assets/designs/simple-3.png' },
  { id: 'chocolate-elegante', name: 'Chocolate elegante', imageUrl: 'assets/designs/simple-4.png' },
  { id: 'naked-vainilla', name: 'Naked vainilla', imageUrl: 'assets/designs/simple-5.png' },
  { id: 'minimalista', name: 'Minimalista', imageUrl: 'assets/designs/simple-6.png' },
];

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, FormsModule],
  template: `
    <section class="create-cake-page">
      <!-- Hero -->
      <div class="hero">
        <div class="hero-inner container">
          <div class="hero-copy">
            <p class="eyebrow">TORTAS PERSONALIZADAS</p>
            <h1>Crea tu torta soñada</h1>
            <p class="subtitle">
              Combiná tamaño, relleno y estilo. Si elegís un <strong>diseño simple</strong> de la galería,
              vas directo al checkout (fecha y pago). Si preferís un <strong>diseño elaborado</strong>, te pasamos por WhatsApp.
            </p>
            <ul class="hero-list">
              <li><strong>1.</strong> Elegí tamaño y bizcochuelo base</li>
              <li><strong>2.</strong> Elegí un relleno (simple o premium)</li>
              <li><strong>3.</strong> Diseño simple → checkout · Diseño elaborado → WhatsApp</li>
            </ul>
          </div>
          <div class="hero-card">
            <p class="hero-card-title">Capacidad &amp; agenda</p>
            <p class="hero-card-copy">
              Preparamos <strong>hasta 2 tortas por día</strong>.
            </p>
            <p class="hero-card-copy">
              <strong>Diseño simple:</strong> al terminar vas al carrito, elegís la fecha de entrega en el calendario y pagás de forma segura (Mercado Pago).
            </p>
            <p class="hero-card-copy">
              <strong>Diseño elaborado:</strong> enviamos tu pedido por WhatsApp y coordinamos fecha, detalles y precio final contigo.
            </p>
            <p class="hero-card-note">
              El precio mostrado es <strong>estimado</strong>; puede variar levemente según el diseño acordado.
            </p>
          </div>
        </div>
      </div>

      <div class="container builder-layout">
        <!-- Configurador -->
        <section class="builder">
          <!-- Paso 1: Tamaño -->
          <div class="builder-step">
            <h2><span>1</span> Elegí el tamaño</h2>
            <div class="size-grid">
              @for (size of sizeOptions; track size.id) {
                <button
                  type="button"
                  class="size-card"
                  [class.selected]="selectedSizeId() === size.id"
                  (click)="selectSize(size.id)"
                >
                  <div class="size-header">
                    <h3>{{ size.label }}</h3>
                    @if (size.badge) {
                      <span class="size-badge">{{ size.badge }}</span>
                    }
                  </div>
                  <p class="size-description">{{ size.description }}</p>
                  <p class="size-price">{{ size.basePrice | currency:'UYU':'$':'1.0-0' }}</p>
                </button>
              }
            </div>
          </div>

          <!-- Paso 2: Bizcochuelo -->
          <div class="builder-step">
            <h2><span>2</span> Bizcochuelo</h2>
            <p class="step-help">Elegí la base de tu torta. Todas son esponjosas y húmedas.</p>
            <div class="chip-row">
              @for (b of baseFlavors; track b.id) {
                <button
                  type="button"
                  class="chip"
                  [class.chip-selected]="selectedBaseId() === b.id"
                  (click)="selectedBaseId.set(b.id)"
                >
                  {{ b.label }}
                </button>
              }
            </div>
          </div>

          <!-- Paso 3: Rellenos (10 = 1, 15 = 2, 30 = varios) -->
          <div class="builder-step">
            <h2><span>3</span> Rellenos</h2>
            @if (isSize10() || isSize15()) {
              <p class="step-help">Elegí <strong>1 relleno</strong> (simple o premium) para tu torta.</p>
            } @else {
              <p class="step-help">
                Podés combinar rellenos simples (hasta 2) y premium (<strong>+ $200</strong> c/u).
              </p>
            }
            <div class="chip-row chip-row-fillings">
              @for (f of allFillings(); track f.id) {
                <button
                  type="button"
                  class="chip"
                  [class.chip-premium]="f.isPremium"
                  [class.chip-selected]="isFillingSelected(f)"
                  (click)="toggleFilling(f)"
                >
                  <span class="chip-main">{{ f.label }}</span>
                  @if (f.isPremium) {
                    <span class="chip-note">+ $200</span>
                  }
                </button>
              }
            </div>
          </div>

          <!-- Paso 4: Diseño -->
          <div class="builder-step">
            <h2><span>4</span> Estilo de diseño</h2>
            <div class="design-options">
              <label class="design-card" [class.design-card-selected]="designType() === 'simple'">
                <input
                  type="radio"
                  name="design"
                  value="simple"
                  [checked]="designType() === 'simple'"
                  (change)="designType.set('simple')"
                />
                <div class="design-body">
                  <h3>Diseño simple (incluido)</h3>
                  <p>
                    Tortas limpias, elegantes, con 1–2 colores, drip sencillo, topper básico
                    o mensaje corto.
                  </p>
                </div>
              </label>

              <label class="design-card" [class.design-card-selected]="designType() === 'elaborado'">
                <input
                  type="radio"
                  name="design"
                  value="elaborado"
                  [checked]="designType() === 'elaborado'"
                  (change)="designType.set('elaborado')"
                />
                <div class="design-body">
                  <h3>Diseño elaborado</h3>
                  <p>
                    Temáticas complejas, figuras, muchas flores, texturas especiales, etc.
                    El precio final se ajusta según la complejidad.
                  </p>
                  <textarea
                    rows="3"
                    placeholder="Contame idea, temática, colores, edad, referencia de Pinterest, etc."
                    [(ngModel)]="designNotes"
                  ></textarea>
                </div>
              </label>
            </div>

            @if (designType() === 'simple') {
              <p class="step-help design-gallery-label">Elegí un diseño de la galería</p>
              <div class="design-gallery">
                @for (d of simpleDesigns; track d.id) {
                  <button
                    type="button"
                    class="design-gallery-card"
                    [class.selected]="selectedSimpleDesignId() === d.id"
                    (click)="selectedSimpleDesignId.set(d.id)"
                  >
                    <img [src]="d.imageUrl" [alt]="d.name" width="280" height="280" />
                    <span class="design-gallery-name">{{ d.name }}</span>
                  </button>
                }
              </div>
            }
          </div>
        </section>

        <!-- Resumen -->
        <aside class="summary">
          <h2>Resumen de tu torta</h2>

          <div class="summary-block">
            <h3>Tamaño</h3>
            <p class="summary-main">{{ currentSize().label }}</p>
            <p class="summary-sub">{{ currentSize().description }}</p>
          </div>

          <div class="summary-block">
            <h3>Sabores</h3>
            <p class="summary-main">Bizcochuelo: {{ baseLabel() }}</p>
            @if (isSize10() || isSize15()) {
              <p class="summary-sub">
                Relleno(s): {{ fillingSummaryLabel() }}
              </p>
            } @else {
              <p class="summary-sub">
                Rellenos simples: {{ simpleLabels().length ? simpleLabels().join(', ') : 'a definir' }}
              </p>
              <p class="summary-sub">
                Rellenos premium: {{ premiumLabels().length ? premiumLabels().join(', ') : 'opcional (+$200 c/u)' }}
              </p>
            }
          </div>

          <div class="summary-block">
            <h3>Diseño</h3>
            <p class="summary-main">
              @if (designType() === 'simple') {
                @if (selectedSimpleDesignName(); as name) {
                  {{ name }}
                } @else {
                  Diseño simple — elegí uno en la galería
                }
              } @else {
                Diseño elaborado
              }
            </p>
            @if (designType() === 'elaborado' && designNotes.trim()) {
              <p class="summary-sub">{{ designNotes }}</p>
            }
            @if (designType() === 'elaborado' && !designNotes.trim()) {
              <p class="summary-sub">Podés contarnos tu idea en el siguiente paso o por WhatsApp.</p>
            }
          </div>

          <div class="summary-total">
            <div>
              <p class="total-label">Precio estimado</p>
              <p class="total-price">{{ estimatedPrice() | currency:'UYU':'$':'1.0-0' }}</p>
            </div>
            <p class="total-note">
              Base según tamaño seleccionado + $200 por cada relleno premium.
              El precio final puede variar según el diseño acordado.
            </p>
          </div>

          @if (designType() === 'simple') {
            @if (checkoutError()) {
              <p class="checkout-error">{{ checkoutError() }}</p>
            }
            <button 
              type="button" 
              class="btn-primary-full" 
              (click)="goToCheckout()"
              [disabled]="addingToCart()"
            >
              @if (addingToCart()) {
                Agregando al carrito...
              } @else {
                Continuar al Checkout
              }
            </button>
          } @else {
            <a
              class="btn-primary-full"
              [href]="whatsappUrl()"
              target="_blank"
              rel="noopener"
            >
              Armar pedido por WhatsApp
            </a>
          }

          <p class="secondary-link">
            ¿Preferís elegir una torta de la tienda?
            <a routerLink="/tienda">Ver todas las tortas</a>
          </p>
        </aside>
      </div>
    </section>
  `,
  styles: [`
    /* La sección empieza donde termina la raya blanca del header (sin espacio) */
    .create-cake-page {
      background: var(--surface);
      padding-bottom: var(--space-16);
      margin-top: 0;
      padding-top: 0;
    }

    /* Hero "Crea tu torta soñada" en blanco, continúa desde la línea blanca del header */
    .hero {
      background: #fff;
      padding: var(--space-8) 0 var(--space-10);
      color: var(--ink);
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .hero-inner {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(0, 1.2fr);
      gap: var(--space-8);
      align-items: center;

      @media (max-width: 960px) {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .hero-copy h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1.2;
      margin: 0 0 var(--space-3);
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
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

    .hero-list li strong {
      margin-right: var(--space-1);
    }

    .hero-card {
      background: var(--surface);
      color: var(--ink);
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(0, 0, 0, 0.06);
    }

    .hero-card-title {
      font-family: var(--font-sans);
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: var(--text-xs);
      color: var(--ink-light);
      margin-bottom: var(--space-2);
    }

    .hero-card-copy {
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      margin-bottom: var(--space-3);
      color: var(--ink);
    }

    .hero-card-note {
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      color: var(--ink-light);
    }

    .builder-layout {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(0, 1.1fr);
      gap: var(--space-8);
      margin-top: var(--space-10);

      @media (max-width: 1024px) {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .builder-step {
      background: #fff;
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      margin-bottom: var(--space-4);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
    }

    .builder-step h2 {
      font-family: 'Playfair Display', Georgia, serif;
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

    .size-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: var(--space-4);
      align-items: stretch;
    }

    .size-card {
      border-radius: var(--radius-lg);
      padding: var(--space-4) var(--space-4) var(--space-3);
      border: 2px solid #f3e2d5;
      background: #fffaf5;
      text-align: left;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-3);
      min-height: 172px;
    }

    .size-card.selected {
      border-color: var(--brand);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.25);
      background: #fff7ed;
    }

    .size-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .size-card h3 {
      flex: 1;
      min-width: 0;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: var(--text-base);
      font-weight: 600;
      margin: 0;
      color: var(--ink);
      letter-spacing: 0.01em;
      -webkit-font-smoothing: antialiased;
    }

    .size-badge {
      font-family: var(--font-sans);
      font-size: 9px;
      font-weight: 600;
      padding: 5px 8px;
      border-radius: 999px;
      background: #0ea5e9;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      flex-shrink: 0;
      line-height: 1.2;
      white-space: nowrap;
    }

    .size-description {
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      color: var(--ink-light);
      margin: 0;
      line-height: 1.4;
    }

    .size-price {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      margin: 0;
      font-size: var(--text-xl);
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
    }

    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .chip {
      border-radius: 999px;
      border: 1px solid #e4d4c4;
      padding: 6px 12px;
      background: #fff;
      font-size: var(--text-xs);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      transition: all var(--transition-fast);
    }

    .chip:hover {
      border-color: var(--brand);
    }

    .chip-selected,
    .chip.chip-selected.chip-premium {
      background: var(--brand) !important;
      color: #fff !important;
      border-color: var(--brand) !important;
    }
    .chip-selected .chip-note {
      color: #fff;
      opacity: 1;
    }

    /* Sin seleccionar: mismo aspecto que simples */
    .chip-premium {
      background: #fff;
    }
    .chip-premium:hover {
      border-color: var(--brand);
    }

    .chip-main {
      font-weight: 500;
    }

    .chip-note {
      font-size: 11px;
      opacity: 0.8;
    }

    .design-options {
      display: grid;
      gap: var(--space-3);
    }

    .design-card {
      display: block;
      border-radius: var(--radius-lg);
      border: 2px solid #e4d4c4;
      padding: var(--space-4);
      background: #fff;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .design-card-selected {
      border-color: var(--brand);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.25);
    }

    .design-card input {
      display: none;
    }

    .design-card:hover {
      border-color: var(--brand);
    }

    .design-body h3 {
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 600;
      margin: 0 0 var(--space-1);
      font-size: var(--text-sm);
      -webkit-font-smoothing: antialiased;
    }

    .design-body p {
      font-size: var(--text-xs);
      color: var(--ink-light);
      margin: 0 0 var(--space-3);
    }

    .design-body textarea {
      width: 100%;
      resize: vertical;
      min-height: 70px;
      font-size: var(--text-sm);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      border: 1px solid #e4d4c4;
    }

    .design-gallery-label {
      margin-top: var(--space-4);
    }

    .design-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--space-3);
      margin-top: var(--space-2);
    }

    .design-gallery-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      border-radius: var(--radius-lg);
      border: 2px solid #e4d4c4;
      padding: 0;
      background: #fff;
      cursor: pointer;
      overflow: hidden;
      transition: all var(--transition-fast);
    }

    .design-gallery-card:hover {
      border-color: var(--brand);
    }

    .design-gallery-card.selected {
      border-color: var(--brand);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.25);
    }

    .design-gallery-card img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      display: block;
    }

    .design-gallery-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: var(--text-xs);
      font-weight: 600;
      padding: var(--space-2);
      text-align: center;
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
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
      font-family: 'Playfair Display', Georgia, serif;
      font-size: var(--text-lg);
      font-weight: 600;
      margin-bottom: var(--space-4);
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
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
      font-family: 'Playfair Display', Georgia, serif;
      font-size: var(--text-sm);
      font-weight: 600;
      margin: 0 0 2px;
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
    }

    .summary-sub {
      font-size: var(--text-xs);
      color: var(--ink-light);
      margin: 0;
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
      font-family: 'Playfair Display', Georgia, serif;
      font-size: var(--text-2xl);
      font-weight: 700;
      margin: 0;
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
    }

    .total-note {
      font-size: var(--text-xs);
      color: var(--ink-light);
      margin-top: var(--space-2);
    }

    .btn-primary-full {
      display: block;
      width: 100%;
      text-align: center;
      margin-top: var(--space-5);
      padding: var(--space-3) var(--space-4);
      background: var(--brand);
      color: #fff;
      border-radius: var(--radius-md);
      font-weight: 600;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: var(--text-xs);
      transition: all var(--transition-fast);
    }

    .btn-primary-full:hover:not(:disabled) {
      background: var(--brand-dark);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(249, 115, 22, 0.35);
    }

    .btn-primary-full:disabled {
      opacity: 0.8;
      cursor: wait;
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
export class AgendaComponent {
  sizeOptions: SizeOption[] = [
    {
      id: '10',
      label: '10 porciones',
      description: '18cm diámetro · 10cm alto · ~2kg',
      basePrice: 1800,
      badge: 'Ideal reuniones pequeñas',
    },
    {
      id: '15',
      label: '15 porciones',
      description: '23cm diámetro · 10cm alto · ~3kg',
      basePrice: 2500,
      badge: 'Más elegida',
    },
    {
      id: '30',
      label: '30 porciones',
      description: '28cm diámetro · 15cm alto · ~6kg',
      basePrice: 3800,
      badge: 'Eventos grandes',
    },
  ];

  baseFlavors: Option[] = [
    { id: 'vainilla', label: 'Vainilla' },
    { id: 'chocolate', label: 'Chocolate' },
    { id: 'naranja', label: 'Naranja' },
    { id: 'limon', label: 'Limón' },
    { id: 'carrot', label: 'Carrot Cake' },
    { id: 'red-velvet', label: 'Red Velvet' },
    { id: 'canela', label: 'Canela' },
  ];

  simpleFillings: Option[] = [
    { id: 'chantilly', label: 'Crema chantilly' },
    { id: 'caramelo', label: 'Crema de caramelo' },
    { id: 'pastelera', label: 'Crema pastelera' },
    { id: 'curd-limon', label: 'Curd de limón' },
    { id: 'ddl', label: 'Dulce de leche' },
    { id: 'mousse-choc', label: 'Mousse de chocolate' },
    { id: 'mousse-ddl', label: 'Mousse de dulce de leche' },
  ];

  premiumFillings: Option[] = [
    { id: 'oreo', label: 'Chantilly con Oreo' },
    { id: 'pepitos', label: 'Chantilly con Pepitos' },
    { id: 'caramelo-mani', label: 'Caramelo & maní crunchy' },
    { id: 'queso-crema', label: 'Frosting de queso crema' },
    { id: 'ganache-negro', label: 'Ganache de chocolate negro' },
    { id: 'ganache-blanco', label: 'Ganache de chocolate blanco' },
    { id: 'mani-dulce', label: 'Mantequilla de maní dulce' },
  ];

  selectedSizeId = signal<string>('15');
  selectedBaseId = signal<string>('vainilla');
  selectedSimpleIds = signal<string[]>([]);
  selectedPremiumIds = signal<string[]>([]);
  /** Solo para 10/15 porciones: un único relleno (simple o premium) */
  /** Para 10 y 15 porciones: un único relleno (simple o premium) */
  selectedSingleFillingId = signal<string | null>(null);
  designType = signal<'simple' | 'elaborado'>('simple');
  designNotes = '';
  simpleDesigns: SimpleDesign[] = SIMPLE_DESIGNS;
  /** Por defecto el primer diseño de la galería queda seleccionado */
  selectedSimpleDesignId = signal<string | null>(SIMPLE_DESIGNS[0]?.id ?? null);
  addingToCart = signal(false);
  checkoutError = signal<string | null>(null);

  private router = inject(Router);
  private cartService = inject(CartService);

  /** Al cambiar tamaño, sincronizar rellenos: 10 y 15 = 1 solo, 30 = varios */
  selectSize(sizeId: string): void {
    const prevSize = this.selectedSizeId();
    if (prevSize === sizeId) return;
    this.selectedSizeId.set(sizeId);
    if (sizeId === '10' || sizeId === '15') {
      const first = this.selectedSimpleIds()[0] ?? this.selectedPremiumIds()[0] ?? this.selectedSingleFillingId() ?? null;
      if (first) this.selectedSingleFillingId.set(first);
      this.selectedSimpleIds.set([]);
      this.selectedPremiumIds.set([]);
    } else {
      const single = this.selectedSingleFillingId();
      const id = single ?? null;
      const simple: string[] = [];
      const premium: string[] = [];
      if (id) {
        const f = this.allFillings().find(x => x.id === id);
        if (f?.isPremium) premium.push(id);
        else simple.push(id);
      }
      this.selectedSimpleIds.set(simple.slice(0, 2));
      this.selectedPremiumIds.set(premium);
      this.selectedSingleFillingId.set(null);
    }
  }

  /** Lista unificada de rellenos (simples + premium) en un solo bloque */
  allFillings = computed((): FillingOption[] => {
    const simple: FillingOption[] = this.simpleFillings.map(f => ({ id: f.id, label: f.label, isPremium: false }));
    const premium: FillingOption[] = this.premiumFillings.map(f => ({ id: f.id, label: f.label, isPremium: true }));
    return [...simple, ...premium];
  });

  isSize10 = computed(() => this.selectedSizeId() === '10');
  isSize15 = computed(() => this.selectedSizeId() === '15');

  currentSize = computed(() => {
    return this.sizeOptions.find(s => s.id === this.selectedSizeId()) ?? this.sizeOptions[1];
  });

  estimatedPrice = computed(() => {
    const base = this.currentSize().basePrice;
    if (this.isSize10() || this.isSize15()) {
      const id = this.selectedSingleFillingId();
      return base + (id && this.premiumFillings.some(p => p.id === id) ? 200 : 0);
    }
    return base + this.selectedPremiumIds().length * 200;
  });

  baseLabel = computed(() => {
    return this.baseFlavors.find(b => b.id === this.selectedBaseId())?.label ?? 'A definir';
  });

  simpleLabels = computed(() => {
    const ids = new Set(this.selectedSimpleIds());
    return this.simpleFillings.filter(f => ids.has(f.id)).map(f => f.label);
  });

  premiumLabels = computed(() => {
    const ids = new Set(this.selectedPremiumIds());
    return this.premiumFillings.filter(f => ids.has(f.id)).map(f => f.label);
  });

  selectedSimpleDesignName = computed(() => {
    const id = this.selectedSimpleDesignId();
    if (!id) return null;
    return this.simpleDesigns.find(d => d.id === id)?.name ?? null;
  });

  /** Si el relleno está seleccionado (10 y 15 = 1 solo, 30 = multi) */
  isFillingSelected(f: FillingOption): boolean {
    if (this.isSize10() || this.isSize15()) return this.selectedSingleFillingId() === f.id;
    return f.isPremium ? this.selectedPremiumIds().includes(f.id) : this.selectedSimpleIds().includes(f.id);
  }

  /** Click en un relleno: 10 y 15 = 1 solo, 30 = múltiples */
  toggleFilling(f: FillingOption): void {
    if (this.isSize10() || this.isSize15()) {
      this.selectedSingleFillingId.set(this.selectedSingleFillingId() === f.id ? null : f.id);
      return;
    }
    if (f.isPremium) {
      this.togglePremium(f.id);
    } else {
      this.toggleSimple(f.id);
    }
  }

  /** Texto resumen: 10 y 15 = 1 nombre, 30 = líneas separadas en el resumen */
  fillingSummaryLabel(): string {
    if (this.isSize10() || this.isSize15()) {
      const id = this.selectedSingleFillingId();
      if (!id) return 'a definir';
      return this.allFillings().find(x => x.id === id)?.label ?? 'a definir';
    }
    return '';
  }

  isSimpleSelected(id: string): boolean {
    return this.selectedSimpleIds().includes(id);
  }

  toggleSimple(id: string): void {
    const current = this.selectedSimpleIds();
    if (current.includes(id)) {
      this.selectedSimpleIds.set(current.filter(x => x !== id));
    } else {
      if (current.length >= 2) {
        this.selectedSimpleIds.set([current[1], id]);
      } else {
        this.selectedSimpleIds.set([...current, id]);
      }
    }
  }

  isPremiumSelected(id: string): boolean {
    return this.selectedPremiumIds().includes(id);
  }

  togglePremium(id: string): void {
    const current = this.selectedPremiumIds();
    if (current.includes(id)) {
      this.selectedPremiumIds.set(current.filter(x => x !== id));
    } else {
      this.selectedPremiumIds.set([...current, id]);
    }
  }

  whatsappUrl(): string {
    const size = this.currentSize();
    const base = this.baseLabel();
    const rellenoLine = (this.isSize10() || this.isSize15())
      ? `Relleno(s): ${this.fillingSummaryLabel()}`
      : `Rellenos simples: ${this.simpleLabels().length ? this.simpleLabels().join(', ') : 'a definir'}\nRellenos premium: ${this.premiumLabels().length ? this.premiumLabels().join(', ') : 'a definir'}`;
    const diseño = this.designType() === 'simple'
      ? (this.selectedSimpleDesignName() ? `Diseño simple: ${this.selectedSimpleDesignName()}` : 'Diseño simple (incluido)')
      : 'Diseño elaborado';

    const lines = [
      'Hola! Quiero crear una torta personalizada 🎂',
      '',
      `Tamaño: ${size.label} (${size.description})`,
      `Bizcochuelo: ${base}`,
      rellenoLine,
      `Diseño: ${diseño}`,
    ];

    if (this.designNotes.trim()) {
      lines.push(`Detalles de diseño: ${this.designNotes.trim()}`);
    }

    lines.push('');
    lines.push(`Precio estimado: $${this.estimatedPrice()}`);
    lines.push('');
    lines.push('¿Podemos coordinar fechas disponibles y forma de entrega?');

    const text = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/59899123456?text=${text}`;
  }

  /** Nombre del ítem para el carrito (diseño + tamaño) */
  private buildCustomProductName(): string {
    const size = this.currentSize().label;
    const designName = this.selectedSimpleDesignName() ?? 'Diseño simple';
    return `Torta personalizada — ${size} · ${designName}`;
  }

  /** Notas con toda la config (para el ítem y para el pedido) */
  private buildCartNotes(): string {
    const size = this.currentSize();
    const designName = this.selectedSimpleDesignName();
    const rellenoStr = (this.isSize10() || this.isSize15())
      ? `Relleno(s): ${this.fillingSummaryLabel()}`
      : `Rellenos simples: ${this.simpleLabels().length ? this.simpleLabels().join(', ') : 'a definir'} | Rellenos premium: ${this.premiumLabels().length ? this.premiumLabels().join(', ') : 'ninguno'}`;
    const parts = [
      `Tamaño: ${size.label}`,
      `Bizcochuelo: ${this.baseLabel()}`,
      rellenoStr,
      `Diseño: ${designName ?? 'simple'}`,
      `Diseño ID: ${this.selectedSimpleDesignId() ?? ''}`,
    ];
    return parts.join(' | ');
  }

  goToCheckout(): void {
    if (this.designType() !== 'simple') return;
    this.checkoutError.set(null);
    this.addingToCart.set(true);
    const designId = this.selectedSimpleDesignId() ?? this.simpleDesigns[0]?.id;
    const design = designId ? this.simpleDesigns.find((d) => d.id === designId) : this.simpleDesigns[0];
    this.cartService
      .addCustomItem({
        name: this.buildCustomProductName(),
        price: this.estimatedPrice(),
        quantity: 1,
        imageUrl: design?.imageUrl,
        notes: this.buildCartNotes(),
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

