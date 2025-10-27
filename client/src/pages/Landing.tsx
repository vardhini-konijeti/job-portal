import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, FileText, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <Briefcase className="h-16 w-16 text-primary" />
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Find Your Dream Job
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Connect with top employers, discover exciting opportunities, and take the next step in your career journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild data-testid="button-login">
                <a href="/api/login">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-semibold">How It Works</h2>
            <p className="text-muted-foreground">Simple, efficient, and designed for everyone</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* For Job Seekers */}
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">For Job Seekers</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create your profile, search thousands of jobs, apply with one click, and track your applications.
                </p>
              </CardContent>
            </Card>

            {/* For Recruiters */}
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">For Recruiters</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Post job openings, review applications, and connect with qualified candidates efficiently.
                </p>
              </CardContent>
            </Card>

            {/* Secure & Trusted */}
            <Card className="hover-elevate">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Secure & Trusted</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Verified recruiters, secure data handling, and a trusted platform for your career journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-semibold">Ready to get started?</h2>
          <p className="mb-8 text-muted-foreground">
            Join thousands of job seekers and recruiters finding success on our platform
          </p>
          <Button size="lg" asChild data-testid="button-cta-login">
            <a href="/api/login">Sign In Now</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
