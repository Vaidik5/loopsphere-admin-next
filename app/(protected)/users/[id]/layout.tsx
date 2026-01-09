'use client';

import React, { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Activity, MoveLeft, UserPen } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarTitle,
} from '@/components/common/toolbar';
import { UserProvider } from './components/user-context';
import UserHero from './components/user-hero';
import { apiRequest } from '@/lib/api-request';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { TeamsQueryApiResponse } from '@/types/adminUser';
import { DataGridRequestParams } from '@/components/ui/data-grid';
type NavRoutes = Record<
  string,
  {
    title: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    path: string;
  }
>;

export default function UserLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  // 1) Unwrap the params Promise
  const { id } = use(params);
  const pathname = usePathname();
  const router = useRouter();

  // Use local state to control active tab
  const [activeTab, setActiveTab] = useState<string>('');

  // Define your nav routes
  const navRoutes = useMemo<NavRoutes>(
    () => ({
      general: {
        title: 'Profile',
        icon: UserPen,
        path: `/users/${id}`,
      },
      logs: {
        title: 'Activity Logs',
        icon: Activity,
        path: `/users/${id}/logs`,
      },
    }),
    [id],
  );

  // Set initial active tab based on the pathname
  useEffect(() => {
    const found = Object.keys(navRoutes).find(
      (key) => pathname === navRoutes[key].path,
    );
    if (found) {
      setActiveTab(found);
    } else {
      setActiveTab('general');
    }
  }, [navRoutes, pathname]);

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await apiRequest('GET', `${API_ENDPOINTS.GET_BY_ID_ADMINS}/${id}`);
      return response.data;
    },
  });

  // const fetchTeams = useCallback(async (params: DataGridRequestParams) => {
  //   try {
  //     const queryParams = new URLSearchParams();
  //     queryParams.set('page', String(params.pageIndex + 1));
  //     queryParams.set('limit', String(params.pageSize));

  //     // Sorting
  //     if (params.sorting?.[0]?.id) {
  //       queryParams.set('sort', params.sorting[0].id);
  //       queryParams.set('order', params.sorting[0].desc ? 'desc' : 'asc');
  //     }

  //     // Search
  //     const queryFilter = params.columnFilters?.find((filter: any) => filter.id === 'query') as
  //       | { id: string; value: string }
  //       | undefined;
  //     if (queryFilter?.value) {
  //       queryParams.set('search', queryFilter.value);
  //     }

  //     const response = await apiRequest<TeamsQueryApiResponse>(
  //       'GET',
  //       `${API_ENDPOINTS.GET_ALL_ADMIN_USERS_LIST}?${queryParams.toString()}`
  //     );

  //     if (response.status === 204) {
  //       return { data: [], totalCount: 0 };
  //     }

  //     return {
  //       data: response.data.data,
  //       totalCount: response.data.pagination.totalRecords
  //     };
  //   } catch (error) {
  //     console.error('API Error:', error);
  //     return { data: [], totalCount: 0 };
  //   }
  // }, []);
  // Handler for tab click: instantly update active tab then navigate.
  const handleTabClick = (key: string, path: string) => {
    setActiveTab(key);
    // Optionally, you can prefetch or delay navigation slightly if needed
    router.push(path);
  };

  return (
    <UserProvider user={user} isLoading={isLoading}>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarTitle>User</ToolbarTitle>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Admin Management</BreadcrumbPage>
                </BreadcrumbItem>
             
              </BreadcrumbList>
            </Breadcrumb>
          </ToolbarHeading>
          <ToolbarActions>
            <Button asChild variant="outline">
              <Link href="/users">
                <MoveLeft /> Back to Admins
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
        <UserHero user={user} isLoading={isLoading} />
        <Tabs defaultValue={activeTab} value={activeTab}>
          <TabsList variant="line" className="mb-5">
            {Object.entries(navRoutes).map(
              ([key, { title, icon: Icon, path }]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  disabled={isLoading}
                  onClick={() => handleTabClick(key, path)}
                >
                  <Icon />
                  <span>{title}</span>
                </TabsTrigger>
              ),
            )}
          </TabsList>
        </Tabs>
        {children}
      </Container>
    </UserProvider>
  );
}
