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
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  coverUrl?: string | null;
  coverGradient?: string | null;
  milestones: ParsedMilestoneImport[];
  issues: ParsedIssueImport[];
  rawMarkdown: string;
}

/**
 * Parses a single or multi-project markdown file where projects can be separated by
 * '__sep', '---', or multiple distinct '# Heading' blocks.
 */
export function parseBulkProjectsMarkdown(markdownText: string): ParsedProjectImport[] {
  if (!markdownText || typeof markdownText !== "string") return [];

  // 1. Check if text contains the explicit '__sep' divider
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

  // 2. Check if text contains multiple projects divided by '---' before a '# ' heading
  const dashSepRegex = /(?:^|\n)\s*---\s*(?:\n+)(?=#\s+[^\n]+)/g;
  if (dashSepRegex.test(markdownText)) {
    const chunks = markdownText
      .split(dashSepRegex)
      .map((c) => c.trim())
      .filter((c) => c.length > 5);
    if (chunks.length > 1) {
      return chunks.map((chunk) => parseProjectMarkdown(chunk));
    }
  }

  // 3. Check if text contains multiple '# ' headings defining multiple projects
  const h1Matches = Array.from(markdownText.matchAll(/(?:^|\n)#\s+([^\n]+)/g));
  if (h1Matches.length > 1) {
    const h1Indices = h1Matches.map((m) => m.index ?? 0);
    const projectChunks: string[] = [];
    for (let i = 0; i < h1Indices.length; i++) {
      const start = h1Indices[i];
      const end = i < h1Indices.length - 1 ? h1Indices[i + 1] : markdownText.length;
      const chunk = markdownText.slice(start, end).trim();
      if (chunk.length > 15) {
        projectChunks.push(chunk);
      }
    }
    if (projectChunks.length > 1) {
      return projectChunks.map((c) => parseProjectMarkdown(c));
    }
  }

  // Fallback single project
  return [parseProjectMarkdown(markdownText)];
}

export function parseProjectMarkdown(markdownText: string): ParsedProjectImport {
  let text = markdownText;
  let name = "Nuovo Progetto Importato";
  let summary = "";
  let description = "";
  let status: ProjectStatus = "Planned";
  let priority: Priority = "high";
  let targetDate: string | null = null;
  let icon: string = "cube";
  let iconColor: string = "#5e6ad2";
  let iconBg: string = "#121419";
  let coverUrl: string | null = null;
  let coverGradient: string | null = null;
  const milestones: ParsedMilestoneImport[] = [];
  const issues: ParsedIssueImport[] = [];

  // Parse YAML Frontmatter if present
  const frontmatterMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (frontmatterMatch) {
    const fmLines = frontmatterMatch[1].split("\n");
    for (const fml of fmLines) {
      const parts = fml.split(":");
      if (parts.length >= 2) {
        const key = parts[0].trim().toLowerCase();
        const val = parts.slice(1).join(":").trim().replace(/^["']|["']$/g, "");
        if (key === "name" || key === "title") name = val;
        if (key === "summary") summary = val;
        if (key === "status") status = parseProjectStatus(val);
        if (key === "priority") priority = parsePriority(val);
        if (key === "targetdate" || key === "target_date" || key === "duedate" || key === "due_date") {
          targetDate = extractDate(val);
        }
        if (key === "icon" || key === "icona") icon = val;
        if (key === "iconcolor" || key === "icon_color" || key === "colore_icona" || key === "color") {
          iconColor = val;
        }
        if (key === "iconbg" || key === "icon_bg" || key === "sfondo_icona") {
          iconBg = val;
        }
        if (
          key === "cover" ||
          key === "coverurl" ||
          key === "cover_url" ||
          key === "copertina" ||
          key === "hero" ||
          key === "hero_url" ||
          key === "banner"
        ) {
          coverUrl = val;
        }
        if (key === "covergradient" || key === "cover_gradient" || key === "gradient") {
          coverGradient = val;
        }
      }
    }
    text = text.replace(frontmatterMatch[0], "");
  }

  // Check for standalone markdown hero/cover image: ![Cover](https://...) or ![Hero](https://...)
  const coverImgMatch = text.match(/!\[(?:cover|hero|copertina|banner|sfondo|header)\]\((https?:\/\/[^\s\)]+)\)/i);
  if (coverImgMatch && !coverUrl) {
    coverUrl = coverImgMatch[1];
  }

  const lines = text.split("\n");

  let currentSection: "header" | "metadata" | "description" | "milestones" | "issues" | "other" = "header";
  let currentIssue: Partial<ParsedIssueImport> | null = null;
  const descriptionBuffer: string[] = [];
  let issueDescBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Project Title from # Heading
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
      } else if (
        sectionName.includes("descri") ||
        sectionName.includes("overview") ||
        sectionName.includes("panoramica") ||
        sectionName.includes("obiettiv")
      ) {
        currentSection = "description";
      } else if (sectionName.includes("milestone") || sectionName.includes("traguard") || sectionName.includes("fasi")) {
        currentSection = "milestones";
      } else if (
        sectionName.includes("issue") ||
        sectionName.includes("task") ||
        sectionName.includes("attività") ||
        sectionName.includes("schede")
      ) {
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
      } else if (
        lower.includes("target date:") ||
        lower.includes("due date:") ||
        lower.includes("scadenza:") ||
        lower.includes("data:")
      ) {
        targetDate = extractDate(trimmed);
      } else if (
        lower.startsWith("- **icon**:") ||
        lower.startsWith("- icon:") ||
        lower.startsWith("- **icona**:") ||
        lower.startsWith("- icona:")
      ) {
        icon = trimmed.replace(/^[-*]\s*(?:\*\*)?(?:icon|icona)(?:\*\*)?:\s*/i, "").trim().replace(/^["']|["']$/g, "");
      } else if (
        lower.startsWith("- **icon color**:") ||
        lower.startsWith("- icon color:") ||
        lower.startsWith("- **icon_color**:") ||
        lower.startsWith("- icon_color:") ||
        lower.startsWith("- **colore icona**:") ||
        lower.startsWith("- colore icona:")
      ) {
        iconColor = trimmed.replace(/^[-*]\s*(?:\*\*)?(?:icon[-_ ]?color|colore[-_ ]?icona)(?:\*\*)?:\s*/i, "").trim().replace(/^["']|["']$/g, "");
      } else if (
        lower.startsWith("- **icon bg**:") ||
        lower.startsWith("- icon bg:") ||
        lower.startsWith("- **icon_bg**:") ||
        lower.startsWith("- icon_bg:") ||
        lower.startsWith("- **sfondo icona**:") ||
        lower.startsWith("- sfondo icona:")
      ) {
        iconBg = trimmed.replace(/^[-*]\s*(?:\*\*)?(?:icon[-_ ]?bg|sfondo[-_ ]?icona)(?:\*\*)?:\s*/i, "").trim().replace(/^["']|["']$/g, "");
      } else if (
        lower.startsWith("- **cover**:") ||
        lower.startsWith("- cover:") ||
        lower.startsWith("- **copertina**:") ||
        lower.startsWith("- copertina:") ||
        lower.startsWith("- **hero**:") ||
        lower.startsWith("- hero:") ||
        lower.startsWith("- **banner**:") ||
        lower.startsWith("- banner:")
      ) {
        const rawVal = trimmed.replace(/^[-*]\s*(?:\*\*)?(?:cover|copertina|hero|banner)(?:\*\*)?:\s*/i, "").trim().replace(/^["']|["']$/g, "");
        const linkMatch = rawVal.match(/\((https?:\/\/[^\s\)]+)\)/);
        coverUrl = linkMatch ? linkMatch[1] : rawVal;
      } else if (
        lower.startsWith("- **cover gradient**:") ||
        lower.startsWith("- cover gradient:") ||
        lower.startsWith("- **gradient**:") ||
        lower.startsWith("- gradient:")
      ) {
        coverGradient = trimmed.replace(/^[-*]\s*(?:\*\*)?(?:cover[-_ ]?gradient|gradient)(?:\*\*)?:\s*/i, "").trim().replace(/^["']|["']$/g, "");
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
      if (
        trimmed.startsWith("- [ ]") ||
        trimmed.startsWith("- [x]") ||
        trimmed.startsWith("* [ ]") ||
        trimmed.startsWith("* [x]")
      ) {
        const completed = trimmed.includes("[x]");
        let milestoneText = trimmed.replace(/^[-*]\s*\[[ x]\]\s*/i, "").trim();

        let msTargetDate: string | null = null;
        const dateMatch = milestoneText.match(/\((?:target|due|scadenza|data):\s*([^\)]+)\)/i);
        if (dateMatch) {
          msTargetDate = extractDate(dateMatch[1]);
          milestoneText = milestoneText.replace(/\((?:target|due|scadenza|data):\s*[^\)]+\)/i, "").trim();
        }

        milestones.push({
          name: milestoneText,
          targetDate: msTargetDate,
          completed,
        });
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        let itemText = trimmed.replace(/^[-*]\s+/, "").trim();
        if (itemText) {
          let msTargetDate: string | null = null;
          const dateMatch = itemText.match(/\((?:target|due|scadenza|data):\s*([^\)]+)\)/i);
          if (dateMatch) {
            msTargetDate = extractDate(dateMatch[1]);
            itemText = itemText.replace(/\((?:target|due|scadenza|data):\s*[^\)]+\)/i, "").trim();
          }
          milestones.push({
            name: itemText,
            targetDate: msTargetDate,
            completed: false,
          });
        }
      }
      continue;
    }

    // Section: Issues
    if (currentSection === "issues") {
      // Heading format: ### Issue Title
      if (trimmed.startsWith("### ")) {
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

      // Checkbox list format: - [ ] Issue Title
      if (
        (trimmed.startsWith("- [ ]") ||
          trimmed.startsWith("- [x]") ||
          trimmed.startsWith("* [ ]") ||
          trimmed.startsWith("* [x]")) &&
        !currentIssue
      ) {
        const isDone = trimmed.includes("[x]");
        let taskTitle = trimmed.replace(/^[-*]\s*\[[ x]\]\s*/i, "").trim();
        let est: number | null = null;
        const estMatch = taskTitle.match(/\[(\d+)\s*(?:pt|punti|points|pts)?\]/i);
        if (estMatch) {
          est = parseInt(estMatch[1], 10);
          taskTitle = taskTitle.replace(/\[\d+\s*(?:pt|punti|points|pts)?\]/i, "").trim();
        }
        issues.push({
          title: taskTitle,
          description: "",
          status: isDone ? "done" : "todo",
          priority: "medium",
          estimate: est,
          labels: [],
        });
        continue;
      }

      // Inside an active issue, parse attributes or description lines
      if (currentIssue) {
        const lower = trimmed.toLowerCase();
        if (
          lower.startsWith("- **status**:") ||
          lower.startsWith("- status:") ||
          lower.startsWith("- **stato**:") ||
          lower.startsWith("- stato:")
        ) {
          currentIssue.status = parseIssueStatus(trimmed);
        } else if (
          lower.startsWith("- **priority**:") ||
          lower.startsWith("- priority:") ||
          lower.startsWith("- **priorità**:") ||
          lower.startsWith("- priorità:")
        ) {
          currentIssue.priority = parsePriority(trimmed);
        } else if (
          lower.startsWith("- **estimate**:") ||
          lower.startsWith("- estimate:") ||
          lower.startsWith("- **stima**:") ||
          lower.startsWith("- stima:")
        ) {
          const estNum = parseInt(trimmed.replace(/[^0-9]/g, ""), 10);
          if (!isNaN(estNum)) currentIssue.estimate = estNum;
        } else if (
          lower.startsWith("- **labels**:") ||
          lower.startsWith("- labels:") ||
          lower.startsWith("- **tag**:") ||
          lower.startsWith("- tag:")
        ) {
          const rawLabels = trimmed.replace(/^[-*]\s*(?:\*\*)?(?:labels|tag)(?:\*\*)?:\s*/i, "");
          currentIssue.labels = rawLabels
            .split(/[,;]/)
            .map((l) => l.trim())
            .filter(Boolean);
        } else {
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
    icon,
    iconColor,
    iconBg,
    coverUrl,
    coverGradient,
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
  // ISO: 2026-09-30
  const isoMatch = str.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
  if (isoMatch) {
    const parts = isoMatch[1].replace(/\//g, "-").split("-");
    const y = parts[0];
    const m = parts[1].padStart(2, "0");
    const d = parts[2].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  // European: 30/09/2026 or 30-09-2026
  const euroMatch = str.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (euroMatch) {
    const d = euroMatch[1].padStart(2, "0");
    const m = euroMatch[2].padStart(2, "0");
    const y = euroMatch[3];
    return `${y}-${m}-${d}`;
  }
  return null;
}
