import { useEffect, useState } from 'react';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'intransit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'returned', label: 'Returned' },
  { value: 'cancelled', label: 'Cancelled' },
];

const OrderStatusSelector = ({ orderId, refetchOrders }) => {
  const { token } = useAuthAdminStore();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState('pending');

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderStatus = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setOrderStatus(data?.order?.orderStatus || 'pending');
        } else {
          toast.error(data.message || 'Failed to load order status');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching order status.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
  }, [orderId, apiUrl, token]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Order status updated successfully!');
        if (refetchOrders) refetchOrders();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while updating status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-10 w-[180px]" />;
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={orderStatus} onValueChange={setOrderStatus}>
        <SelectTrigger className="min-w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleSubmit} disabled={submitting} size="sm">
        {submitting ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
};

export default OrderStatusSelector;
