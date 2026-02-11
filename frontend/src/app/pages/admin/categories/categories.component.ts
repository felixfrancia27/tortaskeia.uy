import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';
import { ApiService } from '@app/core/services/api.service';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="categories-page">
        <header class="page-header">
          <div>
            <h1>Categorías</h1>
            <p>Gestiona las categorías de productos</p>
          </div>
          <button class="btn-primary" (click)="openModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Nueva Categoría
          </button>
        </header>

        <div class="categories-list">
          @for (category of categories(); track category.id) {
            <div class="category-card">
              <div class="category-info">
                <h3>{{ category.name }}</h3>
                <span class="category-slug">/{{ category.slug }}</span>
                @if (category.description) {
                  <p>{{ category.description }}</p>
                }
              </div>
              <div class="category-meta">
                <span class="badge" [class.active]="category.is_active" [class.inactive]="!category.is_active">
                  {{ category.is_active ? 'Activa' : 'Inactiva' }}
                </span>
              </div>
              <div class="category-actions">
                <button class="action-btn edit" (click)="editCategory(category)" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  </svg>
                </button>
                <button class="action-btn delete" (click)="deleteCategory(category)" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <p>No hay categorías. Creá la primera.</p>
            </div>
          }
        </div>
      </div>

      <!-- Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingCategory() ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
              <button class="close-btn" (click)="closeModal()">×</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label for="name">Nombre *</label>
                <input 
                  type="text" 
                  id="name" 
                  [(ngModel)]="formData.name"
                  class="input"
                  placeholder="Ej: Tortas Clásicas"
                />
              </div>
              <div class="form-group">
                <label for="slug">Slug (URL)</label>
                <input 
                  type="text" 
                  id="slug" 
                  [(ngModel)]="formData.slug"
                  class="input"
                  placeholder="tortas-clasicas"
                />
              </div>
              <div class="form-group">
                <label for="description">Descripción</label>
                <textarea 
                  id="description" 
                  [(ngModel)]="formData.description"
                  class="input textarea"
                  rows="3"
                ></textarea>
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formData.is_active" />
                  <span>Categoría activa</span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeModal()">Cancelar</button>
              <button class="btn-primary" (click)="saveCategory()" [disabled]="!formData.name">
                {{ editingCategory() ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </div>
        </div>
      }
    </app-admin-layout>
  `,
  styles: [`
    .categories-page {
      max-width: 800px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        color: var(--ink);
        margin-bottom: var(--space-1);
      }

      p {
        color: var(--ink-light);
        font-size: var(--text-sm);
      }
    }

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

      &:hover {
        background-color: var(--brand-dark);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .categories-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .category-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      display: flex;
      align-items: center;
      gap: var(--space-4);
      box-shadow: var(--shadow-sm);
    }

    .category-info {
      flex: 1;

      h3 {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--ink);
        margin-bottom: var(--space-1);
      }

      .category-slug {
        font-size: var(--text-sm);
        color: var(--ink-muted);
        font-family: monospace;
      }

      p {
        font-size: var(--text-sm);
        color: var(--ink-light);
        margin-top: var(--space-2);
      }
    }

    .badge {
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-sm);
      font-size: var(--text-xs);
      font-weight: 500;

      &.active {
        background-color: #D1FAE5;
        color: #065F46;
      }

      &.inactive {
        background-color: #FEE2E2;
        color: #991B1B;
      }
    }

    .category-actions {
      display: flex;
      gap: var(--space-2);
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
      transition: all var(--transition-fast);

      &.edit {
        background-color: #DBEAFE;
        color: #2563EB;

        &:hover {
          background-color: #BFDBFE;
        }
      }

      &.delete {
        background-color: #FEE2E2;
        color: #DC2626;

        &:hover {
          background-color: #FECACA;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: var(--space-8);
      color: var(--ink-light);
      background: white;
      border-radius: var(--radius-xl);
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-5);
      border-bottom: 1px solid #E0D5C8;

      h2 {
        font-size: var(--text-lg);
        color: var(--ink);
      }

      .close-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        font-size: 24px;
        color: var(--ink-light);
        cursor: pointer;

        &:hover {
          color: var(--ink);
        }
      }
    }

    .modal-body {
      padding: var(--space-5);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-5);
      border-top: 1px solid #E0D5C8;
    }

    .form-group {
      margin-bottom: var(--space-4);

      label {
        display: block;
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--ink);
        margin-bottom: var(--space-2);
      }
    }

    .input {
      width: 100%;
      padding: var(--space-3);
      font-size: var(--text-sm);
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);

      &:focus {
        outline: none;
        border-color: var(--brand);
      }

      &.textarea {
        resize: vertical;
      }
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;

      input {
        accent-color: var(--brand);
      }
    }

    .btn-secondary {
      padding: var(--space-3) var(--space-5);
      background: white;
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background: var(--surface);
      }
    }
  `],
})
export class AdminCategoriesComponent implements OnInit {
  private api = inject(ApiService);

  categories = signal<Category[]>([]);
  showModal = signal(false);
  editingCategory = signal<Category | null>(null);

  formData = {
    name: '',
    slug: '',
    description: '',
    is_active: true,
  };

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.api.get<Category[]>('/admin/categories').subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {
        this.categories.set([
          { id: 1, name: 'Tortas Clásicas', slug: 'tortas-clasicas', is_active: true, sort_order: 1 },
          { id: 2, name: 'Tortas Personalizadas', slug: 'tortas-personalizadas', is_active: true, sort_order: 2 },
          { id: 3, name: 'Boxes y Combos', slug: 'boxes-combos', is_active: true, sort_order: 3 },
          { id: 4, name: 'Cupcakes', slug: 'cupcakes', is_active: true, sort_order: 4 },
        ]);
      },
    });
  }

  openModal() {
    this.editingCategory.set(null);
    this.formData = { name: '', slug: '', description: '', is_active: true };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCategory.set(null);
  }

  editCategory(category: Category) {
    this.editingCategory.set(category);
    this.formData = {
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      is_active: category.is_active,
    };
    this.showModal.set(true);
  }

  saveCategory() {
    if (!this.formData.name) return;

    const editing = this.editingCategory();
    const request = editing
      ? this.api.put(`/admin/categories/${editing.id}`, this.formData)
      : this.api.post('/admin/categories', this.formData);

    request.subscribe({
      next: () => {
        this.loadCategories();
        this.closeModal();
      },
      error: () => {
        // Mock: just update locally
        if (editing) {
          this.categories.update(list =>
            list.map(c => c.id === editing.id ? { ...c, ...this.formData } : c)
          );
        } else {
          this.categories.update(list => [
            ...list,
            { id: Date.now(), ...this.formData, sort_order: list.length + 1 } as Category,
          ]);
        }
        this.closeModal();
      },
    });
  }

  deleteCategory(category: Category) {
    if (confirm(`¿Eliminar la categoría "${category.name}"?`)) {
      this.api.delete(`/admin/categories/${category.id}`).subscribe({
        next: () => this.loadCategories(),
        error: () => {
          this.categories.update(list => list.filter(c => c.id !== category.id));
        },
      });
    }
  }
}
