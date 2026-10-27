import { useRef, useState, useEffect, lazy, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useCategoryStore from '../../store/useCategoryStore.js';
import useSubCategoryStore from '../../store/useSubCategoryStore.js';
import useChildCategoryStore from '../../store/useChildCategoryStore.js';
import useFlagStore from '../../store/useFlagStore.js';
import useProductOptionStore from '../../store/useProductOptionStore.js';
import useProductStore from '../../store/useProductStore.js';
const Editor = lazy(() =>
  import('primereact/editor').then((module) => ({ default: module.Editor })),
);
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import {
  Trash2,
  Plus,
  Upload,
  X,
  Image,
  Loader2,
  ChevronDown,
  Pencil,
  Check,
} from 'lucide-react';
import http from '../../lib/http.js';
import { toId } from '../../utils/toId.js';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const ProductForm = ({ isEdit: isEditMode }) => {
  const { slug } = useParams();

  const { fetchProductBySlug, product, resetProduct } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { subCategories, fetchSubCategories } = useSubCategoryStore();
  const { childCategories, fetchChildCategories } = useChildCategoryStore();
  const { flags, fetchFlags } = useFlagStore();
  const { productOptions, fetchProductOptions } = useProductOptionStore();
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  // The edit entry point passes its own URL (with search/page params), so a
  // successful save returns to the exact view the user left — without it,
  // fall back to the plain products list
  const location = useLocation();
  const returnToList = () =>
    navigate(location.state?.from || '/admin/manage-products');

  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [productCode, setProductCode] = useState('');
  const [rewardPoints, setRewardPoints] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [filteredChildCategories, setFilteredChildCategories] = useState([]);
  const [selectedChildCategory, setSelectedChildCategory] = useState('');
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [editingBrandName, setEditingBrandName] = useState('');
  const [brandBusy, setBrandBusy] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [searchTags, setSearchTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [finalPrice, setFinalPrice] = useState('');
  const [finalDiscount, setFinalDiscount] = useState('');
  const [finalStock, setFinalStock] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [selectedFlags, setSelectedFlags] = useState([]);
  const [hasVariant, setHasVariant] = useState(true);
  const [variants, setVariants] = useState([
    {
      attributes: [{ option: '', value: '' }],
      stock: '',
      price: '',
      discount: '',
      image: '',
      imageFile: null,
      imagePreview: '',
    },
  ]);
  const [isActive, setIsActive] = useState('true');
  const [freeShipping, setFreeShipping] = useState(false);

  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragSource, setDragSource] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  const imageUrl = `${apiUrl.replace('/api', '')}/uploads`;

  // --- In-place brand management (optional field on the product) ---
  const fetchBrands = useCallback(async () => {
    try {
      const { data } = await http.get('/brands');
      setBrands(data.data || []);
    } catch {
      toast.error('Failed to load brands');
    }
  }, []);

  // Confirm dialog so destructive actions aren't a single misclick away
  const confirmAction = (message) => window.confirm(message);

  const resetForm = () => {
    setName('');
    setShortDesc('');
    setLongDesc('');
    setProductCode('');
    setRewardPoints('');
    setVideoUrl('');
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords([]);
    setSearchTags([]);
    setFinalPrice('');
    setFinalDiscount('');
    setFinalStock('');
    setPurchasePrice('');
    setSelectedFlags([]);
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedChildCategory('');
    setFilteredSubCategories([]);
    setFilteredChildCategories([]);
    setSelectedBrand('');
    setNewBrandName('');
    setEditingBrandId(null);
    setEditingBrandName('');
    setThumbnailImage(null);
    setImagePreview('');
    setSelectedImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setVariants([
      {
        attributes: [{ option: '', value: '' }],
        stock: '',
        price: '',
        discount: '',
        image: '',
        imageFile: null,
        imagePreview: '',
      },
    ]);
    setHasVariant(true);
    setIsActive('true');
    setFreeShipping(false);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imagesInputRef.current) imagesInputRef.current.value = '';
  };

  useEffect(() => {
    // Stale data from a previously viewed/edited product would flash while
    // the correct one loads — clear form state whenever we (re)load for a slug
    resetForm();
    if (isEditMode && slug) {
      resetProduct(); // avoid flashing a previously viewed product's data
      fetchProductBySlug(slug);
    }
    // The category/sub-category/child-category selects depend on these stores.
    // They are shared with other pages, but never assume they were populated
    // elsewhere — e.g. a direct link into this page in production starts with
    // empty zustand stores, so fetch them here.
    fetchCategories();
    fetchSubCategories();
    fetchChildCategories();
    fetchProductOptions();
    fetchFlags();
    fetchBrands();
  }, [
    isEditMode,
    slug,
    fetchProductBySlug,
    fetchCategories,
    fetchSubCategories,
    fetchChildCategories,
    fetchProductOptions,
    fetchFlags,
    fetchBrands,
    resetProduct,
  ]);

  useEffect(() => {
    if (isEditMode && product) {
      setName(product.name || '');
      setShortDesc(product.shortDesc || '');
      setLongDesc(product.longDesc || '');
      setProductCode(product.productCode || '');
      setRewardPoints(product.rewardPoints || '');
      setVideoUrl(product.videoUrl || '');
      setMetaTitle(product.metaTitle || '');
      setMetaDescription(product.metaDescription || '');
      setMetaKeywords(product.metaKeywords || []);
      setSearchTags(product.searchTags || []);
      setFinalPrice(product.finalPrice || '');
      setFinalDiscount(product.finalDiscount || '');
      setFinalStock(product.finalStock || '');
      setPurchasePrice(product.purchasePrice || '');
      setSelectedFlags(
        Array.from(
          new Set(
            (product.flags || [])
              .map((f) => toId(f))
              .filter((id) => Boolean(id)),
          ),
        ),
      );
      setSelectedBrand(product.brand ? toId(product.brand) : '');
      setIsActive(String(product.isActive));
      setFreeShipping(product.freeShipping || false);

      if (product.thumbnailImage) {
        setImagePreview(`${imageUrl}/${product.thumbnailImage}`);
      }

      setExistingImages(product.images || []);

      if (product.variants && product.variants.length > 0) {
        setVariants(
          product.variants.map((v) => ({
            attributes: v.attributes
              ? v.attributes.map((attr) => ({
                  option: toId(attr.option),
                  value:
                    attr.value != null
                      ? String(
                          typeof attr.value === 'object'
                            ? (attr.value.value ?? '')
                            : attr.value,
                        )
                      : '',
                }))
              : [],
            stock: v.stock,
            price: v.price,
            discount: v.discount || '',
            image: v.image || '',
            imageFile: null,
            imagePreview: v.image ? `${imageUrl}/${v.image}` : '',
          })),
        );
        setHasVariant(true);
      } else {
        setVariants([
          {
            attributes: [{ option: '', value: '' }],
            stock: '',
            price: '',
            discount: '',
            image: '',
            imageFile: null,
            imagePreview: '',
          },
        ]);
        setHasVariant(false);
      }
    }
  }, [product, isEditMode, apiUrl, imageUrl]);

  useEffect(() => {
    if (isEditMode && product && product.category) {
      const categoryId = toId(product.category);
      setSelectedCategory(categoryId);
      const filteredSubs = subCategories.filter(
        (sub) => toId(sub?.category) === categoryId,
      );
      setFilteredSubCategories(filteredSubs);

      if (product.subCategory) {
        const subCategoryId = toId(product.subCategory);
        setSelectedSubCategory(subCategoryId);
        const filteredChilds = childCategories.filter(
          (child) => toId(child?.subCategory) === subCategoryId,
        );
        setFilteredChildCategories(filteredChilds);

        if (product.childCategory) {
          setSelectedChildCategory(toId(product.childCategory));
        } else {
          setSelectedChildCategory('');
        }
      } else {
        setSelectedSubCategory('');
        setSelectedChildCategory('');
        setFilteredChildCategories([]);
      }
    }
  }, [product, subCategories, childCategories, categories, isEditMode]);

  const handleToggle = () => {
    setHasVariant(!hasVariant);
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        attributes: [{ option: '', value: '' }],
        stock: '',
        price: '',
        discount: '',
        image: '',
        imageFile: null,
        imagePreview: '',
      },
    ]);
  };

  const handleRemoveVariant = (index) => {
    const removed = variants[index];
    if (removed?.imageFile) URL.revokeObjectURL(removed.imagePreview);
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantImageChange = (variantIndex, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const prev = variants[variantIndex];
    if (prev?.imageFile) URL.revokeObjectURL(prev.imagePreview);
    updateVariant(variantIndex, {
      image: '',
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    });
  };

  const handleRemoveVariantImage = (variantIndex) => {
    const v = variants[variantIndex];
    if (v?.imageFile) URL.revokeObjectURL(v.imagePreview);
    updateVariant(variantIndex, {
      image: '',
      imageFile: null,
      imagePreview: '',
    });
    const input = document.getElementById(`variant-image-${variantIndex}`);
    if (input) input.value = '';
  };

  const updateVariant = (index, updater) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, ...updater } : variant,
      ),
    );
  };

  const updateAttribute = (index, attrIndex, field, value) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index
          ? {
              ...variant,
              attributes: variant.attributes.map((attr, ai) =>
                ai === attrIndex ? { ...attr, [field]: value } : attr,
              ),
            }
          : variant,
      ),
    );
  };

  const handleAddAttribute = (variantIndex) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              attributes: [...variant.attributes, { option: '', value: '' }],
            }
          : variant,
      ),
    );
  };

  const handleRemoveAttribute = (variantIndex, attributeIndex) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === variantIndex
          ? {
              ...variant,
              attributes: variant.attributes.filter(
                (_, ai) => ai !== attributeIndex,
              ),
            }
          : variant,
      ),
    );
  };

  const handleMultipleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => file);
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setSelectedImages((prevImages) => [...prevImages, ...newImages]);
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  const handleRemoveImages = (index) => {
    if (!confirmAction('Remove this image?')) return;
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => {
      URL.revokeObjectURL(prevPreviews[index]);
      return prevPreviews.filter((_, i) => i !== index);
    });

    if (selectedImages.length === 1 && !isEditMode) {
      const multiInput = document.getElementById('multi-image-upload');
      if (multiInput) multiInput.value = '';
    }
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    if (!confirmAction('Remove this image? It will be deleted on save.'))
      return;
    const imageNameToDelete = existingImages[indexToRemove];
    setImagesToDelete((prev) => [...prev, imageNameToDelete]);
    setExistingImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleRemoveAllNewImages = () => {
    if (!confirmAction('Remove all newly uploaded images?')) return;
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviews([]);
    if (imagesInputRef.current) {
      imagesInputRef.current.value = '';
    }
  };

  const handleDragStart = (e, index, source) => {
    setDraggedIndex(index);
    setDragSource(source);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex, targetSource) => {
    e.preventDefault();

    if (dragSource !== targetSource) {
      setDraggedIndex(null);
      setDragSource(null);
      return;
    }

    if (dragSource === 'existing') {
      const newExistingImages = [...existingImages];
      const draggedItem = newExistingImages[draggedIndex];
      newExistingImages.splice(draggedIndex, 1);
      newExistingImages.splice(targetIndex, 0, draggedItem);
      setExistingImages(newExistingImages);
    } else if (dragSource === 'new') {
      const newSelectedImages = [...selectedImages];
      const newPreviews = [...imagePreviews];

      const draggedImageItem = newSelectedImages[draggedIndex];
      const draggedPreview = newPreviews[draggedIndex];

      newSelectedImages.splice(draggedIndex, 1);
      newPreviews.splice(draggedIndex, 1);

      newSelectedImages.splice(targetIndex, 0, draggedImageItem);
      newPreviews.splice(targetIndex, 0, draggedPreview);

      setSelectedImages(newSelectedImages);
      setImagePreviews(newPreviews);
    }

    setDraggedIndex(null);
    setDragSource(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragSource(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setThumbnailImage(file);
      setImagePreview(imageUrl);
    }
  };

  const handleRemoveThumbnail = () => {
    if (imagePreview && !confirmAction('Remove the thumbnail image?')) return;
    setThumbnailImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedSubCategory('');
    setFilteredSubCategories([]);
    setSelectedChildCategory('');
    setFilteredChildCategories([]);

    if (value) {
      const filtered = subCategories.filter(
        (sub) => toId(sub?.category) === value,
      );
      setFilteredSubCategories(filtered);
    }
  };

  const handleSubCategoryChange = (value) => {
    setSelectedSubCategory(value);
    setSelectedChildCategory('');
    setFilteredChildCategories([]);

    if (value) {
      const filtered = childCategories.filter(
        (child) => toId(child?.subCategory) === value,
      );
      setFilteredChildCategories(filtered);
    }
  };

  const handleChildCategoryChange = (value) => {
    setSelectedChildCategory(value);
  };

  const handleFlagToggle = (flagId) => {
    setSelectedFlags((prev) =>
      prev.includes(flagId)
        ? prev.filter((id) => id !== flagId)
        : [...prev, flagId],
    );
  };

  const handleAddBrand = async () => {
    const name = newBrandName.trim();
    if (!name) return;
    setBrandBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      const { data } = await http.post('/brands', fd);
      setBrands((prev) => [...prev, data.data]);
      setSelectedBrand((prev) => prev || data.data._id);
      setNewBrandName('');
      toast.success('Brand added!');
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to add brand (may already exist).',
      );
    } finally {
      setBrandBusy(false);
    }
  };

  const startBrandEdit = (brand) => {
    setEditingBrandId(brand._id);
    setEditingBrandName(brand.name);
  };

  const cancelBrandEdit = () => {
    setEditingBrandId(null);
    setEditingBrandName('');
  };

  const handleUpdateBrand = async () => {
    const name = editingBrandName.trim();
    if (!name) return;
    const brand = brands.find((b) => b._id === editingBrandId);

    setBrandBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('isTopBrand', String(brand?.isTopBrand || false));
      const { data } = await http.put(`/brands/${editingBrandId}`, fd);
      setBrands((prev) =>
        prev.map((b) => (b._id === editingBrandId ? data.data : b)),
      );
      toast.success('Brand updated!');
      cancelBrandEdit();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to update brand.',
      );
    } finally {
      setBrandBusy(false);
    }
  };

  const handleDeleteBrand = async (brand) => {
    if (!confirmAction(`Delete brand "${brand.name}"?`)) return;

    setBrandBusy(true);
    try {
      await http.delete(`/brands/${brand._id}`);
      setBrands((prev) => prev.filter((b) => b._id !== brand._id));
      if (selectedBrand === brand._id) setSelectedBrand('');
      toast.success('Brand deleted!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete brand.');
    } finally {
      setBrandBusy(false);
    }
  };

  // Values for a variant attribute — always includes the stored value so a
  // saved variant never shows an empty Value dropdown (e.g. option edited or
  // deleted after the product was saved)
  const getAttributeValueList = (attr) => {
    const selectedOption = productOptions.find((o) => o._id === attr.option);
    const values = [...(selectedOption?.values || [])];
    const storedValue =
      attr.value != null
        ? String(
            typeof attr.value === 'object'
              ? (attr.value.value ?? '')
              : attr.value,
          )
        : '';
    if (storedValue && !values.includes(storedValue)) {
      values.unshift(storedValue);
    }
    return values;
  };

  const handleFinalPriceChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setFinalPrice(value);
  };

  const handleDiscountChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setFinalDiscount(value);
  };

  const handleFinalStockChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setFinalStock(value);
  };

  const handleRewardPointsChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setRewardPoints(value);
  };

  const handlePurchasePriceChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setPurchasePrice(value);
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
    setErrors({});

    let validationErrors = {};
    if (!name.trim()) validationErrors.name = 'Product name is required.';
    if (!selectedCategory) validationErrors.category = 'Category is required.';

    if (!imagePreview && !isEditMode) {
      validationErrors.thumbnailImage = 'Thumbnail image is required.';
    } else if (isEditMode && !imagePreview && !product?.thumbnailImage) {
      validationErrors.thumbnailImage = 'Thumbnail image is required.';
    }

    if (existingImages.length + selectedImages.length === 0) {
      validationErrors.images = 'At least one image is required.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('shortDesc', shortDesc);
    formData.append('longDesc', longDesc);
    formData.append('productCode', productCode);
    formData.append('rewardPoints', rewardPoints);
    formData.append('videoUrl', videoUrl);
    formData.append('metaTitle', metaTitle);
    formData.append('metaDescription', metaDescription);
    formData.append('finalPrice', finalPrice);
    formData.append('finalDiscount', finalDiscount);
    formData.append('finalStock', finalStock);
    formData.append('purchasePrice', purchasePrice);
    formData.append('isActive', isActive);
    formData.append('freeShipping', freeShipping);
    formData.append('hasVariant', hasVariant);

    if (selectedCategory) formData.append('category', selectedCategory);
    if (selectedSubCategory)
      formData.append('subCategory', selectedSubCategory);
    if (selectedChildCategory)
      formData.append('childCategory', selectedChildCategory);

    selectedFlags.forEach((flag) => formData.append('flags', flag));
    formData.append('brand', selectedBrand);
    searchTags.forEach((tag) => formData.append('searchTags', tag));
    metaKeywords.forEach((keyword) => formData.append('metaKeywords', keyword));

    if (thumbnailImage instanceof File) {
      formData.append('thumbnailImage', thumbnailImage);
    }

    if (isEditMode && imagesToDelete.length > 0) {
      imagesToDelete.forEach((imageName) => {
        formData.append('imagesToDelete', imageName);
      });
    }

    if (isEditMode && existingImages.length > 0) {
      existingImages.forEach((imageName) => {
        formData.append('existingImages', imageName);
      });
    }

    selectedImages.forEach((image) => {
      if (image instanceof File) {
        formData.append('images', image);
      }
    });

    const processedVariants = variants.filter(
      (variant) =>
        variant.attributes.length > 0 &&
        variant.attributes.every((attr) => attr.option && attr.value) &&
        variant.price &&
        variant.stock !== '' &&
        variant.stock != null,
    );

    if (hasVariant && processedVariants.length < variants.length) {
      const skipped = variants.length - processedVariants.length;
      setErrors((prev) => ({
        ...prev,
        variants: `${skipped} incomplete variant(s) will not be saved. Every variant needs an option + value, stock, and price.`,
      }));
      toast.warning(
        `${skipped} incomplete variant(s) were not saved. Fill stock, price and all attributes.`,
      );
    }

    if (hasVariant && processedVariants.length > 0) {
      processedVariants.forEach((variant, index) => {
        formData.append(`variants[${index}][stock]`, variant.stock);
        formData.append(`variants[${index}][price]`, variant.price);
        formData.append(`variants[${index}][discount]`, variant.discount);
        // '' means the image was cleared server-side; the saved image name
        // means it is kept as-is
        formData.append(`variants[${index}][image]`, variant.image);
        // New uploads are sent as a flat field together with the variant
        // index it belongs to, so the backend can map them
        if (variant.imageFile instanceof File) {
          formData.append('variantImages', variant.imageFile);
          formData.append('variantImageIndices', index);
        }
        variant.attributes.forEach((attr, attrIndex) => {
          formData.append(
            `variants[${index}][attributes][${attrIndex}][option]`,
            attr.option,
          );
          formData.append(
            `variants[${index}][attributes][${attrIndex}][value]`,
            attr.value,
          );
        });
      });
    }

    try {
      const uploadOptions = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total > 0) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
          }
        },
      };

      if (isEditMode) {
        if (!product?._id) return;
        await http.put(`/products/${product._id}`, formData, uploadOptions);
        toast.success('Product updated successfully!');
        setImagesToDelete([]);
      } else {
        await http.post('/products', formData, uploadOptions);
        toast.success('Product created successfully!');
        resetForm();
      }

      setTimeout(returnToList, 3000);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (isEditMode
            ? 'Failed to update product.'
            : 'Failed to create product.'),
      );
      const resErrors = error?.response?.data;
      setErrors(
        resErrors && Object.keys(resErrors).length > 0 ? resErrors : {},
      );
      if (!error?.response) {
        console.error('An unexpected error occurred:', error);
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (isEditMode && !product) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-6 gap-6">
          <div className="col-span-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`${isEditMode ? 'Update Product' : 'Add New Product'}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Editor
                    value={shortDesc}
                    onTextChange={(e) => setShortDesc(e.htmlValue)}
                    style={{ height: '260px' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Long Description</Label>
                  <Editor
                    value={longDesc}
                    onTextChange={(e) => setLongDesc(e.htmlValue)}
                    style={{ height: '260px' }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Search Tags & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Search Tags</Label>
                  <Input
                    placeholder="Type a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  {searchTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {searchTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleDeleteTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Thumbnail Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="thumbnail-upload"
                  name="thumbnailImage"
                  ref={fileInputRef}
                  required={!isEditMode}
                />
                <Label
                  htmlFor="thumbnail-upload"
                  className="block relative cursor-pointer"
                >
                  {imagePreview ? (
                    <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={imagePreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveThumbnail();
                        }}
                      >
                        <X className="size-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="h-48 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/50 transition-colors">
                      <Upload className="size-8" />
                      <p className="text-sm">Click to upload an image</p>
                    </div>
                  )}
                </Label>
                {errors.thumbnailImage && (
                  <p className="text-xs text-destructive">
                    {errors.thumbnailImage}
                  </p>
                )}
              </CardContent>
            </Card>

            {!hasVariant && (
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle>Pricing & Stock</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="finalPrice">
                      Price (In BDT) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="finalPrice"
                      type="number"
                      value={finalPrice}
                      onChange={handleFinalPriceChange}
                      required={!hasVariant}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finalDiscount">Discount Price</Label>
                    <Input
                      id="finalDiscount"
                      type="number"
                      value={finalDiscount}
                      onChange={handleDiscountChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finalStock">
                      Stock <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="finalStock"
                      type="number"
                      value={finalStock}
                      onChange={handleFinalStockChange}
                      required={!hasVariant}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditMode && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={isActive} onValueChange={setIsActive}>
                      <SelectTrigger
                        className="border border-border/60 hover:border-ring/60 focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/30"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border border-border/60 shadow-sm">
                        <SelectItem value="true" className="text-foreground">
                          Active
                        </SelectItem>
                        <SelectItem value="false" className="text-foreground">
                          Inactive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Switch
                    id="freeShipping"
                    checked={freeShipping}
                    onCheckedChange={setFreeShipping}
                  />
                  <Label htmlFor="freeShipping">Free Shipping</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rewardPoints">Reward Points</Label>
                  <Input
                    id="rewardPoints"
                    type="number"
                    value={rewardPoints}
                    onChange={handleRewardPointsChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={purchasePrice}
                    onChange={handlePurchasePriceChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input
                    id="productCode"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Select Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger
                      className="border border-border/60 hover:border-ring/60 focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/30"
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="border border-border/60 shadow-sm">
                      {categories.map((category) => (
                        <SelectItem
                          key={category._id}
                          value={category._id}
                          className="text-foreground"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Select Sub Category</Label>
                  <Select
                    value={selectedSubCategory}
                    onValueChange={handleSubCategoryChange}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger
                      className="border border-border/60 hover:border-ring/60 focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/30"
                    >
                      <SelectValue
                        placeholder={
                          selectedCategory
                            ? 'Select a subcategory'
                            : 'Select a category first'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="border border-border/60 shadow-sm">
                      {filteredSubCategories.length > 0 ? (
                        filteredSubCategories.map((sub) => (
                          <SelectItem
                            key={sub._id}
                            value={sub._id}
                            className="text-foreground"
                          >
                            {sub.name}
                          </SelectItem>
                        ))
                      ) : (
                        <p className="px-2 py-1.5 text-sm text-muted-foreground">
                          No subcategories available
                        </p>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Child Category</Label>
                  <Select
                    value={selectedChildCategory}
                    onValueChange={handleChildCategoryChange}
                    disabled={!selectedSubCategory}
                  >
                    <SelectTrigger
                      className="border border-border/60 hover:border-ring/60 focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/30"
                    >
                      <SelectValue
                        placeholder={
                          selectedSubCategory
                            ? 'Select a child category'
                            : 'Select a subcategory first'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="border border-border/60 shadow-sm">
                      {filteredChildCategories.length > 0 ? (
                        filteredChildCategories.map((child) => (
                          <SelectItem
                            key={child._id}
                            value={child._id}
                            className="text-foreground"
                          >
                            {child.name}
                          </SelectItem>
                        ))
                      ) : (
                        <p className="px-2 py-1.5 text-sm text-muted-foreground">
                          No child categories available
                        </p>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>
                  Brand{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    (optional)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      role="combobox"
                      variant="secondary"
                      disabled={brandBusy}
                      className="w-full justify-between shadow-xs"
                    >
                      {brands.find((b) => b._id === selectedBrand)?.name ||
                        'No brand'}
                      <ChevronDown className="size-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 border-0 p-2 shadow-md" align="start">
                    {/* Add new brand */}
                    <div className="flex items-center gap-1 px-1 pb-2">
                      <Input
                        placeholder="New brand name"
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBrand();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="icon-xs"
                        onClick={handleAddBrand}
                        disabled={brandBusy || !newBrandName.trim()}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>

                    {/* Clear selection */}
                    <div
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => setSelectedBrand('')}
                    >
                      <Checkbox checked={!selectedBrand} />
                      <Label className="cursor-pointer">No brand</Label>
                    </div>

                    {brands.map((brand) =>
                      editingBrandId === brand._id ? (
                        <div
                          key={brand._id}
                          className="flex items-center gap-1 px-1 py-1"
                        >
                          <Input
                            value={editingBrandName}
                            onChange={(e) => setEditingBrandName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleUpdateBrand();
                              }
                              if (e.key === 'Escape') cancelBrandEdit();
                            }}
                            className="h-7 text-sm"
                          />
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            onClick={handleUpdateBrand}
                          >
                            <Check className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            onClick={cancelBrandEdit}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          key={brand._id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                          onClick={() => setSelectedBrand(brand._id)}
                        >
                          <Checkbox
                            checked={selectedBrand === brand._id}
                            onCheckedChange={() => setSelectedBrand(brand._id)}
                          />
                          <Label className="cursor-pointer flex-1 truncate">
                            {brand.name}
                          </Label>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            className="hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              startBrandEdit(brand);
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon-xs"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBrand(brand);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ),
                    )}
                    {brands.length === 0 && (
                      <p className="text-sm text-muted-foreground px-2">
                        No brands yet — add one above.
                      </p>
                    )}
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      role="combobox"
                      variant="secondary"
                      className="w-full justify-between shadow-xs"
                    >
                      {selectedFlags.length > 0
                        ? `${selectedFlags.length} flag(s) selected`
                        : 'Select flags'}
                      <ChevronDown className="size-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full border-0 p-2 shadow-md" align="start">
                    <div className="space-y-1">
                      {flags.map((flag) => (
                        <div
                          key={flag._id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
                          onClick={() => handleFlagToggle(flag._id)}
                        >
                          <Checkbox
                            checked={selectedFlags.includes(flag._id)}
                            onCheckedChange={() => handleFlagToggle(flag._id)}
                          />
                          <Label className="cursor-pointer">{flag.name}</Label>
                        </div>
                      ))}
                      {flags.length === 0 && (
                        <p className="text-sm text-muted-foreground px-2">
                          No flags available
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {selectedFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedFlags.map((flagId) => {
                      const flag = flags.find((f) => f._id === flagId);
                      return (
                        <Badge key={flagId} variant="secondary">
                          {flag ? flag.name : 'Unavailable flag'}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>
              Product Images <span className="text-destructive">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImagesChange}
              className="hidden"
              id="multi-image-upload"
              name="images"
              ref={imagesInputRef}
              required={!isEditMode && selectedImages.length === 0}
            />
            <Label
              htmlFor="multi-image-upload"
              className="block relative cursor-pointer"
            >
              {existingImages.length > 0 || selectedImages.length > 0 ? (
                <div className="relative min-h-[150px] rounded-lg border-2 border-dashed border-muted-foreground/30 p-4">
                  {selectedImages.length > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAllNewImages();
                      }}
                    >
                      <X className="size-3 mr-1" />
                      {isEditMode ? 'Remove New Images' : 'Remove All'}
                    </Button>
                  )}
                  <div className="flex gap-4 flex-wrap mt-2 justify-center items-center">
                    {isEditMode &&
                      existingImages.map((image, index) => (
                        <div
                          key={`existing-${index}`}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, index, 'existing')
                          }
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index, 'existing')}
                          onDragEnd={handleDragEnd}
                          className="relative w-[150px] h-[150px] rounded-lg overflow-hidden bg-muted/50 shadow-sm cursor-move"
                          style={{
                            opacity:
                              draggedIndex === index &&
                              dragSource === 'existing'
                                ? 0.5
                                : 1,
                            outline:
                              draggedIndex === index &&
                              dragSource === 'existing'
                                ? '2px dashed hsl(var(--muted-foreground))'
                                : 'none',
                          }}
                        >
                          <img
                            src={`${imageUrl}/${image}`}
                            alt={`Existing ${index}`}
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveExistingImage(index);
                            }}
                            className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/90"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    {imagePreviews.map((image, index) => (
                      <div
                        key={`new-${index}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index, 'new')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index, 'new')}
                        onDragEnd={handleDragEnd}
                        className="relative w-[150px] h-[150px] rounded-lg overflow-hidden bg-muted/50 shadow-sm cursor-move"
                        style={{
                          opacity:
                            draggedIndex === index && dragSource === 'new'
                              ? 0.5
                              : 1,
                          outline:
                            draggedIndex === index && dragSource === 'new'
                              ? '2px dashed hsl(var(--muted-foreground))'
                              : 'none',
                        }}
                      >
                        <img
                          src={image}
                          alt={`New ${index}`}
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImages(index);
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/90"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <Label
                      htmlFor="multi-image-upload"
                      className="w-[150px] h-[150px] rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground/50 transition-colors cursor-pointer"
                    >
                      <Plus className="size-6" />
                      <p className="text-xs">Add more</p>
                    </Label>
                  </div>
                </div>
              ) : (
                <div className="min-h-[150px] rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-muted-foreground/50 transition-colors">
                  <Image className="size-8" />
                  <p className="text-sm">Click to upload images</p>
                </div>
              )}
            </Label>
            {errors.images && (
              <p className="text-xs text-destructive">{errors.images}</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Label>Product Has Variant?</Label>
              <Switch checked={hasVariant} onCheckedChange={handleToggle} />
            </div>

            {hasVariant && (
              <>
                <p className="text-center text-sm text-destructive">
                  Product Variant (Insert the Base Variant First)
                </p>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attributes</TableHead>
                        <TableHead className="w-20">Image</TableHead>
                        <TableHead className="w-24">Stock *</TableHead>
                        <TableHead className="w-24">Price *</TableHead>
                        <TableHead className="w-28">Disc. Price</TableHead>
                        <TableHead className="w-16">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((variant, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="space-y-2">
                              {variant.attributes.map((attr, attrIndex) => (
                                <div
                                  key={attrIndex}
                                  className="flex items-center gap-1.5"
                                >
                                  {(() => {
                                    const usedOptionIds = variant.attributes
                                      .filter(
                                        (a, i) => i !== attrIndex && a.option,
                                      )
                                      .map((a) => a.option);
                                    return (
                                      <Select
                                        value={attr.option}
                                        onValueChange={(value) => {
                                          updateAttribute(
                                            index,
                                            attrIndex,
                                            'option',
                                            value,
                                          );
                                          updateAttribute(
                                            index,
                                            attrIndex,
                                            'value',
                                            '',
                                          );
                                        }}
                                      >
                                      <SelectTrigger
                                        className="w-[120px] border border-border/60 hover:border-ring/60 focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/30"
                                      >
                                        <SelectValue placeholder="Option" />
                                      </SelectTrigger>
                                      <SelectContent
                                        className="border border-border/60 shadow-sm"
                                      >
                                        {productOptions.map((option) => (
                                          <SelectItem
                                            key={option._id}
                                            value={option._id}
                                            disabled={
                                              usedOptionIds.includes(
                                                option._id,
                                              ) && option._id !== attr.option
                                            }
                                            className="text-foreground"
                                          >
                                            {option.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                      </Select>
                                    );
                                  })()}
                                  <Select
                                    value={attr.value}
                                    onValueChange={(value) => {
                                      updateAttribute(
                                        index,
                                        attrIndex,
                                        'value',
                                        value,
                                      );
                                    }}
                                    disabled={!attr.option}
                                  >
                                    <SelectTrigger
                                      className="w-[120px] border border-border/60 hover:border-ring/60 focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/30"
                                    >
                                      <SelectValue placeholder="Value" />
                                    </SelectTrigger>
                                    <SelectContent
                                      className="border border-border/60 shadow-sm"
                                    >
                                      {getAttributeValueList(attr).map(
                                        (val) => (
                                          <SelectItem
                                            key={val}
                                            value={val}
                                            className="text-foreground"
                                          >
                                            {val}
                                          </SelectItem>
                                        ),
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    type="button"
                                    onClick={() =>
                                      handleRemoveAttribute(index, attrIndex)
                                    }
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => handleAddAttribute(index)}
                              >
                                <Plus className="size-3 mr-1" />
                                Add Attribute
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`variant-image-${index}`}
                              onChange={(e) =>
                                handleVariantImageChange(index, e)
                              }
                            />
                            {variant.imagePreview ? (
                              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted/50">
                                <img
                                  src={variant.imagePreview}
                                  alt={`Variant ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveVariantImage(index)
                                  }
                                  className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl-md w-4 h-4 flex items-center justify-center text-[10px] leading-none"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <Label
                                htmlFor={`variant-image-${index}`}
                                className="w-16 h-16 rounded-md border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:border-muted-foreground/50 transition-colors cursor-pointer"
                              >
                                <Image className="size-4" />
                                <span className="text-[10px]">Add</span>
                              </Label>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={variant.stock}
                              required
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value >= 0 || value === '') {
                                  updateVariant(index, { stock: value });
                                }
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={variant.price}
                              required
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value >= 0 || value === '') {
                                  updateVariant(index, { price: value });
                                }
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={variant.discount}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value >= 0 || value === '') {
                                  updateVariant(index, { discount: value });
                                }
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              type="button"
                              onClick={() => handleRemoveVariant(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleAddVariant}
                  >
                    <Plus className="size-4 mr-1" />
                    Add Another Variant
                  </Button>
                </div>
              </>
            )}
            {errors.variants && (
              <p className="text-center text-xs text-destructive">
                {errors.variants}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>
              Product SEO Information{' '}
              <span className="text-muted-foreground font-normal text-sm">
                (Optional)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
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
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => handleDeleteKeyword(keyword)}
                          className="ml-1 hover:text-destructive"
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
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-2">
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="min-w-[200px]"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                {uploadProgress > 0
                  ? `${isEditMode ? 'Uploading' : 'Creating'}… ${uploadProgress}%`
                  : isEditMode
                    ? 'Updating...'
                    : 'Adding...'}
              </>
            ) : (
              <>{isEditMode ? 'Update Product' : 'Add Product'}</>
            )}
          </Button>
          {submitting && (
            <div className="h-1.5 w-[200px] overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress || 5}%` }}
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
