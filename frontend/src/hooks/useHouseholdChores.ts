import { useState, useCallback } from 'react';
import axios from 'axios';

export function useHouseholdChores() {
  const [chores, setChores] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logChores = useCallback(async (value: number) => {
    setLoading(true);
    setError(null);

    if (value < 0 || value > 5) {
      setError('Household chores must be between 0-5');
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      // Używamy pełnego URL lub instancji API, tutaj axios bezpośrednio z poprawnym endpointem
      const response = await axios.post('/api/daily/chores', { 
        date: today,
        count: value 
      });

      if (response.data.status === 'success') {
        setChores(value);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to log chores');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log chores';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { chores, logChores, loading, error };
}
