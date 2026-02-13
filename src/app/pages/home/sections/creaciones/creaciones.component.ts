import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

const INSTAGRAM_URL = 'https://www.instagram.com/tortas.keia/';
const INSTAGRAM_HANDLE = '@tortas.keia';

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  thumbnail_url?: string;
}

interface InstagramProfile {
  username: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
}

@Component({
  selector: 'app-creaciones',
  standalone: true,
  template: `
    <section class="creaciones-section" aria-labelledby="creaciones-title">
      <div class="creaciones-accent" aria-hidden="true"></div>
      <div class="container">
        <header class="section-header">
          <h2 id="creaciones-title" class="section-title">CREACIONES</h2>
          <p class="section-subtitle">
            Nuestras creaciones más recientes. Cada torta es única y hecha con amor, perfecta para tus momentos especiales.
            <strong>Seguinos en {{ instagramHandle }}</strong> para ver todo lo que hacemos.
          </p>
          @if (profile(); as p) {
            <div class="profile-stats">
              @if (p.profile_picture_url) {
                <img [src]="p.profile_picture_url" [alt]="p.username" class="profile-avatar" width="40" height="40" />
              }
              <div class="profile-meta">
                @if (p.followers_count != null) {
                  <span class="stat">{{ formatCount(p.followers_count) }} seguidores</span>
                }
                @if (p.media_count != null && p.followers_count != null) {
                  <span class="stat-sep" aria-hidden="true">·</span>
                }
                @if (p.media_count != null) {
                  <span class="stat">{{ p.media_count }} publicaciones</span>
                }
              </div>
            </div>
          }
          <a [href]="instagramUrl" target="_blank" rel="noopener noreferrer" class="cta-instagram">
            <span class="cta-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </span>
            Ver perfil {{ instagramHandle }}
          </a>
        </header>

        @if (loading()) {
          <div class="gallery gallery-skeleton">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="skeleton-item"></div>
            }
          </div>
        } @else {
          <div class="gallery">
            @for (item of displayItems; track item.id) {
              @if (item.type === 'instagram') {
                <a [href]="item.permalink" target="_blank" rel="noopener noreferrer" class="gallery-item gallery-item-ig">
                  <img [src]="item.media_url" [alt]="item.caption || 'Creación Tortas Keia'" loading="lazy" />
                  <span class="ig-overlay">Ver en Instagram</span>
                </a>
              } @else if (item.type === 'more') {
                <a [href]="instagramUrl" target="_blank" rel="noopener noreferrer" class="gallery-item gallery-item-more">
                  <span class="more-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                    </svg>
                  </span>
                  <span class="more-text">Ver más en {{ instagramHandle }}</span>
                </a>
              } @else {
                <div class="gallery-item">
                  <img [src]="item.url" [alt]="item.alt" loading="lazy" />
                </div>
              }
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .creaciones-section {
      position: relative;
      background: linear-gradient(180deg, var(--surface) 0%, var(--surface-alt) 100%);
      padding: var(--space-14) 0 var(--space-16);

      @media (min-width: 768px) {
        padding: var(--space-20) 0 var(--space-24);
      }
    }

    .creaciones-accent {
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
      margin-bottom: var(--space-10);
      max-width: 560px;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: var(--space-12);

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
      margin: 0 auto var(--space-6);
      font-size: 14px;
      line-height: 1.75;
      font-family: var(--font-sans);

      @media (min-width: 768px) {
        font-size: 15px;
        margin-bottom: var(--space-8);
      }

      strong {
        color: var(--ink);
      }
    }

    .profile-stats {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
      padding: var(--space-2) var(--space-4);
      background: rgba(255, 255, 255, 0.7);
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-sm);
    }

    .profile-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }

    .profile-meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-sans);
      font-size: 13px;
      color: var(--ink-light);
    }

    .stat {
      font-weight: 600;
      color: var(--ink);
    }

    .stat-sep {
      color: var(--ink-muted);
      font-weight: 400;
    }

    .cta-instagram {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-6);
      background: linear-gradient(135deg, #f09433 0%, #e6683c 30%, #dc2743 60%, #bc1888 100%);
      color: white;
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      border-radius: var(--radius-full);
      text-decoration: none;
      box-shadow: 0 4px 16px rgba(225, 48, 108, 0.3);
      transition: transform var(--transition-base), box-shadow var(--transition-base);

      @media (min-width: 768px) {
        padding: var(--space-4) var(--space-8);
        font-size: 14px;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(225, 48, 108, 0.4);
        color: white;
      }

      .cta-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .gallery {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
      max-width: 900px;
      margin: 0 auto;
      padding: 0 var(--space-4);

      @media (min-width: 640px) {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-5);
      }

      @media (min-width: 1024px) {
        grid-template-columns: repeat(4, 1fr);
        gap: var(--space-5);
        max-width: 1100px;
      }
    }

    .gallery-skeleton {
      pointer-events: none;
    }

    .skeleton-item {
      aspect-ratio: 1;
      border-radius: var(--radius-xl);
      background: linear-gradient(110deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.06) 75%);
      background-size: 200% 100%;
      animation: skeleton 1.2s ease-in-out infinite;
    }

    @keyframes skeleton {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .gallery-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius-xl);
      overflow: hidden;
      cursor: pointer;
      transition: transform var(--transition-base), box-shadow var(--transition-base);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      text-decoration: none;
      color: inherit;
      display: block;

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-slow);
      }

      &:hover img {
        transform: scale(1.08);
      }
    }

    .gallery-item-ig .ig-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      font-family: var(--font-sans);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      opacity: 0;
      transition: opacity var(--transition-base);
    }

    .gallery-item-ig:hover .ig-overlay {
      opacity: 1;
    }

    .gallery-item-more {
      background: linear-gradient(145deg, rgba(240, 148, 51, 0.08) 0%, rgba(188, 24, 136, 0.08) 100%);
      border: 2px dashed rgba(225, 48, 108, 0.35);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      color: var(--ink);
      font-family: var(--font-sans);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;

      @media (min-width: 768px) {
        font-size: 13px;
      }

      &:hover {
        background: linear-gradient(145deg, rgba(240, 148, 51, 0.15) 0%, rgba(188, 24, 136, 0.15) 100%);
        border-color: rgba(225, 48, 108, 0.55);
        color: var(--ink);
      }

      .more-icon {
        color: #e1306c;
        display: flex;
      }

      .more-text {
        text-align: center;
        padding: 0 var(--space-3);
        line-height: 1.3;
      }
    }
  `],
})
export class CreacionesComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  instagramUrl = INSTAGRAM_URL;
  instagramHandle = INSTAGRAM_HANDLE;

  loading = signal(true);
  /** Perfil de Instagram (seguidores, etc.) cuando viene de la API */
  profile = signal<InstagramProfile | null>(null);

  /** Items a mostrar: pueden ser posts de Instagram (desde API) o fallback estático + tile "Ver más" */
  displayItems: Array<
    | { type: 'instagram'; id: string; media_url: string; permalink: string; caption?: string }
    | { type: 'more'; id: string }
    | { type: 'static'; id: number; url: string; alt: string }
  > = [];

  galleryImages = [
    { id: 1, url: '/assets/creacion-1.png', alt: 'Torta Red Velvet con crema' },
    { id: 2, url: '/assets/creacion-2.png', alt: 'Torta de dulce de leche artesanal' },
    { id: 3, url: '/assets/creacion-3.png', alt: 'Cupcakes decorados con buttercream' },
    { id: 4, url: '/assets/creacion-4.png', alt: 'Torta de boda elegante' },
    { id: 5, url: '/assets/creacion-5.png', alt: 'Torta naked con frutos rojos' },
    { id: 6, url: '/assets/creacion-6.png', alt: 'Drip cake colorida' },
    { id: 7, url: '/assets/creacion-7.png', alt: 'Torta de limón fresca' },
    { id: 8, url: '/assets/creacion-8.png', alt: 'Torta moderna geométrica' },
    { id: 9, url: '/assets/creacion-9.png', alt: 'Torta ombré con flores' },
  ];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFeed();
    } else {
      this.loading.set(false);
      this.setFallbackDisplay();
    }
  }

  private loadFeed() {
    const apiUrl = environment.apiUrl;
    if (!apiUrl) {
      this.loading.set(false);
      this.setFallbackDisplay();
      return;
    }
    this.http.get<{ data: InstagramPost[]; profile: InstagramProfile | null }>(`${apiUrl}/instagram/feed`).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.profile.set(res?.profile ?? null);
        if (res?.data?.length) {
          const igItems = res.data.slice(0, 5).map((p) => ({
            type: 'instagram' as const,
            id: p.id,
            media_url: p.thumbnail_url || p.media_url,
            permalink: p.permalink,
            caption: p.caption,
          }));
          this.displayItems = [...igItems, { type: 'more', id: 'more-instagram' }];
        } else {
          this.setFallbackDisplay();
        }
      },
      error: () => {
        this.loading.set(false);
        this.setFallbackDisplay();
      },
    });
  }

  private setFallbackDisplay() {
    const firstFive = this.galleryImages.slice(0, 5).map((img) => ({
      type: 'static' as const,
      id: img.id,
      url: img.url,
      alt: img.alt,
    }));
    this.displayItems = [...firstFive, { type: 'more', id: 'more-instagram' }];
  }

  /** Formatea seguidores: 12500 -> "12.5k", 999 -> "999" */
  formatCount(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toLocaleString();
  }
}
