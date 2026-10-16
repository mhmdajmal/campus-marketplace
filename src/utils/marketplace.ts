import type { Category, Listing, ListingDraft } from '../types';

export type ListingSort = 'Recent' | 'Low price' | 'High price';
export type ListingFilters = {
  search: string;
  category: Category | 'All';
  minPrice: string;
  maxPrice: string;
  sort: ListingSort;
};

/** Strictly parse a non-negative LKR price. Return null for invalid input. */
export function parsePrice(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100_000_000 ? parsed : null;
}

/**
 * Validate form input before sending photos or documents to Firebase.
 * This is a UX check; server-side Firestore rules still enforce authorization.
 */
export function validateListing(draft: ListingDraft): string | null {
  const title = draft.title.trim();
  const description = draft.description.trim();
  const location = draft.location.trim();
  if (title.length < 4 || title.length > 90) return 'Title must contain 4 to 90 characters.';
  if (description.length < 10 || description.length > 1500) return 'Description must contain 10 to 1500 characters.';
  if (!Number.isFinite(draft.price) || draft.price < 0 || draft.price > 100_000_000) return 'Enter a valid item price (Rs. 0 to 100,000,000).';
  if (location.length < 2 || location.length > 70) return 'Campus pickup location must contain 2 to 70 characters.';
  if (!['Electronics', 'Books', 'Furniture', 'Stationery', 'Fashion', 'Other'].includes(draft.category)) return 'Choose a valid category.';
  if (!['New', 'Like new', 'Used'].includes(draft.condition)) return 'Choose a valid condition.';
  if (draft.imageUrl.length > 2048 || (draft.imageUrl.length > 0 && !/^https:\/\//i.test(draft.imageUrl))) return 'Use an HTTPS image URL (or leave it empty).';
  return null;
}

export function filterListings(items: Listing[], filters: ListingFilters): Listing[] {
  const min = filters.minPrice.trim() === '' ? null : parsePrice(filters.minPrice);
  const max = filters.maxPrice.trim() === '' ? null : parsePrice(filters.maxPrice);
  if ((filters.minPrice.trim() !== '' && min === null) ||
      (filters.maxPrice.trim() !== '' && max === null) ||
      (min !== null && max !== null && min > max)) return [];
  const search = filters.search.trim().toLowerCase();
  return items.filter(item =>
    item.status === 'active' &&
    (filters.category === 'All' || item.category === filters.category) &&
    (min === null || item.price >= min) &&
    (max === null || item.price <= max) &&
    (item.title + ' ' + item.description + ' ' + item.location).toLowerCase().includes(search)
  ).sort((a, b) => filters.sort === 'Low price' ? a.price - b.price :
                      filters.sort === 'High price' ? b.price - a.price :
                      b.createdAt - a.createdAt);
}
