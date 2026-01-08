import { ReactNode } from 'react';
import Link from 'next/link';
import { I18N_LANGUAGES, Language } from '@/i18n/config';
import {
  BetweenHorizontalStart,
  Coffee,
  CreditCard,
  FileText,
  Globe,
  Moon,
  Settings,
  Shield,
  User,
  UserCircle,
  Users,
} from 'lucide-react';
import { signOut, useSession } from '@/providers/auth-provider';
import { useTheme } from 'next-themes';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useLanguage } from '@/providers/i18n-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import useAuth from '@/providers/auth-provider';

export function DropdownMenuUser({ trigger }: { trigger: ReactNode }) {
  const { data: session } = useSession();
  const { changeLanguage, language } = useLanguage();
  const { theme, setTheme } = useTheme();
const { user } = useAuth();
 

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <img
              className="w-9 h-9 rounded-full border border-border"
              src={user?.avatar.fileName || toAbsoluteUrl('/media/avatars/300-1.jpg')}
              alt="User avatar"
            />
            <div className="flex flex-col">
              <p
                // href="/account/home/get-started"
                className="text-sm text-mono hover:text-primary font-semibold"
              >
                {session?.user?.name || ''}
              </p>
              <Link
                href="mailto:c.fisher@gmail.com"
                className="text-xs text-muted-foreground hover:text-primary"
              >
                {session?.user?.email || ''}
              </Link>
            </div>
          </div>
          {/* <Badge variant="primary" appearance="light" size="sm">
            Pro
          </Badge> */}
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        {/* <DropdownMenuItem asChild>
       
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/account/home/user-profile"
            className="flex items-center gap-2"
          >
            <User />
            My Profile
          </Link>
        </DropdownMenuItem> */}

        {/* My Account Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            <Settings />
            My Account
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem asChild>
              <Link
                href="/account/home/get-started"
                className="flex items-center gap-2"
              >
                <Coffee />
                Get Started
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/account/home/user-profile"
                className="flex items-center gap-2"
              >
                <FileText />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/account/billing/basic"
                className="flex items-center gap-2"
              >
                <CreditCard />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/account/security/overview"
                className="flex items-center gap-2"
              >
                <Shield />
                Security
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/account/members/teams"
                className="flex items-center gap-2"
              >
                <Users />
                Members & Roles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/account/integrations"
                className="flex items-center gap-2"
              >
                <BetweenHorizontalStart />
                Integrations
              </Link>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem asChild>
          <Link
            href="https://devs.keenthemes.com"
            className="flex items-center gap-2"
          >
            <FileText />
            Dev Forum
          </Link>
        </DropdownMenuItem>

        {/* Language Submenu with Radio Group */}
        
        <DropdownMenuSeparator />

        {/* Footer */}
        <DropdownMenuItem
          className="flex items-center gap-2"
          onSelect={(event) => event.preventDefault()}
        >
          <Moon />
          <div className="flex items-center gap-2 justify-between grow">
            Dark Mode
            <Switch
              size="sm"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </DropdownMenuItem>
        <div className="p-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => signOut()}
          >
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
