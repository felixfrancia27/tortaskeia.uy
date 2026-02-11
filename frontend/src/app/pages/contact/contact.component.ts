import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="contact-page">
      <!-- Hero: misma franja que Tienda / Keia -->
      <div class="contact-hero">
        <div class="contact-hero-strip">
          <div class="contact-hero-bg" aria-hidden="true"></div>
          <div class="contact-hero-inner">
            <h1>Contacto</h1>
            <p>¿Tenés alguna consulta? Estamos para ayudarte.</p>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="contact-layout">
          <!-- Contact Form -->
          <div class="contact-form-wrapper">
            <h2>Envianos un mensaje</h2>
            
            @if (submitted()) {
              <div class="success-message">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <h3>¡Mensaje enviado!</h3>
                <p>Te responderemos a la brevedad.</p>
                <button class="btn-secondary" (click)="resetForm()">Enviar otro mensaje</button>
              </div>
            } @else {
              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="form-row">
                  <div class="form-group">
                    <label for="name">Nombre *</label>
                    <input 
                      type="text" 
                      id="name" 
                      formControlName="name"
                      class="input"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div class="form-group">
                    <label for="email">Email *</label>
                    <input 
                      type="email" 
                      id="email" 
                      formControlName="email"
                      class="input"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="phone">Teléfono</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    formControlName="phone"
                    class="input"
                    placeholder="099 123 456"
                  />
                </div>

                <div class="form-group">
                  <label for="subject">Asunto *</label>
                  <select id="subject" formControlName="subject" class="input">
                    <option value="">Seleccioná un tema</option>
                    <option value="consulta">Consulta general</option>
                    <option value="pedido">Sobre un pedido</option>
                    <option value="personalizado">Torta personalizada</option>
                    <option value="evento">Evento especial</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="message">Mensaje *</label>
                  <textarea 
                    id="message" 
                    formControlName="message"
                    class="input textarea"
                    rows="5"
                    placeholder="Contanos en qué podemos ayudarte..."
                  ></textarea>
                </div>

                <button type="submit" class="btn-primary" [disabled]="submitting() || form.invalid">
                  @if (submitting()) {
                    Enviando...
                  } @else {
                    Enviar Mensaje
                  }
                </button>
              </form>
            }
          </div>

          <!-- Contact Info -->
          <aside class="contact-info">
            <div class="info-card">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3>WhatsApp</h3>
              <p>+598 99 123 456</p>
              <a href="https://wa.me/59899123456" target="_blank" class="btn-whatsapp">
                Escribinos ahora
              </a>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <h3>Email</h3>
              <p>contacto&#64;tortaskeia.uy</p>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3>Ubicación</h3>
              <p>Montevideo, Uruguay</p>
              <small>Retiros con cita previa</small>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3>Horarios</h3>
              <p>Lunes a Viernes: 9:00 - 19:00</p>
              <p>Sábados: 9:00 - 14:00</p>
            </div>

            <div class="social-links">
              <h3>Seguinos</h3>
              <div class="social-icons">
                <a href="https://instagram.com/tortaskeia" target="_blank" rel="noopener" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://facebook.com/tortaskeia" target="_blank" rel="noopener" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-page {
      padding-bottom: var(--space-16);
    }

    .contact-hero {
      padding: var(--space-4) var(--space-4) var(--space-5);
      margin-bottom: var(--space-6);
      background: var(--surface);

      @media (min-width: 768px) {
        padding: var(--space-5) var(--space-6) var(--space-6);
        margin-bottom: var(--space-8);
      }
    }

    .contact-hero-strip {
      position: relative;
      max-width: 720px;
      margin: 0 auto;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(239, 108, 0, 0.2);
    }

    .contact-hero-bg {
      position: absolute;
      inset: 0;
      background: var(--brand);
      z-index: 0;
    }

    .contact-hero-inner {
      position: relative;
      z-index: 1;
      padding: var(--space-4) var(--space-6);
      text-align: center;

      @media (min-width: 768px) {
        padding: var(--space-5) var(--space-8);
      }
    }

    .contact-hero h1 {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 700;
      margin: 0 0 var(--space-1);
      letter-spacing: 0.03em;
      color: #fff;

      @media (min-width: 768px) {
        font-size: var(--text-2xl);
        margin-bottom: var(--space-2);
      }
    }

    .contact-hero p {
      margin: 0;
      font-size: var(--text-sm);
      line-height: 1.45;
      color: rgba(255, 255, 255, 0.95);
      max-width: 380px;
      margin-left: auto;
      margin-right: auto;

      @media (min-width: 768px) {
        font-size: var(--text-base);
      }
    }

    .contact-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-8);

      @media (min-width: 1024px) {
        grid-template-columns: 1fr 380px;
      }
    }

    .contact-form-wrapper {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-8);

      h2 {
        font-size: var(--text-xl);
        margin-bottom: var(--space-6);
      }
    }

    .success-message {
      text-align: center;
      padding: var(--space-8);

      svg {
        color: #10B981;
        margin-bottom: var(--space-4);
      }

      h3 {
        font-size: var(--text-xl);
        margin-bottom: var(--space-2);
      }

      p {
        color: var(--ink-light);
        margin-bottom: var(--space-6);
      }
    }

    .form-group {
      margin-bottom: var(--space-4);

      label {
        display: block;
        font-size: var(--text-sm);
        font-weight: 500;
        margin-bottom: var(--space-2);
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .input {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-base);
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);

      &:focus {
        outline: none;
        border-color: var(--brand);
        box-shadow: 0 0 0 3px rgba(247, 87, 12, 0.1);
      }

      &.textarea {
        resize: vertical;
      }
    }

    .btn-primary {
      padding: var(--space-3) var(--space-6);
      background-color: var(--brand);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;

      &:hover:not(:disabled) {
        background-color: var(--brand-dark);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      padding: var(--space-3) var(--space-6);
      background: white;
      color: var(--ink);
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background: var(--surface);
      }
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .info-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-5);

      .info-icon {
        width: 48px;
        height: 48px;
        background: var(--surface);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--brand);
        margin-bottom: var(--space-3);
      }

      h3 {
        font-size: var(--text-base);
        margin-bottom: var(--space-2);
      }

      p {
        font-size: var(--text-sm);
        color: var(--ink-light);
        margin-bottom: 2px;
      }

      small {
        font-size: var(--text-xs);
        color: var(--ink-muted);
      }
    }

    .btn-whatsapp {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      margin-top: var(--space-3);
      padding: var(--space-2) var(--space-4);
      background: var(--whatsapp);
      color: white;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: 600;

      &:hover {
        opacity: 0.9;
        color: white;
      }
    }

    .social-links {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-5);

      h3 {
        font-size: var(--text-base);
        margin-bottom: var(--space-3);
      }
    }

    .social-icons {
      display: flex;
      gap: var(--space-3);

      a {
        width: 44px;
        height: 44px;
        background: var(--surface);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ink);
        transition: all var(--transition-fast);

        &:hover {
          background: var(--brand);
          color: white;
        }
      }
    }
  `],
})
export class ContactComponent {
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  submitting = signal(false);
  submitted = signal(false);

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    // Simulate API call
    setTimeout(() => {
      this.submitting.set(false);
      this.submitted.set(true);
    }, 1500);
  }

  resetForm() {
    this.form.reset();
    this.submitted.set(false);
  }
}
