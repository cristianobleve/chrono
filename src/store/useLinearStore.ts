import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import {
  Project,
  Issue,
  Milestone,
  ProjectUpdate,
  ActivityLog,
  User,
  Workspace,
  Account,
  AccountRole,
  Team,
  UserPreferences,
  ToastMessage,
  ChatMessage,
  AgentChatSession,
  Tag,
  Habit,
  ProjectFolder,
  EisenhowerQuadrant,
  IssueStatus,
  IssuePriority,
  IssueRecurrence,
  SupabaseSyncStatus,
  TrashItem,
  TrashCategory,
  TimelineEvent,
  TimelineActionType,
  TimelineEntityType,
  TimelineDiffItem,
} from "@/types";
import { ParsedProjectImport } from "@/lib/markdownProjectParser";
import { supabaseSync } from "@/lib/supabaseSync";
import { formatUserDisplayName } from "@/lib/userUtils";
import { sortMilestones } from "@/lib/utils";

const initialAccounts: Account[] = [];
const initialWorkspaces: Workspace[] = [];
const initialMilestones: Milestone[] = [];
const initialProjects: Project[] = [];
const initialIssues: Issue[] = [];

const DEMO_MILESTONES_TEMPLATE: Milestone[] = [
  {
    id: "ms-nebula-1",
    projectId: "a0000000-0000-4000-8000-000000000001",
    name: "M1: Postgres RLS & WebSocket Engine",
    targetDate: "2026-09-15",
    completed: true,
    sortOrder: 1,
  },
  {
    id: "ms-nebula-2",
    projectId: "a0000000-0000-4000-8000-000000000001",
    name: "M2: Model Context Protocol Gateway (stdio)",
    targetDate: "2026-10-10",
    completed: false,
    sortOrder: 2,
  },
  {
    id: "ms-nebula-3",
    projectId: "a0000000-0000-4000-8000-000000000001",
    name: "M3: Keyboard-First Command Palette & Polish",
    targetDate: "2026-10-25",
    completed: false,
    sortOrder: 3,
  },
  {
    id: "ms-nebula-4",
    projectId: "a0000000-0000-4000-8000-000000000001",
    name: "M4: Public Release v1.0.0",
    targetDate: "2026-11-15",
    completed: false,
    sortOrder: 4,
  },
];

const DEMO_PROJECTS_TEMPLATE: Project[] = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    identifier: "PRJ-101",
    internalId: "prj_nebula_core",
    name: "Nebula Core Engine",
    slug: "nebula-core-engine",
    summary: "Motore di sincronizzazione in tempo reale e gateway agenti MCP.",
    description: "Architettura ad alte prestazioni per il coordinamento di team distribuiti e agenti autonomi.",
    status: "In Progress",
    priority: "high",
    startDate: "2026-09-01",
    targetDate: "2026-11-30",
    icon: "N",
    iconBg: "#181a20",
    iconColor: "#6366f1",
    workspaceId: "",
    teamId: "team-1",
    milestones: DEMO_MILESTONES_TEMPLATE,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
    issuesCount: {
      total: 17,
      done: 4,
      inProgress: 3,
      todo: 4,
      backlog: 4,
    },
  },
];

const DEMO_ISSUES_TEMPLATE: Issue[] = [
  // Backlog
  {
    id: "iss-fir-240",
    identifier: "FIR-240",
    internalId: "iss_fir_240",
    title: "Ricerca semantica vettoriale tramite pgvector",
    description: "Indicizzare descrizioni e commenti delle issue per permettere query in linguaggio naturale ad alta pertinenza.",
    status: "backlog",
    priority: "low",
    estimate: 5,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-3",
    labels: ["AI", "Database"],
    tags: ["pgvector", "ricerca"],
    teamId: "team-1",
    workspaceId: "",
    createdAt: "2026-09-18T10:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },
  {
    id: "iss-fir-241",
    identifier: "FIR-241",
    internalId: "iss_fir_241",
    title: "Supporto esportazione audit log in formato JSONL",
    description: "Tracciare ogni mutazione di stato con autore, timestamp e diff delle proprietà esportabile.",
    status: "backlog",
    priority: "medium",
    estimate: 3,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-4",
    labels: ["Compliance", "Audit"],
    tags: ["export", "sicurezza"],
    teamId: "team-1",
    workspaceId: "",
    createdAt: "2026-09-18T11:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },
  {
    id: "iss-fir-242",
    identifier: "FIR-242",
    internalId: "iss_fir_242",
    title: "Integrazione webhook bidirezionali verso Linear e GitHub",
    description: "Sincronizzare PR chiuse e commit su branch dedicati con le issue corrispondenti in Chrono.",
    status: "backlog",
    priority: "medium",
    estimate: 5,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-4",
    labels: ["Integrazioni"],
    tags: ["github", "webhook"],
    teamId: "team-1",
    workspaceId: "",
    createdAt: "2026-09-19T09:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },
  {
    id: "iss-fir-243",
    identifier: "FIR-243",
    internalId: "iss_fir_243",
    title: "Modalità offline con indexedDB fallback e sync reconciliation",
    description: "Consentire la modifica di issue offline con accodamento mutazioni e risoluzione conflitti alla riconnessione.",
    status: "backlog",
    priority: "low",
    estimate: 8,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-4",
    labels: ["PWA", "Offline"],
    tags: ["storage", "cache"],
    teamId: "team-1",
    workspaceId: "",
    createdAt: "2026-09-19T14:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },

  // Todo
  {
    id: "iss-fir-244",
    identifier: "FIR-244",
    internalId: "iss_fir_244",
    title: "Refactor gestione subscription realtime su tab inattivi",
    description: "Mettere in pausa i canali WebSocket quando la scheda del browser perde il focus per ottimizzare il traffico di rete.",
    status: "todo",
    priority: "high",
    estimate: 3,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-2",
    labels: ["Performance", "Network"],
    tags: ["websocket", "realtime"],
    teamId: "team-1",
    workspaceId: "",
    createdAt: "2026-09-20T10:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },
  {
    id: "iss-fir-245",
    identifier: "FIR-245",
    internalId: "iss_fir_245",
    title: "Validazione permessi granulari per account Associato",
    description: "Verificare che i membri con ruolo Associato non possano modificare le impostazioni del workspace o eliminare progetti.",
    status: "todo",
    priority: "urgent",
    estimate: 2,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-2",
    labels: ["Security", "Auth"],
    tags: ["ruoli", "permessi"],
    teamId: "team-1",
    workspaceId: "",
    createdAt: "2026-09-20T11:30:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },
  {
    id: "iss-fir-246",
    identifier: "FIR-246",
    internalId: "iss_fir_246",
    title: "Generazione automatica changelog da commit e PR",
    description: "Creare un sommario formattato in markdown delle issue completate tra due tag Git consecutivi.",
    status: "todo",
    priority: "medium",
    estimate: 3,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-3",
    labels: ["DevOps"],
    tags: ["changelog", "release"],
    teamId: "team-1",
    workspaceId: "",
    createdAt: "2026-09-21T09:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },
  {
    id: "iss-fir-247",
    identifier: "FIR-247",
    internalId: "iss_fir_247",
    title: "Ottimizzazione bundle size icone Lucide su route dinamiche",
    description: "Rimuovere import indiscriminati e isolare i chunk dei componenti per ridurre First Load JS sotto i 100 kB.",
    status: "todo",
    priority: "low",
    estimate: 2,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-3",
    labels: ["Frontend", "Performance"],
    tags: ["webpack", "nextjs"],
    teamId: "team-1",
    workspaceId: "",
    createdAt: "2026-09-21T14:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },

  // In Progress
  {
    id: "iss-fir-248",
    identifier: "FIR-248",
    internalId: "iss_fir_248",
    title: "Stress test query multi-tenant con 1000 canali simultanei",
    description: "Simulare carichi elevati di mutazioni concorrenti su PostgreSQL per verificare i limiti di saturazione di Supabase Realtime.",
    status: "in_progress",
    priority: "urgent",
    estimate: 5,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-2",
    labels: ["Backend", "QA"],
    tags: ["stress-test", "postgres"],
    teamId: "team-1",
    workspaceId: "",
    createdAt: "2026-09-22T08:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },
  {
    id: "iss-fir-249",
    identifier: "FIR-249",
    internalId: "iss_fir_249",
    title: "Integrazione tool MCP list_members e get_workspace_summary",
    description: "Esporre metriche aggregate e roster collaboratori al client Claude Desktop e Cursor tramite protocollo stdio.",
    status: "in_progress",
    priority: "high",
    estimate: 3,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-2",
    labels: ["MCP", "AI"],
    tags: ["protocol", "agent"],
    teamId: "team-1",
    workspaceId: "",
    createdAt: "2026-09-22T11:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },
  {
    id: "iss-fir-250",
    identifier: "FIR-250",
    internalId: "iss_fir_250",
    title: "Micro-interazioni di transizione stato issue con Framer Motion",
    description: "Aggiungere feedback aptico visivo fluido durante il cambio stato delle issue in vista Kanban ed Elenco.",
    status: "in_progress",
    priority: "medium",
    estimate: 2,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-3",
    labels: ["Design", "Frontend"],
    tags: ["animazioni", "ux"],
    teamId: "team-1",
    workspaceId: "",
    createdAt: "2026-09-22T15:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },

  // Done
  {
    id: "iss-fir-253",
    identifier: "FIR-253",
    internalId: "iss_fir_253",
    title: "Server Model Context Protocol conforme a specifica 2024-11-05",
    description: "17 strumenti tipizzati Zod su stdio per interrogare e modificare workspace, progetti, milestone e issue.",
    status: "done",
    priority: "urgent",
    estimate: 5,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-1",
    labels: ["MCP", "Core"],
    tags: ["mcp", "stdio"],
    teamId: "team-1",
    workspaceId: "",
    completedAt: "2026-09-23T12:00:00.000Z",
    createdAt: "2026-09-15T09:00:00.000Z",
    updatedAt: "2026-09-23T12:00:00.000Z",
  },
  {
    id: "iss-fir-254",
    identifier: "FIR-254",
    internalId: "iss_fir_254",
    title: "Autenticazione PKCE e gestione sessioni Supabase SSR",
    description: "Flusso di login deterministico con cookie HTTP-only sicuri e refresh automatico del token di accesso.",
    status: "done",
    priority: "urgent",
    estimate: 3,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-1",
    labels: ["Auth", "Security"],
    tags: ["pkce", "supabase"],
    teamId: "team-1",
    workspaceId: "",
    completedAt: "2026-09-23T16:00:00.000Z",
    createdAt: "2026-09-16T10:00:00.000Z",
    updatedAt: "2026-09-23T16:00:00.000Z",
  },
  {
    id: "iss-fir-255",
    identifier: "FIR-255",
    internalId: "iss_fir_255",
    title: "Palette cromatica dark obsidian con contrasto WCAG AA",
    description: "Standardizzazione token #08090b, bordi hairline e superfici scure per eliminare gradienti spuri e affaticamento visivo.",
    status: "done",
    priority: "medium",
    estimate: 2,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-1",
    labels: ["Design System"],
    tags: ["a11y", "dark-mode"],
    teamId: "team-1",
    workspaceId: "",
    completedAt: "2026-09-23T18:00:00.000Z",
    createdAt: "2026-09-17T11:00:00.000Z",
    updatedAt: "2026-09-23T18:00:00.000Z",
  },
  {
    id: "iss-fir-256",
    identifier: "FIR-256",
    internalId: "iss_fir_256",
    title: "Tabella Kanban con riordino colonne e drag-and-drop",
    description: "Visualizzazione intuitiva per fasi operative con conteggio dinamico e aggiornamento atomico dello stato.",
    status: "done",
    priority: "high",
    estimate: 5,
    projectId: "a0000000-0000-4000-8000-000000000001",
    milestoneId: "ms-nebula-1",
    labels: ["Frontend", "UX"],
    tags: ["kanban", "board"],
    teamId: "team-1",
    workspaceId: "",
    completedAt: "2026-09-24T00:00:00.000Z",
    createdAt: "2026-09-17T15:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  },
];

const initialTags: Tag[] = [];

const initialHabits: Habit[] = [];

const initialProjectFolders: ProjectFolder[] = [];

const initialUser: User = {
  id: "",
  identifier: "USR-0",
  internalId: "usr_guest",
  name: "",
  username: "",
  email: "",
  role: "member",
  avatar: null,
};

export const emptyWorkspace: Workspace = {
  id: "",
  identifier: "",
  internalId: "",
  name: "",
  slug: "",
  icon: "chrono",
  iconBg: "#121419",
  iconColor: "#5e6ad2",
  plan: "Free",
  createdAt: "",
  updatedAt: "",
};

const initialWorkspace: Workspace = emptyWorkspace;

const initialTeam: Team = {
  id: "",
  identifier: "TEM-1",
  internalId: "team_core",
  name: "Core",
  key: "COR",
  icon: "zap",
  workspaceId: "",
  members: [],
};

const initialSessionId = "session-1";
const initialChatSessions: AgentChatSession[] = [
  {
    id: initialSessionId,
    title: "Chrono Agent",
    messages: [
      {
        id: "msg-welcome-1",
        sender: "agent",
        text: `Ciao! Sono il tuo **Chrono Agent** collegato in tempo reale al workspace.

Come posso supportare il tuo team oggi?
- Scomporre feature e requisiti in issue dettagliate
- Pianificare nuovi progetti e definire roadmap ad alta precisione
- Monitorare l'avanzamento dei task nel backlog ed eseguire azioni di massa`,
        timestamp: "12:00",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const getSavedLang = (): "it" | "en" | "de" | "fr" | "es" | "ru" => {
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem("chrono_language");
      if (saved && ["it", "en", "de", "fr", "es", "ru"].includes(saved)) {
        return saved as any;
      }
    } catch (_) {}
  }
  return "it";
};

const initialPreferences: UserPreferences = {
  defaultHomeView: "agent",
  displayNames: "full_name",
  firstDayOfWeek: "sunday",
  convertEmoticons: true,
  sendCommentsOn: "ctrl_enter",
  fontSize: "default",
  usePointerCursors: false,
  underlineLinks: false,
  theme: "dark",
  language: getSavedLang(),
  geminiApiKey: "",
  aiModel: "gemini-flash-lite-latest",
};

const initialTimelineEvents: TimelineEvent[] = [];

export interface PomodoroState {
  activeIssueId: string | null;
  mode: "focus" | "short_break" | "long_break";
  timeLeft: number; // in seconds
  isRunning: boolean;
  completedSessions: number;
}

interface LinearState {
  currentUser: User;
  workspace: Workspace;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  accounts: Account[];
  currentAccountId: string;
  supabaseStatus: SupabaseSyncStatus;
  team: Team;
  projects: Project[];
  issues: Issue[];
  habits: Habit[];
  tags: Tag[];
  projectFolders: ProjectFolder[];
  trash: TrashItem[];
  pomodoro: PomodoroState;
  preferences: UserPreferences;
  chatSessions: AgentChatSession[];
  activeSessionId: string;
  activeModal: "new_project" | "new_issue" | "import_project" | "command_menu" | "new_workspace" | "new_account" | null;
  selectedIssueId: string | null;
  sidebarCollapsed: boolean;
  toasts: ToastMessage[];

  // Timeline / Historical Cronoprogramma
  timelineEvents: TimelineEvent[];
  isTimelineDrawerOpen: boolean;
  setTimelineDrawerOpen: (open: boolean) => void;
  toggleTimelineDrawer: () => void;
  addTimelineEvent: (eventData: {
    action: TimelineActionType;
    entityType: TimelineEntityType;
    entityId: string;
    entityIdentifier?: string;
    entityTitle: string;
    entityHref?: string;
    description: string;
    diff?: TimelineDiffItem[];
    metadata?: Record<string, any>;
    workspaceId?: string;
  }) => TimelineEvent;
  clearTimeline: (workspaceId?: string) => void;

  // Workspace Actions
  isWorkspaceLoading: boolean;
  switchWorkspace: (workspaceId: string, router?: any) => Promise<void>;
  createWorkspace: (workspaceData: Partial<Workspace>, includeDemoData?: boolean) => Workspace;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;

  // Account Actions
  switchAccount: (accountId: string) => void;
  addAccount: (accountData: Partial<Account>) => Account;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  updateCurrentUser: (updates: Partial<User>) => void;

  // Supabase Sync Actions
  syncWithSupabase: () => Promise<void>;
  pushToSupabase: () => Promise<{ success: boolean; error?: string }>;
  pullFromSupabase: () => Promise<boolean>;
  restorePreviousUserData: () => Promise<void>;

  // Trash & Soft-Delete Actions
  restoreFromTrash: (trashId: string) => void;
  permanentDeleteFromTrash: (trashId: string) => void;
  emptyTrash: (category?: TrashCategory) => void;

  // Actions
  setActiveModal: (modal: "new_project" | "new_issue" | "import_project" | "command_menu" | "new_workspace" | "new_account" | null) => void;
  setSelectedIssueId: (id: string | null) => void;
  toggleSidebar: () => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;

  createProject: (projectData: Partial<Project>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  bulkUpdateProjects: (
    filter: "all" | string | string[],
    updates: Partial<Project>,
    options?: { exclude?: string | string[] }
  ) => number;
  deleteProject: (id: string) => void;

  importProjectFromMarkdown: (parsedData: ParsedProjectImport) => Project;
  importBulkProjectsFromMarkdown: (projectsData: ParsedProjectImport[]) => Project[];

  createIssue: (issueData: Partial<Issue>) => Issue;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  bulkUpdateIssues: (
    filter: "all" | string | string[],
    updates: Partial<Issue>,
    options?: { exclude?: string | string[] }
  ) => number;
  deleteIssue: (id: string) => void;
  moveIssueToStatus: (id: string, status: IssueStatus) => void;
  moveIssueToQuadrant: (id: string, quadrant: EisenhowerQuadrant) => void;

  // Habit Actions
  addHabit: (habitData: Omit<Habit, "id" | "streak" | "completedDates" | "createdAt">) => Habit;
  toggleHabitDate: (habitId: string, dateStr: string) => void;
  deleteHabit: (habitId: string) => void;

  // Tag Actions
  addTag: (tagData: Omit<Tag, "id">) => Tag;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  // Project Folder Actions
  addProjectFolder: (folderData: Omit<ProjectFolder, "id">) => ProjectFolder;
  deleteProjectFolder: (id: string) => void;

  // Pomodoro Actions
  setPomodoroMode: (mode: "focus" | "short_break" | "long_break") => void;
  setPomodoroRunning: (isRunning: boolean) => void;
  setPomodoroActiveIssue: (issueId: string | null) => void;
  tickPomodoro: () => void;
  resetPomodoro: () => void;

  addMilestone: (projectId: string, milestone: Omit<Milestone, "id" | "projectId">) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
  deleteMilestone: (projectId: string, milestoneId: string) => void;

  addProjectUpdate: (projectId: string, body: string, status: "on_track" | "at_risk" | "off_track") => void;

  updatePreferences: (updates: Partial<UserPreferences>) => void;
  getUserDisplayName: (user?: Partial<User> | null) => string;

  // Chat Session Actions
  createChatSession: (title?: string) => string;
  switchChatSession: (id: string) => void;
  deleteChatSession: (id: string) => void;
  renameChatSession: (id: string, title: string) => void;
  addMessageToActiveSession: (msg: ChatMessage) => void;
  clearActiveSessionMessages: () => void;
}

const safeStorage: StateStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(name);
    } catch (e) {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch (err) {
      console.warn("[Storage Quota] LocalStorage quota exceeded. Purging older version keys...", err);
      const staleKeys = [
        "chrono_app_store",
        "chrono_app_store_v1",
        "chrono_app_store_v2",
        "chrono_app_store_v3",
        "chrono_app_store_v4",
        "chrono_app_store_v5",
        "chrono_app_store_v6",
      ];
      for (const k of staleKeys) {
        try {
          window.localStorage.removeItem(k);
        } catch (_) {}
      }
      try {
        window.localStorage.setItem(name, value);
      } catch (finalErr) {
        console.warn("[Storage Quota] Still exceeded after purge. Falling back to sessionStorage.", finalErr);
        try {
          window.sessionStorage.setItem(name, value);
        } catch (_) {}
      }
    }
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(name);
    } catch (_) {}
  },
};

export const useLinearStore = create<LinearState>()(
  persist(
    (set, get) => ({
      currentUser: initialUser,
      workspace: initialWorkspace,
      workspaces: initialWorkspaces,
      currentWorkspaceId: "",
      isWorkspaceLoading: false,
      accounts: initialAccounts,
      currentAccountId: "",
      supabaseStatus: "connected",
      team: initialTeam,
      projects: initialProjects,
      issues: initialIssues,
      habits: initialHabits,
      tags: initialTags,
      projectFolders: initialProjectFolders,
      trash: [],
      pomodoro: {
        activeIssueId: null,
        mode: "focus",
        timeLeft: 25 * 60,
        isRunning: false,
        completedSessions: 0,
      },
      preferences: initialPreferences,
      chatSessions: initialChatSessions,
      activeSessionId: initialSessionId,
      activeModal: null,
      selectedIssueId: null,
      sidebarCollapsed: false,
      toasts: [],

      // Timeline / Cronoprogramma Storico
      timelineEvents: initialTimelineEvents,
      isTimelineDrawerOpen: false,
      setTimelineDrawerOpen: (open) => set({ isTimelineDrawerOpen: open }),
      toggleTimelineDrawer: () => set((s) => ({ isTimelineDrawerOpen: !s.isTimelineDrawerOpen })),
      addTimelineEvent: (eventData) => {
        const state = get();
        const author = state.currentUser;
        const targetWorkspaceId = eventData.workspaceId || state.currentWorkspaceId || state.workspace?.id || "";

        const newEvent: TimelineEvent = {
          id: "evt-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          timestamp: new Date().toISOString(),
          workspaceId: targetWorkspaceId,
          authorId: author.id || "user",
          authorName: author.name || "Utente",
          authorUsername: author.username || "user",
          authorAvatar: author.avatarUrl || null,
          authorRole: author.role || "member",
          action: eventData.action,
          entityType: eventData.entityType,
          entityId: eventData.entityId,
          entityIdentifier: eventData.entityIdentifier,
          entityTitle: eventData.entityTitle,
          entityHref: eventData.entityHref,
          description: eventData.description,
          diff: eventData.diff,
          metadata: eventData.metadata,
        };

        set((s) => ({
          timelineEvents: [newEvent, ...s.timelineEvents],
        }));

        supabaseSync.syncRecord("timeline_events", "upsert", {
          id: newEvent.id,
          timestamp: newEvent.timestamp,
          workspace_id: newEvent.workspaceId,
          author_id: newEvent.authorId,
          author_name: newEvent.authorName,
          action: newEvent.action,
          entity_type: newEvent.entityType,
          entity_id: newEvent.entityId,
          entity_title: newEvent.entityTitle,
          description: newEvent.description,
          diff: newEvent.diff ? JSON.stringify(newEvent.diff) : null,
        });

        return newEvent;
      },
      clearTimeline: (workspaceId) => {
        const state = get();
        const targetWs = workspaceId || state.currentWorkspaceId;
        set((s) => ({
          timelineEvents: targetWs ? s.timelineEvents.filter((e) => e.workspaceId !== targetWs) : [],
        }));
        get().addToast({
          title: "Cronologia Azzerata",
          description: "La cronologia del workspace è stata ripulita.",
          type: "info",
        });
      },

      // Trash Actions
      restoreFromTrash: (trashId) => {
        const state = get();
        const item = state.trash.find((t) => t.id === trashId);
        if (!item) return;

        const remainingTrash = state.trash.filter((t) => t.id !== trashId);

        if (item.category === "project") {
          set({
            trash: remainingTrash,
            projects: [item.payload, ...state.projects],
          });
          supabaseSync.syncRecord("projects", "upsert", item.payload);
        } else if (item.category === "issue") {
          set({
            trash: remainingTrash,
            issues: [item.payload, ...state.issues],
          });
          supabaseSync.syncRecord("issues", "upsert", item.payload);
        } else if (item.category === "habit") {
          set({
            trash: remainingTrash,
            habits: [item.payload, ...state.habits],
          });
          supabaseSync.syncRecord("habits", "upsert", item.payload);
        } else if (item.category === "tag") {
          set({
            trash: remainingTrash,
            tags: [item.payload, ...state.tags],
          });
          supabaseSync.syncRecord("tags", "upsert", item.payload);
        } else if (item.category === "folder") {
          set({
            trash: remainingTrash,
            projectFolders: [item.payload, ...state.projectFolders],
          });
          supabaseSync.syncRecord("project_folders", "upsert", item.payload);
        }

        get().addTimelineEvent({
          action: item.category === "project" ? "project_restored" : "issue_restored",
          entityType: item.category as any,
          entityId: item.originalId,
          entityTitle: item.title,
          description: `Ripristinato dal Cestino: "${item.title}"`,
        });

        get().addToast({
          title: "Elemento Ripristinato",
          description: `"${item.title}" è stato ripristinato dal Cestino.`,
          type: "success",
        });
      },

      permanentDeleteFromTrash: (trashId) => {
        const state = get();
        const item = state.trash.find((t) => t.id === trashId);
        if (!item) return;

        set({
          trash: state.trash.filter((t) => t.id !== trashId),
        });

        const tableMap: Record<TrashCategory, string> = {
          project: "projects",
          issue: "issues",
          habit: "habits",
          tag: "tags",
          folder: "project_folders",
        };

        const table = tableMap[item.category];
        if (table) {
          supabaseSync.syncRecord(table, "delete", { id: item.originalId });
        }

        get().addToast({
          title: "Eliminazione Definitiva",
          description: `"${item.title}" è stato rimosso per sempre.`,
          type: "info",
        });
      },

      emptyTrash: (category) => {
        const state = get();
        if (category) {
          set({
            trash: state.trash.filter((t) => t.category !== category),
          });
          get().addToast({
            title: "Cestino Svuotato",
            description: `Tutti gli elementi nella categoria ${category} sono stati eliminati.`,
            type: "info",
          });
        } else {
          set({ trash: [] });
          get().addToast({
            title: "Cestino Svuotato",
            description: "Tutti gli elementi nel cestino sono stati eliminati.",
            type: "info",
          });
        }
      },

      // Multi-Workspace Actions
      switchWorkspace: async (workspaceId, router) => {
        const state = get();
        const targetWorkspace = state.workspaces.find((w) => w.id === workspaceId);
        if (!targetWorkspace) return;

        // 1. Immediately activate loading transition & reset modal/issue state
        set({
          isWorkspaceLoading: true,
          workspace: targetWorkspace,
          currentWorkspaceId: workspaceId,
          selectedIssueId: null,
          activeModal: null,
        });

        // 2. If viewing a specific project detail page, navigate to the preferred default home view
        const viewToPath: Record<string, string> = {
          agent: "/agent",
          projects: "/projects",
          all_issues: "/issues",
          my_issues: "/my-issues",
          inbox: "/inbox",
          active_issues: "/issues",
          current_cycle: "/cycles",
        };
        const preferredHome = viewToPath[get().preferences?.defaultHomeView || "agent"] || "/agent";

        if (router && typeof router.push === "function") {
          router.push(preferredHome);
        } else if (typeof window !== "undefined" && window.location.pathname.startsWith("/project")) {
          window.location.href = preferredHome;
        }

        // 3. Pull fresh data from Supabase for this workspace
        try {
          await supabaseSync.pullAllFromSupabase();
        } catch (e) {
          console.warn("Supabase pull on workspace switch:", e);
        }

        // 4. Smooth deliberate transition delay for visual feedback (loading skeleton)
        await new Promise((resolve) => setTimeout(resolve, 550));

        set({ isWorkspaceLoading: false });

        get().addToast({
          title: "Workspace Attivo",
          description: `Passato al workspace "${targetWorkspace.name}"`,
          type: "info",
        });
      },

      createWorkspace: (workspaceData, includeDemoData = false) => {
        const state = get();
        const id = "ws-" + Date.now();
        const wsCount = state.workspaces.length + 1;
        const slug = workspaceData.slug || (workspaceData.name || "workspace")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");

        const newWorkspace: Workspace = {
          id,
          identifier: workspaceData.identifier || `WS-${wsCount}`,
          internalId: workspaceData.internalId || `wrk_${Math.random().toString(36).substring(2, 9)}`,
          name: workspaceData.name || "Nuovo Workspace",
          slug,
          icon: workspaceData.icon || "chrono",
          iconBg: workspaceData.iconBg || "#121419",
          iconColor: workspaceData.iconColor || "#5e6ad2",
          logoUrl: workspaceData.logoUrl || null,
          fiscalYearStart: workspaceData.fiscalYearStart || "January",
          region: workspaceData.region || "European Union",
          plan: "Free",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        let updatedProjects = [...state.projects];
        let updatedIssues = [...state.issues];

        if (includeDemoData && DEMO_PROJECTS_TEMPLATE.length > 0) {
          const demoProjectId = "prj-" + Date.now();
          const demoMilestones: Milestone[] = DEMO_MILESTONES_TEMPLATE.map((m, idx) => ({
            ...m,
            id: `ms-${id}-${idx + 1}`,
            projectId: demoProjectId,
          }));

          const demoProject: Project = {
            ...DEMO_PROJECTS_TEMPLATE[0],
            id: demoProjectId,
            workspaceId: id,
            milestones: demoMilestones,
          };

          const demoIssues: Issue[] = DEMO_ISSUES_TEMPLATE.map((iss, idx) => ({
            ...iss,
            id: `iss-${id}-${idx + 1}`,
            projectId: demoProjectId,
            workspaceId: id,
            milestoneId: demoMilestones[idx % demoMilestones.length]?.id,
          }));

          updatedProjects.push(demoProject);
          updatedIssues.push(...demoIssues);

          void supabaseSync.syncProject(demoProject);
          for (const iss of demoIssues) {
            void supabaseSync.syncIssue(iss);
          }
        }

        set((s) => ({
          workspaces: [...s.workspaces, newWorkspace],
          workspace: newWorkspace,
          currentWorkspaceId: id,
          projects: updatedProjects,
          issues: updatedIssues,
        }));

        supabaseSync.syncWorkspace(newWorkspace);

        get().addTimelineEvent({
          action: "workspace_created",
          entityType: "workspace",
          entityId: newWorkspace.id,
          entityIdentifier: newWorkspace.identifier,
          entityTitle: newWorkspace.name,
          description: `Inizializzato nuovo workspace "${newWorkspace.name}"`,
          workspaceId: newWorkspace.id,
        });

        get().addToast({
          title: "Workspace Creato",
          description: `Il workspace "${newWorkspace.name}" è ora attivo e salvato su Supabase.`,
          type: "success",
        });

        return newWorkspace;
      },

      updateWorkspace: (id, updates) => {
        set((state) => {
          const updatedList = state.workspaces.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
          );
          const currentWs = id === state.currentWorkspaceId
            ? { ...state.workspace, ...updates, updatedAt: new Date().toISOString() }
            : state.workspace;

          return {
            workspaces: updatedList,
            workspace: currentWs,
          };
        });

        const target = get().workspaces.find((w) => w.id === id);
        if (target) {
          supabaseSync.syncWorkspace(target);
        }
      },

      deleteWorkspace: (id) => {
        const state = get();
        if (state.workspaces.length <= 1) {
          get().addToast({
            title: "Operazione Non Consentita",
            description: "Devi mantenere almeno un workspace attivo.",
            type: "warning",
          });
          return;
        }

        const remaining = state.workspaces.filter((w) => w.id !== id);
        const nextActive = state.currentWorkspaceId === id ? remaining[0] : state.workspace;

        set({
          workspaces: remaining,
          workspace: nextActive,
          currentWorkspaceId: nextActive.id,
        });

        supabaseSync.deleteWorkspace(id);

        get().addToast({
          title: "Workspace Eliminato",
          description: "Il workspace è stato rimosso anche da Supabase.",
          type: "info",
        });
      },

      // Multi-Account Actions
      switchAccount: (accountId) => {
        const state = get();
        const targetAcc = state.accounts.find((a) => a.id === accountId);
        if (!targetAcc) return;

        const updatedUser: User = {
          id: targetAcc.id,
          identifier: targetAcc.identifier || "USR-1",
          internalId: targetAcc.internalId || "usr_01",
          name: targetAcc.name,
          username: targetAcc.username,
          email: targetAcc.email,
          role: targetAcc.role,
          avatarUrl: targetAcc.avatarUrl || undefined,
        };

        set({
          currentAccountId: accountId,
          currentUser: updatedUser,
        });

        get().addToast({
          title: "Account Cambiato",
          description: `Accesso effettuato come ${targetAcc.name}`,
          type: "info",
        });
      },

      addAccount: (accountData) => {
        const state = get();
        const id = "user-" + Date.now();
        const accCount = state.accounts.length + 1;

        const newAccount: Account = {
          id,
          identifier: accountData.identifier || `ACC-${accCount}`,
          internalId: accountData.internalId || `acc_${Math.random().toString(36).substring(2, 9)}`,
          name: accountData.name || "Nuovo Membro",
          username: accountData.username || `user_${Math.random().toString(36).substring(2, 6)}`,
          email: accountData.email || `user${accCount}@chrono.engineering`,
          avatarUrl: accountData.avatarUrl || null,
          role: accountData.role || "member",
          workspaces: [state.currentWorkspaceId],
          activeWorkspaceId: state.currentWorkspaceId,
          createdAt: new Date().toISOString(),
        };

        set((s) => ({
          accounts: [...s.accounts, newAccount],
        }));

        supabaseSync.syncRecord("accounts", "upsert", {
          id: newAccount.id,
          name: newAccount.name,
          username: newAccount.username,
          email: newAccount.email,
          avatar_url: newAccount.avatarUrl,
          role: newAccount.role,
        });

        get().addToast({
          title: "Account Aggiunto",
          description: `Account per ${newAccount.name} registrato.`,
          type: "success",
        });

        return newAccount;
      },

      updateAccount: (id, updates) => {
        set((state) => {
          const updatedAccounts = state.accounts.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          );
          const isCurrentUser =
            id === state.currentAccountId || id === state.currentUser.id;
          const updatedCurrentUser = isCurrentUser
            ? {
                ...state.currentUser,
                ...updates,
                name: updates.name || state.currentUser.name,
                username: updates.username || state.currentUser.username,
                email: updates.email || state.currentUser.email,
                avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : state.currentUser.avatarUrl,
                coverUrl: updates.coverUrl !== undefined ? updates.coverUrl : state.currentUser.coverUrl,
                coverGradient: updates.coverGradient !== undefined ? updates.coverGradient : state.currentUser.coverGradient,
              }
            : state.currentUser;

          return {
            accounts: updatedAccounts,
            currentUser: updatedCurrentUser,
          };
        });

        const target = get().accounts.find((a) => a.id === id);
        if (target) {
          supabaseSync.syncAccount(target);
        }
      },

      updateCurrentUser: (updates) => {
        set((state) => {
          const updatedUser = {
            ...state.currentUser,
            ...updates,
            avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : state.currentUser.avatarUrl,
            avatar: updates.avatarUrl !== undefined ? updates.avatarUrl : state.currentUser.avatar,
          };
          const targetId = state.currentUser.id;
          const targetEmail = state.currentUser.email?.toLowerCase();
          const updatedAccounts = state.accounts.map((a) => {
            const isMatch =
              a.id === state.currentAccountId ||
              (targetId && a.id === targetId) ||
              (targetEmail && a.email?.toLowerCase() === targetEmail);
            if (!isMatch) return a;
            return {
              ...a,
              name: updates.name !== undefined ? updates.name : a.name,
              username: updates.username !== undefined ? updates.username : a.username,
              email: updates.email !== undefined ? updates.email : a.email,
              avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : a.avatarUrl,
              role: (updates.role as AccountRole) || a.role,
              department: (updates as any).department !== undefined ? (updates as any).department : a.department,
              title: (updates as any).title !== undefined ? (updates as any).title : a.title,
              bio: (updates as any).bio !== undefined ? (updates as any).bio : a.bio,
              location: (updates as any).location !== undefined ? (updates as any).location : a.location,
              timezone: (updates as any).timezone !== undefined ? (updates as any).timezone : a.timezone,
              phone: (updates as any).phone !== undefined ? (updates as any).phone : a.phone,
              github: (updates as any).github !== undefined ? (updates as any).github : a.github,
              twitter: (updates as any).twitter !== undefined ? (updates as any).twitter : a.twitter,
              website: (updates as any).website !== undefined ? (updates as any).website : a.website,
              coverUrl: (updates as any).coverUrl !== undefined ? (updates as any).coverUrl : a.coverUrl,
              coverGradient: (updates as any).coverGradient !== undefined ? (updates as any).coverGradient : a.coverGradient,
            };
          });
          return {
            currentUser: updatedUser,
            currentAccountId: targetId || state.currentAccountId,
            accounts: updatedAccounts,
          };
        });

        const state = get();
        const effectiveId = state.currentUser.id || state.currentAccountId;
        supabaseSync.syncAccount({
          id: effectiveId,
          name: state.currentUser.name,
          username: state.currentUser.username,
          email: state.currentUser.email,
          avatarUrl: state.currentUser.avatarUrl || null,
          role: state.currentUser.role as AccountRole,
          coverUrl: state.currentUser.coverUrl || null,
          coverGradient: state.currentUser.coverGradient || null,
          department: state.currentUser.department || null,
          title: state.currentUser.title || null,
          bio: state.currentUser.bio || null,
          location: state.currentUser.location || null,
          phone: state.currentUser.phone || null,
          github: state.currentUser.github || null,
          twitter: state.currentUser.twitter || null,
          website: state.currentUser.website || null,
        });

        get().addToast({
          title: "Profilo Salvato",
          description: "Le impostazioni del tuo account sono state aggiornate e sincronizzate.",
          type: "success",
        });
      },

      deleteAccount: (id) => {
        const state = get();
        if (state.accounts.length <= 1) {
          get().addToast({
            title: "Operazione Non Consentita",
            description: "Devi mantenere almeno un account attivo.",
            type: "warning",
          });
          return;
        }

        const remaining = state.accounts.filter((a) => a.id !== id);
        const nextActive = state.currentAccountId === id ? remaining[0] : null;

        set({
          accounts: remaining,
        });

        if (nextActive) {
          get().switchAccount(nextActive.id);
        }

        supabaseSync.syncRecord("accounts", "delete", { id });
      },

      // Supabase Direct Sync routines
      syncWithSupabase: async () => {
        set({ supabaseStatus: "syncing" });
        const health = await supabaseSync.checkConnection();
        if (health.connected) {
          set({ supabaseStatus: "connected" });
          get().addToast({
            title: "Supabase Connesso",
            description: `PostgreSQL online con latenza ${health.latencyMs}ms`,
            type: "success",
          });
        } else {
          set({ supabaseStatus: "error" });
          get().addToast({
            title: "Connessione Supabase Fallita",
            description: health.error || "Impossibile raggiungere il database",
            type: "error",
          });
        }
      },

      pushToSupabase: async () => {
        const state = get();
        if (state.workspaces.length === 0 || !state.currentWorkspaceId) {
          return { success: true };
        }
        set({ supabaseStatus: "syncing" });
        const res = await supabaseSync.pushAllToSupabase({
          workspaces: state.workspaces,
          accounts: state.accounts,
          projects: state.projects,
          issues: state.issues,
          habits: state.habits,
          tags: state.tags,
          folders: state.projectFolders,
          workspaceId: state.currentWorkspaceId,
        });

        if (res.success) {
          set({ supabaseStatus: "connected" });
          get().addToast({
            title: "Cloud Sync Completato",
            description: "Tutti i dati locali sono stati sincronizzati su Supabase",
            type: "success",
          });
          return { success: true };
        } else {
          set({ supabaseStatus: "error" });
          get().addToast({
            title: "Errore Cloud Sync",
            description: res.error || "Errore durante il push",
            type: "error",
          });
          return { success: false, error: res.error };
        }
      },

      pullFromSupabase: async () => {
        set({ supabaseStatus: "syncing" });
        const data = await supabaseSync.pullAllFromSupabase(get().currentWorkspaceId || undefined);
        if (data) {
          const accounts = data.accounts && data.accounts.length > 0 ? data.accounts : get().accounts;
          const currentEmail = get().currentUser.email?.toLowerCase();
          const matchingAccount = currentEmail
            ? accounts.find((a) => a.email?.toLowerCase() === currentEmail)
            : null;

          const remoteWorkspaces = data.workspaces || [];

          // STRICT ISOLATION GUARD: If the authenticated user is not a member of any workspace,
          // purge all workspaces, projects, issues, and associated data immediately.
          if (remoteWorkspaces.length === 0) {
            set({
              supabaseStatus: "connected",
              workspaces: [],
              workspace: emptyWorkspace,
              currentWorkspaceId: "",
              projects: [],
              issues: [],
              habits: [],
              tags: [],
              projectFolders: [],
              trash: [],
              timelineEvents: [],
              accounts: matchingAccount ? [matchingAccount] : [],
              ...(matchingAccount
                ? {
                    currentAccountId: matchingAccount.id,
                    currentUser: {
                      id: matchingAccount.id,
                      identifier: matchingAccount.identifier,
                      internalId: matchingAccount.internalId,
                      name: matchingAccount.name,
                      username: matchingAccount.username,
                      email: matchingAccount.email,
                      role: matchingAccount.role,
                      avatarUrl: matchingAccount.avatarUrl || get().currentUser.avatarUrl || get().currentUser.avatar || undefined,
                    },
                  }
                : {}),
            });
            return true;
          }

          // User is verified member of one or more workspaces.
          // Only accept workspaces verified by Supabase membership.
          const workspaces = remoteWorkspaces;
          const allowedWsIds = new Set(workspaces.map((w) => w.id));

          const currentWorkspaceId = allowedWsIds.has(get().currentWorkspaceId)
            ? get().currentWorkspaceId
            : workspaces[0].id;
          const activeWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

          // Filter collections strictly to allowed workspaces only
          const projects = (data.projects || []).filter((p) => p.workspaceId && allowedWsIds.has(p.workspaceId));
          const issues = (data.issues || []).filter((i) => i.workspaceId && allowedWsIds.has(i.workspaceId));
          const habits = (data.habits || []).filter((h) => !h.workspaceId || allowedWsIds.has(h.workspaceId));
          const tags = (data.tags || []).filter((t) => !t.workspaceId || allowedWsIds.has(t.workspaceId));
          const projectFolders = (data.folders || []).filter((f) => !f.workspaceId || allowedWsIds.has(f.workspaceId));

          set({
            supabaseStatus: "connected",
            workspaces,
            currentWorkspaceId,
            workspace: activeWorkspace,
            accounts: accounts.map((a) => {
              const currentAv = get().currentUser.avatarUrl || get().currentUser.avatar;
              if (matchingAccount && a.id === matchingAccount.id && !a.avatarUrl && currentAv) {
                return { ...a, avatarUrl: currentAv };
              }
              return a;
            }),
            ...(matchingAccount
              ? {
                  currentAccountId: matchingAccount.id,
                  currentUser: {
                    id: matchingAccount.id,
                    identifier: matchingAccount.identifier,
                    internalId: matchingAccount.internalId,
                    name: matchingAccount.name,
                    username: matchingAccount.username,
                    email: matchingAccount.email,
                    role: matchingAccount.role,
                    avatarUrl: matchingAccount.avatarUrl || get().currentUser.avatarUrl || get().currentUser.avatar || undefined,
                  },
                }
              : {}),
            projects,
            issues,
            habits,
            tags,
            projectFolders,
          });

          return true;
        } else {
          set({ supabaseStatus: "offline" });
          return false;
        }
      },

      restorePreviousUserData: async () => {
        // Disabled to prevent obsolete mock versions from corrupting production workspace state
        if (typeof window === "undefined") return;
        const keys = [
          "chrono_app_store_v6",
          "chrono_app_store_v5",
          "chrono_app_store_v4",
          "chrono_app_store_v3",
          "chrono_app_store_v2",
          "chrono_app_store_v1",
        ];
        for (const k of keys) {
          try {
            window.localStorage.removeItem(k);
          } catch (_) {}
        }
      },

      setActiveModal: (modal) => set({ activeModal: modal }),
      setSelectedIssueId: (id) => set({ selectedIssueId: id }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      addToast: (toast) => {
        const id = "toast-" + Date.now() + Math.random().toString(36).substring(2, 5);
        const newToast: ToastMessage = { ...toast, id };
        set((state) => ({ toasts: [...state.toasts, newToast] }));
        setTimeout(() => {
          get().removeToast(id);
        }, 5000);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      createProject: (projectData) => {
        const state = get();
        const id = "proj-" + Date.now();
        const slug = (projectData.name || "project")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 8);

        const projectIndex = state.projects.length + 1;
        const targetWorkspaceId = projectData.workspaceId || state.currentWorkspaceId || state.workspace?.id || "";

        const newProject: Project = {
          id,
          identifier: projectData.identifier || `PRJ-${projectIndex}`,
          internalId: projectData.internalId || `prj_${Math.random().toString(36).substring(2, 9)}`,
          workspaceId: targetWorkspaceId,
          name: projectData.name || "Untitled Project",
          slug: projectData.slug || slug,
          summary: projectData.summary || "",
          description: projectData.description || "",
          status: projectData.status || "Backlog",
          priority: projectData.priority || "none",
          icon: projectData.icon || "L",
          iconColor: projectData.iconColor || "#e53e3e",
          iconBg: projectData.iconBg || "#2a0808",
          coverUrl: projectData.coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
          coverGradient: projectData.coverGradient || null,
          teamId: state.team.id,
          leadId: projectData.leadId || state.currentUser.id,
          lead: projectData.lead || state.currentUser,
          startDate: projectData.startDate || null,
          targetDate: projectData.targetDate || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          milestones: [],
          updates: [],
          activities: [
            {
              id: "act-" + Date.now(),
              action: "created the project",
              details: null,
              projectId: id,
              userId: state.currentUser.id,
              user: state.currentUser,
              createdAt: new Date().toISOString(),
            },
          ],
        };

        set((state) => ({
          projects: [newProject, ...state.projects],
        }));

        supabaseSync.syncProject(newProject);

        get().addTimelineEvent({
          action: "project_created",
          entityType: "project",
          entityId: newProject.id,
          entityIdentifier: newProject.identifier,
          entityTitle: newProject.name,
          entityHref: `/project/${newProject.slug}`,
          description: `Creato nuovo progetto "${newProject.name}" con stato ${newProject.status} e priorità ${newProject.priority}`,
          workspaceId: targetWorkspaceId,
        });

        get().addToast({
          title: "Progetto Creato",
          description: `"${newProject.name}" salvato nel workspace attivo.`,
          actionLabel: "Apri Progetto",
          actionHref: `/project/${newProject.slug}`,
          type: "success",
        });

        return newProject;
      },

      importProjectFromMarkdown: (parsedData) => {
        const state = get();
        const projectId = "proj-" + Date.now();
        const targetWorkspaceId = state.currentWorkspaceId || state.workspace?.id || "";
        const slug = parsedData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 8);

        // 1. Build Milestones
        const milestones: Milestone[] = (parsedData.milestones || []).map((m, idx) => ({
          id: `ms-${Date.now()}-${idx}`,
          name: m.name,
          targetDate: m.targetDate || null,
          completed: m.completed || false,
          sortOrder: idx,
          projectId,
        }));

        // 2. Build Project
        const newProject: Project = {
          id: projectId,
          workspaceId: targetWorkspaceId,
          name: parsedData.name,
          slug,
          summary: parsedData.summary,
          description: parsedData.description,
          status: parsedData.status,
          priority: parsedData.priority,
          icon: "cube",
          teamId: state.team.id,
          leadId: state.currentUser.id,
          lead: state.currentUser,
          startDate: new Date().toISOString().split("T")[0],
          targetDate: parsedData.targetDate || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          milestones: sortMilestones(milestones),
          updates: [
            {
              id: `upd-${Date.now()}`,
              body: `Progetto importato con successo da specifica Markdown contenente ${parsedData.issues.length} issue e ${milestones.length} milestone.`,
              status: "on_track",
              projectId,
              authorId: state.currentUser.id,
              author: state.currentUser,
              createdAt: new Date().toISOString(),
            },
          ],
          activities: [
            {
              id: `act-${Date.now()}`,
              action: "imported project from Markdown",
              details: `Generated ${parsedData.issues.length} issues and ${milestones.length} milestones.`,
              projectId,
              userId: state.currentUser.id,
              user: state.currentUser,
              createdAt: new Date().toISOString(),
            },
          ],
        };

        // 3. Build Issues
        const newIssues: Issue[] = (parsedData.issues || []).map((iss, idx) => {
          const issueId = `issue-${Date.now()}-${idx}`;
          const nextNum = state.issues.length + idx + 1;
          const identifier = `${state.team.key}-${nextNum}`;

          return {
            id: issueId,
            identifier,
            workspaceId: targetWorkspaceId,
            title: iss.title,
            description: iss.description || "",
            status: iss.status,
            priority: iss.priority,
            estimate: iss.estimate || null,
            sortOrder: state.issues.length + idx + 1,
            teamId: state.team.id,
            projectId,
            project: newProject,
            assigneeId: state.currentUser.id,
            assignee: state.currentUser,
            creatorId: state.currentUser.id,
            creator: state.currentUser,
            labels: iss.labels || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });

        set((prevState) => ({
          projects: [newProject, ...prevState.projects],
          issues: [...newIssues, ...prevState.issues],
        }));

        supabaseSync.syncProject(newProject);
        newIssues.forEach((iss) => supabaseSync.syncIssue(iss));

        get().addToast({
          title: "Progetto importato con successo",
          description: `${newProject.name} (${newIssues.length} issue create)`,
          actionLabel: "Apri Progetto",
          actionHref: `/project/${newProject.slug}`,
          type: "success",
        });

        return newProject;
      },

      importBulkProjectsFromMarkdown: (projectsData) => {
        const state = get();
        const createdProjects: Project[] = [];
        const allNewIssues: Issue[] = [];
        let issueCounter = state.issues.length;
        const targetWorkspaceId = state.currentWorkspaceId || state.workspace?.id || "";

        projectsData.forEach((parsedData, pIdx) => {
          const projectId = `proj-${Date.now()}-${pIdx}`;
          const nextPrjNum = state.projects.length + createdProjects.length + 1;
          const identifier = `PRJ-${nextPrjNum}`;
          const internalId = `prj_${Math.random().toString(36).substring(2, 9)}`;
          const slug = `${parsedData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")}-${Math.random().toString(36).substring(2, 8)}`;

          const newMilestones: Milestone[] = (parsedData.milestones || []).map((ms, msIdx) => ({
            id: `ms-${Date.now()}-${pIdx}-${msIdx}`,
            name: ms.name,
            targetDate: ms.targetDate || null,
            completed: ms.completed,
            projectId,
          }));

          const colors = ["#5e6ad2", "#34d399", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6"];
          const bgs = ["#13162b", "#062316", "#261a06", "#260a1a", "#1a0d2e", "#0a192f"];
          const colorIdx = (state.projects.length + pIdx) % colors.length;

          const newProject: Project = {
            id: projectId,
            identifier,
            internalId,
            workspaceId: targetWorkspaceId,
            name: parsedData.name,
            slug,
            summary: parsedData.summary,
            description: parsedData.description,
            status: parsedData.status,
            priority: parsedData.priority,
            icon: parsedData.name.charAt(0).toUpperCase() || "P",
            iconColor: colors[colorIdx],
            iconBg: bgs[colorIdx],
            coverUrl: null,
            teamId: state.team.id,
            leadId: state.currentUser.id,
            lead: state.currentUser,
            startDate: null,
            targetDate: parsedData.targetDate || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            milestones: sortMilestones(newMilestones),
            updates: [],
            activities: [
              {
                id: `act-${Date.now()}-${pIdx}`,
                action: "imported project from bulk Markdown",
                details: `${newMilestones.length} milestones, ${(parsedData.issues || []).length} issues`,
                projectId,
                userId: state.currentUser.id,
                user: state.currentUser,
                createdAt: new Date().toISOString(),
              },
            ],
          };

          // Build project issues
          const projectIssues: Issue[] = (parsedData.issues || []).map((iss) => {
            issueCounter++;
            const issueId = `issue-${Date.now()}-${issueCounter}`;
            const issIdentifier = `${state.team.key}-${issueCounter}`;

            return {
              id: issueId,
              identifier: issIdentifier,
              workspaceId: targetWorkspaceId,
              title: iss.title,
              description: iss.description || "",
              status: iss.status,
              priority: iss.priority,
              estimate: iss.estimate || null,
              sortOrder: issueCounter,
              teamId: state.team.id,
              projectId,
              project: newProject,
              assigneeId: state.currentUser.id,
              assignee: state.currentUser,
              creatorId: state.currentUser.id,
              creator: state.currentUser,
              labels: iss.labels || [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });

          createdProjects.push(newProject);
          allNewIssues.push(...projectIssues);
        });

        set((prevState) => ({
          projects: [...createdProjects, ...prevState.projects],
          issues: [...allNewIssues, ...prevState.issues],
        }));

        createdProjects.forEach((p) => supabaseSync.syncProject(p));
        allNewIssues.forEach((iss) => supabaseSync.syncIssue(iss));

        get().addToast({
          title: "Importazione Multi-Progetto Completata",
          description: `${createdProjects.length} progetti importati (${allNewIssues.length} task create)`,
          actionLabel: "Vedi Progetti",
          actionHref: `/projects`,
          type: "success",
        });

        return createdProjects;
      },

      updateProject: (id, updates) => {
        const state = get();
        const prev = state.projects.find((p) => p.id === id || p.slug === id);

        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id === id || p.slug === id) {
              const updated = {
                ...p,
                ...updates,
                milestones: updates.milestones ? sortMilestones(updates.milestones) : p.milestones,
                updatedAt: new Date().toISOString(),
              };
              return updated;
            }
            return p;
          }),
        }));

        const updatedProj = get().projects.find((p) => p.id === id || p.slug === id);
        if (updatedProj) {
          supabaseSync.syncProject(updatedProj);
        }

        if (prev) {
          const diff: TimelineDiffItem[] = [];
          if (updates.status && updates.status !== prev.status) {
            diff.push({ field: "status", label: "Stato", oldValue: prev.status, newValue: updates.status });
          }
          if (updates.priority && updates.priority !== prev.priority) {
            diff.push({ field: "priority", label: "Priorità", oldValue: prev.priority, newValue: updates.priority });
          }
          if (updates.name && updates.name !== prev.name) {
            diff.push({ field: "name", label: "Titolo", oldValue: prev.name, newValue: updates.name });
          }

          get().addTimelineEvent({
            action: "project_updated",
            entityType: "project",
            entityId: prev.id,
            entityIdentifier: prev.identifier,
            entityTitle: updates.name || prev.name,
            entityHref: `/project/${prev.slug}`,
            description: `Aggiornato il progetto "${updates.name || prev.name}"${
              diff.length > 0 ? ` (${diff.map((d) => `${d.label}: ${d.newValue}`).join(", ")})` : ""
            }`,
            diff: diff.length > 0 ? diff : undefined,
            workspaceId: prev.workspaceId,
          });
        }
      },

      bulkUpdateProjects: (filter, updates, options) => {
        let count = 0;
        const normalizedUpdates = { ...updates };
        if (typeof normalizedUpdates.status === "string") {
          const s = normalizedUpdates.status.toLowerCase().replace(/[^a-z]/g, "");
          if (s.includes("done") || s.includes("complet")) normalizedUpdates.status = "Completed";
          else if (s.includes("todo") || s.includes("plan")) normalizedUpdates.status = "Planned";
          else if (s.includes("progress")) normalizedUpdates.status = "In Progress";
          else if (s.includes("backlog")) normalizedUpdates.status = "Backlog";
          else if (s.includes("pause")) normalizedUpdates.status = "Paused";
          else if (s.includes("cancel")) normalizedUpdates.status = "Canceled";
        }

        set((state) => ({
          projects: state.projects.map((p) => {
            // 1. Check if excluded
            if (options?.exclude) {
              const excl = Array.isArray(options.exclude) ? options.exclude : [options.exclude];
              const isExcluded = excl.some(
                (e) =>
                  e === p.id ||
                  e === p.slug ||
                  e === p.identifier ||
                  e === p.internalId ||
                  (p.name && e.toLowerCase() === p.name.toLowerCase()) ||
                  p.id.includes(e) ||
                  e.includes(p.id) ||
                  (p.slug && p.slug.includes(e))
              );
              if (isExcluded) return p;
            }

            // 2. Check if matches filter
            let isMatch = false;
            if (filter === "all" || !filter) {
              isMatch = true;
            } else if (Array.isArray(filter)) {
              isMatch = filter.some(
                (f) =>
                  f === p.id ||
                  f === p.slug ||
                  f === p.identifier ||
                  f === p.internalId ||
                  (p.name && f.toLowerCase() === p.name.toLowerCase())
              );
            } else if (typeof filter === "string") {
              const f = filter.trim();
              if (f === "all") isMatch = true;
              else if (
                f === p.id ||
                f === p.slug ||
                f === p.identifier ||
                f === p.internalId ||
                (p.name && f.toLowerCase() === p.name.toLowerCase()) ||
                p.id.includes(f) ||
                f.includes(p.id) ||
                (p.slug && p.slug.includes(f))
              ) {
                isMatch = true;
              }
            }

            if (isMatch) {
              count++;
              return {
                ...p,
                ...normalizedUpdates,
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          }),
        }));
        return count;
      },

      deleteProject: (id) => {
        const state = get();
        const project = state.projects.find((p) => p.id === id || p.slug === id);
        if (!project) return;

        const trashItem: TrashItem = {
          id: "trash-" + Date.now(),
          originalId: project.id,
          category: "project",
          title: project.name,
          description: project.summary || project.description?.slice(0, 100),
          workspaceId: state.currentWorkspaceId,
          deletedAt: new Date().toISOString(),
          deletedBy: state.currentUser.name,
          payload: project,
        };

        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id && p.slug !== id),
          trash: [trashItem, ...s.trash],
        }));

        supabaseSync.deleteProject(project.id);

        get().addTimelineEvent({
          action: "project_deleted",
          entityType: "project",
          entityId: project.id,
          entityIdentifier: project.identifier,
          entityTitle: project.name,
          description: `Spostato nel Cestino il progetto "${project.name}"`,
          workspaceId: project.workspaceId,
        });

        get().addToast({
          title: "Progetto Spostato nel Cestino",
          description: `"${project.name}" è ora nel Cestino.`,
          actionLabel: "Apri Cestino",
          actionHref: "/trash",
          type: "info",
        });
      },

      createIssue: (issueData) => {
        const state = get();
        const id = "issue-" + Date.now();
        const nextNum = state.issues.length + 1;
        const identifier = `${state.team.key}-${nextNum}`;

        const targetWorkspaceId = issueData.workspaceId || state.currentWorkspaceId || state.workspace?.id || "";

        const newIssue: Issue = {
          id,
          identifier,
          internalId: issueData.internalId || `iss_${Math.random().toString(36).substring(2, 9)}`,
          workspaceId: targetWorkspaceId,
          title: issueData.title || "Untitled Issue",
          description: issueData.description || "",
          status: issueData.status || "backlog",
          priority: issueData.priority || "none",
          estimate: issueData.estimate || null,
          sortOrder: state.issues.length + 1,
          teamId: state.team.id,
          projectId: issueData.projectId || null,
          assigneeId: issueData.assigneeId || null,
          assignee: issueData.assignee || null,
          creatorId: state.currentUser.id,
          creator: state.currentUser,
          labels: issueData.labels || [],
          dueDate: issueData.dueDate || null,
          dueTime: issueData.dueTime || null,
          reminderDate: issueData.reminderDate || null,
          reminderTime: issueData.reminderTime || null,
          recurrence: issueData.recurrence || "none",
          recurrenceDays: issueData.recurrenceDays || [],
          eisenhowerQuadrant: issueData.eisenhowerQuadrant || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          issues: [newIssue, ...state.issues],
        }));

        supabaseSync.syncIssue(newIssue);

        get().addTimelineEvent({
          action: "issue_created",
          entityType: "issue",
          entityId: newIssue.id,
          entityIdentifier: newIssue.identifier,
          entityTitle: newIssue.title,
          entityHref: `/issues`,
          description: `Creata nuova issue "${newIssue.title}" (${newIssue.identifier}) con stato ${newIssue.status.toUpperCase()} e priorità ${newIssue.priority.toUpperCase()}`,
          workspaceId: targetWorkspaceId,
          metadata: {
            projectId: newIssue.projectId,
            priority: newIssue.priority,
            status: newIssue.status,
          },
        });

        get().addToast({
          title: "Issue Creata",
          description: `${identifier} - ${newIssue.title}`,
          actionLabel: "Vedi Issue",
          actionHref: `/issues`,
          type: "success",
        });

        return newIssue;
      },

      updateIssue: (id, updates) => {
        const state = get();
        const prev = state.issues.find((i) => i.id === id || i.identifier === id);

        set((s) => ({
          issues: s.issues.map((issue) => {
            if (issue.id === id || issue.identifier === id) {
              return {
                ...issue,
                ...updates,
                updatedAt: new Date().toISOString(),
              };
            }
            return issue;
          }),
        }));

        const updatedIssue = get().issues.find((i) => i.id === id || i.identifier === id);
        if (updatedIssue) {
          supabaseSync.syncIssue(updatedIssue);
        }

        if (prev) {
          const diff: TimelineDiffItem[] = [];
          let actionType: TimelineActionType = "issue_updated";

          if (updates.status && updates.status !== prev.status) {
            diff.push({ field: "status", label: "Stato", oldValue: prev.status, newValue: updates.status });
            actionType = "issue_status_changed";
          }
          if (updates.priority && updates.priority !== prev.priority) {
            diff.push({ field: "priority", label: "Priorità", oldValue: prev.priority, newValue: updates.priority });
            if (actionType === "issue_updated") actionType = "issue_priority_changed";
          }

          get().addTimelineEvent({
            action: actionType,
            entityType: "issue",
            entityId: prev.id,
            entityIdentifier: prev.identifier,
            entityTitle: updates.title || prev.title,
            entityHref: `/issues`,
            description: `Modificata issue "${updates.title || prev.title}" (${prev.identifier})${
              diff.length > 0 ? ` [${diff.map((d) => `${d.label}: ${d.newValue}`).join(", ")}]` : ""
            }`,
            diff: diff.length > 0 ? diff : undefined,
            workspaceId: prev.workspaceId || state.currentWorkspaceId,
            metadata: {
              projectId: prev.projectId,
            },
          });
        }
      },

      bulkUpdateIssues: (filter, updates, options) => {
        let count = 0;
        const normalizedUpdates = { ...updates };
        if (typeof normalizedUpdates.status === "string") {
          const s = normalizedUpdates.status.toLowerCase().replace(/[^a-z]/g, "");
          if (s.includes("done") || s.includes("complet")) normalizedUpdates.status = "done";
          else if (s.includes("progress")) normalizedUpdates.status = "in_progress";
          else if (s.includes("todo") || s.includes("plan")) normalizedUpdates.status = "todo";
          else if (s.includes("backlog")) normalizedUpdates.status = "backlog";
          else if (s.includes("cancel")) normalizedUpdates.status = "canceled";
        }

        set((state) => ({
          issues: state.issues.map((issue) => {
            // 1. Check if excluded
            if (options?.exclude) {
              const excl = Array.isArray(options.exclude) ? options.exclude : [options.exclude];
              const isExcluded = excl.some(
                (e) =>
                  e === issue.id ||
                  e === issue.identifier ||
                  e === issue.internalId ||
                  e === issue.projectId ||
                  issue.id.includes(e) ||
                  e.includes(issue.id)
              );
              if (isExcluded) return issue;
            }

            // 2. Check if matches filter
            let isMatch = false;
            if (filter === "all" || !filter) {
              isMatch = true;
            } else if (Array.isArray(filter)) {
              isMatch = filter.some(
                (f) =>
                  f === issue.id ||
                  f === issue.identifier ||
                  f === issue.internalId ||
                  f === issue.projectId
              );
            } else if (typeof filter === "string") {
              const f = filter.trim();
              if (f === "all") isMatch = true;
              else if (
                f === issue.id ||
                f === issue.identifier ||
                f === issue.internalId ||
                f === issue.projectId ||
                issue.id.includes(f) ||
                f.includes(issue.id)
              ) {
                isMatch = true;
              }
            }

            if (isMatch) {
              count++;
              return {
                ...issue,
                ...normalizedUpdates,
                updatedAt: new Date().toISOString(),
              };
            }
            return issue;
          }),
        }));
        return count;
      },

      deleteIssue: (id) => {
        const state = get();
        const issue = state.issues.find((i) => i.id === id || i.identifier === id);
        if (!issue) return;

        const trashItem: TrashItem = {
          id: "trash-" + Date.now(),
          originalId: issue.id,
          category: "issue",
          title: `${issue.identifier}: ${issue.title}`,
          description: issue.description?.slice(0, 100),
          workspaceId: state.currentWorkspaceId,
          deletedAt: new Date().toISOString(),
          deletedBy: state.currentUser.name,
          payload: issue,
        };

        set((s) => ({
          issues: s.issues.filter((i) => i.id !== id && i.identifier !== id),
          trash: [trashItem, ...s.trash],
        }));

        supabaseSync.deleteIssue(issue.id);

        get().addTimelineEvent({
          action: "issue_deleted",
          entityType: "issue",
          entityId: issue.id,
          entityIdentifier: issue.identifier,
          entityTitle: issue.title,
          description: `Spostata nel Cestino l'issue "${issue.title}" (${issue.identifier})`,
          workspaceId: issue.workspaceId || state.currentWorkspaceId,
          metadata: {
            projectId: issue.projectId,
          },
        });

        get().addToast({
          title: "Issue Spostata nel Cestino",
          description: `${issue.identifier} è stata rimossa.`,
          actionLabel: "Apri Cestino",
          actionHref: "/trash",
          type: "info",
        });
      },

      moveIssueToStatus: (id, status) => {
        const issue = get().issues.find((i) => i.id === id || i.identifier === id);
        if (!issue) return;
        get().updateIssue(issue.id, {
          status,
          completedAt: status === "done" ? new Date().toISOString() : null,
        });
        get().addToast({
          title: "Stato Aggiornato",
          description: `${issue.identifier} -> ${status.toUpperCase().replace("_", " ")}`,
          type: "info",
        });
      },

      moveIssueToQuadrant: (id, quadrant) => {
        const issue = get().issues.find((i) => i.id === id || i.identifier === id);
        if (!issue) return;
        get().updateIssue(issue.id, { eisenhowerQuadrant: quadrant });
        get().addToast({
          title: "Matrice Eisenhower",
          description: `${issue.identifier} spostata nel quadrante ${quadrant.toUpperCase()}`,
          type: "info",
        });
      },

      // Habits Implementation
      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          id: "habit-" + Date.now(),
          completedDates: [],
          streak: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ habits: [newHabit, ...state.habits] }));
        supabaseSync.syncHabit(newHabit, get().currentWorkspaceId, get().currentUser.id);
        get().addToast({ title: "Nuova Abitudine Creata", description: newHabit.title, type: "success" });
        return newHabit;
      },

      toggleHabitDate: (habitId, dateStr) => {
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id !== habitId) return h;
            const exists = h.completedDates.includes(dateStr);
            const newDates = exists
              ? h.completedDates.filter((d) => d !== dateStr)
              : [...h.completedDates, dateStr];
            return {
              ...h,
              completedDates: newDates,
              streak: newDates.length,
            };
          }),
        }));
        const updatedHabit = get().habits.find((h) => h.id === habitId);
        if (updatedHabit) supabaseSync.syncHabit(updatedHabit, get().currentWorkspaceId, get().currentUser.id);
      },

      deleteHabit: (habitId) => {
        const state = get();
        const habit = state.habits.find((h) => h.id === habitId);
        if (!habit) return;

        const trashItem: TrashItem = {
          id: "trash-" + Date.now(),
          originalId: habit.id,
          category: "habit",
          title: habit.title,
          description: `Categoria: ${habit.category}`,
          workspaceId: state.currentWorkspaceId,
          deletedAt: new Date().toISOString(),
          deletedBy: state.currentUser.name,
          payload: habit,
        };

        set((s) => ({
          habits: s.habits.filter((h) => h.id !== habitId),
          trash: [trashItem, ...s.trash],
        }));

        supabaseSync.deleteHabit(habitId);
        get().addToast({ title: "Abitudine Spostata nel Cestino", type: "info" });
      },

      // Tag Implementation
      addTag: (tagData) => {
        const newTag: Tag = {
          ...tagData,
          id: "tag-" + Date.now(),
        };
        set((state) => ({ tags: [...state.tags, newTag] }));
        supabaseSync.syncTag(newTag, get().currentWorkspaceId);
        get().addToast({ title: "Tag Creato", description: `#${newTag.name}`, type: "success" });
        return newTag;
      },

      updateTag: (id, updates) => {
        set((state) => ({
          tags: state.tags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTag: (id) => {
        const state = get();
        const tag = state.tags.find((t) => t.id === id);
        if (!tag) return;

        const trashItem: TrashItem = {
          id: "trash-" + Date.now(),
          originalId: tag.id,
          category: "tag",
          title: `#${tag.name}`,
          description: tag.description || "Tag",
          workspaceId: state.currentWorkspaceId,
          deletedAt: new Date().toISOString(),
          deletedBy: state.currentUser.name,
          payload: tag,
        };

        set((s) => ({
          tags: s.tags.filter((t) => t.id !== id),
          trash: [trashItem, ...s.trash],
        }));

        supabaseSync.deleteTag(id);
        get().addToast({ title: "Tag Spostato nel Cestino", type: "info" });
      },

      // Project Folders Implementation
      addProjectFolder: (folderData) => {
        const newFolder: ProjectFolder = {
          ...folderData,
          id: "folder-" + Date.now(),
        };
        set((state) => ({ projectFolders: [...state.projectFolders, newFolder] }));
        supabaseSync.syncFolder(newFolder, get().currentWorkspaceId);
        get().addToast({ title: "Cartella Creata", description: newFolder.name, type: "success" });
        return newFolder;
      },

      deleteProjectFolder: (id) => {
        const state = get();
        const folder = state.projectFolders.find((f) => f.id === id);
        if (!folder) return;

        const trashItem: TrashItem = {
          id: "trash-" + Date.now(),
          originalId: folder.id,
          category: "folder",
          title: folder.name,
          description: "Cartella Progetti",
          workspaceId: state.currentWorkspaceId,
          deletedAt: new Date().toISOString(),
          deletedBy: state.currentUser.name,
          payload: folder,
        };

        set((s) => ({
          projectFolders: s.projectFolders.filter((f) => f.id !== id),
          trash: [trashItem, ...s.trash],
        }));

        supabaseSync.deleteFolder(id);
        get().addToast({ title: "Cartella Spostata nel Cestino", type: "info" });
      },

      // Pomodoro Implementation
      setPomodoroMode: (mode) => {
        const durations = { focus: 25 * 60, short_break: 5 * 60, long_break: 15 * 60 };
        set((state) => ({
          pomodoro: {
            ...state.pomodoro,
            mode,
            timeLeft: durations[mode],
            isRunning: false,
          },
        }));
      },

      setPomodoroRunning: (isRunning) => {
        set((state) => ({
          pomodoro: { ...state.pomodoro, isRunning },
        }));
      },

      setPomodoroActiveIssue: (activeIssueId) => {
        set((state) => ({
          pomodoro: { ...state.pomodoro, activeIssueId },
        }));
      },

      tickPomodoro: () => {
        const { pomodoro } = get();
        if (!pomodoro.isRunning) return;
        if (pomodoro.timeLeft > 1) {
          set((state) => ({
            pomodoro: { ...state.pomodoro, timeLeft: state.pomodoro.timeLeft - 1 },
          }));
        } else {
          const nextMode = pomodoro.mode === "focus" ? "short_break" : "focus";
          const nextDuration = nextMode === "focus" ? 25 * 60 : 5 * 60;
          const completedSessions =
            pomodoro.mode === "focus"
              ? pomodoro.completedSessions + 1
              : pomodoro.completedSessions;

          set((state) => ({
            pomodoro: {
              ...state.pomodoro,
              mode: nextMode,
              timeLeft: nextDuration,
              isRunning: false,
              completedSessions,
            },
          }));

          get().addToast({
            title:
              pomodoro.mode === "focus"
                ? "Sessione Pomodoro completata"
                : "Pausa terminata! Pronto a ripartire?",
            description:
              pomodoro.mode === "focus"
                ? "Ottimo lavoro! Fai una pausa di 5 minuti."
                : "Inizia un nuovo blocco di lavoro.",
            type: "success",
          });
        }
      },

      resetPomodoro: () => {
        const durations = { focus: 25 * 60, short_break: 5 * 60, long_break: 15 * 60 };
        set((state) => ({
          pomodoro: {
            ...state.pomodoro,
            timeLeft: durations[state.pomodoro.mode],
            isRunning: false,
          },
        }));
      },

      addMilestone: (projectId, milestone) => {
        const state = get();
        const id = "ms-" + Date.now();
        const newMilestone: Milestone = {
          ...milestone,
          id,
          projectId,
        };

        const targetProj = state.projects.find((p) => p.id === projectId || p.slug === projectId);

        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id === projectId || p.slug === projectId) {
              return {
                ...p,
                milestones: sortMilestones([...(p.milestones || []), newMilestone]),
              };
            }
            return p;
          }),
        }));

        supabaseSync.syncMilestone(newMilestone, targetProj?.id || projectId);

        get().addTimelineEvent({
          action: "milestone_created",
          entityType: "milestone",
          entityId: newMilestone.id,
          entityTitle: newMilestone.name,
          entityHref: `/project/${targetProj?.slug || projectId}`,
          description: `Aggiunta nuova milestone "${newMilestone.name}" a ${targetProj?.name || "progetto"}`,
          workspaceId: targetProj?.workspaceId || state.currentWorkspaceId,
          metadata: { projectId: targetProj?.id },
        });
      },

      toggleMilestone: (projectId, milestoneId) => {
        const state = get();
        const targetProj = state.projects.find((p) => p.id === projectId || p.slug === projectId);
        const targetMs = targetProj?.milestones?.find((m) => m.id === milestoneId);
        const nextCompleted = !targetMs?.completed;

        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id === projectId || p.slug === projectId) {
              return {
                ...p,
                milestones: (p.milestones || []).map((m) =>
                  m.id === milestoneId ? { ...m, completed: nextCompleted } : m
                ),
              };
            }
            return p;
          }),
        }));

        if (targetMs && targetProj) {
          supabaseSync.syncMilestone({ ...targetMs, completed: nextCompleted }, targetProj.id);
          get().addTimelineEvent({
            action: nextCompleted ? "milestone_completed" : "milestone_created",
            entityType: "milestone",
            entityId: milestoneId,
            entityTitle: targetMs.name,
            entityHref: `/project/${targetProj.slug}`,
            description: nextCompleted
              ? `Milestone "${targetMs.name}" completata con successo al 100% per ${targetProj.name}`
              : `Milestone "${targetMs.name}" riaperta come da completare`,
            workspaceId: targetProj.workspaceId || state.currentWorkspaceId,
            metadata: { projectId: targetProj.id },
          });
        }
      },

      deleteMilestone: (projectId, milestoneId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id === projectId || p.slug === projectId) {
              return {
                ...p,
                milestones: (p.milestones || []).filter((m) => m.id !== milestoneId),
              };
            }
            return p;
          }),
        }));
        supabaseSync.deleteMilestone(milestoneId);
      },

      addProjectUpdate: (projectId, body, status) => {
        const state = get();
        const id = "upd-" + Date.now();
        const update: ProjectUpdate = {
          id,
          body,
          status,
          projectId,
          authorId: state.currentUser.id,
          author: state.currentUser,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id === projectId || p.slug === projectId) {
              return {
                ...p,
                updates: [update, ...(p.updates || [])],
              };
            }
            return p;
          }),
        }));
      },

      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }));

        if (typeof document !== "undefined") {
          if (updates.defaultHomeView) {
            document.cookie = `chrono_default_home=${updates.defaultHomeView}; path=/; max-age=31536000; SameSite=Lax`;
          }
          if (updates.language) {
            try {
              window.localStorage.setItem("chrono_language", updates.language);
            } catch (_) {}
            document.cookie = `chrono_language=${updates.language}; path=/; max-age=31536000; SameSite=Lax`;
            document.documentElement.lang = updates.language;
          }
        }
      },

      getUserDisplayName: (user) => {
        const targetUser = user || get().currentUser;
        const pref = get().preferences?.displayNames || "full_name";
        return formatUserDisplayName(targetUser, pref);
      },

      // Chat Session Implementation
      createChatSession: (title) => {
        const id = "session-" + Date.now();
        const newSession: AgentChatSession = {
          id,
          title: title || "Nuova Sessione",
          messages: [
            {
              id: "msg-start-" + Date.now(),
              sender: "agent",
              text: "Come posso aiutarti in questa sessione?",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          chatSessions: [newSession, ...state.chatSessions],
          activeSessionId: id,
        }));

        return id;
      },

      switchChatSession: (id) => {
        set({ activeSessionId: id });
      },

      deleteChatSession: (id) => {
        set((state) => {
          const filtered = state.chatSessions.filter((s) => s.id !== id);
          const nextActive = filtered.length > 0 ? filtered[0].id : "";
          return {
            chatSessions: filtered,
            activeSessionId: nextActive,
          };
        });
      },

      renameChatSession: (id, title) => {
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === id ? { ...s, title, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      addMessageToActiveSession: (msg) => {
        set((state) => {
          const session = state.chatSessions.find((s) => s.id === state.activeSessionId);
          if (!session) {
            const newId = "session-" + Date.now();
            const newSession: AgentChatSession = {
              id: newId,
              title: msg.text.substring(0, 30) || "Nuova Sessione",
              messages: [msg],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            return {
              chatSessions: [newSession, ...state.chatSessions],
              activeSessionId: newId,
            };
          }

          const updatedSessions = state.chatSessions.map((s) => {
            if (s.id === state.activeSessionId) {
              const updatedMessages = [...s.messages, msg];
              const newTitle =
                s.title === "Nuova Sessione" && msg.sender === "user"
                  ? msg.text.substring(0, 32)
                  : s.title;

              return {
                ...s,
                title: newTitle,
                messages: updatedMessages,
                updatedAt: new Date().toISOString(),
              };
            }
            return s;
          });

          return { chatSessions: updatedSessions };
        });
      },

      clearActiveSessionMessages: () => {
        set((state) => ({
          chatSessions: state.chatSessions.map((s) =>
            s.id === state.activeSessionId ? { ...s, messages: [] } : s
          ),
        }));
      },
    }),
    {
      name: "chrono_app_store_v8",
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        workspace: state.workspace,
        workspaces: state.workspaces,
        currentWorkspaceId: state.currentWorkspaceId,
        accounts: state.accounts,
        currentAccountId: state.currentAccountId,
        team: state.team,
        projects: state.projects,
        issues: state.issues,
        habits: state.habits,
        tags: state.tags,
        projectFolders: state.projectFolders,
        timelineEvents: (state.timelineEvents || []).slice(0, 50),
        trash: (state.trash || []).slice(0, 15),
        pomodoro: state.pomodoro,
        preferences: state.preferences,
        chatSessions: (state.chatSessions || []).slice(0, 5),
        activeSessionId: state.activeSessionId,
      }),
    }
  )
);

export const useChronoStore = useLinearStore;

