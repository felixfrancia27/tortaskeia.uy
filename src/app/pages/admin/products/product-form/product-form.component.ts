import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminLayoutComponent } from '../../admin-layout/admin-layout.component';
import { ApiService } from '@app/core/services/api.service';
import { environment } from '@env/environment';

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
                  <label for="price">Precio (UYU) {{ hasSizes() ? '' : '*' }}</label>
                  <input 
                    type="number" 
                    id="price" 
                    formControlName="price"
                    class="input"
                    placeholder="1200"
                    min="0"
                    [disabled]="hasSizes()"
                  />
                  @if (hasSizes()) {
                    <small>Se usa el precio por tamaño abajo</small>
                  }
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

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="has_sizes" (change)="onHasSizesChange()" />
                  <span>Tiene tamaños (precio según tamaño)</span>
                </label>
                <small>Para tortas: podés definir Chico, Mediano, Grande, etc. con precio por cada uno.</small>
              </div>

              @if (hasSizes()) {
                <div class="sizes-block">
                  <h4>Tamaños y precios</h4>
                  <div formArrayName="sizes" class="sizes-list">
                    @for (ctrl of sizesArray.controls; track $index; let i = $index) {
                      <div [formGroupName]="i" class="size-row">
                        <input 
                          type="text" 
                          formControlName="name"
                          class="input size-name"
                          placeholder="Ej: Chico, Mediano, Grande"
                        />
                        <input 
                          type="number" 
                          formControlName="price"
                          class="input size-price"
                          placeholder="Precio UYU"
                          min="0"
                        />
                        <button type="button" class="btn-remove-size" (click)="removeSize(i)" title="Quitar tamaño">×</button>
                      </div>
                    }
                  </div>
                  <button type="button" class="btn-add-size" (click)="addSize()">
                    + Agregar tamaño
                  </button>
                </div>
              }

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
                  <div class="upload-zone">
                    <input
                      #fileInput
                      type="file"
                      accept="image/*"
                      class="input-file"
                      (change)="onFileSelected($event)"
                    />
                    <button type="button" class="btn-upload" (click)="fileInput.click()" [disabled]="uploading()">
                      @if (uploading()) {
                        Subiendo...
                      } @else {
                        Subir imagen
                      }
                    </button>
                  </div>
                  <p class="upload-hint">o pegá una URL debajo</p>
                  <input 
                    type="text" 
                    formControlName="main_image"
                    class="input"
                    placeholder="https://... o /uploads/..."
                  />
                  @if (uploadError()) {
                    <p class="upload-error">{{ uploadError() }}</p>
                  }
                  @if (mainImagePreviewUrl()) {
                    <div class="image-preview">
                      <img [src]="mainImagePreviewUrl()" alt="Vista previa" />
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

    .sizes-block {
      margin-top: var(--space-4);
      padding: var(--space-4);
      background: var(--surface);
      border-radius: var(--radius-lg);

      h4 {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--ink);
        margin-bottom: var(--space-3);
      }
    }

    .sizes-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .size-row {
      display: grid;
      grid-template-columns: 1fr 120px 40px;
      gap: var(--space-2);
      align-items: center;
    }

    .size-name { min-width: 0; }
    .size-price { text-align: right; }

    .btn-remove-size {
      width: 40px;
      height: 44px;
      padding: 0;
      border: 1px solid #E0D5C8;
      background: white;
      color: var(--ink-muted);
      font-size: 1.25rem;
      line-height: 1;
      border-radius: var(--radius-md);
      cursor: pointer;
    }
    .btn-remove-size:hover {
      background: #FEE2E2;
      color: #991B1B;
      border-color: #FCA5A5;
    }

    .btn-add-size {
      padding: var(--space-2) var(--space-4);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--brand);
      background: rgba(247, 87, 12, 0.1);
      border: 1px dashed var(--brand);
      border-radius: var(--radius-md);
      cursor: pointer;
    }
    .btn-add-size:hover {
      background: rgba(247, 87, 12, 0.15);
    }

    .upload-zone {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }

    .input-file {
      position: absolute;
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      z-index: -1;
    }

    .btn-upload {
      padding: var(--space-2) var(--space-4);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--brand);
      background: rgba(247, 87, 12, 0.1);
      border: 1px solid var(--brand);
      border-radius: var(--radius-md);
      cursor: pointer;

      &:hover:not(:disabled) {
        background: rgba(247, 87, 12, 0.15);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .upload-hint {
      font-size: var(--text-xs);
      color: var(--ink-muted);
      margin-bottom: var(--space-2);
    }

    .upload-error {
      font-size: var(--text-sm);
      color: #DC2626;
      margin-top: var(--space-2);
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
    has_sizes: [false],
    sizes: this.fb.array<FormGroup>([]),
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
  uploading = signal(false);
  uploadError = signal<string | null>(null);
  productId: number | null = null;

  get sizesArray(): FormArray {
    return this.form.get('sizes') as FormArray;
  }

  hasSizes(): boolean {
    return !!this.form.get('has_sizes')?.value;
  }

  addSize(): void {
    this.sizesArray.push(this.fb.group({
      name: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
    }));
  }

  removeSize(index: number): void {
    this.sizesArray.removeAt(index);
  }

  onHasSizesChange(): void {
    if (this.hasSizes() && this.sizesArray.length === 0) {
      this.addSize();
    }
    if (!this.hasSizes()) {
      while (this.sizesArray.length) this.sizesArray.removeAt(0);
      this.form.get('price')?.enable();
      this.form.get('price')?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      this.form.get('price')?.disable();
      this.form.get('price')?.clearValidators();
    }
    this.form.get('price')?.updateValueAndValidity();
  }

  /** Resuelve la URL de la imagen para el preview: /uploads/ → API base; http → tal cual */
  mainImagePreviewUrl(): string {
    const url = this.form.get('main_image')?.value;
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const apiBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return url.startsWith('/') ? apiBase + url : apiBase + '/' + url;
  }

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
        const sizes = product.sizes && Array.isArray(product.sizes) ? product.sizes : [];
        while (this.sizesArray.length) this.sizesArray.removeAt(0);
        sizes.forEach((s: { name: string; price: number }) => {
          this.sizesArray.push(this.fb.group({
            name: [s.name ?? '', Validators.required],
            price: [s.price ?? null, [Validators.required, Validators.min(0)]],
          }));
        });
        this.form.patchValue({
          ...product,
          main_image: product.main_image || product.images?.[0]?.url || '',
          has_sizes: !!product.has_sizes,
          sizes: undefined,
        });
        if (product.has_sizes) {
          this.form.get('price')?.clearValidators();
          this.form.get('price')?.updateValueAndValidity();
        }
      },
      error: () => {
        alert('Error al cargar el producto');
        this.router.navigate(['/admin/productos']);
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      this.uploadError.set('Elegí un archivo de imagen (JPG, PNG, etc.).');
      return;
    }
    this.uploadError.set(null);
    this.uploading.set(true);
    this.api.uploadFile('/admin/upload', file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res?.url) {
          this.form.patchValue({ main_image: res.url });
        }
        input.value = '';
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadError.set(err.error?.detail || err.message || 'Error al subir la imagen.');
        input.value = '';
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const data = { ...this.form.value };

    // Convert main_image to images array
    if (data.main_image) {
      data.images = [data.main_image];
    }
    delete data.main_image;

    if (!data.has_sizes) {
      data.has_sizes = false;
      data.sizes = [];
    } else {
      data.sizes = (data.sizes || []).filter((s: { name: string; price: number }) => s?.name?.trim() && s?.price != null);
      if (data.sizes.length === 0) {
        this.saving.set(false);
        alert('Si el producto tiene tamaños, agregá al menos un tamaño con nombre y precio.');
        return;
      }
      // Precio base para listados (mínimo de los tamaños)
      data.price = Math.min(...data.sizes.map((s: { price: number }) => Number(s.price)));
    }

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
