import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LinkSubmitterProps {
  onSubmit: (url: string) => void;
}

const LinkSubmitter = ({ onSubmit }: LinkSubmitterProps) => {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const { mutate, isPending } = useMutation({
    mutationFn: async (linkUrl: string) => {
      return apiRequest("POST", "/api/links", { url: linkUrl });
    },
    onSuccess: async () => {
      setUrl("");
      toast({
        title: "Link added successfully",
        description: "Your content has been saved to your library",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to add link",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: "Empty link",
        description: "Please enter a valid TikTok, YouTube Shorts, or Instagram Reels link",
        variant: "destructive",
      });
      return;
    }

    // Check if URL is from a supported platform
    const isValidUrl = /tiktok\.com|youtube\.com\/shorts|youtu\.be|instagram\.com\/reel/i.test(url);
    if (!isValidUrl) {
      toast({
        title: "Unsupported link",
        description: "Only TikTok, YouTube Shorts, and Instagram Reels links are supported",
        variant: "destructive",
      });
      return;
    }

    onSubmit(url);
    mutate(url);
  };

  return (
    <Card className="bg-white p-5 rounded-xl border border-gray-200 mb-8 shadow-sm">
      <CardContent className="p-0">
        <h2 className="text-lg font-semibold mb-4">Add a New Link</h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
            <Input
              type="text"
              id="linkInput"
              placeholder="Paste TikTok, YouTube Shorts or Instagram Reels link"
              className="w-full pl-10 pr-4 py-3"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isPending}
            />
          </div>
          <Button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-6 py-3 transition-colors"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Link"}
          </Button>
        </form>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Supports TikTok, YouTube Shorts, and Instagram Reels links</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkSubmitter;
