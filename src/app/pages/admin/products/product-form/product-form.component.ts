import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminLayoutComponent } from '../../admin-layout/admin-layout.component';
import { ApiService } from '@app/core/services/api.service';

interface Category {
  id: number;
  name: string;
  slug: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="product-form-page">
        <header class="page-header">
          <a routerLink="/admin/productos" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
            Volver a Productos
          </a>
          <h1>{{ isEdit() ? 'Editar Producto' : 'Nuevo Producto' }}</h1>
        </header>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="product-form">
          <div class="form-grid">
            <!-- Main Info -->
            <div class="form-section main">
              <div class="form-group">
                <label for="name">Nombre del producto *</label>
                <input 
                  type="text" 
                  id="name" 
                  formControlName="name"
                  class="input"
                  placeholder="Ej: Torta de Chocolate"
                />
              </div>

              <div class="form-group">
                <label for="slug">URL (slug)</label>
                <input 
                  type="text" 
                  id="slug" 
                  formControlName="slug"
                  class="input"
                  placeholder="torta-chocolate"
                />
                <small>Se genera automáticamente si se deja vacío</small>
              </div>

              <div class="form-group">
                <label for="short_description">Descripción corta</label>
                <input 
                  type="text" 
                  id="short_description" 
                  formControlName="short_description"
                  class="input"
                  placeholder="Breve descripción para listados"
                />
              </div>

              <div class="form-group">
                <label for="description">Descripción completa</label>
                <textarea 
                  id="description" 
                  formControlName="description"
                  class="input textarea"
                  rows="5"
                  placeholder="Descripción detallada del producto"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="price">Precio (UYU) *</label>
                  <input 
                    type="number" 
                    id="price" 
                    formControlName="price"
                    class="input"
                    placeholder="1200"
                    min="0"
                  />
                </div>

                <div class="form-group">
                  <label for="compare_price">Precio anterior</label>
                  <input 
                    type="number" 
                    id="compare_price" 
                    formControlName="compare_price"
                    class="input"
                    placeholder="1500"
                    min="0"
                  />
                  <small>Para mostrar descuento</small>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="stock">Stock *</label>
                  <input 
                    type="number" 
                    id="stock" 
                    formControlName="stock"
                    class="input"
                    placeholder="10"
                    min="0"
                  />
                </div>

                <div class="form-group">
                  <label for="sku">SKU</label>
                  <input 
                    type="text" 
                    id="sku" 
                    formControlName="sku"
                    class="input"
                    placeholder="TORTA-001"
                  />
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="form-section sidebar">
              <div class="sidebar-card">
                <h3>Publicación</h3>
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="is_active" />
                    <span>Producto activo</span>
                  </label>
                </div>
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="is_featured" />
                    <span>Destacado en home</span>
                  </label>
                </div>
              </div>

              <div class="sidebar-card">
                <h3>Categoría</h3>
                <div class="form-group">
                  <select formControlName="category_id" class="input">
                    <option [ngValue]="null">Sin categoría</option>
                    @for (cat of categories(); track cat.id) {
                      <option [ngValue]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="sidebar-card">
                <h3>Imagen principal</h3>
                <div class="form-group">
                  <input 
                    type="text" 
                    formControlName="main_image"
                    class="input"
                    placeholder="URL de la imagen"
                  />
                  @if (form.get('main_image')?.value) {
                    <div class="image-preview">
                      <img [src]="form.get('main_image')?.value" alt="Preview" />
                    </div>
                  }
                </div>
              </div>

              <div class="sidebar-card">
                <h3>SEO</h3>
                <div class="form-group">
                  <label for="meta_title">Meta título</label>
                  <input 
                    type="text" 
                    id="meta_title" 
                    formControlName="meta_title"
                    class="input"
                    placeholder="Título para buscadores"
                  />
                </div>
                <div class="form-group">
                  <label for="meta_description">Meta descripción</label>
                  <textarea 
                    id="meta_description" 
                    formControlName="meta_description"
                    class="input textarea"
                    rows="3"
                    placeholder="Descripción para buscadores"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/admin/productos" class="btn-secondary">Cancelar</a>
            <button type="submit" class="btn-primary" [disabled]="saving() || form.invalid">
              @if (saving()) {
                Guardando...
              } @else {
                {{ isEdit() ? 'Guardar Cambios' : 'Crear Producto' }}
              }
            </button>
          </div>
        </form>
      </div>
    </app-admin-layout>
  `,
  styles: [`
    .product-form-page {
      max-width: 1200px;
    }

    .page-header {
      margin-bottom: var(--space-6);

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--ink-light);
        font-size: var(--text-sm);
        margin-bottom: var(--space-3);

        &:hover {
          color: var(--brand);
        }
      }

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        color: var(--ink);
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);

      @media (min-width: 1024px) {
        grid-template-columns: 2fr 1fr;
      }
    }

    .form-section.main {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
    }

    .form-section.sidebar {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .sidebar-card {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      box-shadow: var(--shadow-sm);

      h3 {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--ink);
        margin-bottom: var(--space-4);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .form-group {
      margin-bottom: var(--space-4);

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--ink);
        margin-bottom: var(--space-2);
      }

      small {
        display: block;
        font-size: var(--text-xs);
        color: var(--ink-muted);
        margin-top: var(--space-1);
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-4);
    }

    @media (min-width: 480px) {
      .form-row {
        grid-template-columns: 1fr 1fr;
      }
    }

    .input {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      font-size: 16px;
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);
      background-color: white;

      &:focus {
        outline: none;
        border-color: var(--brand);
        box-shadow: 0 0 0 3px rgba(247, 87, 12, 0.1);
      }

      &.textarea {
        resize: vertical;
        min-height: 100px;
      }

      @media (max-width: 768px) {
        min-height: 44px;
        font-size: 16px;
      }
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      cursor: pointer;

      input[type="checkbox"] {
        accent-color: var(--brand);
      }
    }

    .image-preview {
      margin-top: var(--space-3);
      border-radius: var(--radius-md);
      overflow: hidden;

      img {
        width: 100%;
        max-height: 200px;
        object-fit: cover;
      }
    }

    .form-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--space-3);
      margin-top: var(--space-6);
      padding-top: var(--space-6);
      border-top: 1px solid #E0D5C8;
    }

    @media (max-width: 768px) {
      .form-actions {
        flex-direction: column;
      }
      .form-actions .btn-primary,
      .form-actions .btn-secondary {
        width: 100%;
        justify-content: center;
        min-height: 44px;
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
      background-color: white;
      color: var(--ink);
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);
      font-weight: 600;
      text-decoration: none;

      &:hover {
        background-color: var(--surface);
        color: var(--ink);
      }
    }
  `],
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    slug: [''],
    short_description: [''],
    description: [''],
    price: [null, [Validators.required, Validators.min(0)]],
    compare_price: [null],
    stock: [0, [Validators.required, Validators.min(0)]],
    sku: [''],
    is_active: [true],
    is_featured: [false],
    category_id: [null],
    main_image: [''],
    meta_title: [''],
    meta_description: [''],
  });

  categories = signal<Category[]>([]);
  isEdit = signal(false);
  saving = signal(false);
  productId: number | null = null;

  ngOnInit() {
    this.loadCategories();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.productId = +params['id'];
        this.isEdit.set(true);
        this.loadProduct(this.productId);
      }
    });
  }

  loadCategories() {
    this.api.get<Category[]>('/categories').subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {
        this.categories.set([
          { id: 1, name: 'Tortas Clásicas', slug: 'tortas-clasicas' },
          { id: 2, name: 'Tortas Personalizadas', slug: 'tortas-personalizadas' },
          { id: 3, name: 'Boxes y Combos', slug: 'boxes-combos' },
          { id: 4, name: 'Cupcakes', slug: 'cupcakes' },
        ]);
      },
    });
  }

  loadProduct(id: number) {
    this.api.get<any>(`/admin/products/${id}`).subscribe({
      next: (product) => {
        this.form.patchValue({
          ...product,
          main_image: product.main_image || product.images?.[0]?.url || '',
        });
      },
      error: () => {
        alert('Error al cargar el producto');
        this.router.navigate(['/admin/productos']);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const data = this.form.value;

    // Convert main_image to images array
    if (data.main_image) {
      data.images = [data.main_image];
    }
    delete data.main_image;

    const request = this.isEdit()
      ? this.api.put(`/admin/products/${this.productId}`, data)
      : this.api.post('/admin/products', data);

    request.subscribe({
      next: () => {
        this.router.navigate(['/admin/productos']);
      },
      error: (err) => {
        this.saving.set(false);
        alert(err.error?.detail || 'Error al guardar el producto');
      },
    });
  }
}
