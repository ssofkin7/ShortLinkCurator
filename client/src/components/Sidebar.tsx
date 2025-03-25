import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import SubscriptionModal from "./SubscriptionModal";
import CustomTabsList from "./CustomTabsList";
import ProfileModal from "./ProfileModal";

interface SidebarProps {
  user: User | undefined;
  isLoading: boolean;
}

const CustomSidebar = ({ user, isLoading }: SidebarProps) => {
  const [location, setLocation] = useLocation();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [activeCustomTab, setActiveCustomTab] = useState<string>("");
  
  // Get link count
  const { data: links = [] } = useQuery<any[]>({
    queryKey: ["/api/links"],
  });
  
  const linkCount = links.length;
  const linkLimit = 50;
  const linkPercentage = Math.min(100, (linkCount / linkLimit) * 100);

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-5 h-screen sticky top-0">
        <div className="flex items-center gap-2 mb-8">
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
        
        <nav className="space-y-1.5">
          <Link href="/">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${location === '/' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Home</span>
            </div>
          </Link>
          <Link href="/library">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${location === '/library' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              <span>Library</span>
            </div>
          </Link>
          <Link href="/tags">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${location === '/tags' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                <path d="M7 7h.01"></path>
              </svg>
              <span>Tags</span>
            </div>
          </Link>
          <Link href="/analytics">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${location === '/analytics' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-100'} cursor-pointer`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"></path>
                <path d="m19 9-5 5-4-4-3 3"></path>
              </svg>
              <span>Analytics</span>
            </div>
          </Link>
          
          {/* Custom Tabs Section - Always rendered but displays appropriate message if not authenticated */}
          <div className="mt-4">
            <CustomTabsList
              activeTab={activeCustomTab || 'all'} 
              onTabChange={(tabId) => {
                setActiveCustomTab(tabId);
                
                // Create a custom event to notify LibraryPage about tab change
                const tabChangeEvent = new CustomEvent('customTabChange', { 
                  detail: { tabId }
                });
                window.dispatchEvent(tabChangeEvent);
                
                // If we're not already on the library page, navigate there
                if (location !== '/library') {
                  setLocation('/library');
                }
              }}
            />
          </div>
        </nav>
        
        <div className="mt-auto">
          <div className="rounded-lg bg-gray-50 p-3.5 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-5 w-5 bg-indigo-500 rounded-md flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </div>
              <span className="font-medium">Free Plan</span>
            </div>
            <Progress value={linkPercentage} className="h-1.5 mb-2" />
            <p className="text-xs text-gray-500 mt-2">
              {linkCount}/{linkLimit} links used
            </p>
            <Button 
              variant="link" 
              onClick={() => setShowSubscriptionModal(true)}
              className="mt-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 p-0 h-auto"
            >
              Upgrade to Pro
            </Button>
          </div>
          
          <div className="flex items-center gap-3 mt-4 px-3 py-2.5">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </>
            ) : user ? (
              <>
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold overflow-hidden">
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
                <Link href="/profile">
                  <div className="flex-1 cursor-pointer hover:underline">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </Link>
              </>
            ) : (
              <Link href="/">
                <div>
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </div>
              </Link>
            )}
          </div>
        </div>
      </aside>

      {showSubscriptionModal && (
        <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}
    </>
  );
};

export default CustomSidebar;
