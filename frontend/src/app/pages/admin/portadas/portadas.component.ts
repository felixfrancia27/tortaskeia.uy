import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';
import { ApiService } from '@app/core/services/api.service';
import { environment } from '@env/environment';

/** Resolución recomendada para las imágenes del hero del inicio (visible para el admin). */
export const HERO_COVER_REFERENCE = {
  width: 1920,
  height: 665,
  ratio: '16:5',
  label: '1920 × 665 px',
};

interface HomeCover {
  id: number;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_active: boolean;
}

@Component({
  selector: 'app-admin-portadas',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="portadas-page">
        <header class="page-header">
          <div>
            <h1>Portadas del inicio</h1>
            <p>Imágenes del carrusel del hero en la página de inicio. El orden define la secuencia.</p>
          </div>
          <button class="btn-primary" (click)="openModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Nueva portada
          </button>
        </header>

        <div class="reference-resolution" role="status">
          <strong>Resolución de referencia</strong>
          <p>
            Para que la imagen se vea nítida en todos los dispositivos, subí o usá una imagen de
            <strong>{{ HERO_COVER_REFERENCE.label }}</strong>
            (relación {{ HERO_COVER_REFERENCE.ratio }}). Si la imagen tiene otra proporción, se recortará para llenar el espacio.
          </p>
        </div>

        <div class="covers-list">
          @for (c of covers(); track c.id) {
            <div class="cover-card">
              <div class="cover-preview">
                <img [src]="imageFullUrl(c.image_url)" [alt]="c.alt_text ?? 'Portada'" />
                <span class="badge" [class.active]="c.is_active" [class.inactive]="!c.is_active">
                  {{ c.is_active ? 'Visible' : 'Oculta' }}
                </span>
              </div>
              <div class="cover-meta">
                <span class="cover-order">Orden: {{ c.sort_order }}</span>
                @if (c.alt_text) {
                  <span class="cover-alt">{{ c.alt_text }}</span>
                }
              </div>
              <div class="cover-actions">
                <button class="action-btn edit" (click)="editCover(c)" title="Editar">✎</button>
                <button class="action-btn delete" (click)="deleteCover(c)" title="Eliminar">🗑</button>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <p>No hay portadas. Agregá al menos una para el carrusel del inicio.</p>
            </div>
          }
        </div>
      </div>

      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingCover() ? 'Editar portada' : 'Nueva portada' }}</h2>
              <button class="close-btn" (click)="closeModal()">×</button>
            </div>
            <div class="modal-body">
              <p class="reference-inline">Recomendado: {{ HERO_COVER_REFERENCE.label }} ({{ HERO_COVER_REFERENCE.ratio }})</p>
              <div class="form-group">
                <label for="image_url">URL de la imagen *</label>
                <input type="text" id="image_url" [(ngModel)]="formData.image_url" class="input" placeholder="/uploads/portada.jpg o https://..." />
                @if (formData.image_url) {
                  <div class="image-preview">
                    <img [src]="imageFullUrl(formData.image_url)" alt="Vista previa" />
                  </div>
                }
              </div>
              <div class="form-group">
                <label for="alt_text">Texto alternativo (accesibilidad)</label>
                <input type="text" id="alt_text" [(ngModel)]="formData.alt_text" class="input" placeholder="Ej: Torta decorada con rosas" />
              </div>
              <div class="form-group">
                <label for="sort_order">Orden en el carrusel</label>
                <input type="number" id="sort_order" [(ngModel)]="formData.sort_order" class="input" min="0" />
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formData.is_active" />
                  <span>Visible en el inicio</span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeModal()">Cancelar</button>
              <button class="btn-primary" (click)="saveCover()" [disabled]="!formData.image_url">
                {{ editingCover() ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      }
    </app-admin-layout>
  `,
  styles: [`
    .portadas-page { max-width: 1000px; }

    .page-header {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
    .page-header h1 { font-family: var(--font-display); font-size: var(--text-2xl); color: var(--ink); margin-bottom: var(--space-1); }
    .page-header p { color: var(--ink-light); font-size: var(--text-sm); }

    .reference-resolution {
      background: linear-gradient(135deg, rgba(var(--brand-rgb), 0.08) 0%, var(--surface-alt) 100%);
      border: 1px solid rgba(var(--brand-rgb), 0.25);
      border-radius: var(--radius-lg);
      padding: var(--space-4) var(--space-5);
      margin-bottom: var(--space-6);
    }
    .reference-resolution strong { color: var(--ink); display: block; margin-bottom: var(--space-1); }
    .reference-resolution p { margin: 0; font-size: var(--text-sm); color: var(--ink-light); line-height: 1.5; }

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

    .covers-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-4);
    }

    .cover-card {
      background: var(--surface-white);
      border-radius: var(--radius-xl);
      overflow: hidden;
      border: 1px solid rgba(var(--brand-rgb), 0.12);
      display: flex;
      flex-direction: column;
    }

    .cover-preview {
      position: relative;
      aspect-ratio: 1920 / 665;
      background: var(--surface);
    }
    .cover-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    .cover-preview .badge {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      padding: 2px 8px;
      border-radius: 999px;
      font-size: var(--text-xs);
      font-weight: 500;
    }
    .cover-preview .badge.active { background: #D1FAE5; color: #059669; }
    .cover-preview .badge.inactive { background: #FEE2E2; color: #DC2626; }

    .cover-meta {
      padding: var(--space-3);
      font-size: var(--text-sm);
      color: var(--ink-light);
    }
    .cover-order { display: block; margin-bottom: 2px; }
    .cover-alt { display: block; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .cover-actions {
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
      font-size: 1rem;
    }
    .action-btn.edit { background: #DBEAFE; color: #2563EB; }
    .action-btn.delete { background: #FEE2E2; color: #DC2626; }

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
    .reference-inline {
      font-size: var(--text-xs);
      color: var(--ink-light);
      margin: 0 0 var(--space-3);
      padding: var(--space-2);
      background: var(--surface);
      border-radius: var(--radius-md);
    }
    .form-group { margin-bottom: var(--space-4); }
    .form-group label { display: block; font-size: var(--text-sm); font-weight: 500; margin-bottom: var(--space-1); color: var(--ink); }
    .input { width: 100%; padding: var(--space-2) var(--space-3); border: 1px solid #ddd; border-radius: var(--radius-md); font-size: var(--text-sm); }
    .checkbox-label { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; }
    .image-preview { margin-top: var(--space-2); }
    .image-preview img { max-width: 100%; max-height: 180px; object-fit: contain; border-radius: var(--radius-md); aspect-ratio: 1920/665; }
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
export class AdminPortadasComponent implements OnInit {
  readonly HERO_COVER_REFERENCE = HERO_COVER_REFERENCE;
  private api = inject(ApiService);

  covers = signal<HomeCover[]>([]);
  showModal = signal(false);
  editingCover = signal<HomeCover | null>(null);
  formData: {
    image_url: string;
    alt_text: string;
    sort_order: number;
    is_active: boolean;
  } = {
    image_url: '',
    alt_text: '',
    sort_order: 0,
    is_active: true,
  };

  ngOnInit() {
    this.loadCovers();
  }

  /** /assets/ → origen del frontend; /uploads/ → backend; http → tal cual */
  imageFullUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/assets/')) {
      if (typeof window !== 'undefined') return window.location.origin + url;
      return (environment.siteUrl || '').replace(/\/$/, '') + url;
    }
    const base = environment.apiUrl.replace(/\/api\/?$/, '');
    return url.startsWith('/') ? base + url : base + '/' + url;
  }

  loadCovers() {
    this.api.get<HomeCover[]>('/admin/home-covers').subscribe({
      next: (list) => this.covers.set(list),
      error: () => this.covers.set([]),
    });
  }

  openModal() {
    this.editingCover.set(null);
    this.formData = { image_url: '', alt_text: '', sort_order: this.covers().length, is_active: true };
    this.showModal.set(true);
  }

  editCover(c: HomeCover) {
    this.editingCover.set(c);
    this.formData = {
      image_url: c.image_url,
      alt_text: c.alt_text ?? '',
      sort_order: c.sort_order,
      is_active: c.is_active,
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCover.set(null);
  }

  saveCover() {
    const id = this.editingCover()?.id;
    const payload = {
      image_url: this.formData.image_url,
      alt_text: this.formData.alt_text || null,
      sort_order: this.formData.sort_order,
      is_active: this.formData.is_active,
    };
    if (id != null) {
      this.api.put(`/admin/home-covers/${id}`, payload).subscribe({
        next: () => { this.loadCovers(); this.closeModal(); },
        error: () => alert('Error al guardar'),
      });
    } else {
      this.api.post('/admin/home-covers', payload).subscribe({
        next: () => { this.loadCovers(); this.closeModal(); },
        error: () => alert('Error al crear'),
      });
    }
  }

  deleteCover(c: HomeCover) {
    if (!confirm('¿Eliminar esta portada del carrusel?')) return;
    this.api.delete(`/admin/home-covers/${c.id}`).subscribe({
      next: () => this.covers.update(list => list.filter(x => x.id !== c.id)),
      error: () => alert('Error al eliminar'),
    });
  }
}
