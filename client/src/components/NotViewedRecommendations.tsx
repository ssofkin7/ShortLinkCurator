import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkWithTags } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Helper functions to determine content type
const isVideoContent = (platform: string): boolean => {
  return ['youtube', 'tiktok', 'instagram', 'facebook', 'vimeo'].includes(platform);
};

const isTextContent = (platform: string): boolean => {
  return ['medium', 'substack', 'article', 'document', 'webpage', 'github', 'reddit', 'linkedin'].includes(platform);
};

const isTwitterContent = (platform: string): boolean => {
  return platform === 'twitter';
};

const NotViewedRecommendations = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch links that haven't been viewed in a while
  const { data: notViewedLinks = [], isLoading } = useQuery<LinkWithTags[]>({
    queryKey: ["/api/recommendations/not-viewed"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to update the last_viewed timestamp when a link is clicked
  const updateLastViewed = useMutation({
    mutationFn: (linkId: number) => {
      return apiRequest("POST", `/api/links/${linkId}/view`);
    },
    onSuccess: () => {
      // Invalidate the not viewed links query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations/not-viewed"] });
    },
  });

  // Platform-specific UI elements
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor" className="text-[#EE1D52]">
              <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
            </svg>
          ),
          bgColor: 'bg-[#EE1D52]'
        };
      case 'youtube':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 576 512" fill="currentColor" className="text-[#FF0000]">
              <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/>
            </svg>
          ),
          bgColor: 'bg-[#FF0000]'
        };
      case 'instagram':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor" className="text-[#C13584]">
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
            </svg>
          ),
          bgColor: 'bg-[#C13584]'
        };
      case 'facebook':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 320 512" fill="currentColor" className="text-[#1877F2]">
              <path d="M279.1 288l14.2-92.7h-88.9v-60.1c0-25.4 12.4-50.1 52.2-50.1h40.4V6.3S260.4 0 225.4 0c-73.2 0-121.1 44.4-121.1 124.7v70.6H22.9V288h81.4v224h100.2V288z"/>
            </svg>
          ),
          bgColor: 'bg-[#1877F2]'
        };
      case 'vimeo':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor" className="text-[#1AB7EA]">
              <path d="M447.8 153.6c-2 43.6-32.4 103.3-91.4 179.1-60.9 79.2-112.4 118.8-154.6 118.8-26.1 0-48.2-24.1-66.3-72.3C100.3 250 85.3 174.3 56.2 174.3c-3.4 0-15.1 7.1-35.2 21.1L0 168.2c51.6-45.3 100.9-95.7 131.8-98.5 34.9-3.4 56.3 20.5 64.4 71.5 28.7 181.5 41.4 208.9 93.6 126.7 18.7-29.6 28.8-52.1 30.2-67.6 4.8-45.9-35.8-42.8-63.3-31 22-72.1 64.1-107.1 126.2-105.1 45.8 1.2 67.5 31.1 64.9 89.4z"/>
            </svg>
          ),
          bgColor: 'bg-[#1AB7EA]'
        };
      case 'medium':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor" className="text-black">
              <path d="M0 32v448h448V32H0zm372.2 106.1l-24 23c-2.1 1.6-3.1 4.2-2.7 6.7v169.3c-.4 2.6.6 5.2 2.7 6.7l23.5 23v5.1h-118V367l24.3-23.6c2.4-2.4 2.4-3.1 2.4-6.7V199.8l-67.6 171.6h-9.1L125 199.8v115c-.7 4.8 1 9.7 4.4 13.2l31.6 38.3v5.1H71.2v-5.1l31.6-38.3c3.4-3.5 4.9-8.4 4.1-13.2v-133c.4-3.7-1-7.3-3.8-9.8L75 138.1V133h87.3l67.4 148L289 133h83.2v5.1z"/>
            </svg>
          ),
          bgColor: 'bg-black'
        };
      case 'article':
      case 'document':
      case 'webpage':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 384 512" fill="currentColor" className="text-blue-600">
              <path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm160-14.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"/>
            </svg>
          ),
          bgColor: 'bg-blue-100'
        };
      case 'twitter':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor" className="text-[#1DA1F2]">
              <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
            </svg>
          ),
          bgColor: 'bg-[#1DA1F2]'
        };
      case 'reddit':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor" className="text-[#FF4500]">
              <path d="M201.5 305.5c-13.8 0-24.9-11.1-24.9-24.6 0-13.8 11.1-24.9 24.9-24.9 13.6 0 24.6 11.1 24.6 24.9 0 13.6-11.1 24.6-24.6 24.6zM504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zm-132.3-41.2c-9.4 0-17.7 3.9-23.8 10-22.4-15.5-52.6-25.5-86.1-26.6l17.4-78.3 55.4 12.5c0 13.6 11.1 24.6 24.6 24.6 13.8 0 24.9-11.3 24.9-24.9s-11.1-24.9-24.9-24.9c-9.7 0-18 5.8-22.1 13.8l-61.2-13.6c-3-.8-6.1 1.4-6.9 4.4l-19.1 86.4c-33.2 1.4-63.1 11.3-85.5 26.8-6.1-6.4-14.7-10.2-24.1-10.2-34.9 0-46.3 46.9-14.4 62.8-1.1 5-1.7 10.2-1.7 15.5 0 52.6 59.2 95.2 132 95.2 73.1 0 132.3-42.6 132.3-95.2 0-5.3-.6-10.8-1.9-15.8 31.3-16 19.8-62.5-14.9-62.5zM302.8 331c-18.2 18.2-76.1 17.9-93.6 0-2.2-2.2-6.1-2.2-8.3 0-2.5 2.5-2.5 6.4 0 8.6 22.8 22.8 87.3 22.8 110.2 0 2.5-2.2 2.5-6.1 0-8.6-2.2-2.2-6.1-2.2-8.3 0zm7.7-75c-13.6 0-24.6 11.1-24.6 24.9 0 13.6 11.1 24.6 24.6 24.6 13.8 0 24.9-11.1 24.9-24.6 0-13.8-11-24.9-24.9-24.9z"/>
            </svg>
          ),
          bgColor: 'bg-[#FF4500]'
        };
      default:
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
              <path d="M320 0H64C28.7 0 0 28.7 0 64v288c0 35.3 28.7 64 64 64h47.5 4.5c16.6 0 32.5-6.6 44.2-18.3l76.2-76.2c13.7-13.7 32.2-21.5 51.5-21.5h76.8c19.3 0 37.8 7.7 51.5 21.5l76.2 76.2c11.8 11.8 27.6 18.3 44.2 18.3h4.5H384c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64h-8.2c-25.3 0-49.5-10.1-67.3-27.9L274.8 34.3C257 16.5 232.8 6.4 207.5 6.4H192C174.3 6.4 160 20.7 160 38.4V96c0 17.7 14.3 32 32 32h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32-14.3-32-32V38.4C96 20.7 81.7 6.4 64 6.4H32C14.3 6.4 0 20.7 0 38.4V416c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V384c0-17.7-14.3-32-32-32s-32 14.3-32 32v32c0 17.7-14.3 32-32 32H64c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32H320c17.7 0 32 14.3 32 32v32c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-35.3-28.7-64-64-64z"/>
            </svg>
          ),
          bgColor: 'bg-gray-700'
        };
    }
  };

  // Handle clicking on a link
  const handleLinkClick = (link: LinkWithTags) => {
    // Update last viewed timestamp
    updateLastViewed.mutate(link.id);
    // Open the link in a new tab
    window.open(link.url, "_blank");
  };

  // Format date to show how long ago the link was viewed
  const formatLastViewed = (date: Date | null) => {
    if (!date) return "Never viewed";
    
    const now = new Date();
    const lastViewed = new Date(date);
    const diffTime = Math.abs(now.getTime() - lastViewed.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    }
  };

  if (notViewedLinks.length === 0 && !isLoading) {
    return null; // Don't render if there are no links to recommend
  }

  return (
    <Card className="bg-white p-5 rounded-xl border border-gray-200 mb-8 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Revisit These Links</h2>
          <Button 
            variant="link" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => setLocation("/library")}
          >
            See All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                  <Skeleton className="w-16 h-16 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))
            : notViewedLinks.map((link) => {
                const platform = getPlatformIcon(link.platform);
                return (
                  <div 
                    key={link.id} 
                    className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleLinkClick(link)}
                  >
                    <div className="w-16 h-16 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                      {/* Display for video content */}
                      {(link.thumbnail_url && isVideoContent(link.platform)) ? (
                        <img 
                          src={link.thumbnail_url} 
                          className="w-full h-full object-cover" 
                          alt={link.title} 
                        />
                      ) : isTwitterContent(link.platform) ? (
                        /* Display for Twitter/X content - only show icon */
                        <div className="w-full h-full flex items-center justify-center bg-[#f7f9f9]">
                          <div className="text-3xl text-[#1DA1F2]">{platform.icon}</div>
                        </div>
                      ) : isTextContent(link.platform) ? (
                        /* Display for text/article content */
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-1 text-center">
                          <div className="text-2xl mb-1">{platform.icon}</div>
                          <div className="text-[9px] line-clamp-2 text-gray-600 font-medium">
                            {link.title.substring(0, 30)}{link.title.length > 30 ? '...' : ''}
                          </div>
                        </div>
                      ) : (
                        /* Default display for other content */
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          {platform.icon && (
                            <div className="text-2xl">{platform.icon}</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium line-clamp-2">
                        {link.title}
                      </h3>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default NotViewedRecommendations;