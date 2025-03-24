import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface AIProcessingDashboardProps {
  url: string;
  onComplete: () => void;
}

// Simulating the processing state for the UI
const AIProcessingDashboard = ({ url, onComplete }: AIProcessingDashboardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate processing time (the actual processing happens on the server)
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // After showing the completed state briefly, signal completion
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 1500);
      
      return () => clearTimeout(completeTimer);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Card className="bg-white p-5 rounded-xl border border-gray-200 mb-8 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Processing Link</h2>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 font-medium border-blue-200">
            AI Processing
          </Badge>
        </div>
        
        <div className="flex flex-col md:flex-row gap-5">
          <div className="md:w-1/3">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {isLoading ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-gray-400">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
            </div>
          </div>
          
          <div className="md:w-2/3">
            <h3 className="font-medium mb-2">Extracted Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-24 text-sm text-gray-500">Title:</div>
                {isLoading ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  <div className="font-medium">Analyzed Content Title</div>
                )}
              </div>
              <div className="flex items-center">
                <div className="w-24 text-sm text-gray-500">Platform:</div>
                {isLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <div className="font-medium">
                    {url.includes('tiktok') ? 'TikTok' : 
                     url.includes('youtube') ? 'YouTube Shorts' : 
                     'Instagram Reels'}
                  </div>
                )}
              </div>
              <div className="flex items-start">
                <div className="w-24 text-sm text-gray-500 mt-1">Category:</div>
                {isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <Badge variant="secondary" className="font-medium">Content Category</Badge>
                )}
              </div>
              <div className="flex items-start">
                <div className="w-24 text-sm text-gray-500 mt-1">Tags:</div>
                {isLoading ? (
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Tag 1</Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Tag 2</Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Tag 3</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIProcessingDashboard;
