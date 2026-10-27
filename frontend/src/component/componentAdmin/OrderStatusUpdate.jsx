import { useEffect, useState } from 'react';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'intransit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'returned', label: 'Returned' },
  { value: 'cancelled', label: 'Cancelled' },
];

const OrderStatusUpdate = ({ orderId, onUpdate }) => {
  const { token } = useAuthAdminStore();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [specialDiscount, setSpecialDiscount] = useState(0);
  const [adminNote, setAdminNote] = useState('');
  const [orderStatus, setOrderStatus] = useState('pending');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.success) {
          const order = data.order;
          setAdvanceAmount(order.advanceAmount || 0);
          setSpecialDiscount(order.specialDiscount || 0);
          setAdminNote(order.adminNote || '');
          setOrderStatus(order.orderStatus || 'pending');
        } else {
          toast.error(data.message || 'Failed to load order');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching order details.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, apiUrl, token]);

  const handleSubmit = async () => {
    if (advanceAmount < 0 || specialDiscount < 0) {
      toast.error('Amounts cannot be negative.');
      return;
    }

    try {
      setSubmitting(true);

      const updatedData = {
        advanceAmount,
        specialDiscount,
        adminNote,
        orderStatus,
      };

      const res = await fetch(`${apiUrl}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Order updated successfully!');
        if (onUpdate) onUpdate(data.order);
      } else {
        toast.error(data.message || 'Failed to update order');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong while updating the order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Admin Note:</Label>
        <Textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Admin note (visible to admins only)"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Advance Amount:</Label>
          <Input
            type="number"
            min={0}
            value={advanceAmount}
            onChange={(e) => setAdvanceAmount(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Special Discount:</Label>
          <Input
            type="number"
            min={0}
            value={specialDiscount}
            onChange={(e) => setSpecialDiscount(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-destructive">Order Status:</Label>
          <Select value={orderStatus} onValueChange={setOrderStatus}>
            <SelectTrigger>
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
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default OrderStatusUpdate;
