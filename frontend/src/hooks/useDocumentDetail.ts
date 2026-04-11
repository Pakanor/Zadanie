import { useState, useCallback } from 'react';
import { documentsApi } from '../api';
import type { DocumentDetails } from '../types';

export function useDocumentDetail() {
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      setDocument(await documentsApi.getById(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading document');
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => { setDocument(null); setError(null); }, []);

  return { document, loading, error, fetch, clear };
}
