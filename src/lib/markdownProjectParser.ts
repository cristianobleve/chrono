import { Priority, ProjectStatus, IssueStatus } from "@/types";

export interface ParsedMilestoneImport {
  name: string;
  targetDate?: string | null;
  completed: boolean;
}

export interface ParsedIssueImport {
  title: string;
  description?: string;
  status: IssueStatus;
  priority: Priority;
  estimate?: number | null;
  labels?: string[];
}

export interface ParsedProjectImport {
  name: string;
  summary: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  targetDate?: string | null;
  milestones: ParsedMilestoneImport[];
  issues: ParsedIssueImport[];
  rawMarkdown: string;
}

/**
 * Parses a single or multi-project markdown file where projects are separated by '__sep'
 */
export function parseBulkProjectsMarkdown(markdownText: string): ParsedProjectImport[] {
  if (!markdownText || typeof markdownText !== "string") return [];

  // Check if text contains the '__sep' divider
  const sepRegex = /(?:^|\n)\s*(?:---|<!--)?\s*__sep\s*(?:-->|---)?\s*(?:\n|$)/i;

  if (sepRegex.test(markdownText)) {
    const rawChunks = markdownText
      .split(sepRegex)
      .map((c) => c.trim())
      .filter((c) => c.length > 5);

    if (rawChunks.length > 0) {
      return rawChunks.map((chunk) => parseProjectMarkdown(chunk));
    }
  }

  // Fallback single project
  return [parseProjectMarkdown(markdownText)];
}

export function parseProjectMarkdown(markdownText: string): ParsedProjectImport {
  const lines = markdownText.split("\n");

  let name = "Nuovo Progetto Importato";
  let summary = "";
  let description = "";
  let status: ProjectStatus = "Planned";
  let priority: Priority = "high";
  let targetDate: string | null = null;
  const milestones: ParsedMilestoneImport[] = [];
  const issues: ParsedIssueImport[] = [];

  let currentSection: "header" | "metadata" | "description" | "milestones" | "issues" | "other" = "header";
  let currentIssue: Partial<ParsedIssueImport> | null = null;
  let descriptionBuffer: string[] = [];
  let issueDescBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Project Title from # Heading (first level 1 heading)
    if (trimmed.startsWith("# ") && currentSection === "header") {
      name = trimmed.replace(/^#\s+/, "").trim();
      continue;
    }

    // 2. Summary from blockquote > at top
    if (trimmed.startsWith("> ") && !summary && currentSection === "header") {
      summary = trimmed.replace(/^>\s+/, "").trim();
      continue;
    }

    // 3. Detect Section Headings (## ...)
    if (trimmed.startsWith("## ")) {
      const sectionName = trimmed.replace(/^##\s+/, "").toLowerCase().trim();

      // Flush previous issue if any
      if (currentIssue && currentIssue.title) {
        currentIssue.description = issueDescBuffer.join("\n").trim();
        issues.push(finalizeIssue(currentIssue));
        currentIssue = null;
        issueDescBuffer = [];
      }

      if (sectionName.includes("metadata") || sectionName.includes("dati") || sectionName.includes("info")) {
        currentSection = "metadata";
      } else if (sectionName.includes("descri") || sectionName.includes("overview") || sectionName.includes("panoramica") || sectionName.includes("obiettiv")) {
        currentSection = "description";
      } else if (sectionName.includes("milestone") || sectionName.includes("traguard") || sectionName.includes("fasi")) {
        currentSection = "milestones";
      } else if (sectionName.includes("issue") || sectionName.includes("task") || sectionName.includes("attività") || sectionName.includes("schede")) {
        currentSection = "issues";
      } else {
        currentSection = "other";
      }
      continue;
    }

    // 4. Section Parsing

    // Section: Metadata
    if (currentSection === "metadata") {
      const lower = trimmed.toLowerCase();
      if (lower.includes("status:") || lower.includes("stato:")) {
        status = parseProjectStatus(trimmed);
      } else if (lower.includes("priority:") || lower.includes("priorità:")) {
        priority = parsePriority(trimmed);
      } else if (lower.includes("target date:") || lower.includes("due date:") || lower.includes("scadenza:") || lower.includes("data:")) {
        targetDate = extractDate(trimmed);
      }
      continue;
    }

    // Section: Description
    if (currentSection === "description") {
      descriptionBuffer.push(rawLine);
      continue;
    }

    // Section: Milestones
    if (currentSection === "milestones") {
      // e.g. - [ ] Milestone 1: Setup DB (Target: 2026-09-30) or (Due: 2026-09-30)
      if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]") || trimmed.startsWith("* [ ]") || trimmed.startsWith("* [x]")) {
        const completed = trimmed.includes("[x]");
        let milestoneText = trimmed.replace(/^[-*]\s*\[[ x]\]\s*/i, "").trim();

        let msTargetDate: string | null = null;
        const dateMatch = milestoneText.match(/\((?:target|due|scadenza):\s*([^\)]+)\)/i);
        if (dateMatch) {
          msTargetDate = extractDate(dateMatch[1]);
          milestoneText = milestoneText.replace(/\((?:target|due|scadenza):\s*[^\)]+\)/i, "").trim();
        }

        milestones.push({
          name: milestoneText,
          targetDate: msTargetDate,
          completed,
        });
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        // Bullet without checkbox
        const itemText = trimmed.replace(/^[-*]\s+/, "").trim();
        if (itemText) {
          milestones.push({
            name: itemText,
            completed: false,
          });
        }
      }
      continue;
    }

    // Section: Issues
    if (currentSection === "issues") {
      // Detect individual Issue Header (### Title)
      if (trimmed.startsWith("### ")) {
        // Flush previous issue
        if (currentIssue && currentIssue.title) {
          currentIssue.description = issueDescBuffer.join("\n").trim();
          issues.push(finalizeIssue(currentIssue));
        }

        const issueTitle = trimmed.replace(/^###\s+/, "").replace(/^\d+\.\s*/, "").trim();
        currentIssue = {
          title: issueTitle,
          status: "todo",
          priority: "medium",
          estimate: null,
          labels: [],
        };
        issueDescBuffer = [];
        continue;
      }

      // If inside an issue, parse its attributes or description lines
      if (currentIssue) {
        const lower = trimmed.toLowerCase();
        if (lower.startsWith("- **status**:") || lower.startsWith("- status:") || lower.startsWith("- **stato**:")) {
          currentIssue.status = parseIssueStatus(trimmed);
        } else if (lower.startsWith("- **priority**:") || lower.startsWith("- priority:") || lower.startsWith("- **priorità**:")) {
          currentIssue.priority = parsePriority(trimmed);
        } else if (lower.startsWith("- **estimate**:") || lower.startsWith("- estimate:") || lower.startsWith("- **stima**:")) {
          const estNum = parseInt(trimmed.replace(/[^0-9]/g, ""), 10);
          if (!isNaN(estNum)) currentIssue.estimate = estNum;
        } else if (lower.startsWith("- **labels**:") || lower.startsWith("- labels:") || lower.startsWith("- **tag**:")) {
          const rawLabels = trimmed.replace(/^[-*]\s*(?:\*\*)?(?:labels|tag)(?:\*\*)?:\s*/i, "");
          currentIssue.labels = rawLabels
            .split(/[,;]/)
            .map((l) => l.trim())
            .filter(Boolean);
        } else {
          // Description line of issue
          issueDescBuffer.push(rawLine);
        }
      }
    }
  }

  // Flush final issue
  if (currentIssue && currentIssue.title) {
    currentIssue.description = issueDescBuffer.join("\n").trim();
    issues.push(finalizeIssue(currentIssue));
  }

  description = descriptionBuffer.join("\n").trim();

  // If no milestones found, provide default first milestone
  if (milestones.length === 0) {
    milestones.push({
      name: "Fase 1: Setup & Kickoff",
      completed: false,
      targetDate,
    });
  }

  // If no issues parsed, create default starter issue
  if (issues.length === 0) {
    issues.push({
      title: `Inizializzare ${name}`,
      description: `Task creata automaticamente per l'avvio del progetto ${name}.`,
      status: "todo",
      priority: "high",
      estimate: 2,
      labels: ["Kickoff"],
    });
  }

  return {
    name,
    summary: summary || "Progetto importato da specifica Markdown",
    description: description || summary || "Iniziativa strategica importata da file Markdown.",
    status,
    priority,
    targetDate,
    milestones,
    issues,
    rawMarkdown: markdownText,
  };
}

function finalizeIssue(partial: Partial<ParsedIssueImport>): ParsedIssueImport {
  return {
    title: partial.title || "Untitled Issue",
    description: partial.description || "",
    status: partial.status || "todo",
    priority: partial.priority || "medium",
    estimate: partial.estimate || null,
    labels: partial.labels || [],
  };
}

function parseProjectStatus(line: string): ProjectStatus {
  const lower = line.toLowerCase();
  if (lower.includes("in progress") || lower.includes("in corso") || lower.includes("in_progress")) return "In Progress";
  if (lower.includes("planned") || lower.includes("pianificato")) return "Planned";
  if (lower.includes("completed") || lower.includes("completato") || lower.includes("finito")) return "Completed";
  if (lower.includes("canceled") || lower.includes("cancellato") || lower.includes("annullato")) return "Canceled";
  return "Backlog";
}

function parseIssueStatus(line: string): IssueStatus {
  const lower = line.toLowerCase();
  if (lower.includes("in progress") || lower.includes("in corso") || lower.includes("in_progress")) return "in_progress";
  if (lower.includes("done") || lower.includes("fatto") || lower.includes("completato")) return "done";
  if (lower.includes("canceled") || lower.includes("annullato")) return "canceled";
  if (lower.includes("backlog")) return "backlog";
  return "todo";
}

function parsePriority(line: string): Priority {
  const lower = line.toLowerCase();
  if (lower.includes("urgent") || lower.includes("urgente")) return "urgent";
  if (lower.includes("high") || lower.includes("alta") || lower.includes("alto")) return "high";
  if (lower.includes("medium") || lower.includes("media") || lower.includes("medio")) return "medium";
  if (lower.includes("low") || lower.includes("bassa") || lower.includes("basso")) return "low";
  return "none";
}

function extractDate(str: string): string | null {
  const match = str.match(/(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  return null;
}
