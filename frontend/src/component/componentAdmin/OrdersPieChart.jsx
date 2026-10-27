import { useEffect, useState } from 'react';
import { ResponsivePie } from '@nivo/pie';
import useOrderStore from '../../store/useOrderStore.js';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';

const timeframeLabels = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  lifetime: 'Lifetime',
};

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  intransit: 'In Transit',
  delivered: 'Delivered',
  returned: 'Returned',
  cancelled: 'Cancelled',
};

const OrdersPieChart = () => {
  const { fetchAllOrdersWithoutPagination, allOrders } = useOrderStore();
  const [timeframe, setTimeframe] = useState('monthly');
  const [statusCounts, setStatusCounts] = useState({});

  useEffect(() => {
    fetchAllOrdersWithoutPagination();
  }, [fetchAllOrdersWithoutPagination]);

  useEffect(() => {
    const now = dayjs();
    let filteredOrders = [];

    if (timeframe === 'weekly') {
      filteredOrders = allOrders?.filter((order) =>
        dayjs(order.createdAt).isAfter(now.subtract(7, 'day')),
      );
    } else if (timeframe === 'monthly') {
      filteredOrders = allOrders?.filter((order) =>
        dayjs(order.createdAt).isAfter(now.startOf('month')),
      );
    } else if (timeframe === 'yearly') {
      filteredOrders = allOrders?.filter((order) =>
        dayjs(order.createdAt).isAfter(now.startOf('year')),
      );
    } else if (timeframe === 'lifetime') {
      filteredOrders = allOrders || [];
    }

    const counts = {};
    filteredOrders?.forEach((order) => {
      const status = order.orderStatus || 'unknown';
      if (!counts[status]) counts[status] = 0;
      counts[status]++;
    });

    setStatusCounts(counts);
  }, [allOrders, timeframe]);

  const pieData = Object.entries(statusCounts)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      id: statusLabels[key] || key,
      label: statusLabels[key] || key,
      value,
    }));

  const totalOrders = pieData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-white rounded-lg shadow py-6 px-4">
      <div className="text-center mb-6">
        <h3 className="font-semibold">Order Status Breakdown</h3>
        <p className="text-sm text-muted-foreground font-medium">
          Total Orders: {totalOrders}
        </p>

        <div className="flex justify-center gap-1 mt-3">
          {Object.entries(timeframeLabels).map(([value, label]) => (
            <Button
              key={value}
              variant={timeframe === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative h-[300px] w-full">
        <ResponsivePie
          data={pieData}
          margin={{ top: 10, right: 40, bottom: 10, left: 40 }}
          innerRadius={0.5}
          padAngle={1.5}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={{ scheme: 'category10' }}
          enableArcLabels={false}
          enableArcLinkLabels={false}
        />
      </div>
    </div>
  );
};

export default OrdersPieChart;
