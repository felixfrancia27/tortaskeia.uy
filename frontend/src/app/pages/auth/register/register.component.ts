import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <section class="auth-page">
      <div class="container">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Crear Cuenta</h1>
            <p>Registrate para hacer pedidos y seguir tus órdenes</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            @if (error()) {
              <div class="alert alert-error">
                {{ error() }}
              </div>
            }

            <div class="form-group">
              <label for="full_name">Nombre Completo</label>
              <input 
                type="text" 
                id="full_name" 
                formControlName="full_name"
                class="input"
                placeholder="Tu nombre"
                [class.error]="isFieldInvalid('full_name')"
              />
              @if (isFieldInvalid('full_name')) {
                <span class="field-error">El nombre es requerido</span>
              }
            </div>

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
              <label for="phone">Teléfono (opcional)</label>
              <input 
                type="tel" 
                id="phone" 
                formControlName="phone"
                class="input"
                placeholder="099 123 456"
              />
            </div>

            <div class="form-group">
              <label for="password">Contraseña</label>
              <div class="password-input">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  id="password" 
                  formControlName="password"
                  class="input"
                  placeholder="Mínimo 6 caracteres"
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
                <span class="field-error">La contraseña debe tener al menos 6 caracteres</span>
              }
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmar Contraseña</label>
              <input 
                type="password" 
                id="confirmPassword" 
                formControlName="confirmPassword"
                class="input"
                placeholder="Repetí tu contraseña"
                [class.error]="isFieldInvalid('confirmPassword') || passwordMismatch()"
              />
              @if (passwordMismatch()) {
                <span class="field-error">Las contraseñas no coinciden</span>
              }
            </div>

            <div class="terms">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="acceptTerms" />
                <span>Acepto los <a href="/terminos" target="_blank">términos y condiciones</a></span>
              </label>
              @if (isFieldInvalid('acceptTerms')) {
                <span class="field-error">Debés aceptar los términos</span>
              }
            </div>

            <button 
              type="submit" 
              class="btn-primary btn-full"
              [disabled]="loading() || form.invalid"
            >
              @if (loading()) {
                <span class="spinner"></span>
                Creando cuenta...
              } @else {
                Crear Cuenta
              }
            </button>
          </form>

          <div class="auth-footer">
            <p>¿Ya tenés cuenta? <a routerLink="/login">Iniciá sesión</a></p>
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
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--ink-light);
        cursor: pointer;
        padding: 4px;

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

    .terms {
      .checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: var(--space-2);
        font-size: var(--text-sm);
        color: var(--ink-light);
        cursor: pointer;

        input[type="checkbox"] {
          margin-top: 2px;
          accent-color: var(--brand);
        }

        a {
          color: var(--brand);
          
          &:hover {
            text-decoration: underline;
          }
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]],
  });

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  passwordMismatch(): boolean {
    const password = this.form.get('password')?.value;
    const confirm = this.form.get('confirmPassword')?.value;
    return confirm && password !== confirm;
  }

  onSubmit() {
    if (this.form.invalid || this.passwordMismatch()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { full_name, email, phone, password } = this.form.value;

    this.authService.register({ full_name, email, phone, password }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'Error al crear la cuenta. Intentá de nuevo.');
      },
    });
  }
}
