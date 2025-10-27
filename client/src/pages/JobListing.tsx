import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Briefcase, MapPin, DollarSign } from "lucide-react";
import type { Job } from "@shared/schema";
import { JobType, ExperienceLevel } from "@shared/schema";

export default function JobListing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("");

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesJobType =
      selectedJobTypes.length === 0 || selectedJobTypes.includes(job.jobType);

    const matchesExperience =
      selectedExperience.length === 0 || selectedExperience.includes(job.experienceLevel);

    const matchesLocation =
      locationFilter === "" ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesJobType && matchesExperience && matchesLocation;
  });

  const toggleJobType = (type: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleExperience = (level: string) => {
    setSelectedExperience((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedJobTypes([]);
    setSelectedExperience([]);
    setLocationFilter("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold leading-tight">Browse Jobs</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs by title, company, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 rounded-full"
              data-testid="input-search-jobs"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                    Clear
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Location Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      data-testid="input-location-filter"
                    />
                  </div>

                  {/* Job Type Filter */}
                  <div className="space-y-3">
                    <Label>Job Type</Label>
                    {Object.values(JobType).map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`job-type-${type}`}
                          checked={selectedJobTypes.includes(type)}
                          onCheckedChange={() => toggleJobType(type)}
                          data-testid={`checkbox-job-type-${type}`}
                        />
                        <label
                          htmlFor={`job-type-${type}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Experience Level Filter */}
                  <div className="space-y-3">
                    <Label>Experience Level</Label>
                    {Object.values(ExperienceLevel).map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={`experience-${level}`}
                          checked={selectedExperience.includes(level)}
                          onCheckedChange={() => toggleExperience(level)}
                          data-testid={`checkbox-experience-${level}`}
                        />
                        <label
                          htmlFor={`experience-${level}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Job Listings */}
          <div className="flex-1">
            <div className="mb-4 text-sm text-muted-foreground" data-testid="text-jobs-found">
              {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No jobs found matching your criteria</p>
                <Button variant="outline" onClick={clearFilters} data-testid="button-reset-filters">
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="hover-elevate" data-testid={`job-card-${job.id}`}>
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-semibold" data-testid={`text-job-title-${job.id}`}>
                            {job.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">{job.companyName}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            {job.salaryMin && job.salaryMax && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} {job.salaryCurrency}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{job.jobType}</Badge>
                            <Badge variant="outline">{job.experienceLevel}</Badge>
                            {job.skills.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="rounded-full">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Posted {new Date(job.createdAt!).toLocaleDateString()}
                        </span>
                        <Button asChild data-testid={`button-view-job-${job.id}`}>
                          <Link href={`/jobs/${job.id}`}>
                            <a>View Details</a>
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
      </div>
    </div>
  );
}
