import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag, Link, LinkWithTags } from "@shared/schema";
import { SidebarProvider } from "@/components/ui/sidebar";
import CustomSidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/hooks/useAuth";
import MobileNavigation from "@/components/MobileNavigation";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function TagsPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for links
  const { data: links = [], isLoading: isLinksLoading } = useQuery<LinkWithTags[]>({
    queryKey: ["/api/links"],
  });

  // Extract all unique tags from links
  const allTags: Tag[] = [];
  const tagMap = new Map<number, Tag>();
  
  links.forEach(link => {
    link.tags?.forEach(tag => {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, tag);
        allTags.push(tag);
      }
    });
  });

  // Filter tags based on search query
  const filteredTags = searchQuery
    ? allTags.filter(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allTags;

  // Group links by tag
  const linksByTag = new Map<number, Link[]>();
  
  allTags.forEach(tag => {
    const tagLinks = links.filter(link => 
      link.tags?.some(t => t.id === tag.id)
    );
    linksByTag.set(tag.id, tagLinks);
  });

  // Mutation for creating a new tag
  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/tags", { name });
    },
    onSuccess: () => {
      toast({
        title: "Tag created",
        description: "Your new tag has been created successfully",
      });
      setNewTagName("");
      setIsCreateTagOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: (error) => {
      toast({
        title: "Error creating tag",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a tag
  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: number) => {
      return apiRequest("DELETE", `/api/tags/${tagId}`);
    },
    onSuccess: () => {
      toast({
        title: "Tag deleted",
        description: "The tag has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting tag",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTagMutation.mutate(newTagName.trim());
    }
  };

  const handleDeleteTag = (tagId: number) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      deleteTagMutation.mutate(tagId);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <CustomSidebar user={user} isLoading={isUserLoading} />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <TopBar user={user} />
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold">Tags</h1>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full"
                    />
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  <Button onClick={() => setIsCreateTagOpen(true)}>
                    Create Tag
                  </Button>
                </div>
              </div>

              {isLinksLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 h-32 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTags.length === 0 ? (
                <div className="text-center py-16">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h3 className="font-medium text-gray-900 mb-1">No tags found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? "Try another search term" : "Create tags to organize your content"}
                  </p>
                  <Button onClick={() => setIsCreateTagOpen(true)}>Create Tag</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTags.map((tag) => {
                    const tagLinks = linksByTag.get(tag.id) || [];
                    return (
                      <div key={tag.id} className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <h3 className="font-medium text-gray-900">{tag.name}</h3>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            {tagLinks.length}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Usage</div>
                          <Progress value={(tagLinks.length / links.length) * 100} className="h-1.5" />
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {/* Implement view content */}}
                          >
                            View Content
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                            onClick={() => handleDeleteTag(tag.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
          
          <MobileNavigation onAddLinkClick={() => {}} />
        </div>
        
        <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
              <DialogDescription>
                Add a new tag to organize your content library.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="tag-name">Tag Name</Label>
                <Input
                  id="tag-name"
                  placeholder="Enter a tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateTagOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTag}
                disabled={!newTagName.trim() || createTagMutation.isPending}
              >
                {createTagMutation.isPending ? "Creating..." : "Create Tag"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}