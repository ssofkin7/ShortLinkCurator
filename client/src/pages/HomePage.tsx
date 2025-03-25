import { useState, MouseEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, LinkWithTags } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import LinkSubmitter from "@/components/LinkSubmitter";
import AIProcessingDashboard from "@/components/AIProcessingDashboard";
import ContentItem from "@/components/ContentItem";
import NotViewedRecommendations from "@/components/NotViewedRecommendations";
import MobileNavigation from "@/components/MobileNavigation";
import { queryClient } from "@/lib/queryClient";
import TagCorrectionModal from "@/components/TagCorrectionModal";
import { Card } from "@/components/ui/card";

const HomePage = () => {
  const [processingLink, setProcessingLink] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<LinkWithTags | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);

  // Fetch current user
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Fetch recent links (limited to latest 5)
  const { data: recentLinks = [], isLoading: linksLoading } = useQuery<LinkWithTags[]>({
    queryKey: ["/api/links", { type: "recent" }],
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

  // Open tag modal for a link
  const handleOpenTagModal = (link: LinkWithTags) => {
    setSelectedLink(link);
    setShowTagModal(true);
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
          <div className="mb-8">
            {/* Link Submitter */}
            <LinkSubmitter onSubmit={handleSubmitLink} />
          </div>

          {/* AI Processing Dashboard */}
          {processingLink && (
            <AIProcessingDashboard 
              url={processingLink} 
              onComplete={handleProcessingComplete} 
            />
          )}

          {/* Recently Added Links */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recently Added</h2>
              {recentLinks.length > 0 && (
                <a href="/library" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All →
                </a>
              )}
            </div>

            {linksLoading ? (
              <p>Loading recent links...</p>
            ) : recentLinks.length === 0 ? (
              <Card className="p-8 text-center bg-gray-50">
                <p className="text-gray-500 mb-4">You haven't saved any links yet</p>
                <p className="text-sm text-gray-400">Add your first link using the form above</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recentLinks.slice(0, 4).map((link) => (
                  <div 
                    key={link.id} 
                    onClick={() => window.open(link.url, "_blank")} 
                    className="cursor-pointer"
                  >
                    <ContentItem 
                      link={link} 
                      viewMode="grid" 
                      onEditTags={(e) => {
                        // Stop the click from opening the link
                        if (e) e.stopPropagation();
                        handleOpenTagModal(link);
                      }}
                      onTagClick={(tagName, e) => {
                        // Prevent navigation when clicking on tags
                        if (e) e.stopPropagation();
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* "Revisit These Links" Section */}
          <NotViewedRecommendations />
        </div>
      </main>

      {/* Tag Correction Modal */}
      {showTagModal && selectedLink && (
        <TagCorrectionModal
          link={selectedLink}
          onClose={() => {
            setShowTagModal(false);
            setSelectedLink(null);
            queryClient.invalidateQueries({ queryKey: ["/api/links"] });
          }}
        />
      )}

      {/* Mobile Navigation */}
      <MobileNavigation onAddLinkClick={() => setShowLinkSubmitter(true)} />
    </div>
  );
};

export default HomePage;