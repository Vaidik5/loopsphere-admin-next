'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { apiRequest } from '@/lib/api-request';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User } from '@/app/models/user';
// import { useRoleSelectQuery } from '../../../roles/hooks/use-role-select-query';
import {
  UserProfileSchema,
  UserProfileSchemaType,
} from '../forms/user-profile-schema';

const UserProfileEditDialog = ({
  open,
  closeDialog,
  user,
}: {
  open: boolean;
  closeDialog: () => void;
  user: User;
}) => {
  const queryClient = useQueryClient();
  const [countries, setCountries] = useState<
    { name: string; isdCode: string; _id: string; flag?: string }[]
  >([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [businessUnits, setBusinessUnits] = useState<
    { id: string; name: string }[]
  >([]);

  // Fetch available roles
  // const { data: roleList } = useRoleSelectQuery();

  const form = useForm<UserProfileSchemaType>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      mobileNumber: '',
      isdCode: '',
      role: '',
      status: '',
      countryId: '',
      clientId: '',
      businessUnitId: '',
    },
    mode: 'onSubmit',
  });

  // Fetch initial data
  useEffect(() => {
    const fetchCommonData = async () => {
      try {
        // Countries
        const countryRes = await apiRequest<any>(
          'GET',
          API_ENDPOINTS.GET_ALL_COUNTRY,
        );
        if (countryRes.data?.success) {
          setCountries(countryRes.data.data);
        }
        // Clients
        const clientRes = await apiRequest<any>(
          'GET',
          API_ENDPOINTS.CLIENT_ACTIVE,
        );
        if (clientRes.data?.success) {
          const clientData = clientRes.data.data.map((c: any) => ({
            id: c._id,
            name:
              `${c.firstName} ${c.lastName}`.trim() ||
              c.companyName ||
              'Client',
          }));
          setClients(clientData);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (open) {
      fetchCommonData();
    }
  }, [open]);

  // Fetch Business Units when Client changes
  const handleClientChange = async (clientId: string) => {
    form.setValue('clientId', clientId);
    form.setValue('businessUnitId', '');
    try {
      const res = await apiRequest<any>(
        'GET',
        `${API_ENDPOINTS.BUSINESS_BY_CLIENT}/${clientId}`,
      );
      if (res.data?.success) {
        const buData = res.data.data.map((b: any) => ({
          id: b._id,
          name: b.name,
        }));
        setBusinessUnits(buData);
      } else {
        setBusinessUnits([]);
      }
    } catch (e) {
      console.error(e);
      setBusinessUnits([]);
    }
  };

  useEffect(() => {
    if (open && user) {
      // Set initial values
      form.reset({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ')[1] || '',
        email: user.email || '',
        password: '',
        mobileNumber: user.mobileNumber || '',
        isdCode: user.isdCode || '',
        role: user.role || (user as any).roleId || '',
        status:
          typeof user.status === 'object'
            ? user.status.code
            : user.status || '',
        countryId: (user as any).countryId || '',
        clientId: (user as any).clientId || '',
        businessUnitId: (user as any).businessUnitId || '',
      });

      // If user has client, fetch BUs (Mocking fetching flow, might need async handling)
      if ((user as any).clientId) {
        handleClientChange((user as any).clientId).then(() => {
          form.setValue('businessUnitId', (user as any).businessUnitId || '');
        });
      }
    }
  }, [open, user, form]);

  // Handle Country Change to set ISD Code
  const handleCountryChange = (countryId: string) => {
    const country = countries.find((c) => c._id === countryId);
    if (country) {
      form.setValue('countryId', countryId);
      form.setValue('isdCode', country.isdCode);
    }
  };

  const mutation = useMutation({
    mutationFn: async (values: UserProfileSchemaType) => {
      const formData = new FormData();
      formData.append('id', user.id || user._id || '');
      formData.append('firstName', values.firstName);
      formData.append('lastName', values.lastName);
      formData.append('email', values.email);
      if (values.password) {
        formData.append('password', values.password);
      }
      formData.append('mobileNumber', values.mobileNumber);

      const isd = values.isdCode?.replace(/^\+/, '') || '';
      formData.append('isdCode', isd);

      if (values.countryId) formData.append('countryId', values.countryId);
      if (values.clientId) formData.append('clientId', values.clientId);
      if (values.businessUnitId)
        formData.append('businessUnitId', values.businessUnitId);

      formData.append('role', values.role);

      // Handle status object or string
      const statusCode = values.status;
      formData.append('status', statusCode);

      if (values.image) {
        formData.append('image', values.image);
      }

      const response = await apiRequest<any>(
        'POST',
        API_ENDPOINTS.ADMIN_EDIT,
        formData,
        'multipart/form-data',
      );

      if (response.status !== 200 && response.status !== 201) {
        const msg = response.data?.message || 'Failed to update';
        throw new Error(msg);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-user'] }); // Invalidate list
      queryClient.invalidateQueries({ queryKey: ['user-user', user.id] });
      closeDialog();
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: UserProfileSchemaType) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Admin User</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={(val) => handleClientChange(val)}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessUnitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={!form.watch('clientId')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select BU" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessUnits.map((bu) => (
                          <SelectItem key={bu.id} value={bu.id}>
                            {bu.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      First Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Last Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password (only if changing)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-[140px_1fr] gap-4 items-end">
              <FormField
                control={form.control}
                name="countryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mobile Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={handleCountryChange}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="(+Code)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country._id} value={country._id}>
                            {country.flag ? (
                              <span className="mr-2">{country.flag}</span>
                            ) : (
                              ''
                            )}{' '}
                            (+{country.isdCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Role <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* {roleList?.map((role: any) => (
                        <SelectItem key={role._id || role.id} value={role._id || role.id}>
                          {role.name}
                        </SelectItem>
                      ))} */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Status <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <LoaderCircleIcon className="w-4 h-4 animate-spin mr-2" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileEditDialog;
