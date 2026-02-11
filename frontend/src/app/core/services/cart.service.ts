import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface CartItem {
  id: number;
  product_id: number | null;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    main_image?: string;
  };
  quantity: number;
  notes?: string;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
  item_count: number;
}

/** Respuesta del backend (coincide con Cart) */
interface CartApiResponse {
  id: number;
  items: CartItem[];
  total: number;
  item_count: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private api = inject(ApiService);

  private cartState = signal<Cart>({
    id: 0,
    items: [],
    total: 0,
    item_count: 0,
  });

  readonly cart = this.cartState.asReadonly();
  readonly items = computed(() => this.cartState().items);
  readonly total = computed(() => this.cartState().total);
  readonly itemCount = computed(() => this.cartState().item_count);
  readonly isEmpty = computed(() => this.cartState().items.length === 0);

  private sessionId: string | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initSession();
      this.fetchCartFromApi();
    }
  }

  private initSession() {
    this.sessionId = localStorage.getItem('cart_session_id');
    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
      localStorage.setItem('cart_session_id', this.sessionId);
    }
  }

  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /** Carga el carrito desde el backend (usa X-Session-ID del interceptor) */
  fetchCartFromApi(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.api
      .get<CartApiResponse>('/cart')
      .pipe(
        tap((res) => this.cartState.set(this.normalizeCart(res))),
        catchError(() => of(null))
      )
      .subscribe();
  }

  private normalizeCart(res: CartApiResponse): Cart {
    return {
      id: res.id,
      items: res.items || [],
      total: res.total ?? 0,
      item_count: res.item_count ?? 0,
    };
  }

  /**
   * Agrega un producto del catálogo al carrito.
   */
  addItem(product: CartItem['product'], quantity: number = 1, notes?: string): Observable<CartApiResponse | null> {
    const body = { product_id: product.id, quantity, notes: notes || null };
    return this.api.post<CartApiResponse>('/cart/items', body).pipe(
      tap((res) => this.cartState.set(this.normalizeCart(res))),
      map((res) => res),
      catchError(() => {
        this.fetchCartFromApi();
        return of(null);
      })
    );
  }

  /**
   * Agrega una torta personalizada al carrito (creada desde Crea tu torta: diseño + atributos).
   * El producto se crea en el backend con nombre, precio e imagen según la configuración elegida.
   */
  addCustomItem(params: {
    name: string;
    price: number;
    quantity?: number;
    imageUrl?: string;
    notes?: string;
  }): Observable<CartApiResponse | null> {
    const body = {
      name: params.name,
      price: params.price,
      quantity: params.quantity ?? 1,
      image_url: params.imageUrl ?? null,
      notes: params.notes ?? null,
    };
    return this.api.post<CartApiResponse>('/cart/items/custom', body).pipe(
      tap((res) => this.cartState.set(this.normalizeCart(res))),
      map((res) => res),
      catchError(() => {
        this.fetchCartFromApi();
        return of(null);
      })
    );
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }
    this.api
      .put<CartApiResponse>(`/cart/items/${itemId}`, { quantity })
      .pipe(tap((res) => this.cartState.set(this.normalizeCart(res))))
      .subscribe({
        error: () => this.fetchCartFromApi(),
      });
  }

  removeItem(itemId: number): void {
    this.api
      .delete<CartApiResponse>(`/cart/items/${itemId}`)
      .pipe(tap((res) => this.cartState.set(this.normalizeCart(res))))
      .subscribe({
        error: () => this.fetchCartFromApi(),
      });
  }

  clearCart(): void {
    this.cartState.set({ id: 0, items: [], total: 0, item_count: 0 });
    this.api
      .delete<CartApiResponse>('/cart')
      .pipe(
        tap((res) => res && this.cartState.set(this.normalizeCart(res))),
        catchError(() => of(null))
      )
      .subscribe();
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}
