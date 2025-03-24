import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LinkWithTags } from "@shared/schema";
import CustomSidebar from "@/components/Sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/hooks/useAuth";
import MobileNavigation from "@/components/MobileNavigation";

export default function AnalyticsPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const [timeFrame, setTimeFrame] = useState("7days");

  // Query for links
  const { data: links = [], isLoading } = useQuery<LinkWithTags[]>({
    queryKey: ["/api/links"],
  });

  // Calculate platform distribution
  const platformCounts = links.reduce((acc, link) => {
    const platform = link.platform.toLowerCase();
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate category distribution
  const categoryCounts = links.reduce((acc, link) => {
    const category = link.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Generate dates for recent activity
  const generateDates = (days: number) => {
    return Array.from({ length: days }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return date.toISOString().split('T')[0];
    });
  };

  // Generate sample data for recent activity
  const recentDates = generateDates(timeFrame === "7days" ? 7 : timeFrame === "30days" ? 30 : 90);
  
  // Calculate weekly activity
  const activityData = recentDates.map(date => {
    const count = links.filter(link => {
      const linkDate = new Date(link.created_at).toISOString().split('T')[0];
      return linkDate === date;
    }).length;
    
    return {
      date: date,
      count: count
    };
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <CustomSidebar user={user} isLoading={isUserLoading} />
      
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <TopBar user={user} />
        
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Content</CardDescription>
                <CardTitle className="text-3xl">{links.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  From all platforms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>YouTube</CardDescription>
                <CardTitle className="text-3xl">{platformCounts.youtube || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {((platformCounts.youtube || 0) / (links.length || 1) * 100).toFixed(1)}% of total content
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>TikTok</CardDescription>
                <CardTitle className="text-3xl">{platformCounts.tiktok || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {((platformCounts.tiktok || 0) / (links.length || 1) * 100).toFixed(1)}% of total content
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Instagram</CardDescription>
                <CardTitle className="text-3xl">{platformCounts.instagram || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {((platformCounts.instagram || 0) / (links.length || 1) * 100).toFixed(1)}% of total content
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Content Activity</CardTitle>
                  <Tabs value={timeFrame} onValueChange={setTimeFrame} className="w-auto">
                    <TabsList className="bg-muted">
                      <TabsTrigger value="7days">7D</TabsTrigger>
                      <TabsTrigger value="30days">30D</TabsTrigger>
                      <TabsTrigger value="90days">90D</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <CardDescription>
                  Content saved over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="mb-2 text-lg font-medium">Activity Chart</p>
                    <p className="text-gray-500">Charts feature coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>
                  Content distribution by platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="mb-2 text-lg font-medium">Platform Distribution</p>
                    <p className="text-gray-500">Charts feature coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>
                  Most used content categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="mb-2 text-lg font-medium">Category Distribution</p>
                    <p className="text-gray-500">Charts feature coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>
                  Your content saving patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="h-[250px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : links.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center flex-col text-center">
                      <div className="text-xl font-medium mb-2">No data available</div>
                      <p className="text-gray-500">Start adding content to view statistics</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average saves per day</span>
                        <span className="font-bold">
                          {(links.length / Math.max(7, activityData.filter(d => d.count > 0).length)).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Most active day</span>
                        <span className="font-bold">
                          {activityData.length > 0 
                            ? formatDate(activityData.sort((a, b) => b.count - a.count)[0]?.date) 
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Most saved platform</span>
                        <span className="font-bold">
                          {Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Most used category</span>
                        <span className="font-bold">
                          {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation onAddLinkClick={() => {}} />
    </div>
  );
}