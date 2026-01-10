import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const uppercaseRegex = /[A-Z]/;

export const UserAddSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Valid email is required.' })
    .refine((val) => !uppercaseRegex.test(val), {
      message: 'Email must not contain uppercase letters.',
    }),
  password: z
    .string()
    .min(1, { message: 'Password is required.' })
    .min(6, { message: 'Password must be at least 6 characters.' }),
  mobileNumber: z
    .string()
    .min(1, { message: 'Mobile number is required.' })
    .regex(/^[0-9]{6,15}$/, {
      message: 'Mobile number must be between 6 to 15 digits.',
    }),
  isdCode: z.string().min(1, { message: 'ISD Code is required.' }),
  countryId: z.string().min(1, { message: 'Country is required.' }),
  role: z.string().min(1, { message: 'Role is required.' }),
  status: z
    .string()
    .min(1, { message: 'Status is required.' })
    .refine((val) => ['active', 'inactive', 'pending', 'suspended'].includes(val), {
      message: 'Please select a valid status.',
    }),
  clientId: z.string().min(1, { message: 'Client is required.' }),
  businessUnitId: z.string().min(1, { message: 'Business Unit is required.' }),
  image: z.any().optional(),
});

export type UserAddSchemaType = z.infer<typeof UserAddSchema>;
