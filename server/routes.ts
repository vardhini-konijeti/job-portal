// Referenced from javascript_log_in_with_replit blueprint
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isSuperadmin, isRecruiter, isApplicant } from "./replitAuth";
import { insertJobSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Superadmin routes
  app.get('/api/superadmin/stats', isAuthenticated, isSuperadmin, async (req, res) => {
    try {
      const stats = await storage.getSuperadminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching superadmin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/superadmin/pending-recruiters', isAuthenticated, isSuperadmin, async (req, res) => {
    try {
      const recruiters = await storage.getPendingRecruiters();
      res.json(recruiters);
    } catch (error) {
      console.error("Error fetching pending recruiters:", error);
      res.status(500).json({ message: "Failed to fetch pending recruiters" });
    }
  });

  app.post('/api/superadmin/approve-recruiter/:id', isAuthenticated, isSuperadmin, async (req, res) => {
    try {
      await storage.approveRecruiter(req.params.id);
      res.json({ message: "Recruiter approved successfully" });
    } catch (error) {
      console.error("Error approving recruiter:", error);
      res.status(500).json({ message: "Failed to approve recruiter" });
    }
  });

  app.post('/api/superadmin/reject-recruiter/:id', isAuthenticated, isSuperadmin, async (req, res) => {
    try {
      await storage.rejectRecruiter(req.params.id);
      res.json({ message: "Recruiter rejected successfully" });
    } catch (error) {
      console.error("Error rejecting recruiter:", error);
      res.status(500).json({ message: "Failed to reject recruiter" });
    }
  });

  // Recruiter routes
  app.get('/api/recruiter/stats', isAuthenticated, isRecruiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getRecruiterStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching recruiter stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/recruiter/jobs', isAuthenticated, isRecruiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobs = await storage.getJobsByRecruiter(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching recruiter jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Applicant routes
  app.get('/api/applicant/stats', isAuthenticated, isApplicant, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getApplicantStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching applicant stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/applicant/applications', isAuthenticated, isApplicant, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applicationsData = await storage.getApplicationsByApplicant(userId);
      
      // Fetch job details for each application
      const applications = await Promise.all(
        applicationsData.map(async (app) => {
          const job = await storage.getJob(app.jobId);
          return { ...app, job };
        })
      );
      
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applicant applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      const user = await storage.updateUser(userId, profileData);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Job routes
  app.get('/api/jobs', async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get('/api/jobs/:id', async (req: any, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check if authenticated user has applied
      let hasApplied = false;
      if (req.user?.claims?.sub) {
        hasApplied = await storage.hasApplied(job.id, req.user.claims.sub);
      }

      res.json({ ...job, hasApplied });
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post('/api/jobs', isAuthenticated, isRecruiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobData = insertJobSchema.parse(req.body);
      
      const job = await storage.createJob(userId, jobData);
      res.json(job);
    } catch (error: any) {
      console.error("Error creating job:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.put('/api/jobs/:id', isAuthenticated, isRecruiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const job = await storage.getJob(req.params.id);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      if (job.recruiterId !== userId) {
        return res.status(403).json({ message: "Forbidden: Not your job" });
      }

      const updatedJob = await storage.updateJob(req.params.id, req.body);
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete('/api/jobs/:id', isAuthenticated, isRecruiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const job = await storage.getJob(req.params.id);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      if (job.recruiterId !== userId) {
        return res.status(403).json({ message: "Forbidden: Not your job" });
      }

      await storage.deleteJob(req.params.id);
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Application routes
  app.post('/api/jobs/:id/apply', isAuthenticated, isApplicant, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobId = req.params.id;

      // Check if job exists
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check if already applied
      const hasApplied = await storage.hasApplied(jobId, userId);
      if (hasApplied) {
        return res.status(400).json({ message: "You have already applied to this job" });
      }

      // Get user data for resume URL
      const user = await storage.getUser(userId);
      if (!user?.resumeUrl) {
        return res.status(400).json({ message: "Please upload your resume in your profile before applying" });
      }

      // Create application
      const application = await storage.createApplication({
        jobId,
        applicantId: userId,
        resumeUrl: user.resumeUrl,
        coverLetter: req.body.coverLetter || null,
      });

      res.json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.get('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const application = await storage.getApplication(req.params.id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Verify user has access to this application
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === 'applicant' && application.applicantId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (user?.role === 'recruiter') {
        const job = await storage.getJob(application.jobId);
        if (job?.recruiterId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.put('/api/applications/:id/status', isAuthenticated, isRecruiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getApplication(req.params.id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Verify recruiter owns the job
      const job = await storage.getJob(application.jobId);
      if (job?.recruiterId !== userId) {
        return res.status(403).json({ message: "Forbidden: Not your job" });
      }

      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updatedApplication = await storage.updateApplicationStatus(req.params.id, status);
      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
