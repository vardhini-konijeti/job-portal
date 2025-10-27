import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Application, Job } from "@shared/schema";

type ApplicationWithJob = Application & { job: Job };

export default function MyApplications() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: applications = [], isLoading: applicationsLoading } = useQuery<ApplicationWithJob[]>({
    queryKey: ["/api/applicant/applications"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold leading-tight">My Applications</h1>

        {applicationsLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet</p>
              <Button asChild data-testid="button-browse-jobs">
                <Link href="/jobs">
                  <a>Browse Jobs</a>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="hover-elevate" data-testid={`application-${application.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold" data-testid={`text-job-title-${application.id}`}>
                          {application.job.title}
                        </h3>
                        <Badge
                          variant={
                            application.status === "Accepted" ? "default" :
                            application.status === "Rejected" ? "destructive" :
                            "secondary"
                          }
                          data-testid={`badge-status-${application.id}`}
                        >
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {application.job.companyName} • {application.job.location}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">{application.job.jobType}</Badge>
                        <Badge variant="outline">{application.job.experienceLevel}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>Applied on {new Date(application.createdAt!).toLocaleDateString()}</p>
                        {application.coverLetter && (
                          <p className="mt-2 line-clamp-2">Cover Letter: {application.coverLetter}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" asChild data-testid={`button-view-job-${application.id}`}>
                      <Link href={`/jobs/${application.jobId}`}>
                        <a>View Job</a>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
