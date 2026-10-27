import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import {
  Hourglass,
  CheckCircle,
  Truck,
  CheckCheck,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import useAuthAdminStore from '../../store/AuthAdminStore.js';

const statusConfig = {
  pending: { icon: Hourglass, color: 'text-amber-500' },
  approved: { icon: CheckCircle, color: 'text-blue-500' },
  intransit: { icon: Truck, color: 'text-primary' },
  delivered: { icon: CheckCheck, color: 'text-green-500' },
  returned: { icon: RotateCcw, color: 'text-purple-500' },
  cancelled: { icon: XCircle, color: 'text-destructive' },
};

const OrderStats = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();
  const [amountByStatus, setAmountByStatus] = useState({
    pending: 0,
    approved: 0,
    intransit: 0,
    delivered: 0,
    returned: 0,
    cancelled: 0,
  });

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const orders = res.data?.orders || [];

      const totals = {
        pending: 0,
        approved: 0,
        intransit: 0,
        delivered: 0,
        returned: 0,
        cancelled: 0,
      };

      orders.forEach((order) => {
        const status = order.orderStatus?.toLowerCase();
        const amount = order.totalAmount || 0;

        if (Object.prototype.hasOwnProperty.call(totals, status)) {
          totals[status] += amount;
        }
      });

      setAmountByStatus(totals);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 my-6">
      {Object.entries(amountByStatus).map(([status, amount]) => {
        const config = statusConfig[status];
        const Icon = config?.icon || Hourglass;
        return (
          <Card key={status} className="shadow-md border-0">
            <CardContent className="text-center space-y-2 ">
              <Icon className={`size-8 mx-auto ${config?.color || ''}`} />
              <p className="text-sm text-muted-foreground capitalize">
                Total {status} Orders
              </p>
              <p className="text-lg font-semibold">Tk. {amount.toFixed(2)}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OrderStats;
