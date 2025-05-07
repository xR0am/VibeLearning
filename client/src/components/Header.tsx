import { UserIcon, LogIn, Settings, LogOut, ShieldAlert, HelpCircle, Globe, FileText, CodeIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "./ThemeToggle";
import { Link } from "wouter";

export default function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <span className="text-primary text-3xl mr-2 flex items-center">
                  <CodeIcon className="h-8 w-8" />
                </span>
                <h1 className="text-2xl font-bold gradient-heading">DevCourse</h1>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/courses/public">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>Public Courses</span>
              </Button>
            </Link>
            <Link href="/how-to">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1">
                <HelpCircle className="h-4 w-4" />
                <span>How-To</span>
              </Button>
            </Link>
            <ThemeToggle />
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl} alt={user?.username} />
                      <AvatarFallback>
                        {user?.username ? user.username[0]?.toUpperCase() : <UserIcon className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'No email provided'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <div className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/courses/user">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>My Courses</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Admin link - only visible for admin user */}
                  {user?.id === "38352714" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <div className="flex items-center">
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          <span>Admin Settings</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => window.location.href = "/api/logout"}
                    className="text-red-600 dark:text-red-400"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => window.location.href = "/api/login"}
                variant="outline" 
                size="sm"
                className="ml-2"
              >
                <LogIn className="mr-2 h-4 w-4" />
                <span>Log in</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
