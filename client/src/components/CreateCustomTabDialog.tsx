import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  BookmarkIcon, 
  FolderIcon, 
  TagIcon, 
  StarIcon, 
  HeartIcon, 
  AcademicCapIcon,
  BeakerIcon,
  BriefcaseIcon,
  CodeIcon,
  CurrencyDollarIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  GlobeAltIcon,
  HomeIcon
} from "lucide-react";

interface CreateCustomTabDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ICON_OPTIONS = [
  { value: "folder", label: "Folder", icon: <FolderIcon className="h-4 w-4" /> },
  { value: "bookmark", label: "Bookmark", icon: <BookmarkIcon className="h-4 w-4" /> },
  { value: "tag", label: "Tag", icon: <TagIcon className="h-4 w-4" /> },
  { value: "star", label: "Star", icon: <StarIcon className="h-4 w-4" /> },
  { value: "heart", label: "Heart", icon: <HeartIcon className="h-4 w-4" /> },
  { value: "academic", label: "Academic", icon: <AcademicCapIcon className="h-4 w-4" /> },
  { value: "beaker", label: "Science", icon: <BeakerIcon className="h-4 w-4" /> },
  { value: "briefcase", label: "Work", icon: <BriefcaseIcon className="h-4 w-4" /> },
  { value: "code", label: "Code", icon: <CodeIcon className="h-4 w-4" /> },
  { value: "money", label: "Finance", icon: <CurrencyDollarIcon className="h-4 w-4" /> },
  { value: "music", label: "Music", icon: <MusicalNoteIcon className="h-4 w-4" /> },
  { value: "video", label: "Video", icon: <VideoCameraIcon className="h-4 w-4" /> },
  { value: "globe", label: "Global", icon: <GlobeAltIcon className="h-4 w-4" /> },
  { value: "home", label: "Home", icon: <HomeIcon className="h-4 w-4" /> },
];

const CreateCustomTabDialog: React.FC<CreateCustomTabDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('folder');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Tab name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest('/api/custom-tabs', {
        method: "POST",
        body: JSON.stringify({ 
          name, 
          icon, 
          description 
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      toast({
        title: "Success",
        description: "Custom tab created successfully"
      });
      
      // Reset form and close dialog
      setName('');
      setIcon('folder');
      setDescription('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create custom tab:", error);
      toast({
        title: "Error",
        description: "Failed to create custom tab. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form when dialog is closed
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setName('');
      setIcon('folder');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Custom Tab</DialogTitle>
          <DialogDescription>
            Create a new tab to organize your content
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tab Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g., Learning Resources, Favorites, Watch Later"
                className="w-full"
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon</Label>
              <Select 
                value={icon} 
                onValueChange={setIcon}
                disabled={isSubmitting}
              >
                <SelectTrigger id="icon" className="w-full">
                  <SelectValue placeholder="Select an icon">
                    <div className="flex items-center gap-2">
                      {ICON_OPTIONS.find(opt => opt.value === icon)?.icon}
                      <span>{ICON_OPTIONS.find(opt => opt.value === icon)?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                placeholder="Add a description for this tab"
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? "Creating..." : "Create Tab"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomTabDialog;