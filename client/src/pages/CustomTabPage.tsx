import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link, useLocation } from 'wouter';
import { CustomTabWithLinks, LinkWithTags, Tag } from '@shared/schema';
import { Sidebar } from "@/components/ui/sidebar";
import CustomSidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import MobileNavigation from "@/components/MobileNavigation";
import ContentItem from "@/components/ContentItem";
import TagCorrectionModal from "@/components/TagCorrectionModal";
import LinkSubmitter from "@/components/LinkSubmitter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const CustomTabPage = () => {
  const [match, params] = useRoute('/tabs/:id');
  const tabId = parseInt(params?.id || '0');
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedLink, setSelectedLink] = useState<LinkWithTags | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showLinkSubmitter, setShowLinkSubmitter] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const isMobile = useIsMobile();

  // Fetch custom tab data
  const { data: customTab, isLoading: isTabLoading } = useQuery<CustomTabWithLinks>({
    queryKey: ['/api/custom-tabs', tabId],
    enabled: !!tabId,
  });

  // Fetch tab links
  const { 
    data: tabLinks = [], 
    isLoading: isLinksLoading,
    refetch: refetchLinks,
    error: linksError
  } = useQuery<LinkWithTags[]>({
    queryKey: [`/api/custom-tabs/${tabId}/links`],
    enabled: !!tabId,
    retry: 3
  });

  // Create state for tab links to enable local filtering
  const [filteredLinks, setFilteredLinks] = useState<LinkWithTags[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Handle sorting and filtering
  useEffect(() => {
    if (!tabLinks || tabLinks.length === 0) {
      setFilteredLinks([]);
      return;
    }

    let result = [...tabLinks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(link => 
        link.title.toLowerCase().includes(query) || 
        link.url.toLowerCase().includes(query) || 
        link.category.toLowerCase().includes(query) ||
        (link.tags && Array.isArray(link.tags) && link.tags.some((tag: Tag) => tag.name.toLowerCase().includes(query)))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredLinks(result);
  }, [tabLinks, searchQuery, sortOrder]);

  // Handle link submission
  const handleSubmitLink = async (link: LinkWithTags) => {
    if (!customTab) return;

    try {
      await apiRequest("POST", `/api/custom-tabs/${customTab.id}/links/${link.id}`);
      setShowLinkSubmitter(false);
      refetchLinks();
      toast({
        title: "Link added",
        description: "Link has been added to the tab successfully"
      });
    } catch (error) {
      console.error("Error adding link to tab:", error);
      toast({
        title: "Error",
        description: "Failed to add link to tab",
        variant: "destructive"
      });
    }
  };

  // Open tag correction modal
  const handleOpenTagModal = (link: LinkWithTags) => {
    setSelectedLink(link);
    setShowTagModal(true);
  };

  // Handle sort change
  const handleSortChange = () => {
    // Toggle between newest and oldest
    const newSortOrder = sortOrder === "newest" ? "oldest" : "newest";
    setSortOrder(newSortOrder);

    // Toast notification
    toast({
      title: "Sorting applied",
      description: `Sorted by ${newSortOrder === "newest" ? "newest" : "oldest"}`,
    });
  };

  // If tab is not found or loading
  if (isTabLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {!isMobile && <TopBar user={user} />}
        <div className="flex flex-1">
          {!isMobile && <CustomSidebar user={user} isLoading={false} />}
          <main className="flex-1 p-6 md:p-8">
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          </main>
        </div>
        {isMobile && <MobileNavigation onAddLinkClick={() => setShowLinkSubmitter(true)} />}
      </div>
    );
  }

  // If tab doesn't exist
  if (!customTab && !isTabLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {!isMobile && <TopBar user={user} />}
        <div className="flex flex-1">
          {!isMobile && <CustomSidebar user={user} isLoading={false} />}
          <main className="flex-1 p-6 md:p-8">
            <div className="flex flex-col justify-center items-center h-full">
              <h2 className="text-xl font-semibold mb-2">Tab Not Found</h2>
              <p className="text-gray-500 mb-4">The tab you're looking for doesn't exist or you don't have access to it.</p>
              <Link href="/library">
                <Button variant="default">Return to Library</Button>
              </Link>
            </div>
          </main>
        </div>
        {isMobile && <MobileNavigation onAddLinkClick={() => setShowLinkSubmitter(true)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isMobile && <TopBar user={user} />}
      <div className="flex flex-1">
        {!isMobile && <CustomSidebar user={user} isLoading={false} />}
        <main className="flex-1 p-6 md:p-8">
          {/* Tab Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {customTab?.icon && (
                  <span className="text-indigo-500">
                    {customTab.icon === 'folder' && <span>📁</span>}
                    {customTab.icon === 'star' && <span>⭐</span>}
                    {customTab.icon === 'heart' && <span>❤️</span>}
                    {customTab.icon === 'bookmark' && <span>🔖</span>}
                  </span>
                )}
                {customTab?.name || 'Custom Tab'}
              </h2>
              <p className="text-gray-500 text-sm">
                {customTab?.description || 'Organize your content in this custom tab'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3 py-1.5 text-sm font-medium rounded-md h-8"
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
                  onClick={() => setViewMode("list")}
                  className="px-3 py-1.5 text-sm font-medium rounded-md h-8"
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

              {/* Sort Controls */}
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-8 px-3 text-sm font-medium"
                onClick={() => handleSortChange()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l4-4 4 4M7 5v14M21 15l-4 4-4-4M17 19V5"/>
                </svg>
                <span>{sortOrder === "newest" ? "Newest" : "Oldest"}</span>
              </Button>

              {/* Add Link Button */}
              <Button 
                variant="default" 
                size="sm" 
                className="h-8 px-3"
                onClick={() => setShowLinkSubmitter(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
                Add Link
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4 relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search links in this tab..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Content Grid/List */}
          {isLinksLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : filteredLinks.length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col space-y-3"}>
              {filteredLinks.map(link => (
                <ContentItem 
                  key={link.id} 
                  link={link}
                  viewMode={viewMode}
                  customTabId={tabId}
                  onRemoveFromTab={() => {
                    // Refresh the links in the tab after removing
                    refetchLinks();
                  }}
                  onEditTags={() => handleOpenTagModal(link)}
                  onTagClick={(tagName) => {
                    // Filter by tag (implementation can be added later)
                    setSearchQuery(tagName);
                    toast({
                      title: "Filtering by tag",
                      description: `Showing content with tag "${tagName}"`,
                    });
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center mt-4">
              <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No Links In This Tab</h3>
              <p className="text-gray-500 mb-4">
                This tab doesn't have any links yet. Start by adding your first link!
              </p>
              <Button 
                variant="default" 
                onClick={() => setShowLinkSubmitter(true)}
                className="mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
                Add First Link
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation onAddLinkClick={() => setShowLinkSubmitter(true)} />}

      {/* Link Submitter Dialog */}
      {showLinkSubmitter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add Link to {customTab?.name}</h3>
              <button 
                onClick={() => setShowLinkSubmitter(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <LinkSubmitter onSubmit={handleSubmitLink} />
          </div>
        </div>
      )}

      {/* Tag Correction Modal */}
      {showTagModal && selectedLink && (
        <TagCorrectionModal 
          link={selectedLink} 
          onClose={() => {
            setShowTagModal(false);
            setSelectedLink(null);
            refetchLinks();
          }} 
        />
      )}
    </div>
  );
};

export default CustomTabPage;