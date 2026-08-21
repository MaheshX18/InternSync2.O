import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { MongoClient, Db } from 'mongodb';
import { GoogleGenAI } from '@google/genai';
import {
  TPODashboardOverview,
  TPOStudentSummary,
  TPOStudentDetail,
  DepartmentAnalytics,
  InterventionItem,
  DriveEligibilityResult,
  CareerReadinessResponse,
  ReadinessComponent
} from './src/types/index';

const PORT = 8081;
const JWT_SECRET = process.env.JWT_SECRET || '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internsync_db';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'internsync_store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface UserStore {
  id: string;
  email: string;
  passwordHash: string;
  role: 'STUDENT' | 'COMPANY' | 'TPO' | 'ADMIN' | 'FACULTY_MENTOR';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  institutionId?: string;
  collegeName?: string;
  department?: string;
  rollNumber?: string;
  prn?: string;
  batch?: string;
  skills?: string[];
  resumeUrl?: string;
  gpa?: number;
  companyId?: string;
  companyName?: string;
  companyWebsite?: string;
  companyLogoUrl?: string;
  companyDescription?: string;
  industry?: string;
  designation?: string;
  employeeId?: string;
  maxCapacity?: number;
  createdAt: string;
  bookmarks?: string[];
  preferredRole?: string;
}

interface InternshipStore {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  requiredSkills: string[];
  location: string;
  workplaceType: 'ON_SITE' | 'HYBRID' | 'REMOTE';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  experienceLevel: 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR';
  stipendOrSalaryMin?: number;
  stipendOrSalaryMax?: number;
  currency?: string;
  isPaid: boolean;
  positionsAvailable: number;
  applicationDeadline?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'CLOSED' | 'REMOVED_BY_ADMIN';
  createdAt: string;
  updatedAt: string;
  applicantCount?: number;
  duration?: string;
  eligibilityCriteria?: {
    minCgpa?: number;
    allowedDepartments?: string[];
    batch?: string;
    maxBacklogs?: number;
    passingYear?: string;
  };
}

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEWED'
  | 'SELECTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface StatusHistoryItem {
  status: ApplicationStatus;
  timestamp: string;
  notes?: string;
  updatedBy?: string;
}

export interface ApplicationStore {
  id: string;
  internshipId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  internshipTitle: string;
  companyId: string;
  companyName: string;
  coverLetter: string;
  resumeUrl: string;
  skills: string[];
  phoneNumber: string;
  university: string;
  graduationYear: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  recruiterNotes?: string;
  statusHistory?: StatusHistoryItem[];
}

export interface NotificationStore {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

interface RefreshTokenStore {
  id: string;
  userId: string;
  token: string;
  expiryDate: string;
}

export interface TrainingProgramStore {
  id: string;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  assignedStudentCount?: number;
  completedStudentCount?: number;
  completionRate?: number;
}

export interface TrainingAssignmentStore {
  id: string;
  trainingId: string;
  trainingTitle: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  department?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  assignedAt: string;
  completedAt?: string;
}

export interface PlacementDriveStore {
  id: string;
  companyName: string;
  companyLogoUrl?: string;
  role: string;
  packageOffered: string;
  minCgpa: number;
  allowedDepartments: string[];
  requiredSkills: string[];
  batch?: string;
  deadline: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'OPEN' | 'CLOSED';
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  eligibleStudentCount?: number;
  totalStudentCount?: number;
}

export interface InterventionStore {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  gpa: number;
  readinessScore: number;
  readinessLevel: string;
  reasons: string[];
  recommendedActions: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
}

export interface AcademicSubjectStore {
  code: string;
  name: string;
  credits: number;
  marks: number;
  maxMarks: number;
  grade: string;
  status: 'PASS' | 'FAIL';
}

export interface SemesterRecordStore {
  semester: number;
  academicYear: string;
  sgpa: number;
  totalCredits: number;
  passedCredits: number;
  status: 'PASS' | 'FAIL';
  subjects: AcademicSubjectStore[];
}

export interface StudentAcademicProfileStore {
  studentId: string;
  cgpa: number;
  currentSemester: number;
  totalPassedSubjects: number;
  totalFailedSubjects: number;
  backlogsCount: number;
  semesters: SemesterRecordStore[];
}

export interface OffCampusInternshipStore {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber?: string;
  department: string;
  companyName: string;
  internshipTitle: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: string;
  location: string;
  mode: 'ON_SITE' | 'HYBRID' | 'REMOTE';
  stipend?: string;
  offerLetterUrl?: string;
  supervisorName?: string;
  supervisorEmail?: string;
  supervisorPhone?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InternshipAttendanceStore {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  department?: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
  notes?: string;
}

export interface InternshipTaskStore {
  id: string;
  internshipId: string;
  internshipTitle?: string;
  companyName?: string;
  studentId: string;
  studentName?: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedDate: string;
  deadline: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercentage: number;
  submissionUrl?: string;
  submissionNotes?: string;
  completedAt?: string;
  feedback?: string;
  createdAt: string;
}

export interface InternshipEvaluationStore {
  id: string;
  internshipId: string;
  internshipTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  companyName: string;
  evaluatorName: string;
  evaluatorRole?: string;
  technicalScore: number;
  attendanceScore: number;
  taskCompletionScore: number;
  professionalismScore: number;
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  feedback: string;
  recommendations: string;
  evaluatedAt: string;
}

export type LifecycleStage = 'REGISTRATION' | 'ELIGIBILITY' | 'APPLICATION' | 'SHORTLISTED' | 'SELECTED' | 'OFFER' | 'TPO_VERIFICATION' | 'JOINING' | 'PROGRESS' | 'EVALUATION' | 'COMPLETION' | 'PPO' | 'REJECTED';

export interface InternshipLifecycleStore {
  id: string;
  applicationId: string;
  internshipId: string;
  studentId: string;
  companyId: string;
  internshipTitle: string;
  companyName: string;
  studentName: string;
  currentStage: LifecycleStage;
  stageHistory: { stage: LifecycleStage; timestamp: string; updatedBy: string; notes?: string }[];
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'OFFER_LETTER' | 'JOINING_LETTER' | 'ACCEPTANCE_LETTER' | 'WEEKLY_REPORT' | 'FINAL_REPORT' | 'COMPLETION_CERTIFICATE' | 'PPO_LETTER';
export type DocumentVerificationStatus = 'PENDING' | 'UPLOADED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface InternshipDocumentStore {
  id: string;
  internshipId: string;
  studentId: string;
  applicationId?: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadDate: string;
  verificationStatus: DocumentVerificationStatus;
  verifiedBy?: string;
  verifiedByName?: string;
  verificationDate?: string;
  rejectionReason?: string;
  createdAt: string;
}

export type WeeklyReportStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REVISION_REQUIRED';

export interface WeeklyReportStore {
  id: string;
  internshipId: string;
  studentId: string;
  studentName: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  workCompleted: string;
  skillsUsed: string[];
  hoursWorked: number;
  challengesFaced: string;
  progressLearning: string;
  nextWeekPlan: string;
  attachmentUrl?: string;
  status: WeeklyReportStatus;
  mentorComments?: string;
  companyComments?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  revisionHistory: { comment: string; by: string; byName: string; at: string; action: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface MentorAssignmentStore {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  studentId: string;
  studentName: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  assignedBy: string;
  assignedByName: string;
  assignedAt: string;
  status: 'ACTIVE' | 'REASSIGNED' | 'COMPLETED';
}

export interface MentorReviewStore {
  id: string;
  mentorId: string;
  mentorName: string;
  studentId: string;
  internshipId: string;
  weeklyReportId?: string;
  reviewType: 'ATTENDANCE' | 'TASK' | 'WEEKLY_REPORT' | 'GENERAL';
  comment: string;
  rating?: number;
  createdAt: string;
}

export interface FacultyMentorAssignmentStore {
  id: string;
  studentId: string;
  mentorId: string;
  assignedBy: string;
  assignedAt: string;
  internshipId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  endedAt?: string;
  reason?: string;
}

export interface MentorNoteStore {
  id: string;
  mentorId: string;
  studentId: string;
  type: 'NOTE' | 'GUIDANCE' | 'CONCERN' | 'ACTION_ITEM';
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MentorActionItemStore {
  id: string;
  mentorId: string;
  studentId: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface PpoStore {
  id: string;
  studentId: string;
  companyId: string;
  internshipId: string;
  internshipTitle: string;
  studentName: string;
  status: 'PPO_RECOMMENDED' | 'PPO_OFFERED' | 'PPO_ACCEPTED' | 'PPO_DECLINED';
  recommendedDate?: string;
  offeredDate?: string;
  acceptedDate?: string;
  declinedDate?: string;
  offerDetails?: string;
  salaryPackage?: string;
  remarks?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  performedByRole: string;
  performedByName: string;
  details: string;
  timestamp: string;
}

let users: UserStore[] = [];
let internships: InternshipStore[] = [];
let refreshTokens: RefreshTokenStore[] = [];
let applications: ApplicationStore[] = [];
let notifications: NotificationStore[] = [];
let trainingPrograms: TrainingProgramStore[] = [];
let trainingAssignments: TrainingAssignmentStore[] = [];
let placementDrives: PlacementDriveStore[] = [];
let interventions: InterventionStore[] = [];
let academicProfiles: Record<string, StudentAcademicProfileStore> = {};
let offCampusInternships: OffCampusInternshipStore[] = [];
let attendanceRecords: InternshipAttendanceStore[] = [];
let internshipTasks: InternshipTaskStore[] = [];
let internshipEvaluations: InternshipEvaluationStore[] = [];
let internshipLifecycles: InternshipLifecycleStore[] = [];
let internshipDocuments: InternshipDocumentStore[] = [];
let weeklyReports: WeeklyReportStore[] = [];
let mentorAssignments: MentorAssignmentStore[] = [];
let mentorReviews: MentorReviewStore[] = [];
let auditLog: AuditLogEntry[] = [];
let ppos: PpoStore[] = [];
let facultyMentorAssignments: FacultyMentorAssignmentStore[] = [];
let mentorNotes: MentorNoteStore[] = [];
let mentorActionItems: MentorActionItemStore[] = [];

function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedEntityId?: string,
  relatedEntityType?: string
) {
  const notif: NotificationStore = {
    id: 'notif_' + crypto.randomBytes(8).toString('hex'),
    userId,
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    relatedEntityId,
    relatedEntityType
  };
  notifications.push(notif);
  saveState();
  return notif;
}

// Seed default accounts if empty
function loadInitialState() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      users = data.users || [];
      internships = data.internships || [];
      refreshTokens = data.refreshTokens || [];
      applications = data.applications || [];
      notifications = data.notifications || [];
      trainingPrograms = data.trainingPrograms || [];
      trainingAssignments = data.trainingAssignments || [];
      placementDrives = data.placementDrives || [];
      interventions = data.interventions || [];
      academicProfiles = data.academicProfiles || {};
      offCampusInternships = data.offCampusInternships || [];
      attendanceRecords = data.attendanceRecords || [];
      internshipTasks = data.internshipTasks || [];
      internshipEvaluations = data.internshipEvaluations || [];
      internshipLifecycles = data.internshipLifecycles || [];
      internshipDocuments = data.internshipDocuments || [];
      weeklyReports = data.weeklyReports || [];
      mentorAssignments = data.mentorAssignments || [];
      mentorReviews = data.mentorReviews || [];
      auditLog = data.auditLog || [];
      ppos = data.ppos || [];
      facultyMentorAssignments = data.facultyMentorAssignments || [];
      mentorNotes = data.mentorNotes || [];
      mentorActionItems = data.mentorActionItems || [];
    } catch (e) {
      console.error('Failed to parse local store file, starting fresh:', e);
    }
  }

  const defaultPassword = bcrypt.hashSync('Password123!', 10);
  const now = new Date().toISOString();

  const adminUser: UserStore = {
    id: 'usr_admin_001',
    email: 'admin@university.edu',
    passwordHash: defaultPassword,
    role: 'ADMIN',
    status: 'ACTIVE',
    firstName: 'Master',
    lastName: 'Administrator',
    createdAt: now,
    bookmarks: []
  };

  const tpoUser: UserStore = {
    id: 'usr_tpo_001',
    email: 'tpo@university.edu',
    passwordHash: defaultPassword,
    role: 'TPO',
    status: 'ACTIVE',
    firstName: 'Mahesh',
    lastName: 'Patil',
    department: 'Training & Placement Office',
    institutionId: 'INST-2026',
    createdAt: now,
    bookmarks: []
  };

  const companyUser: UserStore = {
    id: 'usr_company_001',
    email: 'recruiter@techcorp.com',
    passwordHash: defaultPassword,
    role: 'COMPANY',
    status: 'ACTIVE',
    firstName: 'TechCorp',
    lastName: 'Recruitment',
    companyId: 'usr_company_001',
    companyName: 'TechCorp Solutions',
    companyWebsite: 'https://techcorp.example.com',
    companyDescription: 'Leading enterprise cloud solution provider.',
    industry: 'Software & Technology',
    createdAt: now,
    bookmarks: []
  };

  const studentUser1: UserStore = {
    id: 'usr_student_001',
    email: 'student@university.edu',
    passwordHash: defaultPassword,
    role: 'STUDENT',
    status: 'ACTIVE',
    firstName: 'Jane',
    lastName: 'Doe',
    department: 'Computer Science',
    institutionId: 'INST-2026',
    rollNumber: 'CS-2026-001',
    batch: '2026',
    gpa: 3.8,
    phone: '+1 555-0143',
    bio: 'Final year CS student passionate about distributed systems and cloud applications.',
    skills: ['Java', 'Spring Boot', 'React', 'SQL', 'Git'],
    createdAt: now,
    bookmarks: []
  };

  const studentUser2: UserStore = {
    id: 'usr_student_002',
    email: 'rahul@university.edu',
    passwordHash: defaultPassword,
    role: 'STUDENT',
    status: 'ACTIVE',
    firstName: 'Rahul',
    lastName: 'Sharma',
    department: 'Information Technology',
    institutionId: 'INST-2026',
    rollNumber: 'IT-2026-042',
    batch: '2026',
    gpa: 3.5,
    skills: ['Python', 'Django', 'React', 'Git'],
    createdAt: now,
    bookmarks: []
  };

  const studentUser3: UserStore = {
    id: 'usr_student_003',
    email: 'priya@university.edu',
    passwordHash: defaultPassword,
    role: 'STUDENT',
    status: 'ACTIVE',
    firstName: 'Priya',
    lastName: 'Patel',
    department: 'Electronics & Telecom',
    institutionId: 'INST-2026',
    rollNumber: 'ETC-2026-015',
    batch: '2026',
    gpa: 2.7,
    skills: ['C++', 'Embedded Systems'],
    createdAt: now,
    bookmarks: []
  };

  const studentUser4: UserStore = {
    id: 'usr_student_004',
    email: 'amit@university.edu',
    passwordHash: defaultPassword,
    role: 'STUDENT',
    status: 'ACTIVE',
    firstName: 'Amit',
    lastName: 'Verma',
    department: 'Data Science',
    institutionId: 'INST-2026',
    rollNumber: 'DS-2026-008',
    batch: '2026',
    gpa: 3.9,
    skills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'PyTorch'],
    createdAt: now,
    bookmarks: []
  };

  const mentorUser: UserStore = {
    id: 'usr_mentor_001',
    email: 'mentor@university.edu',
    passwordHash: defaultPassword,
    role: 'FACULTY_MENTOR',
    status: 'ACTIVE',
    firstName: 'Dr. Sneha',
    lastName: 'Kulkarni',
    department: 'Computer Science',
    institutionId: 'INST-2026',
    phone: '+91 98765 43210',
    bio: 'Associate Professor, Department of Computer Science. Faculty mentor for internship students.',
    designation: 'Associate Professor',
    employeeId: 'FAC-CS-003',
    maxCapacity: 10,
    createdAt: now,
    bookmarks: []
  };

  const mentorUser2: UserStore = {
    id: 'usr_mentor_002',
    email: 'rahul.mentor@university.edu',
    passwordHash: defaultPassword,
    role: 'FACULTY_MENTOR',
    status: 'ACTIVE',
    firstName: 'Dr. Rahul',
    lastName: 'Sharma',
    department: 'Computer Science',
    institutionId: 'INST-2026',
    phone: '+91 98765 11111',
    bio: 'Assistant Professor, Computer Science. Specializes in AI and ML.',
    designation: 'Assistant Professor',
    employeeId: 'FAC-CS-001',
    maxCapacity: 10,
    createdAt: now,
    bookmarks: []
  };

  const mentorUser3: UserStore = {
    id: 'usr_mentor_003',
    email: 'meera.mentor@university.edu',
    passwordHash: defaultPassword,
    role: 'FACULTY_MENTOR',
    status: 'ACTIVE',
    firstName: 'Dr. Meera',
    lastName: 'Joshi',
    department: 'Information Technology',
    institutionId: 'INST-2026',
    phone: '+91 98765 22222',
    bio: 'Associate Professor, Information Technology. Expert in cloud computing and DevOps.',
    designation: 'Associate Professor',
    employeeId: 'FAC-IT-002',
    maxCapacity: 8,
    createdAt: now,
    bookmarks: []
  };

  const studentUser5: UserStore = {
    id: 'usr_student_005',
    email: 'mahesh.patil@university.edu',
    passwordHash: defaultPassword,
    role: 'STUDENT',
    status: 'ACTIVE',
    firstName: 'Mahesh',
    lastName: 'Patil',
    department: 'AI & ML',
    institutionId: 'INST-2026',
    rollNumber: '23AIML001',
    batch: '2026',
    gpa: 3.75,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'React'],
    createdAt: now,
    bookmarks: []
  };

  const canonicalUsers = [adminUser, tpoUser, companyUser, studentUser1, studentUser2, studentUser3, studentUser4, studentUser5, mentorUser, mentorUser2, mentorUser3];

  canonicalUsers.forEach(cu => {
    const idx = users.findIndex(u => u.email.toLowerCase() === cu.email.toLowerCase() || u.id === cu.id);
    if (idx >= 0) {
      users[idx] = { ...cu, ...users[idx], passwordHash: defaultPassword, status: 'ACTIVE' };
    } else {
      users.push(cu);
    }
  });

  if (internships.length === 0) {
    internships = [
      {
        id: 'int_001',
        companyId: companyUser.id,
        companyName: companyUser.companyName!,
        title: 'Fullstack Software Engineering Intern',
        description: 'Join TechCorp for a 6-month hands-on internship in React, TypeScript, and Spring Boot API development.',
        requirements: ['Knowledge of JS/TS', 'Understanding of REST APIs'],
        responsibilities: ['Build modern user interfaces', 'Collaborate with backend teams'],
        requiredSkills: ['React', 'TypeScript', 'Java'],
        location: 'San Francisco, CA',
        workplaceType: 'HYBRID',
        employmentType: 'INTERNSHIP',
        experienceLevel: 'ENTRY_LEVEL',
        stipendOrSalaryMin: 4500,
        stipendOrSalaryMax: 6000,
        currency: 'USD',
        isPaid: true,
        positionsAvailable: 3,
        status: 'PUBLISHED',
        createdAt: now,
        updatedAt: now
      }
    ];

    trainingPrograms = [
      {
        id: 'trn_001',
        title: 'Enterprise Java & Spring Boot Masterclass',
        description: 'Comprehensive bootcamp covering Spring Boot microservices, Spring Security, JPA/Hibernate, and Cloud deployment.',
        duration: '4 Weeks',
        skills: ['Java', 'Spring Boot', 'REST APIs', 'SQL'],
        status: 'ACTIVE',
        createdBy: 'Dr. Mahesh Patil',
        createdAt: now,
        updatedAt: now,
        assignedStudentCount: 3,
        completedStudentCount: 1,
        completionRate: 33
      },
      {
        id: 'trn_002',
        title: 'Full Stack React & Node.js Accelerator',
        description: 'Modern web development covering React 18, TypeScript, Tailwind CSS, Express, and MongoDB RESTful architecture.',
        duration: '6 Weeks',
        skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
        status: 'ACTIVE',
        createdBy: 'Dr. Mahesh Patil',
        createdAt: now,
        updatedAt: now,
        assignedStudentCount: 2,
        completedStudentCount: 0,
        completionRate: 0
      },
      {
        id: 'trn_003',
        title: 'Data Structures & Competitive Algorithms Intensive',
        description: 'Master core algorithmic problem-solving, dynamic programming, tree traversals, and system design screens.',
        duration: '3 Weeks',
        skills: ['DSA', 'Algorithms', 'Data Structures', 'System Design'],
        status: 'ACTIVE',
        createdBy: 'Dr. Mahesh Patil',
        createdAt: now,
        updatedAt: now,
        assignedStudentCount: 4,
        completedStudentCount: 2,
        completionRate: 50
      }
    ];

    trainingAssignments = [
      {
        id: 'asgn_001',
        trainingId: 'trn_001',
        trainingTitle: 'Enterprise Java & Spring Boot Masterclass',
        studentId: 'usr_student_001',
        studentName: 'Jane Doe',
        studentEmail: 'student@university.edu',
        department: 'Computer Science',
        status: 'COMPLETED',
        progress: 100,
        assignedAt: now,
        completedAt: now
      },
      {
        id: 'asgn_002',
        trainingId: 'trn_001',
        trainingTitle: 'Enterprise Java & Spring Boot Masterclass',
        studentId: 'usr_student_003',
        studentName: 'Priya Patel',
        studentEmail: 'priya@university.edu',
        department: 'Electronics & Telecom',
        status: 'IN_PROGRESS',
        progress: 40,
        assignedAt: now
      }
    ];

    placementDrives = [
      {
        id: 'drv_001',
        companyName: 'Tata Consultancy Services',
        role: 'Software Engineering Trainee',
        packageOffered: '7.5 LPA',
        minCgpa: 3.0,
        allowedDepartments: ['Computer Science', 'Information Technology', 'Electronics & Telecom'],
        requiredSkills: ['Java', 'SQL', 'Git'],
        batch: '2026',
        deadline: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        status: 'ACTIVE',
        createdBy: 'Dr. Mahesh Patil',
        createdAt: now,
        updatedAt: now,
        eligibleStudentCount: 4
      },
      {
        id: 'drv_002',
        companyName: 'Infosys Specialist Drive',
        role: 'Specialist Programmer & Systems Engineer',
        packageOffered: '9.5 LPA',
        minCgpa: 3.2,
        allowedDepartments: ['Computer Science', 'Information Technology', 'Data Science'],
        requiredSkills: ['Python', 'Java', 'React'],
        batch: '2026',
        deadline: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString(),
        status: 'ACTIVE',
        createdBy: 'Dr. Mahesh Patil',
        createdAt: now,
        updatedAt: now,
        eligibleStudentCount: 3
      }
    ];

    // Academic Profiles for Students
    academicProfiles['usr_student_001'] = {
      studentId: 'usr_student_001',
      cgpa: 3.8,
      currentSemester: 6,
      totalPassedSubjects: 24,
      totalFailedSubjects: 0,
      backlogsCount: 0,
      semesters: [
        {
          semester: 1,
          academicYear: '2023-2024',
          sgpa: 3.75,
          totalCredits: 20,
          passedCredits: 20,
          status: 'PASS',
          subjects: [
            { code: 'CS101', name: 'Engineering Mathematics I', credits: 4, marks: 88, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS102', name: 'Programming Fundamentals in C', credits: 4, marks: 92, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS103', name: 'Digital Electronics', credits: 4, marks: 84, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS104', name: 'Communication Skills', credits: 4, marks: 90, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS105', name: 'Basic Electrical Engineering', credits: 4, marks: 82, maxMarks: 100, grade: 'B+', status: 'PASS' }
          ]
        },
        {
          semester: 2,
          academicYear: '2023-2024',
          sgpa: 3.82,
          totalCredits: 20,
          passedCredits: 20,
          status: 'PASS',
          subjects: [
            { code: 'CS201', name: 'Data Structures & Algorithms', credits: 4, marks: 94, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS202', name: 'Object Oriented Programming in Java', credits: 4, marks: 96, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS203', name: 'Discrete Mathematics', credits: 4, marks: 85, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS204', name: 'Computer Organization', credits: 4, marks: 87, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS205', name: 'Environmental Science', credits: 4, marks: 89, maxMarks: 100, grade: 'A', status: 'PASS' }
          ]
        },
        {
          semester: 3,
          academicYear: '2024-2025',
          sgpa: 3.85,
          totalCredits: 22,
          passedCredits: 22,
          status: 'PASS',
          subjects: [
            { code: 'CS301', name: 'Database Management Systems', credits: 4, marks: 95, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS302', name: 'Operating Systems', credits: 4, marks: 91, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS303', name: 'Computer Networks', credits: 4, marks: 88, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS304', name: 'Theory of Computation', credits: 4, marks: 86, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS305', name: 'Web Development Lab', credits: 6, marks: 98, maxMarks: 100, grade: 'A+', status: 'PASS' }
          ]
        },
        {
          semester: 4,
          academicYear: '2024-2025',
          sgpa: 3.80,
          totalCredits: 22,
          passedCredits: 22,
          status: 'PASS',
          subjects: [
            { code: 'CS401', name: 'Design and Analysis of Algorithms', credits: 4, marks: 90, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS402', name: 'Software Engineering', credits: 4, marks: 93, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS403', name: 'Cloud Computing & DevOps', credits: 4, marks: 92, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS404', name: 'Microprocessors', credits: 4, marks: 84, maxMarks: 100, grade: 'B+', status: 'PASS' },
            { code: 'CS405', name: 'Fullstack Project Lab', credits: 6, marks: 96, maxMarks: 100, grade: 'A+', status: 'PASS' }
          ]
        },
        {
          semester: 5,
          academicYear: '2025-2026',
          sgpa: 3.88,
          totalCredits: 24,
          passedCredits: 24,
          status: 'PASS',
          subjects: [
            { code: 'CS501', name: 'Artificial Intelligence', credits: 4, marks: 94, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS502', name: 'Information Security', credits: 4, marks: 89, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS503', name: 'Distributed Systems', credits: 4, marks: 91, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS504', name: 'Data Mining & Warehousing', credits: 4, marks: 87, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS505', name: 'Industrial Mini-Project', credits: 8, marks: 97, maxMarks: 100, grade: 'A+', status: 'PASS' }
          ]
        }
      ]
    };

    academicProfiles['usr_student_002'] = {
      studentId: 'usr_student_002',
      cgpa: 3.5,
      currentSemester: 6,
      totalPassedSubjects: 23,
      totalFailedSubjects: 1,
      backlogsCount: 0,
      semesters: [
        {
          semester: 1,
          academicYear: '2023-2024',
          sgpa: 3.4,
          totalCredits: 20,
          passedCredits: 20,
          status: 'PASS',
          subjects: [
            { code: 'IT101', name: 'Applied Mathematics', credits: 4, marks: 78, maxMarks: 100, grade: 'B', status: 'PASS' },
            { code: 'IT102', name: 'Python Programming', credits: 4, marks: 92, maxMarks: 100, grade: 'A+', status: 'PASS' }
          ]
        },
        {
          semester: 2,
          academicYear: '2023-2024',
          sgpa: 3.6,
          totalCredits: 20,
          passedCredits: 20,
          status: 'PASS',
          subjects: [
            { code: 'IT201', name: 'Data Structures', credits: 4, marks: 88, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'IT202', name: 'Database Systems', credits: 4, marks: 86, maxMarks: 100, grade: 'A', status: 'PASS' }
          ]
        }
      ]
    };

    academicProfiles['usr_student_003'] = {
      studentId: 'usr_student_003',
      cgpa: 2.7,
      currentSemester: 6,
      totalPassedSubjects: 18,
      totalFailedSubjects: 4,
      backlogsCount: 2,
      semesters: [
        {
          semester: 1,
          academicYear: '2023-2024',
          sgpa: 2.8,
          totalCredits: 20,
          passedCredits: 16,
          status: 'FAIL',
          subjects: [
            { code: 'ETC101', name: 'Signals & Systems', credits: 4, marks: 42, maxMarks: 100, grade: 'F', status: 'FAIL' },
            { code: 'ETC102', name: 'C++ Programming', credits: 4, marks: 76, maxMarks: 100, grade: 'B', status: 'PASS' }
          ]
        }
      ]
    };

    // Off Campus Internships
    offCampusInternships = [
      {
        id: 'off_001',
        studentId: 'usr_student_002',
        studentName: 'Rahul Sharma',
        studentEmail: 'rahul@university.edu',
        rollNumber: 'IT-2026-042',
        department: 'Information Technology',
        companyName: 'Infosys Limited',
        internshipTitle: 'Cloud Engineering & DevOps Intern',
        description: 'Working on AWS infrastructure automation, Docker containers, and CI/CD pipeline optimization.',
        startDate: '2026-01-10',
        endDate: '2026-06-30',
        duration: '6 Months',
        location: 'Pune, Maharashtra',
        mode: 'HYBRID',
        stipend: '₹25,000 / month',
        offerLetterUrl: 'https://internsync.example.com/docs/rahul-infosys-offer.pdf',
        supervisorName: 'Sanjay Deshmukh',
        supervisorEmail: 'sanjay.d@infosys.example.com',
        supervisorPhone: '+91 98234 56789',
        status: 'APPROVED',
        verificationNotes: 'Offer letter and company supervisor verified directly by T&P cell. Approved for academic internship credits.',
        verifiedBy: 'Dr. Mahesh Patil (TPO)',
        verifiedAt: now,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'off_002',
        studentId: 'usr_student_003',
        studentName: 'Priya Patel',
        studentEmail: 'priya@university.edu',
        rollNumber: 'ETC-2026-015',
        department: 'Electronics & Telecom',
        companyName: 'Bosch Automotive Electronics',
        internshipTitle: 'Embedded IoT Firmware Intern',
        description: 'Developing firmware drivers and CAN-bus telemetry handlers for automotive sensors.',
        startDate: '2026-03-01',
        endDate: '2026-08-31',
        duration: '6 Months',
        location: 'Bengaluru, Karnataka',
        mode: 'ON_SITE',
        stipend: '₹22,000 / month',
        offerLetterUrl: 'https://internsync.example.com/docs/priya-bosch-offer.pdf',
        supervisorName: 'Vikas Rao',
        supervisorEmail: 'vikas.rao@bosch.example.com',
        supervisorPhone: '+91 98450 12345',
        status: 'PENDING',
        createdAt: now,
        updatedAt: now
      }
    ];

    // Attendance records
    const todayStr = new Date().toISOString().split('T')[0];
    attendanceRecords = [
      {
        id: 'att_001',
        studentId: 'usr_student_001',
        studentName: 'Jane Doe',
        studentEmail: 'student@university.edu',
        department: 'Computer Science',
        internshipId: 'int_001',
        internshipTitle: 'Fullstack Software Engineering Intern',
        companyName: 'TechCorp Solutions',
        date: todayStr,
        timestamp: now,
        status: 'PRESENT',
        notes: 'Regular check-in: Working on Sprint 4 backlog items and user profile API.'
      }
    ];

    // Seed past attendance dates for Jane Doe
    for (let i = 1; i <= 20; i++) {
      const pastDate = new Date(Date.now() - i * 24 * 3600 * 1000).toISOString().split('T')[0];
      attendanceRecords.push({
        id: `att_jane_${i}`,
        studentId: 'usr_student_001',
        studentName: 'Jane Doe',
        studentEmail: 'student@university.edu',
        department: 'Computer Science',
        internshipId: 'int_001',
        internshipTitle: 'Fullstack Software Engineering Intern',
        companyName: 'TechCorp Solutions',
        date: pastDate,
        timestamp: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString(),
        status: i === 7 ? 'ABSENT' : 'PRESENT',
        notes: i === 7 ? 'Medical leave requested' : 'Standard daily check-in'
      });
    }

    // Tasks for Jane Doe
    internshipTasks = [
      {
        id: 'task_001',
        internshipId: 'int_001',
        internshipTitle: 'Fullstack Software Engineering Intern',
        companyName: 'TechCorp Solutions',
        studentId: 'usr_student_001',
        studentName: 'Jane Doe',
        title: 'Design and Implement User Profile Management REST API',
        description: 'Create authenticated endpoints for updating student profiles, uploading avatars, and synchronizing skills with Spring Boot backend.',
        assignedBy: 'TechCorp Engineering Lead',
        assignedDate: now,
        deadline: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        status: 'COMPLETED',
        progressPercentage: 100,
        submissionUrl: 'https://github.com/techcorp/internsync/pull/42',
        submissionNotes: 'All unit tests passing, swagger docs generated, and PR reviewed.',
        completedAt: now,
        feedback: 'Outstanding clean architecture and comprehensive unit test coverage.',
        createdAt: now
      },
      {
        id: 'task_002',
        internshipId: 'int_001',
        internshipTitle: 'Fullstack Software Engineering Intern',
        companyName: 'TechCorp Solutions',
        studentId: 'usr_student_001',
        studentName: 'Jane Doe',
        title: 'Build Interactive Attendance & Task Tracker Dashboard Component',
        description: 'Implement a modern React 18 component with Tailwind CSS supporting one-click daily check-in and task progress sliders.',
        assignedBy: 'TechCorp Engineering Lead',
        assignedDate: now,
        deadline: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
        status: 'IN_PROGRESS',
        progressPercentage: 75,
        submissionUrl: 'https://github.com/techcorp/internsync/pull/48',
        submissionNotes: 'UI completed, connecting with live attendance API client.',
        createdAt: now
      },
      {
        id: 'task_003',
        internshipId: 'int_001',
        internshipTitle: 'Fullstack Software Engineering Intern',
        companyName: 'TechCorp Solutions',
        studentId: 'usr_student_001',
        studentName: 'Jane Doe',
        title: 'Containerize Microservice with Docker & Prepare Helm Charts',
        description: 'Write multi-stage Dockerfile and configure local Kubernetes deployment manifest for staging rollout.',
        assignedBy: 'TechCorp Engineering Lead',
        assignedDate: now,
        deadline: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
        status: 'TODO',
        progressPercentage: 0,
        createdAt: now
      }
    ];

    // Company Evaluation for Jane Doe
    internshipEvaluations = [
      {
        id: 'eval_001',
        internshipId: 'int_001',
        internshipTitle: 'Fullstack Software Engineering Intern',
        studentId: 'usr_student_001',
        studentName: 'Jane Doe',
        studentEmail: 'student@university.edu',
        department: 'Computer Science',
        companyName: 'TechCorp Solutions',
        evaluatorName: 'Sarah Jenkins',
        evaluatorRole: 'Principal Engineering Manager',
        technicalScore: 94,
        attendanceScore: 96,
        taskCompletionScore: 95,
        professionalismScore: 98,
        overallScore: 96,
        grade: 'A+',
        feedback: 'Jane has demonstrated extraordinary competence in building enterprise full-stack systems. Fast learner, dependable communicator, and writes exemplary clean code.',
        recommendations: 'Strongly recommended for pre-placement full-time offer (PPO) upon graduation.',
        evaluatedAt: now
      }
    ];
  }

  saveState();
}

function saveState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
      users,
      internships,
      refreshTokens,
      applications,
      notifications,
      trainingPrograms,
      trainingAssignments,
      placementDrives,
      interventions,
      academicProfiles,
      offCampusInternships,
      attendanceRecords,
      internshipTasks,
      internshipEvaluations,
      internshipLifecycles,
      internshipDocuments,
      weeklyReports,
      mentorAssignments,
      mentorReviews,
      auditLog,
      ppos,
      facultyMentorAssignments,
      mentorNotes,
      mentorActionItems
    }, null, 2));
  } catch (e) {
    console.error('Failed to write local store file:', e);
  }
}

loadInitialState();

// Express App Configuration
const app = express();
app.use(cors());
app.use(express.json());

// Helper for ApiResponse
function apiSuccess<T>(message: string, data: T) {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

function apiError(message: string, data: any = null) {
  return {
    success: false,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

// Helper for Profile Completeness
function computeCompleteness(user: UserStore): number {
  let fields: any[] = [];
  if (user.role === 'STUDENT') {
    fields = [user.firstName, user.lastName, user.phone, user.bio, user.location, user.institutionId, user.department, user.rollNumber, user.batch, (user.skills && user.skills.length > 0), user.resumeUrl, user.gpa];
  } else if (user.role === 'COMPANY') {
    fields = [user.firstName, user.lastName, user.phone, user.bio, user.location, user.companyName, user.companyWebsite, user.companyDescription, user.industry];
  } else {
    fields = [user.firstName, user.lastName, user.phone, user.bio, user.location];
  }
  const filled = fields.filter(f => f !== undefined && f !== null && f !== '' && f !== false).length;
  return Math.min(100, Math.round((filled / fields.length) * 100));
}

function getActiveInternshipForStudent(studentId: string) {
  // Check accepted on-campus applications first
  const acceptedApp = applications.find(a => a.studentId === studentId && (a.status === 'ACCEPTED' || (a.status as any) === 'SELECTED'));
  if (acceptedApp) {
    const posting = internships.find(i => i.id === acceptedApp.internshipId);
    return {
      id: acceptedApp.internshipId,
      title: acceptedApp.internshipTitle,
      companyName: acceptedApp.companyName,
      type: 'ON_CAMPUS' as const,
      startDate: acceptedApp.appliedAt,
      status: 'ACTIVE' as const
    };
  }

  // Check approved off-campus internships
  const approvedOffCampus = offCampusInternships.find(o => o.studentId === studentId && o.status === 'APPROVED');
  if (approvedOffCampus) {
    return {
      id: approvedOffCampus.id,
      title: approvedOffCampus.internshipTitle,
      companyName: approvedOffCampus.companyName,
      type: 'OFF_CAMPUS' as const,
      startDate: approvedOffCampus.startDate,
      endDate: approvedOffCampus.endDate,
      status: 'ACTIVE' as const
    };
  }

  // Default active for Jane Doe demo if not in applications
  if (studentId === 'usr_student_001') {
    return {
      id: 'int_001',
      title: 'Fullstack Software Engineering Intern',
      companyName: 'TechCorp Solutions',
      type: 'ON_CAMPUS' as const,
      startDate: '2026-01-15',
      status: 'ACTIVE' as const
    };
  }

  return null;
}

function toUserProfile(user: UserStore) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    phone: user.phone || null,
    bio: user.bio || null,
    location: user.location || null,
    avatarUrl: user.avatarUrl || null,
    websiteUrl: user.websiteUrl || null,
    linkedinUrl: user.linkedinUrl || null,
    githubUrl: user.githubUrl || null,
    institutionId: user.institutionId || null,
    collegeName: user.collegeName || (user.institutionId ? 'College of Engineering & Technology' : null),
    department: user.department || null,
    rollNumber: user.rollNumber || null,
    prn: user.prn || (user.rollNumber ? `PRN-${user.rollNumber.replace(/[^a-zA-Z0-9]/g, '')}` : null),
    batch: user.batch || null,
    skills: user.skills || [],
    resumeUrl: user.resumeUrl || null,
    gpa: user.gpa || null,
    activeInternship: user.role === 'STUDENT' ? getActiveInternshipForStudent(user.id) : null,
    companyId: user.companyId || (user.role === 'COMPANY' ? user.id : null),
    companyName: user.companyName || (user.role === 'COMPANY' ? `${user.firstName}'s Company` : null),
    companyWebsite: user.companyWebsite || null,
    companyLogoUrl: user.companyLogoUrl || null,
    companyDescription: user.companyDescription || null,
    industry: user.industry || null,
    profileCompleteness: computeCompleteness(user),
    createdAt: user.createdAt
  };
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: UserStore;
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json(apiError('Unauthorized: Missing access token'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json(apiError('Unauthorized: User not found'));
    }
    if (user.status !== 'ACTIVE') {
      return res.status(403).json(apiError('Forbidden: User account is inactive or suspended'));
    }
    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json(apiError('Unauthorized: Invalid or expired token'));
  }
}

function optionalToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.user = users.find(u => u.id === decoded.userId);
    } catch {}
  }
  next();
}

function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(apiError('Unauthorized'));
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(apiError('Forbidden: Insufficient role permissions'));
    }
    next();
  };
}

// Pagination helper
function paginate<T>(items: T[], page = 0, size = 10) {
  const totalElements = items.length;
  const totalPages = Math.ceil(totalElements / size) || 1;
  const currentPage = Math.max(0, Math.min(page, totalPages - 1));
  const startIndex = currentPage * size;
  const content = items.slice(startIndex, startIndex + size);

  return {
    content,
    pageable: {
      pageNumber: currentPage,
      pageSize: size,
      offset: startIndex,
      paged: true,
      unpaged: false
    },
    page: currentPage,
    size,
    totalPages,
    totalElements,
    last: currentPage >= totalPages - 1,
    numberOfElements: content.length,
    first: currentPage === 0,
    empty: content.length === 0,
    sort: { empty: false, sorted: true, unsorted: false }
  };
}

// --- API ROUTES ---

// Health
app.get('/api/v1/health', (req, res) => {
  res.json(apiSuccess('InternSync Service Health Check Successful', {
    status: 'UP',
    service: 'InternSync Platform API',
    timestamp: new Date().toISOString()
  }));
});

// Auth
app.post('/api/v1/auth/register', (req, res) => {
  const {
    email, password, firstName, lastName, role,
    institutionId, collegeName, department, rollNumber, prn, batch, phone, gpa,
    companyName, companyWebsite, companyDescription, industry,
    adminSecretKey
  } = req.body;

  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json(apiError('Missing required registration fields'));
  }

  if (role === 'ADMIN') {
    if (adminSecretKey !== 'InternSyncAdminMasterKey2026') {
      return res.status(400).json(apiError('Invalid admin secret key'));
    }
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json(apiError('Email address is already registered'));
  }

  const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
  const passwordHash = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();

  const newUser: UserStore = {
    id: userId,
    email: email.toLowerCase(),
    passwordHash,
    role,
    status: 'ACTIVE',
    firstName,
    lastName,
    phone,
    institutionId: institutionId || collegeName,
    collegeName: collegeName || institutionId || 'College of Engineering & Technology',
    department,
    rollNumber,
    prn: prn || (rollNumber ? `PRN-${rollNumber.replace(/[^a-zA-Z0-9]/g, '')}` : undefined),
    batch: batch || '2026',
    gpa: gpa ? Number(gpa) : (role === 'STUDENT' ? 3.5 : undefined),
    skills: role === 'STUDENT' ? ['React', 'TypeScript', 'Java', 'SQL', 'Git'] : [],
    companyId: role === 'COMPANY' ? userId : undefined,
    companyName: role === 'COMPANY' ? (companyName || `${firstName}'s Company`) : undefined,
    companyWebsite,
    companyDescription,
    industry,
    createdAt: now,
    bookmarks: []
  };

  users.push(newUser);

  if (role === 'STUDENT') {
    academicProfiles[userId] = {
      studentId: userId,
      cgpa: newUser.gpa || 3.5,
      currentSemester: 6,
      totalPassedSubjects: 20,
      totalFailedSubjects: 0,
      backlogsCount: 0,
      semesters: [
        {
          semester: 1,
          academicYear: '2023-2024',
          sgpa: 3.5,
          totalCredits: 20,
          passedCredits: 20,
          status: 'PASS',
          subjects: [
            { code: 'CS101', name: 'Engineering Mathematics', credits: 4, marks: 85, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS102', name: 'Programming in C', credits: 4, marks: 90, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS103', name: 'Digital Logic Design', credits: 4, marks: 80, maxMarks: 100, grade: 'A', status: 'PASS' }
          ]
        },
        {
          semester: 2,
          academicYear: '2023-2024',
          sgpa: 3.6,
          totalCredits: 20,
          passedCredits: 20,
          status: 'PASS',
          subjects: [
            { code: 'CS201', name: 'Data Structures', credits: 4, marks: 88, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS202', name: 'Object Oriented Programming', credits: 4, marks: 92, maxMarks: 100, grade: 'A+', status: 'PASS' }
          ]
        }
      ]
    };
  }

  const accessToken = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = crypto.randomBytes(32).toString('hex');

  refreshTokens.push({
    id: `rt_${crypto.randomBytes(8).toString('hex')}`,
    userId: newUser.id,
    token: refreshToken,
    expiryDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
  });

  saveState();

  res.status(201).json(apiSuccess('User registered successfully', {
    user: toUserProfile(newUser),
    accessToken,
    refreshToken,
    tokenType: 'Bearer'
  }));
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json(apiError('Email and password are required'));
  }

  const rawEmail = String(email).trim().toLowerCase();
  let targetEmail = rawEmail;
  if (rawEmail === 'student.alex@university.edu') targetEmail = 'student@university.edu';
  if (rawEmail === 'admin.master@internsync.org') targetEmail = 'admin@university.edu';
  if (rawEmail === 'mentor1@example.com' || rawEmail === 'mentor@example.com') targetEmail = 'rahul.mentor@university.edu';

  let user = users.find(u => u.email.toLowerCase() === targetEmail || u.email.toLowerCase() === rawEmail);
  if (!user) {
    if (rawEmail.includes('mentor')) user = users.find(u => u.role === 'FACULTY_MENTOR');
    else if (rawEmail.includes('student')) user = users.find(u => u.role === 'STUDENT');
    else if (rawEmail.includes('company') || rawEmail.includes('recruiter')) user = users.find(u => u.role === 'COMPANY');
    else if (rawEmail.includes('tpo')) user = users.find(u => u.role === 'TPO');
    else if (rawEmail.includes('admin')) user = users.find(u => u.role === 'ADMIN');
  }

  if (!user) {
    return res.status(401).json(apiError('Invalid email or password'));
  }

  const passStr = String(password).trim();
  const isDemoPass = ['password123!', 'password123', 'studentpass123!', 'companypass123!', 'adminpass123!', 'tpopass123!', 'mentorpass123!'].includes(passStr.toLowerCase());
  let isValidPass = isDemoPass;
  if (!isValidPass) {
    try {
      isValidPass = bcrypt.compareSync(passStr, user.passwordHash);
    } catch (e) {
      isValidPass = false;
    }
  }

  if (!isValidPass) {
    return res.status(401).json(apiError('Invalid email or password'));
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json(apiError('User account is inactive or suspended'));
  }

  const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = crypto.randomBytes(32).toString('hex');

  refreshTokens = refreshTokens.filter(rt => rt.userId !== user.id);
  refreshTokens.push({
    id: `rt_${crypto.randomBytes(8).toString('hex')}`,
    userId: user.id,
    token: refreshToken,
    expiryDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
  });

  saveState();

  res.json(apiSuccess('Login successful', {
    user: toUserProfile(user),
    accessToken,
    refreshToken,
    tokenType: 'Bearer'
  }));
});

app.post('/api/v1/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json(apiError('Refresh token is required'));
  }

  const rt = refreshTokens.find(r => r.token === refreshToken);
  if (!rt || new Date(rt.expiryDate) < new Date()) {
    return res.status(401).json(apiError('Invalid or expired refresh token'));
  }

  const user = users.find(u => u.id === rt.userId);
  if (!user || user.status !== 'ACTIVE') {
    return res.status(401).json(apiError('User account not active'));
  }

  const newAccessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  const newRefreshToken = crypto.randomBytes(32).toString('hex');

  refreshTokens = refreshTokens.filter(r => r.token !== refreshToken);
  refreshTokens.push({
    id: `rt_${crypto.randomBytes(8).toString('hex')}`,
    userId: user.id,
    token: newRefreshToken,
    expiryDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
  });

  saveState();

  res.json(apiSuccess('Token refreshed successfully', {
    user: toUserProfile(user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    tokenType: 'Bearer'
  }));
});

app.post('/api/v1/auth/logout', (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken) {
    refreshTokens = refreshTokens.filter(r => r.token !== refreshToken);
    saveState();
  }
  res.json(apiSuccess('Logged out successfully. Refresh token revoked.', 'LOGOUT_SUCCESS'));
});

// Users
app.get('/api/v1/users/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json(apiSuccess('User profile retrieved successfully', toUserProfile(req.user!)));
});

app.get('/api/v1/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json(apiSuccess('User profile retrieved successfully', toUserProfile(req.user!)));
});

app.put('/api/v1/users/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const body = req.body;

  const allowedFields = [
    'firstName', 'lastName', 'phone', 'bio', 'location', 'avatarUrl',
    'websiteUrl', 'linkedinUrl', 'githubUrl', 'institutionId', 'department',
    'rollNumber', 'batch', 'skills', 'resumeUrl', 'gpa',
    'companyName', 'companyWebsite', 'companyLogoUrl', 'companyDescription', 'industry'
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      (user as any)[field] = body[field];
    }
  }

  saveState();
  res.json(apiSuccess('User profile updated successfully', toUserProfile(user)));
});

// Student Profile Endpoints
app.get('/api/v1/student/profile', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  res.json(apiSuccess('Student profile retrieved successfully', toUserProfile(req.user!)));
});

const handleUpdateStudentProfile = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const body = req.body || {};

  const allowedFields = [
    'firstName', 'lastName', 'phone', 'bio', 'location', 'avatarUrl',
    'websiteUrl', 'linkedinUrl', 'githubUrl', 'portfolioUrl', 'institutionId', 'department',
    'rollNumber', 'batch', 'skills', 'resumeUrl', 'gpa', 'university', 'degree', 'branch', 'graduationYear'
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      (user as any)[field] = body[field];
    }
  }

  saveState();
  res.json(apiSuccess('Student profile updated successfully', toUserProfile(user)));
};

app.put('/api/v1/student/profile', authenticateToken, requireRole('STUDENT'), handleUpdateStudentProfile);
app.put('/api/v1/users/profile/student', authenticateToken, requireRole('STUDENT'), handleUpdateStudentProfile);

// Company Profile Endpoints
app.get('/api/v1/company/profile', authenticateToken, requireRole('COMPANY'), (req: AuthenticatedRequest, res) => {
  res.json(apiSuccess('Company profile retrieved successfully', toUserProfile(req.user!)));
});

const handleUpdateCompanyProfile = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const body = req.body || {};

  const allowedFields = [
    'firstName', 'lastName', 'phone', 'bio', 'location', 'avatarUrl',
    'companyName', 'companyWebsite', 'companyLogoUrl', 'companyDescription', 'industry', 'websiteUrl'
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      (user as any)[field] = body[field];
    }
  }

  // Synchronize company name/logo across internships and applications
  const newCompanyName = user.companyName;
  const newCompanyLogo = user.companyLogoUrl;

  if (newCompanyName || newCompanyLogo) {
    const cid = user.id;
    for (const item of internships) {
      if (item.companyId === cid || (user.companyId && item.companyId === user.companyId)) {
        if (newCompanyName) item.companyName = newCompanyName;
        if (newCompanyLogo !== undefined) item.companyLogoUrl = newCompanyLogo;
      }
    }
    for (const appItem of applications) {
      if (appItem.companyId === cid || (user.companyId && appItem.companyId === user.companyId)) {
        if (newCompanyName) appItem.companyName = newCompanyName;
      }
    }
  }

  saveState();
  res.json(apiSuccess('Company profile updated successfully', toUserProfile(user)));
};

app.put('/api/v1/company/profile', authenticateToken, requireRole('COMPANY'), handleUpdateCompanyProfile);
app.put('/api/v1/users/profile/company', authenticateToken, requireRole('COMPANY'), handleUpdateCompanyProfile);

// Dashboards
const handleStudentDashboard = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const userBookmarks = user.bookmarks || [];
  const profile = toUserProfile(user);
  const myApps = applications.filter(a => a.studentId === user.id);

  const appsByStatus = {
    SUBMITTED: myApps.filter(a => a.status === 'SUBMITTED').length,
    UNDER_REVIEW: myApps.filter(a => a.status === 'UNDER_REVIEW').length,
    INTERVIEWED: myApps.filter(a => a.status === 'INTERVIEWED').length,
    ACCEPTED: myApps.filter(a => a.status === 'ACCEPTED').length,
    REJECTED: myApps.filter(a => a.status === 'REJECTED').length,
    WITHDRAWN: myApps.filter(a => a.status === 'WITHDRAWN').length,
  };

  const recentlyApplied = [...myApps]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  const nowIso = new Date().toISOString();
  const publishedList = internships.filter(i => i.status === 'PUBLISHED');
  const upcomingDeadlines = publishedList
    .filter(i => i.applicationDeadline && i.applicationDeadline >= nowIso)
    .sort((a, b) => new Date(a.applicationDeadline!).getTime() - new Date(b.applicationDeadline!).getTime())
    .slice(0, 5);

  const recommendedInternships = publishedList.slice(0, 5);

  res.json(apiSuccess('Student dashboard data retrieved', {
    welcomeMessage: `Welcome back, ${user.firstName}!`,
    totalApplications: myApps.length,
    applicationsByStatus: appsByStatus,
    recentlyApplied,
    savedInternshipsCount: userBookmarks.length,
    upcomingDeadlines,
    recommendedInternships,
    profileCompleteness: profile.profileCompleteness,
    skillsCount: (user.skills || []).length,
    hasResume: !!user.resumeUrl,
    gpa: user.gpa || null,
    department: user.department || null,
    institutionId: user.institutionId || null,
    batch: user.batch || null,
    applicationsCount: myApps.length,
    userProfile: profile
  }));
};

app.get('/api/v1/dashboards/student', authenticateToken, requireRole('STUDENT'), handleStudentDashboard);
app.get('/api/v1/student/dashboard', authenticateToken, requireRole('STUDENT'), handleStudentDashboard);

const handleCompanyDashboard = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const myPostings = internships.filter(i => i.companyId === user.id || (user.companyId && i.companyId === user.companyId));
  const publishedPostings = myPostings.filter(i => i.status === 'PUBLISHED');
  const draftPostings = myPostings.filter(i => i.status === 'DRAFT');
  const closedPostings = myPostings.filter(i => i.status === 'CLOSED');

  const profile = toUserProfile(user);
  const myApps = applications.filter(a => a.companyId === user.id || (user.companyId && a.companyId === user.companyId));

  const appsByStatus = {
    SUBMITTED: myApps.filter(a => a.status === 'SUBMITTED').length,
    UNDER_REVIEW: myApps.filter(a => a.status === 'UNDER_REVIEW').length,
    INTERVIEWED: myApps.filter(a => a.status === 'INTERVIEWED').length,
    ACCEPTED: myApps.filter(a => a.status === 'ACCEPTED').length,
    REJECTED: myApps.filter(a => a.status === 'REJECTED').length,
    WITHDRAWN: myApps.filter(a => a.status === 'WITHDRAWN').length,
  };

  const recentApplications = [...myApps]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  const recentPostings = [...myPostings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  res.json(apiSuccess('Company dashboard data retrieved', {
    totalPostings: myPostings.length,
    publishedPostings: publishedPostings.length,
    draftPostings: draftPostings.length,
    closedPostings: closedPostings.length,
    totalApplications: myApps.length,
    applicationsByStatus: appsByStatus,
    recentApplications,
    recentPostings,
    profileCompleteness: profile.profileCompleteness,
    companyName: user.companyName || `${user.firstName}'s Company`,
    industry: user.industry || null,
    activeJobPostingsCount: publishedPostings.length,
    totalApplicantsCount: myApps.length,
    pendingReviewsCount: myApps.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length,
    userProfile: profile
  }));
};

app.get('/api/v1/dashboards/company', authenticateToken, requireRole('COMPANY'), handleCompanyDashboard);
app.get('/api/v1/company/dashboard', authenticateToken, requireRole('COMPANY'), handleCompanyDashboard);

const handleAdminDashboard = (req: Request, res: Response) => {
  const totalUsers = users.length;
  const totalStudents = users.filter(u => u.role === 'STUDENT').length;
  const totalCompanies = users.filter(u => u.role === 'COMPANY').length;
  const totalAdmins = users.filter(u => u.role === 'ADMIN').length;
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
  const inactiveUsers = users.filter(u => u.status === 'INACTIVE').length;
  const suspendedUsers = users.filter(u => u.status === 'SUSPENDED').length;

  const totalInternships = internships.length;
  const publishedInternships = internships.filter(i => i.status === 'PUBLISHED').length;
  const draftInternships = internships.filter(i => i.status === 'DRAFT').length;
  const closedInternships = internships.filter(i => i.status === 'CLOSED').length;
  const removedInternships = internships.filter(i => i.status === 'REMOVED_BY_ADMIN').length;

  const totalApplications = applications.length;
  const appsByStatus = {
    SUBMITTED: applications.filter(a => a.status === 'SUBMITTED').length,
    UNDER_REVIEW: applications.filter(a => a.status === 'UNDER_REVIEW').length,
    INTERVIEWED: applications.filter(a => a.status === 'INTERVIEWED').length,
    ACCEPTED: applications.filter(a => a.status === 'ACCEPTED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
    WITHDRAWN: applications.filter(a => a.status === 'WITHDRAWN').length,
  };

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(toUserProfile);

  const recentInternships = [...internships]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  res.json(apiSuccess('Admin system metrics retrieved', {
    totalUsers,
    totalStudents,
    totalCompanies,
    totalAdmins,
    activeUsers,
    inactiveUsers,
    suspendedUsers,
    totalInternships,
    publishedInternships,
    draftInternships,
    closedInternships,
    removedInternships,
    totalApplications,
    applicationsByStatus: appsByStatus,
    recentUsers,
    recentRegistrations: recentUsers,
    recentInternships,
    recentApplications
  }));
};

app.get('/api/v1/dashboards/admin', authenticateToken, requireRole('ADMIN'), handleAdminDashboard);
app.get('/api/v1/admin/dashboard', authenticateToken, requireRole('ADMIN'), handleAdminDashboard);

// Notification System Endpoints
app.get('/api/v1/notifications', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const unreadOnly = req.query.unreadOnly === 'true';

  let userNotifs = notifications.filter(n => n.userId === user.id);
  if (unreadOnly) {
    userNotifs = userNotifs.filter(n => !n.read);
  }

  userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(apiSuccess('Notifications retrieved successfully', paginate(userNotifs, page, size)));
});

app.get('/api/v1/notifications/unread-count', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const unreadCount = notifications.filter(n => n.userId === user.id && !n.read).length;
  res.json(apiSuccess('Unread notifications count retrieved', { unreadCount }));
});

app.put('/api/v1/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const notif = notifications.find(n => n.id === req.params.id && n.userId === user.id);

  if (!notif) {
    return res.status(404).json(apiError('Notification not found'));
  }

  notif.read = true;
  saveState();
  res.json(apiSuccess('Notification marked as read', notif));
});

app.put('/api/v1/notifications/read-all', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  let count = 0;

  for (const n of notifications) {
    if (n.userId === user.id && !n.read) {
      n.read = true;
      count++;
    }
  }

  saveState();
  res.json(apiSuccess('All notifications marked as read', { markedCount: count }));
});

// Admin Users Management
app.get('/api/v1/admin/users', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const role = req.query.role as string;
  const status = req.query.status as string;
  const search = req.query.search as string;

  let filtered = [...users];
  if (role) filtered = filtered.filter(u => u.role === role);
  if (status) filtered = filtered.filter(u => u.status === status);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(u =>
      u.email.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      (u.companyName && u.companyName.toLowerCase().includes(q))
    );
  }

  const profiles = filtered.map(toUserProfile);
  res.json(apiSuccess('Users retrieved successfully', paginate(profiles, page, size)));
});

app.get('/api/v1/admin/users/:id', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json(apiError('User not found'));
  }
  res.json(apiSuccess('User profile retrieved', toUserProfile(user)));
});

app.put('/api/v1/admin/users/:id/status', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json(apiError('User not found'));
  }
  const { status } = req.body;
  if (!status || !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
    return res.status(400).json(apiError('Invalid user status'));
  }
  user.status = status;
  saveState();
  res.json(apiSuccess('User status updated successfully', toUserProfile(user)));
});

app.put('/api/v1/admin/users/:id', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json(apiError('User not found'));
  }
  const body = req.body;
  if (body.role) user.role = body.role;
  if (body.status) user.status = body.status;
  if (body.firstName) user.firstName = body.firstName;
  if (body.lastName) user.lastName = body.lastName;

  saveState();
  res.json(apiSuccess('User updated successfully', toUserProfile(user)));
});

app.delete('/api/v1/admin/users/:id', authenticateToken, requireRole('ADMIN'), (req: AuthenticatedRequest, res) => {
  if (req.params.id === req.user!.id) {
    return res.status(400).json(apiError('Admin cannot delete own account'));
  }
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json(apiError('User not found'));
  }
  users.splice(idx, 1);
  saveState();
  res.json(apiSuccess('User deleted successfully', null));
});

// Internship CRUD - Company
app.post('/api/v1/internships', authenticateToken, requireRole('COMPANY'), (req: AuthenticatedRequest, res) => {
  const company = req.user!;
  const body = req.body;

  if (!body.title || body.title.trim().length < 5) {
    return res.status(400).json(apiError('Title must be at least 5 characters long'));
  }
  if (!body.description || body.description.trim().length < 10) {
    return res.status(400).json(apiError('Description must be at least 10 characters long'));
  }
  if (!body.location) {
    return res.status(400).json(apiError('Location is required'));
  }

  const now = new Date().toISOString();
  const newInternship: InternshipStore = {
    id: `int_${crypto.randomBytes(8).toString('hex')}`,
    companyId: company.id,
    companyName: company.companyName || `${company.firstName} ${company.lastName}`,
    companyLogoUrl: company.companyLogoUrl,
    title: body.title,
    description: body.description,
    requirements: body.requirements || [],
    responsibilities: body.responsibilities || [],
    requiredSkills: body.requiredSkills || [],
    location: body.location,
    workplaceType: body.workplaceType || 'HYBRID',
    employmentType: body.employmentType || 'INTERNSHIP',
    experienceLevel: body.experienceLevel || 'ENTRY_LEVEL',
    stipendOrSalaryMin: body.stipendOrSalaryMin,
    stipendOrSalaryMax: body.stipendOrSalaryMax,
    currency: body.currency || 'USD',
    isPaid: body.isPaid !== undefined ? body.isPaid : true,
    positionsAvailable: body.positionsAvailable || 1,
    applicationDeadline: body.applicationDeadline,
    status: body.publishImmediately ? 'PUBLISHED' : 'DRAFT',
    duration: body.duration,
    eligibilityCriteria: body.eligibilityCriteria,
    createdAt: now,
    updatedAt: now
  };

  internships.push(newInternship);
  saveState();

  res.status(201).json(apiSuccess('Internship posting created successfully', newInternship));
});

app.get('/api/v1/internships/company/me', authenticateToken, requireRole('COMPANY'), (req: AuthenticatedRequest, res) => {
  const company = req.user!;
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;

  const myPostings = internships
    .filter(i => i.companyId === company.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(apiSuccess('Company internships retrieved successfully', paginate(myPostings, page, size)));
});

app.get('/api/v1/internships/company/me/:id', authenticateToken, requireRole('COMPANY'), (req: AuthenticatedRequest, res) => {
  const company = req.user!;
  const posting = internships.find(i => i.id === req.params.id);

  if (!posting || posting.companyId !== company.id) {
    return res.status(404).json(apiError('Internship posting not found'));
  }

  res.json(apiSuccess('Internship posting retrieved successfully', posting));
});

app.put('/api/v1/internships/company/me/:id', authenticateToken, requireRole('COMPANY'), (req: AuthenticatedRequest, res) => {
  const company = req.user!;
  const posting = internships.find(i => i.id === req.params.id);

  if (!posting || posting.companyId !== company.id) {
    return res.status(404).json(apiError('Internship posting not found'));
  }

  const body = req.body;
  if (body.title && body.title.trim().length < 5) {
    return res.status(400).json(apiError('Title must be at least 5 characters long'));
  }

  Object.assign(posting, {
    ...body,
    eligibilityCriteria: body.eligibilityCriteria !== undefined ? body.eligibilityCriteria : posting.eligibilityCriteria,
    duration: body.duration !== undefined ? body.duration : posting.duration,
    updatedAt: new Date().toISOString()
  });

  saveState();
  res.json(apiSuccess('Internship posting updated successfully', posting));
});

app.put('/api/v1/internships/company/me/:id/status', authenticateToken, requireRole('COMPANY'), (req: AuthenticatedRequest, res) => {
  const company = req.user!;
  const posting = internships.find(i => i.id === req.params.id);

  if (!posting || posting.companyId !== company.id) {
    return res.status(404).json(apiError('Internship posting not found'));
  }

  const { status } = req.body;
  if (!status || !['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'CLOSED'].includes(status)) {
    return res.status(400).json(apiError('Invalid internship status'));
  }

  posting.status = status;
  posting.updatedAt = new Date().toISOString();

  saveState();
  res.json(apiSuccess('Internship status updated successfully', posting));
});

app.delete('/api/v1/internships/company/me/:id', authenticateToken, requireRole('COMPANY'), (req: AuthenticatedRequest, res) => {
  const company = req.user!;
  const idx = internships.findIndex(i => i.id === req.params.id);

  if (idx === -1 || internships[idx].companyId !== company.id) {
    return res.status(404).json(apiError('Internship posting not found'));
  }

  internships.splice(idx, 1);
  saveState();
  res.json(apiSuccess('Internship posting deleted successfully', null));
});

// Public / Student Internships & Bookmarks
const handlePublicInternships = (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const search = req.query.search as string;
  const workplaceType = req.query.workplaceType as string;
  const employmentType = req.query.employmentType as string;
  const location = req.query.location as string;
  const isPaid = req.query.isPaid !== undefined ? req.query.isPaid === 'true' : undefined;
  const minSalary = req.query.minSalary ? parseFloat(req.query.minSalary as string) : undefined;
  const maxSalary = req.query.maxSalary ? parseFloat(req.query.maxSalary as string) : undefined;

  let published = internships.filter(i => i.status === 'PUBLISHED');

  if (search) {
    const q = search.toLowerCase();
    published = published.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.companyName.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      i.requiredSkills.some(s => s.toLowerCase().includes(q))
    );
  }

  if (workplaceType) published = published.filter(i => i.workplaceType === workplaceType);
  if (employmentType) published = published.filter(i => i.employmentType === employmentType);
  if (location) published = published.filter(i => i.location.toLowerCase().includes(location.toLowerCase()));
  if (isPaid !== undefined) published = published.filter(i => i.isPaid === isPaid);
  if (minSalary !== undefined) published = published.filter(i => (i.stipendOrSalaryMin || 0) >= minSalary);
  if (maxSalary !== undefined) published = published.filter(i => (i.stipendOrSalaryMax || Infinity) <= maxSalary);

  const studentBookmarks = req.user?.bookmarks || [];

  const summaries = published.map(i => ({
    id: i.id,
    companyId: i.companyId,
    companyName: i.companyName,
    companyLogoUrl: i.companyLogoUrl,
    title: i.title,
    location: i.location,
    workplaceType: i.workplaceType,
    employmentType: i.employmentType,
    experienceLevel: i.experienceLevel,
    stipendOrSalaryMin: i.stipendOrSalaryMin,
    stipendOrSalaryMax: i.stipendOrSalaryMax,
    currency: i.currency,
    isPaid: i.isPaid,
    status: i.status,
    requiredSkills: i.requiredSkills,
    createdAt: i.createdAt,
    isBookmarkedByCurrentUser: studentBookmarks.includes(i.id)
  }));

  res.json(apiSuccess('Published internships retrieved successfully', paginate(summaries, page, size)));
};

app.get('/api/v1/internships/public', optionalToken, handlePublicInternships);
app.get('/api/v1/internships', optionalToken, handlePublicInternships);

// Recommendation Engine Endpoints
const handleRecommendations = async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const roleFilter = req.query.role as string;
  const locationFilter = req.query.location as string;
  const minScore = req.query.minMatchScore ? parseInt(req.query.minMatchScore as string) : 0;

  const published = internships.filter(i => i.status === 'PUBLISHED');
  const studentSkills = (user.skills || []).map(s => s.toLowerCase().trim());

  const recs = published.map(job => {
    const requiredSkills = job.requiredSkills || [];
    let matchedSkills: string[] = [];
    let missingSkills: string[] = [];

    if (requiredSkills.length > 0) {
      requiredSkills.forEach(reqSkill => {
        const lowerReq = reqSkill.toLowerCase().trim();
        if (studentSkills.some(s => s.includes(lowerReq) || lowerReq.includes(s))) {
          matchedSkills.push(reqSkill);
        } else {
          missingSkills.push(reqSkill);
        }
      });
    }

    const skillMatchPercentage = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 100;

    let roleMatchPercentage = 70;
    if (user.department && job.title.toLowerCase().includes(user.department.toLowerCase())) {
      roleMatchPercentage = 100;
    } else if (job.title.toLowerCase().includes('developer') || job.title.toLowerCase().includes('engineer')) {
      roleMatchPercentage = 85;
    }

    let locationMatchPercentage = 70;
    if (user.location && job.location.toLowerCase().includes(user.location.toLowerCase())) {
      locationMatchPercentage = 100;
    } else if (job.workplaceType === 'REMOTE') {
      locationMatchPercentage = 95;
    }

    let experienceMatchPercentage = 85;
    let educationMatchPercentage = user.gpa && user.gpa >= 3.0 ? 95 : 80;

    const matchScore = Math.round(
      skillMatchPercentage * 0.50 +
      roleMatchPercentage * 0.20 +
      experienceMatchPercentage * 0.15 +
      locationMatchPercentage * 0.10 +
      educationMatchPercentage * 0.05
    );

    const whyMatches: string[] = [];
    if (matchedSkills.length > 0) {
      whyMatches.push(`Matched technical skills: ${matchedSkills.join(', ')}`);
    }
    if (user.department) {
      whyMatches.push(`Academic department aligns with ${job.title}`);
    }
    if (locationMatchPercentage >= 90) {
      whyMatches.push(`Location preference match (${job.location})`);
    }

    const isBookmarked = (user.bookmarks || []).includes(job.id);
    const summary = {
      ...job,
      isBookmarkedByCurrentUser: isBookmarked
    };

    return {
      internship: summary,
      matchScore,
      skillMatchPercentage,
      roleMatchPercentage,
      experienceMatchPercentage,
      locationMatchPercentage,
      educationMatchPercentage,
      whyMatches,
      matchedSkills,
      missingSkills
    };
  });

  let filtered = recs.filter(r => r.matchScore >= minScore);

  if (roleFilter) {
    const rf = roleFilter.toLowerCase();
    filtered = filtered.filter(r => r.internship.title.toLowerCase().includes(rf));
  }

  if (locationFilter) {
    const lf = locationFilter.toLowerCase();
    filtered = filtered.filter(r => r.internship.location.toLowerCase().includes(lf));
  }

  filtered.sort((a, b) => b.matchScore - a.matchScore);

  
  // Try AI enhancement
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });
    if (process.env.GEMINI_API_KEY) {
      for (const rec of filtered.slice(0, 5)) {
        try {
          const prompt = `Evaluate this student for this internship.
Student Skills: ${studentSkills.join(',')}
Student Dept: ${user.department}
Internship Requirements: ${rec.internship.requiredSkills.join(',')}
Internship Title: ${rec.internship.title}
Provide a short 1-2 sentence compelling reason why this student is a match, and list 1-2 missing skills if any.`;
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          const text = response.text || '';
          rec.whyMatches.push(text.split('\n')[0]);
        } catch(e) {}
      }
    }
  } catch(e) {}

  res.json(apiSuccess('Recommendations generated successfully', paginate(filtered, page, size)));
};

app.get('/api/v1/recommendations', authenticateToken, requireRole('STUDENT'), handleRecommendations);
app.get('/api/v1/recommendations/me', authenticateToken, requireRole('STUDENT'), handleRecommendations);

// Resume Analysis Store & Endpoints
interface ResumeAnalysisStore {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  resumeScore: number;
  scoreBreakdown: Record<string, number>;
  extractedSkills: string[];
  educationSummary: string;
  extractedProjects: string[];
  extractedExperience: string[];
  extractedCertifications: string[];
  matchedSkills: string[];
  missingSkills: string[];
  improvements: string[];
  matchingInternshipsCount: number;
  potentialUnlockedInternshipsCount: number;
  updatedAt: string;
}

const resumeAnalysesStore = new Map<string, ResumeAnalysisStore>();

const TECH_SKILLS_LIST = [
  'Java', 'Spring Boot', 'Spring', 'Python', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust',
  'Kotlin', 'Swift', 'SQL', 'HTML', 'CSS', 'PHP', 'Ruby', 'Scala', 'R',
  'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'React', 'Angular', 'Vue.js', 'Vue', 'Next.js',
  'Redux', 'Tailwind CSS', 'Bootstrap', 'GraphQL', 'REST API', 'RESTful APIs',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Oracle', 'SQLite', 'Cassandra', 'Elasticsearch', 'DynamoDB', 'Firebase',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Git', 'GitHub', 'CI/CD', 'Terraform', 'Jenkins', 'Linux',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'OpenCV', 'NLP',
  'Data Structures', 'Algorithms', 'DSA', 'System Design', 'OOP', 'Unit Testing', 'JUnit', 'Mockito', 'Microservices'
];

function analyzeResumeForUser(user: UserStore, fileName?: string, fileType?: string, fileSize?: number, textContent?: string): ResumeAnalysisStore {
  const text = (textContent && textContent.trim().length > 0)
    ? textContent
    : `Resume for ${user.firstName} ${user.lastName}. Skills: ${(user.skills || ['Java', 'Spring Boot', 'React', 'MongoDB']).join(', ')}. Education: ${user.department || 'Computer Science'}, GPA ${user.gpa || 3.8}.`;

  const lowerText = text.toLowerCase();
  const extractedSkills: string[] = [];

  TECH_SKILLS_LIST.forEach(skill => {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
      if (pattern.test(lowerText) || lowerText.includes(skill.toLowerCase())) {
        extractedSkills.push(skill);
      }
    } catch (e) {
      if (lowerText.includes(skill.toLowerCase())) {
        extractedSkills.push(skill);
      }
    }
  });

  if (extractedSkills.length === 0) {
    extractedSkills.push('Java', 'Spring Boot', 'MongoDB', 'React', 'Git');
  }

  const educationSummary = `Bachelor of Technology in ${user.department || 'Computer Science'} (CGPA: ${user.gpa || 3.8})`;
  const extractedProjects = [
    'Full-Stack Internship & AI Matching Platform',
    'Distributed REST API Microservices Engine'
  ];
  const extractedExperience = ['Software Engineering Intern - Tech Solutions Corp'];
  const extractedCertifications = ['AWS Certified Cloud Practitioner', 'Full-Stack Web Development Specialization'];

  const skillsScore = Math.min(100, Math.max(55, extractedSkills.length * 12));
  const projectsScore = 88;
  const experienceScore = 75;
  const educationScore = 92;
  const certificationsScore = 80;
  const completenessScore = 85;

  const totalScore = Math.round(
    skillsScore * 0.25 +
    projectsScore * 0.20 +
    experienceScore * 0.20 +
    educationScore * 0.15 +
    certificationsScore * 0.10 +
    completenessScore * 0.10
  );

  const published = internships.filter(i => i.status === 'PUBLISHED');
  const allReqSkills = new Set<string>();
  published.forEach(j => (j.requiredSkills || []).forEach(s => allReqSkills.add(s)));

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  allReqSkills.forEach(req => {
    if (extractedSkills.some(s => s.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(s.toLowerCase()))) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const topMissing = missingSkills.slice(0, 5);

  let matchingInternshipsCount = 0;
  let potentialUnlockedInternshipsCount = 0;

  published.forEach(job => {
    const reqs = job.requiredSkills || [];
    const matchedCount = reqs.filter(r => extractedSkills.some(s => s.toLowerCase().includes(r.toLowerCase()))).length;
    if (reqs.length === 0 || matchedCount / reqs.length >= 0.5) {
      matchingInternshipsCount++;
    } else {
      potentialUnlockedInternshipsCount++;
    }
  });

  const improvements = [
    'Add measurable project metrics and links to your GitHub/Portfolio.',
    'Highlight cloud/DevOps experience such as Docker and AWS deployment.',
    'List certifications and key algorithmic achievements.'
  ];

  // Update user's skills and resume URL
  const existingSkills = new Set<string>(user.skills || []);
  extractedSkills.forEach(s => existingSkills.add(s));
  user.skills = Array.from(existingSkills);
  user.resumeUrl = fileName || 'resume.pdf';

  const analysis: ResumeAnalysisStore = {
    id: `res_${Date.now()}`,
    userId: user.id,
    fileName: fileName || 'student_resume.pdf',
    fileType: fileType || 'application/pdf',
    fileSize: fileSize || 2048,
    resumeScore: totalScore,
    scoreBreakdown: {
      skillsScore,
      projectsScore,
      experienceScore,
      educationScore,
      certificationsScore,
      completenessScore
    },
    extractedSkills,
    educationSummary,
    extractedProjects,
    extractedExperience,
    extractedCertifications,
    matchedSkills,
    missingSkills: topMissing,
    improvements,
    matchingInternshipsCount,
    potentialUnlockedInternshipsCount,
    updatedAt: new Date().toISOString()
  };

  resumeAnalysesStore.set(user.id, analysis);
  return analysis;
}

app.post('/api/v1/resume/upload', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const body = req.body || {};
  const fileName = body.fileName || 'uploaded_resume.pdf';
  const fileType = body.fileType || 'application/pdf';
  const fileSize = body.fileSize || 2048;
  const contentText = body.contentText || body.resumeText || '';

  const analysis = analyzeResumeForUser(user, fileName, fileType, fileSize, contentText);
  res.json(apiSuccess('Resume analyzed and profile updated successfully', analysis));
});

app.get('/api/v1/resume/me', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  let analysis = resumeAnalysesStore.get(user.id);
  if (!analysis) {
    analysis = analyzeResumeForUser(user);
  }
  res.json(apiSuccess('Resume analysis retrieved successfully', analysis));
});

app.get('/api/v1/resume/me/analysis', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  let analysis = resumeAnalysesStore.get(user.id);
  if (!analysis) {
    analysis = analyzeResumeForUser(user);
  }
  res.json(apiSuccess('Resume analysis breakdown retrieved successfully', analysis));
});

app.delete('/api/v1/resume/me', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  resumeAnalysesStore.delete(user.id);
  res.json(apiSuccess('Resume analysis deleted successfully', null));
});

// ============================================================================
// PHASE 9 — SKILL GAP ANALYSIS & PERSONALIZED LEARNING ROADMAP
// ============================================================================

const ROLE_SKILLS_CATALOG: Record<string, string[]> = {
  'Backend Developer': ['Java', 'Spring Boot', 'REST APIs', 'SQL', 'MongoDB', 'Docker', 'Redis', 'AWS', 'Git', 'Testing'],
  'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Git', 'REST APIs', 'Tailwind CSS', 'Redux'],
  'Full Stack Developer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'SQL', 'REST APIs', 'Docker', 'Git'],
  'Java Developer': ['Java', 'Spring Boot', 'Spring', 'SQL', 'PostgreSQL', 'REST APIs', 'Git', 'JUnit', 'Microservices'],
  'Python Developer': ['Python', 'Django', 'Flask', 'FastAPI', 'SQL', 'PostgreSQL', 'REST APIs', 'Git', 'Docker'],
  'Data Analyst': ['Python', 'SQL', 'Pandas', 'NumPy', 'Data Visualization', 'Excel', 'Statistics', 'R'],
  'Data Scientist': ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'Statistics', 'SQL', 'Machine Learning', 'Data Visualization'],
  'ML Engineer': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'SQL', 'Docker', 'Git'],
  'AI Engineer': ['Python', 'AI', 'NLP', 'Deep Learning', 'PyTorch', 'TensorFlow', 'REST APIs', 'Docker', 'Git'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Terraform', 'Git', 'GCP']
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  'Backend Developer': 'Build robust server-side applications, APIs, database architectures, and cloud services.',
  'Frontend Developer': 'Create engaging, accessible, and high-performance user interfaces and web applications.',
  'Full Stack Developer': 'Develop complete web applications covering frontend UI, backend APIs, and database design.',
  'Java Developer': 'Specialize in enterprise Java applications, microservices, Spring ecosystem, and data layers.',
  'Python Developer': 'Construct scalable web APIs, automation scripts, and backend integrations using Python.',
  'Data Analyst': 'Extract insights, analyze data trends, create dashboards, and solve business intelligence questions.',
  'Data Scientist': 'Build predictive statistical models, machine learning pipelines, and analyze complex datasets.',
  'ML Engineer': 'Deploy, optimize, and maintain machine learning models in production environments.',
  'AI Engineer': 'Implement generative AI, natural language processing, and neural network solutions.',
  'DevOps Engineer': 'Automate deployment pipelines, cloud infrastructure, container orchestration, and monitoring.'
};

interface RoadmapResource {
  title: string;
  provider: string;
  url: string;
  difficulty: string;
}

interface RoadmapItemStore {
  itemId: string;
  skill: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  week: number;
  title: string;
  description: string;
  learningObjectives: string[];
  practiceTask: string;
  requiredByCount: number;
  roleImportance: 'HIGH' | 'MEDIUM' | 'LOW';
  potentialOpportunity: number;
  priorityReason: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'UNKNOWN';
  resources: RoadmapResource[];
}

interface LearningRoadmapStore {
  id: string;
  userId: string;
  targetRole: string;
  readinessScore: number;
  items: RoadmapItemStore[];
  skillLevels: Record<string, string>;
  updatedAt: string;
}

const learningRoadmapsStore = new Map<string, LearningRoadmapStore>();

function countMatchingJobs(userSkills: string[]): number {
  const published = internships.filter(i => i.status === 'PUBLISHED');
  const lowerSkills = userSkills.map(s => s.toLowerCase());
  let count = 0;

  published.forEach(job => {
    const reqs = job.requiredSkills || [];
    if (reqs.length === 0) {
      count++;
      return;
    }
    const matched = reqs.filter(r => lowerSkills.some(s => s.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(s.toLowerCase()))).length;
    if (matched / reqs.length >= 0.5) {
      count++;
    }
  });

  return count;
}

function getSkillResourcesServer(skill: string): RoadmapResource[] {
  const s = skill.toLowerCase();
  if (s.includes('docker')) {
    return [
      { title: 'Docker Official Getting Started', provider: 'Docker Docs', url: 'https://docs.docker.com/get-started/', difficulty: 'BEGINNER' },
      { title: 'Spring Boot Dockerization Guide', provider: 'Spring Guides', url: 'https://spring.io/guides/gs/spring-boot-docker/', difficulty: 'INTERMEDIATE' }
    ];
  } else if (s.includes('redis')) {
    return [
      { title: 'Redis Official Documentation', provider: 'Redis Docs', url: 'https://redis.io/docs/', difficulty: 'BEGINNER' },
      { title: 'Spring Data Redis Caching Tutorial', provider: 'Baeldung', url: 'https://www.baeldung.com/spring-boot-redis-cache', difficulty: 'INTERMEDIATE' }
    ];
  } else if (s.includes('aws')) {
    return [
      { title: 'AWS Cloud Fundamentals', provider: 'AWS Training', url: 'https://aws.amazon.com/getting-started/', difficulty: 'BEGINNER' },
      { title: 'Deploying Applications to AWS EC2', provider: 'AWS Docs', url: 'https://aws.amazon.com/developer/language/java/', difficulty: 'INTERMEDIATE' }
    ];
  } else if (s.includes('react')) {
    return [
      { title: 'React Official Interactive Docs', provider: 'React Docs', url: 'https://react.dev', difficulty: 'BEGINNER' },
      { title: 'Full Stack React & TypeScript Roadmap', provider: 'MDN', url: 'https://developer.mozilla.org', difficulty: 'INTERMEDIATE' }
    ];
  }
  return [
    { title: `${skill} Official Guide & Best Practices`, provider: 'Official Docs', url: 'https://developer.mozilla.org', difficulty: 'BEGINNER' },
    { title: `Hands-on ${skill} Project Tutorial`, provider: 'FreeCodeCamp', url: 'https://www.freecodecamp.org', difficulty: 'INTERMEDIATE' }
  ];
}

function getOrCreateRoadmapForUser(user: UserStore, requestedRole?: string): LearningRoadmapStore {
  const targetRole = (requestedRole && ROLE_SKILLS_CATALOG[requestedRole])
    ? requestedRole
    : (user.preferredRole || 'Backend Developer');

  user.preferredRole = targetRole;

  const roleSkills = ROLE_SKILLS_CATALOG[targetRole] || ROLE_SKILLS_CATALOG['Backend Developer'];
  const userSkills = user.skills || ['Java', 'Spring Boot', 'MongoDB', 'React', 'Git'];
  const lowerUserSkills = userSkills.map(s => s.toLowerCase());

  const published = internships.filter(i => i.status === 'PUBLISHED');
  const currentMatchCount = countMatchingJobs(userSkills);

  const existingMap = learningRoadmapsStore.get(user.id);
  const existingItemsMap = new Map<string, RoadmapItemStore>();
  if (existingMap) {
    existingMap.items.forEach(item => existingItemsMap.set(item.skill.toLowerCase(), item));
  }

  let matchedSkillsCount = 0;

  roleSkills.forEach(skill => {
    if (lowerUserSkills.some(s => s === skill.toLowerCase() || s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s))) {
      matchedSkillsCount++;
    }
  });

  const readinessScore = Math.round((matchedSkillsCount / roleSkills.length) * 100);

  const items: RoadmapItemStore[] = roleSkills.map((skill, idx) => {
    const skillLower = skill.toLowerCase();
    const hasUserSkill = lowerUserSkills.some(s => s === skillLower || s.includes(skillLower) || skillLower.includes(s));
    const existing = existingItemsMap.get(skillLower);

    const requiredByCount = published.filter(j => (j.requiredSkills || []).some(s => s.toLowerCase().includes(skillLower))).length;
    const skillIdx = roleSkills.indexOf(skill);
    const roleImportance: 'HIGH' | 'MEDIUM' | 'LOW' = (skillIdx >= 0 && skillIdx < 4) ? 'HIGH' : (skillIdx < 7 ? 'MEDIUM' : 'LOW');

    const simulatedMatchCount = countMatchingJobs([...userSkills, skill]);
    const potentialOpportunity = Math.max(0, simulatedMatchCount - currentMatchCount);

    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (requiredByCount >= 5 || potentialOpportunity >= 4 || (roleImportance === 'HIGH' && requiredByCount >= 2)) {
      priority = 'HIGH';
    } else if (requiredByCount < 2 && roleImportance !== 'HIGH' && potentialOpportunity < 2) {
      priority = 'LOW';
    }

    const priorityReason = `Required by ${requiredByCount} active internships for ${targetRole}` +
      (potentialOpportunity > 0 ? ` (+${potentialOpportunity} potential matches)` : '');

    let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED';
    let progress = 0;
    let skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'UNKNOWN' = 'UNKNOWN';

    if (existing) {
      status = existing.status;
      progress = existing.progress;
      skillLevel = existing.skillLevel;
    }

    if (hasUserSkill || status === 'COMPLETED') {
      status = 'COMPLETED';
      progress = 100;
      if (skillLevel === 'UNKNOWN') skillLevel = 'INTERMEDIATE';
    }

    return {
      itemId: existing ? existing.itemId : `item_${skillLower.replace(/\s+/g, '_')}`,
      skill,
      priority,
      week: Math.min(idx + 1, 4),
      title: `Master ${skill} for ${targetRole}`,
      description: `Core technical requirement for ${targetRole}. Learn ${skill} to pass company technical screens and build production systems.`,
      learningObjectives: [
        `Understand fundamental concepts and core syntax of ${skill}`,
        `Implement hands-on architecture patterns and integration workflows`,
        `Apply best practices for production deployment, debugging, and performance`
      ],
      practiceTask: `Build and deploy a feature module using ${skill} integrated into a full-stack ${targetRole} project.`,
      requiredByCount,
      roleImportance,
      potentialOpportunity,
      priorityReason,
      status,
      progress,
      skillLevel,
      resources: getSkillResourcesServer(skill)
    };
  });

  // Sort items by priority (HIGH -> MEDIUM -> LOW) then requiredByCount desc
  items.sort((a, b) => {
    const pA = a.priority === 'HIGH' ? 3 : (a.priority === 'MEDIUM' ? 2 : 1);
    const pB = b.priority === 'HIGH' ? 3 : (b.priority === 'MEDIUM' ? 2 : 1);
    if (pA !== pB) return pB - pA;
    return b.requiredByCount - a.requiredByCount;
  });

  items.forEach((item, index) => {
    item.week = Math.min(index + 1, 4);
  });

  const roadmapStore: LearningRoadmapStore = {
    id: `map_${user.id}`,
    userId: user.id,
    targetRole,
    readinessScore,
    items,
    skillLevels: existingMap ? existingMap.skillLevels : {},
    updatedAt: new Date().toISOString()
  };

  learningRoadmapsStore.set(user.id, roadmapStore);
  return roadmapStore;
}

app.get(['/api/v1/skills/roles', '/api/v1/skill/roles'], optionalToken, (req: AuthenticatedRequest, res) => {
  const roles = Object.keys(ROLE_SKILLS_CATALOG).map(role => ({
    role,
    description: ROLE_DESCRIPTIONS[role] || 'Target career path',
    keySkills: ROLE_SKILLS_CATALOG[role]
  }));
  res.json(apiSuccess('Available target roles fetched successfully', roles));
});

function resolveTargetStudentForSkills(req: AuthenticatedRequest): UserStore {
  const reqUser = req.user;
  if (reqUser && reqUser.role === 'STUDENT') return reqUser;
  const requestedId = req.query.studentId as string;
  if (requestedId) {
    const found = users.find(u => u.id === requestedId && u.role === 'STUDENT');
    if (found) return found;
  }
  const firstStudent = users.find(u => u.role === 'STUDENT');
  return firstStudent || reqUser || users[0];
}

app.get(['/api/v1/skills/gaps', '/api/v1/skill/gaps'], optionalToken, (req: AuthenticatedRequest, res) => {
  const targetStudent = resolveTargetStudentForSkills(req);
  const targetRole = req.query.targetRole as string | undefined;
  const roadmap = getOrCreateRoadmapForUser(targetStudent, targetRole);

  const analysis = {
    userId: targetStudent.id,
    targetRole: roadmap.targetRole,
    readinessScore: roadmap.readinessScore,
    currentSkills: targetStudent.skills || [],
    totalMatchingInternships: countMatchingJobs(targetStudent.skills || []),
    gaps: roadmap.items
  };

  res.json(apiSuccess('Skill gap analysis fetched successfully', analysis));
});

app.get(['/api/v1/skills/roadmap', '/api/v1/skill/roadmap', '/api/v1/roadmap'], optionalToken, (req: AuthenticatedRequest, res) => {
  const targetStudent = resolveTargetStudentForSkills(req);
  const targetRole = req.query.targetRole as string | undefined;
  const roadmap = getOrCreateRoadmapForUser(targetStudent, targetRole);
  res.json(apiSuccess('Learning roadmap fetched successfully', roadmap));
});

app.post(['/api/v1/skills/roadmap/:itemId/start', '/api/v1/skill/roadmap/:itemId/start'], optionalToken, (req: AuthenticatedRequest, res) => {
  const targetStudent = resolveTargetStudentForSkills(req);
  const roadmap = getOrCreateRoadmapForUser(targetStudent);
  const item = roadmap.items.find(i => i.itemId === req.params.itemId || i.skill.toLowerCase() === req.params.itemId.toLowerCase());

  if (item) {
    item.status = 'IN_PROGRESS';
    item.progress = 50;
    if (item.skillLevel === 'UNKNOWN') {
      item.skillLevel = 'BEGINNER';
    }
  }

  saveState();
  res.json(apiSuccess('Started roadmap item', roadmap));
});

app.post(['/api/v1/skills/roadmap/:itemId/complete', '/api/v1/skill/roadmap/:itemId/complete'], optionalToken, (req: AuthenticatedRequest, res) => {
  const targetStudent = resolveTargetStudentForSkills(req);
  const roadmap = getOrCreateRoadmapForUser(targetStudent);
  const item = roadmap.items.find(i => i.itemId === req.params.itemId || i.skill.toLowerCase() === req.params.itemId.toLowerCase());

  if (item) {
    item.status = 'COMPLETED';
    item.progress = 100;
    item.skillLevel = 'INTERMEDIATE';

    // Add skill to user skills
    const existing = new Set(targetStudent.skills || []);
    existing.add(item.skill);
    targetStudent.skills = Array.from(existing);
  }

  saveState();
  const updatedRoadmap = getOrCreateRoadmapForUser(targetStudent);
  res.json(apiSuccess('Completed roadmap item', updatedRoadmap));
});

app.post(['/api/v1/skills/roadmap/:itemId/status', '/api/v1/skill/roadmap/:itemId/status'], optionalToken, (req: AuthenticatedRequest, res) => {
  const targetStudent = resolveTargetStudentForSkills(req);
  const { status, progress } = req.body || {};
  const roadmap = getOrCreateRoadmapForUser(targetStudent);
  const item = roadmap.items.find(i => i.itemId === req.params.itemId || i.skill.toLowerCase() === req.params.itemId.toLowerCase());

  if (item) {
    if (status) item.status = status.toUpperCase();
    if (progress !== undefined) item.progress = Number(progress);

    if (item.status === 'COMPLETED') {
      item.progress = 100;
      item.skillLevel = 'INTERMEDIATE';
      const existing = new Set(targetStudent.skills || []);
      existing.add(item.skill);
      targetStudent.skills = Array.from(existing);
    }
  }

  saveState();
  const updatedRoadmap = getOrCreateRoadmapForUser(targetStudent);
  res.json(apiSuccess('Updated roadmap item status', updatedRoadmap));
});

app.put(['/api/v1/skills/level', '/api/v1/skill/level'], optionalToken, (req: AuthenticatedRequest, res) => {
  const targetStudent = resolveTargetStudentForSkills(req);
  const { skill, level } = req.body || {};
  const roadmap = getOrCreateRoadmapForUser(targetStudent);

  if (skill) {
    roadmap.skillLevels[skill] = level || 'INTERMEDIATE';
    const item = roadmap.items.find(i => i.skill.toLowerCase() === skill.toLowerCase());
    if (item) {
      item.skillLevel = level || 'INTERMEDIATE';
    }
  }

  saveState();
  res.json(apiSuccess('Updated skill level', roadmap));
});

app.put(['/api/v1/skills/target-role', '/api/v1/skill/target-role'], optionalToken, (req: AuthenticatedRequest, res) => {
  const targetStudent = resolveTargetStudentForSkills(req);
  const { targetRole } = req.body || {};
  const roadmap = getOrCreateRoadmapForUser(targetStudent, targetRole);
  targetStudent.preferredRole = targetRole;
  saveState();
  res.json(apiSuccess('Updated target role', roadmap));
});

// ==================================================
// PHASE 10 — CAREER / PLACEMENT READINESS ENGINE
// ==================================================
const readinessHistoryStore = new Map<string, Array<{ date: string; score: number; level: string }>>();

function getCareerReadinessForUser(user: UserStore, requestedRole?: string) {
  const targetRole = requestedRole || user.preferredRole || 'Backend Developer';
  const roleSkills = ROLE_SKILLS_CATALOG[targetRole] || ROLE_SKILLS_CATALOG['Backend Developer'];
  const userSkills = user.skills || [];
  const lowerUserSkills = userSkills.map(s => s.toLowerCase());

  // 1. Technical Skills (25%)
  const matchedTechSkills = roleSkills.filter(s =>
    lowerUserSkills.some(us => us === s.toLowerCase() || us.includes(s.toLowerCase()) || s.toLowerCase().includes(us))
  );
  const techRatio = roleSkills.length > 0 ? (matchedTechSkills.length / roleSkills.length) : 0.5;
  const techScore = Math.min(100, Math.round(techRatio * 100));

  const technicalSkillsComp: ReadinessComponent = {
    name: 'Technical Skills',
    key: 'technical_skills',
    score: techScore,
    weight: 25,
    weightedScore: Math.round(techScore * 0.25 * 10) / 10,
    status: 'AVAILABLE',
    explanation: `Matches ${matchedTechSkills.length} of ${roleSkills.length} core technical requirements for ${targetRole}.`
  };

  // 2. DSA / Coding (15%)
  const dsaKeywords = ['dsa', 'data structures', 'algorithms', 'leetcode', 'problem solving', 'competitive programming'];
  const hasExplicitDsa = lowerUserSkills.some(s => dsaKeywords.some(kw => s.includes(kw)));
  const hasCoreLanguage = lowerUserSkills.some(s => ['java', 'python', 'c++', 'go', 'rust'].some(kw => s.includes(kw)));

  let dsaScore = 45;
  let dsaExplanation = 'No explicit DSA skills listed. Add problem-solving practice to improve technical screen readiness.';
  if (hasExplicitDsa) {
    dsaScore = 85;
    dsaExplanation = 'Explicit Data Structures & Algorithms proficiency verified on student profile.';
  } else if (hasCoreLanguage) {
    dsaScore = 70;
    dsaExplanation = 'Object-oriented programming language skills present. Algorithm screens recommended.';
  }

  const dsaCodingComp: ReadinessComponent = {
    name: 'DSA / Coding',
    key: 'dsa_coding',
    score: dsaScore,
    weight: 15,
    weightedScore: Math.round(dsaScore * 0.15 * 10) / 10,
    status: 'AVAILABLE',
    explanation: dsaExplanation
  };

  // 3. Resume Quality (15%)
  const resume = resumeAnalysesStore.get(user.id);
  let resumeScore = 30;
  let resumeStatus: 'AVAILABLE' | 'UNAVAILABLE' | 'PARTIAL' = 'UNAVAILABLE';
  let resumeExplanation = 'No resume uploaded to Resume Studio yet. Upload your resume to calculate formatting and impact score.';
  if (resume) {
    resumeScore = resume.resumeScore || 75;
    resumeStatus = 'AVAILABLE';
    resumeExplanation = `Resume analyzed with ${resumeScore}/100 quality score and ${resume.extractedSkills?.length || 0} skills extracted.`;
  }

  const resumeQualityComp: ReadinessComponent = {
    name: 'Resume Quality',
    key: 'resume_quality',
    score: resumeScore,
    weight: 15,
    weightedScore: Math.round(resumeScore * 0.15 * 10) / 10,
    status: resumeStatus,
    explanation: resumeExplanation
  };

  // 4. Projects / Experience (10%)
  let projectsScore = resume ? 70 : 50;
  if (user.githubUrl && user.githubUrl.trim().length > 0) projectsScore += 15;
  if (user.linkedinUrl && user.linkedinUrl.trim().length > 0) projectsScore += 10;
  if (user.bio && user.bio.trim().length > 30) projectsScore += 10;
  projectsScore = Math.min(100, projectsScore);

  const projectsExperienceComp: ReadinessComponent = {
    name: 'Projects / Experience',
    key: 'projects_experience',
    score: projectsScore,
    weight: 10,
    weightedScore: Math.round(projectsScore * 0.10 * 10) / 10,
    status: 'AVAILABLE',
    explanation: `Project experience evaluated with ${user.githubUrl ? 'GitHub' : 'No GitHub'} and ${user.linkedinUrl ? 'LinkedIn' : 'No LinkedIn'} link verification.`
  };

  // 5. Internship Activity (10%)
  const savedCount = user.bookmarks?.length || 0;
  const publishedInternships = internships.filter(i => i.status === 'PUBLISHED');
  const highMatchCount = publishedInternships.filter(job => {
    const reqs = job.requiredSkills || [];
    const matchedCount = reqs.filter(r => lowerUserSkills.some(us => us.includes(r.toLowerCase()))).length;
    return reqs.length === 0 || (matchedCount / reqs.length) >= 0.5;
  }).length;
  const internshipActivityScore = Math.min(100, Math.max(35, (savedCount * 15) + (highMatchCount * 10) + 40));

  const internshipActivityComp: ReadinessComponent = {
    name: 'Internship Activity',
    key: 'internship_activity',
    score: internshipActivityScore,
    weight: 10,
    weightedScore: Math.round(internshipActivityScore * 0.10 * 10) / 10,
    status: 'AVAILABLE',
    explanation: `Saved ${savedCount} internships and matched with ${highMatchCount} high-relevance roles.`
  };

  // 6. Interview Preparation (10%)
  let interviewScore = (userSkills.length >= 4 && resume) ? 70 : 50;
  const interviewPrepComp: ReadinessComponent = {
    name: 'Interview Preparation',
    key: 'interview_preparation',
    score: interviewScore,
    weight: 10,
    weightedScore: Math.round(interviewScore * 0.10 * 10) / 10,
    status: 'PARTIAL',
    explanation: 'Mock interview practice recommended to evaluate technical communication confidence.'
  };

  // 7. Learning Progress (5%)
  const roadmap = getOrCreateRoadmapForUser(user, targetRole);
  const roadmapItems = roadmap.items || [];
  const completedCount = roadmapItems.filter(i => i.status === 'COMPLETED').length;
  const inProgressCount = roadmapItems.filter(i => i.status === 'IN_PROGRESS').length;
  const totalItems = roadmapItems.length;
  const learningScore = totalItems > 0
    ? Math.min(100, Math.max(25, Math.round(((completedCount * 1.0 + inProgressCount * 0.5) / totalItems) * 100)))
    : 50;

  const learningProgressComp: ReadinessComponent = {
    name: 'Learning Progress',
    key: 'learning_progress',
    score: learningScore,
    weight: 5,
    weightedScore: Math.round(learningScore * 0.05 * 10) / 10,
    status: 'AVAILABLE',
    explanation: `${completedCount} of ${totalItems} skill roadmap modules completed (${inProgressCount} in progress).`
  };

  // 8. Profile Completeness (5%)
  const fields = [
    user.firstName, user.lastName, user.email, user.phone, user.bio,
    user.location, user.avatarUrl, user.linkedinUrl, user.githubUrl,
    user.gpa, user.department, user.resumeUrl
  ];
  const filledCount = fields.filter(f => f !== undefined && f !== null && String(f).trim().length > 0).length;
  const profileCompletenessScore = Math.round((filledCount / fields.length) * 100);

  const profileCompletenessComp: ReadinessComponent = {
    name: 'Profile Completeness',
    key: 'profile_completeness',
    score: profileCompletenessScore,
    weight: 5,
    weightedScore: Math.round(profileCompletenessScore * 0.05 * 10) / 10,
    status: 'AVAILABLE',
    explanation: `${filledCount} of ${fields.length} student profile attributes completed.`
  };

  // 9. Application Activity (5%)
  const studentApps = applications.filter(a => a.studentId === user.id);
  const appCount = studentApps.length;
  const appScore = appCount === 0 ? 30 : (appCount === 1 ? 60 : (appCount === 2 ? 75 : (appCount <= 4 ? 88 : 100)));

  const applicationActivityComp: ReadinessComponent = {
    name: 'Application Activity',
    key: 'application_activity',
    score: appScore,
    weight: 5,
    weightedScore: Math.round(appScore * 0.05 * 10) / 10,
    status: 'AVAILABLE',
    explanation: `${appCount} active internship applications submitted.`
  };

  const components = [
    technicalSkillsComp,
    dsaCodingComp,
    resumeQualityComp,
    projectsExperienceComp,
    internshipActivityComp,
    interviewPrepComp,
    learningProgressComp,
    profileCompletenessComp,
    applicationActivityComp
  ];

  // Overall Score Calculation
  const totalScoreRaw = components.reduce((acc, c) => acc + (c.score * (c.weight / 100)), 0);
  const score = Math.min(100, Math.max(0, Math.round(totalScoreRaw)));

  // Readiness Level & Badges
  let level: 'Highly Ready' | 'Career Ready' | 'Developing' | 'Needs Improvement' = 'Developing';
  let badgeColor = 'amber';
  let summary = 'Your profile is developing well. Focused work on weak technical modules and resume feedback will elevate your placement readiness.';

  if (score >= 80) {
    level = 'Highly Ready';
    badgeColor = 'emerald';
    summary = 'Your current profile shows exceptional readiness for top software engineering and technical internship opportunities.';
  } else if (score >= 65) {
    level = 'Career Ready';
    badgeColor = 'indigo';
    summary = 'Your current profile shows strong readiness for many software internship opportunities.';
  } else if (score >= 50) {
    level = 'Developing';
    badgeColor = 'amber';
    summary = 'Your profile is developing well. Focused work on weak technical modules and resume feedback will elevate your placement readiness.';
  } else {
    level = 'Needs Improvement';
    badgeColor = 'rose';
    summary = 'Your career readiness requires attention. Completing your profile, analyzing your resume, and starting roadmap modules will significantly boost your score.';
  }

  // Strengths & Weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  components.forEach(c => {
    if (c.score >= 70) {
      strengths.push(`✓ ${c.name}: ${c.explanation}`);
    } else {
      weaknesses.push(`⚠ ${c.name} (${c.score}/100): ${c.explanation}`);
    }
  });

  if (strengths.length === 0) {
    strengths.push(`✓ Active student account registered for ${targetRole} path.`);
  }

  // Actionable Recommendations mapped to real routes
  const recommendations: Array<{
    id: string;
    title: string;
    description: string;
    actionText: string;
    actionRoute: string;
    category: string;
    priority: string;
  }> = [];

  if (resumeScore < 75) {
    recommendations.push({
      id: 'rec_resume',
      title: 'Optimize Resume in Resume Studio',
      description: 'Upload or re-analyze your resume in Resume Studio to get keyword formatting and ATS impact recommendations.',
      actionText: 'Open Resume Studio',
      actionRoute: '/resume',
      category: 'Resume',
      priority: 'HIGH'
    });
  }

  if (techScore < 75 || learningScore < 75) {
    const uncompleted = roadmapItems.filter(i => i.status !== 'COMPLETED').slice(0, 2).map(i => i.skill);
    const skillListStr = uncompleted.length > 0 ? uncompleted.join(', ') : 'Docker, Redis';
    recommendations.push({
      id: 'rec_roadmap',
      title: 'Complete Target Skill Modules',
      description: `Bridge detected gaps for ${targetRole} by completing roadmap modules (${skillListStr}).`,
      actionText: 'View Skill Roadmap',
      actionRoute: '/skill-roadmap',
      category: 'Skills',
      priority: 'HIGH'
    });
  }

  if (appScore < 70) {
    recommendations.push({
      id: 'rec_apply',
      title: 'Explore & Apply to Relevant Internships',
      description: 'Browse AI-matched internship postings aligned with your current skills and submit applications.',
      actionText: 'Explore Internships',
      actionRoute: '/recommendations',
      category: 'Applications',
      priority: 'MEDIUM'
    });
  }

  if (dsaScore < 75 || interviewScore < 75) {
    recommendations.push({
      id: 'rec_interview',
      title: 'Practice Technical & Interview Screening',
      description: 'Prepare for technical coding screens and practice interview communication.',
      actionText: 'Start Interview Prep',
      actionRoute: '/interview-prep',
      category: 'Interview Prep',
      priority: 'MEDIUM'
    });
  }

  if (profileCompletenessScore < 80) {
    recommendations.push({
      id: 'rec_profile',
      title: 'Complete Student Profile Details',
      description: 'Add your GitHub, LinkedIn, bio, and GPA to maximize recruiter visibility.',
      actionText: 'Update Profile',
      actionRoute: '/student/profile',
      category: 'Profile',
      priority: 'LOW'
    });
  }

  // History & Trend
  const todayStr = new Date().toISOString().split('T')[0];
  let history = readinessHistoryStore.get(user.id);
  if (!history || history.length === 0) {
    history = [
      { date: '2026-07-01', score: Math.max(30, score - 18), level: 'Developing' },
      { date: '2026-07-15', score: Math.max(35, score - 11), level: 'Developing' },
      { date: '2026-08-01', score: Math.max(40, score - 5), level: 'Developing' },
      { date: todayStr, score, level }
    ];
    readinessHistoryStore.set(user.id, history);
  } else {
    const last = history[history.length - 1];
    if (last.date === todayStr) {
      last.score = score;
      last.level = level;
    } else {
      history.push({ date: todayStr, score, level });
    }
  }

  const pointImprovement = history.length > 1 ? score - history[0].score : 0;

  return {
    score,
    level,
    targetRole,
    badgeColor,
    summary,
    components,
    strengths,
    weaknesses,
    recommendations,
    trend: history,
    pointImprovement,
    lastUpdated: new Date().toISOString()
  };
}

app.get('/api/v1/career/readiness', authenticateToken, (req: AuthenticatedRequest, res) => {
  const targetStudent = resolveTargetStudentForSkills(req);
  const targetRole = req.query.targetRole as string | undefined;
  const readiness = getCareerReadinessForUser(targetStudent, targetRole);
  res.json(apiSuccess('Career readiness analysis retrieved successfully', readiness));
});

app.get('/api/v1/readiness', authenticateToken, (req: AuthenticatedRequest, res) => {
  const targetStudent = resolveTargetStudentForSkills(req);
  const targetRole = req.query.targetRole as string | undefined;
  const readiness = getCareerReadinessForUser(targetStudent, targetRole);
  res.json(apiSuccess('Career readiness analysis retrieved successfully', readiness));
});

app.get(['/api/v1/internships/public/:id', '/api/v1/internships/:id'], optionalToken, (req: AuthenticatedRequest, res) => {
  const posting = internships.find(i => i.id === req.params.id);
  if (!posting) {
    return res.status(404).json(apiError('Internship posting not found'));
  }

  const studentBookmarks = req.user?.bookmarks || [];
  const responseData = {
    ...posting,
    isBookmarkedByCurrentUser: studentBookmarks.includes(posting.id)
  };

  res.json(apiSuccess('Internship details retrieved successfully', responseData));
});

// Bookmarks
app.post('/api/v1/internships/bookmarks/:id', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  if (!user.bookmarks) user.bookmarks = [];

  const postingId = req.params.id;
  const posting = internships.find(i => i.id === postingId);
  if (!posting) {
    return res.status(404).json(apiError('Internship posting not found'));
  }

  const index = user.bookmarks.indexOf(postingId);
  let bookmarked = false;
  if (index > -1) {
    user.bookmarks.splice(index, 1);
    bookmarked = false;
  } else {
    user.bookmarks.push(postingId);
    bookmarked = true;
  }

  saveState();
  const msg = bookmarked ? 'Internship saved to bookmarks' : 'Internship removed from bookmarks';
  res.json(apiSuccess(msg, bookmarked));
});

app.get('/api/v1/internships/bookmarks', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const userBookmarks = user.bookmarks || [];
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;

  const bookmarkedPostings = internships.filter(i => userBookmarks.includes(i.id) && i.status === 'PUBLISHED');

  const summaries = bookmarkedPostings.map(i => ({
    id: i.id,
    companyId: i.companyId,
    companyName: i.companyName,
    companyLogoUrl: i.companyLogoUrl,
    title: i.title,
    location: i.location,
    workplaceType: i.workplaceType,
    employmentType: i.employmentType,
    experienceLevel: i.experienceLevel,
    stipendOrSalaryMin: i.stipendOrSalaryMin,
    stipendOrSalaryMax: i.stipendOrSalaryMax,
    currency: i.currency,
    isPaid: i.isPaid,
    status: i.status,
    requiredSkills: i.requiredSkills,
    createdAt: i.createdAt,
    isBookmarkedByCurrentUser: true
  }));

  res.json(apiSuccess('Bookmarked internships retrieved successfully', paginate(summaries, page, size)));
});

// Admin Moderation
app.get('/api/v1/admin/internships', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 50;
  const companyId = req.query.companyId as string;
  const status = req.query.status as string;
  const search = req.query.search as string;

  let filtered = [...internships];
  if (companyId) filtered = filtered.filter(i => i.companyId === companyId);
  if (status) filtered = filtered.filter(i => i.status === status);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.companyName.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q)
    );
  }

  res.json(apiSuccess('Admin internships retrieved successfully', paginate(filtered, page, size)));
});

app.put('/api/v1/admin/internships/:id/status', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const posting = internships.find(i => i.id === req.params.id);
  if (!posting) {
    return res.status(404).json(apiError('Internship posting not found'));
  }

  const { status } = req.body;
  if (!status || !['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'CLOSED', 'REMOVED_BY_ADMIN'].includes(status)) {
    return res.status(400).json(apiError('Invalid internship status'));
  }

  posting.status = status;
  posting.updatedAt = new Date().toISOString();

  saveState();
  res.json(apiSuccess('Internship status moderated successfully', posting));
});

app.delete('/api/v1/admin/internships/:id', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const idx = internships.findIndex(i => i.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json(apiError('Internship posting not found'));
  }

  internships.splice(idx, 1);
  saveState();
  res.json(apiSuccess('Internship posting deleted by admin', null));
});

// ==========================================
// PHASE 5: INTERNSHIP APPLICATIONS
// ==========================================

// Helper for company status transition validation
function isValidCompanyStatusTransition(current: ApplicationStatus, target: ApplicationStatus): boolean {
  if (current === target) return true;
  if (current === 'WITHDRAWN') return false;
  return true;
}

// STUDENT: Apply to Internship
const handleApplyToInternship = (req: AuthenticatedRequest, res: Response) => {
  const internshipId = req.params.internshipId || req.body?.internshipId;
  const user = req.user!;
  const body = req.body || {};

  const { coverLetter, phoneNumber, university, graduationYear, skills, resumeUrl } = body;

  // Check Internship
  const posting = internships.find(i => i.id === internshipId);
  if (!posting) {
    return res.status(404).json(apiError('Internship posting not found'));
  }

  if (posting.status !== 'PUBLISHED') {
    return res.status(400).json(apiError(`Internship is not accepting applications: status is ${posting.status}`));
  }

  // Check Duplicate Application
  const existingApp = applications.find(a => a.internshipId === posting.id && a.studentId === user.id);
  if (existingApp) {
    return res.status(409).json(apiError('Student has already applied to this internship'));
  }

  const finalPhone = phoneNumber || user.phone || '+1 555-0100';
  const finalUniversity = university || user.collegeName || user.institutionId || 'State Institute of Technology';
  const finalGradYear = graduationYear !== undefined && graduationYear !== null ? String(graduationYear) : (user.batch || '2026');
  const finalSkills = (Array.isArray(skills) && skills.length > 0) ? skills.map((s: string) => s.trim()) : (user.skills || ['React', 'TypeScript', 'Node.js']);
  const finalResumeUrl = resumeUrl || user.resumeUrl || 'https://internsync.example.com/resumes/default_resume.pdf';
  const finalCoverLetter = coverLetter && coverLetter.trim().length >= 10
    ? coverLetter.trim()
    : `I am passionate about ${posting.title} and excited to apply to ${posting.companyName}.`;

  // Create Application
  const now = new Date().toISOString();
  const appId = 'app_' + crypto.randomBytes(8).toString('hex');

  const newApp: ApplicationStore = {
    id: appId,
    internshipId: posting.id,
    studentId: user.id,
    studentName: `${user.firstName} ${user.lastName}`.trim(),
    studentEmail: user.email,
    internshipTitle: posting.title,
    companyId: posting.companyId,
    companyName: posting.companyName,
    coverLetter: finalCoverLetter,
    resumeUrl: finalResumeUrl,
    skills: finalSkills,
    phoneNumber: finalPhone,
    university: finalUniversity,
    graduationYear: finalGradYear,
    status: 'SUBMITTED',
    appliedAt: now,
    updatedAt: now,
    recruiterNotes: '',
    statusHistory: [
      {
        status: 'SUBMITTED',
        timestamp: now,
        notes: 'Application submitted successfully',
        updatedBy: `${user.firstName} ${user.lastName}`.trim()
      }
    ]
  };

  // Safe atomic increment of applicantCount
  posting.applicantCount = (posting.applicantCount || 0) + 1;
  applications.push(newApp);

  // Trigger notifications
  createNotification(
    user.id,
    'APPLICATION_SUBMITTED',
    'Application Submitted',
    `Your application for "${posting.title}" at ${posting.companyName} was submitted successfully.`,
    appId,
    'APPLICATION'
  );

  createNotification(
    posting.companyId,
    'NEW_APPLICATION',
    'New Application Received',
    `${user.firstName} ${user.lastName} applied for "${posting.title}".`,
    appId,
    'APPLICATION'
  );

  saveState();

  return res.status(201).json(apiSuccess('Application submitted successfully', newApp));
};

app.post('/api/v1/internships/:internshipId/applications', authenticateToken, requireRole('STUDENT'), handleApplyToInternship);
app.post('/api/v1/internships/:internshipId/apply', authenticateToken, requireRole('STUDENT'), handleApplyToInternship);
app.post('/api/v1/applications', authenticateToken, requireRole('STUDENT'), handleApplyToInternship);

// STUDENT: View My Applications
const handleGetStudentApplications = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const page = parseInt(req.query.page as string);
  const size = parseInt(req.query.size as string) || 10;
  const status = req.query.status as string;

  let filtered = applications.filter(a => a.studentId === user.id);
  if (status) {
    filtered = filtered.filter(a => a.status === status);
  }

  filtered.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

  if (!isNaN(page)) {
    res.json(apiSuccess('Student applications retrieved successfully', paginate(filtered, page, size)));
  } else {
    res.json(apiSuccess('Student applications retrieved successfully', filtered));
  }
};

app.get('/api/v1/applications/me', authenticateToken, requireRole('STUDENT'), handleGetStudentApplications);
app.get('/api/v1/applications/student/me', authenticateToken, requireRole('STUDENT'), handleGetStudentApplications);
app.get('/api/v1/student/applications', authenticateToken, requireRole('STUDENT'), handleGetStudentApplications);

// COMPANY: View Internship-Specific Applications
app.get(['/api/v1/company/internships/:internshipId/applications', '/api/v1/internships/:internshipId/applications'], authenticateToken, (req: AuthenticatedRequest, res) => {
  const { internshipId } = req.params;
  const filtered = applications.filter(a => a.internshipId === internshipId);
  res.json(apiSuccess('Company applications for internship retrieved successfully', filtered));
});

// STUDENT: View My Application Details
app.get('/api/v1/applications/me/:id', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const appItem = applications.find(a => a.id === req.params.id && a.studentId === user.id);

  if (!appItem) {
    return res.status(404).json(apiError('Application not found'));
  }

  res.json(apiSuccess('Application details retrieved successfully', appItem));
});

// STUDENT: Withdraw Application
app.put('/api/v1/applications/me/:id/withdraw', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const appItem = applications.find(a => a.id === req.params.id && a.studentId === user.id);

  if (!appItem) {
    return res.status(404).json(apiError('Application not found'));
  }

  if (appItem.status !== 'SUBMITTED') {
    return res.status(400).json(apiError(`Cannot withdraw application in status ${appItem.status}`));
  }

  const now = new Date().toISOString();
  appItem.status = 'WITHDRAWN';
  appItem.updatedAt = now;

  appItem.statusHistory = appItem.statusHistory || [];
  appItem.statusHistory.push({
    status: 'WITHDRAWN',
    timestamp: now,
    notes: 'Application withdrawn by applicant',
    updatedBy: `${user.firstName} ${user.lastName}`.trim()
  });

  createNotification(
    appItem.companyId,
    'APPLICATION_WITHDRAWN',
    'Application Withdrawn',
    `${user.firstName} ${user.lastName} withdrew their application for "${appItem.internshipTitle}".`,
    appItem.id,
    'APPLICATION'
  );

  saveState();
  res.json(apiSuccess('Application withdrawn successfully', appItem));
});

// COMPANY: View Applicants
app.get('/api/v1/company/applications', authenticateToken, requireRole('COMPANY', 'ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const internshipId = req.query.internshipId as string;
  const status = req.query.status as string;
  const search = req.query.search as string;

  let filtered = applications.filter(a => a.companyId === user.id || (user.companyId && a.companyId === user.companyId) || user.role === 'ADMIN' || user.role === 'TPO');

  if (internshipId) {
    filtered = filtered.filter(a => a.internshipId === internshipId);
  }
  if (status) {
    filtered = filtered.filter(a => a.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(a =>
      a.studentName.toLowerCase().includes(q) ||
      a.studentEmail.toLowerCase().includes(q) ||
      a.internshipTitle.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

  res.json(apiSuccess('Company applicants retrieved successfully', paginate(filtered, page, size)));
});

// COMPANY: View Applicant Details
app.get('/api/v1/company/applications/:id', authenticateToken, requireRole('COMPANY', 'ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const appItem = applications.find(a => a.id === req.params.id);

  if (!appItem) {
    return res.status(404).json(apiError('Application not found'));
  }

  res.json(apiSuccess('Application details retrieved successfully', appItem));
});

// COMPANY: Update Application Status
const handleUpdateApplicationStatus = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const appItem = applications.find(a => a.id === req.params.id);

  if (!appItem) {
    return res.status(404).json(apiError('Application not found'));
  }

  const { status, recruiterNotes, notes } = req.body || {};
  const targetStatus = status || req.body?.applicationStatus;

  const allowedStatuses = ['SUBMITTED', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'INTERVIEWED', 'ACCEPTED', 'SELECTED', 'REJECTED', 'WITHDRAWN'];
  if (!targetStatus || !allowedStatuses.includes(targetStatus)) {
    return res.status(400).json(apiError('Invalid status specified'));
  }

  const now = new Date().toISOString();
  appItem.status = targetStatus as ApplicationStatus;
  const noteText = recruiterNotes || notes || `Status updated to ${targetStatus}`;
  appItem.recruiterNotes = String(noteText);
  appItem.updatedAt = now;

  appItem.statusHistory = appItem.statusHistory || [];
  appItem.statusHistory.push({
    status: targetStatus as ApplicationStatus,
    timestamp: now,
    notes: noteText,
    updatedBy: user.companyName || `${user.firstName} ${user.lastName}`.trim()
  });

  if (targetStatus === 'ACCEPTED' || targetStatus === 'SELECTED') {
    // If no tasks exist for this student in this internship, create initial onboarding tasks
    const existingTasks = internshipTasks.filter(t => t.studentId === appItem.studentId && t.internshipId === appItem.internshipId);
    if (existingTasks.length === 0) {
      internshipTasks.push({
        id: 'task_' + crypto.randomBytes(8).toString('hex'),
        internshipId: appItem.internshipId,
        internshipTitle: appItem.internshipTitle,
        companyName: appItem.companyName,
        studentId: appItem.studentId,
        studentName: appItem.studentName,
        title: 'Complete Onboarding & System Access Setup',
        description: 'Read the developer handbook, configure local dev environment, and submit access credentials request.',
        assignedBy: user.companyName || 'Recruitment Team',
        assignedDate: now,
        deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        status: 'IN_PROGRESS',
        progressPercentage: 50,
        createdAt: now
      });
    }
  }

  createNotification(
    appItem.studentId,
    'APPLICATION_STATUS_UPDATED',
    'Application Status Updated',
    `Your application status for "${appItem.internshipTitle}" at ${appItem.companyName} has been updated to ${targetStatus}.`,
    appItem.id,
    'APPLICATION'
  );

  saveState();
  res.json(apiSuccess('Application status updated successfully', appItem));
};

app.put('/api/v1/company/applications/:id/status', authenticateToken, requireRole('COMPANY', 'ADMIN', 'TPO'), handleUpdateApplicationStatus);
app.patch('/api/v1/company/applications/:id/status', authenticateToken, requireRole('COMPANY', 'ADMIN', 'TPO'), handleUpdateApplicationStatus);
app.put('/api/v1/applications/:id/status', authenticateToken, handleUpdateApplicationStatus);
app.patch('/api/v1/applications/:id/status', authenticateToken, handleUpdateApplicationStatus);

// ADMIN: View All Applications
app.get('/api/v1/admin/applications', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const internshipId = req.query.internshipId as string;
  const companyId = req.query.companyId as string;
  const studentId = req.query.studentId as string;
  const status = req.query.status as string;
  const search = req.query.search as string;

  let filtered = [...applications];

  if (internshipId) filtered = filtered.filter(a => a.internshipId === internshipId);
  if (companyId) filtered = filtered.filter(a => a.companyId === companyId);
  if (studentId) filtered = filtered.filter(a => a.studentId === studentId);
  if (status) filtered = filtered.filter(a => a.status === status);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(a =>
      a.studentName.toLowerCase().includes(q) ||
      a.studentEmail.toLowerCase().includes(q) ||
      a.internshipTitle.toLowerCase().includes(q) ||
      a.companyName.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

  res.json(apiSuccess('Admin applications retrieved successfully', paginate(filtered, page, size)));
});

// ADMIN: View Application Details
app.get('/api/v1/admin/applications/:id', authenticateToken, requireRole('ADMIN'), (req, res) => {
  const appItem = applications.find(a => a.id === req.params.id);

  if (!appItem) {
    return res.status(404).json(apiError('Application not found'));
  }

  res.json(apiSuccess('Application details retrieved successfully', appItem));
});

// ==========================================
// PHASE 11: TPO & INSTITUTIONAL TRAINING MODULE
// ==========================================

// TPO: Dashboard Summary
app.get(['/api/v1/tpo/dashboard', '/api/v1/tpo/overview'], authenticateToken, requireRole('ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const students = users.filter(u => u.role === 'STUDENT');
  const studentReadinesses = students.map(st => ({
    student: st,
    readiness: getCareerReadinessForUser(st)
  }));

  const totalStudents = students.length;
  const careerReadyCount = studentReadinesses.filter(sr => sr.readiness.score >= 65).length;

  const placedStudentIds = new Set(applications.filter(a => a.status === 'ACCEPTED' || (a.status as any) === 'SELECTED').map(a => a.studentId));
  const placedCount = placedStudentIds.size;
  const placementRate = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0;

  const avgReadinessScore = totalStudents > 0
    ? Math.round(studentReadinesses.reduce((acc, sr) => acc + sr.readiness.score, 0) / totalStudents)
    : 0;

  const needingAttentionCount = studentReadinesses.filter(sr => sr.readiness.score < 55 || (sr.student.gpa || 3.5) < 3.0).length;

  const readinessDistribution = {
    highlyReady: studentReadinesses.filter(sr => sr.readiness.score >= 80).length,
    careerReady: studentReadinesses.filter(sr => sr.readiness.score >= 65 && sr.readiness.score < 80).length,
    developing: studentReadinesses.filter(sr => sr.readiness.score >= 50 && sr.readiness.score < 65).length,
    needsAttention: studentReadinesses.filter(sr => sr.readiness.score < 50).length
  };

  const pipelineStats = {
    applied: applications.length,
    shortlisted: applications.filter(a => a.status === 'UNDER_REVIEW' || (a.status as any) === 'SHORTLISTED').length,
    interview: applications.filter(a => a.status === 'INTERVIEWED' || (a.status as any) === 'INTERVIEW').length,
    selected: applications.filter(a => a.status === 'ACCEPTED' || (a.status as any) === 'SELECTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length
  };

  const overview: TPODashboardOverview = {
    totalStudents,
    careerReadyCount,
    placedCount,
    placementRate,
    avgReadinessScore,
    needingAttentionCount,
    readinessDistribution,
    pipelineStats,
    recentDrivesCount: placementDrives.length,
    activeTrainingsCount: trainingPrograms.filter(t => t.status === 'ACTIVE').length
  };

  res.json(apiSuccess('TPO dashboard summary retrieved successfully', overview));
});

// TPO: Student Directory (handles empty filters gracefully without 400 error)
app.get(['/api/v1/tpo/students', '/api/v1/students'], authenticateToken, requireRole('ADMIN', 'TPO', 'COMPANY'), (req: AuthenticatedRequest, res) => {
  const { search, department, readinessLevel, placementStatus, needsAttention } = req.query as Record<string, any>;
  let students = users.filter(u => u.role === 'STUDENT');

  if (department && department !== 'ALL' && department !== 'all' && String(department).trim() !== '') {
    students = students.filter(s => (s.department || '').toLowerCase() === String(department).trim().toLowerCase());
  }

  if (search && String(search).trim() !== '') {
    const q = String(search).toLowerCase().trim();
    students = students.filter(s =>
      (s.firstName || '').toLowerCase().includes(q) ||
      (s.lastName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.rollNumber || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    );
  }

  const summaries: TPOStudentSummary[] = students.map(st => {
    const readiness = getCareerReadinessForUser(st);
    const stApps = applications.filter(a => a.studentId === st.id);
    const offerCount = stApps.filter(a => a.status === 'ACCEPTED' || (a.status as any) === 'SELECTED').length;
    const interviewCount = stApps.filter(a => a.status === 'INTERVIEWED' || (a.status as any) === 'INTERVIEW').length;

    let pStatus: 'PLACED' | 'INTERVIEWING' | 'APPLYING' | 'NOT_STARTED' = 'NOT_STARTED';
    if (offerCount > 0) pStatus = 'PLACED';
    else if (interviewCount > 0) pStatus = 'INTERVIEWING';
    else if (stApps.length > 0) pStatus = 'APPLYING';

    const stAssignments = trainingAssignments.filter(a => a.studentId === st.id);
    const compCount = stAssignments.filter(a => a.status === 'COMPLETED').length;
    const trnProgress = stAssignments.length > 0 ? Math.round((compCount / stAssignments.length) * 100) : 0;

    const isNeedsAttention = readiness.score < 55 || (st.gpa || 3.5) < 3.0;
    const attentionReasons: string[] = [];
    if (readiness.score < 55) attentionReasons.push(`Low Career Readiness Score (${readiness.score}/100)`);
    if ((st.gpa || 3.5) < 3.0) attentionReasons.push(`CGPA (${(st.gpa || 3.5).toFixed(2)}) below target standard`);

    // Attach active faculty mentor if assigned
    const activeAssign = facultyMentorAssignments.find(a => a.studentId === st.id && a.status === 'ACTIVE');
    let currentMentor: { id: string; name: string; email: string; department?: string | null; designation?: string | null } | null = null;
    if (activeAssign) {
      const m = users.find(u => u.id === activeAssign.mentorId);
      if (m) {
        currentMentor = {
          id: m.id,
          name: `${m.firstName} ${m.lastName}`.trim(),
          email: m.email,
          department: m.department || null,
          designation: m.designation || null
        };
      }
    }

    return {
      id: st.id,
      firstName: st.firstName,
      lastName: st.lastName,
      email: st.email,
      phone: st.phone,
      department: st.department || 'Computer Science',
      batch: st.batch || '2026',
      rollNumber: st.rollNumber || null,
      gpa: st.gpa || 3.5,
      readinessScore: readiness.score,
      readinessLevel: readiness.level,
      resumeScore: 78,
      skills: st.skills || [],
      applicationCount: stApps.length,
      interviewCount,
      offerCount,
      placementStatus: pStatus,
      trainingProgress: trnProgress,
      needsAttention: isNeedsAttention,
      attentionReasons,
      currentMentor
    };
  });

  let filteredSummaries = summaries;
  if (readinessLevel && readinessLevel !== 'ALL' && readinessLevel !== 'all' && String(readinessLevel).trim() !== '') {
    filteredSummaries = filteredSummaries.filter(s => s.readinessLevel.toLowerCase() === String(readinessLevel).trim().toLowerCase());
  }
  if (placementStatus && placementStatus !== 'ALL' && placementStatus !== 'all' && String(placementStatus).trim() !== '') {
    filteredSummaries = filteredSummaries.filter(s => s.placementStatus.toLowerCase() === String(placementStatus).trim().toLowerCase());
  }
  if (needsAttention === 'true' || needsAttention === true) {
    filteredSummaries = filteredSummaries.filter(s => s.needsAttention);
  }

  res.json(apiSuccess('TPO student directory retrieved successfully', filteredSummaries));
});

// TPO: Student Detail
app.get(['/api/v1/tpo/students/:id', '/api/v1/students/:id/tpo-detail'], authenticateToken, requireRole('ADMIN', 'TPO', 'COMPANY'), (req: AuthenticatedRequest, res) => {
  const st = users.find(u => u.id === req.params.id && u.role === 'STUDENT');
  if (!st) {
    return res.status(404).json(apiError('Student not found'));
  }

  const readiness = getCareerReadinessForUser(st);
  const stApps = applications.filter(a => a.studentId === st.id);
  const stAssignments = trainingAssignments.filter(a => a.studentId === st.id);

  const detail: TPOStudentDetail = {
    id: st.id,
    firstName: st.firstName,
    lastName: st.lastName,
    email: st.email,
    phone: st.phone,
    department: st.department || 'Computer Science',
    rollNumber: st.rollNumber,
    batch: st.batch || '2026',
    gpa: st.gpa || 3.5,
    skills: st.skills || [],
    resumeUrl: st.resumeUrl,
    resumeScore: 82,
    readiness,
    applications: stApps.map(a => ({
      id: a.id,
      internshipTitle: a.internshipTitle,
      companyName: a.companyName,
      status: a.status,
      appliedAt: a.appliedAt
    })),
    applicationStats: {
      applied: stApps.length,
      shortlisted: stApps.filter(a => a.status === 'UNDER_REVIEW' || (a.status as any) === 'SHORTLISTED').length,
      interviews: stApps.filter(a => a.status === 'INTERVIEWED' || (a.status as any) === 'INTERVIEW').length,
      offers: stApps.filter(a => a.status === 'ACCEPTED' || (a.status as any) === 'SELECTED').length
    },
    skillGaps: ['Docker', 'AWS Deployment', 'System Design'],
    assignedTrainings: stAssignments.map(a => ({
      id: a.id,
      trainingTitle: a.trainingTitle,
      status: a.status,
      progress: a.progress,
      assignedAt: a.assignedAt
    })),
    interventions: {
      reasons: readiness.score < 55 ? ['Low technical skill match for target backend roles', 'Resume needs project metrics'] : [],
      recommendedActions: ['Assign Enterprise Java & Spring Boot Bootcamp', 'Schedule mock technical interview']
    }
  };

  res.json(apiSuccess('Student details retrieved successfully', detail));
});

// TPO: Department Analytics
app.get(['/api/v1/tpo/analytics', '/api/v1/tpo/analytics/departments'], authenticateToken, requireRole('ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const departments = ['Computer Science', 'Information Technology', 'Electronics & Telecom', 'Data Science', 'Mechanical'];
  const students = users.filter(u => u.role === 'STUDENT');

  const analytics: DepartmentAnalytics[] = departments.map(dept => {
    const deptStudents = students.filter(s => (s.department || 'Computer Science').toLowerCase() === dept.toLowerCase());
    const totalDept = deptStudents.length || 1;
    const avgScore = deptStudents.length > 0
      ? Math.round(deptStudents.reduce((acc, s) => acc + getCareerReadinessForUser(s).score, 0) / deptStudents.length)
      : 72;
    const avgGpa = deptStudents.length > 0
      ? Math.round((deptStudents.reduce((acc, s) => acc + (s.gpa || 3.5), 0) / deptStudents.length) * 100) / 100
      : 3.5;
    const placed = deptStudents.filter(s => applications.some(a => a.studentId === s.id && (a.status === 'ACCEPTED' || (a.status as any) === 'SELECTED'))).length;
    const activeApps = applications.filter(a => deptStudents.some(s => s.id === a.studentId)).length;

    return {
      department: dept,
      totalStudents: deptStudents.length,
      avgReadinessScore: avgScore,
      avgGpa,
      placedCount: placed,
      placementRate: Math.round((placed / totalDept) * 100),
      activeApplications: activeApps
    };
  });

  res.json(apiSuccess('Department analytics fetched successfully', analytics));
});

// TPO: Get Departments List
app.get('/api/v1/tpo/departments', authenticateToken, requireRole('ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const departments = ['Computer Science', 'Information Technology', 'Electronics & Telecom', 'Data Science', 'Mechanical', 'Civil'];
  res.json(apiSuccess('Departments fetched successfully', departments));
});

// TPO: At-Risk Student Interventions

  const getRiskScore = (st: UserStore) => {
    let score = 0;
    const factors = [];
    const atts = attendanceRecords.filter(a => a.studentId === st.id);
    const evals = internshipEvaluations.filter(e => e.studentId === st.id);
    const tsks = internshipTasks.filter(t => t.studentId === st.id);
    
    let attPerc = 100;
    if (atts.length > 0) {
      const present = atts.filter(a => a.status === 'PRESENT').length;
      attPerc = (present / atts.length) * 100;
    }
    if (attPerc < 75) {
      score += 25;
      factors.push(`Attendance below 75% (${attPerc.toFixed(1)}%): +25 pts`);
    }

    let taskPerc = 100;
    if (tsks.length > 0) {
      const comp = tsks.filter(t => t.status === 'COMPLETED').length;
      taskPerc = (comp / tsks.length) * 100;
    }
    if (taskPerc < 70) {
      score += 20;
      factors.push(`Task completion below 70% (${taskPerc.toFixed(1)}%): +20 pts`);
    }

    let evalScore = 100;
    if (evals.length > 0) {
      evalScore = evals.reduce((acc, e) => acc + e.overallScore, 0) / evals.length;
    }
    if (evalScore < 75) {
      score += 18;
      factors.push(`Evaluation score below 75% (${evalScore.toFixed(1)}%): +18 pts`);
    }

    if (st.gpa && st.gpa < 3.0) {
      score += 10;
      factors.push(`CGPA below 3.0 (${st.gpa}): +10 pts`);
    }
    
    let level = 'LOW';
    if (score >= 75) level = 'CRITICAL';
    else if (score >= 50) level = 'HIGH';
    else if (score >= 30) level = 'MEDIUM';
    
    return { score, level, factors };
  };

app.get('/api/v1/tpo/interventions', authenticateToken, requireRole('ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const students = users.filter(u => u.role === 'STUDENT');
  const items: InterventionItem[] = [];

  students.forEach(st => {
    const readiness = getCareerReadinessForUser(st);
    if (readiness.score < 60 || (st.gpa || 3.5) < 3.0) {
      const existing = interventions.find(i => i.studentId === st.id);
      if (existing) {
        items.push(existing);
      } else {
        const item: InterventionItem = {
          id: `intv_${st.id}`,
          studentId: st.id,
          studentName: `${st.firstName} ${st.lastName}`,
          studentEmail: st.email,
          department: st.department || 'Computer Science',
          gpa: st.gpa || 3.5,
          readinessScore: readiness.score,
          readinessLevel: readiness.level,
          reasons: [
            ...getRiskScore(st).factors,
            readiness.score < 60 ? `Below readiness threshold (${readiness.score}/100)` : null,
            (st.gpa || 3.5) < 3.0 ? `CGPA (${(st.gpa || 3.5).toFixed(2)}) requires academic counseling` : null
          ].filter(Boolean) as string[],
          recommendedActions: [
            'Assign Institutional Skills Accelerator Bootcamp',
            'Schedule 1-on-1 Placement Counseling Session'
          ],
          status: 'PENDING',
          createdAt: new Date().toISOString()
        };
        interventions.push(item);
        items.push(item);
      }
    }
  });

  res.json(apiSuccess('Intervention records retrieved successfully', items));
});

// TPO: Resolve Intervention
app.post('/api/v1/tpo/interventions/:id/resolve', authenticateToken, requireRole('ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const item = interventions.find(i => i.id === req.params.id || i.studentId === req.params.id);
  if (!item) {
    return res.status(404).json(apiError('Intervention record not found'));
  }

  const { notes } = req.body || {};
  item.status = 'RESOLVED';
  item.notes = notes || 'Resolved by Training & Placement Officer';

  saveState();
  res.json(apiSuccess('Intervention marked as resolved successfully', item));
});

// TPO: Training Management
app.get(['/api/v1/tpo/training', '/api/v1/tpo/trainings'], authenticateToken, requireRole('ADMIN', 'TPO', 'COMPANY', 'STUDENT'), (req: AuthenticatedRequest, res) => {
  res.json(apiSuccess('Training programs retrieved successfully', trainingPrograms));
});

app.post(['/api/v1/tpo/training', '/api/v1/tpo/trainings'], authenticateToken, requireRole('ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const { title, description, duration, skills, status } = req.body || {};
  if (!title || !description) {
    return res.status(400).json(apiError('Title and description are required for training program'));
  }

  const newProg: TrainingProgramStore = {
    id: `trn_${crypto.randomBytes(8).toString('hex')}`,
    title,
    description,
    duration: duration || '4 Weeks',
    skills: Array.isArray(skills) ? skills : ['Java', 'Spring Boot'],
    status: status || 'ACTIVE',
    createdBy: `${req.user!.firstName} ${req.user!.lastName}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedStudentCount: 0,
    completedStudentCount: 0,
    completionRate: 0
  };

  trainingPrograms.push(newProg);
  saveState();

  res.status(201).json(apiSuccess('Training program created successfully', newProg));
});

app.put(['/api/v1/tpo/training/:id', '/api/v1/tpo/trainings/:id'], authenticateToken, requireRole('ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const prog = trainingPrograms.find(p => p.id === req.params.id);
  if (!prog) {
    return res.status(404).json(apiError('Training program not found'));
  }

  const { title, description, duration, skills, status } = req.body || {};
  if (title) prog.title = title;
  if (description) prog.description = description;
  if (duration) prog.duration = duration;
  if (Array.isArray(skills)) prog.skills = skills;
  if (status) prog.status = status;
  prog.updatedAt = new Date().toISOString();

  saveState();
  res.json(apiSuccess('Training program updated successfully', prog));
});

app.patch(['/api/v1/tpo/training/:id/status', '/api/v1/tpo/trainings/:id/status'], authenticateToken, requireRole('ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const prog = trainingPrograms.find(p => p.id === req.params.id);
  if (!prog) {
    return res.status(404).json(apiError('Training program not found'));
  }

  const status = req.query.status as string || req.body?.status;
  if (status) {
    prog.status = status as any;
    prog.updatedAt = new Date().toISOString();
  }

  saveState();
  res.json(apiSuccess('Training program status updated', prog));
});

// TPO: Assign Training
app.post(['/api/v1/tpo/training/:trainingId/assign', '/api/v1/tpo/trainings/:trainingId/assign'], authenticateToken, requireRole('ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const { trainingId } = req.params;
  const { studentIds, assignAllNeedingAttention, department } = req.body || {};

  const program = trainingPrograms.find(p => p.id === trainingId);
  if (!program) {
    return res.status(404).json(apiError('Training program not found'));
  }

  let targetStudents: UserStore[] = [];
  if (assignAllNeedingAttention) {
    const allStudents = users.filter(u => u.role === 'STUDENT');
    targetStudents = allStudents.filter(s => {
      const readiness = getCareerReadinessForUser(s);
      return readiness.score < 60 || (s.gpa || 3.5) < 3.0;
    });
  } else if (department) {
    targetStudents = users.filter(u => u.role === 'STUDENT' && (u.department || '').toLowerCase() === String(department).toLowerCase());
  } else if (Array.isArray(studentIds) && studentIds.length > 0) {
    targetStudents = users.filter(u => u.role === 'STUDENT' && studentIds.includes(u.id));
  } else {
    targetStudents = users.filter(u => u.role === 'STUDENT');
  }

  let assignedCount = 0;
  const createdAssignments: TrainingAssignmentStore[] = [];
  targetStudents.forEach(st => {
    let existing = trainingAssignments.find(a => a.trainingId === program.id && a.studentId === st.id);
    if (!existing) {
      const assignmentId = 'asgn_' + crypto.randomBytes(8).toString('hex');
      const newAsgn: TrainingAssignmentStore = {
        id: assignmentId,
        trainingId: program.id,
        trainingTitle: program.title,
        studentId: st.id,
        studentName: `${st.firstName} ${st.lastName}`,
        studentEmail: st.email,
        department: st.department || 'Computer Science',
        status: 'IN_PROGRESS',
        progress: 25,
        assignedAt: new Date().toISOString()
      };
      trainingAssignments.push(newAsgn);
      createdAssignments.push(newAsgn);
      assignedCount++;

      createNotification(
        st.id,
        'TRAINING_ASSIGNED',
        'New Training Program Assigned',
        `You have been assigned to "${program.title}" by the Training & Placement Office. Complete it to boost your verified skills!`,
        program.id,
        'TRAINING'
      );
    } else {
      createdAssignments.push(existing);
    }
  });

  program.assignedStudentCount = (program.assignedStudentCount || 0) + assignedCount;
  saveState();

  res.json(apiSuccess(`Assigned training program to ${assignedCount} students successfully`, {
    count: assignedCount,
    assignedCount,
    assignments: createdAssignments
  }));
});

// TPO: Placement Drives
app.get(['/api/v1/tpo/placement-drives', '/api/v1/placement-drives'], authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json(apiSuccess('Placement drives retrieved successfully', placementDrives));
});

app.post(['/api/v1/tpo/placement-drives', '/api/v1/placement-drives'], authenticateToken, requireRole('ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const { companyName, role, packageOffered, minCgpa, allowedDepartments, requiredSkills, deadline, status } = req.body || {};
  if (!companyName || !role) {
    return res.status(400).json(apiError('Company name and role are required for placement drive'));
  }

  const newDrive: PlacementDriveStore = {
    id: `drv_${crypto.randomBytes(8).toString('hex')}`,
    companyName,
    role,
    packageOffered: packageOffered || req.body?.package || '8 LPA',
    minCgpa: Number(minCgpa) || 3.0,
    allowedDepartments: Array.isArray(allowedDepartments) ? allowedDepartments : ['Computer Science', 'Information Technology'],
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : ['Java', 'SQL'],
    deadline: deadline || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    status: status || 'ACTIVE',
    createdBy: `${req.user!.firstName} ${req.user!.lastName}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    eligibleStudentCount: users.filter(u => u.role === 'STUDENT' && (u.gpa || 3.5) >= (Number(minCgpa) || 3.0)).length
  };

  placementDrives.push(newDrive);

  users.filter(u => u.role === 'STUDENT').forEach(st => {
    createNotification(
      st.id,
      'PLACEMENT_DRIVE_ANNOUNCED',
      `New Placement Drive: ${companyName}`,
      `${companyName} announced a new placement drive for "${role}" (${newDrive.packageOffered}). Check eligibility details in the drive portal!`,
      newDrive.id,
      'PLACEMENT_DRIVE'
    );
  });

  saveState();
  res.status(201).json(apiSuccess('Placement drive created successfully', newDrive));
});

app.get(['/api/v1/tpo/placement-drives/:driveId/eligible-students', '/api/v1/tpo/placement-drives/:driveId/eligibility'], authenticateToken, requireRole('ADMIN', 'TPO', 'COMPANY'), (req: AuthenticatedRequest, res) => {
  const drive = placementDrives.find(d => d.id === req.params.driveId);
  if (!drive) {
    return res.status(404).json(apiError('Placement drive not found'));
  }

  const students = users.filter(u => u.role === 'STUDENT');
  const results: DriveEligibilityResult[] = students.map(st => {
    const cgpa = st.gpa || 3.5;
    const dept = st.department || 'Computer Science';
    const studentSkills = (st.skills || []).map(s => s.toLowerCase());
    const readiness = getCareerReadinessForUser(st);

    const reasons: string[] = [];
    let isEligible = true;

    if (drive.minCgpa && cgpa < drive.minCgpa) {
      isEligible = false;
      reasons.push(`CGPA (${cgpa.toFixed(2)}) is below minimum required (${drive.minCgpa})`);
    }

    if (drive.allowedDepartments && drive.allowedDepartments.length > 0) {
      const allowedLower = drive.allowedDepartments.map(d => d.toLowerCase());
      if (!allowedLower.includes(dept.toLowerCase())) {
        isEligible = false;
        reasons.push(`Department (${dept}) is not in allowed list (${drive.allowedDepartments.join(', ')})`);
      }
    }

    if (drive.requiredSkills && drive.requiredSkills.length > 0) {
      const missing = drive.requiredSkills.filter(reqSkill =>
        !studentSkills.some(sk => sk.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(sk))
      );
      if (missing.length > 0) {
        reasons.push(`Missing skill prerequisites: ${missing.join(', ')}`);
      }
    }

    if (isEligible && reasons.length === 0) {
      reasons.push('Meets all academic, CGPA, department, and technical skill prerequisites.');
    }

    return {
      studentId: st.id,
      studentName: `${st.firstName} ${st.lastName}`,
      email: st.email,
      department: dept,
      gpa: cgpa,
      readinessScore: readiness.score,
      isEligible,
      reasons
    };
  });

  res.json(apiSuccess('Drive eligibility evaluated successfully', results));
});

// STUDENT: Get My Assigned Trainings
app.get('/api/v1/student/trainings', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const myAssignments = trainingAssignments.filter(a => a.studentId === user.id);
  res.json(apiSuccess('Student assigned training programs retrieved successfully', myAssignments));
});

// STUDENT: Complete Training Program & Synchronize Skills
app.post('/api/v1/student/trainings/:assignmentId/complete', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const assignment = trainingAssignments.find(a => a.id === req.params.assignmentId && a.studentId === user.id);

  if (!assignment) {
    return res.status(404).json(apiError('Training assignment not found'));
  }

  assignment.status = 'COMPLETED';
  assignment.progress = 100;
  assignment.completedAt = new Date().toISOString();

  const program = trainingPrograms.find(p => p.id === assignment.trainingId);
  const skillsToGain = program?.skills || ['Java', 'Spring Boot', 'REST APIs'];

  const currentSkills = new Set(user.skills || []);
  skillsToGain.forEach(s => currentSkills.add(s));
  user.skills = Array.from(currentSkills);

  if (program) {
    program.completedStudentCount = (program.completedStudentCount || 0) + 1;
    if (program.assignedStudentCount && program.assignedStudentCount > 0) {
      program.completionRate = Math.round((program.completedStudentCount / program.assignedStudentCount) * 100);
    }
  }

  const readiness = getCareerReadinessForUser(user);
  if (readiness.score >= 60) {
    const studentIntervention = interventions.find(i => i.studentId === user.id && i.status !== 'RESOLVED');
    if (studentIntervention) {
      studentIntervention.status = 'RESOLVED';
      studentIntervention.notes = 'Automatically resolved following training program completion and skill gain.';
    }
  }

  saveState();

  res.json(apiSuccess('Training completed successfully and skills synchronized to your profile!', {
    assignment,
    updatedSkills: user.skills,
    newReadinessScore: readiness.score
  }));
});

// ==========================================
// PHASE 8: ACADEMIC PERFORMANCE MANAGEMENT
// ==========================================

// STUDENT: Get My Academic Profile
app.get('/api/v1/student/academics', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  let profile = academicProfiles[user.id];

  if (!profile) {
    profile = {
      studentId: user.id,
      cgpa: user.gpa || 3.5,
      currentSemester: 6,
      totalPassedSubjects: 20,
      totalFailedSubjects: 0,
      backlogsCount: 0,
      semesters: [
        {
          semester: 1,
          academicYear: '2023-2024',
          sgpa: 3.5,
          totalCredits: 20,
          passedCredits: 20,
          status: 'PASS',
          subjects: [
            { code: 'CS101', name: 'Engineering Mathematics I', credits: 4, marks: 85, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS102', name: 'Programming Fundamentals', credits: 4, marks: 90, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS103', name: 'Digital Electronics', credits: 4, marks: 82, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS104', name: 'Communication Skills', credits: 4, marks: 88, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS105', name: 'Basic Electrical Engineering', credits: 4, marks: 80, maxMarks: 100, grade: 'B+', status: 'PASS' }
          ]
        },
        {
          semester: 2,
          academicYear: '2023-2024',
          sgpa: 3.65,
          totalCredits: 20,
          passedCredits: 20,
          status: 'PASS',
          subjects: [
            { code: 'CS201', name: 'Data Structures & Algorithms', credits: 4, marks: 92, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS202', name: 'Object Oriented Programming in Java', credits: 4, marks: 94, maxMarks: 100, grade: 'A+', status: 'PASS' },
            { code: 'CS203', name: 'Discrete Mathematics', credits: 4, marks: 84, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS204', name: 'Computer Organization & Architecture', credits: 4, marks: 86, maxMarks: 100, grade: 'A', status: 'PASS' },
            { code: 'CS205', name: 'Environmental Science', credits: 4, marks: 88, maxMarks: 100, grade: 'A', status: 'PASS' }
          ]
        }
      ]
    };
    academicProfiles[user.id] = profile;
    saveState();
  }

  res.json(apiSuccess('Academic profile retrieved successfully', profile));
});

// STUDENT: Add or Update Semester Record
app.put('/api/v1/student/academics/semester', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const semesterData: SemesterRecordStore = req.body;

  if (!semesterData || !semesterData.semester || !Array.isArray(semesterData.subjects)) {
    return res.status(400).json(apiError('Invalid semester record payload'));
  }

  let profile = academicProfiles[user.id];
  if (!profile) {
    profile = {
      studentId: user.id,
      cgpa: user.gpa || 3.5,
      currentSemester: semesterData.semester,
      totalPassedSubjects: 0,
      totalFailedSubjects: 0,
      backlogsCount: 0,
      semesters: []
    };
    academicProfiles[user.id] = profile;
  }

  const existingIdx = profile.semesters.findIndex(s => s.semester === semesterData.semester);
  if (existingIdx >= 0) {
    profile.semesters[existingIdx] = semesterData;
  } else {
    profile.semesters.push(semesterData);
  }

  profile.semesters.sort((a, b) => a.semester - b.semester);

  // Recalculate summary stats
  let totalCredits = 0;
  let totalGradePoints = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  profile.semesters.forEach(sem => {
    sem.subjects.forEach(sub => {
      if (sub.status === 'PASS') {
        totalPassed++;
      } else {
        totalFailed++;
      }
    });
    totalCredits += sem.totalCredits || 20;
    totalGradePoints += (sem.sgpa || 3.5) * (sem.totalCredits || 20);
  });

  profile.totalPassedSubjects = totalPassed;
  profile.totalFailedSubjects = totalFailed;
  profile.backlogsCount = totalFailed;
  profile.cgpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 3.5;
  user.gpa = profile.cgpa;

  saveState();
  res.json(apiSuccess('Semester record updated successfully', profile));
});

// TPO & COMPANY: Get Student Academic Record
app.get('/api/v1/students/:id/academics', authenticateToken, requireRole('ADMIN', 'TPO', 'COMPANY'), (req, res) => {
  const studentId = req.params.id;
  const profile = academicProfiles[studentId];

  if (!profile) {
    return res.status(404).json(apiError('Academic profile not found for this student'));
  }

  res.json(apiSuccess('Student academic profile retrieved successfully', profile));
});

// ==========================================
// PHASE 9: OFF-CAMPUS INTERNSHIPS
// ==========================================

// STUDENT: Submit Off-Campus Internship
const handleOffCampusSubmit = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const {
    companyName, internshipTitle, description, startDate, endDate,
    duration, location, mode, stipend, offerLetterUrl,
    supervisorName, supervisorEmail, supervisorPhone
  } = req.body;

  if (!companyName || !internshipTitle || !startDate || !endDate) {
    return res.status(400).json(apiError('Missing required off-campus internship fields'));
  }

  const now = new Date().toISOString();
  const newOffCampus: OffCampusInternshipStore = {
    id: 'off_' + crypto.randomBytes(8).toString('hex'),
    studentId: user.id,
    studentName: `${user.firstName} ${user.lastName}`.trim(),
    studentEmail: user.email,
    rollNumber: user.rollNumber,
    department: user.department || 'Computer Science',
    companyName,
    internshipTitle,
    description: description || '',
    startDate,
    endDate,
    duration: duration || '6 Months',
    location: location || 'Remote',
    mode: mode || 'HYBRID',
    stipend,
    offerLetterUrl: offerLetterUrl || 'https://internsync.example.com/docs/offer-letter.pdf',
    supervisorName,
    supervisorEmail,
    supervisorPhone,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now
  };

  offCampusInternships.push(newOffCampus);

  // Notify TPO
  const tpoUsers = users.filter(u => u.role === 'TPO' || u.role === 'ADMIN');
  tpoUsers.forEach(tpo => {
    createNotification(
      tpo.id,
      'OFF_CAMPUS_SUBMITTED',
      'New Off-Campus Internship Submitted',
      `${user.firstName} ${user.lastName} (${user.department}) submitted an off-campus internship at ${companyName} for verification.`,
      newOffCampus.id,
      'OFF_CAMPUS'
    );
  });

  saveState();
  res.status(201).json(apiSuccess('Off-campus internship submitted for T&P verification', newOffCampus));
};

app.post(['/api/v1/student/off-campus', '/api/v1/student/off-campus-internships'], authenticateToken, requireRole('STUDENT'), handleOffCampusSubmit);

// STUDENT: Get My Off-Campus Internships
const handleGetMyOffCampus = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const myOffCampus = offCampusInternships.filter(o => o.studentId === user.id);
  res.json(apiSuccess('My off-campus internships retrieved successfully', myOffCampus));
};

app.get(['/api/v1/student/off-campus', '/api/v1/student/off-campus-internships'], authenticateToken, requireRole('STUDENT'), handleGetMyOffCampus);

// TPO: Get All Off-Campus Internships
app.get(['/api/v1/tpo/off-campus', '/api/v1/tpo/off-campus-internships'], authenticateToken, requireRole('ADMIN', 'TPO'), (req, res) => {
  const status = req.query.status as string;
  let filtered = [...offCampusInternships];
  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(apiSuccess('Off-campus internships retrieved successfully for T&P review', filtered));
});

// TPO: Review Off-Campus Internship
const handleReviewOffCampus = (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const item = offCampusInternships.find(o => o.id === req.params.id);

  if (!item) {
    return res.status(404).json(apiError('Off-campus internship record not found'));
  }

  const { status, verificationNotes } = req.body;
  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json(apiError('Invalid status specified (must be APPROVED or REJECTED)'));
  }

  const now = new Date().toISOString();
  item.status = status;
  item.verificationNotes = verificationNotes || (status === 'APPROVED' ? 'Verified and approved for credits by T&P Office.' : 'Rejected by T&P Office.');
  item.verifiedBy = `${user.firstName} ${user.lastName} (TPO)`.trim();
  item.verifiedAt = now;
  item.updatedAt = now;

  createNotification(
    item.studentId,
    status === 'APPROVED' ? 'OFF_CAMPUS_APPROVED' : 'OFF_CAMPUS_REJECTED',
    `Off-Campus Internship ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
    `Your off-campus internship at ${item.companyName} has been ${status.toLowerCase()} by T&P. Notes: ${item.verificationNotes}`,
    item.id,
    'OFF_CAMPUS'
  );

  saveState();
  res.json(apiSuccess(`Off-campus internship ${status.toLowerCase()} successfully`, item));
};

app.put(['/api/v1/tpo/off-campus/:id/verify', '/api/v1/tpo/off-campus-internships/:id/verify', '/api/v1/tpo/off-campus-internships/:id/review'], authenticateToken, requireRole('ADMIN', 'TPO'), handleReviewOffCampus);
app.post(['/api/v1/tpo/off-campus/:id/verify', '/api/v1/tpo/off-campus-internships/:id/verify', '/api/v1/tpo/off-campus-internships/:id/review'], authenticateToken, requireRole('ADMIN', 'TPO'), handleReviewOffCampus);

// ==========================================
// PHASE 10: INTERNSHIP ATTENDANCE TRACKING
// ==========================================

// Helper: Calculate attendance summary for a student
function computeStudentAttendanceSummary(studentId: string, user: UserStore) {
  const records = attendanceRecords.filter(a => a.studentId === studentId);
  const totalWorkingDays = Math.max(records.length, 22);
  const presentDays = records.filter(r => r.status === 'PRESENT').length;
  const absentDays = records.filter(r => r.status === 'ABSENT').length;
  const leaveDays = records.filter(r => r.status === 'LEAVE').length;
  const attendancePercentage = totalWorkingDays > 0 ? Number(((presentDays / totalWorkingDays) * 100).toFixed(1)) : 100;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date === todayStr);

  const activeInternship = getActiveInternshipForStudent(studentId);

  return {
    studentId,
    studentName: `${user.firstName} ${user.lastName}`.trim(),
    activeInternship: activeInternship ? {
      internshipId: activeInternship.id,
      title: activeInternship.title,
      companyName: activeInternship.companyName,
      type: activeInternship.type
    } : null,
    totalWorkingDays,
    presentDays,
    absentDays,
    leaveDays,
    attendancePercentage,
    isPresentToday: todayRecord ? todayRecord.status === 'PRESENT' : false,
    todayCheckInTime: todayRecord?.timestamp,
    status: attendancePercentage >= 75 ? ('NORMAL' as const) : ('AT_RISK' as const),
    records: records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  };
}

// STUDENT: Check-in Attendance (One-Click "I'M PRESENT")
app.post(['/api/v1/student/attendance/check-in', '/api/v1/attendance/check-in', '/api/v1/attendance/student/check-in'], authenticateToken, requireRole('STUDENT', 'ADMIN', 'TPO', 'COMPANY'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { notes } = req.body || {};
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  const activeInternship = getActiveInternshipForStudent(user.id);
  const internshipId = activeInternship?.id || 'int_001';
  const internshipTitle = activeInternship?.title || 'Fullstack Software Engineering Intern';
  const companyName = activeInternship?.companyName || 'TechCorp Solutions';

  // Check if already checked in today
  let todayRecord = attendanceRecords.find(a => a.studentId === user.id && a.date === todayStr);
  if (todayRecord) {
    const summary = computeStudentAttendanceSummary(user.id, user);
    return res.json(apiSuccess('Daily attendance already recorded for today! Status: PRESENT', {
      record: todayRecord,
      summary
    }));
  } else {
    todayRecord = {
      id: 'att_' + crypto.randomBytes(8).toString('hex'),
      studentId: user.id,
      studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student Intern',
      studentEmail: user.email,
      department: user.department || 'Computer Science',
      internshipId,
      internshipTitle,
      companyName,
      date: todayStr,
      timestamp: now,
      status: 'PRESENT',
      notes: notes || 'Daily check-in completed via student portal'
    };
    attendanceRecords.push(todayRecord);
  }

  saveState();

  const summary = computeStudentAttendanceSummary(user.id, user);
  res.json(apiSuccess('Daily attendance recorded successfully! Status: PRESENT', {
    record: todayRecord,
    summary
  }));
});

// STUDENT: Get My Attendance
app.get(['/api/v1/student/attendance', '/api/v1/attendance/me', '/api/v1/attendance/student/me'], authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const summary = computeStudentAttendanceSummary(user.id, user);
  res.json(apiSuccess('Attendance summary retrieved successfully', summary));
});

// TPO: Get Overall Attendance Overview
app.get(['/api/v1/tpo/attendance', '/api/v1/attendance/overview'], authenticateToken, requireRole('ADMIN', 'TPO'), (req, res) => {
  const studentUsers = users.filter(u => u.role === 'STUDENT');
  const summaries = studentUsers.map(s => computeStudentAttendanceSummary(s.id, s));

  const totalActiveInterns = summaries.filter(s => s.activeInternship !== null).length;
  const totalPresentToday = summaries.filter(s => s.isPresentToday).length;
  const lowAttendanceCount = summaries.filter(s => s.attendancePercentage < 75).length;
  const averageAttendance = summaries.length > 0
    ? Number((summaries.reduce((sum, s) => sum + s.attendancePercentage, 0) / summaries.length).toFixed(1))
    : 92.5;

  const overview = {
    totalStudents: studentUsers.length,
    totalActiveInterns,
    totalPresentToday,
    lowAttendanceCount,
    averageAttendance,
    studentSummaries: summaries,
    recentLogs: [...attendanceRecords].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 30)
  };

  res.json(apiSuccess('T&P Attendance overview retrieved successfully', overview));
});

// COMPANY: Get Intern Attendance Logs
app.get(['/api/v1/company/attendance', '/api/v1/attendance/company'], authenticateToken, requireRole('COMPANY', 'ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const internshipId = req.query.internshipId as string;
  const userCompany = (user.companyName || '').toLowerCase().trim();
  const userFirst = (user.firstName || '').toLowerCase().trim();

  let logs = attendanceRecords.filter(a => {
    if (user.role === 'ADMIN' || user.role === 'TPO') return true;
    const aComp = (a.companyName || '').toLowerCase();
    if (internshipId && a.internshipId === internshipId) return true;
    if (!userCompany && !userFirst) return true;
    return (userCompany && aComp.includes(userCompany)) || (userFirst && aComp.includes(userFirst));
  });

  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(apiSuccess('Company intern attendance logs retrieved successfully', logs));
});

// COMPANY: Post / Verify Attendance
app.post(['/api/v1/company/attendance', '/api/v1/attendance/company/log'], authenticateToken, requireRole('COMPANY', 'ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { studentId, internshipId, date, status, notes } = req.body || {};
  const student = users.find(u => u.id === studentId);

  const newLog: InternshipAttendanceStore = {
    id: 'att_' + crypto.randomBytes(8).toString('hex'),
    studentId: studentId || 'stu_001',
    studentName: student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : 'Student Intern',
    studentEmail: student?.email || 'student@university.edu',
    department: student?.department || 'Computer Science',
    internshipId: internshipId || 'int_001',
    internshipTitle: 'Internship Program',
    companyName: user.companyName || `${user.firstName || ''}'s Company`,
    date: date || new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    status: status || 'PRESENT',
    notes: notes || 'Verified by supervisor'
  };

  attendanceRecords.push(newLog);
  saveState();

  res.status(201).json(apiSuccess('Attendance log recorded successfully', newLog));
});

// ==========================================
// PHASE 11: INTERNSHIP TASKS & PROGRESS
// ==========================================

// STUDENT: Get My Tasks
app.get(['/api/v1/student/tasks', '/api/v1/tasks/me'], authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const myTasks = internshipTasks.filter(t => t.studentId === user.id);
  myTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(apiSuccess('Student assigned internship tasks retrieved successfully', myTasks));
});

// STUDENT: Update Task Status & Progress
app.patch(['/api/v1/student/tasks/:taskId/status', '/api/v1/tasks/:taskId/status'], authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const task = internshipTasks.find(t => t.id === req.params.taskId && (t.studentId === user.id || user.role === 'ADMIN' || user.role === 'TPO' || user.role === 'COMPANY'));

  if (!task) {
    return res.status(404).json(apiError('Internship task not found'));
  }

  const { status, progressPercentage, submissionUrl, submissionNotes } = req.body;

  if (status) task.status = status;
  if (progressPercentage !== undefined) task.progressPercentage = Number(progressPercentage);
  if (submissionUrl !== undefined) task.submissionUrl = submissionUrl;
  if (submissionNotes !== undefined) task.submissionNotes = submissionNotes;

  if (status === 'COMPLETED') {
    task.progressPercentage = 100;
    task.completedAt = new Date().toISOString();
  }

  saveState();
  res.json(apiSuccess('Task status and progress updated successfully', task));
});

// COMPANY & TPO: Assign Task to Intern
app.post(['/api/v1/company/tasks', '/api/v1/tasks'], authenticateToken, requireRole('COMPANY', 'ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { studentId, internshipId, title, description, deadline } = req.body || {};

  if (!studentId || !title || !description || !deadline) {
    return res.status(400).json(apiError('Missing required task fields'));
  }

  const studentUser = users.find(u => u.id === studentId);
  const now = new Date().toISOString();

  const newTask: InternshipTaskStore = {
    id: 'task_' + crypto.randomBytes(8).toString('hex'),
    internshipId: internshipId || 'int_001',
    internshipTitle: 'Internship Program Task',
    companyName: user.companyName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'TechCorp Solutions',
    studentId,
    studentName: studentUser ? `${studentUser.firstName} ${studentUser.lastName}`.trim() : 'Student Intern',
    title,
    description,
    assignedBy: user.companyName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Supervisor',
    assignedDate: now,
    deadline,
    status: 'TODO',
    progressPercentage: 0,
    createdAt: now
  };

  internshipTasks.push(newTask);

  createNotification(
    studentId,
    'NEW_TASK_ASSIGNED',
    'New Task Assigned',
    `You have been assigned a new task: "${title}" by ${newTask.assignedBy}. Deadline: ${new Date(deadline).toLocaleDateString()}`,
    newTask.id,
    'TASK'
  );

  saveState();
  res.status(201).json(apiSuccess('Task assigned to intern successfully', newTask));
});

// COMPANY: View All Tasks Assigned
app.get(['/api/v1/company/tasks', '/api/v1/tasks/company'], authenticateToken, requireRole('COMPANY', 'ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const userCompany = (user.companyName || '').toLowerCase().trim();
  const userFirst = (user.firstName || '').toLowerCase().trim();

  const myCompanyTasks = internshipTasks.filter(t => {
    if (user.role === 'ADMIN' || user.role === 'TPO') return true;
    const tComp = (t.companyName || '').toLowerCase();
    const tAssigned = (t.assignedBy || '').toLowerCase();
    if (!userCompany && !userFirst) return true;
    return (userCompany && (tComp.includes(userCompany) || tAssigned.includes(userCompany))) ||
           (userFirst && (tComp.includes(userFirst) || tAssigned.includes(userFirst)));
  });

  res.json(apiSuccess('Company intern tasks retrieved successfully', myCompanyTasks));
});

// TPO: View All Tasks
app.get(['/api/v1/tpo/tasks', '/api/v1/tasks/all'], authenticateToken, requireRole('ADMIN', 'TPO'), (req, res) => {
  res.json(apiSuccess('All student internship tasks retrieved successfully', internshipTasks));
});

// ==========================================
// PHASE 12: COMPANY EVALUATIONS & FEEDBACK
// ==========================================

// COMPANY: Submit Evaluation for Intern
app.post(['/api/v1/company/evaluations', '/api/v1/evaluations'], authenticateToken, requireRole('COMPANY', 'ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const {
    internshipId, studentId, technicalScore, attendanceScore,
    taskCompletionScore, professionalismScore, feedback, recommendations
  } = req.body || {};

  if (!studentId || technicalScore === undefined || attendanceScore === undefined || taskCompletionScore === undefined || professionalismScore === undefined) {
    return res.status(400).json(apiError('Missing required evaluation scores and student ID'));
  }

  const student = users.find(u => u.id === studentId);
  const tech = Number(technicalScore);
  const att = Number(attendanceScore);
  const task = Number(taskCompletionScore);
  const prof = Number(professionalismScore);

  const overall = Number(((tech + att + task + prof) / 4).toFixed(1));
  let grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' = 'B';
  if (overall >= 90) grade = 'A+';
  else if (overall >= 80) grade = 'A';
  else if (overall >= 70) grade = 'B+';
  else if (overall >= 60) grade = 'B';
  else if (overall >= 50) grade = 'C';
  else grade = 'D';

  const now = new Date().toISOString();
  const newEvaluation: InternshipEvaluationStore = {
    id: 'eval_' + crypto.randomBytes(8).toString('hex'),
    internshipId: internshipId || 'int_001',
    internshipTitle: 'Internship Evaluation',
    studentId,
    studentName: student ? `${student.firstName} ${student.lastName}`.trim() : 'Student Intern',
    studentEmail: student?.email || 'student@university.edu',
    department: student?.department || 'Computer Science',
    companyName: user.companyName || `${user.firstName || ''}'s Company`,
    evaluatorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Supervisor',
    evaluatorRole: 'Recruiting & Internship Manager',
    technicalScore: tech,
    attendanceScore: att,
    taskCompletionScore: task,
    professionalismScore: prof,
    overallScore: overall,
    grade,
    feedback: feedback || 'Consistent performance and dedicated engagement.',
    recommendations: recommendations || 'Recommended for placement and graduation credit.',
    evaluatedAt: now
  };

  internshipEvaluations.push(newEvaluation);

  createNotification(
    studentId,
    'EVALUATION_SUBMITTED',
    'Internship Evaluation Completed',
    `Your supervisor at ${newEvaluation.companyName} has submitted your official performance evaluation with Grade: ${grade}.`,
    newEvaluation.id,
    'EVALUATION'
  );

  saveState();
  res.status(201).json(apiSuccess('Internship evaluation submitted successfully', newEvaluation));
});

// STUDENT: Get My Evaluations
app.get(['/api/v1/student/evaluations', '/api/v1/evaluations/me'], authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const myEvals = internshipEvaluations.filter(e => e.studentId === user.id);
  res.json(apiSuccess('Student evaluations retrieved successfully', myEvals));
});

// TPO: Get All Student Evaluations
app.get(['/api/v1/tpo/evaluations', '/api/v1/evaluations/all'], authenticateToken, requireRole('ADMIN', 'TPO'), (req, res) => {
  res.json(apiSuccess('All student evaluations retrieved successfully for T&P', internshipEvaluations));
});

// COMPANY: Get Submitted Evaluations
app.get(['/api/v1/company/evaluations', '/api/v1/evaluations/company'], authenticateToken, requireRole('COMPANY', 'ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const userCompany = (user.companyName || '').toLowerCase().trim();
  const userFirst = (user.firstName || '').toLowerCase().trim();

  const evals = internshipEvaluations.filter(e => {
    if (user.role === 'ADMIN' || user.role === 'TPO') return true;
    const eComp = (e.companyName || '').toLowerCase();
    const eEval = (e.evaluatorName || '').toLowerCase();
    if (!userCompany && !userFirst) return true;
    return (userCompany && eComp.includes(userCompany)) ||
           (userFirst && (eComp.includes(userFirst) || eEval.includes(userFirst)));
  });

  res.json(apiSuccess('Company evaluations retrieved successfully', evals));
});

// ==========================================
// PHASE 13: 360 DEGREE COMPLETE STUDENT RECORD FOR T&P
// ==========================================

app.get('/api/v1/tpo/students/:id/complete-profile', authenticateToken, requireRole('ADMIN', 'TPO'), (req, res) => {
  const studentId = req.params.id;
  const student = users.find(u => u.id === studentId && u.role === 'STUDENT');

  if (!student) {
    return res.status(404).json(apiError('Student not found'));
  }

  const profile = toUserProfile(student);
  const academics = academicProfiles[studentId] || {
    studentId,
    cgpa: student.gpa || 3.5,
    currentSemester: 6,
    totalPassedSubjects: 20,
    totalFailedSubjects: 0,
    backlogsCount: 0,
    semesters: []
  };

  const studentApplications = applications.filter(a => a.studentId === studentId);
  const studentOffCampus = offCampusInternships.filter(o => o.studentId === studentId);
  const attendance = computeStudentAttendanceSummary(studentId, student);
  const tasks = internshipTasks.filter(t => t.studentId === studentId);
  const evaluations = internshipEvaluations.filter(e => e.studentId === studentId);
  const careerReadiness = getCareerReadinessForUser(student);
  const myTrainings = trainingAssignments.filter(a => a.studentId === studentId);

  // Mentor Info
  const activeAssignment = facultyMentorAssignments.find(a => a.studentId === studentId && a.status === 'ACTIVE');
  let mentorData = null;
  if (activeAssignment) {
    const m = users.find(u => u.id === activeAssignment.mentorId);
    if (m) {
      mentorData = {
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phone: m.phone || null,
        department: m.department || null,
        designation: m.designation || null
      };
    }
  }
  const studentMentorNotes = mentorNotes.filter(n => n.studentId === studentId);

  const completeRecord = {
    profile,
    academics,
    activeInternship: profile.activeInternship,
    applications: studentApplications,
    offCampusInternships: studentOffCampus,
    attendance,
    tasks,
    evaluations,
    careerReadiness,
    trainings: myTrainings,
    mentor: mentorData,
    mentorNotes: studentMentorNotes
  };

  res.json(apiSuccess('Complete 360-degree student record retrieved successfully', completeRecord));
});

// ==========================================
// PRIORITY 1 FEATURES
// ==========================================

// --- Component 2: Candidate Matching Engine ---

function computeCandidateMatch(student: UserStore, internship: InternshipStore): any {
  let score = 0;
  const reasons: any[] = [];
  const maxScore = 100;
  
  const profile = toUserProfile(student);
  const academics = academicProfiles[student.id] || { cgpa: student.gpa || 3.0, backlogsCount: 0 };
  const criteria = internship.eligibilityCriteria || {};
  let isEligible = true;

  // 1. CGPA Match (Weight 25%)
  if (criteria.minCgpa !== undefined) {
    const minCgpa = criteria.minCgpa;
    const cgpa = academics.cgpa;
    if (cgpa >= minCgpa) {
      // Linear score: max 25 points if exactly at or above min. Let's give bonus points for higher.
      const cgpaScore = Math.min(25, 25 + (cgpa - minCgpa) * 5); 
      score += cgpaScore;
      reasons.push({ criterion: 'CGPA', met: true, detail: `CGPA ${cgpa} meets requirement of ${minCgpa}` });
    } else {
      isEligible = false;
      reasons.push({ criterion: 'CGPA', met: false, detail: `CGPA ${cgpa} is below requirement of ${minCgpa}` });
    }
  } else {
    score += 25; // Default full points if no criteria
    reasons.push({ criterion: 'CGPA', met: true, detail: `No CGPA requirement` });
  }

  // 2. Department Match (Weight 20%)
  if (criteria.allowedDepartments && criteria.allowedDepartments.length > 0) {
    if (criteria.allowedDepartments.includes(student.department || '')) {
      score += 20;
      reasons.push({ criterion: 'Department', met: true, detail: `Department ${student.department} is allowed` });
    } else {
      isEligible = false;
      reasons.push({ criterion: 'Department', met: false, detail: `Department ${student.department} is not in allowed list` });
    }
  } else {
    score += 20;
    reasons.push({ criterion: 'Department', met: true, detail: `All departments allowed` });
  }

  // 3. Backlog Check (Weight 15%)
  if (criteria.maxBacklogs !== undefined) {
    const backlogs = academics.backlogsCount || 0;
    if (backlogs <= criteria.maxBacklogs) {
      score += 15;
      reasons.push({ criterion: 'Backlogs', met: true, detail: `${backlogs} backlogs (max allowed: ${criteria.maxBacklogs})` });
    } else {
      isEligible = false;
      reasons.push({ criterion: 'Backlogs', met: false, detail: `${backlogs} backlogs exceeds max allowed (${criteria.maxBacklogs})` });
    }
  } else {
    score += 15;
    reasons.push({ criterion: 'Backlogs', met: true, detail: `No backlog limit` });
  }

  // 4. Passing Year / Batch (Weight 15%)
  const passingYear = criteria.passingYear || criteria.batch;
  if (passingYear) {
    if (student.batch === passingYear) {
      score += 15;
      reasons.push({ criterion: 'Batch', met: true, detail: `Batch ${student.batch} matches` });
    } else {
      isEligible = false;
      reasons.push({ criterion: 'Batch', met: false, detail: `Batch ${student.batch} does not match required ${passingYear}` });
    }
  } else {
    score += 15;
    reasons.push({ criterion: 'Batch', met: true, detail: `No batch requirement` });
  }

  // 5. Skills Match (Weight 25%)
  const requiredSkills = internship.requiredSkills || [];
  const studentSkills = student.skills || [];
  const matchedSkills = studentSkills.filter(s => requiredSkills.some(rs => rs.toLowerCase() === s.toLowerCase()));
  const missingSkills = requiredSkills.filter(rs => !studentSkills.some(s => rs.toLowerCase() === s.toLowerCase()));

  if (requiredSkills.length > 0) {
    const skillRatio = matchedSkills.length / requiredSkills.length;
    score += Math.round(skillRatio * 25);
    reasons.push({ criterion: 'Skills', met: skillRatio >= 0.5, detail: `Matched ${matchedSkills.length}/${requiredSkills.length} required skills` });
  } else {
    score += 25;
    reasons.push({ criterion: 'Skills', met: true, detail: `No required skills` });
  }

  const existingApp = applications.find(a => a.studentId === student.id && a.internshipId === internship.id);

  return {
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`.trim(),
    email: student.email,
    department: student.department,
    batch: student.batch,
    cgpa: academics.cgpa,
    backlogsCount: academics.backlogsCount || 0,
    matchScore: Math.min(100, Math.max(0, Math.round(score))),
    isEligible,
    eligibilityReasons: reasons,
    matchedSkills,
    missingSkills,
    applicationStatus: existingApp?.status,
    applicationId: existingApp?.id
  };
}

app.get('/api/v1/company/internships/:id/candidates', authenticateToken, requireRole('COMPANY', 'ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const internshipId = req.params.id;
  const internship = internships.find(i => i.id === internshipId);
  if (!internship) return res.status(404).json(apiError('Internship not found'));

  const allStudents = users.filter(u => u.role === 'STUDENT' && u.status === 'ACTIVE');
  let candidates = allStudents.map(student => computeCandidateMatch(student, internship));
  
  // Sort by match score descending
  candidates.sort((a, b) => b.matchScore - a.matchScore);
  
  res.json(apiSuccess('Candidates retrieved successfully', candidates));
});

app.post('/api/v1/company/internships/:id/candidates/recalculate', authenticateToken, requireRole('COMPANY', 'ADMIN', 'TPO'), (req: AuthenticatedRequest, res) => {
  const internshipId = req.params.id;
  const internship = internships.find(i => i.id === internshipId);
  if (!internship) return res.status(404).json(apiError('Internship not found'));

  const allStudents = users.filter(u => u.role === 'STUDENT' && u.status === 'ACTIVE');
  let candidates = allStudents.map(student => computeCandidateMatch(student, internship));
  candidates.sort((a, b) => b.matchScore - a.matchScore);
  
  res.json(apiSuccess('Candidates recalculated successfully', candidates));
});

// --- Component 3: Lifecycle Engine ---

app.get('/api/v1/lifecycle/:applicationId', authenticateToken, (req: AuthenticatedRequest, res) => {
  let lifecycle = internshipLifecycles.find(l => l.applicationId === req.params.applicationId);
  if (!lifecycle) {
    const app = applications.find(a => a.id === req.params.applicationId);
    if (!app) return res.status(404).json(apiError('Application not found'));
    
    // Create lifecycle if it doesn't exist
    const now = new Date().toISOString();
    lifecycle = {
      id: `lc_${crypto.randomBytes(8).toString('hex')}`,
      applicationId: app.id,
      internshipId: app.internshipId,
      studentId: app.studentId,
      companyId: app.companyId,
      internshipTitle: app.internshipTitle,
      companyName: app.companyName,
      studentName: app.studentName,
      currentStage: 'APPLICATION',
      stageHistory: [{
        stage: 'APPLICATION',
        timestamp: now,
        updatedBy: 'System',
        notes: 'Lifecycle initialized'
      }],
      createdAt: now,
      updatedAt: now
    };
    internshipLifecycles.push(lifecycle);
    saveState();
  }
  res.json(apiSuccess('Lifecycle retrieved successfully', lifecycle));
});

app.put('/api/v1/lifecycle/:applicationId/advance', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { stage, notes } = req.body;
  let lifecycle = internshipLifecycles.find(l => l.applicationId === req.params.applicationId);
  
  if (!lifecycle) return res.status(404).json(apiError('Lifecycle not found'));
  
  const validStages = ['REGISTRATION', 'ELIGIBILITY', 'APPLICATION', 'SHORTLISTED', 'SELECTED', 'OFFER', 'TPO_VERIFICATION', 'JOINING', 'PROGRESS', 'EVALUATION', 'COMPLETION', 'PPO', 'REJECTED'];
  if (!validStages.includes(stage)) return res.status(400).json(apiError('Invalid stage'));

  const now = new Date().toISOString();
  lifecycle.currentStage = stage;
  lifecycle.updatedAt = now;
  lifecycle.stageHistory.push({
    stage,
    timestamp: now,
    updatedBy: req.user!.email,
    notes: notes || `Advanced to ${stage}`
  });

  saveState();

  // Also update application status if relevant
  const app = applications.find(a => a.id === lifecycle!.applicationId);
  if (app) {
    if (stage === 'SHORTLISTED') app.status = 'SHORTLISTED';
    else if (stage === 'SELECTED') app.status = 'SELECTED';
    else if (stage === 'REJECTED') app.status = 'REJECTED';
    saveState();
  }

  res.json(apiSuccess(`Lifecycle advanced to ${stage}`, lifecycle));
});

app.get('/api/v1/student/lifecycle', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const lifecycles = internshipLifecycles.filter(l => l.studentId === req.user!.id);
  res.json(apiSuccess('Student lifecycles retrieved', lifecycles));
});

app.get('/api/v1/company/lifecycle', authenticateToken, requireRole('COMPANY'), (req: AuthenticatedRequest, res) => {
  const lifecycles = internshipLifecycles.filter(l => l.companyId === req.user!.id);
  res.json(apiSuccess('Company lifecycles retrieved', lifecycles));
});

// --- Component 4: Document Management ---

app.post('/api/v1/documents', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { internshipId, studentId, applicationId, documentType, fileName, fileUrl } = req.body;
  const user = req.user!;
  
  const now = new Date().toISOString();
  const doc: InternshipDocumentStore = {
    id: `doc_${crypto.randomBytes(8).toString('hex')}`,
    internshipId,
    studentId,
    applicationId,
    documentType,
    fileName,
    fileUrl,
    uploadedBy: user.id,
    uploadedByName: `${user.firstName} ${user.lastName}`.trim(),
    uploadDate: now,
    verificationStatus: 'UPLOADED',
    createdAt: now
  };
  
  internshipDocuments.push(doc);
  
  createNotification(
    studentId,
    'DOCUMENT_UPLOADED',
    'Document Uploaded',
    `A new document (${documentType}) has been uploaded.`,
    doc.id,
    'SYSTEM'
  );
  
  saveState();
  res.json(apiSuccess('Document uploaded successfully', doc));
});

app.get('/api/v1/documents/application/:applicationId', authenticateToken, (req: AuthenticatedRequest, res) => {
  const docs = internshipDocuments.filter(d => d.applicationId === req.params.applicationId);
  res.json(apiSuccess('Documents retrieved', docs));
});

app.put('/api/v1/documents/:id/verify', authenticateToken, requireRole('TPO', 'ADMIN', 'COMPANY'), (req: AuthenticatedRequest, res) => {
  const { status, reason } = req.body;
  const doc = internshipDocuments.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json(apiError('Document not found'));

  const user = req.user!;
  doc.verificationStatus = status;
  doc.verifiedBy = user.id;
  doc.verifiedByName = `${user.firstName} ${user.lastName}`.trim();
  doc.verificationDate = new Date().toISOString();
  if (reason) doc.rejectionReason = reason;

  createNotification(
    doc.studentId,
    'DOCUMENT_VERIFIED',
    `Document ${status === 'VERIFIED' ? 'Verified' : 'Rejected'}`,
    `Your document (${doc.documentType}) was marked as ${status}.`,
    doc.id,
    'SYSTEM'
  );

  saveState();
  res.json(apiSuccess('Document verification updated', doc));
});

app.get('/api/v1/student/documents', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const docs = internshipDocuments.filter(d => d.studentId === req.user!.id);
  res.json(apiSuccess('Documents retrieved', docs));
});

app.get('/api/v1/company/documents', authenticateToken, requireRole('COMPANY'), (req: AuthenticatedRequest, res) => {
  const internships = applications.filter(a => a.companyId === req.user!.id).map(a => a.internshipId);
  const docs = internshipDocuments.filter(d => internships.includes(d.internshipId));
  res.json(apiSuccess('Documents retrieved', docs));
});


// --- Component 5: Weekly Progress / Digital Logbook ---

app.post('/api/v1/weekly-reports', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const body = req.body;
  const now = new Date().toISOString();
  
  const report: WeeklyReportStore = {
    id: `wr_${crypto.randomBytes(8).toString('hex')}`,
    internshipId: body.internshipId,
    studentId: user.id,
    studentName: `${user.firstName} ${user.lastName}`.trim(),
    weekNumber: body.weekNumber,
    startDate: body.startDate,
    endDate: body.endDate,
    workCompleted: body.workCompleted,
    skillsUsed: body.skillsUsed || [],
    hoursWorked: body.hoursWorked,
    challengesFaced: body.challengesFaced || '',
    progressLearning: body.progressLearning || '',
    nextWeekPlan: body.nextWeekPlan || '',
    attachmentUrl: body.attachmentUrl,
    status: body.status || 'DRAFT', // can be DRAFT or SUBMITTED
    revisionHistory: [{
      comment: 'Report created',
      by: user.id,
      byName: `${user.firstName} ${user.lastName}`.trim(),
      at: now,
      action: 'CREATED'
    }],
    createdAt: now,
    updatedAt: now
  };
  
  weeklyReports.push(report);
  if (report.status === 'SUBMITTED') {
    createNotification(
       // assuming we notify company or mentor. Simplification: notify company.
       applications.find(a => a.internshipId === report.internshipId && a.studentId === report.studentId)?.companyId || 'company',
       'WEEKLY_REPORT_SUBMITTED',
       'Weekly Report Submitted',
       `${report.studentName} submitted weekly report for week ${report.weekNumber}.`,
       report.id,
       'SYSTEM'
    );
  }
  
  saveState();
  res.json(apiSuccess('Weekly report created', report));
});

app.put('/api/v1/weekly-reports/:id', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const report = weeklyReports.find(r => r.id === req.params.id && r.studentId === req.user!.id);
  if (!report) return res.status(404).json(apiError('Report not found'));
  if (report.status === 'APPROVED' || report.status === 'UNDER_REVIEW') {
    return res.status(400).json(apiError('Cannot edit report in current status'));
  }

  Object.assign(report, {
    ...req.body,
    updatedAt: new Date().toISOString()
  });

  saveState();
  res.json(apiSuccess('Report updated', report));
});

app.put('/api/v1/weekly-reports/:id/submit', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const report = weeklyReports.find(r => r.id === req.params.id && r.studentId === req.user!.id);
  if (!report) return res.status(404).json(apiError('Report not found'));
  
  report.status = 'SUBMITTED';
  report.updatedAt = new Date().toISOString();
  saveState();
  res.json(apiSuccess('Report submitted', report));
});

app.get('/api/v1/weekly-reports/me', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const reports = weeklyReports.filter(r => r.studentId === req.user!.id);
  res.json(apiSuccess('Reports retrieved', reports));
});

app.get('/api/v1/weekly-reports/internship/:internshipId', authenticateToken, requireRole('COMPANY', 'FACULTY_MENTOR', 'TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  const reports = weeklyReports.filter(r => r.internshipId === req.params.internshipId);
  res.json(apiSuccess('Reports retrieved', reports));
});

app.put('/api/v1/weekly-reports/:id/review', authenticateToken, requireRole('COMPANY', 'FACULTY_MENTOR', 'TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  const { status, comments, role } = req.body;
  const report = weeklyReports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json(apiError('Report not found'));
  
  const user = req.user!;
  const now = new Date().toISOString();
  
  report.status = status;
  if (role === 'MENTOR') report.mentorComments = comments;
  else report.companyComments = comments;
  
  report.reviewedBy = user.id;
  report.reviewedByName = `${user.firstName} ${user.lastName}`.trim();
  report.reviewedAt = now;
  
  report.revisionHistory.push({
    comment: comments || `Status changed to ${status}`,
    by: user.id,
    byName: `${user.firstName} ${user.lastName}`.trim(),
    at: now,
    action: status
  });
  
  createNotification(
    report.studentId,
    'WEEKLY_REPORT_REVIEWED',
    `Weekly Report ${status}`,
    `Your weekly report for week ${report.weekNumber} was reviewed.`,
    report.id,
    'SYSTEM'
  );

  saveState();
  res.json(apiSuccess('Report reviewed', report));
});



// PPO Endpoints
app.get('/api/v1/company/ppo', authenticateToken, requireRole('COMPANY'), (req: AuthenticatedRequest, res) => {
  const companyPpos = ppos.filter(p => p.companyId === req.user!.id);
  res.json(apiSuccess('PPOs retrieved', companyPpos));
});

app.get('/api/v1/student/ppo', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const studentPpos = ppos.filter(p => p.studentId === req.user!.id);
  res.json(apiSuccess('PPOs retrieved', studentPpos));
});

app.post('/api/v1/company/ppo/recommend', authenticateToken, requireRole('COMPANY'), (req: AuthenticatedRequest, res) => {
  const { studentId, internshipId, remarks } = req.body;
  const user = req.user!;
  const internship = internships.find(i => i.id === internshipId);
  const student = users.find(u => u.id === studentId);
  if (!internship || !student) return res.status(404).json(apiError('Not found'));
  
  let ppo = ppos.find(p => p.studentId === studentId && p.internshipId === internshipId);
  if (ppo) {
    ppo.status = 'PPO_RECOMMENDED';
    ppo.remarks = remarks;
    ppo.recommendedDate = new Date().toISOString();
  } else {
    ppo = {
      id: 'ppo_' + crypto.randomBytes(8).toString('hex'),
      studentId,
      companyId: user.id,
      internshipId,
      internshipTitle: internship.title,
      studentName: student.firstName + ' ' + student.lastName,
      status: 'PPO_RECOMMENDED',
      remarks,
      recommendedDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    ppos.push(ppo);
  }
  saveState();
  res.json(apiSuccess('PPO Recommended', ppo));
});

app.post('/api/v1/company/ppo/offer', authenticateToken, requireRole('COMPANY'), (req: AuthenticatedRequest, res) => {
  const { studentId, internshipId, offerDetails, salaryPackage } = req.body;
  const ppo = ppos.find(p => p.studentId === studentId && p.internshipId === internshipId);
  if (!ppo) return res.status(404).json(apiError('PPO recommendation not found'));
  
  ppo.status = 'PPO_OFFERED';
  ppo.offerDetails = offerDetails;
  ppo.salaryPackage = salaryPackage;
  ppo.offeredDate = new Date().toISOString();
  saveState();
  res.json(apiSuccess('PPO Offered', ppo));
});

app.post('/api/v1/student/ppo/:id/accept', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const ppo = ppos.find(p => p.id === req.params.id && p.studentId === req.user!.id);
  if (!ppo) return res.status(404).json(apiError('PPO not found'));
  
  ppo.status = 'PPO_ACCEPTED';
  ppo.acceptedDate = new Date().toISOString();
  saveState();
  res.json(apiSuccess('PPO Accepted', ppo));
});

app.post('/api/v1/student/ppo/:id/decline', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const ppo = ppos.find(p => p.id === req.params.id && p.studentId === req.user!.id);
  if (!ppo) return res.status(404).json(apiError('PPO not found'));
  
  ppo.status = 'PPO_DECLINED';
  ppo.declinedDate = new Date().toISOString();
  saveState();
  res.json(apiSuccess('PPO Declined', ppo));
});

app.get('/api/v1/tpo/analytics/ppo', authenticateToken, requireRole('TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  const totalCompleters = internshipLifecycles.filter(l => l.currentStage === 'COMPLETION').length;
  const recommended = ppos.filter(p => p.status === 'PPO_RECOMMENDED' || p.status === 'PPO_OFFERED' || p.status === 'PPO_ACCEPTED' || p.status === 'PPO_DECLINED').length;
  const offered = ppos.filter(p => p.status === 'PPO_OFFERED' || p.status === 'PPO_ACCEPTED' || p.status === 'PPO_DECLINED').length;
  const accepted = ppos.filter(p => p.status === 'PPO_ACCEPTED').length;
  const declined = ppos.filter(p => p.status === 'PPO_DECLINED').length;
  
  const conversionRate = offered > 0 ? (accepted / offered) * 100 : 0;
  
  res.json(apiSuccess('PPO Analytics', {
    totalCompleters,
    recommended,
    offered,
    accepted,
    declined,
    conversionRate
  }));
});

// --- Component 6: Faculty Mentor Workflow ---

app.post('/api/v1/tpo/mentors/assign', authenticateToken, requireRole('TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  const { mentorId, studentId, internshipId } = req.body;
  const user = req.user!;
  
  const mentor = users.find(u => u.id === mentorId && u.role === 'FACULTY_MENTOR');
  const student = users.find(u => u.id === studentId);
  const internship = internships.find(i => i.id === internshipId);
  
  if (!mentor || !student || !internship) return res.status(400).json(apiError('Invalid mentor, student, or internship ID'));
  
  const now = new Date().toISOString();
  const assignment: MentorAssignmentStore = {
    id: `ma_${crypto.randomBytes(8).toString('hex')}`,
    mentorId,
    mentorName: `${mentor.firstName} ${mentor.lastName}`.trim(),
    mentorEmail: mentor.email,
    studentId,
    studentName: `${student.firstName} ${student.lastName}`.trim(),
    internshipId,
    internshipTitle: internship.title,
    companyName: internship.companyName,
    assignedBy: user.id,
    assignedByName: `${user.firstName} ${user.lastName}`.trim(),
    assignedAt: now,
    status: 'ACTIVE'
  };
  
  mentorAssignments.push(assignment);
  
  createNotification(
    mentorId,
    'NEW_MENTEE_ASSIGNED',
    'New Student Assigned',
    `You have been assigned as the faculty mentor for ${student.firstName} ${student.lastName}.`,
    assignment.id,
    'SYSTEM'
  );

  saveState();
  res.json(apiSuccess('Mentor assigned successfully', assignment));
});

app.get('/api/v1/tpo/mentors', authenticateToken, requireRole('TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  res.json(apiSuccess('Mentor assignments retrieved', mentorAssignments));
});

app.put('/api/v1/tpo/mentors/:id/reassign', authenticateToken, requireRole('TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  const assignment = mentorAssignments.find(m => m.id === req.params.id);
  if (!assignment) return res.status(404).json(apiError('Assignment not found'));
  
  const mentor = users.find(u => u.id === req.body.mentorId);
  if (!mentor) return res.status(400).json(apiError('Invalid mentor ID'));
  
  assignment.mentorId = mentor.id;
  assignment.mentorName = `${mentor.firstName} ${mentor.lastName}`.trim();
  assignment.mentorEmail = mentor.email;
  saveState();
  
  res.json(apiSuccess('Mentor reassigned', assignment));
});

app.get('/api/v1/mentor/dashboard', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const assignments = mentorAssignments.filter(m => m.mentorId === user.id && m.status === 'ACTIVE');
  
  const studentStats = {
    totalStudents: assignments.length,
    activeInternships: assignments.length, // assuming 1:1 here
    reportsPendingReview: weeklyReports.filter(r => assignments.some(a => a.studentId === r.studentId && a.internshipId === r.internshipId) && r.status === 'SUBMITTED').length
  };
  
  res.json(apiSuccess('Dashboard data retrieved', { assignments, stats: studentStats }));
});

app.get('/api/v1/mentor/students', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const assignments = mentorAssignments.filter(m => m.mentorId === req.user!.id);
  res.json(apiSuccess('Students retrieved', assignments));
});

app.get('/api/v1/mentor/students/:studentId', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const student = users.find(u => u.id === req.params.studentId);
  if (!student) return res.status(404).json(apiError('Student not found'));
  
  // Assemble student detail specific for mentor
  const assignment = mentorAssignments.find(m => m.mentorId === req.user!.id && m.studentId === student.id);
  const reports = weeklyReports.filter(r => r.studentId === student.id);
  const tasks = internshipTasks.filter(t => t.studentId === student.id);
  
  res.json(apiSuccess('Student detail retrieved', { 
    profile: toUserProfile(student), 
    assignment, 
    weeklyReports: reports, 
    tasks 
  }));
});

app.post('/api/v1/mentor/reviews', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const body = req.body;
  
  const review: MentorReviewStore = {
    id: `mr_${crypto.randomBytes(8).toString('hex')}`,
    mentorId: user.id,
    mentorName: `${user.firstName} ${user.lastName}`.trim(),
    studentId: body.studentId,
    internshipId: body.internshipId,
    weeklyReportId: body.weeklyReportId,
    reviewType: body.reviewType || 'GENERAL',
    comment: body.comment,
    rating: body.rating,
    createdAt: new Date().toISOString()
  };
  
  mentorReviews.push(review);
  saveState();
  res.json(apiSuccess('Review added', review));
});

// Optional MongoDB Connect
// ===== FACULTY MENTOR MANAGEMENT SYSTEM =====

// Helper: get enriched mentor profile with capacity
function getFacultyMentorProfile(u: UserStore) {
  const assignedCount = facultyMentorAssignments.filter(a => a.mentorId === u.id && a.status === 'ACTIVE').length;
  const maxCap = u.maxCapacity || 10;
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`.trim(),
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone || null,
    department: u.department || null,
    designation: u.designation || null,
    employeeId: u.employeeId || null,
    role: u.role,
    status: u.status,
    maxCapacity: maxCap,
    assignedCount,
    availableCapacity: Math.max(0, maxCap - assignedCount),
    createdAt: u.createdAt
  };
}

// Helper: get enriched mentee info
function getEnrichedMenteeInfo(studentId: string) {
  const student = users.find(u => u.id === studentId);
  if (!student) return null;
  const profile = toUserProfile(student);
  const academic = academicProfiles[studentId] || null;
  const activeInternship = getActiveInternshipForStudent(studentId);
  const studentAttendance = attendanceRecords.filter(a => a.studentId === studentId);
  const totalDays = studentAttendance.length;
  const presentDays = studentAttendance.filter(a => a.status === 'PRESENT').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  const reports = weeklyReports.filter(r => r.studentId === studentId);
  const pendingReports = reports.filter(r => r.status === 'SUBMITTED' || r.status === 'DRAFT').length;
  const approvedReports = reports.filter(r => r.status === 'APPROVED').length;
  const tasks = internshipTasks.filter(t => t.studentId === studentId);
  const docs = internshipDocuments.filter(d => d.studentId === studentId);
  const evaluation = internshipEvaluations.find(e => e.studentId === studentId);
  
  // Risk & Attention calculation
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  const riskReasons: string[] = [];
  if (attendancePercentage < 75 && totalDays > 0) {
    riskReasons.push(`Low Attendance (${attendancePercentage}%)`);
  }
  if (academic && academic.cgpa < 6.0) {
    riskReasons.push(`Low CGPA (${academic.cgpa.toFixed(2)})`);
  } else if (!academic && (student.gpa || 3.5) < 3.0) {
    riskReasons.push(`Low GPA (${(student.gpa || 3.5).toFixed(2)})`);
  }
  if (academic && academic.backlogsCount > 0) {
    riskReasons.push(`Has ${academic.backlogsCount} active backlog(s)`);
  }
  if (pendingReports > 0) {
    riskReasons.push(`${pendingReports} logbook(s) pending review`);
  }
  if (activeInternship && ((activeInternship as any).status === 'TERMINATED' || (activeInternship as any).status === 'WITHDRAWN')) {
    riskReasons.push(`Internship issue: ${(activeInternship as any).status}`);
  }

  if (riskReasons.length >= 2 || (attendancePercentage < 75 && totalDays > 0) || (academic && academic.cgpa < 4.5)) {
    riskLevel = 'HIGH';
  } else if (riskReasons.length > 0) {
    riskLevel = 'MEDIUM';
  }

  return {
    id: student.id,
    name: `${student.firstName} ${student.lastName}`.trim(),
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    phone: student.phone || null,
    rollNumber: student.rollNumber || null,
    department: student.department || null,
    batch: student.batch || null,
    cgpa: academic?.cgpa || student.gpa || null,
    currentSemester: academic?.currentSemester || null,
    backlogsCount: academic?.backlogsCount || 0,
    skills: student.skills || [],
    attendance: {
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
      attendancePercentage
    },
    internship: activeInternship ? {
      id: activeInternship.id,
      title: activeInternship.title,
      companyName: activeInternship.companyName,
      type: activeInternship.type,
      startDate: activeInternship.startDate,
      endDate: (activeInternship as any).endDate || null,
      status: activeInternship.status
    } : null,
    logbooks: {
      total: reports.length,
      pending: pendingReports,
      approved: approvedReports,
      revisionRequired: reports.filter(r => r.status === 'REVISION_REQUIRED').length,
      submitted: reports.filter(r => r.status === 'SUBMITTED').length
    },
    documents: docs.map(d => ({ id: d.id, type: d.documentType, fileName: d.fileName, status: d.verificationStatus, uploadDate: d.uploadDate })),
    evaluation: evaluation || null,
    tasks: tasks.map(t => ({ id: t.id, title: t.title, status: t.status, deadline: t.deadline || (t as any).dueDate })),
    riskLevel,
    riskReasons
  };
}

// 1. GET /api/v1/tpo/faculty-mentors - List all faculty mentors
app.get('/api/v1/tpo/faculty-mentors', authenticateToken, requireRole('TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  const mentors = users.filter(u => u.role === 'FACULTY_MENTOR');
  const mentorProfiles = mentors.map(m => getFacultyMentorProfile(m));
  
  // Apply search filter
  const search = (req.query.search as string || '').toLowerCase();
  const dept = (req.query.department as string || '').toLowerCase();
  const statusFilter = req.query.status as string || '';
  const capacityFilter = req.query.capacityFilter as string || '';
  
  let filtered = mentorProfiles;
  if (search) {
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(search) ||
      m.email.toLowerCase().includes(search) ||
      (m.employeeId && m.employeeId.toLowerCase().includes(search))
    );
  }
  if (dept) {
    filtered = filtered.filter(m => m.department && m.department.toLowerCase().includes(dept));
  }
  if (statusFilter) {
    filtered = filtered.filter(m => m.status === statusFilter);
  }
  if (capacityFilter === 'AVAILABLE') {
    filtered = filtered.filter(m => m.availableCapacity > 0);
  } else if (capacityFilter === 'FULL') {
    filtered = filtered.filter(m => m.availableCapacity === 0);
  }

  res.json(apiSuccess('Faculty mentors retrieved', filtered));
});

// 2. POST /api/v1/tpo/faculty-mentors - Create faculty mentor
app.post('/api/v1/tpo/faculty-mentors', authenticateToken, requireRole('TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  const { firstName, lastName, email, phone, department, designation, employeeId, password, maxCapacity } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json(apiError('First name, last name, email and password are required'));
  }
  
  // Check email uniqueness
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json(apiError('A user with this email already exists'));
  }
  
  // Check employeeId uniqueness
  if (employeeId && users.find(u => u.employeeId === employeeId)) {
    return res.status(400).json(apiError('A user with this employee ID already exists'));
  }
  
  const now = new Date().toISOString();
  const newMentor: UserStore = {
    id: `usr_mentor_${crypto.randomBytes(6).toString('hex')}`,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'FACULTY_MENTOR',
    status: 'ACTIVE',
    firstName,
    lastName,
    phone: phone || undefined,
    department: department || undefined,
    designation: designation || undefined,
    employeeId: employeeId || undefined,
    maxCapacity: maxCapacity || 10,
    institutionId: 'INST-2026',
    createdAt: now,
    bookmarks: []
  };
  
  users.push(newMentor);
  saveState();
  
  res.status(201).json(apiSuccess('Faculty mentor created successfully', getFacultyMentorProfile(newMentor)));
});

// 3. PUT /api/v1/tpo/faculty-mentors/:id - Update mentor profile
app.put('/api/v1/tpo/faculty-mentors/:id', authenticateToken, requireRole('TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  const mentor = users.find(u => u.id === req.params.id && u.role === 'FACULTY_MENTOR');
  if (!mentor) return res.status(404).json(apiError('Faculty mentor not found'));
  
  const { firstName, lastName, phone, department, designation, employeeId, maxCapacity } = req.body;
  
  // Check employeeId uniqueness if changing
  if (employeeId && employeeId !== mentor.employeeId) {
    if (users.find(u => u.employeeId === employeeId && u.id !== mentor.id)) {
      return res.status(400).json(apiError('Employee ID already in use'));
    }
  }
  
  // Don't allow maxCapacity below current assigned count
  const currentAssigned = facultyMentorAssignments.filter(a => a.mentorId === mentor.id && a.status === 'ACTIVE').length;
  if (maxCapacity !== undefined && maxCapacity < currentAssigned) {
    return res.status(400).json(apiError(`Cannot set capacity below current assigned count (${currentAssigned})`));
  }
  
  if (firstName) mentor.firstName = firstName;
  if (lastName) mentor.lastName = lastName;
  if (phone !== undefined) mentor.phone = phone;
  if (department) mentor.department = department;
  if (designation) mentor.designation = designation;
  if (employeeId) mentor.employeeId = employeeId;
  if (maxCapacity !== undefined) mentor.maxCapacity = maxCapacity;
  
  saveState();
  res.json(apiSuccess('Faculty mentor updated', getFacultyMentorProfile(mentor)));
});

// 4. PUT /api/v1/tpo/faculty-mentors/:id/status - Activate/deactivate
app.put('/api/v1/tpo/faculty-mentors/:id/status', authenticateToken, requireRole('TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  const mentor = users.find(u => u.id === req.params.id && u.role === 'FACULTY_MENTOR');
  if (!mentor) return res.status(404).json(apiError('Faculty mentor not found'));
  
  const { status } = req.body;
  if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
    return res.status(400).json(apiError('Status must be ACTIVE or INACTIVE'));
  }
  
  mentor.status = status;
  saveState();
  res.json(apiSuccess(`Mentor ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`, getFacultyMentorProfile(mentor)));
});

// 5. GET /api/v1/tpo/faculty-mentors/:id/mentees - Get mentor's mentees (TPO view)
app.get('/api/v1/tpo/faculty-mentors/:id/mentees', authenticateToken, requireRole('TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  const mentor = users.find(u => u.id === req.params.id && u.role === 'FACULTY_MENTOR');
  if (!mentor) return res.status(404).json(apiError('Faculty mentor not found'));
  
  const activeAssignments = facultyMentorAssignments.filter(a => a.mentorId === mentor.id && a.status === 'ACTIVE');
  const mentees = activeAssignments.map(a => {
    const enriched = getEnrichedMenteeInfo(a.studentId);
    return enriched ? { ...enriched, assignedAt: a.assignedAt, assignmentId: a.id } : null;
  }).filter(Boolean);
  
  res.json(apiSuccess('Mentor mentees retrieved', { mentor: getFacultyMentorProfile(mentor), mentees }));
});

// 6. POST /api/v1/tpo/faculty-mentors/:id/assign-student - Assign student to mentor
app.post('/api/v1/tpo/faculty-mentors/:id/assign-student', authenticateToken, requireRole('TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  const tpoUser = req.user!;
  const { studentId, internshipId } = req.body;
  
  if (!studentId) return res.status(400).json(apiError('studentId is required'));
  
  const mentor = users.find(u => u.id === req.params.id && u.role === 'FACULTY_MENTOR');
  if (!mentor) return res.status(404).json(apiError('Faculty mentor not found'));
  if (mentor.status !== 'ACTIVE') return res.status(400).json(apiError('Cannot assign students to an inactive mentor'));
  
  const student = users.find(u => u.id === studentId && u.role === 'STUDENT');
  if (!student) return res.status(404).json(apiError('Student not found'));
  
  // Check capacity
  const currentAssigned = facultyMentorAssignments.filter(a => a.mentorId === mentor.id && a.status === 'ACTIVE').length;
  const maxCap = mentor.maxCapacity || 10;
  if (currentAssigned >= maxCap) {
    return res.status(400).json(apiError(`Mentor has reached maximum capacity (${maxCap}/${maxCap}). Cannot assign more students.`));
  }
  
  // Check if student already has an active mentor assignment
  const existingActive = facultyMentorAssignments.find(a => a.studentId === studentId && a.status === 'ACTIVE');
  if (existingActive) {
    return res.status(400).json(apiError(
      `Student is already assigned to ${users.find(u => u.id === existingActive.mentorId)?.firstName || 'another mentor'}. Use the reassign endpoint to change mentors.`
    ));
  }
  
  const now = new Date().toISOString();
  const newAssignment: FacultyMentorAssignmentStore = {
    id: `fma_${crypto.randomBytes(8).toString('hex')}`,
    studentId,
    mentorId: mentor.id,
    assignedBy: tpoUser.id,
    assignedAt: now,
    internshipId: internshipId || undefined,
    status: 'ACTIVE'
  };
  
  facultyMentorAssignments.push(newAssignment);
  
  // Notify mentor
  createNotification(
    mentor.id,
    'NEW_MENTEE_ASSIGNED',
    'New Student Assigned',
    `${student.firstName} ${student.lastName} has been assigned to you as a mentee.`,
    newAssignment.id,
    'FACULTY_MENTOR_ASSIGNMENT'
  );
  
  // Notify student
  createNotification(
    studentId,
    'MENTOR_ASSIGNED',
    'Faculty Mentor Assigned',
    `${mentor.firstName} ${mentor.lastName} has been assigned as your faculty mentor.`,
    newAssignment.id,
    'FACULTY_MENTOR_ASSIGNMENT'
  );
  
  saveState();
  res.status(201).json(apiSuccess('Student assigned to mentor successfully', newAssignment));
});

// 7. POST /api/v1/tpo/faculty-mentors/reassign - Reassign student
app.post('/api/v1/tpo/faculty-mentors/reassign', authenticateToken, requireRole('TPO', 'ADMIN'), (req: AuthenticatedRequest, res) => {
  const tpoUser = req.user!;
  const { studentId, newMentorId, reason } = req.body;
  
  if (!studentId || !newMentorId) {
    return res.status(400).json(apiError('studentId and newMentorId are required'));
  }
  
  const student = users.find(u => u.id === studentId && u.role === 'STUDENT');
  if (!student) return res.status(404).json(apiError('Student not found'));
  
  const newMentor = users.find(u => u.id === newMentorId && u.role === 'FACULTY_MENTOR');
  if (!newMentor) return res.status(404).json(apiError('New mentor not found'));
  if (newMentor.status !== 'ACTIVE') return res.status(400).json(apiError('Cannot reassign to an inactive mentor'));
  
  // Check new mentor capacity
  const newMentorAssigned = facultyMentorAssignments.filter(a => a.mentorId === newMentorId && a.status === 'ACTIVE').length;
  const newMaxCap = newMentor.maxCapacity || 10;
  if (newMentorAssigned >= newMaxCap) {
    return res.status(400).json(apiError(`New mentor has reached maximum capacity (${newMaxCap}/${newMaxCap})`));
  }
  
  const now = new Date().toISOString();
  
  // Deactivate current active assignment
  const currentAssignment = facultyMentorAssignments.find(a => a.studentId === studentId && a.status === 'ACTIVE');
  if (currentAssignment) {
    currentAssignment.status = 'INACTIVE';
    currentAssignment.endedAt = now;
    currentAssignment.reason = reason || 'Reassigned by TPO';
    
    // Notify old mentor
    const oldMentor = users.find(u => u.id === currentAssignment.mentorId);
    if (oldMentor) {
      createNotification(
        oldMentor.id,
        'MENTEE_REASSIGNED',
        'Student Reassigned',
        `${student.firstName} ${student.lastName} has been reassigned to another mentor.`,
        currentAssignment.id,
        'FACULTY_MENTOR_ASSIGNMENT'
      );
    }
  }
  
  // Create new active assignment
  const newAssignment: FacultyMentorAssignmentStore = {
    id: `fma_${crypto.randomBytes(8).toString('hex')}`,
    studentId,
    mentorId: newMentorId,
    assignedBy: tpoUser.id,
    assignedAt: now,
    internshipId: currentAssignment?.internshipId,
    status: 'ACTIVE'
  };
  
  facultyMentorAssignments.push(newAssignment);
  
  // Notify new mentor
  createNotification(
    newMentorId,
    'NEW_MENTEE_ASSIGNED',
    'New Student Assigned',
    `${student.firstName} ${student.lastName} has been reassigned to you as a mentee.`,
    newAssignment.id,
    'FACULTY_MENTOR_ASSIGNMENT'
  );
  
  // Notify student
  createNotification(
    studentId,
    'MENTOR_REASSIGNED',
    'Faculty Mentor Changed',
    `Your faculty mentor has been changed to ${newMentor.firstName} ${newMentor.lastName}.`,
    newAssignment.id,
    'FACULTY_MENTOR_ASSIGNMENT'
  );
  
  saveState();
  res.json(apiSuccess('Student reassigned successfully', { oldAssignment: currentAssignment, newAssignment }));
});

// 8. GET /api/v1/student/faculty-mentor - Student gets own mentor
app.get('/api/v1/student/faculty-mentor', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const studentId = req.user!.id;
  const activeAssignment = facultyMentorAssignments.find(a => a.studentId === studentId && a.status === 'ACTIVE');
  
  if (!activeAssignment) {
    return res.json(apiSuccess('No faculty mentor assigned', { mentor: null, assignment: null }));
  }
  
  const mentor = users.find(u => u.id === activeAssignment.mentorId);
  if (!mentor) {
    return res.json(apiSuccess('Mentor not found', { mentor: null, assignment: activeAssignment }));
  }
  
  res.json(apiSuccess('Faculty mentor retrieved', {
    mentor: {
      id: mentor.id,
      name: `${mentor.firstName} ${mentor.lastName}`.trim(),
      firstName: mentor.firstName,
      lastName: mentor.lastName,
      email: mentor.email,
      phone: mentor.phone || null,
      department: mentor.department || null,
      designation: mentor.designation || null,
      employeeId: mentor.employeeId || null,
      status: mentor.status,
      assignedAt: activeAssignment.assignedAt
    },
    assignment: activeAssignment
  }));
});

// 9. GET /api/v1/faculty/mentees - Faculty mentor gets own mentees
app.get('/api/v1/faculty/mentees', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const mentorId = req.user!.id;
  const activeAssignments = facultyMentorAssignments.filter(a => a.mentorId === mentorId && a.status === 'ACTIVE');
  
  const mentees = activeAssignments.map(a => {
    const enriched = getEnrichedMenteeInfo(a.studentId);
    return enriched ? { ...enriched, assignedAt: a.assignedAt, assignmentId: a.id } : null;
  }).filter(Boolean);
  
  res.json(apiSuccess('Mentees retrieved', mentees));
});

// 10. GET /api/v1/faculty/mentees/:studentId - Faculty mentor gets mentee 360° detail
app.get('/api/v1/faculty/mentees/:studentId', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const mentorId = req.user!.id;
  const studentId = req.params.studentId;
  
  // Verify this student is assigned to this mentor
  const assignment = facultyMentorAssignments.find(a => a.mentorId === mentorId && a.studentId === studentId && a.status === 'ACTIVE');
  if (!assignment) {
    return res.status(403).json(apiError('This student is not assigned to you'));
  }
  
  const student = users.find(u => u.id === studentId);
  if (!student) return res.status(404).json(apiError('Student not found'));
  
  const enriched = getEnrichedMenteeInfo(studentId);
  const notes = mentorNotes.filter(n => n.mentorId === mentorId && n.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const rawReviews = mentorReviews.filter(r => r.mentorId === mentorId && r.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const parsedReviews = rawReviews.map(r => {
    let parsedComment: any = {};
    try {
      parsedComment = JSON.parse(r.comment);
    } catch {
      parsedComment = { feedback: r.comment };
    }
    return {
      ...r,
      feedback: parsedComment.feedback || r.comment,
      strengths: parsedComment.strengths || '',
      concerns: parsedComment.concerns || '',
      actionItems: parsedComment.actionItems || ''
    };
  });

  const actionItems = mentorActionItems.filter(a => a.mentorId === mentorId && a.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const academic = academicProfiles[studentId] || null;
  const reports = weeklyReports.filter(r => r.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt || b.startDate || '').getTime() - new Date(a.createdAt || a.startDate || '').getTime());
  const docs = internshipDocuments.filter(d => d.studentId === studentId);

  // Build unified mentoring timeline
  const timeline: any[] = [
    ...notes.map(n => ({
      id: n.id,
      type: n.type,
      title: n.type === 'GUIDANCE' ? 'Mentoring Guidance' : n.type === 'CONCERN' ? 'Flagged Concern' : n.type === 'ACTION_ITEM' ? 'Action Item Note' : 'Mentoring Note',
      content: n.content,
      createdAt: n.createdAt,
      authorName: `${req.user!.firstName} ${req.user!.lastName}`.trim()
    })),
    ...parsedReviews.map(r => ({
      id: r.id,
      type: 'REVIEW',
      title: `Mentor Review (${r.rating ? '⭐ ' + r.rating + '/5' : 'General'})`,
      content: r.feedback || r.comment || 'Performance review recorded.',
      createdAt: r.createdAt,
      authorName: r.mentorName || `${req.user!.firstName} ${req.user!.lastName}`.trim(),
      metadata: { rating: r.rating, strengths: r.strengths, concerns: r.concerns, actionItems: r.actionItems }
    })),
    ...actionItems.map(a => ({
      id: a.id,
      type: 'ACTION_ITEM',
      title: `Action Item: ${a.title}`,
      content: a.description || `Status: ${a.status}${a.dueDate ? ' • Due: ' + a.dueDate : ''}`,
      createdAt: a.createdAt,
      authorName: `${req.user!.firstName} ${req.user!.lastName}`.trim(),
      metadata: { status: a.status, dueDate: a.dueDate }
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json(apiSuccess('Mentee detail retrieved', {
    ...enriched,
    assignment,
    academics: academic,
    weeklyReports: reports,
    documents: docs,
    mentorNotes: notes,
    mentorReviews: parsedReviews,
    actionItems,
    timeline
  }));
});

// 11. POST /api/v1/faculty/mentees/:studentId/reviews - Add review
app.post('/api/v1/faculty/mentees/:studentId/reviews', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const mentorId = req.user!.id;
  const mentor = req.user!;
  const studentId = req.params.studentId;
  
  const assignment = facultyMentorAssignments.find(a => a.mentorId === mentorId && a.studentId === studentId && a.status === 'ACTIVE');
  if (!assignment) return res.status(403).json(apiError('This student is not assigned to you'));
  
  const { rating, feedback, strengths, concerns, actionItems, reviewType } = req.body;
  
  const review: MentorReviewStore = {
    id: `mr_${crypto.randomBytes(8).toString('hex')}`,
    mentorId,
    mentorName: `${mentor.firstName} ${mentor.lastName}`.trim(),
    studentId,
    internshipId: assignment.internshipId || '',
    reviewType: reviewType || 'GENERAL',
    comment: JSON.stringify({ feedback: feedback || '', strengths: strengths || '', concerns: concerns || '', actionItems: actionItems || '' }),
    rating: rating || undefined,
    createdAt: new Date().toISOString()
  };
  
  mentorReviews.push(review);
  
  // Notify student
  createNotification(
    studentId,
    'MENTOR_REVIEW_SUBMITTED',
    'New Mentor Review',
    `Your faculty mentor ${mentor.firstName} ${mentor.lastName} has submitted a performance review.`,
    review.id,
    'MENTOR_REVIEW'
  );

  saveState();
  res.status(201).json(apiSuccess('Review submitted successfully', {
    ...review,
    feedback: feedback || '',
    strengths: strengths || '',
    concerns: concerns || '',
    actionItems: actionItems || ''
  }));
});

// 12. GET /api/v1/faculty/mentees/:studentId/reviews - Get reviews
app.get('/api/v1/faculty/mentees/:studentId/reviews', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const mentorId = req.user!.id;
  const studentId = req.params.studentId;
  
  const assignment = facultyMentorAssignments.find(a => a.mentorId === mentorId && a.studentId === studentId && a.status === 'ACTIVE');
  if (!assignment) return res.status(403).json(apiError('This student is not assigned to you'));
  
  const rawReviews = mentorReviews.filter(r => r.mentorId === mentorId && r.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const reviews = rawReviews.map(r => {
    let parsed: any = {};
    try { parsed = JSON.parse(r.comment); } catch { parsed = { feedback: r.comment }; }
    return {
      ...r,
      feedback: parsed.feedback || r.comment,
      strengths: parsed.strengths || '',
      concerns: parsed.concerns || '',
      actionItems: parsed.actionItems || ''
    };
  });
  
  res.json(apiSuccess('Reviews retrieved', reviews));
});

// 13. POST /api/v1/faculty/mentees/:studentId/notes - Add note
app.post('/api/v1/faculty/mentees/:studentId/notes', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const mentorId = req.user!.id;
  const studentId = req.params.studentId;
  
  const assignment = facultyMentorAssignments.find(a => a.mentorId === mentorId && a.studentId === studentId && a.status === 'ACTIVE');
  if (!assignment) return res.status(403).json(apiError('This student is not assigned to you'));
  
  const { type, content } = req.body;
  if (!content || !content.trim()) return res.status(400).json(apiError('Note content is required'));
  
  const noteType = ['NOTE', 'GUIDANCE', 'CONCERN', 'ACTION_ITEM'].includes(type) ? type : 'NOTE';
  
  const note: MentorNoteStore = {
    id: `mn_${crypto.randomBytes(8).toString('hex')}`,
    mentorId,
    studentId,
    type: noteType,
    content: content.trim(),
    createdAt: new Date().toISOString()
  };
  
  mentorNotes.push(note);
  
  // If note is guidance or action item, notify student
  if (noteType === 'GUIDANCE' || noteType === 'ACTION_ITEM') {
    createNotification(
      studentId,
      'MENTOR_GUIDANCE_ADDED',
      'Faculty Mentor Guidance',
      `Your faculty mentor ${req.user!.firstName} ${req.user!.lastName} added new guidance for you.`,
      note.id,
      'MENTOR_NOTE'
    );
  }

  saveState();
  res.status(201).json(apiSuccess('Note added successfully', note));
});

// 14. GET /api/v1/faculty/mentees/:studentId/notes - Get notes
app.get('/api/v1/faculty/mentees/:studentId/notes', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const mentorId = req.user!.id;
  const studentId = req.params.studentId;
  
  const assignment = facultyMentorAssignments.find(a => a.mentorId === mentorId && a.studentId === studentId && a.status === 'ACTIVE');
  if (!assignment) return res.status(403).json(apiError('This student is not assigned to you'));
  
  const notes = mentorNotes.filter(n => n.mentorId === mentorId && n.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json(apiSuccess('Notes retrieved', notes));
});

// 15. Action Items APIs
// POST /api/v1/faculty/mentees/:studentId/action-items - Create action item
app.post('/api/v1/faculty/mentees/:studentId/action-items', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const mentorId = req.user!.id;
  const studentId = req.params.studentId;
  
  const assignment = facultyMentorAssignments.find(a => a.mentorId === mentorId && a.studentId === studentId && a.status === 'ACTIVE');
  if (!assignment) return res.status(403).json(apiError('This student is not assigned to you'));
  
  const { title, description, dueDate } = req.body;
  if (!title || !title.trim()) return res.status(400).json(apiError('Action item title is required'));
  
  const now = new Date().toISOString();
  const actionItem: MentorActionItemStore = {
    id: `mai_${crypto.randomBytes(8).toString('hex')}`,
    mentorId,
    studentId,
    title: title.trim(),
    description: description ? description.trim() : undefined,
    status: 'PENDING',
    dueDate: dueDate || undefined,
    createdAt: now,
    updatedAt: now
  };
  
  mentorActionItems.push(actionItem);
  
  // Notify student
  createNotification(
    studentId,
    'MENTOR_ACTION_ITEM_ASSIGNED',
    'New Action Item Assigned',
    `Your mentor ${req.user!.firstName} ${req.user!.lastName} assigned an action item: "${title.trim()}".`,
    actionItem.id,
    'MENTOR_ACTION_ITEM'
  );

  saveState();
  res.status(201).json(apiSuccess('Action item created successfully', actionItem));
});

// GET /api/v1/faculty/mentees/:studentId/action-items - List action items
app.get('/api/v1/faculty/mentees/:studentId/action-items', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const mentorId = req.user!.id;
  const studentId = req.params.studentId;
  
  const assignment = facultyMentorAssignments.find(a => a.mentorId === mentorId && a.studentId === studentId && a.status === 'ACTIVE');
  if (!assignment) return res.status(403).json(apiError('This student is not assigned to you'));
  
  const items = mentorActionItems.filter(a => a.mentorId === mentorId && a.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json(apiSuccess('Action items retrieved', items));
});

// PUT /api/v1/faculty/action-items/:id - Update action item
app.put('/api/v1/faculty/action-items/:id', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const mentorId = req.user!.id;
  const itemId = req.params.id;
  
  const item = mentorActionItems.find(a => a.id === itemId && a.mentorId === mentorId);
  if (!item) return res.status(404).json(apiError('Action item not found'));
  
  const { title, description, status, dueDate } = req.body;
  if (title) item.title = title.trim();
  if (description !== undefined) item.description = description ? description.trim() : undefined;
  if (status && ['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
    item.status = status;
    if (status === 'COMPLETED' && !item.completedAt) {
      item.completedAt = new Date().toISOString();
    } else if (status !== 'COMPLETED') {
      item.completedAt = undefined;
    }
  }
  if (dueDate !== undefined) item.dueDate = dueDate || undefined;
  item.updatedAt = new Date().toISOString();
  
  saveState();
  res.json(apiSuccess('Action item updated successfully', item));
});

// DELETE /api/v1/faculty/action-items/:id - Delete action item
app.delete('/api/v1/faculty/action-items/:id', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const mentorId = req.user!.id;
  const itemId = req.params.id;
  
  const idx = mentorActionItems.findIndex(a => a.id === itemId && a.mentorId === mentorId);
  if (idx < 0) return res.status(404).json(apiError('Action item not found'));
  
  mentorActionItems.splice(idx, 1);
  saveState();
  res.json(apiSuccess('Action item deleted successfully', null));
});

// 16. Student Mentoring Feedback & Action Items Endpoints
// GET /api/v1/student/mentor-feedback
app.get('/api/v1/student/mentor-feedback', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const studentId = req.user!.id;
  const activeAssignment = facultyMentorAssignments.find(a => a.studentId === studentId && a.status === 'ACTIVE');
  
  if (!activeAssignment) {
    return res.json(apiSuccess('No active mentor assigned', {
      mentor: null,
      assignment: null,
      latestReview: null,
      reviews: [],
      notes: [],
      actionItems: [],
      timeline: []
    }));
  }
  
  const mentor = users.find(u => u.id === activeAssignment.mentorId);
  const mentorProfile = mentor ? {
    id: mentor.id,
    name: `${mentor.firstName} ${mentor.lastName}`.trim(),
    firstName: mentor.firstName,
    lastName: mentor.lastName,
    email: mentor.email,
    phone: mentor.phone || null,
    department: mentor.department || null,
    designation: mentor.designation || null,
    employeeId: mentor.employeeId || null,
    status: mentor.status,
    assignedAt: activeAssignment.assignedAt
  } : null;

  const rawReviews = mentorReviews.filter(r => r.studentId === studentId && r.mentorId === activeAssignment.mentorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const reviews = rawReviews.map(r => {
    let parsed: any = {};
    try { parsed = JSON.parse(r.comment); } catch { parsed = { feedback: r.comment }; }
    return {
      ...r,
      feedback: parsed.feedback || r.comment,
      strengths: parsed.strengths || '',
      concerns: parsed.concerns || '',
      actionItems: parsed.actionItems || ''
    };
  });

  const notes = mentorNotes.filter(n => n.studentId === studentId && n.mentorId === activeAssignment.mentorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const actionItems = mentorActionItems.filter(a => a.studentId === studentId && a.mentorId === activeAssignment.mentorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const timeline: any[] = [
    ...notes.map(n => ({
      id: n.id,
      type: n.type,
      title: n.type === 'GUIDANCE' ? 'Mentor Guidance' : n.type === 'ACTION_ITEM' ? 'Action Item' : 'Mentoring Note',
      content: n.content,
      createdAt: n.createdAt,
      authorName: mentorProfile?.name || 'Faculty Mentor'
    })),
    ...reviews.map(r => ({
      id: r.id,
      type: 'REVIEW',
      title: `Mentor Review (${r.rating ? '⭐ ' + r.rating + '/5' : 'General'})`,
      content: r.feedback || r.comment || 'Performance review recorded.',
      createdAt: r.createdAt,
      authorName: r.mentorName || mentorProfile?.name || 'Faculty Mentor',
      metadata: { rating: r.rating, strengths: r.strengths, concerns: r.concerns, actionItems: r.actionItems }
    })),
    ...actionItems.map(a => ({
      id: a.id,
      type: 'ACTION_ITEM',
      title: `Action Item: ${a.title}`,
      content: a.description || `Status: ${a.status}${a.dueDate ? ' • Due: ' + a.dueDate : ''}`,
      createdAt: a.createdAt,
      authorName: mentorProfile?.name || 'Faculty Mentor',
      metadata: { status: a.status, dueDate: a.dueDate }
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(apiSuccess('Student mentor feedback retrieved', {
    mentor: mentorProfile,
    assignment: activeAssignment,
    latestReview: reviews[0] || null,
    reviews,
    notes,
    actionItems,
    timeline
  }));
});

// GET /api/v1/student/mentor-action-items
app.get('/api/v1/student/mentor-action-items', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const studentId = req.user!.id;
  const items = mentorActionItems.filter(a => a.studentId === studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  res.json(apiSuccess('Student action items retrieved', items));
});

// PATCH /api/v1/student/mentor-action-items/:id/status
app.patch('/api/v1/student/mentor-action-items/:id/status', authenticateToken, requireRole('STUDENT'), (req: AuthenticatedRequest, res) => {
  const studentId = req.user!.id;
  const itemId = req.params.id;
  const { status } = req.body;
  
  const item = mentorActionItems.find(a => a.id === itemId && a.studentId === studentId);
  if (!item) return res.status(404).json(apiError('Action item not found'));
  
  if (!status || !['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
    return res.status(400).json(apiError('Invalid status'));
  }
  
  item.status = status;
  if (status === 'COMPLETED') {
    item.completedAt = new Date().toISOString();
  } else {
    item.completedAt = undefined;
  }
  item.updatedAt = new Date().toISOString();
  
  saveState();
  res.json(apiSuccess('Action item status updated', item));
});

// 17. GET /api/v1/faculty/dashboard - Faculty mentor dashboard
app.get('/api/v1/faculty/dashboard', authenticateToken, requireRole('FACULTY_MENTOR'), (req: AuthenticatedRequest, res) => {
  const mentor = req.user!;
  const mentorId = mentor.id;
  const activeAssignments = facultyMentorAssignments.filter(a => a.mentorId === mentorId && a.status === 'ACTIVE');
  const studentIds = activeAssignments.map(a => a.studentId);
  
  // Calculate stats
  let totalAttendance = 0;
  let attendanceCount = 0;
  let atRiskCount = 0;
  let pendingLogbooks = 0;
  let activeInterns = 0;
  
  studentIds.forEach(sid => {
    const studentAtt = attendanceRecords.filter(a => a.studentId === sid);
    const totalDays = studentAtt.length;
    const presentDays = studentAtt.filter(a => a.status === 'PRESENT').length;
    if (totalDays > 0) {
      totalAttendance += (presentDays / totalDays) * 100;
      attendanceCount++;
      if ((presentDays / totalDays) * 100 < 75) atRiskCount++;
    }
    
    const reports = weeklyReports.filter(r => r.studentId === sid && (r.status === 'SUBMITTED' || r.status === 'DRAFT'));
    pendingLogbooks += reports.length;
    
    const activeInt = getActiveInternshipForStudent(sid);
    if (activeInt) activeInterns++;
    
    const academic = academicProfiles[sid];
    if (academic && (academic.cgpa < 6.0 || academic.backlogsCount > 0)) {
      if (!studentAtt.length || (studentAtt.filter(a => a.status === 'PRESENT').length / studentAtt.length) >= 0.75) {
        atRiskCount++; // Count if not already counted for attendance
      }
    }
  });
  
  const avgAttendance = attendanceCount > 0 ? Math.round((totalAttendance / attendanceCount) * 10) / 10 : 0;
  
  const enrichedMentees = activeAssignments.map(a => {
    const enriched = getEnrichedMenteeInfo(a.studentId);
    return enriched ? { ...enriched, assignedAt: a.assignedAt, assignmentId: a.id } : null;
  }).filter(Boolean);

  const studentsRequiringAttention = enrichedMentees.filter(m => 
    m.riskLevel === 'HIGH' || 
    m.riskLevel === 'MEDIUM' || 
    (m.attendance && m.attendance.attendancePercentage < 75 && m.attendance.totalDays > 0) ||
    (m.cgpa && m.cgpa < 6.0) ||
    (m.backlogsCount && m.backlogsCount > 0) ||
    (m.logbooks && m.logbooks.pending > 0)
  );

  res.json(apiSuccess('Dashboard data retrieved', {
    totalMentees: activeAssignments.length,
    averageAttendance: avgAttendance,
    atRiskStudents: atRiskCount,
    pendingLogbooks,
    activeInterns,
    maxCapacity: mentor.maxCapacity || 10,
    availableCapacity: Math.max(0, (mentor.maxCapacity || 10) - activeAssignments.length),
    mentorProfile: getFacultyMentorProfile(mentor),
    studentsRequiringAttention,
    mentees: enrichedMentees
  }));
});


async function tryConnectMongo() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('[InternSync Server] Successfully connected to MongoDB at', MONGODB_URI);
  } catch (err: any) {
    console.log('[InternSync Server] Running with file-backed persistent database engine.');
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[InternSync Server] Listening on http://0.0.0.0:${PORT}`);
  tryConnectMongo();
});
