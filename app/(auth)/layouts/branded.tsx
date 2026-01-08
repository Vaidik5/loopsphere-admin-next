import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

export function BrandedLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shouldShowBackground =
    pathname?.endsWith('/signin') || pathname?.endsWith('/reset-password');

  return (
    <div
      className={
        'flex justify-center items-center min-h-screen w-full ' +
        (shouldShowBackground ? 'bg-cover bg-center' : '')
      }
      style={
        shouldShowBackground
          ? { backgroundImage: "url(/img/signinImg.webp)" }
          : undefined
      }
    >
      {shouldShowBackground && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      )}
      <Card
        className={
          'w-full max-w-[400px] mx-4 ' +
          (shouldShowBackground ? 'relative z-10' : '')
        }
      >
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </div>
  );
}
