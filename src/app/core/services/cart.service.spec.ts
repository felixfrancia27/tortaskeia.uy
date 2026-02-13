import { TestBed } from '@angular/core/testing';
import { CartService, CartItem } from './cart.service';
import { PLATFORM_ID } from '@angular/core';

describe('CartService', () => {
  let service: CartService;

  const mockProduct = {
    id: 1,
    name: 'Test Torta',
    slug: 'test-torta',
    price: 1000,
    main_image: 'https://example.com/torta.jpg',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(CartService);
    
    // Clear cart before each test
    service.clearCart();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addItem', () => {
    it('should add a new item to cart', () => {
      service.addItem(mockProduct, 2);
      
      expect(service.items().length).toBe(1);
      expect(service.items()[0].product.name).toBe('Test Torta');
      expect(service.items()[0].quantity).toBe(2);
    });

    it('should increase quantity if item already exists', () => {
      service.addItem(mockProduct, 1);
      service.addItem(mockProduct, 2);
      
      expect(service.items().length).toBe(1);
      expect(service.items()[0].quantity).toBe(3);
    });

    it('should calculate correct subtotal', () => {
      service.addItem(mockProduct, 3);
      
      expect(service.items()[0].subtotal).toBe(3000);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      service.addItem(mockProduct, 1);
      const itemId = service.items()[0].id;
      
      service.updateQuantity(itemId, 5);
      
      expect(service.items()[0].quantity).toBe(5);
    });

    it('should remove item if quantity is 0', () => {
      service.addItem(mockProduct, 1);
      const itemId = service.items()[0].id;
      
      service.updateQuantity(itemId, 0);
      
      expect(service.items().length).toBe(0);
    });

    it('should cap quantity at 99', () => {
      service.addItem(mockProduct, 1);
      const itemId = service.items()[0].id;
      
      service.updateQuantity(itemId, 150);
      
      expect(service.items()[0].quantity).toBe(99);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      service.addItem(mockProduct, 1);
      const itemId = service.items()[0].id;
      
      service.removeItem(itemId);
      
      expect(service.items().length).toBe(0);
    });

    it('should not throw error for non-existent item', () => {
      expect(() => service.removeItem(999)).not.toThrow();
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      service.addItem(mockProduct, 2);
      service.addItem({ ...mockProduct, id: 2, name: 'Another Torta' }, 1);
      
      service.clearCart();
      
      expect(service.items().length).toBe(0);
    });
  });

  describe('computed values', () => {
    it('should calculate total correctly', () => {
      service.addItem(mockProduct, 2); // 2000
      service.addItem({ ...mockProduct, id: 2, price: 500 }, 3); // 1500
      
      expect(service.total()).toBe(3500);
    });

    it('should calculate itemCount correctly', () => {
      service.addItem(mockProduct, 2);
      service.addItem({ ...mockProduct, id: 2 }, 3);
      
      expect(service.itemCount()).toBe(5);
    });

    it('should return isEmpty true when cart is empty', () => {
      expect(service.isEmpty()).toBe(true);
    });

    it('should return isEmpty false when cart has items', () => {
      service.addItem(mockProduct, 1);
      expect(service.isEmpty()).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should generate session ID', () => {
      const sessionId = service.getSessionId();
      expect(sessionId).toBeTruthy();
      expect(sessionId.length).toBeGreaterThan(10);
    });

    it('should persist session ID across calls', () => {
      const id1 = service.getSessionId();
      const id2 = service.getSessionId();
      expect(id1).toBe(id2);
    });
  });
});
