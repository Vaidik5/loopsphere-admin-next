'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiErrorWarningFill } from '@remixicon/react';
import { AlertCircle, Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
// Add this import at the top of the file
import { signIn, useAuth } from '@/providers/auth-provider';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/common/icons';
import { getSigninSchema, SigninSchemaType } from '../forms/signin-schema';
import { toAbsoluteUrl, getDeviceId, getDeviceName, getDeviceType, getOSVersion, getPushToken, getLocation } from '@/lib/helpers';
import Image from 'next/image';
export default function Page() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
    // console.log('User in Signin Page:', user);
  }, [user, isLoading, router]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load rememberMe preference and saved email from localStorage
  const getSavedCredentials = () => {
    if (typeof window === 'undefined') {
      return { email: 'contact@loopbots.com', password: 'Loopbots@123', rememberMe: false };
    }

    try {
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      const savedEmail = rememberMe ? localStorage.getItem('savedEmail') : null;

      return {
        email: savedEmail || 'contact@loopbots.com',
        password: 'Loopbots@123', // Never save password, always require user to enter
        rememberMe,
      };
    } catch (error) {
      return { email: 'contact@loopbots.com', password: 'Loopbots@123', rememberMe: false };
    }
  };

  const form = useForm<SigninSchemaType>({
    resolver: zodResolver(getSigninSchema()),
    defaultValues: getSavedCredentials(),
  });

  // Find the onSubmit function and replace it with this:
  async function onSubmit(values: SigninSchemaType) {
    setIsProcessing(true);
    setError(null);

    try {
      // Save email to localStorage if rememberMe is checked
      if (values.rememberMe) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('savedEmail', values.email);
          } catch (e) {
            console.error('Failed to save email', e);
          }
        }
      } else {
        // Remove saved email if rememberMe is unchecked
        if (typeof window !== 'undefined') {
          localStorage.removeItem('savedEmail');
        }
      }

      // Device/location helpers are provided by `@/lib/helpers`

    
      const deviceName = getDeviceName();
      const deviceId = getDeviceId();
      const deviceType = getDeviceType();
      const osVersion = getOSVersion();
      const pushToken = getPushToken();
      const location = await getLocation();

      const payload = {
        email: values.email,
        password: values.password,
        deviceName,
        deviceId,
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        deviceType,
        osVersion,
        pushToken,
        location,
      };

      // Use your custom auth instead of NextAuth
      // Pass rememberMe value to login function along with payload
      const success = await login(payload, values.rememberMe ?? false);

      if (success) {
        router.push('/');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.',
      );
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading || user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <LoaderCircleIcon className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="block w-full space-y-5"
      >
        <div className=" flex flex-col items-center justify-center">
        
          <Image
            src={toAbsoluteUrl('/media/app/default-logo.svg')}
            className="default-logo"
            alt="Default Logo"
            width={200}
            height={200}  
          />
       
        </div>

      

        {error && (
          <Alert variant="destructive">
            <AlertIcon>
              <AlertCircle />
            </AlertIcon>
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Your email" {...field} />
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
              <div className="flex justify-between items-center gap-2.5">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/reset-password"
                  className="text-sm font-semibold text-foreground text-primary hover:text-foreground/80"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  placeholder="Your password"
                  type={passwordVisible ? 'text' : 'password'}
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  onClick={() => setPasswordVisible(!passwordVisible)} // Toggle visibility
                  className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                  aria-label={
                    passwordVisible ? 'Hide password' : 'Show password'
                  }
                >
                  {passwordVisible ? (
                    <EyeOff className="text-muted-foreground" />
                  ) : (
                    <Eye className="text-muted-foreground" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <>
                <Checkbox
                  id="remember-me"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm leading-none text-muted-foreground"
                >
                  Remember me
                </label>
              </>
            )}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? (
              <LoaderCircleIcon className="size-4 animate-spin w-full h-full z-10" />
            ) : "Continue"}
            
          </Button>
        </div>
      </form>
    </Form>
  );
}
