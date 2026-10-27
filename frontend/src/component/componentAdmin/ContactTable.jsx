import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import useAuthAdminStore from '../../store/AuthAdminStore.js';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const columns = [
  { id: 'serialNumber', label: 'S.No.' },
  { id: 'fullName', label: 'Name' },
  { id: 'phoneNumber', label: 'Phone Number' },
  { id: 'emailAddress', label: 'Email Address' },
  { id: 'message', label: 'Message', className: 'max-w-[270px]' },
  { id: 'served', label: 'Status' },
  { id: 'actions', label: 'Actions' },
];

const ContactTable = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(30);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${apiUrl}/contacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch contacts');

        const data = await response.json();
        const sortedData = (data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setContacts(sortedData);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [apiUrl, token]);

  const handleDelete = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${apiUrl}/contacts/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete contact');
      setContacts((prev) => prev.filter((contact) => contact._id !== deleteId));
      toast.success('Contact deleted successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleToggleServed = async (id) => {
    if (!token) return toast.error('Unauthorized request');

    const contact = contacts.find((c) => c._id === id);
    if (!contact) return;

    const updatedContact = { ...contact, served: !contact.served };

    try {
      const response = await fetch(`${apiUrl}/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedContact),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setContacts((prev) =>
        prev.map((c) => (c._id === id ? updatedContact : c)),
      );
      toast.success(
        `Contact marked as ${updatedContact.served ? 'served' : 'pending'}`,
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  const pageCount = Math.ceil(contacts.length / rowsPerPage);
  const paginated = contacts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title={'Contact Requests'}
        description={`${contacts.length} total messages`}
      />

      <Card className="shadow-md border-0">
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
                    {columns.map((col) => (
                      <TableHead key={col.id}>{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        No contacts available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((contact, index) => (
                      <TableRow key={contact._id}>
                        <TableCell className="text-muted-foreground">
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {contact.fullName}
                        </TableCell>
                        <TableCell>{contact.phoneNumber}</TableCell>
                        <TableCell>{contact.emailAddress}</TableCell>
                        <TableCell className="max-w-[270px] truncate">
                          {contact.message}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={contact.served ? 'default' : 'secondary'}
                            size="sm"
                            onClick={() => handleToggleServed(contact._id)}
                          >
                            {contact.served ? 'Served' : 'Pending'}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              setDeleteId(contact._id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {contacts.length > rowsPerPage && (
                <div className="flex items-center justify-between border-t border-muted-foreground/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Rows per page:
                    </p>
                    <Select
                      value={String(rowsPerPage)}
                      onValueChange={(value) => {
                        setRowsPerPage(Number(value));
                        setPage(0);
                      }}
                    >
                      <SelectTrigger className="h-8 w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 30, 50, 100].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Page {page + 1} of {pageCount}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot
              be undone.
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

export default ContactTable;
