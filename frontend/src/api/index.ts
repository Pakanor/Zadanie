import type { Document, DocumentDetails, DocumentFilter, PaginationResponse } from '../types';

const BASE_URL = 'http://localhost:5172/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Błąd serwera' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

function buildQueryString(filter: DocumentFilter): string {
  const params = new URLSearchParams();

  if (filter.type) params.set('type', filter.type);
  if (filter.firstName) params.set('firstName', filter.firstName);
  if (filter.lastName) params.set('lastName', filter.lastName);
  if (filter.city) params.set('city', filter.city);
  if (filter.dateFrom) params.set('dateFrom', filter.dateFrom);
  if (filter.dateTo) params.set('dateTo', filter.dateTo);
  params.set('pageNumber', String(filter.pageNumber));
  params.set('pageSize', String(filter.pageSize));
  if (filter.sortBy) params.set('sortBy', filter.sortBy);
  if (filter.sortDescending) params.set('sortDescending', 'true');
  return params.toString();
}

export const documentsApi = {
  getAll: (filter: DocumentFilter): Promise<PaginationResponse<Document>> =>
    request(`/documents?${buildQueryString(filter)}`),
  getById: (id: number): Promise<DocumentDetails> =>
    request(`/documents/${id}`),
};

export const importApi = {
  importFiles: (documents: File, items: File): Promise<{ message: string; totalRecords: number; newRecords: number; duplicateRecords: number }> => {
    const formData = new FormData();
    formData.append('documents', documents);
    formData.append('items', items);

    return fetch(`${BASE_URL}/import/upload`, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Błąd serwera' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }
      return response.json();
    });
  },
};
