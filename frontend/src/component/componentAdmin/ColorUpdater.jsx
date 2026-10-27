import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import useColorStore from '../../store/ColorStore.js';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { Loader2, RotateCcw } from 'lucide-react';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const DEFAULT_COLORS = {
  primaryColor: '#00395d',
  secondaryColor: '#000000',
  accentColor: '#ffffff',
  tertiaryColor: '#b6d7a8',
};

const COLOR_FIELDS = [
  { label: 'Primary Color', name: 'primaryColor', desc: 'Main brand color' },
  {
    label: 'Secondary Color',
    name: 'secondaryColor',
    desc: 'Secondary brand color',
  },
  {
    label: 'Accent Color',
    name: 'accentColor',
    desc: 'Text on dark backgrounds',
  },
  {
    label: 'Tertiary Color',
    name: 'tertiaryColor',
    desc: 'Highlight / accent',
  },
];

const ColorUpdater = () => {
  const { token } = useAuthAdminStore();
  const { colors, fetchColors, updateColors } = useColorStore();

  const [localColors, setLocalColors] = useState({ ...DEFAULT_COLORS });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!colors) fetchColors();
  }, [colors, fetchColors]);

  useEffect(() => {
    if (colors) setLocalColors({ ...DEFAULT_COLORS, ...colors });
  }, [colors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalColors((prev) => ({ ...prev, [name]: value }));
  };

  const updateColorData = async () => {
    setSaving(true);
    await updateColors(localColors, token);
    const store = useColorStore.getState();
    if (store.error) {
      toast.error(store.error);
    } else {
      toast.success('Colors updated successfully!');
    }
    setSaving(false);
  };

  const resetToDefaults = () => {
    setLocalColors({ ...DEFAULT_COLORS });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={'Website Theme Color'}
        description={'Customize your brand colors across the site.'}
      />

      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {COLOR_FIELDS.map(({ label, name, desc }) => (
              <div key={name} className="space-y-3">
                <div>
                  <Label htmlFor={name}>{label}</Label>
                  {desc && (
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      name={name}
                      value={localColors[name] || DEFAULT_COLORS[name]}
                      onChange={handleChange}
                      className="absolute inset-0 size-10 cursor-pointer opacity-0"
                    />
                    <div
                      className="size-10 rounded-md border shadow-sm"
                      style={{
                        backgroundColor:
                          localColors[name] || DEFAULT_COLORS[name],
                      }}
                    />
                  </div>
                  <Input
                    name={name}
                    value={localColors[name] || ''}
                    onChange={handleChange}
                    placeholder={DEFAULT_COLORS[name]}
                    className="font-mono flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={resetToDefaults}>
          <RotateCcw className="size-4 mr-1" />
          Reset Defaults
        </Button>
        <Button onClick={updateColorData} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="size-4 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            'Update Colors'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ColorUpdater;
