import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore';
import { toast } from 'sonner';
import { Loader2, Truck } from 'lucide-react';

const CreateShipping = () => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useAuthAdminStore();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !value.trim())
      return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      await axios.post(
        `${apiUrl}/createShipping`,
        { name, value },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      window.dispatchEvent(new CustomEvent('shippingMethodCreated'));
      setName('');
      setValue('');
      toast.success('Delivery charge added successfully!');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="size-5" />
          Add New Delivery Charge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Inside Dhaka"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Charge (Tk.)</Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 100"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateShipping;
