// Referenced from javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  jobs,
  applications,
  type User,
  type UpsertUser,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User management
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getPendingRecruiters(): Promise<User[]>;
  approveRecruiter(userId: string): Promise<void>;
  rejectRecruiter(userId: string): Promise<void>;
  
  // Job operations
  createJob(recruiterId: string, job: InsertJob): Promise<Job>;
  getJob(id: string): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getJobsByRecruiter(recruiterId: string): Promise<Job[]>;
  updateJob(id: string, data: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<void>;
  
  // Application operations
  createApplication(application: InsertApplication & { applicantId: string }): Promise<Application>;
  getApplication(id: string): Promise<Application | undefined>;
  getApplicationsByJob(jobId: string): Promise<Application[]>;
  getApplicationsByApplicant(applicantId: string): Promise<Application[]>;
  hasApplied(jobId: string, applicantId: string): Promise<boolean>;
  updateApplicationStatus(id: string, status: string): Promise<Application | undefined>;
  
  // Stats
  getSuperadminStats(): Promise<{
    totalRecruiters: number;
    pendingRecruiters: number;
    activeJobs: number;
    totalApplicants: number;
  }>;
  getRecruiterStats(recruiterId: string): Promise<{
    jobsPosted: number;
    activeApplications: number;
    totalViews: number;
  }>;
  getApplicantStats(applicantId: string): Promise<{
    applicationsSubmitted: number;
    inReview: number;
    profileViews: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getPendingRecruiters(): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(and(eq(users.role, 'recruiter'), eq(users.isApproved, false)));
  }

  async approveRecruiter(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ isApproved: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async rejectRecruiter(userId: string): Promise<void> {
    await db
      .delete(users)
      .where(eq(users.id, userId));
  }

  // Job operations
  async createJob(recruiterId: string, job: InsertJob): Promise<Job> {
    const [newJob] = await db
      .insert(jobs)
      .values({ ...job, recruiterId })
      .returning();
    return newJob;
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getAllJobs(): Promise<Job[]> {
    return db
      .select()
      .from(jobs)
      .where(eq(jobs.isActive, true))
      .orderBy(desc(jobs.createdAt));
  }

  async getJobsByRecruiter(recruiterId: string): Promise<Job[]> {
    return db
      .select()
      .from(jobs)
      .where(eq(jobs.recruiterId, recruiterId))
      .orderBy(desc(jobs.createdAt));
  }

  async updateJob(id: string, data: Partial<Job>): Promise<Job | undefined> {
    const [job] = await db
      .update(jobs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return job;
  }

  async deleteJob(id: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  // Application operations
  async createApplication(application: InsertApplication & { applicantId: string }): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values(application)
      .returning();
    return newApplication;
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return db
      .select()
      .from(applications)
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.createdAt));
  }

  async getApplicationsByApplicant(applicantId: string): Promise<Application[]> {
    return db
      .select()
      .from(applications)
      .where(eq(applications.applicantId, applicantId))
      .orderBy(desc(applications.createdAt));
  }

  async hasApplied(jobId: string, applicantId: string): Promise<boolean> {
    const [application] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.jobId, jobId), eq(applications.applicantId, applicantId)));
    return !!application;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  // Stats
  async getSuperadminStats() {
    const [totalRecruitersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, 'recruiter'));

    const [pendingRecruitersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.role, 'recruiter'), eq(users.isApproved, false)));

    const [activeJobsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobs)
      .where(eq(jobs.isActive, true));

    const [totalApplicantsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, 'applicant'));

    return {
      totalRecruiters: totalRecruitersResult?.count || 0,
      pendingRecruiters: pendingRecruitersResult?.count || 0,
      activeJobs: activeJobsResult?.count || 0,
      totalApplicants: totalApplicantsResult?.count || 0,
    };
  }

  async getRecruiterStats(recruiterId: string) {
    const [jobsPostedResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobs)
      .where(eq(jobs.recruiterId, recruiterId));

    const recruiterJobs = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(eq(jobs.recruiterId, recruiterId));

    const jobIds = recruiterJobs.map(j => j.id);

    let activeApplications = 0;
    if (jobIds.length > 0) {
      const [activeApplicationsResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(applications)
        .where(sql`${applications.jobId} = ANY(${jobIds})`);
      activeApplications = activeApplicationsResult?.count || 0;
    }

    return {
      jobsPosted: jobsPostedResult?.count || 0,
      activeApplications,
      totalViews: 0, // Placeholder for future implementation
    };
  }

  async getApplicantStats(applicantId: string) {
    const [applicationsSubmittedResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(applications)
      .where(eq(applications.applicantId, applicantId));

    const [inReviewResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(applications)
      .where(and(
        eq(applications.applicantId, applicantId),
        sql`${applications.status} IN ('Submitted', 'Under Review', 'Interviewing')`
      ));

    return {
      applicationsSubmitted: applicationsSubmittedResult?.count || 0,
      inReview: inReviewResult?.count || 0,
      profileViews: 0, // Placeholder for future implementation
    };
  }
}

export const storage = new DatabaseStorage();
