import { useEffect, useState } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { Button } from '@/components/ui/button';
import useOrderStore from '../../store/useOrderStore.js';
import dayjs from 'dayjs';

const timeframeLabels = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  lifetime: 'Lifetime',
};

const MostSoldProductsPieChart = () => {
  const { fetchAllOrdersWithoutPagination, allOrders } = useOrderStore();
  const [productSales, setProductSales] = useState([]);
  const [totalSold, setTotalSold] = useState(0);
  const [timeframe, setTimeframe] = useState('monthly');

  useEffect(() => {
    fetchAllOrdersWithoutPagination();
  }, [fetchAllOrdersWithoutPagination]);

  useEffect(() => {
    if (allOrders?.length > 0) {
      const now = dayjs();
      let filteredOrders = [];

      if (timeframe === 'weekly') {
        filteredOrders = allOrders.filter((order) =>
          dayjs(order.createdAt).isAfter(now.subtract(7, 'day')),
        );
      } else if (timeframe === 'monthly') {
        filteredOrders = allOrders.filter((order) =>
          dayjs(order.createdAt).isAfter(now.startOf('month')),
        );
      } else if (timeframe === 'yearly') {
        filteredOrders = allOrders.filter((order) =>
          dayjs(order.createdAt).isAfter(now.startOf('year')),
        );
      } else {
        filteredOrders = allOrders;
      }

      const productCountMap = {};
      let total = 0;

      filteredOrders
        .filter((order) => order.orderStatus !== 'cancelled')
        .forEach((order) => {
          order.items?.forEach((item) => {
            const name = item.productId?.name || 'Unknown Product';
            const qty = item.quantity || 1;

            if (!productCountMap[name]) productCountMap[name] = 0;
            productCountMap[name] += qty;
            total += qty;
          });
        });

      const pieData = Object.entries(productCountMap)
        .map(([id, value]) => ({
          id,
          label: id,
          value,
        }))
        .sort((a, b) => b.value - a.value);

      setProductSales(pieData);
      setTotalSold(total);
    }
  }, [allOrders, timeframe]);

  return (
    <div className="relative bg-white rounded-lg shadow py-6 px-4 overflow-hidden">
      <div className="text-center mb-6">
        <h3 className="font-semibold">Best Selling Products</h3>
        <p className="text-sm text-muted-foreground font-medium">
          Total Items Sold: {totalSold}
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
          data={productSales}
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

export default MostSoldProductsPieChart;
