import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';
import { ApiService } from '@app/core/services/api.service';

export type EventoTipo = 'desayunos' | 'cumpleanos' | 'meriendas' | 'bodas';

const EVENT_TYPE_LABELS: Record<EventoTipo, string> = {
  desayunos: 'Desayunos',
  cumpleanos: 'Cumpleaños',
  meriendas: 'Meriendas',
  bodas: 'Bodas',
};

export interface EventAddOn {
  id: number;
  event_type: EventoTipo;
  label: string;
  description: string | null;
  price: number;
  max_qty: number | null;
  sort_order: number;
  is_active: boolean;
}

@Component({
  selector: 'app-admin-event-addons',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="event-addons-page">
        <header class="page-header">
          <div>
            <h1>Ítems de eventos</h1>
            <p>Gestioná los ítems que se muestran en cada tipo de evento (Desayunos, Cumpleaños, Meriendas, Bodas).</p>
          </div>
        </header>

        <div class="tabs">
          @for (t of eventTypes; track t) {
            <button
              type="button"
              class="tab"
              [class.active]="selectedType() === t"
              (click)="selectType(t)"
            >
              {{ getEventTypeLabel(t) }}
            </button>
          }
        </div>

        <div class="list-header">
          <h2>{{ eventTypeLabels[selectedType()] }}</h2>
          <button class="btn-primary" (click)="openModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Nuevo ítem
          </button>
        </div>

        @if (loading()) {
          <p class="loading">Cargando ítems...</p>
        } @else if (error()) {
          <div class="empty-state error">
            <p>{{ error() }}</p>
            <button type="button" class="btn-secondary" (click)="loadAddons()">Reintentar</button>
          </div>
        } @else {
          <div class="addons-list">
            @for (a of addons(); track a.id) {
              <div class="addon-card">
                <div class="addon-info">
                  <h3>{{ a.label }}</h3>
                  @if (a.description) {
                    <p class="addon-desc">{{ a.description }}</p>
                  }
                  <div class="addon-meta">
                    <span class="price">{{ formatPrice(a.price) }}</span>
                    @if (a.max_qty != null && a.max_qty > 0) {
                      <span class="max-qty">Cantidad máx: {{ a.max_qty }}</span>
                    }
                    @if (!a.is_active) {
                      <span class="badge inactive">Inactivo</span>
                    }
                  </div>
                </div>
                <div class="addon-actions">
                  <button class="action-btn edit" (click)="editAddon(a)" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    </svg>
                  </button>
                  <button class="action-btn delete" (click)="deleteAddon(a)" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <p>No hay ítems para este evento. Agregá el primero.</p>
              </div>
            }
          </div>
        }
      </div>

      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingAddon() ? 'Editar ítem' : 'Nuevo ítem' }}</h2>
              <button class="close-btn" (click)="closeModal()">×</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label for="label">Nombre / Etiqueta *</label>
                <input type="text" id="label" [(ngModel)]="formData.label" class="input" placeholder="Ej: Torta principal" />
              </div>
              <div class="form-group">
                <label for="description">Descripción</label>
                <textarea id="description" [(ngModel)]="formData.description" class="input textarea" rows="2" placeholder="Texto que ve el cliente"></textarea>
              </div>
              <div class="form-group">
                <label for="price">Precio (referencia) *</label>
                <input type="number" id="price" [(ngModel)]="formData.price" class="input" min="0" step="1" placeholder="Ej: 2500" />
              </div>
              <div class="form-group">
                <label for="max_qty">Cantidad máxima (opcional)</label>
                <input type="number" id="max_qty" [(ngModel)]="formData.max_qty" class="input" min="0" placeholder="Ej: 10. Dejar vacío si no aplica" />
                <span class="form-hint">Si se define, el cliente podrá elegir cantidad (ej. docenas de cupcakes).</span>
              </div>
              <div class="form-group">
                <label for="sort_order">Orden</label>
                <input type="number" id="sort_order" [(ngModel)]="formData.sort_order" class="input" min="0" />
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formData.is_active" />
                  <span>Visible en la página del evento</span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeModal()">Cancelar</button>
              <button class="btn-primary" (click)="saveAddon()" [disabled]="!formData.label || formData.price == null || formData.price < 0">
                {{ editingAddon() ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      }
    </app-admin-layout>
  `,
  styles: [`
    .event-addons-page { max-width: 800px; }

    .page-header {
      margin-bottom: var(--space-6);
    }
    .page-header h1 { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--ink); margin-bottom: var(--space-1); }
    .page-header p { color: var(--ink-light); font-size: var(--text-sm); }

    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
    }
    .tab {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      border: 1px solid rgba(var(--brand-rgb), 0.3);
      background: var(--surface-white);
      font-weight: 500;
      font-size: var(--text-sm);
      color: var(--ink);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .tab:hover { border-color: var(--brand); background: var(--surface); }
    .tab.active { background: var(--brand); color: white; border-color: var(--brand); }

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
    .list-header h2 { font-family: var(--font-display); font-size: var(--text-xl); color: var(--ink); margin: 0; }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-5);
      min-height: 44px;
      background-color: var(--brand);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: var(--text-sm);
      cursor: pointer;
    }
    .btn-primary:hover { background-color: var(--brand-dark); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .loading { color: var(--ink-light); padding: var(--space-4); }

    .addons-list { display: flex; flex-direction: column; gap: var(--space-3); }

    .addon-card {
      background: var(--surface-white);
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      display: flex;
      align-items: center;
      gap: var(--space-4);
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(var(--brand-rgb), 0.08);
      flex-wrap: wrap;
    }
    .addon-info { flex: 1; min-width: 0; }
    .addon-info h3 { font-size: var(--text-base); font-weight: 600; color: var(--ink); margin: 0 0 var(--space-1); }
    .addon-desc { font-size: var(--text-sm); color: var(--ink-light); margin: 0 0 var(--space-2); }
    .addon-meta { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
    .addon-meta .price { font-weight: 700; color: var(--ink); }
    .addon-meta .max-qty { font-size: var(--text-xs); color: var(--ink-muted); }
    .badge.inactive { background: #FEE2E2; color: #991B1B; padding: 2px 8px; border-radius: 999px; font-size: var(--text-xs); }
    .addon-actions { display: flex; gap: var(--space-2); }
    .action-btn {
      width: 44px; height: 44px; min-width: 44px; min-height: 44px;
      display: flex; align-items: center; justify-content: center;
      border-radius: var(--radius-md); border: none; cursor: pointer;
      transition: all var(--transition-fast);
    }
    .action-btn.edit { background: #DBEAFE; color: #2563EB; }
    .action-btn.edit:hover { background: #BFDBFE; }
    .action-btn.delete { background: #FEE2E2; color: #DC2626; }
    .action-btn.delete:hover { background: #FECACA; }

    .empty-state { text-align: center; padding: var(--space-8); color: var(--ink-light); background: var(--surface-white); border-radius: var(--radius-xl); }
    .empty-state.error p { margin-bottom: var(--space-3); }
    .form-hint { font-size: var(--text-xs); color: var(--ink-muted); margin-top: var(--space-1); display: block; }

    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: white; border-radius: var(--radius-xl);
      width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
      margin: var(--space-4);
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: var(--space-5); border-bottom: 1px solid #E0D5C8;
    }
    .modal-header h2 { font-size: var(--text-lg); color: var(--ink); margin: 0; }
    .close-btn {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      background: none; border: none; font-size: 24px; color: var(--ink-light); cursor: pointer;
    }
    .close-btn:hover { color: var(--ink); }
    .modal-body { padding: var(--space-5); }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: var(--space-3);
      padding: var(--space-5); border-top: 1px solid #E0D5C8;
    }
    .form-group { margin-bottom: var(--space-4); }
    .form-group label { display: block; font-size: var(--text-sm); font-weight: 500; color: var(--ink); margin-bottom: var(--space-2); }
    .input {
      width: 100%; padding: var(--space-3); font-size: var(--text-sm);
      border: 1px solid #E0D5C8; border-radius: var(--radius-md);
    }
    .input:focus { outline: none; border-color: var(--brand); }
    .textarea { resize: vertical; }
    .checkbox-label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; }
    .checkbox-label input { accent-color: var(--brand); }
    .btn-secondary {
      padding: var(--space-3) var(--space-5); background: white; border: 1px solid #E0D5C8;
      border-radius: var(--radius-md); font-weight: 600; cursor: pointer;
    }
    .btn-secondary:hover { background: var(--surface); }
  `],
})
export class AdminEventAddonsComponent implements OnInit {
  private api = inject(ApiService);

  readonly eventTypeLabels = EVENT_TYPE_LABELS;
  readonly eventTypes: EventoTipo[] = ['desayunos', 'cumpleanos', 'meriendas', 'bodas'];
  selectedType = signal<EventoTipo>('desayunos');
  addons = signal<EventAddOn[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showModal = signal(false);
  editingAddon = signal<EventAddOn | null>(null);

  formData = {
    label: '',
    description: '',
    price: 0,
    max_qty: null as number | null,
    sort_order: 0,
    is_active: true,
  };

  ngOnInit() {
    this.loadAddons();
  }

  selectType(t: EventoTipo) {
    this.selectedType.set(t);
    this.loadAddons();
  }

  loadAddons() {
    this.loading.set(true);
    this.error.set(null);
    this.api.get<EventAddOn[]>('/admin/event-addons', { event_type: this.selectedType() }).subscribe({
      next: (list) => {
        this.addons.set(Array.isArray(list) ? list : []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'No se pudieron cargar los ítems. ¿El backend tiene el endpoint GET /admin/event-addons?');
      },
    });
  }

  getEventTypeLabel(key: string): string {
    return this.eventTypeLabels[key as EventoTipo] ?? key;
  }

  formatPrice(value: number): string {
    return '$' + (value ?? 0).toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  openModal() {
    this.editingAddon.set(null);
    this.formData = { label: '', description: '', price: 0, max_qty: null, sort_order: this.addons().length, is_active: true };
    this.showModal.set(true);
  }

  editAddon(a: EventAddOn) {
    this.editingAddon.set(a);
    this.formData = {
      label: a.label,
      description: a.description ?? '',
      price: a.price,
      max_qty: a.max_qty,
      sort_order: a.sort_order,
      is_active: a.is_active,
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingAddon.set(null);
  }

  saveAddon() {
    const editing = this.editingAddon();
    const payload = {
      event_type: this.selectedType(),
      label: this.formData.label.trim(),
      description: this.formData.description.trim() || null,
      price: Number(this.formData.price) || 0,
      max_qty: this.formData.max_qty != null && this.formData.max_qty > 0 ? Number(this.formData.max_qty) : null,
      sort_order: Number(this.formData.sort_order) || 0,
      is_active: this.formData.is_active,
    };
    if (editing) {
      this.api.put(`/admin/event-addons/${editing.id}`, payload).subscribe({
        next: () => { this.closeModal(); this.loadAddons(); },
        error: (e) => { this.error.set(e?.error?.message || 'Error al guardar'); },
      });
    } else {
      this.api.post('/admin/event-addons', payload).subscribe({
        next: () => { this.closeModal(); this.loadAddons(); },
        error: (e) => { this.error.set(e?.error?.message || 'Error al crear'); },
      });
    }
  }

  deleteAddon(a: EventAddOn) {
    if (!confirm(`¿Eliminar "${a.label}"?`)) return;
    this.api.delete(`/admin/event-addons/${a.id}`).subscribe({
      next: () => this.loadAddons(),
      error: (e) => this.error.set(e?.error?.message || 'Error al eliminar'),
    });
  }
}
