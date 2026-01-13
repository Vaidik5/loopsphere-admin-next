'use client';

import { useEffect, useState, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { LoaderCircleIcon } from 'lucide-react';
import { getAuth } from '@/lib/auth-helpers';
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
import { useDataStore, useUserStore } from '@/stores';

const UserEditForm = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  // Zustand stores
  const {
    countries,
    filteredCountries,
    countriesLoading,
    fetchCountries,
    filterCountries,
    clients,
    clientsLoading,
    roles,
    rolesLoading,
    fetchRoles,
    fetchClients,
    getBusinessUnits,
    fetchBusinessUnits,
    businessUnitsCache,
    businessUnitsLoading,
  } = useDataStore();

  const selectedUser = useUserStore((state) => state.selectedUser);
  const users = useUserStore((state) => state.users);
  const fetchUserById = useUserStore((state) => state.fetchUserById);
  const updateUser = useUserStore((state) => state.updateUser);
  const usersLoading = useUserStore((state) => state.usersLoading);
  const clearSelectedUser = useUserStore((state) => state.clearSelectedUser);

  const [countrySearch, setCountrySearch] = useState('');
  const [selectIsdOpen, setSelectIsdOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<ImageInputFiles>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Helper to extract ID from string or object
  const resolveId = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val._id || val.id || '';
  };

  const form = useForm<UserEditSchemaType>({
    resolver: zodResolver(UserEditSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
  
      mobileNumber: '',
      isdCode: '',
      countryId: '',
      isdCodeCountryId: '',
      roleId: '',
      status: '',
      clientId: '',
      businessUnitId: '',
      image: null,
    },
    mode: 'onSubmit',
  });

  const clientId = form.watch('clientId');
  const businessUnitId = form.watch('businessUnitId');
  
  // Merge current user's BU if missing from list (to handle inactive/deleted BUs strictly for display)
  const businessUnits = useMemo(() => {
    // Determine the list based on selected client
    const cached = (clientId && businessUnitsCache[clientId]) ? [...businessUnitsCache[clientId]] : [];
    
    // If no specific BU selected yet, just return the list
    if (!businessUnitId) return cached;
    
    // Check if the currently selected BU ID is already in the list
    const isPresent = cached.some((bu: any) => (bu.id || bu._id) === businessUnitId);
    if (isPresent) return cached;

    // --- FALLBACK INJECTION LOGIC ---
    // The selected BU is NOT in the list. We need to find its name and inject it.
    
    let injectedName = '';
    const adminData = selectedUser as any;

    // 1. Try to find name in the current user object
    if (adminData) {
        // Direct object check
        if (adminData.businessUnit && (adminData.businessUnit._id === businessUnitId || adminData.businessUnit.id === businessUnitId)) {
             injectedName = adminData.businessUnit.name;
        } 
        // ID match check
        else if (adminData.businessUnitId === businessUnitId && adminData.businessUnit?.name) {
             injectedName = adminData.businessUnit.name;
        }
    }

    // 2. Try to find name in the global users list (if loaded)
    if (!injectedName && users.length > 0) {
        const foundUser = users.find((u: any) => 
            ((u.businessUnit && (u.businessUnit._id === businessUnitId || u.businessUnit.id === businessUnitId)) ||
             (u.businessUnitId === businessUnitId))
        );
        if (foundUser && (foundUser as any).businessUnit?.name) {
             injectedName = (foundUser as any).businessUnit.name;
        }
    }

    // 3. Fallback: Check if it exists in cache under a DIFFERENT client (edge case)
    if (!injectedName) {
         Object.values(businessUnitsCache).forEach((buList) => {
             const found = buList.find((bu: any) => (bu.id || bu._id) === businessUnitId);
             if (found) injectedName = found.name;
         });
    }

    // If we found a name, inject it
    if (injectedName) {
        return [{ id: businessUnitId, name: injectedName }, ...cached];
    } else {
        // Last Resort: Inject with "Unknown Business Unit" or just ID so it's selected but with ugly label?
        // Better to wait or leave it. But for now, let's try to inject IF we have matches
    }

    return cached;
  }, [clientId, businessUnitId, businessUnitsCache, selectedUser, users]);

  // Fetch initial data (Lists)
  useEffect(() => {
    if (countries.length === 0 && !countriesLoading) fetchCountries();
    if (clients.length === 0 && !clientsLoading) fetchClients();
    if (roles.length === 0 && !rolesLoading) fetchRoles();
  }, [countries.length, clients.length, roles.length, fetchCountries, fetchClients, fetchRoles]);

  // Combined data loading effect
  useEffect(() => {
    const initData = async () => {
        if (!userId) return;

        // 1. Fetch User (wait for it)
        await fetchUserById(userId);
        const user = useUserStore.getState().selectedUser;
        
        if (user) {
            const adminData = user as any;
            
             // Helper to extract ID inside effect
             const resolveId = (val: any) => {
                if (!val) return '';
                if (typeof val === 'string') return val;
                return val._id || val.id || '';
             };

            const clientId = adminData.clientId || resolveId(adminData.client);
            
            // 2. Fetch Business Units (wait for it)
            if (clientId) {
                await fetchBusinessUnits(clientId);
            }

            // 3. Resolve other IDs
            const rawIsdCode = adminData.isdCode || '';
            const cleanIsdCode = rawIsdCode.replace(/^\+/, '');
            
            let countryId = adminData.countryId || resolveId(adminData.isdCodeCountry);

            // If we have ISD code but no country ID, try to find the country
            if (cleanIsdCode && !countryId && countries.length > 0) {
                const matchedCountry = countries.find(c => c.isdCode === cleanIsdCode);
                if (matchedCountry) {
                    countryId = matchedCountry._id;
                }
            }

            let roleId = resolveId(adminData.role);

            // If roleId appears to be a name (not in roles list as ID), try to look it up
            if (roles.length > 0 && roleId) {
                const isId = roles.some(r => r._id === roleId);
                if (!isId) {
                    const roleByName = roles.find(r => r.name.toLowerCase() === roleId.toLowerCase());
                    if (roleByName) {
                        roleId = roleByName._id;
                    }
                }
            }

            const businessUnitId = adminData.businessUnitId || resolveId(adminData.businessUnit);

            // 4. Reset form (using setTimeout to ensure render cycle)
            setTimeout(() => {
                form.reset({
                    firstName: adminData.firstName || '',
                    lastName: adminData.lastName || '',
                    email: adminData.email || '',
                    mobileNumber: adminData.mobileNumber || '',
                    isdCode: cleanIsdCode,
                    countryId: countryId || '',
                    isdCodeCountryId: adminData.isdCodeCountryId || resolveId(adminData.isdCodeCountry) || countryId || '',
                    roleId: roleId,
                    status: typeof adminData.status === 'object' ? adminData.status.code : adminData.status || '',
                    clientId: clientId,
                    businessUnitId: businessUnitId,
                    image: null,
                });

                 // Determine image
                 if (adminData.image) {
                    let imageUrl = '';
                    if (typeof adminData.image === 'string') {
                    imageUrl = adminData.image;
                    } else if (typeof adminData.image === 'object' && adminData.image) {
                        imageUrl = adminData.image.url || adminData.image.fileName || '';
                    }
                    if (imageUrl) {
                        setImageFiles([{ dataURL: imageUrl }]);
                    }
                }
                
                // Ensure filteredCountries
                if (filteredCountries.length === 0 && countries.length > 0) {
                    useDataStore.getState().setFilteredCountries(countries);
                }

                setIsDataLoaded(true);
            }, 0);
        }
    };

    // Only run when userId changes (initial load or navigation)
    // We depend on fetchUserById/fetchBusinessUnits which are stable from store
    // We might need to ensure lists are loaded too, but lists loading effect runs in parallel.
    // If lists arrive LATER than user, the IDs might be weird but `reset` sets values.
    // `Select` components will display values when options appear (reactive).
    // The critical part is `fetchBusinessUnits` which is specific to the user's client.
    
    // Check if we are ready to init
    if (clients.length > 0 && roles.length > 0) {
        initData();
    }
    
  }, [userId, clients.length, roles.length]); 

  // Removed separate effects for fetchUserById and populateForm to avoid race conditions


  // Filter countries
  useEffect(() => {
    if (selectIsdOpen && countrySearch) {
      filterCountries(countrySearch);
    } else if (!countrySearch && countries.length > 0) {
      useDataStore.getState().setFilteredCountries(countries);
    }
  }, [countrySearch, selectIsdOpen, countries, filterCountries]);


  const handleClientChange = async (selectedClientId: string) => {
    form.setValue('clientId', selectedClientId);
    form.setValue('businessUnitId', '');
    if (selectedClientId) {
      await fetchBusinessUnits(selectedClientId);
    }
  };

  const handleCountryChange = (value: string) => {
    const [isdCode, countryId] = value.split('|');
    form.setValue('isdCode', isdCode);
    form.setValue('countryId', countryId);
    form.setValue('isdCodeCountryId', countryId);
  };

  const onSubmit = async (data: UserEditSchemaType) => {
    const formData = new FormData();
    const auth = getAuth();
    const token = auth?.api_token || "";

    if (token) {
        formData.append('token', token);
    }

    formData.append('id', userId);
    
    const formattedIsdCode = data.isdCode.startsWith('+')
      ? data.isdCode.slice(1)
      : data.isdCode;

    // Ensure all required fields are string
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('isdCode', formattedIsdCode);
    formData.append('countryId', data.countryId);
    formData.append('mobileNumber', data.mobileNumber);
    
    // Explicitly handle password update validation
  
    
    formData.append('clientId', data.clientId);
    formData.append('businessUnitId', data.businessUnitId);
    formData.append('roleId', data.roleId);
    formData.append('isdCodeCountryId', data.isdCodeCountryId);
    formData.append('status', data.status);

    if (imageFiles.length > 0 && imageFiles[0]?.file) {
      formData.append('image', imageFiles[0].file);
    }

    const result = await updateUser(userId, formData);
    
    if (result.success) {
      toast.success(result.message || 'User updated successfully');
      router.push('/users');
    } else {
      toast.error(result.message || 'Failed to update user');
    }
  };

  const selectedCountry = filteredCountries.find(
    (c) => c.isdCode === form.watch('isdCode') && c._id === form.watch('countryId')
  );

  const isLoading = usersLoading || !isDataLoaded;

  if (isLoading && !selectedUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderCircleIcon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:gap-7.5">
     
      <div className="border mt-5 grid gap-5 lg:gap-9.5 card  rounded-xl p-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Client */}
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
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
                  </FormItem>
                )}
              />

              {/* Business Unit */}
              <FormField
                control={form.control}
                name="businessUnitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Unit</FormLabel>
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      disabled={!form.watch('clientId')}
                      key={`${field.value}-${businessUnits.length}`} // Force re-render when list or value changes
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
                  </FormItem>
                )}
              />

            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First Name <span className="text-red-500">*</span>
                  </FormLabel>
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
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last Name <span className="text-red-500">*</span>
                  </FormLabel>
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
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            {/* <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password (only if changing)"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* Mobile Number */}
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mobile Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="w-full flex gap-2">
                    <Select
                      value={`${form.watch('isdCode')}|${form.watch('countryId')}`}
                      onOpenChange={(open) => {
                        setSelectIsdOpen(open);
                        if (!open) {
                          setCountrySearch('');
                          useDataStore.getState().setFilteredCountries(countries);
                        }
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
                            onChange={(e) => {
                              const search = e.target.value;
                              setCountrySearch(search);
                              if (search) {
                                filterCountries(search);
                              } else {
                                useDataStore.getState().setFilteredCountries(countries);
                              }
                            }}
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
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Role <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select value={field.value || ''} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role._id} value={role._id}>
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Status <span className="text-red-500">*</span>
                  </FormLabel>
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
                </FormItem>
              )}
            />
            </div>

            <div className="text-end">
                <Button
                              type="button"
                              disabled={isLoading || form.formState.isSubmitting}
                              variant="outline"
                              // className="btn ms-2 bg-white-600 hover:bg-black-100 text-black shadow-md border-gray-300 border-solid border-2"
                              onClick={() => router.back()}
                            >
                             
                            Cancel
                            
                </Button>
              
              <Button
                type="submit"
                disabled={usersLoading || form.formState.isSubmitting}
                className="btn btn-primary ms-2"
              >
                {(usersLoading || form.formState.isSubmitting) ? (
                  <div className="flex items-center gap-2">
                    <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit'
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
