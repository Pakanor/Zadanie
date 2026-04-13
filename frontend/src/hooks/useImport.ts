import { useState, useCallback } from 'react';
import { importApi } from '../api';

export function useImport() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runImport = useCallback(async (documents: File, items: File) => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const result = await importApi.importFiles(documents, items);
      setSuccess(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => { 
    setSuccess(null); 
    setError(null); 
  }, []);

  return { loading, success, error, runImport, reset };
}

