import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
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
import {
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AuthAdminStore from '../../store/AuthAdminStore.js';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const BlogList = () => {
  const navigate = useNavigate();
  const apiURL = import.meta.env.VITE_API_URL;
  const { token } = AuthAdminStore();

  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);

  const fetchBlogs = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiURL}/blog?page=${page}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlogs(res.data.data || []);
        setCurrentPage(res.data.currentPage || 1);
        setTotalPages(res.data.totalPages || 1);
      } catch (error) {
        console.error('Failed to fetch blogs', error);
        toast.error('Failed to fetch blogs.');
      } finally {
        setLoading(false);
      }
    },
    [apiURL, token],
  );

  useEffect(() => {
    fetchBlogs(currentPage);
  }, [currentPage, fetchBlogs]);

  const handleEdit = (id) => {
    navigate(`/admin/blogs/${id}`);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${apiURL}/blog/${selectedBlogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Blog deleted successfully!');
      fetchBlogs(currentPage);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete blog.');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedBlogId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={'Blog List'}
        description={loading ? '...' : `${blogs.length} blogs`}
      />

      <Card className="shadow-md border-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-muted-foreground/10">
            <h3 className="text-lg font-semibold">All Blogs</h3>
            <Link to="/admin/create-blog">
              <Button size="sm">
                <Plus className="size-4 mr-1.5" />
                Create Blog
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No blogs found.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[120px]">Author</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog, index) => (
                    <TableRow key={blog._id}>
                      <TableCell className="text-muted-foreground">
                        {index + 1 + (currentPage - 1) * 10}
                      </TableCell>
                      <TableCell className="font-medium max-w-[400px] truncate">
                        {blog.name}
                      </TableCell>
                      <TableCell>{blog.author}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(blog._id)}
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setSelectedBlogId(blog._id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-muted-foreground/10 px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogList;
