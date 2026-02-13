import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@app/core/services/api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <section class="auth-page">
      <div class="container">
        <div class="auth-card">
          @if (emailSent()) {
            <div class="success-state">
              <div class="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h1>Email Enviado</h1>
              <p>Te enviamos un email a <strong>{{ form.get('email')?.value }}</strong> con instrucciones para restablecer tu contraseña.</p>
              <p class="hint">Si no lo ves, revisá tu carpeta de spam.</p>
              <a routerLink="/login" class="btn-primary">Volver a Iniciar Sesión</a>
            </div>
          } @else {
            <div class="auth-header">
              <h1>Recuperar Contraseña</h1>
              <p>Ingresá tu email y te enviaremos instrucciones para restablecer tu contraseña</p>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
              @if (error()) {
                <div class="alert alert-error">
                  {{ error() }}
                </div>
              }

              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  formControlName="email"
                  class="input"
                  placeholder="tu@email.com"
                  [class.error]="isFieldInvalid('email')"
                />
                @if (isFieldInvalid('email')) {
                  <span class="field-error">Ingresá un email válido</span>
                }
              </div>

              <button 
                type="submit" 
                class="btn-primary btn-full"
                [disabled]="loading() || form.invalid"
              >
                @if (loading()) {
                  <span class="spinner"></span>
                  Enviando...
                } @else {
                  Enviar Instrucciones
                }
              </button>
            </form>

            <div class="auth-footer">
              <p><a routerLink="/login">← Volver a Iniciar Sesión</a></p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .auth-page {
      padding: var(--space-24) 0 var(--space-16);
      min-height: 80vh;
      display: flex;
      align-items: center;
      background-color: var(--surface);
    }

    .auth-card {
      max-width: 420px;
      margin: 0 auto;
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-8);
      box-shadow: var(--shadow-soft);
    }

    .success-state {
      text-align: center;

      .success-icon {
        color: var(--success);
        margin-bottom: var(--space-4);
      }

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        color: var(--ink);
        margin-bottom: var(--space-4);
      }

      p {
        color: var(--ink-light);
        margin-bottom: var(--space-2);

        strong {
          color: var(--ink);
        }
      }

      .hint {
        font-size: var(--text-sm);
        margin-bottom: var(--space-6);
      }

      .btn-primary {
        display: inline-block;
        padding: var(--space-3) var(--space-6);
        background-color: var(--brand);
        color: white;
        border-radius: var(--radius-md);
        font-weight: 600;
        text-decoration: none;

        &:hover {
          background-color: var(--brand-dark);
          color: white;
        }
      }
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--space-6);

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        color: var(--ink);
        margin-bottom: var(--space-2);
      }

      p {
        color: var(--ink-light);
        font-size: var(--text-sm);
      }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);

      label {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--ink);
      }
    }

    .input {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-base);
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);
      background-color: white;
      transition: border-color var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--brand);
        box-shadow: 0 0 0 3px rgba(247, 87, 12, 0.1);
      }

      &.error {
        border-color: var(--error);
      }
    }

    .field-error {
      font-size: var(--text-xs);
      color: var(--error);
    }

    .alert {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);

      &.alert-error {
        background-color: #FEE2E2;
        color: #DC2626;
        border: 1px solid #FECACA;
      }
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-6);
      font-size: var(--text-base);
      font-weight: 600;
      background-color: var(--brand);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background-color var(--transition-fast);

      &:hover:not(:disabled) {
        background-color: var(--brand-dark);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-full {
      width: 100%;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      text-align: center;
      margin-top: var(--space-6);

      a {
        color: var(--brand);
        font-size: var(--text-sm);

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `],
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading = signal(false);
  error = signal<string | null>(null);
  emailSent = signal(false);

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.api.post('/auth/forgot-password', this.form.value).subscribe({
      next: () => {
        this.emailSent.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        // Always show success to prevent email enumeration
        this.emailSent.set(true);
      },
    });
  }
}
