import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GalleryItem {
  id: number;
  image: string;
  title: string;
  category: string;
  description?: string;
}

@Component({
  selector: 'app-trabajos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="trabajos-page">
      <!-- Hero compacto -->
      <div class="trabajos-hero">
        <div class="hero-strip">
          <div class="hero-bg" aria-hidden="true"></div>
          <div class="hero-inner">
            <h1>Nuestros Trabajos</h1>
            <p>Cada torta es única, hecha con amor y dedicación para tus momentos especiales</p>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- Filtros de categoría -->
        <div class="filter-bar">
          <button 
            class="filter-btn"
            [class.active]="selectedCategory() === 'todas'"
            (click)="filterByCategory('todas')"
          >
            Todas
          </button>
          <button 
            class="filter-btn"
            [class.active]="selectedCategory() === 'cumpleaños'"
            (click)="filterByCategory('cumpleaños')"
          >
            Cumpleaños
          </button>
          <button 
            class="filter-btn"
            [class.active]="selectedCategory() === 'bodas'"
            (click)="filterByCategory('bodas')"
          >
            Bodas
          </button>
          <button 
            class="filter-btn"
            [class.active]="selectedCategory() === 'eventos'"
            (click)="filterByCategory('eventos')"
          >
            Eventos
          </button>
          <button 
            class="filter-btn"
            [class.active]="selectedCategory() === 'temáticas'"
            (click)="filterByCategory('temáticas')"
          >
            Temáticas
          </button>
        </div>

        <!-- Galería de trabajos -->
        <div class="gallery-grid">
          @for (item of filteredItems(); track item.id) {
            <article class="gallery-item">
              <div class="item-image">
                <img 
                  [src]="item.image" 
                  [alt]="item.title"
                  loading="lazy"
                />
                <div class="item-overlay">
                  <span class="item-category">{{ item.category }}</span>
                  <h3 class="item-title">{{ item.title }}</h3>
                  @if (item.description) {
                    <p class="item-desc">{{ item.description }}</p>
                  }
                </div>
              </div>
            </article>
          }
        </div>

        @if (filteredItems().length === 0) {
          <div class="empty-state">
            <p>No hay trabajos en esta categoría aún.</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .trabajos-page {
      padding-bottom: var(--space-16);
    }

    .trabajos-page > .container {
      padding-top: var(--space-4);
      @media (min-width: 768px) {
        padding-top: var(--space-6);
      }
    }

    /* Hero compacto (igual que tienda) */
    .trabajos-hero {
      margin-top: var(--space-8);
      padding: var(--space-6) var(--space-4) var(--space-6);
      margin-bottom: var(--space-8);
      background: var(--surface);

      @media (min-width: 768px) {
        margin-top: var(--space-10);
        padding: var(--space-8) var(--space-6) var(--space-8);
        margin-bottom: var(--space-10);
      }
    }

    .hero-strip {
      position: relative;
      max-width: 720px;
      margin: 0 auto;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(239, 108, 0, 0.2);
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      background: var(--brand);
      z-index: 0;
    }

    .hero-inner {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-5) var(--space-6);
      min-height: 0;

      @media (min-width: 768px) {
        padding: var(--space-6) var(--space-8);
        min-height: 0;
      }
    }

    .trabajos-hero h1 {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 700;
      margin: 0 0 var(--space-2);
      letter-spacing: 0.03em;
      color: #fff;

      @media (min-width: 768px) {
        font-size: var(--text-2xl);
        margin-bottom: var(--space-3);
      }
    }

    .trabajos-hero p {
      margin: 0;
      font-size: var(--text-sm);
      line-height: 1.45;
      color: rgba(255, 255, 255, 0.95);
      max-width: 420px;

      @media (min-width: 768px) {
        font-size: var(--text-base);
      }
    }

    /* Filtros */
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      justify-content: center;
      margin-bottom: var(--space-8);
      padding: 0 var(--space-2);

      @media (min-width: 768px) {
        gap: var(--space-3);
      }
    }

    .filter-btn {
      padding: var(--space-2) var(--space-4);
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--ink);
      background: white;
      border: 2px solid #E0D5C8;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all var(--transition-fast);

      @media (min-width: 768px) {
        padding: var(--space-2) var(--space-5);
        font-size: var(--text-base);
      }

      &:hover {
        border-color: var(--brand);
        color: var(--brand);
        transform: translateY(-2px);
      }

      &.active {
        background: var(--brand);
        border-color: var(--brand);
        color: white;
      }
    }

    /* Galería */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);

      @media (min-width: 640px) {
        gap: var(--space-5);
      }

      @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-6);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .gallery-item {
      position: relative;
      border-radius: var(--radius-xl);
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: transform var(--transition-base), box-shadow var(--transition-base);

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }

      &:hover .item-overlay {
        opacity: 1;
      }

      &:hover .item-image img {
        transform: scale(1.05);
      }
    }

    .item-image {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      background: var(--surface);
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }

    .item-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.85) 0%,
        rgba(0, 0, 0, 0.4) 50%,
        transparent 100%
      );
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: var(--space-4);
      opacity: 0;
      transition: opacity var(--transition-base);

      @media (min-width: 768px) {
        padding: var(--space-5);
      }
    }

    .item-category {
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--brand);
      margin-bottom: var(--space-1);
    }

    .item-title {
      font-family: var(--font-display);
      font-size: var(--text-base);
      font-weight: 700;
      color: white;
      margin: 0 0 var(--space-1);

      @media (min-width: 768px) {
        font-size: var(--text-lg);
      }
    }

    .item-desc {
      font-size: var(--text-xs);
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      line-height: 1.4;

      @media (min-width: 768px) {
        font-size: var(--text-sm);
      }
    }

    .empty-state {
      text-align: center;
      padding: var(--space-16) var(--space-4);
      color: var(--ink-light);
    }
  `],
})
export class TrabajosComponent {
  selectedCategory = signal<string>('todas');

  // Mock data - reemplazar con datos reales del backend
  galleryItems: GalleryItem[] = [
    { id: 1, image: 'assets/torta-chocolate.png', title: 'Torta Chocolate Premium', category: 'Cumpleaños', description: 'Tres capas de chocolate con ganache' },
    { id: 2, image: 'assets/torta-fresas.png', title: 'Torta de Fresas', category: 'Cumpleaños', description: 'Vainilla con crema y fresas frescas' },
    { id: 3, image: 'assets/creacion-1.png', title: 'Torta Floral Elegante', category: 'Bodas', description: 'Decoración con flores de buttercream' },
    { id: 4, image: 'assets/creacion-2.png', title: 'Torta Unicornio', category: 'Temáticas', description: 'Diseño mágico para niños' },
    { id: 5, image: 'assets/creacion-3.png', title: 'Torta Red Velvet', category: 'Eventos', description: 'Clásica con frosting de queso crema' },
    { id: 6, image: 'assets/torta-personalizada.png', title: 'Torta Personalizada', category: 'Cumpleaños', description: 'Diseño único según tu idea' },
    { id: 7, image: 'assets/torta-tematica.png', title: 'Torta Temática Infantil', category: 'Temáticas', description: 'Personajes favoritos de los niños' },
    { id: 8, image: 'assets/creacion-4.png', title: 'Torta de Boda Clásica', category: 'Bodas', description: 'Elegancia en tres pisos' },
  ];

  filteredItems = signal<GalleryItem[]>(this.galleryItems);

  filterByCategory(category: string) {
    this.selectedCategory.set(category);
    
    if (category === 'todas') {
      this.filteredItems.set(this.galleryItems);
    } else {
      this.filteredItems.set(
        this.galleryItems.filter(item => 
          item.category.toLowerCase() === category.toLowerCase()
        )
      );
    }
  }
}
