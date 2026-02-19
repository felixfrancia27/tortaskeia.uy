import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-keia',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="keia-page">
      <!-- Hero: misma franja que Tienda / Trabajos -->
      <div class="keia-hero">
        <div class="keia-hero-strip">
          <div class="keia-hero-bg" aria-hidden="true"></div>
          <div class="keia-hero-inner">
            <h1>Keia</h1>
            <p>La historia detrás de cada torta: pasión, creatividad y momentos que endulzan la vida</p>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="keia-content">
          <!-- Bloque principal -->
          <div class="keia-intro">
            <h2>Quiénes somos</h2>
            <p class="lead">
              Somos Keia, repostería artesanal en Uruguay. Cada creación nace con dedicación, ingredientes de calidad
              y el deseo de que tus celebraciones sean únicas.
            </p>
            <p>
              Desde tortas clásicas hasta diseños personalizados para bodas, cumpleaños y eventos, trabajamos
              cada detalle para que el sabor y la presentación superen tus expectativas. Creemos en lo hecho a mano,
              en el trato cercano y en endulzar los momentos importantes.
            </p>
          </div>

          <!-- Valores / pilares -->
          <div class="keia-values">
            <h2>Lo que nos define</h2>
            <div class="values-grid">
              <div class="value-card">
                <div class="value-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <h3>Hecho con amor</h3>
                <p>Cada torta se elabora con dedicación y cuidado, pensando en quien la va a disfrutar.</p>
              </div>
              <div class="value-card">
                <div class="value-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3>Calidad artesanal</h3>
                <p>Ingredientes seleccionados y técnicas tradicionales para un sabor inigualable.</p>
              </div>
              <div class="value-card">
                <div class="value-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <h3>Tu momento especial</h3>
                <p>Diseños personalizados para que tu torta refleje tu estilo y tu celebración.</p>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div class="keia-cta">
            <p>¿Querés una torta para tu próxima celebración?</p>
            <a routerLink="/tienda" class="btn-primary">Ver nuestra tienda</a>
            <a routerLink="/contacto" class="btn-secondary">Contactanos</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .keia-page {
      padding-bottom: var(--space-16);
    }

    .keia-hero {
      margin-top: var(--space-8);
      padding: var(--space-6) var(--space-4) var(--space-6);
      margin-bottom: var(--space-8);
      background: var(--surface);

      @media (max-width: 480px) {
        padding: var(--space-4) var(--space-3);
        margin-top: var(--space-4);
        margin-bottom: var(--space-6);
      }

      @media (min-width: 768px) {
        margin-top: var(--space-10);
        padding: var(--space-8) var(--space-6) var(--space-8);
        margin-bottom: var(--space-10);
      }
    }

    .keia-hero-strip {
      position: relative;
      max-width: 720px;
      margin: 0 auto;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(239, 108, 0, 0.2);
    }

    .keia-hero-bg {
      position: absolute;
      inset: 0;
      background: var(--brand);
      z-index: 0;
    }

    .keia-hero-inner {
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

    .keia-hero h1 {
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

    .keia-hero p {
      margin: 0;
      font-size: var(--text-sm);
      line-height: 1.45;
      color: rgba(255, 255, 255, 0.95);
      max-width: 420px;

      @media (min-width: 768px) {
        font-size: var(--text-base);
      }
    }

    .keia-page > .container {
      padding-top: var(--space-4);
      @media (min-width: 768px) {
        padding-top: var(--space-6);
      }
    }

    .keia-content {
      max-width: 720px;
      margin: 0 auto;
    }

    .keia-intro {
      margin-bottom: var(--space-12);

      h2 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--ink);
        margin-bottom: var(--space-4);
      }

      .lead {
        font-size: var(--text-lg);
        color: var(--ink);
        line-height: 1.6;
        margin-bottom: var(--space-4);
      }

      p {
        font-size: var(--text-base);
        color: var(--ink-light);
        line-height: 1.7;
      }
    }

    .keia-values {
      margin-bottom: var(--space-12);

      h2 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--ink);
        margin-bottom: var(--space-6);
      }
    }

    .values-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);

      @media (min-width: 640px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .value-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
      transition: box-shadow var(--transition-base), transform var(--transition-base);

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }

      .value-icon {
        width: 56px;
        height: 56px;
        background: var(--surface);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--brand);
        margin-bottom: var(--space-4);
      }

      h3 {
        font-family: var(--font-display);
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--ink);
        margin-bottom: var(--space-2);
      }

      p {
        font-size: var(--text-sm);
        color: var(--ink-light);
        line-height: 1.6;
        margin: 0;
      }
    }

    .keia-cta {
      text-align: center;
      padding: var(--space-8) var(--space-4);
      background: white;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);

      p {
        font-size: var(--text-lg);
        color: var(--ink);
        margin-bottom: var(--space-4);
      }

      .btn-primary,
      .btn-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-3) var(--space-6);
        min-height: 44px;
        font-size: var(--text-sm);
        font-weight: 600;
        border-radius: var(--radius-md);
        text-decoration: none;
        transition: all var(--transition-fast);
        margin: 0 var(--space-2) var(--space-2);
      }

      @media (max-width: 480px) {
        .btn-primary,
        .btn-secondary {
          width: 100%;
          margin: 0 0 var(--space-2);
        }
      }

      .btn-primary {
        background-color: var(--brand);
        color: white;
        border: none;

        &:hover {
          background-color: var(--brand-dark);
          color: white;
        }
      }

      .btn-secondary {
        background: transparent;
        border: 2px solid var(--brand);
        color: var(--brand);

        &:hover {
          background-color: var(--brand);
          color: white;
        }
      }
    }
  `],
})
export class KeiaComponent {}
