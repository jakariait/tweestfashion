import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore';
import PermissionsCheckboxGroup from './PermissionsCheckboxGroup.jsx';

const EditAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthAdminStore();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const fetchAdmin = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const adminData = { ...res.data.admin, password: '' };
      setAdmin(adminData);
      setSelectedPermissions(res.data.admin.permissions || []);
    } catch {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, id]);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setUpdating(true);
    try {
      const payload = {
        name: admin.name,
        email: admin.email,
        mobileNo: admin.mobileNo,
        permissions: selectedPermissions,
      };

      if (admin.password.trim()) {
        payload.password = admin.password;
      }

      await axios.put(`${apiUrl}/admin/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Admin updated successfully');
      setTimeout(() => navigate('/admin/adminlist'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update admin');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Admin</h1>

      <Card className="shadow-md border-0">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={admin.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={admin.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNo">Mobile No</Label>
              <Input
                id="mobileNo"
                name="mobileNo"
                value={admin.mobileNo || ''}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password (optional)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={admin.password || ''}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>

          <PermissionsCheckboxGroup
            selectedPermissions={selectedPermissions}
            setSelectedPermissions={setSelectedPermissions}
          />

          <div className="flex justify-center pt-2">
            <Button onClick={handleSubmit} disabled={updating}>
              {updating ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAdmin;
