import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LinkWithTags } from '@/lib/supabase';

interface EditTitleDialogProps {
  link: LinkWithTags;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditTitleDialog: React.FC<EditTitleDialogProps> = ({ link, isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState(link.title);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    // Only update if title has changed
    if (title !== link.title) {
      setIsSubmitting(true);
      
      try {
        await apiRequest(`/api/links/${link.id}/title`, {
          method: "PATCH",
          body: JSON.stringify({ title }),
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        toast({
          title: "Success",
          description: "Title updated successfully"
        });
        
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Failed to update title:", error);
        toast({
          title: "Error",
          description: "Failed to update title. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Title</DialogTitle>
          <DialogDescription>
            Update the title for this content link
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter a descriptive title"
                className="w-full"
                autoFocus
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
              disabled={isSubmitting || !title.trim() || title === link.title}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTitleDialog;