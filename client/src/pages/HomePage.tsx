import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import LinkSubmitter from "@/components/LinkSubmitter";
import AIProcessingDashboard from "@/components/AIProcessingDashboard";
import ContentLibrary from "@/components/ContentLibrary";
import Recommendations from "@/components/Recommendations";
import MobileNavigation from "@/components/MobileNavigation";
import { queryClient } from "@/lib/queryClient";

const HomePage = () => {
  const [processingLink, setProcessingLink] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Handle link submission
  const handleSubmitLink = (url: string) => {
    setProcessingLink(url);
  };

  // Handle link processing complete
  const handleProcessingComplete = () => {
    setProcessingLink(null);
    // Refresh links
    queryClient.invalidateQueries({ queryKey: ["/api/links"] });
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <Sidebar user={user} isLoading={userLoading} />
      
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <TopBar user={user} />
        
        <div className="container mx-auto px-4 py-6">
          {/* Link Submitter */}
          <LinkSubmitter onSubmit={handleSubmitLink} />
          
          {/* AI Processing Dashboard */}
          {processingLink && (
            <AIProcessingDashboard 
              url={processingLink} 
              onComplete={handleProcessingComplete} 
            />
          )}
          
          {/* Content Library */}
          <ContentLibrary 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
          
          {/* Recommendations Section */}
          <Recommendations />
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation onAddLinkClick={() => window.scrollTo(0, 0)} />
    </div>
  );
};

export default HomePage;
