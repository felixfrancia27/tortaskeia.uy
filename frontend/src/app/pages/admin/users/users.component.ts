import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';
import { ApiService } from '@app/core/services/api.service';
import { AuthService } from '@app/core/services/auth.service';

interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, DatePipe, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="users-page">
        <header class="page-header">
          <div>
            <h1>Usuarios</h1>
            <p>Gestiona cuentas y permisos de administrador</p>
          </div>
        </header>

        @if (loading()) {
          <div class="loading">Cargando usuarios...</div>
        } @else {
          <div class="table-wrap">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nombre</th>
                  <th>Registro</th>
                  <th>Activo</th>
                  <th>Admin</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (u of users(); track u.id) {
                  <tr>
                    <td>{{ u.email }}</td>
                    <td>{{ u.full_name }}</td>
                    <td>{{ u.created_at | date:'dd/MM/yyyy' }}</td>
                    <td>
                      @if (u.id !== currentUserId()) {
                        <button
                          type="button"
                          class="toggle-btn"
                          [class.active]="u.is_active"
                          [class.inactive]="!u.is_active"
                          (click)="toggleActive(u)"
                          [disabled]="updatingId() === u.id"
                        >
                          {{ u.is_active ? 'Sí' : 'No' }}
                        </button>
                      } @else {
                        <span class="badge you">Vos</span>
                      }
                    </td>
                    <td>
                      @if (u.id !== currentUserId()) {
                        <button
                          type="button"
                          class="toggle-btn admin"
                          [class.is-admin]="u.is_admin"
                          (click)="toggleAdmin(u)"
                          [disabled]="updatingId() === u.id"
                        >
                          {{ u.is_admin ? 'Sí' : 'No' }}
                        </button>
                      } @else {
                        <span class="badge you">Admin</span>
                      }
                    </td>
                    <td>
                      @if (u.id !== currentUserId() && updatingId() !== u.id) {
                        <span class="muted">—</span>
                      }
                      @if (updatingId() === u.id) {
                        <span class="saving">Guardando...</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (users().length === 0) {
            <div class="empty-state">
              <p>No hay usuarios registrados.</p>
            </div>
          }
        }
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .users-page {
      max-width: 1000px;
    }

    .page-header {
      margin-bottom: var(--space-6);

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        color: var(--ink);
        margin-bottom: var(--space-2);
      }

      p {
        color: var(--ink-light);
      }
    }

    .loading, .empty-state {
      padding: var(--space-8);
      text-align: center;
      color: var(--ink-light);
    }

    .table-wrap {
      overflow-x: auto;
      background: white;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: var(--space-4);
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      th {
        font-size: var(--text-xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--ink-light);
      }

      .toggle-btn {
        padding: 4px 10px;
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: 500;
        border: 1px solid #ddd;
        cursor: pointer;
        background: white;

        &.active, &.is-admin {
          background: #D1FAE5;
          color: #059669;
          border-color: #059669;
        }

        &.inactive {
          background: #FEE2E2;
          color: #DC2626;
          border-color: #DC2626;
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }

      .badge.you {
        background: #E0E7FF;
        color: #4338CA;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: var(--text-xs);
      }

      .muted {
        color: var(--ink-muted);
      }

      .saving {
        font-size: var(--text-sm);
        color: var(--ink-light);
      }
    }
  `],
})
export class AdminUsersComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  users = signal<AdminUser[]>([]);
  loading = signal(true);
  updatingId = signal<number | null>(null);
  currentUserId = signal(0);

  ngOnInit() {
    const user = this.auth.user();
    if (user) this.currentUserId.set(user.id);
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.api.get<AdminUser[]>('/admin/users').subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleActive(u: AdminUser) {
    this.updatingId.set(u.id);
    this.api.patch<AdminUser>(`/admin/users/${u.id}`, { is_active: !u.is_active }).subscribe({
      next: () => {
        this.loadUsers();
        this.updatingId.set(null);
      },
      error: () => this.updatingId.set(null),
    });
  }

  toggleAdmin(u: AdminUser) {
    this.updatingId.set(u.id);
    this.api.patch<AdminUser>(`/admin/users/${u.id}`, { is_admin: !u.is_admin }).subscribe({
      next: () => {
        this.loadUsers();
        this.updatingId.set(null);
      },
      error: () => this.updatingId.set(null),
    });
  }
}
