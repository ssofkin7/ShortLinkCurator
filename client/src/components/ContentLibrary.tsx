import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LinkWithTags, Tag } from "@shared/schema";
import ContentItem from "./ContentItem";
import TagCorrectionModal from "./TagCorrectionModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentLibraryProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  links?: LinkWithTags[]; // Make links optional so we can still fetch them if not provided
  isLoading?: boolean;
}

const ContentLibrary = ({ 
  activeTab, 
  onTabChange,
  viewMode,
  onViewModeChange,
  links: externalLinks,
  isLoading: externalLoading
}: ContentLibraryProps) => {
  const { toast } = useToast();
  const [selectedLink, setSelectedLink] = useState<LinkWithTags | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredLinks, setFilteredLinks] = useState<LinkWithTags[]>([]);

  // Fetch links only if they're not provided as props
  const { data: fetchedLinks = [], isLoading: isFetchLoading } = useQuery<LinkWithTags[]>({
    queryKey: ["/api/links", activeTab !== "all" ? activeTab : undefined],
    enabled: !externalLinks, // Only fetch if links are not provided as props
  });
  
  // Use external links if provided, otherwise use fetched links
  const links = externalLinks || fetchedLinks;
  const isLoading = externalLoading !== undefined ? externalLoading : isFetchLoading;

  // Filter links when active tag, platform, or search query changes
  useEffect(() => {
    // Skip if links aren't loaded yet
    if (!links || links.length === 0) return;
    
    let result = [...links];
    
    // Apply tag filter if active
    if (activeTagFilter) {
      result = result.filter(link => 
        link.tags.some(tag => tag.name.toLowerCase() === activeTagFilter.toLowerCase())
      );
    }
    
    // Apply search filter if there's a search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      result = result.filter(link => {
        // For debugging
        const matchesTitle = link.title && link.title.toLowerCase().includes(query);
        const matchesUrl = link.url && link.url.toLowerCase().includes(query);
        const matchesTags = link.tags.some(tag => tag.name.toLowerCase().includes(query));
        const matchesCategory = link.category && link.category.toLowerCase().includes(query);
        
        return (
          // Search in title
          matchesTitle ||
          // Search in URL
          matchesUrl ||
          // Search in tags
          matchesTags ||
          // Search in category
          matchesCategory
        );
      });
    }
    
    setFilteredLinks(result);
  }, [links, activeTagFilter, searchQuery]);

  // Calculate all unique platforms and their counts
  const calculatePlatformCounts = () => {
    const platformCounts: Record<string, number> = { all: links.length };
    
    // Get all unique platforms in the library
    const uniquePlatforms = Array.from(new Set(links.map(link => link.platform)));
    
    // Calculate count for each platform
    uniquePlatforms.forEach(platform => {
      platformCounts[platform] = links.filter(link => link.platform === platform).length;
    });
    
    return platformCounts;
  };
  
  const counts = calculatePlatformCounts();

  // Open tag correction modal
  const handleOpenTagModal = (link: LinkWithTags) => {
    setSelectedLink(link);
    setShowTagModal(true);
  };

  // Handle tag filter click
  const handleTagClick = (tagName: string) => {
    setActiveTagFilter(tagName);
    toast({
      title: "Tag filter applied",
      description: `Filtering by tag: ${tagName}`,
    });
  };

  // Remove active tag filter
  const clearTagFilter = () => {
    setActiveTagFilter(null);
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
        
        <div className="flex flex-wrap gap-3 md:ml-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
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
          
          {/* Filter and Sort Controls - Made more prominent */}
          <div className="flex flex-wrap gap-2 ml-auto">
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              <span>Filter</span>
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium shadow-sm"
              onClick={() => handleSortChange("Newest")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M3 9l4-4 4 4M7 5v14M21 15l-4 4-4-4M17 19V5"/>
              </svg>
              <span>Sort: Newest</span>
            </Button>
          </div>
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
            placeholder="Search links by title, URL, tags or category..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          
          {/* Dynamically generate tabs for all platforms in the library */}
          {Object.keys(counts).filter(platform => platform !== 'all' && counts[platform] > 0).map(platform => {
            // Get platform-specific tab icon
            const getTabIcon = () => {
              switch(platform) {
                // Video platforms
                case 'youtube':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 576 512" fill="currentColor">
                      <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/>
                    </svg>
                  );
                case 'tiktok':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
                    </svg>
                  );
                case 'instagram':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                    </svg>
                  );
                case 'facebook':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 320 512" fill="currentColor">
                      <path d="M279.1 288l14.2-92.7h-88.9v-60.1c0-25.4 12.4-50.1 52.2-50.1h40.4V6.3S260.4 0 225.4 0c-73.2 0-121.1 44.4-121.1 124.7v70.6H22.9V288h81.4v224h100.2V288z"/>
                    </svg>
                  );
                case 'vimeo':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M447.8 153.6c-2 43.6-32.4 103.3-91.4 179.1-60.9 79.2-112.4 118.8-154.6 118.8-26.1 0-48.2-24.1-66.3-72.3C100.3 250 85.3 174.3 56.2 174.3c-3.4 0-15.1 7.1-35.2 21.1L0 168.2c51.6-45.3 100.9-95.7 131.8-98.5 34.9-3.4 56.3 20.5 64.4 71.5 28.7 181.5 41.4 208.9 93.6 126.7 18.7-29.6 28.8-52.1 30.2-67.6 4.8-45.9-35.8-42.8-63.3-31 22-72.1 64.1-107.1 126.2-105.1 45.8 1.2 67.5 31.1 64.9 89.4z"/>
                    </svg>
                  );
                case 'twitter':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
                      <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
                    </svg>
                  );
                case 'linkedin':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/>
                    </svg>
                  );
                case 'reddit':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
                      <path d="M201.5 305.5c-13.8 0-24.9-11.1-24.9-24.6 0-13.8 11.1-24.9 24.9-24.9 13.6 0 24.6 11.1 24.6 24.9 0 13.6-11.1 24.6-24.6 24.6zM504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zm-132.3-41.2c-9.4-9.4-21.5-14.2-34.4-14.2s-25.1 4.8-34.4 14.2c-2.9 2.9-3.2 7.5-.8 10.8 2.4 3.3 7 3.8 10.2 1.5 6-5.7 13.9-8.9 22.3-8.9 8.5 0 16.5 3.2 22.5 8.9 3.3 3.2 7.8 2.7 10.3-.6 2.3-3.4 2-7.5-.7-10.7zm-9.8 65.2c-4.1-2.3-8.5-4.3-13.1-5.9l8.8-3c3.4-1.1 4.4-5.4 2.1-8.1-2.2-2.9-6.4-3.6-9.1-1.6l-14.4 10c-10.9-5.6-23.1-9.3-36-10.8l6.8-11.8c2-3.5.2-7.9-3.9-9.3-3.2-1.2-7 .4-8.6 3.8l-7.7 13.3c-39.7 4-71.4 27.4-81.7 58.9-9 26.7-5.3 55.7 10.2 80.5 15.5 24.7 41.3 41.5 71.8 46.9 30.1 5.3 62.3-.8 89.4-17.1 19-11.4 34.4-27.5 44.7-46.5 10.3-19.1 15.1-40.6 13.7-61.6-1.3-20.5-8.2-39.7-19.9-55.4-3.1-4.2-8.9-5.1-13.4-2.3z"/>
                    </svg>
                  );
                case 'medium':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
                      <path d="M71.5 142.3c.6-5.9-1.7-11.8-6.1-15.8L20.3 72.1V64h140.2l108.4 237.7L364.2 64h133.7v8.1l-38.6 37c-3.3 2.5-5 6.7-4.3 10.8v272c-.7 4.1 1 8.3 4.3 10.8l37.7 37v8.1H307.3v-8.1l39.1-37.9c3.8-3.8 3.8-5 3.8-10.8V171.2L241.5 447.1h-14.7L100.4 171.2v184.9c-1.1 7.8 1.5 15.6 7 21.2l50.8 61.6v8.1h-144v-8L65 377.3c5.4-5.6 7.9-13.5 6.5-21.2V142.3z"/>
                    </svg>
                  );
                case 'substack':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                    </svg>
                  );
                case 'github':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 496 512" fill="currentColor">
                      <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/>
                    </svg>
                  );
                case 'article':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  );
                case 'document':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  );
                case 'webpage':
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  );
                default:
                  return (
                    <svg className="mr-1 inline-block" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="8 17 12 21 16 17"></polyline>
                      <line x1="12" y1="12" x2="12" y2="21"></line>
                      <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path>
                    </svg>
                  );
              }
            };
            
            // Format platform name for display (capitalize first letter)
            const platformDisplay = platform.charAt(0).toUpperCase() + platform.slice(1);
            
            return (
              <Button 
                key={platform}
                variant="link" 
                className={`px-4 py-3 text-sm ${activeTab === platform ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => onTabChange(platform)}
              >
                {getTabIcon()}
                {platformDisplay} ({counts[platform]})
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Search Results Counter */}
      {searchQuery.trim() && (
        <div className="mb-4 flex items-center">
          <span className="text-sm text-gray-600">
            Found {filteredLinks.length} result{filteredLinks.length !== 1 ? 's' : ''} for "{searchQuery}"
          </span>
          {filteredLinks.length > 0 && (
            <button 
              onClick={() => setSearchQuery('')}
              className="ml-2 text-blue-500 text-sm hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}
      
      {/* Content Grid/List */}
      <section className="mb-10">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-blue-500">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span className="ml-2">Loading your content...</span>
          </div>
        ) : links.length === 0 && activeTab === 'all' ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-4">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <path d="m9 16 3-3 3 3"></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No links saved yet</h3>
            <p className="text-gray-500">Paste a link above to get started!</p>
          </div>
        ) : links.length === 0 && activeTab !== 'all' ? (
          // Dynamic empty state based on platform tab
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
            {/* Get platform-specific empty state icon */}
            {(() => {
              switch(activeTab) {
                case 'youtube':
                  return (
                    <svg className="mx-auto text-[#FF0000] mb-4" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 576 512" fill="currentColor">
                      <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/>
                    </svg>
                  );
                case 'tiktok':
                  return (
                    <svg className="mx-auto text-[#EE1D52] mb-4" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
                    </svg>
                  );
                case 'instagram':
                  return (
                    <svg className="mx-auto text-[#C13584] mb-4" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                    </svg>
                  );
                case 'facebook':
                  return (
                    <svg className="mx-auto text-[#1877F2] mb-4" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 320 512" fill="currentColor">
                      <path d="M279.1 288l14.2-92.7h-88.9v-60.1c0-25.4 12.4-50.1 52.2-50.1h40.4V6.3S260.4 0 225.4 0c-73.2 0-121.1 44.4-121.1 124.7v70.6H22.9V288h81.4v224h100.2V288z"/>
                    </svg>
                  );
                case 'twitter':
                  return (
                    <svg className="mx-auto text-[#1DA1F2] mb-4" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512" fill="currentColor">
                      <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
                    </svg>
                  );
                case 'linkedin':
                  return (
                    <svg className="mx-auto text-[#0077B5] mb-4" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 448 512" fill="currentColor">
                      <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/>
                    </svg>
                  );
                case 'reddit':
                  return (
                    <svg className="mx-auto text-[#FF4500] mb-4" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512" fill="currentColor">
                      <path d="M201.5 305.5c-13.8 0-24.9-11.1-24.9-24.6 0-13.8 11.1-24.9 24.9-24.9 13.6 0 24.6 11.1 24.6 24.9 0 13.6-11.1 24.6-24.6 24.6zM504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zm-132.3-41.2c-9.4-9.4-21.5-14.2-34.4-14.2s-25.1 4.8-34.4 14.2c-2.9 2.9-3.2 7.5-.8 10.8 2.4 3.3 7 3.8 10.2 1.5 6-5.7 13.9-8.9 22.3-8.9 8.5 0 16.5 3.2 22.5 8.9 3.3 3.2 7.8 2.7 10.3-.6 2.3-3.4 2-7.5-.7-10.7zm-9.8 65.2c-4.1-2.3-8.5-4.3-13.1-5.9l8.8-3c3.4-1.1 4.4-5.4 2.1-8.1-2.2-2.9-6.4-3.6-9.1-1.6l-14.4 10c-10.9-5.6-23.1-9.3-36-10.8l6.8-11.8c2-3.5.2-7.9-3.9-9.3-3.2-1.2-7 .4-8.6 3.8l-7.7 13.3c-39.7 4-71.4 27.4-81.7 58.9-9 26.7-5.3 55.7 10.2 80.5 15.5 24.7 41.3 41.5 71.8 46.9 30.1 5.3 62.3-.8 89.4-17.1 19-11.4 34.4-27.5 44.7-46.5 10.3-19.1 15.1-40.6 13.7-61.6-1.3-20.5-8.2-39.7-19.9-55.4-3.1-4.2-8.9-5.1-13.4-2.3z"/>
                    </svg>
                  );
                case 'medium':
                  return (
                    <svg className="mx-auto text-[#02b875] mb-4" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512" fill="currentColor">
                      <path d="M71.5 142.3c.6-5.9-1.7-11.8-6.1-15.8L20.3 72.1V64h140.2l108.4 237.7L364.2 64h133.7v8.1l-38.6 37c-3.3 2.5-5 6.7-4.3 10.8v272c-.7 4.1 1 8.3 4.3 10.8l37.7 37v8.1H307.3v-8.1l39.1-37.9c3.8-3.8 3.8-5 3.8-10.8V171.2L241.5 447.1h-14.7L100.4 171.2v184.9c-1.1 7.8 1.5 15.6 7 21.2l50.8 61.6v8.1h-144v-8L65 377.3c5.4-5.6 7.9-13.5 6.5-21.2V142.3z"/>
                    </svg>
                  );
                default:
                  return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-4">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <path d="m9 16 3-3 3 3"></path>
                    </svg>
                  );
              }
            })()}
            
            {/* Display platform-specific empty state message */}
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content yet
            </h3>
            <p className="text-gray-500">
              Save a {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} link to see it here!
            </p>
          </div>
        ) : (
          <>
            {/* Active Tag Filter Display */}
            {activeTagFilter && (
              <div className="mb-4 flex items-center">
                <span className="text-sm text-gray-600 mr-2">Filtered by tag:</span>
                <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1 px-3 py-1">
                  {activeTagFilter}
                  <button 
                    onClick={clearTagFilter}
                    className="ml-1 rounded-full bg-blue-200 p-0.5 hover:bg-blue-300 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              </div>
            )}

            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-5`}>
              {(searchQuery.trim() || activeTagFilter ? filteredLinks : links).map((link) => (
                <ContentItem 
                  key={link.id} 
                  link={link} 
                  viewMode={viewMode}
                  onEditTags={(e) => {
                    if (e) e.stopPropagation();
                    handleOpenTagModal(link);
                  }}
                  onTagClick={(tagName, e) => {
                    if (e) e.stopPropagation();
                    handleTagClick(tagName);
                  }}
                />
              ))}
            </div>
          </>
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
