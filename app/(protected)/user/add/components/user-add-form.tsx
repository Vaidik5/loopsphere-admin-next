'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { LoaderCircleIcon } from 'lucide-react';
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
import { ImageInput } from '@/components/image-input/image-input';
import { UserAddSchema, UserAddSchemaType } from '../forms/user-add-schema';
import { useDataStore, useUserFormStore, useUserStore } from '@/stores';

const UserAddForm = () => {
  const router = useRouter();
  
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
    businessUnitsLoading,
    fetchCurrentAdmin,
  } = useDataStore();

  const {
    countrySearch,
    selectIsdOpen,
    imageFiles,
    setCountrySearch,
    setSelectIsdOpen,
    setImageFiles,
    reset: resetFormStore,
  } = useUserFormStore();

  const { addUser, usersLoading } = useUserStore();

  const form = useForm<UserAddSchemaType>({
    resolver: zodResolver(UserAddSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      mobileNumber: '',
      isdCode: '',
      countryId: '',
      isdCodeCountryId: '',
      roleId: '',
      status: 'active',
      clientId: '',
      businessUnitId: '',
      image: null,
    },
    mode: 'onSubmit',
  });

  const clientId = form.watch('clientId');
  const businessUnits = clientId ? getBusinessUnits(clientId) : [];

  // Fetch initial data
  useEffect(() => {
    // Always fetch clients to ensure the list is up to date
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (countries.length === 0) {
      fetchCountries();
    }
    
    if (roles.length === 0) {
      fetchRoles();
    }
    fetchCurrentAdmin();
   
  }, [countries.length, fetchCountries, fetchCurrentAdmin]);

  // Filter countries when search changes
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

  const onSubmit = async (data: UserAddSchemaType) => {
    const formData = new FormData();

    const formattedIsdCode = data.isdCode.startsWith('+')
      ? data.isdCode.slice(1)
      : data.isdCode;

    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('isdCode', formattedIsdCode);
    formData.append('countryId', data.countryId);
    formData.append('isdCodeCountryId', data.isdCodeCountryId);
    formData.append('mobileNumber', data.mobileNumber);
    formData.append('clientId', data.clientId);
    formData.append('businessUnitId', data.businessUnitId);
    formData.append('roleId', data.roleId);
    formData.append('status', data.status);

    if (imageFiles.length > 0 && imageFiles[0]?.file) {
      formData.append('image', imageFiles[0].file);
    }

    const result = await addUser(formData);
    if (result.success) {
      toast.success(result.message || 'User added successfully');
      resetFormStore();
      form.reset();
      router.push('/users');
    } else {
      toast.error(result.message || 'Failed to add user');
    }
  };

  const selectedCountry = filteredCountries.find(
    (c) => c.isdCode === form.watch('isdCode') && c._id === form.watch('countryId')
  );

  const isLoading =usersLoading || countriesLoading || clientsLoading || businessUnitsLoading|| rolesLoading;

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
                      placeholder="Password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {
                        roles.map((role) => (
                          <SelectItem key={role._id} value={role._id}>
                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                          </SelectItem>
                        ))
                      }
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
                disabled={isLoading || form.formState.isSubmitting}
                className="btn btn-primary ms-2"
              >
                {isLoading || form.formState.isSubmitting ? (
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

export default UserAddForm;
