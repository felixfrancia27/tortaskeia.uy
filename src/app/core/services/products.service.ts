import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { resolveImageUrl } from '@app/core/utils/image-url';

export interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  is_main: boolean;
}

export interface ProductSize {
  name: string;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  stock: number;
  is_featured: boolean;
  images: ProductImage[];
  main_image?: string;
  category_id?: number;
  meta_title?: string;
  meta_description?: string;
  /** Si es true, el producto tiene precios por tamaño (tortas). */
  has_sizes?: boolean;
  /** Tamaños con precio cuando has_sizes es true. */
  sizes?: ProductSize[];
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProductFilters {
  page?: number;
  page_size?: number;
  category_slug?: string;
  search?: string;
  featured?: boolean;
  sort_by?: 'sort_order' | 'price' | 'name' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private api = inject(ApiService);

  /** Normaliza producto: resuelve URLs de imágenes al dominio del API y asegura main_image. */
  private normalizeProduct(p: Product): Product {
    const images = (p.images || []).map((img) => ({
      ...img,
      url: resolveImageUrl(img.url),
    }));
    const mainImage = p.main_image
      ? resolveImageUrl(p.main_image)
      : images.length > 0
        ? images[0].url
        : undefined;
    return { ...p, images, main_image: mainImage };
  }

  getProducts(filters: ProductFilters = {}): Observable<ProductListResponse> {
    return this.api
      .get<ProductListResponse>('/products', filters as Record<string, string | number | boolean>)
      .pipe(
        map((res) => ({
          ...res,
          items: res.items.map((p) => this.normalizeProduct(p)),
        }))
      );
  }

  getFeaturedProducts(limit: number = 6): Observable<Product[]> {
    return this.api
      .get<Product[]>('/products/featured', { limit })
      .pipe(map((list) => list.map((p) => this.normalizeProduct(p))));
  }

  getProduct(slug: string): Observable<Product> {
    return this.api
      .get<Product>(`/products/${slug}`)
      .pipe(map((p) => this.normalizeProduct(p)));
  }
}
