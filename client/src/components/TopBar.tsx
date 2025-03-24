import { useState } from "react";
import { User } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TopBarProps {
  user: User | undefined;
}

const TopBar = ({ user }: TopBarProps) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center md:hidden gap-2">
          <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          <h1 className="text-xl font-semibold">LinkOrbit</h1>
        </div>
        
        <div className={`${searchVisible ? 'flex' : 'hidden'} md:block w-full max-w-md`}>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search links, tags, or content..."
              className="w-full pl-10 pr-4 py-2"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className={`md:hidden h-9 w-9 rounded-lg bg-gray-100 ${searchVisible ? 'text-blue-600' : 'text-gray-600'}`}
            onClick={() => setSearchVisible(!searchVisible)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg bg-gray-100 text-gray-600 relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
                <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    You have 2 unread notifications
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Your profile is ready</p>
                      <p className="text-xs text-gray-500">Customize your profile now to improve your experience.</p>
                      <p className="text-xs text-gray-400 mt-1">2 min ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <path d="M3 15h18" />
                        <path d="M3 9h18" />
                        <path d="M9 3v18" />
                        <path d="M15 3v18" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Check out our recommendations</p>
                      <p className="text-xs text-gray-500">We've curated some content you might like based on your preferences.</p>
                      <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Button size="sm" variant="outline" className="w-full">
                    View all notifications
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <div className="h-9 w-9 rounded-lg md:hidden bg-blue-100 flex items-center justify-center text-blue-600 font-semibold cursor-pointer overflow-hidden">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={`${user.username}'s avatar`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold overflow-hidden">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={`${user.username}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{user.username.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start font-normal"
                      onClick={() => setLocation("/profile")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Your Profile
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start font-normal"
                      onClick={handleLogout}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Logout
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Skeleton className="h-9 w-9 rounded-lg md:hidden" />
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
