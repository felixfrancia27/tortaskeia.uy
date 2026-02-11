import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';
import { ApiService } from '@app/core/services/api.service';
import { environment } from '@env/environment';

interface CakeDesign {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

@Component({
  selector: 'app-admin-designs',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="designs-page">
        <header class="page-header">
          <div>
            <h1>Diseños de tortas</h1>
            <p>Galería de diseños para "Crea tu torta". Los activos se muestran en el configurador.</p>
          </div>
          <button class="btn-primary" (click)="openModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Nuevo diseño
          </button>
        </header>

        <div class="designs-grid">
          @for (d of designs(); track d.id) {
            <div class="design-card">
              <div class="design-image-wrap">
                <img [src]="imageFullUrl(d.image_url)" [alt]="d.name" />
                <span class="badge" [class.active]="d.is_active" [class.inactive]="!d.is_active">
                  {{ d.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <div class="design-info">
                <h3>{{ d.name }}</h3>
                <p class="design-slug">/{{ d.slug }}</p>
              </div>
              <div class="design-actions">
                <button class="action-btn edit" (click)="editDesign(d)" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  </svg>
                </button>
                <button class="action-btn delete" (click)="deleteDesign(d)" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <p>No hay diseños. Creá el primero para la galería de "Crea tu torta".</p>
            </div>
          }
        </div>
      </div>

      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingDesign() ? 'Editar diseño' : 'Nuevo diseño' }}</h2>
              <button class="close-btn" (click)="closeModal()">×</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label for="name">Nombre *</label>
                <input type="text" id="name" [(ngModel)]="formData.name" class="input" placeholder="Ej: Clásico blanco" />
              </div>
              <div class="form-group">
                <label for="slug">Slug (URL)</label>
                <input type="text" id="slug" [(ngModel)]="formData.slug" class="input" placeholder="clasico-blanco" />
              </div>
              <div class="form-group">
                <label for="image_url">URL de la imagen *</label>
                <input type="text" id="image_url" [(ngModel)]="formData.image_url" class="input" placeholder="/uploads/foto.png o https://..." />
                @if (formData.image_url) {
                  <div class="image-preview">
                    <img [src]="imageFullUrl(formData.image_url)" alt="Vista previa" />
                  </div>
                }
              </div>
              <div class="form-group">
                <label for="description">Descripción</label>
                <textarea id="description" [(ngModel)]="formData.description" class="input textarea" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label for="sort_order">Orden</label>
                <input type="number" id="sort_order" [(ngModel)]="formData.sort_order" class="input" min="0" />
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formData.is_active" />
                  <span>Visible en "Crea tu torta"</span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeModal()">Cancelar</button>
              <button class="btn-primary" (click)="saveDesign()" [disabled]="!formData.name || !formData.image_url">
                {{ editingDesign() ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      }
    </app-admin-layout>
  `,
  styles: [`
    .designs-page { max-width: 1000px; }

    .page-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }
    .page-header h1 { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--ink); margin-bottom: var(--space-1); }
    .page-header p { color: var(--ink-light); font-size: var(--text-sm); }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-5);
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

    .designs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-4);
    }

    .design-card {
      background: var(--surface-white);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(var(--brand-rgb), 0.12);
      display: flex;
      flex-direction: column;
    }

    .design-image-wrap {
      position: relative;
      aspect-ratio: 1;
      background: var(--surface);
    }
    .design-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .design-image-wrap .badge {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      padding: 2px 8px;
      border-radius: 999px;
      font-size: var(--text-xs);
      font-weight: 500;
    }
    .design-image-wrap .badge.active { background: #D1FAE5; color: #059669; }
    .design-image-wrap .badge.inactive { background: #FEE2E2; color: #DC2626; }

    .design-info {
      padding: var(--space-3);
      flex: 1;
    }
    .design-info h3 { font-size: var(--text-base); font-weight: 600; margin: 0 0 var(--space-1); color: var(--ink); }
    .design-slug { font-size: var(--text-xs); color: var(--ink-light); margin: 0; }

    .design-actions {
      padding: var(--space-2) var(--space-3);
      display: flex;
      gap: var(--space-2);
      border-top: 1px solid #eee;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
    }
    .action-btn.edit { background: #DBEAFE; color: #2563EB; }
    .action-btn.edit:hover { background: #BFDBFE; }
    .action-btn.delete { background: #FEE2E2; color: #DC2626; }
    .action-btn.delete:hover { background: #FECACA; }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: var(--space-10);
      color: var(--ink-light);
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
    }
    .modal {
      background: white;
      border-radius: var(--radius-xl);
      max-width: 480px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-5);
      border-bottom: 1px solid #eee;
    }
    .modal-header h2 { margin: 0; font-size: var(--text-lg); color: var(--ink); }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--ink-light); }
    .modal-body { padding: var(--space-5); }
    .form-group { margin-bottom: var(--space-4); }
    .form-group label { display: block; font-size: var(--text-sm); font-weight: 500; margin-bottom: var(--space-1); color: var(--ink); }
    .input { width: 100%; padding: var(--space-2) var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); font-size: var(--text-sm); }
    .textarea { min-height: 60px; resize: vertical; }
    .checkbox-label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; }
    .image-preview { margin-top: var(--space-2); }
    .image-preview img { max-width: 120px; max-height: 120px; object-fit: cover; border-radius: var(--radius-md); }
    .modal-footer {
      padding: var(--space-5);
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
    }
    .btn-secondary {
      padding: var(--space-2) var(--space-4);
      background: #f3f4f6;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 500;
      cursor: pointer;
    }
  `],
})
export class AdminDesignsComponent implements OnInit {
  private api = inject(ApiService);

  designs = signal<CakeDesign[]>([]);
  showModal = signal(false);
  editingDesign = signal<CakeDesign | null>(null);
  formData: {
    name: string;
    slug: string;
    image_url: string;
    description: string;
    sort_order: number;
    is_active: boolean;
  } = {
    name: '',
    slug: '',
    image_url: '',
    description: '',
    sort_order: 0,
    is_active: true,
  };

  ngOnInit() {
    this.loadDesigns();
  }

  /** Build full URL for image (relative paths get API origin). */
  imageFullUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = environment.apiUrl.replace(/\/api\/?$/, '');
    return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
  }

  loadDesigns() {
    this.api.get<CakeDesign[]>('/admin/designs').subscribe({
      next: (list) => this.designs.set(list),
      error: () => this.designs.set([]),
    });
  }

  openModal() {
    this.editingDesign.set(null);
    this.formData = { name: '', slug: '', image_url: '', description: '', sort_order: 0, is_active: true };
    this.showModal.set(true);
  }

  editDesign(d: CakeDesign) {
    this.editingDesign.set(d);
    this.formData = {
      name: d.name,
      slug: d.slug,
      image_url: d.image_url,
      description: d.description ?? '',
      sort_order: d.sort_order,
      is_active: d.is_active,
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingDesign.set(null);
  }

  saveDesign() {
    const id = this.editingDesign()?.id;
    const payload = {
      name: this.formData.name,
      slug: this.formData.slug || undefined,
      image_url: this.formData.image_url,
      description: this.formData.description || null,
      sort_order: this.formData.sort_order,
      is_active: this.formData.is_active,
    };
    if (id != null) {
      this.api.put(`/admin/designs/${id}`, payload).subscribe({
        next: () => { this.loadDesigns(); this.closeModal(); },
        error: () => alert('Error al guardar'),
      });
    } else {
      this.api.post('/admin/designs', payload).subscribe({
        next: () => { this.loadDesigns(); this.closeModal(); },
        error: () => alert('Error al crear'),
      });
    }
  }

  deleteDesign(d: CakeDesign) {
    if (!confirm(`¿Eliminar el diseño "${d.name}"?`)) return;
    this.api.delete(`/admin/designs/${d.id}`).subscribe({
      next: () => this.designs.update(list => list.filter(x => x.id !== d.id)),
      error: () => alert('Error al eliminar'),
    });
  }
}
