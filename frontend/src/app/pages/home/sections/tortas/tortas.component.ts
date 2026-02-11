import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  image: string;
  buttonText: string;
  buttonStyle: 'primary' | 'secondary';
}

@Component({
  selector: 'app-tortas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="tortas-section">
      <div class="container">
        <h2 class="section-title">TORTAS</h2>
        <p class="section-subtitle">
          Descubrí nuestra variedad de tortas artesanales. Deliciosas opciones para cada ocasión, elaboradas con los mejores ingredientes.
        </p>

        <div class="products-grid">
          @for (product of products(); track product.id; let i = $index) {
            <article class="product-card">
              <!-- Marco naranja con imagen dentro -->
              <div class="product-frame">
                <div class="product-image">
                  <img
                    [src]="product.image"
                    [alt]="product.name"
                    [attr.loading]="i === 0 ? 'eager' : 'lazy'"
                    [attr.fetchpriority]="i === 0 ? 'high' : null"
                  />
                </div>
              </div>
              <!-- Info debajo del marco -->
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-price">{{ product.price }}</p>
                <a [routerLink]="['/tortas', product.slug]" 
                   class="btn-product"
                   [class.btn-secondary]="product.buttonStyle === 'secondary'">
                  {{ product.buttonText }}
                </a>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .tortas-section {
      background-color: var(--surface-white);
      padding: var(--space-12) 0;

      @media (min-width: 768px) {
        padding: var(--space-16) 0;
      }
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: var(--ink);
      text-align: center;
      margin-bottom: var(--space-3);

      @media (min-width: 768px) {
        font-size: 28px;
        letter-spacing: 0.22em;
        margin-bottom: var(--space-4);
      }
    }

    .section-subtitle {
      text-align: center;
      color: var(--ink-light);
      max-width: 650px;
      margin: 0 auto var(--space-8);
      font-size: 14px;
      line-height: 1.7;
      font-family: var(--font-sans);

      @media (min-width: 768px) {
        font-size: 15px;
        margin-bottom: var(--space-10);
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
      max-width: 700px;
      margin: 0 auto;
      padding: 0 var(--space-4);

      @media (min-width: 640px) {
        gap: var(--space-6);
      }

      @media (min-width: 768px) {
        gap: var(--space-8);
        max-width: 750px;
      }
    }

    .product-card {
      text-align: center;
    }

    .product-frame {
      /* Marco naranja como en la referencia */
      background-color: var(--brand);
      border-radius: var(--radius-lg);
      padding: var(--space-3);
      margin-bottom: var(--space-3);

      @media (min-width: 768px) {
        padding: var(--space-4);
        border-radius: var(--radius-xl);
        margin-bottom: var(--space-4);
      }
    }

    .product-image {
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: var(--radius-md);
      background: white;

      @media (min-width: 768px) {
        border-radius: var(--radius-lg);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-slow);
      }

      &:hover img {
        transform: scale(1.05);
      }
    }

    .product-info {
      padding: 0 var(--space-2);
    }

    .product-name {
      font-family: var(--font-serif);
      font-size: 14px;
      font-weight: 500;
      color: var(--ink);
      margin-bottom: var(--space-1);

      @media (min-width: 768px) {
        font-size: 16px;
      }
    }

    .product-price {
      font-family: var(--font-sans);
      font-size: 12px;
      color: var(--ink-light);
      margin-bottom: var(--space-3);

      @media (min-width: 768px) {
        font-size: 13px;
      }
    }

    .btn-product {
      display: inline-block;
      padding: 8px 18px;
      background-color: var(--brand);
      color: white;
      font-family: var(--font-sans);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-radius: 6px;
      transition: all var(--transition-fast);
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(239, 108, 0, 0.2);

      @media (min-width: 768px) {
        padding: 10px 24px;
        font-size: 12px;
      }

      &:hover {
        background-color: var(--brand-dark);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 108, 0, 0.3);
      }

      &.btn-secondary {
        background-color: var(--brand);
        
        &:hover {
          background-color: var(--brand-dark);
        }
      }
    }
  `],
})
export class TortasComponent implements OnInit {
  products = signal<Product[]>([]);

  ngOnInit() {
    // Datos como en la referencia - 4 productos en grilla 2x2
    this.products.set([
      {
        id: 1,
        name: 'Torta de Chocolate',
        slug: 'torta-chocolate',
        price: 'desde $1.500',
        image: '/assets/torta-chocolate.png',
        buttonText: 'COTIZAR',
        buttonStyle: 'primary',
      },
      {
        id: 2,
        name: 'Torta de Frutillas',
        slug: 'torta-frutillas',
        price: 'desde $1.800',
        image: '/assets/torta-fresas.png',
        buttonText: 'VER CARRITO',
        buttonStyle: 'secondary',
      },
      {
        id: 3,
        name: 'Torta Personalizada',
        slug: 'torta-personalizada',
        price: 'consultar precio',
        image: '/assets/torta-personalizada.png',
        buttonText: 'COTIZACIÓN',
        buttonStyle: 'primary',
      },
      {
        id: 4,
        name: 'Torta Temática',
        slug: 'torta-tematica',
        price: 'desde $2.200',
        image: '/assets/torta-tematica.png',
        buttonText: 'LO QUIERO',
        buttonStyle: 'primary',
      },
    ]);
  }
}
