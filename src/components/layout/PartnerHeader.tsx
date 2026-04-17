"use client";

import { Search, Bell, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useLogout } from "@/hooks/useAuth";
import Link from "next/link";

export function PartnerHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();

  // console.log("user-data", user);

  const userName = user?.data?.name;
  const userEmail = user?.data?.email;
  const userInitials = user?.data?.name?.substring(0, 2).toUpperCase();

  return (
    <header className="h-16 bg-background border-b border-border sticky top-0 z-40">
      <div className="h-full flex items-center justify-between px-3 sm:px-4 lg:px-6 gap-2 sm:gap-4">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-2">
          {/* Burger */}
          <button className="lg:hidden p-2" onClick={onMenuClick}>
            ☰
          </button>
        </div>

        {/* SEARCH (adaptive) */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 bg-input border-border placeholder:text-muted-foreground w-full"
            />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Search button (hide on mobile) */}
          <Button
            variant="default"
            className="hidden md:inline-flex my-button rounded-full px-4 lg:px-6"
          >
            Search
          </Button>

          {/* Help (hide on very small screens) */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hidden sm:flex"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 my-button rounded-full" />
          </Button>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:my-button"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={userName} />
                  <AvatarFallback className="my-button text-primary-foreground text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>

                {/* Hide text on small screens */}
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/marketplace/profile">Profile Setting</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Change Password</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive flex items-center gap-2"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
