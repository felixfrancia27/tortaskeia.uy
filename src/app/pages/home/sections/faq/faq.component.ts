import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="faq-section" id="faq">
      <div class="container">
        <h2 class="section-title">PREGUNTAS FRECUENTES</h2>
        <p class="section-subtitle">
          Resolvemos tus dudas más comunes. Si tenés otra consulta, no dudes en contactarnos.
        </p>

        <div class="faq-list">
          @for (item of faqItems; track item.id; let i = $index) {
            <div class="faq-item" [class.open]="openIndex() === i">
              <button class="faq-question" (click)="toggle(i)" [attr.aria-expanded]="openIndex() === i">
                <span class="question-text">{{ item.question }}</span>
                <span class="toggle-icon">
                  @if (openIndex() === i) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m18 15-6-6-6 6"/>
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  }
                </span>
              </button>
              <div class="faq-answer">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .faq-section {
      background-color: var(--surface-white);
      padding: var(--space-12) 0;

      @media (min-width: 768px) {
        padding: var(--space-16) 0;
      }
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: var(--brand);
      text-align: center;
      margin-bottom: var(--space-3);

      @media (min-width: 768px) {
        font-size: 26px;
        letter-spacing: 0.22em;
        margin-bottom: var(--space-4);
      }
    }

    .section-subtitle {
      text-align: center;
      color: var(--ink-light);
      max-width: 550px;
      margin: 0 auto var(--space-8);
      font-size: 14px;
      line-height: 1.7;
      font-family: var(--font-sans);

      @media (min-width: 768px) {
        font-size: 15px;
        margin-bottom: var(--space-10);
      }
    }

    .faq-list {
      max-width: 700px;
      margin: 0 auto;
      padding: 0 var(--space-4);
    }

    .faq-item {
      border-bottom: 1px solid #E8DFD4;
    }

    .faq-question {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      padding: var(--space-4) 0;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      transition: color var(--transition-fast);

      @media (min-width: 768px) {
        padding: var(--space-5) 0;
      }

      &:hover .question-text {
        color: var(--brand);
      }

      &:focus {
        outline: none;
      }

      &:focus-visible {
        outline: 2px solid var(--brand);
        outline-offset: 2px;
      }
    }

    .question-text {
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 600;
      color: var(--ink);
      transition: color var(--transition-fast);
      flex: 1;

      @media (min-width: 768px) {
        font-size: 15px;
      }
    }

    .toggle-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ink-light);
      transition: color var(--transition-fast);

      .faq-question:hover & {
        color: var(--brand);
      }
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height var(--transition-base), padding var(--transition-base);

      .faq-item.open & {
        max-height: 500px;
        padding-bottom: var(--space-4);

        @media (min-width: 768px) {
          padding-bottom: var(--space-5);
        }
      }

      p {
        font-family: var(--font-sans);
        font-size: 13px;
        color: var(--ink-light);
        line-height: 1.7;
        padding-right: var(--space-8);

        @media (min-width: 768px) {
          font-size: 14px;
        }
      }
    }
  `],
})
export class FaqComponent {
  openIndex = signal<number>(0); // Primera pregunta abierta por defecto como en referencia

  faqItems: FaqItem[] = [
    {
      id: 1,
      question: '¿Con cuánta anticipación debo hacer mi pedido?',
      answer: 'Recomendamos hacer tu pedido con al menos 48-72 horas de anticipación para tortas estándar. Para tortas personalizadas con diseños especiales, sugerimos contactarnos con una semana de anticipación para asegurar la disponibilidad.',
    },
    {
      id: 2,
      question: '¿Hacen envíos para descartar?',
      answer: 'Sí, realizamos delivery en todo Montevideo. El costo de envío varía según la zona. También podés retirar tu pedido en nuestro local coordinando día y hora.',
    },
    {
      id: 3,
      question: '¿Qué formas de pago aceptan?',
      answer: 'Aceptamos pagos con Mercado Pago (tarjetas de crédito y débito), transferencia bancaria y efectivo al momento de la entrega o retiro.',
    },
    {
      id: 4,
      question: '¿Tienen opciones aptas para celíacos?',
      answer: 'Sí, ofrecemos opciones sin gluten. Por favor, indicalo al momento de hacer tu pedido para preparar tu torta con los ingredientes adecuados.',
    },
    {
      id: 5,
      question: '¿Puedo combinar sabores?',
      answer: 'Por supuesto, podés elegir diferentes sabores y rellenos según tu preferencia. Consultanos las opciones disponibles.',
    },
    {
      id: 6,
      question: '¿Hacen tortas de varios pisos o muy decoradas?',
      answer: 'Sí, realizamos tortas de varios pisos y con decoraciones elaboradas. Estos pedidos requieren mayor anticipación.',
    },
    {
      id: 7,
      question: '¿Hacen descuentos para pedidos grandes o eventos?',
      answer: 'Sí, ofrecemos descuentos por cantidad para eventos especiales. Contactanos para obtener una cotización personalizada.',
    },
  ];

  toggle(index: number) {
    if (this.openIndex() === index) {
      this.openIndex.set(-1);
    } else {
      this.openIndex.set(index);
    }
  }
}
