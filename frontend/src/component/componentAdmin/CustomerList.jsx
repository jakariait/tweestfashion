import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
  Search,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import axios from 'axios';
import useAuthAdminStore from '../../store/AuthAdminStore';
import ImageComponent from '../componentGeneral/ImageComponent.jsx';
import { saveAs } from 'file-saver';
import RequirePermission from './RequirePermission.jsx';
import { SectionHeader } from '#component/componentAdmin/SectionHeader.jsx';

const CustomerList = () => {
  const { token } = useAuthAdminStore();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/getAllUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    const filtered = customers.filter(
      (cus) =>
        cus.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        cus.email?.toLowerCase().includes(search.toLowerCase()),
    );

    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredCustomers(sorted);
  }, [search, customers, sortOrder]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${apiUrl}/deleteUser/${selectedCustomerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCustomerId(null);
    }
  };

  const handleExportExcel = () => {
    const headers = [
      'SL No',
      'Name',
      'Email',
      'Phone',
      'Joined Date',
      'Deletion Requested',
      'Requested At',
    ];

    const escapeCsv = (field) => {
      if (field === null || field === undefined) return '';
      let str = String(field);
      str = str.replace(/"/g, '""');
      if (str.search(/("|,|\n)/g) >= 0) str = `"${str}"`;
      return str;
    };

    const csvHeader = headers.map(escapeCsv).join(',');
    const csvRows = filteredCustomers.map((cus, index) => {
      const row = [
        index + 1,
        cus.fullName || 'N/A',
        cus.email || 'N/A',
        cus.phone || 'N/A',
        cus.createdAt ? new Date(cus.createdAt).toLocaleDateString() : 'N/A',
        cus.accountDeletion?.requested ? 'Yes' : 'No',
        cus.accountDeletion?.requestedAt
          ? new Date(cus.accountDeletion.requestedAt).toLocaleString()
          : 'N/A',
      ];
      return row.map(escapeCsv).join(',');
    });

    const csvData = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'customers.csv');
  };

  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * limit,
    page * limit,
  );

  const totalPages = Math.ceil(filteredCustomers.length / limit);

  return (
    <div className="space-y-6">
      <SectionHeader title={'Customer List'} />

      <div className="flex items-center justify-between gap-4 bg-muted/30 rounded-lg p-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Show
            </p>
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-16 h-8 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">entries</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[130px] h-8 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <Button variant="outline" onClick={handleExportExcel}>
          <Download className="size-4 mr-1" />
          Download As CSV
        </Button>
      </div>

      <Card className="shadow-md border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">SL No.</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="hidden md:table-cell">
                  Reward Points
                </TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead>Account Deletion</TableHead>
                <RequirePermission
                  permission="delete_customers"
                  fallback={true}
                >
                  <TableHead className="text-center w-16">Action</TableHead>
                </RequirePermission>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground py-8"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((cus, index) => (
                  <TableRow key={cus._id}>
                    <TableCell className="text-muted-foreground">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell>
                      {cus.userImage ? (
                        <ImageComponent
                          imageName={cus.userImage}
                          altName={cus.fullName}
                          skeletonHeight={40}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {cus.fullName || 'N/A'}
                    </TableCell>
                    <TableCell>{cus.email || 'N/A'}</TableCell>
                    <TableCell>{cus.phone || 'N/A'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {cus.address || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {cus.rewardPoints}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {cus.createdAt
                        ? new Date(cus.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {cus.accountDeletion?.requested ? (
                        <span className="text-destructive text-sm font-medium">
                          Requested{' '}
                          {new Date(
                            cus.accountDeletion.requestedAt,
                          ).toLocaleString()}
                        </span>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                    <RequirePermission
                      permission="delete_customers"
                      fallback={true}
                    >
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setSelectedCustomerId(cus._id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </TableCell>
                    </RequirePermission>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot
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

export default CustomerList;
