import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
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
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      {isAuthenticated ? (
        <>
          <Route path="/" component={HomePage} />
          <Route path="/library" component={LibraryPage} />
          <Route path="/tabs/:id" component={CustomTabPage} />
          <Route path="/tags" component={TagsPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/profile" component={ProfilePage} />
        </>
      ) : (
        <>
          <Route path="/" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      <Router />
      {isAuthenticated && <GetStartedWizard />}
    </>
  );
}

export default App;
