import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const CourierSummery = ({ phone }) => {
  const [courierData, setCourierData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleFetch = async () => {
    if (!phone) {
      setError('No phone number provided.');
      return;
    }

    setLoading(true);
    setError('');
    setCourierData(null);

    try {
      const response = await axios.post(`${apiUrl}/courier-check`, { phone });

      if (response.data.status === 'success') {
        setCourierData(response.data.courierData);
      } else {
        setError('No data found.');
      }
    } catch (err) {
      setError('Error fetching data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {!courierData && !loading && (
        <Button onClick={handleFetch} size="sm">
          Check Courier
        </Button>
      )}

      {loading && (
        <div className="mt-1">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && <p className="text-destructive text-xs mt-1">{error}</p>}

      {courierData && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 w-44 text-xs mt-2">
          <p>Total: {courierData.summary.total_parcel}</p>
          <p>Success: {courierData.summary.success_parcel}</p>
          <p>Cancelled: {courierData.summary.cancelled_parcel}</p>
          <p>Ratio: {courierData.summary.success_ratio}%</p>
        </div>
      )}
    </div>
  );
};

export default CourierSummery;
