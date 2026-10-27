import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const AdminBkashConfig = () => {
  const [config, setConfig] = useState({
    baseUrl: '',
    appKey: '',
    appSecret: '',
    username: '',
    password: '',
    isActive: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { token } = useAuthAdminStore();

  const apiUrl = import.meta.env.VITE_API_URL + '/bkash-config';

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.data) {
          setConfig(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch bKash config', error);
      } finally {
        setFetching(false);
      }
    };
    fetchConfig();
  }, [apiUrl, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const allowedFields = {
        baseUrl: config.baseUrl,
        appKey: config.appKey,
        appSecret: config.appSecret,
        username: config.username,
        password: config.password,
        isActive: config.isActive,
      };
      await axios.patch(apiUrl, allowedFields, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('bKash config updated successfully!');
    } catch (error) {
      toast.error('Failed to update config. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="shadow-md border-0">
      <SectionHeader title={'Update bKash Config'} />

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              name="baseUrl"
              value={config.baseUrl}
              onChange={handleChange}
              placeholder="https://tokenized.sandbox.bka.sh/v1.2.0-beta"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appKey">App Key</Label>
            <Input
              id="appKey"
              name="appKey"
              value={config.appKey}
              onChange={handleChange}
              placeholder="Your app key"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appSecret">App Secret</Label>
            <Input
              id="appSecret"
              name="appSecret"
              value={config.appSecret}
              onChange={handleChange}
              placeholder="Your app secret"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={config.username}
              onChange={handleChange}
              placeholder="017xxxxxxxx"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={config.password}
              onChange={handleChange}
              placeholder="Your password"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="isActive"
              checked={config.isActive}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminBkashConfig;
