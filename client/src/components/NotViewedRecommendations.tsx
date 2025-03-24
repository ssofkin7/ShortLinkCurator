import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkWithTags } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const NotViewedRecommendations = () => {
  const queryClient = useQueryClient();

  // Fetch links that haven't been viewed in a while
  const { data: notViewedLinks = [], isLoading } = useQuery<LinkWithTags[]>({
    queryKey: ["/api/recommendations/not-viewed"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to update the last_viewed timestamp when a link is clicked
  const updateLastViewed = useMutation({
    mutationFn: (linkId: number) => {
      return apiRequest(`/api/links/${linkId}/view`, {
        method: "POST",
      });
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
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" fill="currentColor" className="text-[#EE1D52]">
              <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
            </svg>
          ),
          text: "TikTok"
        };
      case 'youtube':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 576 512" fill="currentColor" className="text-[#FF0000]">
              <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/>
            </svg>
          ),
          text: "YouTube Shorts"
        };
      case 'instagram':
        return {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" fill="currentColor" className="text-[#C13584]">
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
            </svg>
          ),
          text: "Instagram Reels"
        };
      default:
        return {
          icon: null,
          text: "Content"
        };
    }
  };

  // Handle clicking on a link
  const handleLinkClick = (linkId: number) => {
    updateLastViewed.mutate(linkId);
    // Here you could also handle navigation to the link or opening it in a new tab
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
          <Button variant="link" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            See All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                  <Skeleton className="w-16 h-16 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))
            : notViewedLinks.map((link) => {
                const platform = getPlatformIcon(link.platform);
                return (
                  <div 
                    key={link.id} 
                    className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleLinkClick(link.id)}
                  >
                    <div className="w-16 h-16 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                      {link.thumbnail_url ? (
                        <img 
                          src={link.thumbnail_url} 
                          className="w-full h-full object-cover" 
                          alt={link.title} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          {platform.icon && (
                            <div className="text-2xl">{platform.icon}</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        {platform.icon}
                        <span className="text-xs text-gray-500 ml-1.5">{platform.text}</span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {formatLastViewed(link.last_viewed)}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium line-clamp-2 mb-1">
                        {link.title}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {link.category}
                        </Badge>
                        {link.tags && link.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs bg-gray-50">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
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