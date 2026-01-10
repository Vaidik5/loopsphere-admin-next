'use client';

import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { LoaderCircleIcon } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { apiRequest } from '@/lib/api-request';
import { Button } from '@/components/ui/button';
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
import { ImageInput, type ImageInputFiles } from '@/components/image-input/image-input';
import { UserEditSchema, UserEditSchemaType } from '../forms/user-edit-schema';

interface Country {
  _id: string;
  name: string;
  isdCode: string;
  flag?: string;
}

interface Client {
  _id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

interface BusinessUnit {
  _id: string;
  name: string;
}

const UserEditForm = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const queryClient = useQueryClient();
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectIsdOpen, setSelectIsdOpen] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [businessUnits, setBusinessUnits] = useState<{ id: string; name: string }[]>([]);
  const [imageFiles, setImageFiles] = useState<ImageInputFiles>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [originalValues, setOriginalValues] = useState({
    email: '',
    isdCode: '',
    countryId: '',
    mobileNumber: '',
  });

  const form = useForm<UserEditSchemaType>({
    resolver: zodResolver(UserEditSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      mobileNumber: '',
      isdCode: '',
      countryId: '',
      role: '',
      status: '',
      clientId: '',
      businessUnitId: '',
      image: null,
    },
    mode: 'onSubmit',
  });

  // Fetch countries
  const { data: countriesData } = useQuery({
    queryKey: ['countries-list'],
    queryFn: async () => {
      const response = await apiRequest<any>('GET', API_ENDPOINTS.GET_ALL_COUNTRY);
      if (response?.data?.success) {
        const allCountries = response.data.data.map((country: any) => ({
          ...country,
          flag: country.flag || '',
        }));
        setCountries(allCountries);
        setFilteredCountries(allCountries);
        return allCountries;
      }
      return [];
    },
  });

  // Fetch clients
  const { data: clientsData } = useQuery({
    queryKey: ['client-getActive'],
    queryFn: async () => {
      const response = await apiRequest<any>('GET', API_ENDPOINTS.PANAROMA_CLIENT_LIST);
      if (response?.data?.data) {
        const clientList = response.data.data.map((item: Client) => ({
          id: item._id,
          name: `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.companyName || 'Client',
        }));
        setClients(clientList);
        return clientList;
      }
      return [];
    },
  });

  // Fetch admin/me (to get current admin info if needed)
  useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => {
      const response = await apiRequest<any>('GET', API_ENDPOINTS.ADMIN_GET_USER);
      return response.data;
    },
  });

  // Fetch admin user by ID
  useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      if (!userId) return null;
      setDataLoading(true);
      try {
        const response = await apiRequest<any>('GET', `${API_ENDPOINTS.GET_BY_ID_ADMINS}/${userId}`);
        if (response?.data?.success) {
          const adminData = response.data.data;

          setOriginalValues({
            email: adminData.email || '',
            isdCode: adminData.isdCode || '',
            countryId: adminData.countryId || '',
            mobileNumber: adminData.mobileNumber || '',
          });

          // Fetch business units for the client
          if (adminData.clientId) {
            await fetchBusinessUnits(adminData.clientId);
          }

          // Set form values
          setTimeout(() => {
            form.reset({
              firstName: adminData.firstName || '',
              lastName: adminData.lastName || '',
              email: adminData.email || '',
              password: '',
              mobileNumber: adminData.mobileNumber || '',
              isdCode: adminData.isdCode || '',
              countryId: adminData.countryId || '',
              role: adminData.role || '',
              status: typeof adminData.status === 'object' ? adminData.status.code : adminData.status || '',
              clientId: adminData.clientId || '',
              businessUnitId: adminData.businessUnitId || '',
              image: null,
            });
          }, 0);

          // Set image if exists
          if (adminData.image) {
            const imageUrl = typeof adminData.image === 'string' 
              ? adminData.image 
              : (adminData.image as any)?.fileName || '';
            if (imageUrl) {
              setImageFiles([{ dataURL: imageUrl }]);
            }
          }

          return adminData;
        }
        return null;
      } catch (error) {
        toast.error('Failed to fetch admin user data');
        return null;
      } finally {
        setDataLoading(false);
      }
    },
    enabled: !!userId,
  });

  // Filter countries when search changes
  useEffect(() => {
    if (!selectIsdOpen) return;
    const search = countrySearch.toLowerCase();
    const filtered = countries.filter(
      (c) => c.name.toLowerCase().includes(search) || c.isdCode.includes(search)
    );
    setFilteredCountries(filtered);
  }, [countrySearch, countries, selectIsdOpen]);

  // Fetch business units when client changes
  const fetchBusinessUnits = async (clientId: string) => {
    if (!clientId) {
      setBusinessUnits([]);
      form.setValue('businessUnitId', '');
      return;
    }
    try {
      const response = await apiRequest<any>(
        'GET',
        `${API_ENDPOINTS.GET_BY_CLIENT_BUSINESS}/${clientId}`
      );
      if (response?.data?.data) {
        const buList = response.data.data.map((item: BusinessUnit) => ({
          id: item._id,
          name: item.name,
        }));
        setBusinessUnits(buList);
      } else {
        setBusinessUnits([]);
      }
    } catch (error) {
      console.error('Error fetching business units:', error);
      setBusinessUnits([]);
    }
  };

  const handleClientChange = (clientId: string) => {
    form.setValue('clientId', clientId);
    form.setValue('businessUnitId', '');
    fetchBusinessUnits(clientId);
  };

  const handleCountryChange = (value: string) => {
    const [isdCode, countryId] = value.split('|');
    form.setValue('isdCode', isdCode);
    form.setValue('countryId', countryId);
  };

  const mutation = useMutation({
    mutationFn: async (values: UserEditSchemaType) => {
      const formData = new FormData();

      formData.append('id', userId);

      const formattedIsdCode = values.isdCode.startsWith('+')
        ? values.isdCode.slice(1)
        : values.isdCode;
      const originalIsd = originalValues.isdCode.startsWith('+')
        ? originalValues.isdCode.slice(1)
        : originalValues.isdCode;

      // Email handling
      if (values.email !== originalValues.email) {
        formData.append('email', originalValues.email);
        formData.append('newEmail', values.email);
      } else {
        formData.append('email', values.email);
      }

      // ISD Code handling
      if (formattedIsdCode !== originalIsd) {
        formData.append('isdCode', originalIsd);
        formData.append('newIsdCode', formattedIsdCode);
      } else {
        formData.append('isdCode', formattedIsdCode);
      }

      // Country ID handling
      if (values.countryId !== originalValues.countryId) {
        formData.append('countryId', originalValues.countryId);
        formData.append('newCountryId', values.countryId);
      } else {
        formData.append('countryId', values.countryId);
      }

      // Mobile Number handling
      if (values.mobileNumber !== originalValues.mobileNumber) {
        formData.append('mobileNumber', originalValues.mobileNumber);
        formData.append('newMobileNumber', values.mobileNumber);
      } else {
        formData.append('mobileNumber', values.mobileNumber);
      }

      // Always send these
      formData.append('firstName', values.firstName);
      formData.append('lastName', values.lastName);
      if (values.password) {
        formData.append('password', values.password);
      }
      formData.append('clientId', values.clientId);
      formData.append('businessUnitId', values.businessUnitId);
      formData.append('role', values.role);
      formData.append('status', values.status);

      if (imageFiles.length > 0 && imageFiles[0]?.file) {
        formData.append('image', imageFiles[0].file);
      }

      const response = await apiRequest<any>(
        'POST',
        API_ENDPOINTS.EDIT_ADMIN_USERS,
        formData,
        'multipart/form-data'
      );

      if (!response?.data?.success) {
        const message = response?.data?.message || 'Failed to update user';
        throw new Error(message);
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      router.push('/users');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const onSubmit = (data: UserEditSchemaType) => {
    mutation.mutate(data);
  };

  const selectedCountry = filteredCountries.find(
    (c) => c.isdCode === form.watch('isdCode') && c._id === form.watch('countryId')
  );

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderCircleIcon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="mx-5 card p-3 border-b-2">
        <h3 className="card-title">Edit Admin User</h3>
      </div>
      <div className="mx-5 card card-body grid gap-y-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Profile Image Upload */}
            <div className="text-center">
              <div className="relative inline-block w-[100px] h-[100px]">
                <ImageInput
                  value={imageFiles}
                  onChange={(files) => {
                    setImageFiles(files);
                    if (files.length > 0 && files[0]?.file) {
                      form.setValue('image', files[0].file);
                    }
                  }}
                  acceptType={['image/jpg', 'image/jpeg', 'image/png', 'image/webp']}
                >
                  {({ fileList, onImageUpload, onImageRemove }) => (
                    <>
                      {fileList.length > 0 && fileList[0]?.dataURL ? (
                        <div className="relative">
                          <img
                            src={fileList[0].dataURL}
                            alt="Profile"
                            className="rounded-full w-[100px] h-[100px] object-contain border-2 border-gray shadow-md cursor-pointer"
                            onClick={onImageUpload}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              onImageRemove(0);
                              form.setValue('image', null);
                            }}
                            className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center bg-white text-black rounded-full shadow-md hover:bg-red-500 hover:text-white transition"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="avatar-upload"
                          className="cursor-pointer"
                          onClick={onImageUpload}
                        >
                          <div className="rounded-full w-[100px] h-[100px] border-2 border-gray shadow-md bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-500">Upload</span>
                          </div>
                        </label>
                      )}
                    </>
                  )}
                </ImageInput>
              </div>
            </div>

            {/* Client */}
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col sm:flex-row items-start sm:items-start gap-2.5">
                    <FormLabel className="w-56">Client</FormLabel>
                    <div className="w-full flex flex-col gap-2">
                      <Select
                        value={field.value || ''}
                        onValueChange={handleClientChange}
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
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Business Unit */}
            <FormField
              control={form.control}
              name="businessUnitId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <FormLabel className="w-56">Business Unit</FormLabel>
                    <div className="w-full flex flex-col gap-2">
                      <Select
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        disabled={!form.watch('clientId')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Business Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {businessUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col sm:flex-row items-start sm:items-start gap-2.5">
                    <FormLabel className="w-56">
                      First Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="w-full flex flex-col gap-2">
                      <FormControl>
                        <Input
                          placeholder="First Name"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^[a-zA-Z\s]*$/.test(value)) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col sm:flex-row items-start sm:items-start gap-2.5">
                    <FormLabel className="w-56">
                      Last Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="w-full flex flex-col gap-2">
                      <FormControl>
                        <Input
                          placeholder="Last Name"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^[a-zA-Z\s]*$/.test(value)) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col sm:flex-row items-start sm:items-start gap-2.5">
                    <FormLabel className="w-56">
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="w-full flex flex-col gap-2">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email"
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col sm:flex-row items-start sm:items-start gap-2.5">
                    <FormLabel className="w-56">Password</FormLabel>
                    <div className="w-full flex flex-col gap-2">
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Password (only if changing)"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Mobile Number */}
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col sm:flex-row items-start sm:items-start gap-2.5">
                    <FormLabel className="w-56">
                      Mobile Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="w-full flex flex-col gap-2">
                      <div className="w-full flex gap-2">
                        <Select
                          value={`${form.watch('isdCode')}|${form.watch('countryId')}`}
                          onOpenChange={(open) => {
                            setSelectIsdOpen(open);
                            if (!open) setCountrySearch('');
                          }}
                          onValueChange={handleCountryChange}
                        >
                          <FormControl>
                            <SelectTrigger className="w-40">
                              <SelectValue>
                                {selectedCountry ? (
                                  <div className="flex items-center gap-2">
                                    {selectedCountry.flag && (
                                      <img
                                        src={selectedCountry.flag}
                                        alt="flag"
                                        className="w-5 h-5 object-contain rounded-sm"
                                      />
                                    )}
                                    <span>(+{selectedCountry.isdCode})</span>
                                  </div>
                                ) : (
                                  'ISD'
                                )}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            <div className="p-2 sticky top-0 bg-white z-10">
                              <Input
                                type="text"
                                placeholder="Search..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            {filteredCountries.map((country) => (
                              <SelectItem
                                key={country._id}
                                value={`${country.isdCode}|${country._id}`}
                              >
                                <div className="flex items-center gap-2">
                                  {country.flag && (
                                    <img
                                      src={country.flag}
                                      alt={country.name}
                                      className="w-5 h-5 object-cover rounded-sm"
                                    />
                                  )}
                                  <span>(+{country.isdCode})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter your mobile number"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col sm:flex-row items-start sm:items-start gap-2.5">
                    <FormLabel className="min-w-[140px] sm:w-56">
                      Role <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="w-full flex flex-col gap-2">
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="superadmin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col sm:flex-row items-start sm:items-start gap-2.5">
                    <FormLabel className="min-w-[140px] sm:w-56">
                      Status <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="w-full flex flex-col gap-2">
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <div className="text-end">
              <Button
                type="submit"
                disabled={mutation.isPending || form.formState.isSubmitting}
                className="btn btn-primary"
              >
                {mutation.isPending || form.formState.isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UserEditForm;
