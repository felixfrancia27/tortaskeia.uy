import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { HeroComponent } from './sections/hero/hero.component';
import { PromoBannerComponent } from './sections/promo-banner/promo-banner.component';
import { HowToOrderComponent } from './sections/how-to-order/how-to-order.component';
import { TortasComponent } from './sections/tortas/tortas.component';
import { CreacionesComponent } from './sections/creaciones/creaciones.component';
import { EventosPersonalizadosComponent } from './sections/eventos-personalizados/eventos-personalizados.component';
import { FaqComponent } from './sections/faq/faq.component';
import { SeoService } from '@app/core/services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    PromoBannerComponent,
    HowToOrderComponent,
    TortasComponent,
    CreacionesComponent,
    EventosPersonalizadosComponent,
    FaqComponent,
  ],
  template: `
    <app-hero />
    <app-promo-banner />
    <app-how-to-order />
    <app-creaciones />
    <app-eventos-personalizados />
    <app-tortas />
    <app-faq />
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  private seo = inject(SeoService);

  ngOnInit() {
    // Update meta tags
    this.seo.updateMeta({
      title: undefined, // Uses default site title
      description: 'Repostería artesanal en Uruguay. Tortas personalizadas para cumpleaños, bodas y eventos especiales. Hacemos realidad la torta de tus sueños. Delivery en Montevideo.',
      keywords: 'tortas uruguay, repostería artesanal, tortas personalizadas, cupcakes montevideo, tortas cumpleaños, tortas bodas',
      url: 'https://tortaskeia.uy',
      type: 'website',
    });

    // Add structured data
    this.seo.addOrganizationSchema();
    this.seo.addLocalBusinessSchema();
    this.seo.addWebsiteSchema();
    
    // Add FAQ schema
    this.seo.addFAQSchema([
      {
        question: '¿Con cuánta anticipación debo hacer mi pedido?',
        answer: 'Recomendamos realizar el pedido con al menos 48 horas de anticipación. Para tortas muy elaboradas o en temporada alta, sugerimos 1 semana de anticipación.',
      },
      {
        question: '¿Hacen envíos a domicilio?',
        answer: 'Sí, realizamos delivery en Montevideo y alrededores. El costo varía según la zona. También ofrecemos retiro en nuestro local con cita previa.',
      },
      {
        question: '¿Puedo personalizar mi torta?',
        answer: '¡Por supuesto! Trabajamos con vos para crear la torta perfecta. Podés elegir sabores, rellenos, decoración y diseño personalizado.',
      },
      {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos Mercado Pago (tarjetas de crédito/débito, efectivo en redes de cobranza), transferencia bancaria y efectivo al momento de la entrega.',
      },
      {
        question: '¿Trabajan con ingredientes sin gluten o veganos?',
        answer: 'Sí, ofrecemos opciones sin gluten y veganas. Consultanos para conocer las alternativas disponibles según el producto.',
      },
    ]);
  }

  ngOnDestroy() {
    // Clean up JSON-LD when leaving the page
    this.seo.removeJsonLd('organization-schema');
    this.seo.removeJsonLd('localbusiness-schema');
    this.seo.removeJsonLd('website-schema');
    this.seo.removeJsonLd('faq-schema');
  }
}
