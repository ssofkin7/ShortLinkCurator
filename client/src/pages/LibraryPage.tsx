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

export default function LibraryPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkWithTags | null>(null);
  const [customTabLinks, setCustomTabLinks] = useState<LinkWithTags[]>([]);
  const [isLoadingCustomTabLinks, setIsLoadingCustomTabLinks] = useState(false);

  // Query for all links
  const { data: links = [], isLoading: isLinksLoading } = useQuery<LinkWithTags[]>({
    queryKey: ["/api/links"],
    enabled: !activeTab.startsWith("custom-"), // Only fetch all links when not viewing a custom tab
  });

  // Query for custom tabs
  const { data: customTabs = [] } = useQuery<CustomTabWithLinks[]>({
    queryKey: ['/api/custom-tabs'],
  });

  // Handle fetching custom tab links when active tab changes
  useEffect(() => {
    if (activeTab.startsWith('custom-')) {
      const tabId = parseInt(activeTab.replace('custom-', ''), 10);
      
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
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleOpenTagModal = (link: LinkWithTags) => {
    setSelectedLink(link);
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