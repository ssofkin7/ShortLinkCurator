import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FolderIcon } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CustomTabWithLinks } from "@shared/schema";
import CustomTabsList from "./CustomTabsList";
import { Separator } from "@/components/ui/separator";

interface MobileNavigationProps {
  onAddLinkClick: () => void;
}

const MobileNavigation = ({ onAddLinkClick }: MobileNavigationProps) => {
  const [location] = useLocation();
  const [activeCustomTab, setActiveCustomTab] = useState<string>("");
  const [showTabsSheet, setShowTabsSheet] = useState(false);

  // Query for custom tabs
  const { data: customTabs = [] } = useQuery<CustomTabWithLinks[]>({
    queryKey: ['/api/custom-tabs'],
  });

  const handleTabChange = (tabId: string) => {
    setActiveCustomTab(tabId);
    
    // Create a custom event to notify LibraryPage about tab change
    const tabChangeEvent = new CustomEvent('customTabChange', { 
      detail: { tabId }
    });
    window.dispatchEvent(tabChangeEvent);
    
    // Close the sheet after selecting a tab
    setShowTabsSheet(false);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around px-5 py-3 z-10">
        <Link href="/">
          <div className={`flex flex-col items-center ${location === '/' ? 'text-blue-600' : 'text-gray-500'} cursor-pointer`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lg">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span className="text-xs mt-1">Home</span>
          </div>
        </Link>
        
        <Link href="/library">
          <div className={`flex flex-col items-center ${location === '/library' ? 'text-blue-600' : 'text-gray-500'} cursor-pointer`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lg">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            <span className="text-xs mt-1">Library</span>
          </div>
        </Link>
        
        <div className="flex flex-col items-center">
          <Button 
            variant="default" 
            size="icon" 
            className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center -mt-5"
            onClick={onAddLinkClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
          </Button>
        </div>
        
        {/* Custom Tabs button shown only on library page */}
        {location === '/library' ? (
          <Sheet open={showTabsSheet} onOpenChange={setShowTabsSheet}>
            <SheetTrigger asChild>
              <div className="flex flex-col items-center text-gray-500 cursor-pointer">
                <FolderIcon className="w-[18px] h-[18px]" />
                <span className="text-xs mt-1">My Tabs</span>
              </div>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <div className="py-4">
                <h3 className="font-medium mb-4">Custom Tabs</h3>
                <CustomTabsList
                  activeTab={activeCustomTab || 'all'} 
                  onTabChange={handleTabChange}
                />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Link href="/tags">
            <div className={`flex flex-col items-center ${location === '/tags' ? 'text-blue-600' : 'text-gray-500'} cursor-pointer`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lg">
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
                <path d="M7 7h.01"></path>
              </svg>
              <span className="text-xs mt-1">Tags</span>
            </div>
          </Link>
        )}
        
        <Link href="/profile">
          <div className={`flex flex-col items-center ${location === '/profile' ? 'text-blue-600' : 'text-gray-500'} cursor-pointer`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-lg">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </div>
        </Link>
      </nav>
    </>
  );
};

export default MobileNavigation;
