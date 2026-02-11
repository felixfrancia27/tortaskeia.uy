import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <section class="auth-page">
      <div class="container">
        <div class="auth-card">
          <div class="auth-header">
            <h1>Cambiar contraseña</h1>
            <p>Por seguridad, elegí una nueva contraseña para tu cuenta.</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            @if (error()) {
              <div class="alert alert-error">
                {{ error() }}
              </div>
            }
            @if (success()) {
              <div class="alert alert-success">
                Contraseña actualizada. Redirigiendo...
              </div>
            }

            <div class="form-group">
              <label for="current">Contraseña actual</label>
              <input
                type="password"
                id="current"
                formControlName="current_password"
                class="input"
                placeholder="Tu contraseña actual"
              />
              @if (form.get('current_password')?.invalid && form.get('current_password')?.touched) {
                <span class="field-error">Requerida</span>
              }
            </div>

            <div class="form-group">
              <label for="new">Nueva contraseña</label>
              <input
                type="password"
                id="new"
                formControlName="new_password"
                class="input"
                placeholder="Nueva contraseña (mín. 6 caracteres)"
              />
              @if (form.get('new_password')?.invalid && form.get('new_password')?.touched) {
                <span class="field-error">Mínimo 6 caracteres</span>
              }
            </div>

            <div class="form-group">
              <label for="confirm">Confirmar nueva contraseña</label>
              <input
                type="password"
                id="confirm"
                formControlName="confirm_password"
                class="input"
                placeholder="Repetí la nueva contraseña"
              />
              @if (form.get('confirm_password')?.touched && form.hasError('mismatch')) {
                <span class="field-error">Las contraseñas no coinciden</span>
              }
            </div>

            <button
              type="submit"
              class="btn-primary btn-full"
              [disabled]="loading() || form.invalid"
            >
              @if (loading()) {
                <span class="spinner"></span>
                Guardando...
              } @else {
                Cambiar contraseña
              }
            </button>
          </form>

          <div class="auth-footer">
            <a [routerLink]="returnUrl()">Volver</a>
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
      label {
        display: block;
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--ink);
        margin-bottom: var(--space-2);
      }
    }

    .field-error {
      display: block;
      font-size: var(--text-xs);
      color: var(--error);
      margin-top: var(--space-1);
    }

    .alert {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
    }

    .alert-error {
      background: #FEE2E2;
      color: #DC2626;
    }

    .alert-success {
      background: #D1FAE5;
      color: #059669;
    }

    .btn-full {
      width: 100%;
      margin-top: var(--space-2);
    }

    .auth-footer {
      margin-top: var(--space-6);
      text-align: center;

      a {
        color: var(--brand);
        font-weight: 500;
      }
    }

    .spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
      vertical-align: middle;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup = this.fb.group(
    {
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required],
    },
    { validators: (g) => (g.get('new_password')?.value === g.get('confirm_password')?.value ? null : { mismatch: true }) }
  );

  loading = signal(false);
  error = signal('');
  success = signal(false);

  returnUrl(): string {
    const url = this.route.snapshot.queryParams['returnUrl'];
    return url || '/';
  }

  onSubmit() {
    this.error.set('');
    if (this.form.invalid) return;
    const current = this.form.get('current_password')?.value;
    const newPwd = this.form.get('new_password')?.value;
    if (!current || !newPwd) return;
    this.loading.set(true);
    this.auth.changePassword(current, newPwd).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        this.auth.refreshUser();
        setTimeout(() => {
          this.router.navigateByUrl(this.returnUrl());
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'Error al cambiar la contraseña');
      },
    });
  }
}
