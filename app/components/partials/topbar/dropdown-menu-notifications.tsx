'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import {
  Archive,
  Calendar,
  CheckSquare,
  Settings,
  Settings2,
  Shield,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Item1 from './notifications/item-1';
import Item2 from './notifications/item-2';
import Item3 from './notifications/item-3';
import Item4 from './notifications/item-4';
import Item5 from './notifications/item-5';
import Item6 from './notifications/item-6';
import Item7 from './notifications/item-7';
import Item8 from './notifications/item-8';
import Item9 from './notifications/item-9';
import Item10 from './notifications/item-10';
import Item11 from './notifications/item-11';
import Item12 from './notifications/item-12';
import Item13 from './notifications/item-13';
import Item15 from './notifications/item-15';
import Item16 from './notifications/item-16';
import Item17 from './notifications/item-17';

export function SheetNotifications({ trigger }: { trigger: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="p-0 sm:max-w-[500px]">
        <SheetHeader className="mb-0">
          <h3 className="text-base font-semibold p-3 text-gray-900">
            Notifications
          </h3>
        </SheetHeader>
        <SheetBody className="grow p-0">
          {/* <Tabs defaultValue="all" className="w-full relative">
            <TabsList variant="line" className="w-full px-5 mb-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="inbox" className="relative">
                Inbox
                <div className="w-1.5 h-1.5 rounded-full bg-success absolute top-1 -end-1" />
              </TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
              <div className="grow flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      mode="icon"
                      className="mb-1"
                    >
                      <Settings className="size-4.5!" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-44"
                    side="bottom"
                    align="end"
                  >
                    <DropdownMenuItem asChild>
                      <Link href="/account/members/teams">
                        <Users /> Invite Users
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Settings2 />
                        <span>Team Settings</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-44">
                          <DropdownMenuItem asChild>
                            <Link href="/account/members/import-members">
                              <Shield />
                              Find Members
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/account/members/import-members">
                              <Calendar /> Meetings
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/account/members/import-members">
                              <Shield /> Group Settings
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem asChild>
                      <Link href="/account/security/privacy-settings">
                        <Shield /> Group Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TabsList>

            {/* All Tab */}
                   </SheetBody>
        <SheetFooter className="border-t border-gray-100 p-5 grid grid-cols-2 gap-2.5">
          <Button variant="outline" size="sm">
            <Archive className="w-4 h-4" /> Archive all
          </Button>
          <Button variant="outline" size="sm">
            <CheckSquare className="w-4 h-4" /> Mark all as read
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
