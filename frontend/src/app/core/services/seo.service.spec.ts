import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        Title,
        Meta,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updateMeta', () => {
    it('should update page title', () => {
      const spy = spyOn(titleService, 'setTitle');
      service.updateMeta({ title: 'Test Page' });
      expect(spy).toHaveBeenCalledWith('Test Page | Tortaskeia');
    });

    it('should use default title when not provided', () => {
      const spy = spyOn(titleService, 'setTitle');
      service.updateMeta({});
      expect(spy).toHaveBeenCalledWith('Tortaskeia | Repostería Artesanal Uruguay');
    });

    it('should update meta description', () => {
      const spy = spyOn(metaService, 'updateTag');
      service.updateMeta({ description: 'Test description' });
      expect(spy).toHaveBeenCalledWith({ name: 'description', content: 'Test description' });
    });

    it('should update OpenGraph tags', () => {
      const spy = spyOn(metaService, 'updateTag');
      service.updateMeta({
        title: 'OG Test',
        description: 'OG Description',
        image: 'https://example.com/image.jpg',
        url: 'https://example.com/page',
      });
      
      expect(spy).toHaveBeenCalledWith({ property: 'og:title', content: 'OG Test | Tortaskeia' });
      expect(spy).toHaveBeenCalledWith({ property: 'og:description', content: 'OG Description' });
      expect(spy).toHaveBeenCalledWith({ property: 'og:image', content: 'https://example.com/image.jpg' });
      expect(spy).toHaveBeenCalledWith({ property: 'og:url', content: 'https://example.com/page' });
    });

    it('should update Twitter card tags', () => {
      const spy = spyOn(metaService, 'updateTag');
      service.updateMeta({
        title: 'Twitter Test',
        description: 'Twitter Description',
      });
      
      expect(spy).toHaveBeenCalledWith({ name: 'twitter:card', content: 'summary_large_image' });
      expect(spy).toHaveBeenCalledWith({ name: 'twitter:title', content: 'Twitter Test | Tortaskeia' });
    });

    it('should update product meta tags for product type', () => {
      const spy = spyOn(metaService, 'updateTag');
      service.updateMeta({
        type: 'product',
        price: 1500,
        currency: 'UYU',
        availability: 'InStock',
        brand: 'Tortaskeia',
      });
      
      expect(spy).toHaveBeenCalledWith({ property: 'product:price:amount', content: '1500' });
      expect(spy).toHaveBeenCalledWith({ property: 'product:price:currency', content: 'UYU' });
      expect(spy).toHaveBeenCalledWith({ property: 'product:brand', content: 'Tortaskeia' });
    });
  });

  describe('JSON-LD schemas', () => {
    let document: Document;

    beforeEach(() => {
      document = TestBed.inject(DOCUMENT);
      // Clean up any existing scripts
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(s => s.remove());
    });

    it('should add organization schema', () => {
      service.addOrganizationSchema();
      const script = document.getElementById('organization-schema');
      expect(script).toBeTruthy();
      expect(script?.getAttribute('type')).toBe('application/ld+json');
      
      const data = JSON.parse(script?.textContent || '{}');
      expect(data['@type']).toBe('Organization');
      expect(data.name).toBe('Tortaskeia');
    });

    it('should add local business schema', () => {
      service.addLocalBusinessSchema();
      const script = document.getElementById('localbusiness-schema');
      expect(script).toBeTruthy();
      
      const data = JSON.parse(script?.textContent || '{}');
      expect(data['@type']).toBe('Bakery');
    });

    it('should add product schema', () => {
      service.addProductSchema({
        name: 'Test Torta',
        description: 'Delicious test torta',
        image: 'https://example.com/torta.jpg',
        price: 1200,
        currency: 'UYU',
        availability: 'InStock',
      });
      
      const script = document.getElementById('product-schema');
      expect(script).toBeTruthy();
      
      const data = JSON.parse(script?.textContent || '{}');
      expect(data['@type']).toBe('Product');
      expect(data.name).toBe('Test Torta');
      expect(data.offers.price).toBe(1200);
    });

    it('should add breadcrumb schema', () => {
      service.addBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/tienda' },
        { name: 'Torta', url: '/tortas/test' },
      ]);
      
      const script = document.getElementById('breadcrumb-schema');
      expect(script).toBeTruthy();
      
      const data = JSON.parse(script?.textContent || '{}');
      expect(data['@type']).toBe('BreadcrumbList');
      expect(data.itemListElement.length).toBe(3);
    });

    it('should add FAQ schema', () => {
      service.addFAQSchema([
        { question: 'Question 1?', answer: 'Answer 1' },
        { question: 'Question 2?', answer: 'Answer 2' },
      ]);
      
      const script = document.getElementById('faq-schema');
      expect(script).toBeTruthy();
      
      const data = JSON.parse(script?.textContent || '{}');
      expect(data['@type']).toBe('FAQPage');
      expect(data.mainEntity.length).toBe(2);
    });

    it('should remove JSON-LD by id', () => {
      service.addOrganizationSchema();
      expect(document.getElementById('organization-schema')).toBeTruthy();
      
      service.removeJsonLd('organization-schema');
      expect(document.getElementById('organization-schema')).toBeFalsy();
    });

    it('should replace existing schema with same id', () => {
      service.addProductSchema({
        name: 'First Product',
        description: 'First',
        image: 'https://example.com/first.jpg',
        price: 100,
      });
      
      service.addProductSchema({
        name: 'Second Product',
        description: 'Second',
        image: 'https://example.com/second.jpg',
        price: 200,
      });
      
      const scripts = document.querySelectorAll('#product-schema');
      expect(scripts.length).toBe(1);
      
      const data = JSON.parse(scripts[0].textContent || '{}');
      expect(data.name).toBe('Second Product');
    });
  });

  describe('resetToDefaults', () => {
    it('should reset meta tags to default values', () => {
      const titleSpy = spyOn(titleService, 'setTitle');
      service.resetToDefaults();
      expect(titleSpy).toHaveBeenCalled();
    });
  });
});
