import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { CustomTabWithLinks } from '@shared/schema';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { 
  BookmarkIcon, 
  FolderIcon, 
  TagIcon, 
  StarIcon, 
  HeartIcon, 
  GraduationCapIcon as AcademicCapIcon,
  BeakerIcon,
  BriefcaseIcon,
  CodeIcon,
  CurrencyIcon as CurrencyDollarIcon,
  MusicIcon as MusicalNoteIcon,
  VideoIcon as VideoCameraIcon,
  GlobeIcon as GlobeAltIcon,
  HomeIcon,
  Loader2 as Loader2Icon
} from "lucide-react";
import CreateCustomTabDialog from './CreateCustomTabDialog';

interface CustomTabsListProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const CustomTabsList: React.FC<CustomTabsListProps> = ({ activeTab, onTabChange }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<CustomTabWithLinks | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query custom tabs - only fetch when we have a valid user session
  const { data: customTabs = [], isLoading, isError } = useQuery<CustomTabWithLinks[]>({
    queryKey: ['/api/custom-tabs'],
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (error) => {
      console.error("Error fetching custom tabs:", error);
    }
  });

  // Delete custom tab mutation
  const deleteTabMutation = useMutation({
    mutationFn: async (tabId: number) => {
      await apiRequest('DELETE', `/api/custom-tabs/${tabId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-tabs'] });
      toast({
        title: 'Success',
        description: 'Tab deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting tab:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tab. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const confirmDeleteTab = (tab: CustomTabWithLinks) => {
    setTabToDelete(tab);
  };

  const handleDeleteTab = async () => {
    if (tabToDelete) {
      deleteTabMutation.mutate(tabToDelete.id);
      setTabToDelete(null);
      
      // If the deleted tab was active, switch to 'All' tab
      if (activeTab === `custom-${tabToDelete.id}`) {
        onTabChange('all');
      }
    }
  };

  const handleTabClick = (tabId: number) => {
    onTabChange(`custom-${tabId}`);
  };

  // Get the appropriate icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'bookmark':
        return <BookmarkIcon className="h-4 w-4" />;
      case 'tag':
        return <TagIcon className="h-4 w-4" />;
      case 'star':
        return <StarIcon className="h-4 w-4" />;
      case 'heart':
        return <HeartIcon className="h-4 w-4" />;
      case 'academic':
        return <AcademicCapIcon className="h-4 w-4" />;
      case 'beaker':
        return <BeakerIcon className="h-4 w-4" />;
      case 'briefcase':
        return <BriefcaseIcon className="h-4 w-4" />;
      case 'code':
        return <CodeIcon className="h-4 w-4" />;
      case 'money':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'music':
        return <MusicalNoteIcon className="h-4 w-4" />;
      case 'video':
        return <VideoCameraIcon className="h-4 w-4" />;
      case 'globe':
        return <GlobeAltIcon className="h-4 w-4" />;
      case 'home':
        return <HomeIcon className="h-4 w-4" />;
      case 'folder':
      default:
        return <FolderIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Custom Tabs</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCreateDialogOpen(true)}
          className="h-6 w-6"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="h-auto max-h-40">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2Icon className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="py-2 px-2">
            <p className="text-xs text-amber-600 text-center">
              Unable to load custom tabs. Please sign in to view your tabs.
            </p>
          </div>
        ) : customTabs.length > 0 ? (
          <div className="space-y-1">
            {customTabs.map((tab: CustomTabWithLinks) => (
              <div key={tab.id} className="flex items-center">
                <Button
                  variant={activeTab === `custom-${tab.id}` ? "secondary" : "ghost"}
                  size="sm"
                  className="justify-start w-full h-7 px-2 text-xs"
                  onClick={() => handleTabClick(tab.id)}
                >
                  <span className="mr-2">{getIconComponent(tab.icon || 'folder')}</span>
                  <span className="truncate">{tab.name}</span>
                  {tab.links && tab.links.length > 0 && (
                    <span className="ml-auto bg-muted rounded-full px-1.5 py-0.5 text-[0.6rem]">
                      {tab.links.length}
                    </span>
                  )}
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteTab(tab);
                        }}
                      >
                        <TrashIcon className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete tab</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            No custom tabs created
          </p>
        )}
      </ScrollArea>
      
      <Separator className="my-2" />

      <CreateCustomTabDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/custom-tabs'] });
        }}
      />

      <AlertDialog open={!!tabToDelete} onOpenChange={(open) => !open && setTabToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tab "{tabToDelete?.name}".
              {tabToDelete?.links && tabToDelete.links.length > 0 && (
                <span className="block mt-2 font-medium">
                  Note: This will not delete the links themselves, only remove them from this tab.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTab}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomTabsList;