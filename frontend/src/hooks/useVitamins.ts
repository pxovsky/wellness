import { useState, useCallback } from 'react';
import axios from 'axios';
import { ApiResponse, VitaminLogResponse } from '../types';

export function useVitamins() {
  const [vitamins, setVitamins] = useState<0 | 1>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logVitamins = useCallback(async (value: 0 | 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse<VitaminLogResponse>>(
        '/api/daily/vitamins',
        { vitamins: value }
      );

      if (response.data.status === 'success' && response.data.data) {
        setVitamins(response.data.data.vitamins);
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
