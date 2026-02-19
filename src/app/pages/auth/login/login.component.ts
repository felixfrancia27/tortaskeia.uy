import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <section class="auth-page">
      <div class="container">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Iniciar Sesión</h1>
            <p>Ingresá a tu cuenta para gestionar tus pedidos</p>
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

            <div class="form-group">
              <label for="password">Contraseña</label>
              <div class="password-input">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  id="password" 
                  formControlName="password"
                  class="input"
                  placeholder="Tu contraseña"
                  [class.error]="isFieldInvalid('password')"
                />
                <button 
                  type="button" 
                  class="toggle-password"
                  (click)="showPassword.set(!showPassword())"
                >
                  @if (showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <span class="field-error">La contraseña es requerida</span>
              }
            </div>

            <div class="form-actions">
              <a routerLink="/recuperar-password" class="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>

            <button 
              type="submit" 
              class="btn-primary btn-full"
              [disabled]="loading() || form.invalid"
            >
              @if (loading()) {
                <span class="spinner"></span>
                Ingresando...
              } @else {
                Iniciar Sesión
              }
            </button>
          </form>

          <div class="auth-footer">
            <p>¿No tenés cuenta? <a routerLink="/registro">Registrate</a></p>
          </div>
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
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--brand);
        box-shadow: 0 0 0 3px rgba(247, 87, 12, 0.1);
      }

      &.error {
        border-color: var(--error);
      }

      &::placeholder {
        color: var(--ink-muted);
      }
    }

    .password-input {
      position: relative;

      .input {
        padding-right: 48px;
      }

      .toggle-password {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 48px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: var(--ink-light);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;

        &:hover {
          color: var(--ink);
        }
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

    .form-actions {
      display: flex;
      justify-content: flex-end;

      .forgot-link {
        font-size: var(--text-sm);
        color: var(--brand);

        &:hover {
          text-decoration: underline;
        }
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
      padding-top: var(--space-6);
      border-top: 1px solid #E0D5C8;

      p {
        font-size: var(--text-sm);
        color: var(--ink-light);

        a {
          color: var(--brand);
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

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

    this.authService.login(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'Error al iniciar sesión. Verificá tus datos.');
      },
    });
  }
}
