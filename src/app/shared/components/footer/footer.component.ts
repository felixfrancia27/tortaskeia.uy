import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <!-- Borde ondulado superior -->
      <div class="wave-border" aria-hidden="true"></div>

      <div class="footer-container">
        <!-- Logo Central - mismo logo que el header -->
        <div class="footer-brand">
          <a routerLink="/" class="footer-logo-link" aria-label="Ir al inicio">
            <img src="assets/logo-keia.png" alt="Tortaskeia - Repostería Artesanal" class="footer-logo" width="72" height="72" loading="lazy" />
          </a>
          <p class="brand-slogan">Creaciones únicas para momentos especiales</p>
        </div>

        <!-- Links y Contacto en una fila -->
        <div class="footer-content">
          <nav class="footer-links">
            <a routerLink="/" class="footer-link">Inicio</a>
            <a routerLink="/tienda" class="footer-link">Tienda</a>
            <a routerLink="/keia" class="footer-link">Keia</a>
            <a routerLink="/contacto" class="footer-link">Contacto</a>
            <a href="#faq" class="footer-link">FAQ</a>
          </nav>

          <!-- Redes Sociales -->
          <div class="social-links">
            <a href="https://www.instagram.com/tortas.keia/" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://facebook.com/tortaskeia" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://wa.me/59899123456" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </a>
          </div>
        </div>

        <!-- Confianza / Ubicación -->
        <div class="footer-trust">
          <span>Pago seguro con Mercado Pago</span>
          <span class="footer-trust-sep" aria-hidden="true">·</span>
          <span>Envíos en Montevideo y Ciudad de la Costa</span>
        </div>

        <!-- Copyright -->
        <div class="footer-bottom">
          <p class="copyright">© {{ currentYear }} Tortaskeia • Uruguay 🇺🇾</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      position: relative;
      background-color: var(--brand);
      color: white;
      padding: var(--space-10) 0 var(--space-6);

      @media (min-width: 768px) {
        padding: var(--space-12) 0 var(--space-8);
      }
    }

    /* Borde ondulado superior - más pronunciado */
    .wave-border {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 40px;
      background: var(--surface);
      transform: translateY(-50%);

      /* Ondas invertidas más grandes */
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 40'%3E%3Cpath d='M0 0 Q60 40 120 0 V40 H0 Z' fill='white'/%3E%3C/svg%3E");
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 40'%3E%3Cpath d='M0 0 Q60 40 120 0 V40 H0 Z' fill='white'/%3E%3C/svg%3E");
      -webkit-mask-size: 120px 40px;
      mask-size: 120px 40px;
      -webkit-mask-repeat: repeat-x;
      mask-repeat: repeat-x;
      -webkit-mask-position: center;
      mask-position: center;

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

    .footer-container {
      position: relative;
      z-index: 2;
      max-width: var(--container-xl);
      margin: 0 auto;
      padding: 0 var(--space-4);

      @media (max-width: 480px) {
        padding: 0 var(--space-3);
      }

      @media (min-width: 768px) {
        padding: 0 var(--space-8);
      }
    }

    /* Logo y Slogan Compacto */
    .footer-brand {
      text-align: center;
      margin-bottom: var(--space-6);

      @media (min-width: 768px) {
        margin-bottom: var(--space-8);
      }
    }

    .footer-logo-link {
      display: inline-block;
      margin: 0 auto var(--space-3);
      transition: transform var(--transition-base);
    }

    .footer-logo-link:hover {
      transform: scale(1.08);
    }

    .footer-logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
      display: block;
      margin: 0 auto;

      @media (min-width: 768px) {
        width: 80px;
        height: 80px;
      }
    }

    .brand-slogan {
      font-family: var(--font-serif);
      font-size: 14px;
      font-style: italic;
      opacity: 0.85;
      letter-spacing: 0.02em;

      @media (min-width: 768px) {
        font-size: 15px;
      }
    }

    /* Contenido en una fila */
    .footer-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      align-items: center;
      margin-bottom: var(--space-6);

      @media (min-width: 768px) {
        flex-direction: row;
        justify-content: center;
        gap: var(--space-12);
        margin-bottom: var(--space-8);
      }
    }

    /* Links horizontales */
    .footer-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--space-4);

      @media (min-width: 768px) {
        gap: var(--space-6);
      }
    }

    .footer-link {
      font-family: var(--font-sans);
      font-size: 14px;
      color: white;
      opacity: 0.85;
      transition: opacity var(--transition-fast);
      white-space: nowrap;
      padding: var(--space-2) 0;

      @media (max-width: 768px) {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
      }

      @media (min-width: 768px) {
        font-size: 15px;
      }

      &:hover {
        opacity: 1;
        color: white;
      }
    }

    /* Redes Sociales Compactas */
    .social-links {
      display: flex;
      gap: var(--space-3);
      justify-content: center;
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      color: white;
      transition: all var(--transition-fast);
      -webkit-tap-highlight-color: transparent;

      @media (min-width: 768px) {
        width: 38px;
        height: 38px;
        min-width: 38px;
        min-height: 38px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
      }

      svg {
        width: 18px;
        height: 18px;
      }
    }

    /* Confianza / Ubicación */
    .footer-trust {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-sans);
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: var(--space-4);

      @media (min-width: 768px) {
        font-size: 13px;
      }
    }

    .footer-trust-sep {
      opacity: 0.6;
    }

    /* Copyright Compacto */
    .footer-bottom {
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: var(--space-4);
    }

    .copyright {
      font-family: var(--font-sans);
      font-size: 12px;
      opacity: 0.75;

      @media (min-width: 768px) {
        font-size: 13px;
      }
    }
  `],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
