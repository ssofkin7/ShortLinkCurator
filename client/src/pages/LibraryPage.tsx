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

  const filteredLinks = activeTab === "all" 
    ? links
    : links.filter(link => link.platform.toLowerCase() === activeTab);

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
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-2xl font-bold">Content Library</h1>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                  onClick={() => handleViewModeChange('grid')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                  onClick={() => handleViewModeChange('list')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </Button>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
              <TabsList className="bg-white border border-gray-200">
                <TabsTrigger value="all">All Content</TabsTrigger>
                
                {links.some(link => link.platform === "youtube") && (
                  <TabsTrigger value="youtube">YouTube</TabsTrigger>
                )}
                
                {links.some(link => link.platform === "tiktok") && (
                  <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                )}
                
                {links.some(link => link.platform === "instagram") && (
                  <TabsTrigger value="instagram">Instagram</TabsTrigger>
                )}
                
                {links.some(link => link.platform === "facebook") && (
                  <TabsTrigger value="facebook">Facebook</TabsTrigger>
                )}
                
                {links.some(link => link.platform === "vimeo") && (
                  <TabsTrigger value="vimeo">Vimeo</TabsTrigger>
                )}
              </TabsList>
            </Tabs>
            
            {isLinksLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 h-64 animate-pulse">
                    <div className="w-full h-32 bg-gray-200 rounded-md mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <h3 className="font-medium text-gray-900 mb-1">No content found</h3>
                <p className="text-gray-500 mb-4">Start adding links to your library</p>
                <Button onClick={() => setShowAddLinkModal(true)}>Add Content</Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "space-y-3"
              }>
                {filteredLinks.map((link) => (
                  <ContentItem 
                    key={link.id} 
                    link={link} 
                    viewMode={viewMode} 
                    onEditTags={() => handleOpenTagModal(link)}
                  />
                ))}
              </div>
            )}
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