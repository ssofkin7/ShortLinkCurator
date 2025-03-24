import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LinkWithTags } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContentItemProps {
  link: LinkWithTags;
  viewMode: "grid" | "list";
  onEditTags: () => void;
  onTagClick?: (tagName: string) => void;
}

const ContentItem = ({ link, viewMode, onEditTags, onTagClick }: ContentItemProps) => {
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to format date
  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Delete link mutation
  const { mutate: deleteLink, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/links/${link.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Link deleted",
        description: "The link has been removed from your library",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete link",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });

  // Platform specific properties
  const getPlatformBadge = () => {
    switch (link.platform) {
      case 'tiktok':
        return {
          bgColor: 'bg-[#EE1D52]',
          icon: (
            <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" fill="currentColor">
              <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
            </svg>
          ),
          label: 'TikTok'
        };
      case 'youtube':
        return {
          bgColor: 'bg-[#FF0000]',
          icon: (
            <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 576 512" fill="currentColor">
              <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/>
            </svg>
          ),
          label: 'Shorts'
        };
      case 'instagram':
        return {
          bgColor: 'bg-[#C13584]',
          icon: (
            <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 448 512" fill="currentColor">
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
            </svg>
          ),
          label: 'Reels'
        };
      default:
        return {
          bgColor: 'bg-gray-700',
          icon: null,
          label: 'Link'
        };
    }
  };

  const platformBadge = getPlatformBadge();

  // Get thumbnail for the link
  const getThumbnailImage = () => {
    // Default placeholder based on platform
    const generatePlaceholder = (text: string) => {
      return `https://placehold.co/800x450?text=${encodeURIComponent(text)}`;
    };
    
    if (link.thumbnail_url) {
      return link.thumbnail_url;
    }
    
    // Fallback to platform-specific placeholder
    switch (link.platform) {
      case 'tiktok':
        return generatePlaceholder('TikTok Video');
      case 'youtube':
        return generatePlaceholder('YouTube Short');
      case 'instagram':
        return generatePlaceholder('Instagram Reel');
      default:
        return generatePlaceholder('No Thumbnail');
    }
  };

  if (viewMode === "list") {
    return (
      <Card className="flex items-center p-4 hover:shadow-md transition-shadow">
        <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0 mr-4">
          <img 
            src={getThumbnailImage()} 
            className="w-full h-full object-cover" 
            alt={link.title} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            <Badge variant="secondary" className={`${platformBadge.bgColor} text-white text-xs px-2 py-0.5 rounded-md flex items-center gap-1 mr-2`}>
              {platformBadge.icon}
              <span>{platformBadge.label}</span>
            </Badge>
            <span className="text-xs text-gray-500">{formatDate(link.created_at)}</span>
          </div>
          
          <h3 className="font-medium text-sm line-clamp-1 mb-1">{link.title}</h3>
          
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1 mr-1">
              {link.tags.slice(0, 3).map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="outline" 
                  className="bg-blue-100 text-blue-800 text-xs border-blue-200 cursor-pointer hover:bg-blue-200 transition-colors group relative"
                  title="Click to filter by this tag"
                  onClick={() => onTagClick && onTagClick(tag.name)}
                >
                  {tag.name}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Filter by tag
                  </span>
                </Badge>
              ))}
              {link.tags.length > 3 && (
                <Badge variant="outline" className="bg-gray-100 text-gray-800 text-xs border-gray-200">
                  +{link.tags.length - 3}
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex items-center"
              onClick={onEditTags}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <span className="text-xs">Edit</span>
            </Button>
          </div>
        </div>
        
        <div className="ml-2">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(link.url, "_blank")}>
                Open Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEditTags}>
                Edit Tags
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => deleteLink()}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={getThumbnailImage()} 
          className="w-full aspect-video object-cover" 
          alt={link.title} 
        />
        <div className={`absolute top-3 left-3 ${platformBadge.bgColor} text-white rounded-md px-2 py-1 text-xs font-medium flex items-center gap-1`}>
          {platformBadge.icon}
          <span>{platformBadge.label}</span>
        </div>
        {link.duration && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white rounded-md px-2 py-1 text-xs">
            {link.duration}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium line-clamp-2 mb-2" title={link.title}>
          {link.title}
        </h3>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-wrap gap-2">
            {link.tags.map((tag) => (
              <Badge 
                key={tag.id} 
                variant="outline" 
                className="bg-blue-100 text-blue-800 text-xs border-blue-200 cursor-pointer hover:bg-blue-200 transition-colors group relative"
                title="Click to filter by this tag"
                onClick={() => onTagClick && onTagClick(tag.name)}
              >
                {tag.name}
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Filter by tag
                </span>
              </Badge>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex items-center"
            onClick={onEditTags}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span className="text-xs">Edit Tags</span>
          </Button>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatDate(link.created_at)}</span>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(link.url, "_blank")}>
                Open Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEditTags}>
                Edit Tags
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => deleteLink()}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

export default ContentItem;
