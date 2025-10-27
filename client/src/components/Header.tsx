import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/RoleBadge";
import { Briefcase, ChevronDown } from "lucide-react";
import { UserRole } from "@shared/schema";

export function Header() {
  const { user, isAuthenticated } = useAuth();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1" data-testid="link-home">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">JobPortal</span>
        </Link>

        {isAuthenticated && user ? (
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover-elevate active-elevate-2 rounded-md px-3 py-2" data-testid="link-dashboard">
              Dashboard
            </Link>
            
            {user.role !== UserRole.SUPERADMIN && (
              <Link href="/jobs" className="text-sm font-medium hover-elevate active-elevate-2 rounded-md px-3 py-2" data-testid="link-jobs">
                Jobs
              </Link>
            )}

            {user.role === UserRole.APPLICANT && (
              <Link href="/my-applications" className="text-sm font-medium hover-elevate active-elevate-2 rounded-md px-3 py-2" data-testid="link-applications">
                My Applications
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} className="object-cover" />
                    <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.firstName || "User"}</span>
                  <RoleBadge role={user.role as any} />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === UserRole.APPLICANT && (
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full" data-testid="link-profile">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="w-full" data-testid="link-logout">
                    Log out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
