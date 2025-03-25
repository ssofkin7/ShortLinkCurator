import { useState } from "react";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import ProfileModal from "./ProfileModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TopBarProps {
  user: User | undefined;
}

interface Notification {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  time: string;
  read: boolean;
  iconBgColor: string;
  iconTextColor: string;
  action?: () => void;
}

const TopBar = ({ user }: TopBarProps) => {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Welcome to LinkOrbit!",
      description: "Start by adding your first link. Click the '+ Add Link' button to begin.",
      time: "Just now",
      read: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" />
          <path d="M8 12a4 4 0 0 1 8 0" />
          <path d="M18 12a6 6 0 0 0-12 0" />
        </svg>
      ),
      iconBgColor: "bg-indigo-100",
      iconTextColor: "text-indigo-600",
      action: () => setLocation("/")
    },
    {
      id: 2,
      title: "Create custom tabs",
      description: "Organize your links into custom collections. Try creating your first tab!",
      time: "Just now",
      read: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      iconBgColor: "bg-indigo-100", 
      iconTextColor: "text-indigo-600",
      action: () => setLocation("/library")
    },
    {
      id: 3,
      title: "AI-powered tagging",
      description: "Our AI automatically generates tags for your content to make organization easier.",
      time: "Just now",
      read: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      ),
      iconBgColor: "bg-purple-100",
      iconTextColor: "text-purple-600",
      action: () => setLocation("/tags")
    },
    {
      id: 4,
      title: "Complete your profile",
      description: "Add more information to your profile to personalize your experience.",
      time: "Just now",
      read: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      iconBgColor: "bg-green-100",
      iconTextColor: "text-green-600",
      action: () => {
        const profileButton = document.querySelector('[data-component="profileModal"]') as HTMLElement;
        if (profileButton) profileButton.click();
      }
    }
  ]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

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
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <circle cx="12" cy="12" r="8" />
              <path d="M8 12a4 4 0 0 1 8 0" />
              <path d="M18 12a6 6 0 0 0-12 0" />
              <path d="M16 8l-4 4-4-4" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">LinkOrbit</h1>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="flex items-center gap-3">
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg bg-gray-100 text-gray-600 relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-indigo-500 rounded-full"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount > 0 
                      ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                      : 'No new notifications'}
                  </p>
                </div>
                <div className="space-y-2">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${notification.read ? 'opacity-70' : ''}`}
                      onClick={() => {
                        // Mark as read first
                        markAsRead(notification.id);
                        // Then navigate
                        if (notification.action) {
                          // Close the popover first
                          const closeBtn = document.querySelector('[data-radix-popover-close]') as HTMLElement;
                          if (closeBtn) closeBtn.click();
                          // Give time for popover to close then navigate
                          setTimeout(() => notification.action!(), 100);
                        }
                      }}
                    >
                      <div className={`h-9 w-9 rounded-full ${notification.iconBgColor} flex items-center justify-center shrink-0`}>
                        <div className={notification.iconTextColor}>
                          {notification.icon}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="ml-auto h-2 w-2 bg-indigo-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {user ? (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9 rounded-lg bg-gray-100 text-gray-600"
              data-component="profileButton"
              onClick={() => setLocation('/profile')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </Button>
          ) : (
            <Skeleton className="h-9 w-9" />
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
