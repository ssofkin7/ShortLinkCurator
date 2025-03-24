import { useState } from "react";
import { User } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

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
          
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg bg-gray-100 text-gray-600 relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
            <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
          </Button>
          
          {user ? (
            <div 
              className="h-9 w-9 rounded-lg md:hidden bg-blue-100 flex items-center justify-center text-blue-600 font-semibold cursor-pointer"
              onClick={handleLogout}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
          ) : (
            <Skeleton className="h-9 w-9 rounded-lg md:hidden" />
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
