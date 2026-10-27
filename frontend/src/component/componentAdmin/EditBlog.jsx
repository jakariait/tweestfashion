import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
const Editor = lazy(() =>
  import('primereact/editor').then((module) => ({
    default: module.Editor,
  })),
);
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import ImageComponent from '../componentGeneral/ImageComponent.jsx';

const EditBlog = () => {
  const { id: blogId } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  const [formData, setFormData] = useState({
    name: '',
    author: '',
    longDesc: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    searchTags: [],
    isActive: true,
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);

  const fileInputRef = useRef(null);

  const handleInputChange = useCallback(
    (field) => (e) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    },
    [],
  );

  const handleEditorChange = useCallback(
    (e) => {
      if (isEditorReady && e.htmlValue !== formData.longDesc) {
        setFormData((prev) => ({
          ...prev,
          longDesc: e.htmlValue || '',
        }));
      }
    },
    [isEditorReady, formData.longDesc],
  );

  const handleDeleteTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      searchTags: prev.searchTags.filter((t) => t !== tag),
    }));
  };

  const handleDeleteKeyword = (keyword) => {
    setFormData((prev) => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter((k) => k !== keyword),
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.searchTags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          searchTags: [...prev.searchTags, tagInput.trim()],
        }));
      }
      setTagInput('');
    }
  };

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!formData.metaKeywords.includes(keywordInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          metaKeywords: [...prev.metaKeywords, keywordInput.trim()],
        }));
      }
      setKeywordInput('');
    }
  };

  useEffect(() => {
    if (blogId && token && apiUrl) {
      const fetchBlog = async () => {
        try {
          setIsEditorReady(false);
          const { data } = await axios.get(`${apiUrl}/blog/${blogId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const blog = data.data;
          setFormData({
            name: blog.name || '',
            author: blog.author || '',
            longDesc: blog.longDesc || '',
            metaTitle: blog.metaTitle || '',
            metaDescription: blog.metaDescription || '',
            searchTags: blog.searchTags || [],
            metaKeywords: blog.metaKeywords || [],
            isActive: blog.isActive !== undefined ? blog.isActive : true,
          });
          setImagePreview(blog.thumbnailImage || '');
          setTimeout(() => setIsEditorReady(true), 100);
        } catch (error) {
          console.error('Error fetching blog:', error);
          toast.error('Failed to load blog data');
        }
      };
      fetchBlog();
    }
  }, [blogId, token, apiUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('author', formData.author);
    submitData.append('longDesc', formData.longDesc);
    submitData.append('metaTitle', formData.metaTitle);
    submitData.append('metaDescription', formData.metaDescription);
    submitData.append('isActive', formData.isActive);
    formData.searchTags.forEach((tag) => submitData.append('searchTags', tag));
    formData.metaKeywords.forEach((kw) =>
      submitData.append('metaKeywords', kw),
    );
    if (thumbnailImage instanceof File) {
      submitData.append('thumbnailImage', thumbnailImage);
    }

    try {
      await axios.patch(`${apiUrl}/blog/${blogId}`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Blog updated successfully!');
      navigate('/admin/blogs');
    } catch (err) {
      console.error('Error updating blog:', err);
      toast.error('Failed to update blog.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit Blog</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-md border-0">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">
                    Author <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={handleInputChange('author')}
                    required
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label
                    htmlFor="isActive"
                    className={
                      formData.isActive
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    }
                  >
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Thumbnail Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-muted file:text-foreground hover:file:bg-muted/80"
                />
                {imagePreview && (
                  <div className="mt-2 rounded-md overflow-hidden border border-muted-foreground/20">
                    {thumbnailImage ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-40 object-contain"
                      />
                    ) : (
                      <ImageComponent imageName={imagePreview} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardContent className="p-6 space-y-2">
            <Label>Blog Content</Label>
            <Suspense
              fallback={
                <div className="py-8 text-center text-muted-foreground">
                  Loading Editor...
                </div>
              }
            >
              <Editor
                value={formData.longDesc}
                onTextChange={handleEditorChange}
                style={{ height: '660px' }}
              />
            </Suspense>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md border-0">
            <CardContent className="p-6 space-y-2">
              <Label>Tags</Label>
              <Input
                placeholder="Type a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              {formData.searchTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.searchTags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag)}
                        className="ml-1.5 hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6 space-y-2">
              <Label>Meta Keywords</Label>
              <Input
                placeholder="Type a keyword and press Enter"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleAddKeyword}
              />
              {formData.metaKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.metaKeywords.map((kw, i) => (
                    <Badge key={i} variant="secondary">
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleDeleteKeyword(kw)}
                        className="ml-1.5 hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6 space-y-2">
              <Label>Meta Title</Label>
              <Input
                placeholder="Meta Title"
                value={formData.metaTitle}
                onChange={handleInputChange('metaTitle')}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md border-0">
          <CardContent className="p-6 space-y-2">
            <Label>Meta Description</Label>
            <Textarea
              value={formData.metaDescription}
              onChange={handleInputChange('metaDescription')}
              rows={3}
              placeholder="Meta description"
            />
          </CardContent>
        </Card>

        <div className="flex justify-center pb-6">
          <Button type="submit">Update Blog</Button>
        </div>
      </form>
    </div>
  );
};

export default EditBlog;
