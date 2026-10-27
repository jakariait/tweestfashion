import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const defaultForm = {
  question: '',
  answer: '',
  status: 'published',
};

const statusColors = {
  published: 'default',
  draft: 'secondary',
};

const AdminFAQSection = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const { token } = useAuthAdminStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/faq`);
      setFaqs(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load FAQs:', err);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  const handleOpen = (faq = null) => {
    if (faq) {
      setFormData({
        question: faq.question,
        answer: faq.answer,
        status: faq.status,
      });
      setEditingId(faq._id);
    } else {
      setFormData(defaultForm);
      setEditingId(null);
    }
    setDialogOpen(true);
  };

  const handleClose = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.patch(`${apiUrl}/faq/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('FAQ updated successfully');
      } else {
        await axios.post(`${apiUrl}/faq`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('FAQ added successfully');
      }
      fetchFAQs();
      handleClose();
    } catch (err) {
      console.error('Save failed', err);
      toast.error('Failed to save FAQ');
    }
  };

  const handleDeleteConfirmed = async () => {
    try {
      await axios.delete(`${apiUrl}/faq/${faqToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('FAQ deleted successfully');
      fetchFAQs();
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to delete FAQ');
    } finally {
      setDeleteDialogOpen(false);
      setFaqToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title={'Manage FAQs'} />
      <Card className="shadow-md border-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-muted-foreground/10">
            <h3 className="text-lg font-semibold">All FAQs</h3>
            <Button size="sm" onClick={() => handleOpen()}>
              <Plus className="size-4 mr-1.5" />
              Add FAQ
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 p-4">
              {faqs.map((faq) => (
                <Card
                  key={faq._id}
                  className="border-0 shadow-sm bg-muted/20 border-l-4 border-l-primary/60"
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="font-semibold leading-tight truncate">
                          {faq.question}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {faq.answer}
                        </p>
                        <Badge variant={statusColors[faq.status] || 'outline'}>
                          {faq.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpen(faq)}
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setFaqToDelete(faq);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Update FAQ' : 'Add New FAQ'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                name="question"
                value={formData.question}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, question: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                name="answer"
                value={formData.answer}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, answer: e.target.value }))
                }
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ?
            </DialogDescription>
          </DialogHeader>
          {faqToDelete && (
            <p className="text-sm font-medium">
              Question: {faqToDelete.question}
            </p>
          )}
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

export default AdminFAQSection;
