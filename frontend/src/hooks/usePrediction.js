import { useState } from 'react';
import toast from 'react-hot-toast';
import { predictPrices } from '../services/api';

export function usePrediction() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFlights, setHasFlights] = useState(true);

  async function predict(payload) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await predictPrices(payload);
      setData(result);
      setHasFlights(result.has_flights !== false);
      if (result.data_freshness === 'simulated') {
        toast('Live fares were not available. Showing India-calibrated predicted prices instead.');
      }
      return result;
    } catch (err) {
      const message = err.response?.data?.detail?.[0]?.msg || 'Could not fetch prices. Showing predicted prices instead.';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { predict, data, loading, error, hasFlights };
}
