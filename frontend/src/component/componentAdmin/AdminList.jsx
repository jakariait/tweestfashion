import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Link } from 'react-router-dom';

const AdminList = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/admin/getall`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data.admins || []);
    } catch {
      toast.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${apiUrl}/admin/${selectedAdminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Admin deleted successfully');
      fetchAdmins();
    } catch {
      toast.error('Failed to delete admin');
    } finally {
      setOpenDeleteDialog(false);
      setSelectedAdminId(null);
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
      <Card className="shadow-md border-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-muted-foreground/10">
            <div>
              <h1 className="text-lg font-semibold">View and Create Admins</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {admins.length} total admins
              </p>
            </div>
            <Link to="/admin/createadmin">
              <Button size="sm">
                <Plus className="size-4 mr-1.5" />
                Create Admin
              </Button>
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SL</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile No.</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin, index) => (
                <TableRow key={admin._id}>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.mobileNo || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(admin.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/edit/${admin._id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="size-3.5 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAdminId(admin._id);
                          setOpenDeleteDialog(true);
                        }}
                        className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this admin?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminList;
