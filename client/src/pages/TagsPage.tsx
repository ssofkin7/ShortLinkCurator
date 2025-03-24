import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag, Link, LinkWithTags } from "@shared/schema";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { useLocation } from "wouter";

export default function TagsPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Query for links
  const { data: links = [], isLoading: isLinksLoading } = useQuery<LinkWithTags[]>({
    queryKey: ["/api/links"],
  });

  // Extract all unique tags from links and sort them alphabetically
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

  // Sort tags alphabetically by name
  allTags.sort((a, b) => a.name.localeCompare(b.name));

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

  // Get most used tags (top 5)
  const mostUsedTags = [...allTags]
    .sort((a, b) => {
      const aCount = linksByTag.get(a.id)?.length || 0;
      const bCount = linksByTag.get(b.id)?.length || 0;
      return bCount - aCount;
    })
    .slice(0, 5);

  // Get recently used tags based on link creation date
  const recentTags = [...allTags]
    .sort((a, b) => {
      const aLinks = linksByTag.get(a.id) || [];
      const bLinks = linksByTag.get(b.id) || [];
      const aLatest = Math.max(...aLinks.map(link => new Date(link.created_at).getTime()));
      const bLatest = Math.max(...bLinks.map(link => new Date(link.created_at).getTime()));
      return bLatest - aLatest;
    })
    .slice(0, 5);

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

  const navigateToLibrary = (tagName: string) => {
    // Navigate to library page with tag filter
    setLocation(`/library?tag=${encodeURIComponent(tagName)}`);
  };

  // Generate a color based on tag name for visual variety
  const getTagColor = (tagName: string) => {
    const colors = [
      "bg-blue-50 text-blue-700",
      "bg-green-50 text-green-700",
      "bg-purple-50 text-purple-700",
      "bg-amber-50 text-amber-700",
      "bg-rose-50 text-rose-700",
      "bg-indigo-50 text-indigo-700",
      "bg-cyan-50 text-cyan-700",
      "bg-emerald-50 text-emerald-700"
    ];
    
    // Simple hash function to get a consistent color for each tag name
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <CustomSidebar user={user} isLoading={isUserLoading} />
      
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <TopBar user={user} />
        
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold">Tag Management</h1>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
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
              
              <Button 
                onClick={() => setIsCreateTagOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Tag
              </Button>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Tags</CardDescription>
                <CardTitle className="text-3xl">{allTags.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Used across {links.length} content items
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Most Used Tag</CardDescription>
                <CardTitle className="text-lg truncate">
                  {mostUsedTags.length > 0 ? mostUsedTags[0].name : "None"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {mostUsedTags.length > 0 
                    ? `Used in ${linksByTag.get(mostUsedTags[0].id)?.length || 0} items` 
                    : "No tag usage data yet"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Recently Added</CardDescription>
                <CardTitle className="text-lg truncate">
                  {recentTags.length > 0 ? recentTags[0].name : "None"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {recentTags.length > 0 
                    ? `Added on ${new Date(recentTags[0].created_at).toLocaleDateString()}` 
                    : "No recent tags"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          {isLinksLoading ? (
            <div className="grid grid-cols-1 gap-6">
              <Card className="animate-pulse">
                <CardHeader className="bg-gray-50">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="h-8 bg-gray-100 rounded-md"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : filteredTags.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h3 className="font-medium text-gray-900 mb-1">No tags found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery ? "Try another search term" : "Create tags to organize your content"}
                </p>
                <Button onClick={() => setIsCreateTagOpen(true)}>Create Tag</Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 mb-2">
                <TabsTrigger value="all">All Tags ({allTags.length})</TabsTrigger>
                <TabsTrigger value="most-used">Most Used</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
              
              {/* All Tags Tab */}
              <TabsContent value="all">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>All Tags</CardTitle>
                    <CardDescription>
                      Click on a tag to view content with that tag
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {filteredTags.map((tag) => {
                        const tagLinks = linksByTag.get(tag.id) || [];
                        const tagColor = getTagColor(tag.name);
                        
                        return (
                          <div 
                            key={tag.id} 
                            className="border rounded-md p-3 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge 
                                variant="outline" 
                                className={`${tagColor} px-2 py-0.5`}
                              >
                                {tagLinks.length}
                              </Badge>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 rounded-full p-0 text-gray-400 hover:text-red-500"
                                onClick={() => handleDeleteTag(tag.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </Button>
                            </div>
                            
                            <div onClick={() => navigateToLibrary(tag.name)} className="cursor-pointer">
                              <h3 className="font-medium text-sm text-gray-900 truncate">
                                {tag.name}
                              </h3>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Most Used Tags Tab */}
              <TabsContent value="most-used">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Most Used Tags</CardTitle>
                      <CardDescription>
                        Tags ranked by usage frequency
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {mostUsedTags.length > 0 ? (
                        <div className="space-y-4">
                          {mostUsedTags.map((tag) => {
                            const tagLinks = linksByTag.get(tag.id) || [];
                            const tagColor = getTagColor(tag.name);
                            const usagePercentage = (tagLinks.length / links.length) * 100;
                            
                            return (
                              <div key={tag.id} className="flex items-center space-x-4 p-3 border rounded-md hover:shadow-sm transition-shadow">
                                <Badge 
                                  variant="outline" 
                                  className={`${tagColor} px-2 py-0.5 mr-2 min-w-[32px] text-center`}
                                >
                                  {tagLinks.length}
                                </Badge>
                                <div className="flex-1" onClick={() => navigateToLibrary(tag.name)}>
                                  <h3 className="font-medium text-sm cursor-pointer">{tag.name}</h3>
                                  <div className="w-full mt-2">
                                    <Progress value={usagePercentage} className="h-2" />
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 rounded-full p-0 text-gray-400 hover:text-red-500"
                                  onClick={() => handleDeleteTag(tag.id)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          No tags found. Add tags to your content to see usage statistics.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Tag Usage</CardTitle>
                      <CardDescription>
                        Distribution of content by tags
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px] flex items-center justify-center">
                        <div className="text-center">
                          <p className="mb-2 text-lg font-medium">Tag Usage Chart</p>
                          <p className="text-gray-500">Charts feature coming soon</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Recent Tags Tab */}
              <TabsContent value="recent">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Recently Used Tags</CardTitle>
                      <CardDescription>
                        Tags used in your latest content
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recentTags.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {recentTags.map((tag) => {
                            const tagLinks = linksByTag.get(tag.id) || [];
                            const tagColor = getTagColor(tag.name);
                            
                            return (
                              <div key={tag.id} className="flex items-center p-3 border rounded-md hover:shadow-md transition-shadow">
                                <div className="flex-1" onClick={() => navigateToLibrary(tag.name)}>
                                  <h3 className="font-medium cursor-pointer">{tag.name}</h3>
                                  <div className="flex items-center mt-1">
                                    <Badge 
                                      variant="outline" 
                                      className={`${tagColor} px-2 py-0.5 mr-2`}
                                    >
                                      {tagLinks.length} items
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      Latest: {
                                        tagLinks.length > 0 
                                        ? new Date(Math.max(...tagLinks.map(link => new Date(link.created_at).getTime()))).toLocaleDateString()
                                        : 'N/A'
                                      }
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 rounded-full p-0 text-gray-400 hover:text-red-500 ml-2"
                                  onClick={() => handleDeleteTag(tag.id)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          No recent tags found. Start adding tags to your content.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Tag Activity</CardTitle>
                      <CardDescription>
                        Tag creation over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px] flex items-center justify-center">
                        <div className="text-center">
                          <p className="mb-2 text-lg font-medium">Tag Timeline</p>
                          <p className="text-gray-500">Charts feature coming soon</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation onAddLinkClick={() => {}} />
      
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createTagMutation.isPending ? "Creating..." : "Create Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}