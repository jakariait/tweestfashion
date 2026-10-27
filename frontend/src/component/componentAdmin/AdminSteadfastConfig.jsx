import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SectionHeader } from '@/component/componentAdmin/SectionHeader.jsx';

const AdminSteadfastConfig = () => {
  const [config, setConfig] = useState({
    baseUrl: '',
    apiKey: '',
    secretKey: '',
    isActive: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { token } = useAuthAdminStore();

  const apiUrl = import.meta.env.VITE_API_URL + '/steadfast-config';

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
        console.error('Failed to fetch Steadfast config', error);
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
        apiKey: config.apiKey,
        secretKey: config.secretKey,
        isActive: config.isActive,
      };
      await axios.patch(apiUrl, allowedFields, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Steadfast config updated successfully!');
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
      <SectionHeader title={'Update Steadfast Config'} />

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              name="baseUrl"
              value={config.baseUrl}
              onChange={handleChange}
              placeholder="https://portal.packzy.com/api/v1"
              readOnly
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              name="apiKey"
              value={config.apiKey}
              onChange={handleChange}
              placeholder="Your API Key"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key</Label>
            <Input
              id="secretKey"
              name="secretKey"
              value={config.secretKey}
              onChange={handleChange}
              placeholder="Your Secret Key"
              required
            />
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

export default AdminSteadfastConfig;
