export type UserRole = 'STUDENT' | 'COMPANY' | 'TPO' | 'ADMIN' | 'FACULTY_MENTOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface HealthData {
  status: string;
  service: string;
  version: string;
  database: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
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
  academicRecord?: StudentAcademicProfile;
  activeInternship?: {
    id: string;
    internshipId: string;
    title: string;
    companyName: string;
    type: 'ON_CAMPUS' | 'OFF_CAMPUS';
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'COMPLETED';
    role: string;
  };
  profileCompleteness: number;
  createdAt: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
  role: UserRole;
}

export interface StudentDashboardData {
  profileCompleteness: number;
  skillsCount: number;
  hasResume: boolean;
  gpa?: number;
  department?: string;
  institutionId?: string;
  batch?: string;
  applicationsCount: number;
  savedInternshipsCount: number;
  userProfile: UserProfile;
}

export interface CompanyDashboardData {
  profileCompleteness: number;
  companyName: string;
  industry?: string;
  activeJobPostingsCount: number;
  totalApplicantsCount: number;
  pendingReviewsCount: number;
  userProfile: UserProfile;
}

export interface AdminDashboardData {
  totalUsers: number;
  totalStudents: number;
  totalCompanies: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  recentRegistrations: UserProfile[];
}

export interface PagedUserResponse {
  content: UserProfile[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type InternshipStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'CLOSED' | 'REMOVED_BY_ADMIN';
export type WorkplaceType = 'ON_SITE' | 'HYBRID' | 'REMOTE';
export type EmploymentType = 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
export type ExperienceLevel = 'ENTRY_LEVEL' | 'JUNIOR' | 'MID_LEVEL';

export interface Internship {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  requiredSkills: string[];
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  stipendOrSalaryMin?: number;
  stipendOrSalaryMax?: number;
  currency: string;
  isPaid: boolean;
  positionsAvailable: number;
  applicantCount: number;
  status: InternshipStatus;
  applicationDeadline?: string;
  duration?: string;
  internshipType?: 'ON_CAMPUS' | 'OFF_CAMPUS' | 'TPO_DRIVE' | 'COMPANY';
  postedByRole?: 'COMPANY' | 'TPO' | 'ADMIN';
  eligibilityCriteria?: {
    minCgpa?: number;
    allowedDepartments?: string[];
    batch?: string;
    maxBacklogs?: number;
    passingYear?: string;
  };
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  isBookmarked?: boolean;
}

export interface InternshipSummary {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string;
  title: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  stipendOrSalaryMin?: number;
  stipendOrSalaryMax?: number;
  currency: string;
  isPaid: boolean;
  positionsAvailable: number;
  applicantCount: number;
  status: InternshipStatus;
  requiredSkills: string[];
  duration?: string;
  internshipType?: 'ON_CAMPUS' | 'OFF_CAMPUS' | 'TPO_DRIVE' | 'COMPANY';
  postedByRole?: 'COMPANY' | 'TPO' | 'ADMIN';
  applicationDeadline?: string;
  createdAt: string;
  isBookmarked?: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  empty?: boolean;
}

export interface CreateInternshipPayload {
  title: string;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  requiredSkills: string[];
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  stipendOrSalaryMin?: number;
  stipendOrSalaryMax?: number;
  currency?: string;
  isPaid: boolean;
  positionsAvailable?: number;
  applicationDeadline?: string;
  publishImmediately?: boolean;
  duration?: string;
  eligibilityCriteria?: {
    minCgpa?: number;
    allowedDepartments?: string[];
    batch?: string;
    maxBacklogs?: number;
    passingYear?: string;
  };
}

export interface UpdateInternshipPayload {
  title: string;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  requiredSkills: string[];
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  stipendOrSalaryMin?: number;
  stipendOrSalaryMax?: number;
  currency?: string;
  isPaid: boolean;
  positionsAvailable?: number;
  applicationDeadline?: string;
  duration?: string;
  eligibilityCriteria?: {
    minCgpa?: number;
    allowedDepartments?: string[];
    batch?: string;
    maxBacklogs?: number;
    passingYear?: string;
  };
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
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
  companyName?: string;
  companyWebsite?: string;
  companyLogoUrl?: string;
  companyDescription?: string;
  industry?: string;
}

export interface AdminUpdateUserPayload extends UpdateProfilePayload {
  role?: UserRole;
  status?: UserStatus;
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
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

export interface Application {
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

export interface Notification {
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

export interface CreateApplicationPayload {
  coverLetter: string;
  resumeUrl: string;
  skills: string[];
  phoneNumber: string;
  university: string;
  graduationYear: string;
}

export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
  recruiterNotes?: string;
}

export interface ApplicationSummary extends Application {}

export interface RecommendationResponse {
  internship: Internship;
  matchScore: number;
  skillMatchPercentage: number;
  roleMatchPercentage: number;
  experienceMatchPercentage: number;
  locationMatchPercentage: number;
  educationMatchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  whyMatches: string[];
}

export interface ResumeAnalysisResponse {
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

export interface TargetRoleOption {
  role: string;
  description: string;
  keySkills: string[];
}

export interface LearningResource {
  title: string;
  provider: string;
  url: string;
  difficulty: string;
}

export interface RoadmapItem {
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
  resources: LearningResource[];
}

export interface LearningRoadmap {
  id: string;
  userId: string;
  targetRole: string;
  readinessScore: number;
  items: RoadmapItem[];
  skillLevels: Record<string, string>;
  updatedAt: string;
}

export interface SkillGapAnalysisResponse {
  userId: string;
  targetRole: string;
  readinessScore: number;
  currentSkills: string[];
  totalMatchingInternships: number;
  gaps: RoadmapItem[];
}

export interface ReadinessComponent {
  name: string;
  key: string;
  score: number;
  weight: number;
  weightedScore: number;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'PARTIAL';
  explanation: string;
}

export interface ReadinessRecommendation {
  id: string;
  title: string;
  description: string;
  actionText: string;
  actionRoute: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
}

export interface ReadinessTrendPoint {
  date: string;
  score: number;
  level: string;
}

export interface CareerReadinessResponse {
  score: number;
  level: 'Highly Ready' | 'Career Ready' | 'Developing' | 'Needs Improvement' | string;
  targetRole: string;
  badgeColor: string;
  summary: string;
  components: ReadinessComponent[];
  strengths: string[];
  weaknesses: string[];
  recommendations: ReadinessRecommendation[];
  trend: ReadinessTrendPoint[];
  pointImprovement?: number;
  lastUpdated: string;
}

// Phase 11 TPO Interfaces
export interface TPODashboardOverview {
  totalStudents: number;
  careerReadyCount: number;
  placedCount: number;
  placementRate: number;
  avgReadinessScore: number;
  needingAttentionCount: number;
  readinessDistribution: {
    highlyReady: number;
    careerReady: number;
    developing: number;
    needsAttention: number;
  };
  pipelineStats: {
    applied: number;
    shortlisted: number;
    interview: number;
    selected: number;
    rejected: number;
  };
  recentDrivesCount: number;
  activeTrainingsCount: number;
}

export interface TPOStudentSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  batch: string;
  gpa: number;
  rollNumber?: string | null;
  readinessScore: number;
  readinessLevel: string;
  resumeScore: number;
  skills: string[];
  applicationCount: number;
  interviewCount: number;
  offerCount: number;
  placementStatus: 'PLACED' | 'INTERVIEWING' | 'APPLYING' | 'NOT_STARTED';
  trainingProgress: number;
  needsAttention: boolean;
  attentionReasons?: string[];
  currentMentor?: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
    designation?: string | null;
  } | null;
}

export interface TPOStudentDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  rollNumber?: string;
  batch: string;
  gpa: number;
  skills: string[];
  resumeUrl?: string;
  resumeScore: number;
  readiness: CareerReadinessResponse;
  applications: {
    id: string;
    internshipTitle: string;
    companyName: string;
    status: string;
    appliedAt: string;
  }[];
  applicationStats: {
    applied: number;
    shortlisted: number;
    interviews: number;
    offers: number;
  };
  skillGaps: string[];
  assignedTrainings: {
    id: string;
    trainingTitle: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    progress: number;
    assignedAt: string;
  }[];
  interventions: {
    reasons: string[];
    recommendedActions: string[];
  };
}

export interface TrainingProgram {
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

export interface TrainingAssignment {
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

export interface PlacementDrive {
  id: string;
  companyName: string;
  companyLogoUrl?: string;
  role: string;
  package?: string;
  minCgpa?: number;
  allowedDepartments?: string[];
  requiredSkills: string[];
  batch?: string;
  deadline: string;
  status: 'UPCOMING' | 'OPEN' | 'CLOSED';
  createdBy: string;
  createdAt: string;
  eligibleStudentCount?: number;
  totalStudentCount?: number;
}

export interface DriveEligibilityResult {
  studentId: string;
  studentName: string;
  email: string;
  department: string;
  gpa: number;
  readinessScore: number;
  isEligible: boolean;
  reasons: string[];
}

export interface InterventionItem {
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
}

export interface DepartmentAnalytics {
  department: string;
  totalStudents: number;
  avgReadinessScore: number;
  avgGpa: number;
  placedCount: number;
  placementRate: number;
  activeApplications: number;
}

// ==========================================
// ACADEMIC PERFORMANCE TYPES
// ==========================================
export interface AcademicSubject {
  code?: string;
  subjectCode?: string;
  name?: string;
  subjectName?: string;
  credits: number;
  marks?: number;
  maxMarks?: number;
  grade: string;
  status?: 'PASS' | 'FAIL';
}

export interface SemesterRecord {
  semester?: number;
  semesterNumber?: number;
  academicYear?: string;
  sgpa: number;
  totalCredits?: number;
  passedCredits?: number;
  status?: 'PASS' | 'FAIL';
  subjects: AcademicSubject[];
}

export interface StudentAcademicProfile {
  cgpa: number;
  currentSemester: number;
  totalPassedSubjects?: number;
  totalFailedSubjects?: number;
  backlogsCount?: number;
  semesters: SemesterRecord[];
}

// ==========================================
// OFF-CAMPUS INTERNSHIP TYPES
// ==========================================
export type OffCampusStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface OffCampusInternship {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  rollNumber?: string;
  department?: string;
  companyName: string;
  roleTitle?: string;
  internshipTitle?: string;
  description?: string;
  jobDescription?: string;
  startDate: string;
  endDate: string;
  duration?: string;
  location?: string;
  mode?: 'ON_SITE' | 'HYBRID' | 'REMOTE';
  workplaceType?: string;
  stipend?: string;
  offerLetterUrl?: string;
  supervisorName?: string;
  supervisorEmail?: string;
  supervisorPhone?: string;
  status: OffCampusStatus;
  verificationNotes?: string;
  adminRemarks?: string;
  approvedCredits?: number;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOffCampusPayload {
  companyName: string;
  internshipTitle?: string;
  roleTitle?: string;
  description?: string;
  jobDescription?: string;
  startDate: string;
  endDate: string;
  duration?: string;
  location?: string;
  mode?: 'ON_SITE' | 'HYBRID' | 'REMOTE';
  workplaceType?: string;
  stipend?: string;
  offerLetterUrl?: string;
  supervisorName?: string;
  supervisorEmail?: string;
  supervisorPhone?: string;
}

export interface ReviewOffCampusPayload {
  status: 'APPROVED' | 'REJECTED';
  verificationNotes?: string;
  adminRemarks?: string;
  approvedCredits?: number;
}

// ==========================================
// ATTENDANCE TYPES
// ==========================================
export interface InternshipAttendance {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  department?: string;
  internshipId: string;
  internshipTitle?: string;
  companyName?: string;
  date: string; // YYYY-MM-DD
  timestamp?: string;
  checkInTime?: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
  notes?: string;
}

export interface StudentAttendanceSummary {
  studentId?: string;
  internshipId?: string;
  internshipTitle?: string;
  companyName?: string;
  totalWorkingDays?: number;
  presentDays?: number;
  totalPresentDays?: number;
  absentDays?: number;
  attendancePercentage?: number;
  attendanceRate?: number;
  isPresentToday?: boolean;
  records?: InternshipAttendance[];
}

export interface TPOAttendanceOverview {
  totalActiveInterns: number;
  overallAttendancePercentage: number;
  presentTodayCount: number;
  absentTodayCount: number;
  lowAttendanceStudentsCount: number; // < 75%
  recentLogs: InternshipAttendance[];
}

// ==========================================
// INTERNSHIP TASKS & PROGRESS
// ==========================================
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface InternshipTask {
  id: string;
  internshipId: string;
  internshipTitle?: string;
  companyName?: string;
  studentId: string;
  studentName?: string;
  title: string;
  description: string;
  assignedBy?: string;
  assignedDate?: string;
  deadline?: string;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status: TaskStatus;
  progressPercentage?: number;
  progress?: number;
  submissionUrl?: string;
  submissionNotes?: string;
  completedAt?: string;
  feedback?: string;
  createdAt?: string;
}

export interface CreateTaskPayload {
  studentId: string;
  internshipId: string;
  title: string;
  description: string;
  deadline?: string;
  dueDate?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface UpdateTaskProgressPayload {
  status: TaskStatus;
  progressPercentage?: number;
  submissionUrl?: string;
  submissionNotes?: string;
}

// ==========================================
// COMPANY EVALUATION OF INTERN
// ==========================================
export interface InternshipEvaluation {
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
  technicalScore: number; // 0-100
  attendanceScore: number; // 0-100
  taskCompletionScore: number; // 0-100
  professionalismScore: number; // 0-100
  overallScore: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  feedback: string;
  recommendations: string;
  evaluatedAt: string;
}

export interface CreateEvaluationPayload {
  studentId: string;
  internshipId: string;
  technicalScore: number;
  attendanceScore: number;
  taskCompletionScore: number;
  professionalismScore: number;
  overallScore?: number;
  feedback: string;
  recommendations?: string;
}

// ==========================================
// COMPLETE STUDENT 360 RECORD (FOR T&P)
// ==========================================
export interface CompleteStudentRecord {
  profile: UserProfile;
  academics: StudentAcademicProfile;
  activeInternship?: {
    id: string;
    internshipId: string;
    title: string;
    companyName: string;
    type: 'ON_CAMPUS' | 'OFF_CAMPUS';
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'COMPLETED';
    role: string;
  };
  internshipHistory: {
    id: string;
    title: string;
    companyName: string;
    type: 'ON_CAMPUS' | 'OFF_CAMPUS';
    status: string;
    duration: string;
    startDate?: string;
    endDate?: string;
  }[];
  applications: Application[];
  attendance: StudentAttendanceSummary;
  tasks: InternshipTask[];
  evaluation?: InternshipEvaluation;
  skills: string[];
  readinessScore: number;
  mentor?: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    department: string | null;
    designation: string | null;
  } | null;
  mentorNotes?: MentorNote[];
}

// --- New Types for Priority 1 Features ---

export interface EligibilityReason {
  criterion: string;
  met: boolean;
  detail: string;
}

export interface CandidateMatch {
  studentId: string;
  studentName: string;
  email: string;
  department?: string;
  batch?: string;
  cgpa: number;
  backlogsCount: number;
  matchScore: number;
  isEligible: boolean;
  eligibilityReasons: EligibilityReason[];
  matchedSkills: string[];
  missingSkills: string[];
  applicationStatus?: string;
  applicationId?: string;
}

export type LifecycleStage = 'REGISTRATION' | 'ELIGIBILITY' | 'APPLICATION' | 'SHORTLISTED' | 'SELECTED' | 'OFFER' | 'TPO_VERIFICATION' | 'JOINING' | 'PROGRESS' | 'EVALUATION' | 'COMPLETION' | 'PPO' | 'REJECTED';

export interface LifecycleStageHistory {
  stage: LifecycleStage;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

export interface InternshipLifecycle {
  id: string;
  applicationId: string;
  internshipId: string;
  studentId: string;
  companyId: string;
  internshipTitle: string;
  companyName: string;
  studentName: string;
  currentStage: LifecycleStage;
  stageHistory: LifecycleStageHistory[];
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'OFFER_LETTER' | 'JOINING_LETTER' | 'ACCEPTANCE_LETTER' | 'WEEKLY_REPORT' | 'FINAL_REPORT' | 'COMPLETION_CERTIFICATE' | 'PPO_LETTER';
export type DocumentVerificationStatus = 'PENDING' | 'UPLOADED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface InternshipDocument {
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

export interface WeeklyReport {
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

export interface MentorAssignment {
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

// ==========================================
// PPO (Pre-Placement Offer) TYPES
// ==========================================
export type PpoStatus = 'PPO_RECOMMENDED' | 'PPO_OFFERED' | 'PPO_ACCEPTED' | 'PPO_DECLINED';

export interface PpoRecord {
  id: string;
  studentId: string;
  companyId: string;
  internshipId: string;
  internshipTitle: string;
  studentName: string;
  status: PpoStatus;
  recommendedDate?: string;
  offeredDate?: string;
  acceptedDate?: string;
  declinedDate?: string;
  offerDetails?: string;
  salaryPackage?: string;
  remarks?: string;
  createdAt: string;
}

export interface PpoAnalytics {
  totalCompleters: number;
  recommended: number;
  offered: number;
  accepted: number;
  declined: number;
  conversionRate: number;
}

// ==========================================
// FACULTY MENTOR MANAGEMENT TYPES
// ==========================================
export interface FacultyMentorProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  department: string | null;
  designation: string | null;
  employeeId: string | null;
  role: UserRole;
  status: UserStatus;
  maxCapacity: number;
  assignedCount: number;
  availableCapacity: number;
  createdAt: string;
}

export interface FacultyMentorAssignment {
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

export interface FacultyMenteeDetail {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  rollNumber: string | null;
  department: string | null;
  batch: string | null;
  cgpa: number | null;
  currentSemester: number | null;
  backlogsCount: number;
  skills: string[];
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    attendancePercentage: number;
  };
  internship: {
    id: string;
    title: string;
    companyName: string;
    type: string;
    startDate: string;
    endDate: string | null;
    status: string;
  } | null;
  logbooks: {
    total: number;
    pending: number;
    approved: number;
    revisionRequired: number;
    submitted: number;
  };
  documents: { id: string; type: string; fileName: string; status: string; uploadDate: string }[];
  evaluation: InternshipEvaluation | null;
  tasks: { id: string; title: string; status: string; deadline: string }[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskReasons: string[];
  assignedAt?: string;
  assignmentId?: string;
  // Extended 360° fields
  assignment?: FacultyMentorAssignment;
  academics?: StudentAcademicProfile | null;
  weeklyReports?: WeeklyReport[];
  mentorNotes?: MentorNote[];
  mentorReviews?: MentorReview[];
  actionItems?: MentorActionItem[];
  timeline?: MentoringTimelineEvent[];
}

export interface MentorNote {
  id: string;
  mentorId: string;
  studentId: string;
  type: 'NOTE' | 'GUIDANCE' | 'CONCERN' | 'ACTION_ITEM';
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MentorActionItem {
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

export interface MentorReview {
  id: string;
  mentorId: string;
  mentorName: string;
  studentId: string;
  internshipId?: string;
  weeklyReportId?: string;
  reviewType: 'ATTENDANCE' | 'TASK' | 'WEEKLY_REPORT' | 'GENERAL' | 'PERFORMANCE';
  rating?: number;
  comment?: string;
  feedback?: string;
  strengths?: string;
  concerns?: string;
  actionItems?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MentoringTimelineEvent {
  id: string;
  type: 'NOTE' | 'GUIDANCE' | 'CONCERN' | 'ACTION_ITEM' | 'REVIEW';
  title: string;
  content: string;
  createdAt: string;
  authorName?: string;
  metadata?: Record<string, any>;
}

export interface StudentRequiringAttention extends FacultyMenteeDetail {
  attentionReasons: string[];
}

export interface FacultyDashboardData {
  totalMentees: number;
  averageAttendance: number;
  atRiskStudents: number;
  pendingLogbooks: number;
  activeInterns: number;
  maxCapacity: number;
  availableCapacity: number;
  mentorProfile?: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    department: string | null;
    designation: string | null;
    employeeId: string | null;
    maxCapacity: number;
    assignedCount: number;
  };
  studentsRequiringAttention: StudentRequiringAttention[];
  mentees: FacultyMenteeDetail[];
}

export interface StudentMentorInfo {
  mentor: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    department: string | null;
    designation: string | null;
    employeeId: string | null;
    status: string;
    assignedAt?: string;
  } | null;
  assignment: FacultyMentorAssignment | null;
}

export interface StudentMentorFeedbackData {
  mentor: StudentMentorInfo['mentor'];
  assignment: FacultyMentorAssignment | null;
  latestReview?: MentorReview | null;
  reviews: MentorReview[];
  notes: MentorNote[];
  actionItems: MentorActionItem[];
  timeline: MentoringTimelineEvent[];
}

