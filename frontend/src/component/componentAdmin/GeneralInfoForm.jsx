import { useEffect, useState } from 'react';
import ImageComponent from '../componentGeneral/ImageComponent.jsx';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import useGeneralInfoStore from '../../store/GeneralInfoStore.js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ImagePlus } from 'lucide-react';
import { SectionHeader } from '@/component/componentAdmin/SectionHeader.jsx';

const ImageUploadCard = ({ label, name, preview, existing, onFileChange }) => (
  <div className="space-y-3">
    <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/20">
      {preview || existing ? (
        <ImageComponent
          imageName={preview || existing}
          className="w-full h-full object-contain"
          altName={label}
          skeletonHeight={140}
        />
      ) : (
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <ImagePlus className="size-8" />
          <span className="text-xs">No image</span>
        </div>
      )}
    </div>
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type="file"
        name={name}
        onChange={onFileChange}
        accept="image/*"
        className="mt-1"
      />
    </div>
  </div>
);

const ArrayFieldSection = ({
  label,
  fields,
  fieldName,
  handleArrayChange,
  addArrayField,
  removeArrayField,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">{label}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {(fields || ['']).map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={value ?? ''}
            onChange={(e) =>
              handleArrayChange(index, fieldName, e.target.value)
            }
            placeholder={`Enter ${label.toLowerCase()}`}
          />
          {index > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeArrayField(index, fieldName)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addArrayField(fieldName)}
      >
        <Plus className="size-4 mr-1" />
        Add More
      </Button>
    </CardContent>
  </Card>
);

const TextField = ({ label, name, value, handleChange, placeholder }) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}</Label>
    <Input
      id={name}
      name={name}
      value={value ?? ''}
      onChange={handleChange}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
    />
  </div>
);

export default function GeneralInfoForm() {
  const { token } = useAuthAdminStore();
  const { GeneralInfoList, GeneralInfoUpdate, GeneralInfoListRequest } =
    useGeneralInfoStore();

  const [formData, setFormData] = useState({
    CompanyName: '',
    PhoneNumber: [''],
    CompanyEmail: [''],
    ShortDescription: '',
    CompanyAddress: '',
    GoogleMapLink: '',
    WhatsAppNumber: '',
    WhatsAppNumberIsActive: false,
  });

  const [files, setFiles] = useState({
    PrimaryLogo: null,
    SecondaryLogo: null,
    Favicon: null,
  });

  const [previews, setPreviews] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (GeneralInfoList) {
      setFormData((prev) => ({
        ...prev,
        CompanyName: GeneralInfoList.CompanyName || '',
        PhoneNumber: GeneralInfoList.PhoneNumber || [''],
        CompanyEmail: GeneralInfoList.CompanyEmail || [''],
        ShortDescription: GeneralInfoList.ShortDescription || '',
        CompanyAddress: GeneralInfoList.CompanyAddress || '',
        GoogleMapLink: GeneralInfoList.GoogleMapLink || '',
        WhatsAppNumber: GeneralInfoList.WhatsAppNumber || '',
        WhatsAppNumberIsActive: GeneralInfoList.WhatsAppNumberIsActive || false,
      }));

      setFiles({
        PrimaryLogo: GeneralInfoList.PrimaryLogo || null,
        SecondaryLogo: GeneralInfoList.SecondaryLogo || null,
        Favicon: GeneralInfoList.Favicon || null,
      });
    }
  }, [GeneralInfoList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    setFiles((prev) => ({ ...prev, [name]: file }));
    if (file) {
      setPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    } else {
      setPreviews((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    // Allow re-selecting the same file later
    e.target.value = '';
  };

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const handleArrayChange = (index, field, value) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayField = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayField = (index, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('You must be signed in to update General Info.');
      return;
    }
    setSubmitting(true);

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, rawValue]) => {
        if (Array.isArray(rawValue)) {
          // Drop blank rows produced by "Add More"; backend splits on ','
          form.append(
            key,
            rawValue.filter((item) => (item ?? '').trim()).join(','),
          );
        } else if (typeof rawValue === 'boolean') {
          form.append(key, rawValue);
        } else if (String(rawValue).trim()) {
          form.append(key, rawValue.trim());
        }
      });

      Object.keys(files).forEach((key) => {
        if (files[key] && files[key] instanceof File) {
          form.append(key, files[key]);
        }
      });

      const result = await GeneralInfoUpdate(form, token);

      if (result?.success) {
        toast.success('General information updated successfully!');
        // Re-fetch so stored image filenames coming back from the server
        // replace the locally picked File objects
        await GeneralInfoListRequest();
      } else if (result?.status === 403) {
        toast.warning(
          'You do not have permission to perform this action. (403 Forbidden)',
        );
      } else {
        toast.error(result?.message || 'Failed to update general information.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={'General Information'}
        description={
          'Manage your company details, logos, and contact information.'
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Brand Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImageUploadCard
                label="Primary Logo"
                name="PrimaryLogo"
                preview={previews.PrimaryLogo}
                existing={files.PrimaryLogo}
                onFileChange={handleFileChange}
              />
              <ImageUploadCard
                label="Secondary Logo"
                name="SecondaryLogo"
                preview={previews.SecondaryLogo}
                existing={files.SecondaryLogo}
                onFileChange={handleFileChange}
              />
              <ImageUploadCard
                label="Favicon"
                name="Favicon"
                preview={previews.Favicon}
                existing={files.Favicon}
                onFileChange={handleFileChange}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ArrayFieldSection
            label="Phone Numbers"
            fields={formData.PhoneNumber}
            fieldName="PhoneNumber"
            handleArrayChange={handleArrayChange}
            addArrayField={addArrayField}
            removeArrayField={removeArrayField}
          />
          <ArrayFieldSection
            label="Company Emails"
            fields={formData.CompanyEmail}
            fieldName="CompanyEmail"
            handleArrayChange={handleArrayChange}
            addArrayField={addArrayField}
            removeArrayField={removeArrayField}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Company Name"
                name="CompanyName"
                value={formData.CompanyName}
                handleChange={handleChange}
                placeholder="Your company name"
              />
              <TextField
                label="Short Description"
                name="ShortDescription"
                value={formData.ShortDescription}
                handleChange={handleChange}
                placeholder="Brief description of your company"
              />
            </div>
            <TextField
              label="Company Address"
              name="CompanyAddress"
              value={formData.CompanyAddress}
              handleChange={handleChange}
              placeholder="Full company address"
            />
            <TextField
              label="Google Map Link"
              name="GoogleMapLink"
              value={formData.GoogleMapLink}
              handleChange={handleChange}
              placeholder="Google Maps embed URL"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="WhatsAppNumber">WhatsApp Number</Label>
              <Input
                id="WhatsAppNumber"
                name="WhatsAppNumber"
                value={formData.WhatsAppNumber}
                onChange={handleChange}
                placeholder="+880 1234567890"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="WhatsAppNumberIsActive"
                checked={formData.WhatsAppNumberIsActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, WhatsAppNumberIsActive: checked }))
                }
              />
              <Label htmlFor="WhatsAppNumberIsActive">WhatsApp Number Active</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update General Info'}
          </Button>
        </div>
      </form>
    </div>
  );
}
