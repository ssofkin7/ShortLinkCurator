import { Switch, Route, Redirect } from "wouter";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import LibraryPage from "@/pages/LibraryPage";
import TagsPage from "@/pages/TagsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import CustomTabPage from "@/pages/CustomTabPage";
import ProfilePage from "@/pages/ProfilePage";
import GetStartedWizard from "@/components/GetStartedWizard";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";

// Protected Route component to handle auth requirements
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return <Component />;
}

function App() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/auth" component={LoginPage} />
        
        {/* LandingPage when not logged in at root */}
        <Route path="/" component={!user ? LandingPage : HomePage} />
        
        {/* Protected routes */}
        <Route path="/library">
          <ProtectedRoute component={LibraryPage} />
        </Route>
        <Route path="/tabs/:id">
          <ProtectedRoute component={CustomTabPage} />
        </Route>
        <Route path="/tags">
          <ProtectedRoute component={TagsPage} />
        </Route>
        <Route path="/analytics">
          <ProtectedRoute component={AnalyticsPage} />
        </Route>
        <Route path="/profile">
          <ProtectedRoute component={ProfilePage} />
        </Route>
        
        <Route component={NotFound} />
      </Switch>
      {user && <GetStartedWizard />}
    </>
  );
}

export default App;