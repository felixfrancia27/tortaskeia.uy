import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  is_main: boolean;
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

  getProducts(filters: ProductFilters = {}): Observable<ProductListResponse> {
    return this.api.get<ProductListResponse>('/products', filters as Record<string, string | number | boolean>);
  }

  getFeaturedProducts(limit: number = 6): Observable<Product[]> {
    return this.api.get<Product[]>('/products/featured', { limit });
  }

  getProduct(slug: string): Observable<Product> {
    return this.api.get<Product>(`/products/${slug}`);
  }
}
