import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  category?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ProductSchema {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: string;
  sku?: string;
  brand?: string;
  category?: string;
  url?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  private readonly siteName = 'Tortaskeia';
  private readonly siteUrl = 'https://tortaskeia.uy';
  private readonly defaultImage = 'https://tortaskeia.uy/assets/images/og-default.jpg';
  private readonly defaultDescription = 'Repostería artesanal en Uruguay. Tortas personalizadas, cupcakes y más. Hacemos realidad la torta de tus sueños.';

  /**
   * Update page meta tags for SEO
   */
  updateMeta(config: SeoConfig): void {
    const fullTitle = config.title 
      ? `${config.title} | ${this.siteName}` 
      : `${this.siteName} | Repostería Artesanal Uruguay`;
    
    const description = config.description || this.defaultDescription;
    const image = config.image || this.defaultImage;
    const url = config.url || this.siteUrl;
    const type = config.type || 'website';

    // Basic meta tags
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Canonical URL
    this.updateCanonical(url);

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type === 'product' ? 'product' : 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });
    this.meta.updateTag({ property: 'og:locale', content: 'es_UY' });

    // Twitter Cards
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    // Product specific meta tags
    if (type === 'product' && config.price) {
      this.meta.updateTag({ property: 'product:price:amount', content: String(config.price) });
      this.meta.updateTag({ property: 'product:price:currency', content: config.currency || 'UYU' });
      
      if (config.availability) {
        const ogAvailability = config.availability === 'InStock' ? 'instock' : 'oos';
        this.meta.updateTag({ property: 'product:availability', content: ogAvailability });
      }
      
      if (config.brand) {
        this.meta.updateTag({ property: 'product:brand', content: config.brand });
      }
      
      if (config.category) {
        this.meta.updateTag({ property: 'product:category', content: config.category });
      }
    }
  }

  /**
   * Update canonical URL
   */
  private updateCanonical(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      // On server, we can manipulate the document
      let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = this.document.createElement('link');
        link.setAttribute('rel', 'canonical');
        this.document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    } else {
      // On browser
      let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = this.document.createElement('link');
        link.setAttribute('rel', 'canonical');
        this.document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    }
  }

  /**
   * Add Organization JSON-LD schema
   */
  addOrganizationSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Tortaskeia',
      alternateName: 'Tortaskeia Uruguay',
      url: this.siteUrl,
      logo: `${this.siteUrl}/assets/images/logo.png`,
      description: this.defaultDescription,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Montevideo',
        addressCountry: 'UY',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+598-99-123-456',
        contactType: 'customer service',
        availableLanguage: 'Spanish',
      },
      sameAs: [
        'https://instagram.com/tortaskeia',
        'https://facebook.com/tortaskeia',
        'https://wa.me/59899123456',
      ],
    };

    this.addJsonLd(schema, 'organization-schema');
  }

  /**
   * Add LocalBusiness JSON-LD schema
   */
  addLocalBusinessSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Bakery',
      '@id': `${this.siteUrl}/#bakery`,
      name: 'Tortaskeia',
      image: `${this.siteUrl}/assets/images/storefront.jpg`,
      url: this.siteUrl,
      telephone: '+598-99-123-456',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Montevideo',
        addressRegion: 'Montevideo',
        addressCountry: 'UY',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -34.9011,
        longitude: -56.1645,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '19:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '09:00',
          closes: '14:00',
        },
      ],
      servesCuisine: 'Bakery',
      acceptsReservations: true,
    };

    this.addJsonLd(schema, 'localbusiness-schema');
  }

  /**
   * Add Product JSON-LD schema
   */
  addProductSchema(product: ProductSchema): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image,
      sku: product.sku || '',
      brand: {
        '@type': 'Brand',
        name: product.brand || 'Tortaskeia',
      },
      category: product.category || 'Tortas',
      offers: {
        '@type': 'Offer',
        url: product.url || this.siteUrl,
        priceCurrency: product.currency || 'UYU',
        price: product.price,
        availability: `https://schema.org/${product.availability || 'InStock'}`,
        seller: {
          '@type': 'Organization',
          name: 'Tortaskeia',
        },
      },
    };

    this.addJsonLd(schema, 'product-schema');
  }

  /**
   * Add Breadcrumb JSON-LD schema
   */
  addBreadcrumbSchema(items: BreadcrumbItem[]): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${this.siteUrl}${item.url}`,
      })),
    };

    this.addJsonLd(schema, 'breadcrumb-schema');
  }

  /**
   * Add FAQ JSON-LD schema
   */
  addFAQSchema(faqs: FAQItem[]): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    this.addJsonLd(schema, 'faq-schema');
  }

  /**
   * Add WebSite JSON-LD schema with search action
   */
  addWebsiteSchema(): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Tortaskeia',
      url: this.siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.siteUrl}/tienda?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };

    this.addJsonLd(schema, 'website-schema');
  }

  /**
   * Helper to add JSON-LD script to document
   */
  private addJsonLd(schema: object, id: string): void {
    // Remove existing script with same id
    this.removeJsonLd(id);

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  /**
   * Remove JSON-LD script by id
   */
  removeJsonLd(id: string): void {
    const existing = this.document.getElementById(id);
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Clear all JSON-LD schemas
   */
  clearAllJsonLd(): void {
    const scripts = this.document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => script.remove());
  }

  /**
   * Reset meta tags to defaults
   */
  resetToDefaults(): void {
    this.updateMeta({
      title: undefined,
      description: this.defaultDescription,
      image: this.defaultImage,
      url: this.siteUrl,
      type: 'website',
    });
  }
}
