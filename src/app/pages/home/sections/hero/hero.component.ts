import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '@app/core/services/api.service';
import { environment } from '@env/environment';

interface HeroSlide {
  src: string;
  alt?: string;
}

/** Fallback cuando no hay portadas desde la API */
const LOCAL_HERO_SLIDES: HeroSlide[] = [
  { src: 'assets/portada.jpg', alt: 'Torta decorada con rosas y detalles' },
  { src: 'assets/torta-chocolate.png', alt: 'Torta de chocolate artesanal' },
  { src: 'assets/torta-personalizada.png', alt: 'Torta personalizada' },
];

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero-slides">
        @for (slide of slides(); track slide.src; let i = $index) {
          <div
            class="hero-slide"
            [class.active]="currentIndex() === i"
            [attr.aria-hidden]="currentIndex() !== i"
          >
            <img
              [src]="slide.src"
              [alt]="slide.alt ?? ''"
              class="hero-bg-img"
              [attr.loading]="i === 0 ? 'eager' : 'lazy'"
              [attr.fetchpriority]="i === 0 ? 'high' : 'low'"
            />
          </div>
        }
      </div>
      <div class="hero-overlay" aria-hidden="true"></div>
      <div class="hero-content">
        <h1 id="hero-heading" class="hero-title">Tu torta soñada, hecha realidad</h1>
        <p class="hero-subtitle">
          Repostería artesanal en Uruguay. Elegí tu torta en la tienda o armala a tu gusto. Retiro en Ciudad de la Costa o delivery en Montevideo.
        </p>
        <div class="hero-cta">
          <a routerLink="/tienda" class="hero-btn hero-btn-primary">Ver tortas</a>
          <a routerLink="/agenda" class="hero-btn hero-btn-secondary">Armar mi torta</a>
        </div>
      </div>
      @if (slides().length > 1) {
        <div class="hero-dots" role="tablist" aria-label="Cambiar imagen de portada">
          @for (slide of slides(); track slide.src; let i = $index) {
            <button
              type="button"
              class="hero-dot"
              [class.active]="currentIndex() === i"
              [attr.aria-selected]="currentIndex() === i"
              [attr.aria-label]="'Imagen ' + (i + 1) + ' de ' + slides().length"
              (click)="goToSlide(i)"
            ></button>
          }
        </div>
      }
      <div class="scallop-border" aria-hidden="true"></div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      overflow: hidden;
      width: 100%;
      min-height: 520px;
      display: flex;
      align-items: center;
      margin: 0;
      padding: 0;

      @media (min-width: 768px) {
        min-height: 580px;
      }

      @media (min-width: 1024px) {
        min-height: 620px;
      }

      @media (min-width: 1280px) {
        min-height: 680px;
      }
    }

    .hero-slides {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .hero-slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.8s ease-in-out;
      pointer-events: none;

      &.active {
        opacity: 1;
        pointer-events: auto;
      }
    }

    .hero-bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: right center;
      display: block;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      background: linear-gradient(
        105deg,
        rgba(93, 53, 29, 0.72) 0%,
        rgba(93, 53, 29, 0.35) 38%,
        transparent 68%
      );
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: var(--container-xl);
      margin: 0 auto;
      padding: var(--space-8) var(--space-4) var(--space-16);
      width: 100%;

      @media (min-width: 768px) {
        padding: var(--space-10) var(--space-6) var(--space-20);
      }

      @media (min-width: 1024px) {
        padding-left: var(--space-10);
        padding-right: var(--space-10);
      }
    }

    .hero-title {
      font-family: var(--font-display);
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 700;
      color: white;
      margin: 0 0 var(--space-3);
      line-height: 1.2;
      letter-spacing: 0.02em;
      max-width: 14ch;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);

      @media (min-width: 768px) {
        font-size: clamp(2rem, 3.5vw, 2.75rem);
        margin-bottom: var(--space-4);
      }
    }

    .hero-subtitle {
      font-family: var(--font-sans);
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.95);
      margin: 0 0 var(--space-6);
      max-width: 420px;
      line-height: 1.5;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);

      @media (min-width: 768px) {
        font-size: 1.05rem;
        margin-bottom: var(--space-8);
      }
    }

    .hero-cta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .hero-btn {
      font-family: var(--font-sans);
      font-size: 0.95rem;
      font-weight: 600;
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: background-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;

      @media (min-width: 768px) {
        font-size: 1rem;
        padding: var(--space-3) var(--space-8);
      }
    }

    .hero-btn-primary {
      background: white;
      color: var(--ink);

      &:hover {
        background: var(--surface-alt);
        color: var(--ink);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
      }
    }

    .hero-btn-secondary {
      background: transparent;
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.9);

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: white;
      }
    }

    .hero-dots {
      position: absolute;
      bottom: var(--space-8);
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
      display: flex;
      gap: var(--space-2);

      @media (min-width: 768px) {
        bottom: var(--space-10);
      }
    }

    .hero-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.8);
      background: transparent;
      cursor: pointer;
      padding: 0;
      transition: background 0.2s ease, transform 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.4);
      }

      &.active {
        background: white;
        border-color: white;
      }
    }

    .scallop-border {
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 2;
      height: 40px;
      background: var(--surface);

      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 46'%3E%3Cpath d='M0 46 Q60 0 120 46 V46 H0 Z' fill='white'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 46'%3E%3Cpath d='M0 46 Q60 0 120 46 V46 H0 Z' fill='white'/%3E%3C/svg%3E");
      -webkit-mask-size: 120px 40px;
      mask-size: 120px 40px;
      -webkit-mask-repeat: repeat-x;
      mask-repeat: repeat-x;

      @media (min-width: 768px) {
        height: 48px;
        -webkit-mask-size: 120px 48px;
        mask-size: 120px 48px;
      }

      @media (min-width: 1024px) {
        height: 56px;
        -webkit-mask-size: 120px 56px;
        mask-size: 120px 56px;
      }
    }
  `],
})
export class HeroComponent implements OnInit, OnDestroy {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private api = inject(ApiService);

  readonly currentIndex = signal(0);
  readonly slides = signal<HeroSlide[]>(LOCAL_HERO_SLIDES);

  /** Resuelve URL: /assets/ → origen del sitio (frontend); /uploads/ → backend; http → tal cual */
  private static resolveCoverUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/assets/')) {
      if (typeof window !== 'undefined') return window.location.origin + imageUrl;
      return (environment.siteUrl || '').replace(/\/$/, '') + imageUrl;
    }
    const apiBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return imageUrl.startsWith('/') ? apiBase + imageUrl : apiBase + '/' + imageUrl;
  }

  ngOnInit(): void {
    this.api.get<{ id: number; image_url: string; alt_text?: string }[]>('/home-covers').subscribe({
      next: (list) => {
        if (list?.length) {
          const mapped: HeroSlide[] = list.map((c) => ({
            src: HeroComponent.resolveCoverUrl(c.image_url),
            alt: c.alt_text ?? undefined,
          }));
          this.slides.set(mapped);
        }
        if (this.slides().length > 1)
          this.intervalId = setInterval(() => this.nextSlide(), 6000);
      },
      error: () => {
        if (this.slides().length > 1)
          this.intervalId = setInterval(() => this.nextSlide(), 6000);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  goToSlide(index: number): void {
    this.currentIndex.set(index);
    if (this.intervalId && this.slides().length > 1) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => this.nextSlide(), 6000);
    }
  }

  private nextSlide(): void {
    const list = this.slides();
    if (list.length <= 1) return;
    const next = (this.currentIndex() + 1) % list.length;
    this.currentIndex.set(next);
  }
}

