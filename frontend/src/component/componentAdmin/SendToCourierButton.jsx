import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import useCourierStatus from '../../store/useCourierStatus.js';
import useAuthAdminStore from '../../store/AuthAdminStore.js';

const SendToCourierButton = ({ orderData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(orderData.note || '');
  const [sent, setSent] = useState(orderData.courier_status || false);
  const [showDeliveryStatus, setShowDeliveryStatus] = useState(false);
  const {
    status: deliveryStatus,
    loading: statusLoading,
    refetch,
  } = useCourierStatus(orderData, sent, !sent);
  const [selectedCourier, setSelectedCourier] = useState('steadfast');
  const [pathaoStoreId, setPathaoStoreId] = useState(null);

  const apiURL = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  useEffect(() => {
    const fetchPathaoConfig = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${apiURL}/pathao-config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.data) {
          setPathaoStoreId(response.data.data.storeId);
        }
      } catch (error) {
        console.error('Failed to fetch Pathao config:', error);
      }
    };
    fetchPathaoConfig();
  }, [apiURL, token]);

  const handleButtonClick = () => {
    if (sent) {
      setShowDeliveryStatus(true);
      refetch();
    } else {
      setOpen(true);
    }
  };

  const sendToSteadfast = async () => {
    try {
      const response = await axios.post(
        `${apiURL}/steadfast/create-order`,
        {
          invoice: orderData.invoice,
          recipient_name: orderData.recipient_name,
          recipient_phone: orderData.recipient_phone,
          recipient_address: orderData.recipient_address,
          cod_amount: orderData.cod_amount,
          note,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result = response.data;
      const statusCode = result.data.status;

      if (result.status === 'success') {
        if (statusCode === 200) {
          await axios.put(
            `${apiURL}/orders/${orderData.order_id}`,
            {
              sentToCourier: true,
              orderStatus: 'intransit',
              courierProvider: 'steadfast',
              courierConsignmentId: result.data.consignment.consignment_id,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          toast.success(
            `Order sent to Steadfast! Consignment ID: ${result.data.consignment.consignment_id}`,
          );
          setSent(true);
          if (onSuccess) onSuccess();
          setOpen(false);
        } else if (statusCode === 400) {
          const errors = result.data.errors;
          let errorMessage = 'Failed to send order:';
          if (errors) {
            errorMessage +=
              '\n' +
              Object.entries(errors)
                .map(([key, value]) => `${key}: ${value.join(', ')}`)
                .join('\n');
          }
          toast.error(errorMessage);
        } else {
          toast.warning('Unknown status received from the server.');
        }
      } else {
        toast.error('API call was not successful.');
      }
    } catch (err) {
      toast.error('Network error while sending order.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendToPathao = async () => {
    try {
      const payload = {
        store_id: pathaoStoreId,
        recipient_name: orderData.recipient_name,
        recipient_phone: orderData.recipient_phone,
        merchant_order_id: orderData.invoice,
        recipient_address: orderData.recipient_address,
        delivery_type: '48',
        item_type: '2',
        item_quantity: orderData.items,
        item_weight: '0.5',
        amount_to_collect: orderData.cod_amount,
        special_instruction: note,
      };

      const response = await axios.post(`${apiURL}/pathao/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = response.data;
      if (result.type === 'success') {
        await axios.put(
          `${apiURL}/orders/${orderData.order_id}`,
          {
            sentToCourier: true,
            orderStatus: 'intransit',
            courierProvider: 'pathao',
            courierConsignmentId: result.data.consignment_id,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        toast.success(
          `Order sent to Pathao! Consignment ID: ${result.data.consignment_id}`,
        );
        setSent(true);
        if (onSuccess) onSuccess();
        setOpen(false);
      } else {
        const errorMessage =
          result.message || 'Failed to create Pathao consignment.';
        const errorDetails = result.errors
          ? '\n' +
            Object.entries(result.errors)
              .map(([key, value]) => `${key}: ${value.join(', ')}`)
              .join('\n')
          : '';
        toast.error(`${errorMessage}${errorDetails}`);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Network error while sending order to Pathao.';
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    setLoading(true);
    if (selectedCourier === 'steadfast') {
      sendToSteadfast();
    } else if (selectedCourier === 'pathao') {
      if (!pathaoStoreId) {
        toast.error('Pathao configuration is not loaded yet.');
        setLoading(false);
        return;
      }
      sendToPathao();
    }
  };

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className={`w-48 ${sent ? 'opacity-50' : ''}`}
        onClick={handleButtonClick}
        disabled={statusLoading}
      >
        {sent ? (
          statusLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              {showDeliveryStatus && deliveryStatus
                ? `${deliveryStatus} | ${orderData.courierProvider}`
                : 'Sent | Click to show status'}
            </>
          )
        ) : (
          'Send to Courier'
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Courier & Confirm</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Courier:</Label>
              <Select
                value={selectedCourier}
                onValueChange={setSelectedCourier}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="steadfast">Steadfast</SelectItem>
                  <SelectItem value="pathao">Pathao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold border-b pb-1">
                  Order Information
                </h3>
                <p className="text-sm">
                  <span className="font-medium">Invoice:</span>{' '}
                  {orderData.invoice}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Recipient Name:</span>{' '}
                  {orderData.recipient_name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Recipient Phone:</span>{' '}
                  {orderData.recipient_phone}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Recipient Address:</span>{' '}
                  {orderData.recipient_address}
                </p>
                <p className="text-sm">
                  <span className="font-medium">COD Amount:</span> Tk{' '}
                  {orderData.cod_amount}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="note">Order Note:</Label>
              <Textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={
                loading || (selectedCourier === 'pathao' && !pathaoStoreId)
              }
            >
              {loading && <Loader2 className="size-4 animate-spin mr-2" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SendToCourierButton;
