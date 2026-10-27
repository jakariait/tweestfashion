import { lazy, Suspense, useRef, useState } from 'react';
import AuthAdminStore from '../../store/AuthAdminStore.js';
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
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { X, Upload } from 'lucide-react';
import axios from 'axios';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const AddBlog = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = AuthAdminStore();

  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [searchTags, setSearchTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setThumbnailImage(file);
      setImagePreview(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setThumbnailImage(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!searchTags.includes(tagInput.trim())) {
        setSearchTags([...searchTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setSearchTags(searchTags.filter((tag) => tag !== tagToDelete));
  };

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' && keywordInput.trim() !== '') {
      e.preventDefault();
      if (!metaKeywords.includes(keywordInput.trim())) {
        setMetaKeywords([...metaKeywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const handleDeleteKeyword = (keywordToDelete) => {
    setMetaKeywords(
      metaKeywords.filter((keyword) => keyword !== keywordToDelete),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('author', author);
    formData.append('longDesc', longDesc);
    formData.append('metaTitle', metaTitle);
    formData.append('metaDescription', metaDescription);
    searchTags.forEach((tag) => formData.append('searchTags', tag));
    metaKeywords.forEach((keyword) => formData.append('metaKeywords', keyword));
    if (thumbnailImage instanceof File) {
      formData.append('thumbnailImage', thumbnailImage);
    }

    try {
      await axios.post(`${apiUrl}/blog`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Blog created successfully!');

      setName('');
      setAuthor('');
      setLongDesc('');
      setMetaTitle('');
      setMetaDescription('');
      setSearchTags([]);
      setMetaKeywords([]);
      setThumbnailImage(null);
      setImagePreview('');
    } catch {
      toast.error('Failed to create blog. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title={'Add New Blog'} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <Card className="shadow-md border-0">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Blog Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter blog title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">
                    Author <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                    placeholder="Enter author name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Blog Content</Label>
                  <Suspense
                    fallback={
                      <div className="py-8 text-center text-muted-foreground">
                        Loading Editor...
                      </div>
                    }
                  >
                    <Editor
                      value={longDesc}
                      onTextChange={(e) => setLongDesc(e.htmlValue)}
                      style={{ height: '260px' }}
                    />
                  </Suspense>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input
                    placeholder="Type a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  {searchTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {searchTags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
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
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-4 space-y-6">
            <Card className="shadow-md border-0">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>
                    Blog Thumbnail Image{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="thumbnail-upload"
                    ref={fileInputRef}
                    required
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="relative flex items-center justify-center h-[210px] border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors overflow-hidden"
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="size-full object-contain"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveImage();
                          }}
                        >
                          <X className="size-3 mr-1" />
                          Remove
                        </Button>
                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded">
                          Image Selected
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="size-8" />
                        <span className="text-sm">
                          Click to upload an image
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="shadow-md border-0">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Blog SEO Information{' '}
              <span className="text-sm font-normal text-muted-foreground">
                (Optional)
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Meta title"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Keywords</Label>
                <Input
                  placeholder="Type a keyword and press Enter"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                />
                {metaKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {metaKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => handleDeleteKeyword(keyword)}
                          className="ml-1.5 hover:text-destructive"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={4}
                placeholder="Meta description"
                className="resize-y"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pb-6">
          <Button type="submit">Create Blog</Button>
        </div>
      </form>
    </div>
  );
};

export default AddBlog;
