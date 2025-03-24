import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LinkWithTags } from "@shared/schema";
import CustomSidebar from "@/components/Sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/hooks/useAuth";
import MobileNavigation from "@/components/MobileNavigation";
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

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
  
  // Prepare data for platform pie chart
  const platformData = Object.entries(platformCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
    value
  }));
  
  // Prepare data for category bar chart - take top 5 categories only
  const categoryData = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 12) + '...' : name, // Truncate long names
      value
    }));
    
  // Colors for platform pie chart
  const PLATFORM_COLORS = {
    youtube: '#FF0000',
    tiktok: '#000000',
    instagram: '#E1306C',
    facebook: '#4267B2',
    vimeo: '#1AB7EA',
    other: '#CCCCCC'
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
                {isLoading || links.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-500">
                        {isLoading ? "Loading data..." : "No content data available"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={activityData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(dateString) => {
                            const date = new Date(dateString);
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          }}
                          tick={{ fontSize: 12 }}
                          tickMargin={5}
                          // For larger datasets, show fewer ticks
                          interval={timeFrame === "7days" ? 0 : timeFrame === "30days" ? 3 : 7}
                        />
                        <YAxis 
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                          tickMargin={5}
                        />
                        <Tooltip
                          formatter={(value: number) => [`${value} items`, "Content Added"]}
                          labelFormatter={(dateString) => formatDate(dateString)}
                          contentStyle={{ 
                            backgroundColor: "white", 
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="Content Added"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 3, fill: "#3b82f6" }}
                          activeDot={{ r: 6, fill: "#2563eb" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
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
                {isLoading || links.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-500">
                        {isLoading ? "Loading data..." : "No platform data available"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Pie
                          data={platformData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {platformData.map((entry, index) => {
                            const platform = entry.name.toLowerCase();
                            const color = PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.other;
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value} items`, "Count"]}
                          contentStyle={{ 
                            backgroundColor: "white", 
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                          }}
                        />
                        <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom" 
                          align="center"
                          formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
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
                {isLoading || links.length === 0 || categoryData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-500">
                        {isLoading 
                          ? "Loading data..." 
                          : links.length === 0 
                            ? "No content data available"
                            : "No category data available"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fontSize: 12 }}
                          width={70}
                        />
                        <Tooltip
                          formatter={(value: number) => [`${value} items`, "Content Count"]}
                          contentStyle={{ 
                            backgroundColor: "white", 
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          name="Content Count"
                          fill="#8884d8" 
                          radius={[0, 4, 4, 0]}
                        >
                          {categoryData.map((_, index) => 
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          )}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
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