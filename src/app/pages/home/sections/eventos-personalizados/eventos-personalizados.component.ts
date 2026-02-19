import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface EventoItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  /** Pequeño offset/rotación para efecto flotante */
  floatStyle: 'a' | 'b' | 'c' | 'd';
}

@Component({
  selector: 'app-eventos-personalizados',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="eventos-section" aria-labelledby="eventos-title">
      <div class="eventos-accent" aria-hidden="true"></div>
      <div class="container">
        <header class="section-header">
          <h2 id="eventos-title" class="section-title">EVENTOS PERSONALIZADOS</h2>
          <p class="section-subtitle">
            Armamos la torta y la mesa dulce para tu momento especial. Elegí el tipo de evento y soñamos juntos el detalle perfecto.
          </p>
        </header>

        <div class="eventos-grid">
          @for (item of eventos; track item.id) {
            <a [routerLink]="['/eventos', item.id]" class="evento-card evento-card-link"
              [class.float-a]="item.floatStyle === 'a'"
              [class.float-b]="item.floatStyle === 'b'"
              [class.float-c]="item.floatStyle === 'c'"
              [class.float-d]="item.floatStyle === 'd'"
            >
              <div class="evento-card-inner">
                <div class="evento-image-wrap">
                  <img
                    [src]="item.image"
                    [alt]="item.alt"
                    class="evento-image"
                    loading="lazy"
                  />
                  <div class="evento-overlay" aria-hidden="true"></div>
                </div>
                <div class="evento-content">
                  <h3 class="evento-title">{{ item.title }}</h3>
                  <p class="evento-subtitle">{{ item.subtitle }}</p>
                </div>
              </div>
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .eventos-section {
      position: relative;
      background: linear-gradient(180deg, var(--surface) 0%, var(--surface-alt) 100%);
      padding: var(--space-14) 0 var(--space-16);

      @media (min-width: 768px) {
        padding: var(--space-20) 0 var(--space-24);
      }
    }

    .eventos-accent {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, transparent, var(--brand), transparent);
      border-radius: 0 0 var(--radius-full) var(--radius-full);
    }

    .section-header {
      text-align: center;
      margin-bottom: var(--space-12);
      max-width: 560px;
      margin-left: auto;
      margin-right: auto;

      @media (min-width: 768px) {
        margin-bottom: var(--space-16);
      }
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 26px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--ink);
      margin-bottom: var(--space-4);

      @media (min-width: 768px) {
        font-size: 32px;
        letter-spacing: 0.24em;
        margin-bottom: var(--space-5);
      }
    }

    .section-subtitle {
      color: var(--ink-light);
      margin: 0;
      font-size: 14px;
      line-height: 1.75;
      font-family: var(--font-sans);

      @media (min-width: 768px) {
        font-size: 15px;
      }
    }

    .eventos-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-8);
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 var(--space-4);

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-8) var(--space-6);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
        gap: var(--space-6);
        padding: 0 var(--space-6);
      }
    }

    .evento-card-link {
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .evento-card {
      position: relative;
      transition: transform var(--transition-slow);

      &.float-a {
        @media (min-width: 1024px) {
          transform: translateY(-8px) rotate(-1deg);
        }
      }
      &.float-b {
        @media (min-width: 1024px) {
          transform: translateY(6px) rotate(1deg);
        }
      }
      &.float-c {
        @media (min-width: 1024px) {
          transform: translateY(-4px) rotate(1.5deg);
        }
      }
      &.float-d {
        @media (min-width: 1024px) {
          transform: translateY(8px) rotate(-1.5deg);
        }
      }

      &:hover {
        @media (min-width: 1024px) {
          transform: translateY(-12px) rotate(0deg) scale(1.02);
          z-index: 1;
        }
      }
    }

    .evento-card-inner {
      background: var(--surface-white);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.08),
        0 2px 8px rgba(var(--brand-rgb), 0.06);
      border: 1px solid rgba(var(--brand-rgb), 0.08);
      transition: box-shadow var(--transition-base), border-color var(--transition-base);

      .evento-card:hover & {
        box-shadow:
          0 20px 48px rgba(0, 0, 0, 0.12),
          0 8px 24px rgba(var(--brand-rgb), 0.1);
        border-color: rgba(var(--brand-rgb), 0.15);
      }
    }

    .evento-image-wrap {
      position: relative;
      aspect-ratio: 4 / 5;
      overflow: hidden;

      @media (min-width: 768px) {
        aspect-ratio: 3 / 4;
      }
    }

    .evento-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }

    .evento-card:hover .evento-image {
      transform: scale(1.06);
    }

    .evento-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        transparent 40%,
        rgba(93, 53, 29, 0.25) 85%,
        rgba(93, 53, 29, 0.5) 100%
      );
      pointer-events: none;
    }

    .evento-content {
      padding: var(--space-4) var(--space-4) var(--space-5);
      text-align: center;
    }

    .evento-title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 600;
      color: var(--ink);
      margin: 0 0 var(--space-1);
      letter-spacing: 0.04em;

      @media (min-width: 768px) {
        font-size: 20px;
      }
    }

    .evento-subtitle {
      font-family: var(--font-sans);
      font-size: 13px;
      color: var(--ink-light);
      line-height: 1.5;
      margin: 0;

      @media (min-width: 768px) {
        font-size: 14px;
      }
    }
  `],
})
export class EventosPersonalizadosComponent {
  readonly eventos: EventoItem[] = [
    {
      id: 'desayunos',
      title: 'Desayunos',
      subtitle: 'Mesa dulce y tortas para empezar el día con amor',
      image: 'assets/eventos-desayunos.jpg',
      alt: 'Desayuno con tortas y repostería artesanal',
      floatStyle: 'a',
    },
    {
      id: 'cumpleanos',
      title: 'Cumpleaños',
      subtitle: 'La torta que soñaste para tu día especial',
      image: 'assets/eventos-cumpleanos.jpg',
      alt: 'Torta de cumpleaños personalizada',
      floatStyle: 'b',
    },
    {
      id: 'meriendas',
      title: 'Meriendas',
      subtitle: 'Tortas y delicias para la tarde',
      image: 'assets/eventos-meriendas.jpg',
      alt: 'Merienda con tortas y café',
      floatStyle: 'c',
    },
    {
      id: 'bodas',
      title: 'Bodas',
      subtitle: 'Torta de novios y mesa dulce inolvidable',
      image: 'assets/eventos-bodas.jpg',
      alt: 'Torta de boda elegante',
      floatStyle: 'd',
    },
  ];
}
