import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LinkWithTags } from "@shared/schema";
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

  // Query for links
  const { data: links = [], isLoading: isLinksLoading } = useQuery<LinkWithTags[]>({
    queryKey: ["/api/links"],
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleOpenTagModal = (link: LinkWithTags) => {
    setSelectedLink(link);
  };

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
              links={links}
              isLoading={isLinksLoading}
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