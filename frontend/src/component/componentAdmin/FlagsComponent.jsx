import { useEffect, useState } from 'react';
import useFlagStore from '../../store/useFlagStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { GripVertical, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const SortableFlag = ({ flag, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: flag._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [editing, setEditing] = useState(false);
  const [updateFlagName, setUpdateFlagName] = useState(flag.name);
  const [updateIsActive, setUpdateIsActive] = useState(flag.isActive);
  const [updating, setUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleStartEdit = () => {
    setUpdateFlagName(flag.name);
    setUpdateIsActive(flag.isActive);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!updateFlagName.trim()) return;
    setUpdating(true);
    try {
      await onUpdate(flag._id, {
        name: updateFlagName,
        isActive: updateIsActive,
      });
      setEditing(false);
      toast.success('Flag updated successfully!');
    } catch {
      toast.error('Failed to update flag');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(flag._id);
      setDeleteDialogOpen(false);
      toast.success('Flag deleted successfully!');
    } catch {
      toast.error('Failed to delete flag');
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={editing ? 'border-primary/50' : ''}>
        <CardContent className="p-2">
          {editing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab touch-none text-muted-foreground hover:text-foreground transition-colors"
                >
                  <GripVertical className="size-4" />
                </div>
                <Input
                  value={updateFlagName}
                  onChange={(e) => setUpdateFlagName(e.target.value)}
                  placeholder="Flag name"
                  className="flex-1 h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`flag-active-${flag._id}`}
                  checked={updateIsActive}
                  onCheckedChange={(checked) => setUpdateIsActive(!!checked)}
                />
                <Label htmlFor={`flag-active-${flag._id}`}>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSave} disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="size-3 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab touch-none text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <GripVertical className="size-4" />
                </div>
                <span className="text-sm font-medium truncate">
                  {flag.name}
                </span>
                <Badge
                  variant={flag.isActive ? 'default' : 'secondary'}
                  className="shrink-0 text-[10px] px-1.5 py-0"
                >
                  {flag.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleStartEdit}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this flag? This action cannot be
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

const FlagsComponent = () => {
  const {
    flags,
    loading,
    error,
    fetchFlags,
    createFlag,
    updateFlag,
    deleteFlag,
    updateFlagPositions,
  } = useFlagStore();

  const [newFlagName, setNewFlagName] = useState('');
  const [items, setItems] = useState([]);
  const [creating, setCreating] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  useEffect(() => {
    setItems(flags);
  }, [flags]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCreateFlag = async () => {
    if (!newFlagName.trim()) return;
    setCreating(true);
    try {
      await createFlag({ name: newFlagName.trim(), isActive: true });
      setNewFlagName('');
      fetchFlags();
      toast.success('Flag created successfully!');
    } catch {
      toast.error('Failed to create flag');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveChanges = async () => {
    setSavingOrder(true);
    try {
      const flagIds = items.map((item) => item._id);
      await updateFlagPositions(flagIds);
      fetchFlags();
      toast.success('Flag order updated successfully!');
    } catch {
      toast.error('Failed to update flag order.');
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={' Flags Management'}
        action={'Create, edit, reorder and manage product flags.'}
      />

      <Card>
        <CardHeader>
          <CardTitle>Create New Flag</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              value={newFlagName}
              onChange={(e) => setNewFlagName(e.target.value)}
              placeholder="Enter flag name"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFlag()}
              className="max-w-sm"
            />
            <Button onClick={handleCreateFlag} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="size-4 mr-1" />
                  Create Flag
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Flags</CardTitle>
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveChanges}
                disabled={savingOrder}
              >
                {savingOrder ? (
                  <>
                    <Loader2 className="size-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Order'
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading && items.length === 0 ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-5 rounded" />
                  <Skeleton className="h-5 flex-1" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {error && (
                <p className="text-sm text-destructive mb-4">Error: {error}</p>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((i) => i._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1.5">
                    {items.map((flag) => (
                      <SortableFlag
                        key={flag._id}
                        flag={flag}
                        onUpdate={updateFlag}
                        onDelete={deleteFlag}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {items.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No flags created yet.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FlagsComponent;
