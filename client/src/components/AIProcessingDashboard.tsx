import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AIProcessingDashboardProps {
  url: string;
  onComplete: () => void;
}

// Example potential tags for the animation
const potentialTags = [
  "Fitness", "Workout", "Health", "Comedy", "Tutorial", 
  "Fashion", "Productivity", "DIY", "Cooking", "Travel",
  "Tech", "Education", "Dance", "Music", "Gaming"
];

// Example potential categories
const potentialCategories = [
  "Entertainment", "Education", "Lifestyle", "Fitness",
  "Technology", "Food", "Travel", "Gaming"
];

// Simulating the processing state for the UI
const AIProcessingDashboard = ({ url, onComplete }: AIProcessingDashboardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [detectedPlatform, setDetectedPlatform] = useState("");
  const [detectedTags, setDetectedTags] = useState<string[]>([]);
  const [detectedCategory, setDetectedCategory] = useState("");
  
  // Determine platform from URL for display
  useEffect(() => {
    if (url.includes('tiktok')) {
      setDetectedPlatform('TikTok');
    } else if (url.includes('youtube')) {
      setDetectedPlatform('YouTube Shorts');
    } else if (url.includes('instagram')) {
      setDetectedPlatform('Instagram Reels');
    } else {
      setDetectedPlatform('Social Media');
    }
  }, [url]);

  useEffect(() => {
    // Simulated AI processing steps
    const steps = [
      { step: "Fetching content details...", progress: 10, delay: 500 },
      { step: "Analyzing video content...", progress: 30, delay: 700 },
      { step: "Detecting main themes...", progress: 50, delay: 600 },
      { step: "Generating tags...", progress: 70, delay: 700 },
      { step: "Categorizing content...", progress: 90, delay: 500 },
      { step: "Finalizing results...", progress: 100, delay: 600 }
    ];

    // Sequential simulation of processing steps
    let currentTimeout: NodeJS.Timeout;
    let cumulativeDelay = 0;

    steps.forEach((step, index) => {
      cumulativeDelay += step.delay;
      
      currentTimeout = setTimeout(() => {
        setProgress(step.progress);
        setCurrentStep(step.step);
        
        // At specific steps, reveal "detected" information
        if (index === 2) {
          // Start showing random tags one by one
          const randomTags = [...potentialTags].sort(() => 0.5 - Math.random()).slice(0, 3);
          const tagDelay = 300;
          
          setTimeout(() => setDetectedTags([randomTags[0]]), tagDelay);
          setTimeout(() => setDetectedTags([randomTags[0], randomTags[1]]), tagDelay * 2);
          setTimeout(() => setDetectedTags([randomTags[0], randomTags[1], randomTags[2]]), tagDelay * 3);
        }
        
        if (index === 4) {
          // Show a category
          const randomCategory = potentialCategories[Math.floor(Math.random() * potentialCategories.length)];
          setDetectedCategory(randomCategory);
        }
        
        if (index === steps.length - 1) {
          // Processing complete
          setTimeout(() => {
            setIsLoading(false);
            
            // After showing completed state briefly, signal completion
            setTimeout(() => {
              onComplete();
            }, 1500);
          }, 600);
        }
      }, cumulativeDelay);
    });
    
    return () => clearTimeout(currentTimeout);
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
        
        {isLoading && (
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">{currentStep}</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-5">
          <div className="md:w-1/3">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-blue-500">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <div className="text-xs text-gray-500 mt-2">AI Analyzing</div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <div className="text-xs text-green-500 mt-2">Analysis Complete</div>
                </div>
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
                  <div className="font-medium">
                    {url.includes('youtube.com/shorts') ? 'YouTube Short' : 
                     url.includes('tiktok.com') ? 'TikTok Video' : 
                     url.includes('instagram.com') ? 'Instagram Reel' : 
                     'Short-form Video Content'}
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <div className="w-24 text-sm text-gray-500">Platform:</div>
                {isLoading && !detectedPlatform ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <div className="font-medium">
                    {detectedPlatform}
                  </div>
                )}
              </div>
              <div className="flex items-start">
                <div className="w-24 text-sm text-gray-500 mt-1">Category:</div>
                {isLoading && !detectedCategory ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <Badge variant="secondary" className="font-medium">
                    {detectedCategory || "Content Category"}
                  </Badge>
                )}
              </div>
              <div className="flex items-start">
                <div className="w-24 text-sm text-gray-500 mt-1">Tags:</div>
                {isLoading && detectedTags.length === 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(detectedTags.length > 0 ? detectedTags : ["Tag 1", "Tag 2", "Tag 3"]).map((tag, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className={`transition-all duration-300 ${isLoading ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse" : "bg-blue-100 text-blue-800 border-blue-200"}`}
                      >
                        {tag}
                      </Badge>
                    ))}
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
