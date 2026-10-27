import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { SectionHeader } from '@/component/componentAdmin/SectionHeader.jsx';

const DeliveryCharge = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [shippingMethods, setShippingMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthAdminStore();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentMethod, setCurrentMethod] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedValue, setEditedValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchShippingMethods = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/getAllShipping`);
      setShippingMethods(res.data.data || []);
    } catch {
      toast.error('Failed to load shipping methods');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchShippingMethods();

    const handleShippingCreated = () => fetchShippingMethods();
    window.addEventListener('shippingMethodCreated', handleShippingCreated);

    return () => {
      window.removeEventListener(
        'shippingMethodCreated',
        handleShippingCreated,
      );
    };
  }, [fetchShippingMethods]);

  const handleEditOpen = (method) => {
    setCurrentMethod(method);
    setEditedName(method.name);
    setEditedValue(method.value);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await axios.patch(
        `${apiUrl}/updateShipping/${currentMethod._id}`,
        { name: editedName, value: editedValue },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchShippingMethods();
      setEditDialogOpen(false);
      toast.success('Delivery method updated!');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOpen = (method) => {
    setCurrentMethod(method);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${apiUrl}/deleteShipping/${currentMethod._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchShippingMethods();
      setDeleteDialogOpen(false);
      toast.success('Delivery method deleted!');
    } catch {
      toast.error('Failed to delete');
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
      <SectionHeader
        title={'Delivery Charge List'}
        description={`${shippingMethods.length} shipping methods`}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Charge</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippingMethods.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-8"
                  >
                    No delivery methods found.
                  </TableCell>
                </TableRow>
              ) : (
                shippingMethods.map((method) => (
                  <TableRow key={method._id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>Tk. {method.value}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleEditOpen(method)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeleteOpen(method)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Delivery Method</DialogTitle>
            <DialogDescription>
              Update the name and charge for this shipping method.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-value">Charge (Tk.)</Label>
              <Input
                id="edit-value"
                type="number"
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{currentMethod?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
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

export default DeliveryCharge;
