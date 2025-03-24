import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LinkWithTags } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TagCorrectionModalProps {
  link: LinkWithTags;
  onClose: () => void;
}

const TagCorrectionModal = ({ link, onClose }: TagCorrectionModalProps) => {
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>(link.tags.map(tag => tag.name));
  const [newTag, setNewTag] = useState("");
  const [category, setCategory] = useState(link.category);

  // Category options
  const categories = [
    "Cooking",
    "Fitness",
    "DIY",
    "Technology",
    "Fashion",
    "Travel",
    "Education",
    "Entertainment",
    "Finance",
    "Music",
    "Gaming",
    "Art",
    "Sports",
    "Beauty",
    "Health",
    "Science",
    "Productivity",
    "Wellness",
    "Lifestyle",
    "Comedy"
  ];

  // Add a new tag
  const handleAddTag = () => {
    if (newTag.trim() === "") return;
    
    if (!tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
    }
    setNewTag("");
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle pressing Enter to add a tag
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Update category mutation
  const { mutate: updateCategory, isPending: isUpdatingCategory } = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/links/${link.id}/category`, { category });
    },
    onSuccess: () => {
      toast({
        title: "Category updated",
        description: "The category has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update category",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });

  // Update tags mutation
  const { mutate: updateTags, isPending: isUpdatingTags } = useMutation({
    mutationFn: async () => {
      // First delete all existing tags
      await Promise.all(link.tags.map(tag => 
        apiRequest("DELETE", `/api/tags/${tag.id}`)
      ));

      // Then create new tags
      await Promise.all(tags.map(tagName => 
        apiRequest("POST", `/api/tags`, {
          name: tagName,
          link_id: link.id
        })
      ));
    },
    onSuccess: () => {
      toast({
        title: "Tags updated",
        description: "The tags have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update tags",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });

  // Save changes
  const handleSave = async () => {
    // Update category if changed
    if (category !== link.category) {
      updateCategory();
    }
    
    // Update tags if changed
    const originalTags = link.tags.map(tag => tag.name);
    if (JSON.stringify(tags.sort()) !== JSON.stringify(originalTags.sort())) {
      updateTags();
    }
    
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Tags</DialogTitle>
          <DialogDescription>
            AI generated tags for your content. You can edit or remove them to improve future suggestions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-5">
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-blue-100 text-blue-800 text-sm px-3 py-1.5 rounded-md flex items-center gap-1.5 border-blue-200"
              >
                <span>{tag}</span>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Add new tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2.5 rounded-lg border"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 p-1 h-auto"
              onClick={handleAddTag}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </Button>
          </div>
        </div>
        
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isUpdatingCategory || isUpdatingTags}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TagCorrectionModal;
