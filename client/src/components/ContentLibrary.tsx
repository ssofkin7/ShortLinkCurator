import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LinkWithTags } from "@shared/schema";
import ContentItem from "./ContentItem";
import TagCorrectionModal from "./TagCorrectionModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ContentLibraryProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

const ContentLibrary = ({ 
  activeTab, 
  onTabChange,
  viewMode,
  onViewModeChange
}: ContentLibraryProps) => {
  const { toast } = useToast();
  const [selectedLink, setSelectedLink] = useState<LinkWithTags | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);

  // Fetch links
  const { data: links = [], isLoading } = useQuery<LinkWithTags[]>({
    queryKey: ["/api/links", activeTab !== "all" ? activeTab : undefined],
  });

  // Calculate counts by platform
  const counts = {
    all: links.length,
    tiktok: links.filter(link => link.platform === "tiktok").length,
    youtube: links.filter(link => link.platform === "youtube").length,
    instagram: links.filter(link => link.platform === "instagram").length,
  };

  // Open tag correction modal
  const handleOpenTagModal = (link: LinkWithTags) => {
    setSelectedLink(link);
    setShowTagModal(true);
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    toast({
      title: "Sorting applied",
      description: `Sorted by ${sort}`,
    });
  };

  return (
    <>
      {/* Content Library Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold">Your Content Library</h2>
          <p className="text-gray-500 text-sm">Browse and manage your saved short-form content</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="px-3 py-1.5 rounded-md text-sm font-medium"
            >
              <svg className="mr-1.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="px-3 py-1.5 rounded-md text-sm font-medium"
            >
              <svg className="mr-1.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              List
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium"
          >
            <span>Filter</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3.5 py-2 text-sm font-medium"
            onClick={() => handleSortChange("Newest")}
          >
            <span>Sort: Newest</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </Button>
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex -mb-px gap-1 overflow-x-auto">
          <Button 
            variant="link" 
            className={`px-4 py-3 text-sm ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => onTabChange('all')}
          >
            All ({counts.all})
          </Button>
          <Button 
            variant="link" 
            className={`px-4 py-3 text-sm ${activeTab === 'tiktok' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => onTabChange('tiktok')}
          >
            <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
              <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
            </svg>
            TikTok ({counts.tiktok})
          </Button>
          <Button 
            variant="link" 
            className={`px-4 py-3 text-sm ${activeTab === 'youtube' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => onTabChange('youtube')}
          >
            <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 576 512" fill="currentColor">
              <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/>
            </svg>
            YouTube ({counts.youtube})
          </Button>
          <Button 
            variant="link" 
            className={`px-4 py-3 text-sm ${activeTab === 'instagram' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => onTabChange('instagram')}
          >
            <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
            </svg>
            Instagram ({counts.instagram})
          </Button>
        </div>
      </div>
      
      {/* Content Grid/List */}
      <section className="mb-10">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-blue-500">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span className="ml-2">Loading your content...</span>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-4">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <path d="m9 16 3-3 3 3"></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No links saved yet</h3>
            <p className="text-gray-500">Start by adding links from TikTok, YouTube Shorts, or Instagram Reels</p>
          </div>
        ) : (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-5`}>
            {links.map((link) => (
              <ContentItem 
                key={link.id} 
                link={link} 
                viewMode={viewMode}
                onEditTags={() => handleOpenTagModal(link)} 
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Tag Correction Modal */}
      {showTagModal && selectedLink && (
        <TagCorrectionModal
          link={selectedLink}
          onClose={() => setShowTagModal(false)}
        />
      )}
    </>
  );
};

export default ContentLibrary;
