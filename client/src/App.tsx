// Referenced from javascript_log_in_with_replit blueprint
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import Landing from "@/pages/Landing";
import SuperadminDashboard from "@/pages/SuperadminDashboard";
import RecruiterDashboard from "@/pages/RecruiterDashboard";
import ApplicantDashboard from "@/pages/ApplicantDashboard";
import JobListing from "@/pages/JobListing";
import JobDetail from "@/pages/JobDetail";
import PostJob from "@/pages/PostJob";
import Profile from "@/pages/Profile";
import MyApplications from "@/pages/MyApplications";
import NotFound from "@/pages/not-found";
import { UserRole } from "@shared/schema";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          {/* Dashboard - Role-based routing */}
          <Route path="/">
            {user?.role === UserRole.SUPERADMIN ? (
              <SuperadminDashboard />
            ) : user?.role === UserRole.RECRUITER ? (
              <RecruiterDashboard />
            ) : (
              <ApplicantDashboard />
            )}
          </Route>

          {/* Job Routes - Available to non-superadmin users */}
          {user?.role !== UserRole.SUPERADMIN && (
            <>
              <Route path="/jobs" component={JobListing} />
              <Route path="/jobs/:id" component={JobDetail} />
            </>
          )}

          {/* Recruiter Routes */}
          {user?.role === UserRole.RECRUITER && (
            <Route path="/post-job" component={PostJob} />
          )}

          {/* Applicant Routes */}
          {user?.role === UserRole.APPLICANT && (
            <>
              <Route path="/profile" component={Profile} />
              <Route path="/my-applications" component={MyApplications} />
            </>
          )}
        </>
      )}

      {/* 404 Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Header />
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
