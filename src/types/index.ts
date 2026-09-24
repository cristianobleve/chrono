export type IssuePriority = "urgent" | "high" | "medium" | "low" | "none";
export type Priority = IssuePriority;
export type IssueStatus = "backlog" | "todo" | "in_progress" | "done" | "canceled";
export type ProjectStatus = "Planned" | "In Progress" | "Completed" | "Backlog" | "Paused" | "Canceled";

export type AccountRole = "owner" | "admin" | "member" | "guest";

export interface Account {
  id: string;
  identifier?: string; // e.g. "ACC-1"
  internalId?: string; // e.g. "acc_cristiano_01"
  name: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  role: AccountRole;
  workspaces?: string[]; // IDs of workspaces accessible
  activeWorkspaceId?: string;
  createdAt: string;
  coverUrl?: string | null;
  coverGradient?: string | null;
  department?: string | null;
  title?: string | null;
  bio?: string | null;
  location?: string | null;
  timezone?: string | null;
  phone?: string | null;
  github?: string | null;
  twitter?: string | null;
  website?: string | null;
}

export interface Workspace {
  id: string;
  identifier?: string; // e.g. "WS-1"
  internalId?: string; // e.g. "wrk_chrono_01"
  name: string;
  slug: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  logoUrl?: string | null;
  fiscalYearStart?: string;
  region?: string;
  plan?: "Free" | "Pro" | "Enterprise";
  role?: AccountRole;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  accountId: string;
  account: Account;
  role: "owner" | "admin" | "member" | "guest";
  joinedAt: string;
}

export type SupabaseSyncStatus = "connected" | "offline" | "syncing" | "error";

export interface User {
  id: string;
  identifier?: string; // e.g. "USR-1"
  internalId?: string; // e.g. "usr_cristiano_01"
  name: string;
  email: string;
  avatarUrl?: string | null;
  username: string;
  role?: string;
  avatar?: string | null;
  coverUrl?: string | null;
  coverGradient?: string | null;
  department?: string | null;
  title?: string | null;
  bio?: string | null;
  location?: string | null;
  timezone?: string | null;
  phone?: string | null;
  github?: string | null;
  twitter?: string | null;
  website?: string | null;
}

export interface Team {
  id: string;
  identifier?: string; // e.g. "TEM-1"
  internalId?: string; // e.g. "team_first_01"
  name: string;
  key: string;
  icon?: string;
  color?: string;
  workspaceId?: string;
  members: User[];
}

export interface ProjectPhase {
  id: string;
  identifier?: string; // e.g. "PHS-1"
  name: string;
  status: "Planned" | "In Progress" | "Completed";
  progress: number;
}

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
  category?: "github" | "gitlab" | "figma" | "docs" | "web" | "discord" | "twitter" | "custom" | string;
}

export interface Milestone {
  id: string;
  name: string;
  targetDate?: string | null;
  completed: boolean;
  projectId?: string;
  sortOrder?: number;
  description?: string;
}

export interface ProjectUpdate {
  id: string;
  body: string;
  status: "on_track" | "at_risk" | "off_track";
  projectId: string;
  authorId: string;
  author?: User;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  projectId?: string;
  user?: User;
  details?: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  identifier?: string; // e.g. "PRJ-1", "PRJ-2"
  internalId?: string; // e.g. "prj_casd_98f"
  name: string;
  slug: string;
  summary: string;
  description: string;
  status: "Planned" | "In Progress" | "Completed" | "Backlog" | "Paused" | "Canceled";
  priority: IssuePriority;
  lead?: User | null;
  leadId?: string;
  targetDate?: string | null;
  startDate?: string | null;
  phases?: ProjectPhase[];
  milestones?: Milestone[];
  updates?: ProjectUpdate[];
  activities?: ActivityLog[];
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  iconSymbol?: string;
  iconCustomEmoji?: string;
  iconShape?: "squircle" | "circle" | "rounded";
  coverUrl?: string | null;
  coverGradient?: string | null;
  members?: User[];
  teamId?: string;
  workspaceId?: string;
  links?: ProjectLink[];
  parentProjectId?: string | null;
  relatedProjectIds?: string[];
  folderId?: string | null;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
  issuesCount?: {
    total: number;
    done: number;
    inProgress: number;
    todo: number;
    backlog: number;
  };
}

export type IssueRecurrence = "none" | "daily" | "weekly" | "monthly" | "custom";
export type EisenhowerQuadrant = "q1" | "q2" | "q3" | "q4";

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  workspaceId?: string;
}

export interface Habit {
  id: string;
  title: string;
  category?: string;
  icon?: string;
  color?: string;
  frequency: "daily" | "weekly";
  targetDays?: number[]; // [1, 2, 3, 4, 5] for Mon-Fri
  completedDates: string[]; // ['2026-08-31', '2026-08-30']
  streak: number;
  createdAt: string;
  workspaceId?: string;
}

export interface ProjectFolder {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  projectIds?: string[];
  workspaceId?: string;
}

export interface PomodoroSession {
  id: string;
  issueId?: string | null;
  duration: number; // in seconds
  type: "focus" | "short_break" | "long_break";
  completedAt: string;
  workspaceId?: string;
}

export interface Issue {
  id: string;
  identifier: string; // e.g. "FIR-1"
  internalId?: string; // e.g. "iss_casd_481"
  title: string;
  description?: string;
  priority: IssuePriority;
  status: IssueStatus;
  teamId: string;
  team?: Team;
  workspaceId?: string;
  projectId?: string | null;
  project?: Project | null;
  milestoneId?: string | null;
  milestone?: Milestone | null;
  assigneeId?: string | null;
  assignee?: User | null;
  creatorId?: string | null;
  creator?: User | null;
  dueDate?: string | null;
  dueTime?: string | null;
  reminderDate?: string | null;
  reminderTime?: string | null;
  recurrence?: IssueRecurrence | null;
  recurrenceDays?: number[] | null;
  recurrenceInterval?: number | null;
  cronExpression?: string | null;
  cronHumanReadable?: string | null;
  eisenhowerQuadrant?: EisenhowerQuadrant | null;
  labels?: string[];
  tags?: string[];
  estimate?: number | null;
  sortOrder?: number | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  modelId?: string;
  actionResult?: {
    type: "issue_created" | "project_created" | "project_deleted" | "projects_updated" | "issues_updated" | "bulk_projects_imported" | "info" | (string & {});
    data?: any;
  };
}

export interface AgentChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  icon: string;
  label: string;
  category: "sprint" | "architecture" | "debug" | "tokens" | "refactor";
  prompt: string;
  description: string;
}

export interface AgentCustomConfig {
  modelId: string;
  customName?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string; // Custom Base URL / Docker container endpoint e.g. http://localhost:11434 / http://vllm:8000
  apiKey?: string;  // Dedicated API key override
  enabledSkills?: string[];
  reasoningEffort?: "low" | "medium" | "high";
  isCustom?: boolean;
}

export interface UserPreferences {
  defaultHomeView: "agent" | "inbox" | "my_issues" | "all_issues" | "active_issues" | "current_cycle" | "projects";
  displayNames: "username" | "full_name" | "first_name";
  firstDayOfWeek: "sunday" | "monday";
  convertEmoticons: boolean;
  sendCommentsOn: "ctrl_enter" | "enter";
  fontSize: "small" | "default" | "large";
  usePointerCursors: boolean;
  underlineLinks: boolean;
  theme: "dark" | "light" | "system";
  language?: "it" | "en" | "de" | "fr" | "es" | "ru";
  geminiApiKey?: string;
  aiModel?: string;
  // Multi-Provider API Keys
  apiKeys?: {
    gemini?: string;
    claude?: string;
    openai?: string;
    deepseek?: string;
    mistral?: string;
    llama?: string;
    grok?: string;
    perplexity?: string;
    ollama?: string;
    qwen?: string;
    openrouter?: string;
    custom?: string;
  };
  // Base URLs for Containerization (Docker / Ollama / LocalAI / Proxies)
  baseUrls?: {
    ollama?: string;
    vllm?: string;
    custom?: string;
    openrouter?: string;
  };
  // Per-Agent Custom Configurations
  agentConfigs?: Record<string, AgentCustomConfig>;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  type?: "success" | "info" | "warning" | "error";
}

export type TrashCategory = "project" | "issue" | "habit" | "tag" | "folder";

export interface TrashItem {
  id: string;
  originalId: string;
  category: TrashCategory;
  title: string;
  description?: string;
  workspaceId: string;
  deletedAt: string;
  deletedBy?: string;
  // Serialized original payload for perfect 1-click restore
  payload: any;
}

export type TimelineActionType =
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "project_restored"
  | "issue_created"
  | "issue_updated"
  | "issue_status_changed"
  | "issue_priority_changed"
  | "issue_deleted"
  | "issue_restored"
  | "milestone_created"
  | "milestone_completed"
  | "milestone_deleted"
  | "workspace_created"
  | "workspace_updated"
  | "member_joined"
  | "habit_completed";

export type TimelineEntityType = "project" | "issue" | "milestone" | "workspace" | "member" | "habit";

export interface TimelineDiffItem {
  field: string;
  label?: string;
  oldValue?: any;
  newValue?: any;
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO string
  workspaceId: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string | null;
  authorRole?: string;
  action: TimelineActionType;
  entityType: TimelineEntityType;
  entityId: string;
  entityIdentifier?: string; // e.g. "PRJ-1", "FIR-12"
  entityTitle: string;
  entityHref?: string; // e.g. "/project/prj-1" or "/issues"
  description: string;
  diff?: TimelineDiffItem[];
  metadata?: Record<string, any>;
}
