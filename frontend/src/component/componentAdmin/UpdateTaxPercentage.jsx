import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Percent } from 'lucide-react';

const UpdateTaxPercentage = () => {
  const [amount, setAmount] = useState('');
  const [currentValue, setCurrentValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { token } = useAuthAdminStore();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCurrentValue = async () => {
      try {
        const res = await axios.get(`${apiUrl}/getVatPercentage`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentValue(res.data?.data?.value ?? 0);
      } catch (err) {
        console.error('Failed to fetch current value', err);
      } finally {
        setFetching(false);
      }
    };
    fetchCurrentValue();
  }, [apiUrl, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount.trim()) return toast.error('Please enter a valid percentage');

    setLoading(true);
    try {
      await axios.patch(
        `${apiUrl}/updateVatPercentage`,
        { value: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCurrentValue(Number(amount));
      setAmount('');
      toast.success('Tax/VAT percentage updated successfully');
    } catch {
      toast.error('Something went wrong while updating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="size-5" />
          Tax/VAT Percentage Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-lg bg-muted/50 p-4 text-sm">
            <p className="text-muted-foreground">Current Tax/VAT Percentage:</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {fetching ? (
                <Loader2 className="size-5 animate-spin inline" />
              ) : (
                `${currentValue}%`
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Set 0 to deactivate Tax/VAT
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">New Percentage</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 mr-1 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Percentage'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdateTaxPercentage;
