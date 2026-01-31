import { useState, useCallback } from 'react';
import axios from 'axios';

export function useVitamins() {
  const [vitamins, setVitamins] = useState<0 | 1>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logVitamins = useCallback(async (value: 0 | 1) => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      // Poprawiony endpoint i payload zgodny z backendem
      const response = await axios.post('/api/daily/vitamins', { 
        date: today,
        taken: value 
      });

      if (response.data.status === 'success') {
        setVitamins(value);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to log vitamins');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log vitamins';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { vitamins, logVitamins, loading, error };
}
