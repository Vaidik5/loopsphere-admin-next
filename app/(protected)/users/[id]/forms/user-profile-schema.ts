import { z } from 'zod';

export const UserProfileSchema = z.object({
  firstName: z.string().min(1,{ message: 'First name is required.' }),
  lastName: z.string().min(1,{ message: 'Last name is required.' }),
  email: z.string().email({ message: 'Valid email is required.' }),
  password: z.string().optional(),
  mobileNumber: z.string().min(1, { message: 'Mobile number is required.' }),
  isdCode: z.string().min(1, { message: 'ISD Code is required.' }),
  role: z.string().min(1, { message: 'Role is required.' }),
  status: z.string().min(1, { message: 'Status is required.' }),
  clientId: z.string().optional(),
  businessUnitId: z.string().optional(),
  countryId: z.string().min(1, { message: 'Country is required.' }),
  image: z.any().optional(),
});

export type UserProfileSchemaType = z.infer<typeof UserProfileSchema>;
