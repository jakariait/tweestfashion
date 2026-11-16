import { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { SectionHeader } from '@/component/componentAdmin/SectionHeader.jsx';

const AdminPathaoConfig = () => {
  const [config, setConfig] = useState({
    baseUrl: '',
    clientId: '',
    clientSecret: '',
    username: '',
    password: '',
    storeId: '',
    isActive: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { token } = useAuthAdminStore();

  const apiUrl = import.meta.env.VITE_API_URL + '/pathao-config';

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
        console.error('Failed to fetch Pathao config', error);
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
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        username: config.username,
        password: config.password,
        storeId: config.storeId,
        isActive: config.isActive,
      };
      await axios.patch(apiUrl, allowedFields, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Pathao config updated successfully!');
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
      <SectionHeader title={'Update Pathao Config'} />

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              name="baseUrl"
              value={config.baseUrl}
              onChange={handleChange}
              placeholder="Pathao API Base URL"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              name="clientId"
              value={config.clientId}
              onChange={handleChange}
              placeholder="Your Client ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientSecret">Client Secret</Label>
            <div className="relative">
              <Input
                id="clientSecret"
                type={showClientSecret ? 'text' : 'password'}
                name="clientSecret"
                value={config.clientSecret}
                onChange={handleChange}
                placeholder="Your Client Secret"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowClientSecret((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Toggle client secret visibility"
              >
                {showClientSecret ? (
                  <EyeOff size={4} strokeWidth={1.5} />
                ) : (
                  <Eye size={4} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={config.username}
              onChange={handleChange}
              placeholder="Your Username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={config.password}
                onChange={handleChange}
                placeholder="Your Password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff size={4} strokeWidth={1.5} />
                ) : (
                  <Eye size={4} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeId">Store ID</Label>
            <Input
              id="storeId"
              name="storeId"
              value={config.storeId}
              onChange={handleChange}
              placeholder="Your Store ID"
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

export default AdminPathaoConfig;
