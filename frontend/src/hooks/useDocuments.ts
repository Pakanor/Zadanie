import { useState, useEffect, useCallback } from 'react';
import { documentsApi } from '../api';
import type { Document, DocumentFilter, PaginationResponse } from '../types';

export const DEFAULT_FILTER: DocumentFilter = {
  pageNumber: 1,
  pageSize: 20,
  type: undefined,
  firstName: undefined,
  lastName: undefined,
  city: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  sortBy: undefined,
  sortDescending: undefined
};

export function useDocuments() {

  const [data, setData] = useState<PaginationResponse<Document> | null>(null);
  const [filter, setFilter] = useState<DocumentFilter>(DEFAULT_FILTER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (f: DocumentFilter) => {
    setLoading(true);
    setError(null);
    try {
      
      const result = await documentsApi.getAll(f);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const updateFilter = useCallback((updates: Partial<DocumentFilter>) => {
    setFilter(prev => ({ ...prev, ...updates, pageNumber: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilter(prev => ({ ...prev, pageNumber: page }));
  }, []);

  const refresh = useCallback(() => load(filter), [filter, load]);

  return { data, filter, loading, error, updateFilter, setPage, refresh };
}
