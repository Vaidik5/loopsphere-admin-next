'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircleIcon } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Demo1Layout } from '../components/layouts/layout';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <LoaderCircleIcon className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Demo1Layout>{children}</Demo1Layout>;
}
