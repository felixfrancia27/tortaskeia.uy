import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  iconType: 'cake' | 'house' | 'calendar';
  title: string;
  description: string;
}

@Component({
  selector: 'app-how-to-order',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="how-to-order" id="como-pedir" aria-labelledby="how-to-order-title">
      <div class="how-to-order-accent" aria-hidden="true"></div>
      <div class="container">
        <header class="section-header">
          <h2 id="how-to-order-title" class="section-title">Cómo pedir tu torta</h2>
          <p class="section-subtitle">
            Elegí tu torta en la tienda o armala a tu gusto en <strong>Crea tu torta</strong>. Al darle comprar, elegís fecha y forma de entrega. Retiro en Ciudad de la Costa o delivery a domicilio.
          </p>
        </header>

        <div class="steps">
          @for (step of steps; track step.title; let i = $index) {
            <article class="step-card">
              <span class="step-number" aria-hidden="true">{{ i + 1 }}</span>
              <div class="step-icon">
                @switch (step.iconType) {
                  @case ('cake') {
                    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="30" cy="30" r="26" fill="var(--surface-alt)" stroke="var(--brand)" stroke-width="2"/>
                      <path d="M20 38 L20 30 Q20 26 24 24 L24 22 Q24 18 30 18 Q36 18 36 22 L36 24 Q40 26 40 30 L40 38 Q40 40 38 40 L22 40 Q20 40 20 38Z" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
                      <path d="M24 24 Q24 21 30 21 Q36 21 36 24" fill="none" stroke="var(--brand)" stroke-width="1"/>
                      <path d="M22 30 L38 30" stroke="var(--brand)" stroke-width="1"/>
                      <path d="M22 34 L38 34" stroke="var(--brand)" stroke-width="1"/>
                    </svg>
                  }
                  @case ('calendar') {
                    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="30" cy="30" r="26" fill="var(--surface-alt)" stroke="var(--brand)" stroke-width="2"/>
                      <rect x="18" y="20" width="24" height="22" rx="2" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
                      <path d="M18 28 L42 28" stroke="var(--brand)" stroke-width="1.5"/>
                      <path d="M22 16 L22 22" stroke="var(--brand)" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M38 16 L38 22" stroke="var(--brand)" stroke-width="1.5" stroke-linecap="round"/>
                      <rect x="22" y="32" width="5" height="5" rx="1" fill="var(--brand)" opacity="0.25"/>
                      <rect x="29" y="32" width="5" height="5" rx="1" fill="var(--brand)"/>
                      <rect x="36" y="32" width="5" height="5" rx="1" fill="var(--brand)" opacity="0.25"/>
                    </svg>
                  }
                  @case ('house') {
                    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="30" cy="30" r="26" fill="var(--surface-alt)" stroke="var(--brand)" stroke-width="2"/>
                      <path d="M30 18 L46 30 L46 44 L14 44 L14 30 Z" fill="var(--surface)" stroke="var(--brand)" stroke-width="1.5"/>
                      <path d="M30 18 L12 32" stroke="var(--brand)" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M30 18 L48 32" stroke="var(--brand)" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M26 44 L26 34 Q26 31 30 31 Q34 31 34 34 L34 44" fill="var(--surface-alt)" stroke="var(--brand)" stroke-width="1"/>
                    </svg>
                  }
                }
              </div>
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .how-to-order {
      position: relative;
      background: linear-gradient(180deg, var(--surface-white) 0%, var(--surface) 100%);
      padding: var(--space-12) 0 var(--space-16);

      @media (min-width: 768px) {
        padding: var(--space-16) 0 var(--space-20);
      }
    }

    .how-to-order-accent {
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
      max-width: 520px;
      margin: 0 auto var(--space-12);

      @media (min-width: 768px) {
        margin-bottom: var(--space-14);
      }
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--ink);
      margin-bottom: var(--space-3);

      @media (min-width: 768px) {
        font-size: 28px;
        letter-spacing: 0.08em;
        margin-bottom: var(--space-4);
      }
    }

    .section-subtitle {
      font-family: var(--font-sans);
      font-size: 14px;
      line-height: 1.65;
      color: var(--ink-light);
      margin: 0;

      @media (min-width: 768px) {
        font-size: 15px;
      }

      strong {
        color: var(--brand);
        font-weight: 600;
      }
    }

    .steps {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-8);
      max-width: 960px;
      margin: 0 auto;
      padding: 0 var(--space-4);

      @media (min-width: 640px) {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-6);
      }

      @media (min-width: 768px) {
        gap: var(--space-8);
      }
    }

    .step-card {
      position: relative;
      text-align: center;
      padding: var(--space-8) var(--space-5);
      background: var(--surface-white);
      border-radius: var(--radius-xl);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(var(--brand-rgb), 0.08);
      transition: box-shadow var(--transition-base), transform var(--transition-base);

      @media (min-width: 768px) {
        padding: var(--space-10) var(--space-6);
      }

      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }
    }

    .step-number {
      position: absolute;
      top: var(--space-4);
      right: var(--space-4);
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--brand);
      color: white;
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 700;
      border-radius: 50%;
    }

    .step-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto var(--space-5);

      @media (min-width: 768px) {
        width: 80px;
        height: 80px;
        margin-bottom: var(--space-6);
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .step-title {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 600;
      color: var(--ink);
      margin-bottom: var(--space-2);
      letter-spacing: 0.02em;

      @media (min-width: 768px) {
        font-size: 17px;
        margin-bottom: var(--space-3);
      }
    }

    .step-description {
      font-family: var(--font-sans);
      font-size: 13px;
      color: var(--ink-light);
      line-height: 1.6;
      margin: 0;
      max-width: 260px;
      margin-left: auto;
      margin-right: auto;

      @media (min-width: 768px) {
        font-size: 14px;
      }
    }
  `],
})
export class HowToOrderComponent {
  steps: Step[] = [
    {
      iconType: 'cake',
      title: 'Elegí tu torta',
      description: 'Entrá a la tienda y elegí una torta del catálogo, o andá a la sección Crea tu torta si querés una personalizada. Todas son artesanales y hechas con amor.',
    },
    {
      iconType: 'calendar',
      title: 'Fecha y entrega',
      description: 'Cuando le des comprar al producto, en el checkout elegís la fecha en que la necesitás y si preferís retiro o envío. Pedinos con 48–72 hs de anticipación.',
    },
    {
      iconType: 'house',
      title: 'Retiro o delivery',
      description: 'Retirala en nuestro local en Ciudad de la Costa o recibila en tu domicilio. Te confirmamos todo por mensaje.',
    },
  ];
}
