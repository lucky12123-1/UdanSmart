import { useState } from 'react';
import toast from 'react-hot-toast';
import { predictPrices } from '../services/api';
import { formatApiError } from '../utils/apiError';

export function usePrediction() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFlights, setHasFlights] = useState(true);

  async function predict(payload) {
    setLoading(true);
    setError(null);
    try {
      const result = await predictPrices(payload);
      setData(result);
      setHasFlights(result.has_flights !== false);
      if (result.data_freshness === 'simulated') {
        toast('Live fares were not available. Showing India-calibrated predicted prices instead.');
      }
      return result;
    } catch (err) {
      const message = formatApiError(err);
      setError(message);
      setData(null);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { predict, data, loading, error, hasFlights };
}
