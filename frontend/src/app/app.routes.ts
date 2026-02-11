import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Tortaskeia | Repostería Artesanal Uruguay',
  },
  {
    path: 'tienda',
    loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent),
    title: 'Tienda | Tortaskeia',
  },
  {
    path: 'tortas/:slug',
    loadComponent: () => import('./pages/product/product.component').then(m => m.ProductComponent),
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent),
    title: 'Carrito | Tortaskeia',
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'Checkout | Tortaskeia',
  },
  {
    path: 'checkout/success',
    loadComponent: () => import('./pages/checkout/success/success.component').then(m => m.SuccessComponent),
    title: 'Pedido Confirmado | Tortaskeia',
  },
  {
    path: 'checkout/failure',
    loadComponent: () => import('./pages/checkout/failure/failure.component').then(m => m.PaymentFailureComponent),
    title: 'Pago Fallido | Tortaskeia',
  },
  {
    path: 'checkout/pending',
    loadComponent: () => import('./pages/checkout/pending/pending.component').then(m => m.PaymentPendingComponent),
    title: 'Pago Pendiente | Tortaskeia',
  },
  {
    path: 'keia',
    loadComponent: () => import('./pages/keia/keia.component').then(m => m.KeiaComponent),
    title: 'Keia | Tortaskeia',
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contacto | Tortaskeia',
  },
  {
    path: 'trabajos',
    loadComponent: () => import('./pages/trabajos/trabajos.component').then(m => m.TrabajosComponent),
    title: 'Nuestros Trabajos | Tortaskeia',
  },
  {
    path: 'agenda',
    loadComponent: () => import('./pages/agenda/agenda.component').then(m => m.AgendaComponent),
    title: 'Crea tu Torta | Tortaskeia',
  },
  // Auth Routes
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Iniciar Sesión | Tortaskeia',
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Registro | Tortaskeia',
  },
  {
    path: 'recuperar-password',
    loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Recuperar Contraseña | Tortaskeia',
  },
  // Account Routes
  {
    path: 'mis-pedidos',
    loadComponent: () => import('./pages/account/orders/orders.component').then(m => m.MyOrdersComponent),
    canActivate: [authGuard],
    title: 'Mis Pedidos | Tortaskeia',
  },
  // Admin Routes
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Admin | Tortaskeia',
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/admin/products/products.component').then(m => m.AdminProductsComponent),
        title: 'Productos | Admin',
      },
      {
        path: 'productos/nuevo',
        loadComponent: () => import('./pages/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent),
        title: 'Nuevo Producto | Admin',
      },
      {
        path: 'productos/:id',
        loadComponent: () => import('./pages/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent),
        title: 'Editar Producto | Admin',
      },
      {
        path: 'categorias',
        loadComponent: () => import('./pages/admin/categories/categories.component').then(m => m.AdminCategoriesComponent),
        title: 'Categorías | Admin',
      },
      {
        path: 'ordenes',
        loadComponent: () => import('./pages/admin/orders/orders.component').then(m => m.AdminOrdersComponent),
        title: 'Órdenes | Admin',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
