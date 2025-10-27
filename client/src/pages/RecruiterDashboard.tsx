import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, Eye, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Job } from "@shared/schema";

export default function RecruiterDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats } = useQuery({
    queryKey: ["/api/recruiter/stats"],
    enabled: isAuthenticated,
  });

  const { data: myJobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/recruiter/jobs"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const isApproved = user?.isApproved;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-bold leading-tight">Recruiter Dashboard</h1>
          {isApproved && (
            <Button asChild data-testid="button-post-job">
              <Link href="/post-job">
                <a className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Post New Job
                </a>
              </Link>
            </Button>
          )}
        </div>

        {!isApproved && (
          <Alert className="mb-8" data-testid="alert-pending-approval">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pending Approval</AlertTitle>
            <AlertDescription>
              Your recruiter account is pending approval from the superadmin. You will be able to post jobs once approved.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jobs Posted</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-jobs-posted">{stats?.jobsPosted || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-applications">{stats?.activeApplications || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-views">{stats?.totalViews || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* My Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>My Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            {myJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">No jobs posted yet</p>
                {isApproved && (
                  <Button asChild data-testid="button-post-first-job">
                    <Link href="/post-job">
                      <a>Post Your First Job</a>
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {myJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4 hover-elevate"
                    data-testid={`job-${job.id}`}
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold" data-testid={`text-job-title-${job.id}`}>{job.title}</h3>
                        <Badge variant={job.isActive ? "default" : "secondary"}>
                          {job.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{job.companyName} • {job.location}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{job.jobType}</Badge>
                        <Badge variant="outline">{job.experienceLevel}</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild data-testid={`button-view-job-${job.id}`}>
                      <Link href={`/jobs/${job.id}`}>
                        <a>View Details</a>
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
