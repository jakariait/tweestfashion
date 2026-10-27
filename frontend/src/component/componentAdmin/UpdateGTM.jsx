import { useState, useEffect } from 'react';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Hash } from 'lucide-react';

const apiURL = import.meta.env.VITE_API_URL;

const UpdateGTM = () => {
  const [gtmId, setGtmId] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthAdminStore();

  useEffect(() => {
    const fetchGTM = async () => {
      try {
        const res = await fetch(`${apiURL}/getGTM`);
        if (!res.ok) throw new Error('Failed to fetch GTM config');
        const data = await res.json();
        setGtmId(data.googleTagManagerId || '');
        setIsActive(data.isActive || false);
      } catch {
        // ignore
      }
    };
    fetchGTM();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${apiURL}/updateGTM`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          googleTagManagerId: gtmId,
          isActive,
        }),
      });

      if (!res.ok) throw new Error(`Error: ${res.statusText}`);

      toast.success('GTM config updated successfully.');
    } catch (error) {
      toast.error(error.message || 'Failed to update GTM config.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="size-5" />
          GTM Configuration
        </CardTitle>
        <CardDescription>
          Google Tag Manager integration settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gtmId">Google Tag Manager ID</Label>
            <Input
              id="gtmId"
              value={gtmId}
              onChange={(e) => setGtmId(e.target.value)}
              placeholder="GTM-XXXXXXX"
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="isActive" className="text-sm font-medium">
                Active
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable or disable GTM tracking
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 mr-1 animate-spin" />
                Updating...
              </>
            ) : (
              'Update'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdateGTM;
