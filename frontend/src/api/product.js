import { apiFetch } from '../lib/api';
export async function fetchProducts() {
  return apiFetch('/api/products');
}
