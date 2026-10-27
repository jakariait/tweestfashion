import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const apiURL = import.meta.env.VITE_API_URL;

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

const defaultCoupon = {
  code: '',
  type: 'percentage',
  value: '',
  minimumOrder: '',
  startDate: '',
  endDate: '',
  status: 'active',
};

const CouponTable = () => {
  const { token } = useAuthAdminStore();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(defaultCoupon);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  const fetchCoupons = useCallback(async () => {
    try {
      const response = await axios.get(`${apiURL}/getAllCoupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(response.data.data || []);
    } catch {
      toast.error('Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleEdit = (coupon) => {
    setIsEdit(true);
    setFormData({ ...coupon });
    setFormOpen(true);
  };

  const handleCreate = () => {
    setIsEdit(false);
    setFormData(defaultCoupon);
    setFormOpen(true);
  };

  const saveCoupon = async () => {
    setSaving(true);
    try {
      const url = isEdit
        ? `${apiURL}/updateCoupon/${formData._id}`
        : `${apiURL}/createCoupon`;

      const method = isEdit ? axios.patch : axios.post;

      await method(url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(
        isEdit ? 'Coupon updated successfully' : 'Coupon created successfully',
      );
      setFormOpen(false);
      fetchCoupons();
    } catch {
      toast.error('Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!couponToDelete) return;
    try {
      await axios.delete(`${apiURL}/deleteCoupon/${couponToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Coupon deleted successfully.');
      fetchCoupons();
    } catch {
      toast.error('Failed to delete coupon.');
    } finally {
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
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
        title={'Coupon Management'}
        description={`${coupons.length} coupons`}
      />

      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="size-4 mr-1" />
          Create New Coupon
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Code</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Value</TableHead>
                <TableHead className="text-center">Min. Order</TableHead>
                <TableHead className="text-center">Start Date</TableHead>
                <TableHead className="text-center">End Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    No coupons found.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell className="text-center font-medium">
                      {coupon.code}
                    </TableCell>
                    <TableCell className="text-center">
                      {(coupon.type || '').charAt(0).toUpperCase() +
                        (coupon.type || '').slice(1)}
                    </TableCell>
                    <TableCell className="text-center">
                      {coupon.type === 'percentage'
                        ? `${coupon.value}%`
                        : `Tk. ${coupon.value}`}
                    </TableCell>
                    <TableCell className="text-center">
                      Tk. {coupon.minimumOrder}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDate(coupon.startDate)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDate(coupon.endDate)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          coupon.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {(coupon.status || '').charAt(0).toUpperCase() +
                          (coupon.status || '').slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => confirmDelete(coupon)}
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Update Coupon' : 'Create Coupon'}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the coupon details.'
                : 'Fill in the details to create a new coupon.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="e.g. SUMMER20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder={
                  formData.type === 'percentage' ? 'e.g. 20' : 'e.g. 500'
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumOrder">Minimum Order</Label>
              <Input
                id="minimumOrder"
                type="number"
                value={formData.minimumOrder}
                onChange={(e) =>
                  setFormData({ ...formData, minimumOrder: e.target.value })
                }
                placeholder="e.g. 1000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate?.slice(0, 10)}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate?.slice(0, 10)}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCoupon} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete coupon{' '}
              <strong>{couponToDelete?.code}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirmed}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponTable;
