import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, DollarSign, Briefcase, Clock, CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Job } from "@shared/schema";
import { UserRole } from "@shared/schema";

type JobWithApplicationStatus = Job & { hasApplied?: boolean };

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const jobId = params?.id;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: job, isLoading } = useQuery<JobWithApplicationStatus>({
    queryKey: ["/api/jobs", jobId],
    enabled: !!jobId,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/jobs/${jobId}/apply`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", jobId] });
      queryClient.invalidateQueries({ queryKey: ["/api/applicant/applications"] });
      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground">Job not found</p>
        </div>
      </div>
    );
  }

  const isApplicant = user?.role === UserRole.APPLICANT;
  const canApply = isAuthenticated && isApplicant && !job.hasApplied;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Button variant="ghost" asChild className="mb-6" data-testid="button-back-to-jobs">
          <Link href="/jobs">
            <a className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </a>
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <div className="mb-6">
                  <h1 className="mb-3 text-4xl font-bold leading-tight" data-testid="text-job-title">{job.title}</h1>
                  <p className="text-xl text-muted-foreground mb-4">{job.companyName}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {job.jobType}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {job.experienceLevel}
                    </Badge>
                    {job.salaryMin && job.salaryMax && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} {job.salaryCurrency}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-6">
                  <div>
                    <h2 className="mb-3 text-2xl font-semibold">About the Role</h2>
                    <p className="text-muted-foreground leading-relaxed">{job.description}</p>
                  </div>

                  <div>
                    <h2 className="mb-3 text-2xl font-semibold">Responsibilities</h2>
                    <ul className="space-y-2">
                      {job.responsibilities.map((responsibility, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h2 className="mb-3 text-2xl font-semibold">Requirements</h2>
                    <ul className="space-y-2">
                      {job.requirements.map((requirement, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h2 className="mb-3 text-2xl font-semibold">Required Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="rounded-full">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="mb-3 font-semibold">Job Information</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Job Type</p>
                      <p className="font-medium">{job.jobType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Experience Level</p>
                      <p className="font-medium">{job.experienceLevel}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Location</p>
                      <p className="font-medium">{job.location}</p>
                    </div>
                    {job.salaryMin && job.salaryMax && (
                      <div>
                        <p className="text-muted-foreground mb-1">Salary Range</p>
                        <p className="font-medium">
                          {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} {job.salaryCurrency}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground mb-1">Posted</p>
                      <p className="font-medium">{new Date(job.createdAt!).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {!isAuthenticated ? (
                  <Button className="w-full" asChild data-testid="button-login-to-apply">
                    <a href="/api/login">Log in to Apply</a>
                  </Button>
                ) : job.hasApplied ? (
                  <Button className="w-full" disabled data-testid="button-already-applied">
                    Already Applied
                  </Button>
                ) : canApply ? (
                  <Button
                    className="w-full"
                    onClick={() => applyMutation.mutate()}
                    disabled={applyMutation.isPending}
                    data-testid="button-apply-now"
                  >
                    {applyMutation.isPending ? "Submitting..." : "Apply Now"}
                  </Button>
                ) : (
                  <p className="text-sm text-center text-muted-foreground">
                    {user?.role === UserRole.RECRUITER ? "Recruiters cannot apply to jobs" : "You cannot apply to this job"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
