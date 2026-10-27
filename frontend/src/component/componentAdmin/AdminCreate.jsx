import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import PermissionsCheckboxGroup from '../../component/componentAdmin/PermissionsCheckboxGroup.jsx';

const AdminCreate = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNo: '',
    password: '',
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${apiUrl}/admin/create`,
        { ...formData, permissions: selectedPermissions },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success('Admin created successfully');
      setTimeout(() => {
        navigate('/admin/adminlist');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Create New Admin</h1>

      <Card className="shadow-md border-0">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNo">Mobile No</Label>
              <Input
                id="mobileNo"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                placeholder="Enter mobile number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
            </div>
          </div>

          <PermissionsCheckboxGroup
            selectedPermissions={selectedPermissions}
            setSelectedPermissions={setSelectedPermissions}
          />

          <div className="flex justify-center pt-2">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Admin'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCreate;
