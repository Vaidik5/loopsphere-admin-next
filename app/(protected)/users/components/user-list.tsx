'use client';

import { useCallback, useMemo, useState } from 'react';
import { redirect } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table';
import { ChevronRight, Plus, Search, X } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { apiRequest } from '@/lib/api-request';
import { getInitials } from '@/lib/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, BadgeDot, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTable } from '@/components/ui/card';
import {
  DataGrid,
  DataGridApiFetchParams,
  DataGridApiResponse,
} from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from '@/app/models/user';
import UserInviteDialog from './user-add-dialog';
import { TeamsQueryApiResponse } from '@/types/adminUser';

const UserList = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
    const [refreshKey, setRefreshKey] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const ColumnFilter = <TData, TValue>({ column }: IColumnFilterProps<TData, TValue>) => {
    const [inputValue, setInputValue] = useState((column.getFilterValue() as string) ?? '');

    return <></>;
  };
  // Fetch users from the server API
  const fetchUsers = async ({
    pageIndex,
    pageSize,
    searchQuery,
  }: DataGridApiFetchParams): Promise<DataGridApiResponse<User>> => {
    const params = new URLSearchParams({
      page: String(pageIndex + 1),
      limit: String(pageSize),
      ...(searchQuery ? { query: searchQuery } : {}),
    });

    const response = await apiRequest<any>(
      'GET',
      `${API_ENDPOINTS.GET_ALL_ADMIN_USERS_LIST}?${params.toString()}`,
    );

    if (response.status !== 200) {
      throw new Error(
        'Oops! Something didn’t go as planned. Please try again in a moment.',
      );
    }

    const apiData = response.data;

    // Map the API response to DataGridApiResponse
    return {
      data: apiData.data || [],
      empty: !apiData.data || apiData.data.length === 0,
      pagination: {
        total: apiData.pagination?.totalRecords || 0,
        page: apiData.pagination?.currentPage || 1,
      },
    };
  };

  // Users query
  const { data, isLoading } = useQuery({
    queryKey: ['user-users', pagination, sorting, searchQuery],
    queryFn: () =>
      fetchUsers({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        searchQuery,
      }),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  const handleRowClick = (row: User) => {
    // Determine the ID to use. The new User interface has id and _id.
    // The API returns _id.
    const userId = row._id || row.id;
    if (userId) {
      redirect(`/users/${userId}`);
    }
  };
const handleRowSelection = (state: RowSelectionState) => {}; 
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Name"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const user = row.original;
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const fullName =
            `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`.trim();
          const displayName = fullName || user.name || 'User';

          let avatarUrl = user.avatar || null;
          if (
            user.image &&
            typeof user.image === 'object' &&
            user.image.fileName
          ) {
            avatarUrl = user.image.fileName;
          } else if (typeof user.image === 'string') {
            avatarUrl = user.image;
          }

          const initials = getInitials(displayName);

          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="font-medium text-sm">{displayName}</div>
            </div>
          );
        },
        size: 300,
        meta: {
          headerTitle: 'Name',
          skeleton: (
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ),
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: 'email',
        id: 'email',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Email"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          return <div className="text-sm">{row.original.email}</div>;
        },
        size: 250,
        meta: {
          headerTitle: 'Email',
          skeleton: <Skeleton className="w-28 h-7" />,
        },
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'mobileNumber',
        id: 'mobileNumber',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Mobile Number"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const user = row.original;
          const isd = user.isdCode
            ? `(+${user.isdCode.replace(/^\+/, '')}) `
            : '';
          const mobile = user.mobileNumber || '';
          return (
            <div className="text-sm">
              {isd}
              {mobile}
            </div>
          );
        },
        size: 200,
        meta: {
          headerTitle: 'Mobile Number',
          skeleton: <Skeleton className="w-28 h-7" />,
        },
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Status"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const user = row.original;
          // Handle status as object or string
          let statusCode = 'default';
          let statusLabel = '-';

          if (typeof user.status === 'object' && user.status) {
            statusCode = user.status.code;
            statusLabel = user.status.label || user.status.code;
          } else if (typeof user.status === 'string') {
            statusCode = user.status;
            statusLabel = user.status;
          }

          const statusColorMap: Record<
            string,
            NonNullable<BadgeProps['variant']>
          > = {
            active: 'success',
            inactive: 'destructive',
            pending: 'warning',
            deleted: 'destructive',
            default: 'secondary',
          };

          const variant = statusColorMap[statusCode] || 'secondary';

          return (
            <Badge variant={variant} appearance="ghost">
              <BadgeDot />
              {statusLabel}
            </Badge>
          );
        },
        size: 125,
        meta: {
          headerTitle: 'Status',
          skeleton: <Skeleton className="w-14 h-7" />,
        },
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        cell: () => (
          <ChevronRight className="text-muted-foreground/70 size-3.5" />
        ),
        meta: {
          skeleton: <Skeleton className="size-4" />,
        },
        size: 60,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
      },
    ],
    [],
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string),
  );
 const fetchTeams = useCallback(async (params: DataGridApiFetchParams) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(params.pageIndex + 1));
      queryParams.set('limit', String(params.pageSize));

      // Sorting
      if (params.sorting?.[0]?.id) {
        queryParams.set('sort', params.sorting[0].id);
        queryParams.set('order', params.sorting[0].desc ? 'desc' : 'asc');
      }

      // Search
      const queryFilter = params.filters?.find((filter: any) => filter.id === 'query') as
        | { id: string; value: string }
        | undefined;
      if (queryFilter?.value) {
        queryParams.set('search', queryFilter.value);
      }

      const response = await apiRequest<TeamsQueryApiResponse>(
        'GET',
        `${API_ENDPOINTS.GET_ALL_ADMIN_USERS_LIST}?${queryParams.toString()}`
      );

      if (response.status === 204) {
        return { data: [], totalCount: 0 };
      }

      return {
        data: response.data.data,
        totalCount: response.data.pagination.totalRecords
      };
    } catch (error) {
      console.error('API Error:', error);
      return { data: [], totalCount: 0 };
    }
  }, []);
  const table = useReactTable({
    columns,
    data: data?.data || [],
    pageCount: Math.ceil((data?.pagination.total || 0) / pagination.pageSize),
    getRowId: (row: User) => row._id || row.id,
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    columnResizeMode: 'onChange',
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const DataGridToolbar = ({ setSearchQuery }: { setSearchQuery: (query: string) => void }) => {
    const [inputValue, setInputValue] = useState(searchQuery);




    useEffect(() => {
      const handler = setTimeout(() => {
        setSearchQuery(inputValue);

        if (inputValue.trim() === '') {
          table.setColumnFilters(
            table.getState().columnFilters.filter((filter) => filter.id !== 'query')
          );
        } else {
          table.setColumnFilters([
            ...table.getState().columnFilters.filter((filter) => filter.id !== 'query'),
            { id: 'query', value: inputValue }
          ]);
        }
      }, 400);

      return () => clearTimeout(handler);
    }, [inputValue]);



       function debounce<F extends (...args: any[]) => void>(func: F, delay: number): F {
      let timer: ReturnType<typeof setTimeout>;
      return function (...args: any[]) {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
      } as F;
    }
    const debouncedSearch = useMemo(
      () =>
        debounce((value: string) => {
          setSearchQuery(value);

          if (value.trim() === '') {
            table.setColumnFilters(
              table.getState().columnFilters.filter((filter) => filter.id !== 'query')
            );
          } else {
            table.setColumnFilters([
              ...table.getState().columnFilters.filter((filter) => filter.id !== 'query'),
              { id: 'query', value }
            ]);
          }
        }, 500),
      [table]
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      debouncedSearch(value);
    };

    return (
      <CardHeader className="flex-col flex-wrap sm:flex-row items-stretch sm:items-center py-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search users"
              value={inputValue}
              onChange={handleChange}
              // onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
              className="ps-9 w-full sm:40 md:w-64"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Button
                mode="icon"
                variant="dim"
                className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <X />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button
            disabled={isLoading && true}
            onClick={() => {
              setInviteDialogOpen(true);
            }}
          >
            <Plus />
            Add Admin User
          </Button>
        </div>
      </CardHeader>
    );
  };

  return (
    <>
      <DataGrid
          key={refreshKey}
          columns={columns}
          serverSide={true}
          onFetchData={fetchTeams}
          rowSelection={true}
          getRowId={(row: any) => row.id}
          onRowSelectionChange={handleRowSelection}
          pagination={{ size: 10 }}
          toolbar={<DataGridToolbar setSearchQuery={setSearchQuery} />}
          layout={{ card: true }}
          refreshKey={refreshKey as any}
      >
        <Card>
          {/* <DataGridToolbar setSearchQuery={setSearchQuery} /> */}
          <CardTable>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      <UserInviteDialog
        open={inviteDialogOpen}
        closeDialog={() => setInviteDialogOpen(false)}
      />
    </>
  );
};

export default UserList;
