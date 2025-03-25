import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LinkWithTags, CustomTabWithLinks } from "@shared/schema";
import CustomSidebar from "@/components/Sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/TopBar";
import ContentItem from "@/components/ContentItem";
import { useAuth } from "@/hooks/useAuth";
import MobileNavigation from "@/components/MobileNavigation";
import TagCorrectionModal from "@/components/TagCorrectionModal";
import ContentLibrary from "@/components/ContentLibrary";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function LibraryPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkWithTags | null>(null);
  const [customTabLinks, setCustomTabLinks] = useState<LinkWithTags[]>([]);
  const [isLoadingCustomTabLinks, setIsLoadingCustomTabLinks] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [location] = useLocation();
  const { toast } = useToast();

  // Query for all links
  const { data: links = [], isLoading: isLinksLoading } = useQuery<LinkWithTags[]>({
    queryKey: ["/api/links"],
    enabled: !activeTab.startsWith("custom-"), // Only fetch all links when not viewing a custom tab
  });

  // Query for custom tabs
  const { data: customTabs = [] } = useQuery<CustomTabWithLinks[]>({
    queryKey: ['/api/custom-tabs'],
  });

  // Parse URL parameters to check for tag filter
  useEffect(() => {
    // Parse URL search parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tagParam = urlParams.get('tag');
    
    if (tagParam) {
      setActiveTagFilter(decodeURIComponent(tagParam));
      toast({
        title: "Tag filter applied",
        description: `Filtering by tag: ${decodeURIComponent(tagParam)}`,
      });
    }
  }, [location, toast]);

  // Listen for custom tab change events from Sidebar
  useEffect(() => {
    const handleCustomTabChange = (event: CustomEvent) => {
      const { tabId } = event.detail;
      setActiveTab(tabId);
    };

    window.addEventListener('customTabChange', handleCustomTabChange as EventListener);
    return () => {
      window.removeEventListener('customTabChange', handleCustomTabChange as EventListener);
    };
  }, []);

  // Handle fetching custom tab links when active tab changes
  useEffect(() => {
    if (activeTab.startsWith('custom-')) {
      const tabIdStr = activeTab.replace('custom-', '');
      
      // Ensure tabId is a valid number before proceeding
      if (!tabIdStr || isNaN(parseInt(tabIdStr, 10))) {
        console.error('Invalid tab ID');
        setCustomTabLinks([]);
        setIsLoadingCustomTabLinks(false);
        return;
      }
      
      const tabId = parseInt(tabIdStr, 10);
      
      // Check if tabId exists in customTabs
      const tabExists = customTabs.some(tab => tab.id === tabId);
      if (!tabExists) {
        console.error('Tab ID not found in available tabs');
        setCustomTabLinks([]);
        setIsLoadingCustomTabLinks(false);
        return;
      }
      
      // Fetch links for the selected custom tab
      const fetchCustomTabLinks = async () => {
        setIsLoadingCustomTabLinks(true);
        try {
          const response = await fetch(`/api/custom-tabs/${tabId}/links`);
          if (response.ok) {
            const data = await response.json();
            setCustomTabLinks(data);
          } else {
            console.error('Failed to fetch custom tab links');
            setCustomTabLinks([]);
          }
        } catch (error) {
          console.error('Error fetching custom tab links:', error);
          setCustomTabLinks([]);
        } finally {
          setIsLoadingCustomTabLinks(false);
        }
      };
      
      fetchCustomTabLinks();
    } else {
      // Reset custom tab links when viewing regular tabs
      setCustomTabLinks([]);
    }
  }, [activeTab, customTabs]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleOpenTagModal = (link: LinkWithTags) => {
    setSelectedLink(link);
  };
  
  // Handle tag click from ContentItem
  const handleTagClick = (tagName: string) => {
    setActiveTagFilter(tagName);
    // Update URL with tag parameter without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tag', tagName);
    window.history.pushState({}, '', url.toString());
    
    toast({
      title: "Tag filter applied",
      description: `Filtering by tag: ${tagName}`,
    });
  };
  
  // Clear tag filter
  const clearTagFilter = () => {
    setActiveTagFilter(null);
    // Remove tag parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('tag');
    window.history.pushState({}, '', url.toString());
  };
  
  // Determine which links to display based on active tab
  const displayLinks = activeTab.startsWith('custom-') ? customTabLinks : links;

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomSidebar user={user} isLoading={isUserLoading} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar user={user} />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <ContentLibrary 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              links={displayLinks}
              isLoading={activeTab.startsWith('custom-') ? isLoadingCustomTabLinks : isLinksLoading}
              initialTagFilter={activeTagFilter}
              onTagClick={handleTagClick}
              onClearTagFilter={clearTagFilter}
            />
          </div>
        </main>
        
        <MobileNavigation 
          onAddLinkClick={() => setShowAddLinkModal(true)} 
        />
      </div>
      
      {selectedLink && (
        <TagCorrectionModal
          link={selectedLink}
          onClose={() => setSelectedLink(null)}
        />
      )}
    </div>
  );
}