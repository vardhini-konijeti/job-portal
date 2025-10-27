import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, FileText, User, Search } from "lucide-react";
import type { Application, Job } from "@shared/schema";

type ApplicationWithJob = Application & { job: Job };

export default function ApplicantDashboard() {
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
    queryKey: ["/api/applicant/stats"],
    enabled: isAuthenticated,
  });

  const { data: myApplications = [] } = useQuery<ApplicationWithJob[]>({
    queryKey: ["/api/applicant/applications"],
    enabled: isAuthenticated,
  });

  const calculateProfileCompletion = () => {
    if (!user) return 0;
    let completed = 0;
    const total = 7;

    if (user.firstName) completed++;
    if (user.lastName) completed++;
    if (user.email) completed++;
    if (user.phone) completed++;
    if (user.location) completed++;
    if (user.resumeUrl) completed++;
    if (user.bio) completed++;

    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-bold leading-tight">My Dashboard</h1>
          <Button asChild data-testid="button-browse-jobs">
            <Link href="/jobs">
              <a className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Browse Jobs
              </a>
            </Link>
          </Button>
        </div>

        {/* Profile Completion */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Complete your profile to stand out</span>
                <span className="text-sm font-bold" data-testid="text-profile-completion">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
              {profileCompletion < 100 && (
                <Button variant="outline" size="sm" asChild data-testid="button-complete-profile">
                  <Link href="/profile">
                    <a>Complete Profile</a>
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications Submitted</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-applications-submitted">{stats?.applicationsSubmitted || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Review</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-in-review">{stats?.inReview || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-profile-views">{stats?.profileViews || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* My Applications */}
        <Card>
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {myApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">No applications yet</p>
                <Button asChild data-testid="button-find-jobs">
                  <Link href="/jobs">
                    <a>Find Jobs</a>
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myApplications.slice(0, 5).map((application) => (
                  <div
                    key={application.id}
                    className="flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4 hover-elevate"
                    data-testid={`application-${application.id}`}
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold" data-testid={`text-job-title-${application.id}`}>
                          {application.job.title}
                        </h3>
                        <Badge variant={
                          application.status === "Accepted" ? "default" :
                          application.status === "Rejected" ? "destructive" :
                          "secondary"
                        }>
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {application.job.companyName} • {application.job.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Applied {new Date(application.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild data-testid={`button-view-job-${application.id}`}>
                      <Link href={`/jobs/${application.jobId}`}>
                        <a>View Job</a>
                      </Link>
                    </Button>
                  </div>
                ))}
                {myApplications.length > 5 && (
                  <Button variant="outline" className="w-full" asChild data-testid="button-view-all-applications">
                    <Link href="/my-applications">
                      <a>View All Applications</a>
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
