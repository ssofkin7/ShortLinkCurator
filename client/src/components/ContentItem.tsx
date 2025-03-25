import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LinkWithTags, CustomTabWithLinks } from "@shared/schema";
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import EditTitleDialog from "./EditTitleDialog";
import CreateCustomTabDialog from "./CreateCustomTabDialog";

interface ContentItemProps {
  link: LinkWithTags;
  viewMode: "grid" | "list";
  onEditTags: (e?: React.MouseEvent) => void;
  onTagClick?: (tagName: string, e?: React.MouseEvent) => void;
  customTabId?: number; // Optional ID of the custom tab when viewing from a custom tab page
  onRemoveFromTab?: () => void; // Callback when removing from a tab
}

const ContentItem = ({ 
  link, 
  viewMode, 
  onEditTags, 
  onTagClick,
  customTabId,
  onRemoveFromTab
}: ContentItemProps) => {
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewTagsModalOpen, setViewTagsModalOpen] = useState(false);
  const [editTitleDialogOpen, setEditTitleDialogOpen] = useState(false);
  const [isCreateTabDialogOpen, setIsCreateTabDialogOpen] = useState(false);
  const [showTags, setShowTags] = useState(false);

  // Fetch custom tabs
  const { data: customTabs = [], isLoading: isLoadingTabs } = useQuery<CustomTabWithLinks[]>({
    queryKey: ['/api/custom-tabs'],
    staleTime: 1000 * 60, // 1 minute
  });

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

  // Add link to tab mutation
  const { mutate: addLinkToTab, isPending: isAddingToTab } = useMutation({
    mutationFn: async (tabId: number) => {
      console.log(`Adding link ID ${link.id} to tab ID ${tabId}`);
      try {
        const response = await apiRequest("POST", `/api/custom-tabs/${tabId}/links/${link.id}`);
        console.log("Successfully added link to tab, response:", response);
        return response;
      } catch (error) {
        console.error(`Failed to add link ID ${link.id} to tab ID ${tabId}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Link added to tab",
        description: "The link has been added to the selected tab",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-tabs"] });
    },
    onError: (error) => {
      console.error("Error adding link to tab:", error);
      toast({
        title: "Failed to add link to tab",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });

  // Remove link from tab mutation
  const { mutate: removeLinkFromTab, isPending: isRemovingFromTab } = useMutation({
    mutationFn: async () => {
      if (!customTabId) {
        throw new Error("Tab ID is required");
      }
      console.log(`Removing link ID ${link.id} from tab ID ${customTabId}`);
      try {
        const response = await apiRequest("DELETE", `/api/custom-tabs/${customTabId}/links/${link.id}`);
        console.log("Successfully removed link from tab, response:", response);
        return response;
      } catch (error) {
        console.error(`Failed to remove link ID ${link.id} from tab ID ${customTabId}:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Link removed from tab",
        description: "The link has been removed from the tab",
      });
      if (onRemoveFromTab) {
        onRemoveFromTab();
      }
    },
    onError: (error) => {
      console.error("Error removing link from tab:", error);
      toast({
        title: "Failed to remove link from tab",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });

  // Platform specific properties
  interface PlatformBadge {
    bgColor: string;
    icon: React.ReactNode;
  }

  const getPlatformBadge = (): PlatformBadge => {
    switch (link.platform) {
      // Video platforms
      case 'tiktok':
        return {
          bgColor: 'bg-[#EE1D52]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
              <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
            </svg>
          )
        };
      case 'youtube':
        return {
          bgColor: 'bg-[#FF0000]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 576 512" fill="currentColor">
              <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/>
            </svg>
          )
        };
      case 'instagram':
        return {
          bgColor: 'bg-[#C13584]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
            </svg>
          )
        };
      case 'facebook':
        return {
          bgColor: 'bg-[#1877F2]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 320 512" fill="currentColor">
              <path d="M279.1 288l14.2-92.7h-88.9v-60.1c0-25.4 12.4-50.1 52.2-50.1h40.4V6.3S260.4 0 225.4 0c-73.2 0-121.1 44.4-121.1 124.7v70.6H22.9V288h81.4v224h100.2V288z"/>
            </svg>
          )
        };
      case 'vimeo':
        return {
          bgColor: 'bg-[#1AB7EA]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
              <path d="M447.8 153.6c-2 43.6-32.4 103.3-91.4 179.1-60.9 79.2-112.4 118.8-154.6 118.8-26.1 0-48.2-24.1-66.3-72.3C100.3 250 85.3 174.3 56.2 174.3c-3.4 0-15.1 7.1-35.2 21.1L0 168.2c51.6-45.3 100.9-95.7 131.8-98.5 34.9-3.4 56.3 20.5 64.4 71.5 28.7 181.5 41.4 208.9 93.6 126.7 18.7-29.6 28.8-52.1 30.2-67.6 4.8-45.9-35.8-42.8-63.3-31 22-72.1 64.1-107.1 126.2-105.1 45.8 1.2 67.5 31.1 64.9 89.4z"/>
            </svg>
          )
        };

      // Social Media Platforms
      case 'twitter':
        return {
          bgColor: 'bg-[#1DA1F2]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
              <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
            </svg>
          )
        };
      case 'linkedin':
        return {
          bgColor: 'bg-[#0077B5]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
              <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/>
            </svg>
          )
        };
      case 'reddit':
        return {
          bgColor: 'bg-[#FF4500]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
              <path d="M201.5 305.5c-13.8 0-24.9-11.1-24.9-24.6 0-13.8 11.1-24.9 24.9-24.9 13.6 0 24.6 11.1 24.6 24.9 0 13.6-11.1 24.6-24.6 24.6zM504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zm-132.3-41.2c-9.4-9.4-21.5-14.2-34.4-14.2s-25.1 4.8-34.4 14.2c-2.9 2.9-3.2 7.5-.8 10.8 2.4 3.3 7 3.8 10.2 1.5 6-5.7 13.9-8.9 22.3-8.9 8.5 0 16.5 3.2 22.5 8.9 3.3 3.2 7.8 2.7 10.3-.6 2.3-3.4 2-7.5-.7-10.7zm-9.8 65.2c-4.1-2.3-8.5-4.3-13.1-5.9l8.8-3c3.4-1.1 4.4-5.4 2.1-8.1-2.2-2.9-6.4-3.6-9.1-1.6l-14.4 10c-10.9-5.6-23.1-9.3-36-10.8l6.8-11.8c2-3.5.2-7.9-3.9-9.3-3.2-1.2-7 .4-8.6 3.8l-7.7 13.3c-39.7 4-71.4 27.4-81.7 58.9-9 26.7-5.3 55.7 10.2 80.5 15.5 24.7 41.3 41.5 71.8 46.9 30.1 5.3 62.3-.8 89.4-17.1 19-11.4 34.4-27.5 44.7-46.5 10.3-19.1 15.1-40.6 13.7-61.6-1.3-20.5-8.2-39.7-19.9-55.4-3.1-4.2-8.9-5.1-13.4-2.3z"/>
            </svg>
          )
        };

      // Content Platforms
      case 'medium':
        return {
          bgColor: 'bg-[#02b875]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
              <path d="M71.5 142.3c.6-5.9-1.7-11.8-6.1-15.8L20.3 72.1V64h140.2l108.4 237.7L364.2 64h133.7v8.1l-38.6 37c-3.3 2.5-5 6.7-4.3 10.8v272c-.7 4.1 1 8.3 4.3 10.8l37.7 37v8.1H307.3v-8.1l39.1-37.9c3.8-3.8 3.8-5 3.8-10.8V171.2L241.5 447.1h-14.7L100.4 171.2v184.9c-1.1 7.8 1.5 15.6 7 21.2l50.8 61.6v8.1h-144v-8L65 377.3c5.4-5.6 7.9-13.5 6.5-21.2V142.3z"/>
            </svg>
          )
        };
      case 'substack':
        return {
          bgColor: 'bg-[#FF6719]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
            </svg>
          )
        };
      case 'github':
        return {
          bgColor: 'bg-[#161614]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 496 512" fill="currentColor">
              <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.77-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/>
            </svg>
          )
        };

      // Generic Types
      case 'article':
        return {
          bgColor: 'bg-[#6C5CE7]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          )
        };
      case 'document':
        return {
          bgColor: 'bg-[#E74C3C]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          )
        };
      case 'webpage':
        return {
          bgColor: 'bg-[#3498DB]',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          )
        };

      // Default fallback
      default:
        return {
          bgColor: 'bg-gray-700',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
              <path d="M320 0H64C28.7 0 0 28.7 0 64v288c0 35.3 28.7 64 64 64h47.5 4.5c16.6 0 32.5-6.6 44.2-18.3l76.2-76.2c13.7-13.7 32.2-21.5 51.5-21.5h76.8c19.3 0 37.8 7.7 51.5 21.5l76.2 76.2c11.8 11.8 27.6 18.3 44.2 18.3h4.5H384c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64h-8.2c-25.3 0-49.5-10.1-67.3-27.9L274.8 34.3C257 16.5 232.8 6.4 207.5 6.4H192C174.3 6.4 160 20.7 160 38.4V96c0 17.7 14.3 32 32 32h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32-14.3-32-32V38.4C96 20.7 81.7 6.4 64 6.4H32C14.3 6.4 0 20.7 0 38.4V416c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V384c0-17.7-14.3-32-32-32s-32 14.3-32 32v32c0 17.7-14.3 32-32 32H64c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32H320c17.7 0 32 14.3 32 32v32c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-35.3-28.7-64-64-64z"/>
            </svg>
          )
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
        return generatePlaceholder('TikTok');
      case 'youtube':
        return generatePlaceholder('YouTube');
      case 'instagram':
        return generatePlaceholder('Instagram');
      case 'facebook':
        return generatePlaceholder('Facebook');
      case 'vimeo':
        return generatePlaceholder('Vimeo');
      case 'twitter':
        return generatePlaceholder('Twitter');
      case 'linkedin':
        return generatePlaceholder('LinkedIn');
      case 'reddit':
        return generatePlaceholder('Reddit');
      case 'medium':
        return generatePlaceholder('Medium');
      case 'substack':
        return generatePlaceholder('Substack');
      case 'github':
        return generatePlaceholder('GitHub');
      case 'article':
        return generatePlaceholder('Article');
      case 'document':
        return generatePlaceholder('Document');
      case 'webpage':
        return generatePlaceholder('Web Page');
      default:
        return generatePlaceholder('Content');
    }
  };

  const renderListView = () => (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <div className="flex p-3">
        <div 
          className="relative w-24 min-w-24 h-16 mr-3 overflow-hidden cursor-pointer"
          onClick={() => window.open(link.url, "_blank")}
        >
          <img
            src={getThumbnailImage()}
            alt={link.title}
            className="h-full w-full object-cover rounded-sm"
          />
          <div className="absolute top-1 left-1">
            <div className={`${platformBadge.bgColor} rounded-full p-1 flex items-center justify-center text-white`}>
              {platformBadge.icon}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 
              className="font-medium text-gray-900 truncate cursor-pointer hover:text-indigo-600"
              onClick={(e) => {
                e.preventDefault();
                setEditTitleDialogOpen(true);
              }}
            >
              {link.title}
            </h3>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(link.url, "_blank")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  Open Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setEditTitleDialogOpen(true);
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Title
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  setShowTags(!showTags);
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                  {showTags ? 'Hide Tags' : 'Show Tags'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEditTags(e);
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Edit Tags
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Move to Tab
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
                    {isLoadingTabs ? (
                      <DropdownMenuItem disabled>
                        Loading tabs...
                      </DropdownMenuItem>
                    ) : customTabs.length > 0 ? (
                      <>
                        {customTabs.map((tab) => (
                          <DropdownMenuItem
                            key={tab.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Check if link is already in this tab
                              const isInTab = tab.links && tab.links.some(l => l.id === link.id);
                              if (isInTab) {
                                toast({
                                  title: "Already in tab",
                                  description: `This link is already in the "${tab.name}" tab`,
                                });
                                return;
                              }

                              // Add link to tab
                              addLinkToTab(tab.id);
                            }}
                          >
                            {tab.name}
                          </DropdownMenuItem>
                        ))}
                      </>
                    ) : (
                      <DropdownMenuItem disabled>
                        No custom tabs available
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCreateTabDialogOpen(true);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Create New Tab
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                {customTabId && onRemoveFromTab && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm("Are you sure you want to remove this link from the current tab? The link will still be available in your library.")) {
                        removeLinkFromTab();
                      }
                    }}
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                    disabled={isRemovingFromTab}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M10 11V6l-4 4 4 4v-5H20"></path>
                      <path d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"></path>
                    </svg>
                    {isRemovingFromTab ? "Removing..." : "Remove from Tab"}
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this link?")) {
                      deleteLink();
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isDeleting}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            {link.last_viewed ? (
              <span>Viewed {formatDate(new Date(link.last_viewed))}</span>
            ) : (
              <span>Added {formatDate(new Date(link.created_at))}</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {link.category && (
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                {link.category}
              </Badge>
            )}
            {showTags && link.tags && link.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTagClick) onTagClick(tag.name, e);
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {showTags && link.tags && link.tags.length > 3 && (
              <Badge
                variant="outline"
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewTagsModalOpen(true);
                }}
              >
                +{link.tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const renderGridView = () => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div 
        className="relative aspect-video cursor-pointer"
        onClick={() => window.open(link.url, "_blank")}
      >
        <img
          src={getThumbnailImage()}
          alt={link.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <div className={`${platformBadge.bgColor} rounded-full p-1.5 flex items-center justify-center text-white`}>
            {platformBadge.icon}
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 
            className="font-medium text-gray-900 truncate cursor-pointer hover:text-indigo-600 text-sm"
            onClick={(e) => {
              e.preventDefault();
              setEditTitleDialogOpen(true);
            }}
          >
            {link.title}
          </h3>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(link.url, "_blank")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Open Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setEditTitleDialogOpen(true);
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                setShowTags(!showTags);
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                {showTags ? 'Hide Tags' : 'Show Tags'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEditTags(e);
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Edit Tags
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Move to Tab
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
                  {isLoadingTabs ? (
                    <DropdownMenuItem disabled>
                      Loading tabs...
                    </DropdownMenuItem>
                  ) : customTabs.length > 0 ? (
                    <>
                      {customTabs.map((tab) => (
                        <DropdownMenuItem
                          key={tab.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Check if link is already in this tab
                            // Ensure tab.links exists and is an array
                            if (!tab || !tab.id) {
                              console.error("Tab is undefined or missing ID");
                              toast({
                                title: "Error",
                                description: "Could not add to tab - invalid tab data",
                                variant: "destructive"
                              });
                              return;
                            }

                            const isInTab = tab.links && Array.isArray(tab.links) && tab.links.some(l => l && l.id === link.id);
                            console.log(`Checking if link ${link.id} is in tab ${tab.id} (${tab.name}): ${isInTab}`);

                            if (isInTab) {
                              toast({
                                title: "Already in tab",
                                description: `This link is already in the "${tab.name}" tab`,
                              });
                              return;
                            }

                            // Add link to tab
                            console.log(`Adding link ${link.id} to tab ${tab.id} (${tab.name})`);
                            addLinkToTab(tab.id);
                          }}
                        >
                          {tab.name}
                        </DropdownMenuItem>
                      ))}
                    </>
                  ) : (
                    <DropdownMenuItem disabled>
                      No custom tabs available
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreateTabDialogOpen(true);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create New Tab
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {customTabId && onRemoveFromTab && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm("Are you sure you want to remove this link from the current tab? The link will still be available in your library.")) {
                      removeLinkFromTab();
                    }
                  }}
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                  disabled={isRemovingFromTab}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M10 11V6l-4 4 4 4v-5H20"></path>
                    <path d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"></path>
                  </svg>
                  {isRemovingFromTab ? "Removing..." : "Remove from Tab"}
                </DropdownMenuItem>
              )}

              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Are you sure you want to delete this link?")) {
                    deleteLink();
                  }
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isDeleting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center text-xs text-gray500 mt-1">
            {link.last_viewed ? (
              <span>Viewed {formatDate(new Date(link.last_viewed))}</span>
            ) : (
              <span>Added {formatDate(new Date(link.created_at))}</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {link.category && (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 text-xs">
                {link.category}
              </Badge>
            )}
            {showTags && link.tags && link.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="cursor-pointer text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTagClick) onTagClick(tag.name, e);
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {showTags && link.tags && link.tags.length > 2 && (
              <Badge
                variant="outline"
                className="cursor-pointer text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewTagsModalOpen(true);
                }}
              >
                +{link.tags.length - 2} more
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      {viewMode === "list" ? renderListView() : renderGridView()}

      {/* View Tags Modal */}
      <Dialog open={viewTagsModalOpen} onOpenChange={setViewTagsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tags for {link.title}</DialogTitle>
            <DialogDescription>
              All tags associated with this content
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            {link.tags && link.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {link.tags && link.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="px-3 py-1 text-sm cursor-pointer"
                    onClick={(e) => {
                      if (onTagClick) {
                        setViewTagsModalOpen(false);
                        onTagClick(tag.name, e);
                      }
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No tags for this content</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTagsModalOpen(false)}>
              Close
            </Button>
            <Button onClick={(e) => {
              setViewTagsModalOpen(false);
              onEditTags(e);
            }}>
              Edit Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Title Dialog */}
      {editTitleDialogOpen && (
        <EditTitleDialog
          link={link}
          isOpen={editTitleDialogOpen}
          onClose={() => setEditTitleDialogOpen(false)}
          onSuccess={() => {
            setEditTitleDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["/api/links"] });
          }}
        />
      )}

      {/* Create Custom Tab Dialog */}
      {isCreateTabDialogOpen && (
        <CreateCustomTabDialog
          isOpen={isCreateTabDialogOpen}
          onClose={() => setIsCreateTabDialogOpen(false)}
          onSuccess={() => {
            setIsCreateTabDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["/api/custom-tabs"] });
          }}
        />
      )}
    </>
  );
};

export default ContentItem;