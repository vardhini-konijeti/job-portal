// Referenced from javascript_log_in_with_replit and javascript_database blueprints
import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const UserRole = {
  SUPERADMIN: 'superadmin',
  RECRUITER: 'recruiter',
  APPLICANT: 'applicant',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Job types enum
export const JobType = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
} as const;

export type JobTypeType = typeof JobType[keyof typeof JobType];

// Experience levels enum
export const ExperienceLevel = {
  ENTRY: 'Entry Level',
  MID: 'Mid Level',
  SENIOR: 'Senior Level',
  LEAD: 'Lead',
} as const;

export type ExperienceLevelType = typeof ExperienceLevel[keyof typeof ExperienceLevel];

// Application status enum
export const ApplicationStatus = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  INTERVIEWING: 'Interviewing',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
} as const;

export type ApplicationStatusType = typeof ApplicationStatus[keyof typeof ApplicationStatus];

// Users table - Extended for Replit Auth with role management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default(UserRole.APPLICANT),
  
  // Recruiter-specific fields
  companyName: varchar("company_name"),
  companyWebsite: varchar("company_website"),
  isApproved: boolean("is_approved").default(false), // For recruiter approval by superadmin
  
  // Applicant-specific fields
  phone: varchar("phone"),
  location: varchar("location"),
  resumeUrl: varchar("resume_url"),
  skills: text("skills").array(),
  experience: text("experience"),
  education: text("education"),
  bio: text("bio"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Jobs table
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recruiterId: varchar("recruiter_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  title: varchar("title", { length: 200 }).notNull(),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  companyLogo: varchar("company_logo"),
  location: varchar("location", { length: 200 }).notNull(),
  jobType: varchar("job_type", { length: 50 }).notNull(),
  experienceLevel: varchar("experience_level", { length: 50 }).notNull(),
  
  description: text("description").notNull(),
  requirements: text("requirements").array().notNull(),
  responsibilities: text("responsibilities").array().notNull(),
  skills: text("skills").array().notNull(),
  
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: varchar("salary_currency", { length: 10 }).default('USD'),
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  recruiterId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// Applications table
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  applicantId: varchar("applicant_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  resumeUrl: varchar("resume_url").notNull(),
  coverLetter: text("cover_letter"),
  status: varchar("status", { length: 50 }).notNull().default(ApplicationStatus.SUBMITTED),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  applicantId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  jobs: many(jobs),
  applications: many(applications),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  recruiter: one(users, {
    fields: [jobs.recruiterId],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  applicant: one(users, {
    fields: [applications.applicantId],
    references: [users.id],
  }),
}));
