import { environment } from '@env/environment';

/**
 * Convierte URL relativa (/uploads/...) a URL absoluta del backend
 * para que las imágenes carguen en la tienda, carrito y checkout.
 */
export function resolveImageUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const apiBase = environment.apiUrl.replace(/\/api\/?$/, '');
  return url.startsWith('/') ? apiBase + url : apiBase + '/' + url;
}
