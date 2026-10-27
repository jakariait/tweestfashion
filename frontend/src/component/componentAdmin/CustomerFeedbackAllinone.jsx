import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import { SectionHeader } from '@/component/componentAdmin/SectionHeader.jsx';

const RatingStars = ({ rating }) => (
  <div className="flex items-center justify-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={
          star <= rating
            ? 'size-3.5 fill-amber-400 text-amber-400'
            : 'size-3.5 text-muted-foreground/40'
        }
      />
    ))}
  </div>
);

const CustomerFeedbackAllinone = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageBaseUrl = apiUrl.replace('/api', '') + '/uploads';
  const { token } = useAuthAdminStore();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    rating: '5',
    location: '',
    isActive: true,
    image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileInputRef = useRef(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  const fetchFeedbacks = () => {
    setLoading(true);
    axios
      .get(`${apiUrl}/customer-feedback`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 1000 },
      })
      .then((res) => {
        setFeedbacks(res.data.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Error fetching customer feedback.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({
      name: '',
      message: '',
      rating: '5',
      location: '',
      isActive: true,
      image: null,
    });
    setImagePreview(null);
    setImageRemoved(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (feedback) => {
    setIsEdit(true);
    setEditId(feedback._id);
    setFormData({
      name: feedback.name,
      message: feedback.message,
      rating: String(feedback.rating),
      location: feedback.location || '',
      isActive: feedback.isActive !== false,
      image: null,
    });
    setImagePreview(
      feedback.image ? `${imageBaseUrl}/${feedback.image}` : null,
    );
    setImageRemoved(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.warning('Customer name is required.');
      return;
    }
    if (!formData.message.trim()) {
      toast.warning('Message is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('message', formData.message);
      fd.append('rating', formData.rating);
      fd.append('location', formData.location);
      fd.append('isActive', String(formData.isActive));
      if (formData.image instanceof File) {
        fd.append('customerImage', formData.image);
      } else if (imageRemoved && isEdit) {
        fd.append('removeImage', 'true');
      }

      if (isEdit) {
        await axios.put(`${apiUrl}/customer-feedback/${editId}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Customer feedback updated successfully!');
      } else {
        await axios.post(`${apiUrl}/customer-feedback`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Customer feedback added successfully!');
      }
      setDialogOpen(false);
      fetchFeedbacks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (feedback) => {
    setFeedbackToDelete(feedback);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!feedbackToDelete) return;
    try {
      await axios.delete(
        `${apiUrl}/customer-feedback/${feedbackToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success('Customer feedback deleted successfully!');
      fetchFeedbacks();
    } catch {
      toast.error('Failed to delete customer feedback.');
    } finally {
      setDeleteDialogOpen(false);
      setFeedbackToDelete(null);
    }
  };

  const filteredFeedbacks = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return feedbacks
      .filter(
        (item) =>
          item?.name?.toLowerCase().includes(term) ||
          item?.location?.toLowerCase().includes(term) ||
          item?.message?.toLowerCase().includes(term),
      )
      .reverse();
  }, [feedbacks, searchTerm]);

  const pageCount = Math.ceil(filteredFeedbacks.length / rowsPerPage);
  const paginatedFeedbacks = filteredFeedbacks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title={'Customer Feedback'}
        description={`${feedbacks.length} total feedback`}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, location or message..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="size-4 mr-1" />
          Add Feedback
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-[60px]">
                      Image
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-center w-[130px]">
                      Rating
                    </TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="max-w-[270px]">Message</TableHead>
                    <TableHead className="text-center w-[90px]">
                      Status
                    </TableHead>
                    <TableHead className="text-center w-[100px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFeedbacks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        No customer feedback found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedFeedbacks.map((feedback) => (
                      <TableRow key={feedback._id}>
                        <TableCell className="text-center">
                          {feedback.image ? (
                            <img
                              src={`${imageBaseUrl}/${feedback.image}`}
                              alt=""
                              className="mx-auto h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {feedback.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <RatingStars rating={feedback.rating} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {feedback.location || '—'}
                        </TableCell>
                        <TableCell
                          className="max-w-[270px] truncate"
                          title={feedback.message}
                        >
                          {feedback.message}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              feedback.isActive !== false
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {feedback.isActive !== false ? 'Active' : 'Hidden'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleOpenEdit(feedback)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => confirmDelete(feedback)}
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

              {filteredFeedbacks.length > rowsPerPage && (
                <div className="flex items-center justify-between border-t border-muted-foreground/10 px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {pageCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pageCount - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Customer Feedback' : 'Add New Customer Feedback'}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the customer feedback details.'
                : 'Add a new customer review with rating and image.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label
                htmlFor="feedback-name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Customer Name
              </label>
              <Input
                id="feedback-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Rahim Uddin"
                required
              />
              {!formData.name.trim() && (
                <p className="text-xs text-destructive">
                  Customer name is required
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="feedback-message"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Message
              </label>
              <Textarea
                id="feedback-message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="What did the customer say?"
                rows={4}
                required
              />
              {!formData.message.trim() && (
                <p className="text-xs text-destructive">Message is required</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating (out of 5)</label>
                <Select
                  value={formData.rating}
                  onValueChange={(value) =>
                    setFormData({ ...formData, rating: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((value) => (
                      <SelectItem key={value} value={String(value)}>
                        {value} Star{value > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="feedback-location"
                  className="text-sm font-medium"
                >
                  Location{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  id="feedback-location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. Dhaka"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Customer Image{' '}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, image: file });
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="flex-1"
                />
                {imagePreview && (
                  <button
                    type="button"
                    className="text-xs text-destructive hover:underline"
                    onClick={() => {
                      setFormData({ ...formData, image: null });
                      setImagePreview(null);
                      setImageRemoved(true);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-1 h-20 w-20 rounded-full object-cover border"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={String(formData.isActive)}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    isActive: value === 'true',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                'Update'
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
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the feedback from{' '}
              <strong>{feedbackToDelete?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerFeedbackAllinone;
