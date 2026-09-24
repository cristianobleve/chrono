import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      history = [],
      workspaceContext,
      apiKey,
      baseUrl,
      systemPrompt: customSystemPrompt,
      temperature = 0.7,
      model = "gemini-flash-lite-latest",
    } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    if (baseUrl && !isAllowedAgentBaseUrl(baseUrl)) {
      return NextResponse.json({ error: "The configured AI base URL is not allowed" }, { status: 400 });
    }

    // Detailed context for intelligent conversational reasoning
    const defaultSystemInstruction = `You are Chrono Agent, the AI technical assistant built directly into the Chrono project management system.
You are a senior technical project lead and product strategist. You communicate with technical precision and contextual awareness.

You have DIRECT, REAL-TIME CAPABILITIES to execute actions in this workspace (creating, updating, bulk-updating, and managing projects and issues).
NEVER say you cannot update projects or issues. You CAN and MUST execute the appropriate ACTION tag whenever requested.

Workspace Live State:
- Team: ${workspaceContext?.team?.name || "Core"} (Key: ${workspaceContext?.team?.key || "COR"})
- User: ${workspaceContext?.currentUser?.name || "Member"} (@${workspaceContext?.currentUser?.username || "member"})
- Active Projects (${workspaceContext?.projects?.length || 0} total): ${JSON.stringify(
      workspaceContext?.projects?.map((p: any) => ({
        id: p.id,
        identifier: p.identifier,
        internalId: p.internalId,
        name: p.name,
        slug: p.slug,
        status: p.status,
        summary: p.summary,
        priority: p.priority,
      })) || []
    )}
- Open Issues (${workspaceContext?.issues?.length || 0} total): ${JSON.stringify(
      workspaceContext?.issues?.slice(0, 15).map((i: any) => ({
        id: i.id,
        identifier: i.identifier,
        internalId: i.internalId,
        title: i.title,
        status: i.status,
        priority: i.priority,
      })) || []
    )}

Action Capabilities (ALWAYS append the relevant JSON action tag at the very end of your response when requested):

1. Project Status Update (e.g. mark all/some projects as Planned/To Do, Completed/Done, In Progress, Backlog):
ACTION_UPDATE_PROJECTS:{"filter":"all"|"targetId", "targetId"?:string, "status":"Planned"|"In Progress"|"Completed"|"Backlog"|"Paused"|"Canceled", "priority"?:string}

2. Issue Status Update (e.g. mark all issues as done, in_progress, todo, backlog):
ACTION_UPDATE_ISSUES:{"filter":"all"|"targetId", "targetId"?:string, "status":"done"|"in_progress"|"todo"|"backlog"|"canceled", "priority"?:string}

3. Create Issue:
ACTION_ISSUE:{"title":"Clear task title","description":"Detailed technical description and acceptance criteria","priority":"urgent|high|medium|low|none","status":"backlog|todo|in_progress|done"}

4. Create Project:
ACTION_PROJECT:{"name":"Project Name","summary":"One-line executive summary","description":"Full project brief","status":"Planned|In Progress|Completed|Backlog","priority":"urgent|high|medium|low|none"}

5. Delete Project:
ACTION_DELETE_PROJECT:{"targetId":"proj-id"}

Style Guidelines:
- Respond in the exact language used by the user (Italian if the user writes in Italian, English if English).
- Be concise, direct, helpful, and confident in your actions.`;

    const systemInstruction = customSystemPrompt
      ? `${customSystemPrompt}\n\n${defaultSystemInstruction}`
      : defaultSystemInstruction;

    // 1. Ollama / Self-Hosted Docker Container Support
    if (baseUrl && (baseUrl.includes("localhost:11434") || baseUrl.includes("11434") || model.includes("ollama"))) {
      try {
        const ollamaEndpoint = `${baseUrl.replace(/\/$/, "")}/api/generate`;
        const ollamaRes = await fetchWithTimeout(ollamaEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: model === "ollama-local" ? "llama3" : model,
            prompt: `${systemInstruction}\n\nUser: ${prompt}`,
            stream: false,
          }),
        });

        if (ollamaRes.ok) {
          const ollamaData = await ollamaRes.json();
          if (ollamaData.response) {
            return NextResponse.json(parseAgentResponse(ollamaData.response, prompt, workspaceContext));
          }
        }
      } catch (err) {
        console.warn("Ollama Docker connection error:", err);
      }
    }

    // 2. OpenAI / DeepSeek / Mistral / Custom Base URL (OpenAI-compatible)
    const isOpenAICompatible =
      (apiKey && (apiKey.startsWith("sk-") || apiKey.startsWith("sk-ant-") || apiKey.startsWith("sk-or-"))) ||
      Boolean(baseUrl);

    if (isOpenAICompatible && !model.startsWith("gemini")) {
      const endpoint = baseUrl
        ? `${baseUrl.replace(/\/$/, "")}/chat/completions`
        : model.startsWith("deepseek")
        ? "https://api.deepseek.com/chat/completions"
        : model.startsWith("mistral") || model.startsWith("codestral")
        ? "https://api.mistral.ai/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";

      try {
        const messages = [
          { role: "system", content: systemInstruction },
          ...history.slice(-8).map((m: any) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
          { role: "user", content: prompt },
        ];

        const openAiRes = await fetchWithTimeout(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages,
            temperature,
          }),
        }, 12000);

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const rawText = data?.choices?.[0]?.message?.content || "";
          if (rawText) {
            return NextResponse.json(parseAgentResponse(rawText, prompt, workspaceContext));
          }
        }
      } catch (err) {
        console.warn("OpenAI compatible error:", err);
      }
    }

    // 3. Google Gemini Neural Engine (Default or explicit key)
    const geminiKey = apiKey || process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim().length > 5) {
      const candidateModels = [
        model.startsWith("gemini") ? model : "gemini-flash-lite-latest",
        "gemini-flash-lite-latest",
        "gemini-flash-latest",
        "gemini-2.5-flash-lite",
      ];

      for (const m of candidateModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey.trim()}`;

          const contents: any[] = [];
          const recentHistory = history.slice(-10);
          for (const msg of recentHistory) {
            contents.push({
              role: msg.sender === "user" ? "user" : "model",
              parts: [{ text: msg.text }],
            });
          }

          contents.push({
            role: "user",
            parts: [{ text: prompt }],
          });

          const response = await fetchWithTimeout(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemInstruction }],
              },
              contents,
              generationConfig: {
                temperature,
                maxOutputTokens: 1800,
              },
            }),
          }, 10000);

          if (response.ok) {
            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (rawText) {
              return NextResponse.json(parseAgentResponse(rawText, prompt, workspaceContext));
            }
          }
        } catch (err: any) {
          console.error(`Gemini model ${m} error:`, err);
        }
      }
    }

    // 4. Fallback Dynamic Parser
    return NextResponse.json(generateDynamicFallback(prompt, history, workspaceContext));
  } catch (error: any) {
    console.error("Agent chat route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function isAllowedAgentBaseUrl(value: string) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return false;

    const configured = (process.env.AI_ALLOWED_BASE_URLS || '')
      .split(',')
      .map((entry) => entry.trim().replace(/\/$/, ''))
      .filter(Boolean);
    const normalized = value.replace(/\/$/, '');
    if (configured.includes(normalized)) return true;

    if (process.env.NODE_ENV !== 'production') {
      return ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    }
  } catch {
    return false;
  }

  return false;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number = 8000,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function parseAgentResponse(rawText: string, promptText: string, workspaceContext: any) {
  let actionResult: any = null;

  // 1. ACTION_UPDATE_PROJECTS
  const updateProjMatch = rawText.match(/ACTION_UPDATE_PROJECTS:\s*(\{[\s\S]*?\})/i);
  if (updateProjMatch && updateProjMatch[1]) {
    try {
      const data = JSON.parse(updateProjMatch[1]);
      actionResult = {
        type: "projects_updated",
        data,
      };
    } catch (e) {}
  }

  // 2. ACTION_UPDATE_ISSUES
  if (!actionResult) {
    const updateIssueMatch = rawText.match(/ACTION_UPDATE_ISSUES:\s*(\{[\s\S]*?\})/i);
    if (updateIssueMatch && updateIssueMatch[1]) {
      try {
        const data = JSON.parse(updateIssueMatch[1]);
        actionResult = {
          type: "issues_updated",
          data,
        };
      } catch (e) {}
    }
  }

  // 3. ACTION_ISSUE
  if (!actionResult) {
    const issueMatch = rawText.match(/ACTION_ISSUE:\s*(\{[\s\S]*?\})/i);
    if (issueMatch && issueMatch[1]) {
      try {
        const issueData = JSON.parse(issueMatch[1]);
        actionResult = {
          type: "issue_created",
          data: issueData,
        };
      } catch (e) {}
    }
  }

  // 4. ACTION_PROJECT
  if (!actionResult) {
    const projMatch = rawText.match(/ACTION_PROJECT:\s*(\{[\s\S]*?\})/i);
    if (projMatch && projMatch[1]) {
      try {
        const projData = JSON.parse(projMatch[1]);
        actionResult = {
          type: "project_created",
          data: projData,
        };
      } catch (e) {}
    }
  }

  // 5. ACTION_DELETE_PROJECT
  if (!actionResult) {
    const deleteProjMatch = rawText.match(/ACTION_DELETE_PROJECT:\s*(\{[\s\S]*?\})/i);
    if (deleteProjMatch && deleteProjMatch[1]) {
      try {
        const data = JSON.parse(deleteProjMatch[1]);
        actionResult = {
          type: "project_deleted",
          data,
        };
      } catch (e) {}
    }
  }

  // 6. ACTION_IMPORT_BULK_PROJECTS
  if (!actionResult) {
    const bulkMatch = rawText.match(/ACTION_IMPORT_BULK_PROJECTS:\s*(\{[\s\S]*?\})/i);
    if (bulkMatch && bulkMatch[1]) {
      try {
        const data = JSON.parse(bulkMatch[1]);
        actionResult = {
          type: "bulk_projects_imported",
          data,
        };
      } catch (e) {}
    }
  }

  // Extract any exclusions from prompt or model response
  if (actionResult && (actionResult.type === "projects_updated" || actionResult.type === "issues_updated")) {
    if (!actionResult.data.excludeIds || actionResult.data.excludeIds.length === 0) {
      const combined = `${promptText} ${rawText}`;
      const exclList: string[] = [];
      const exclRegex = /(?:lasciando escluso|escludendo|tranne|eccetto|escluso|senza)\s+(?:il progetto|la task|l'issue)?\s*(?:con ID)?\s*([`"']?([a-zA-Z0-9_-]+)[`"']?)/gi;
      let m;
      while ((m = exclRegex.exec(combined)) !== null) {
        if (m[1]) {
          const item = m[1].replace(/[`"']/g, "").trim();
          if (item && item.length > 1 && !exclList.includes(item)) {
            exclList.push(item);
          }
        }
      }
      const quotedMatch = combined.match(/\(["']?([a-zA-Z0-9_-]+)["']?\)/g);
      if (quotedMatch) {
        for (const q of quotedMatch) {
          const clean = q.replace(/[\(\)"']/g, "").trim();
          if (clean && !exclList.includes(clean)) {
            exclList.push(clean);
          }
        }
      }
      if (exclList.length > 0) {
        actionResult.data.excludeIds = exclList;
      }
    }
  }

  // Robustly clean ALL raw action tags from the text
  const cleanedText = rawText
    .replace(/ACTION_[A-Z_]+:\s*\{[\s\S]*?\}/gi, "")
    .trim();

  // Safety fallback if no action tag was matched but prompt explicitly requested a state update
  if (!actionResult) {
    const fallback = generateDynamicFallback(promptText, [], workspaceContext);
    if (fallback.actionResult) {
      actionResult = fallback.actionResult;
    }
  }

  return {
    text: cleanedText,
    actionResult,
  };
}

function generateDynamicFallback(prompt: string, history: any[], workspaceContext: any) {
  const text = prompt.trim();
  const lower = text.toLowerCase();
  const teamName = workspaceContext?.team?.name || "First";
  const projects = workspaceContext?.projects || [];

  // Extract targetId if present in prompt (e.g. proj-123, prj_abc, PRJ-1, FIR-1, iss_abc)
  const targetIdMatch = text.match(/(?:proj-[a-zA-Z0-9_-]+|prj_[a-zA-Z0-9_-]+|PRJ-\d+|issue-[a-zA-Z0-9_-]+|iss_[a-zA-Z0-9_-]+|FIR-\d+)/i);
  const targetId = targetIdMatch ? targetIdMatch[0] : null;

  // Extract any excluded ID or names (e.g. "lasciando escluso proj-...", "tranne ASDASD", "eccetto ...")
  let excludeIds: string[] = [];
  const excludeMatch = text.match(/(?:lasciando escluso|tranne|eccetto|escluso|senza)\s+(?:il progetto|la task|l'issue)?\s*(?:con ID)?\s*([`"']?([a-zA-Z0-9_-]+)[`"']?)/i);
  if (excludeMatch && excludeMatch[1]) {
    const rawExcl = excludeMatch[1].replace(/[`"']/g, "").trim();
    if (rawExcl && rawExcl.length > 1) {
      excludeIds.push(rawExcl);
    }
  }
  // Also check if multiple names are quoted e.g. ("ASDASD")
  const quotedMatch = text.match(/\(["']?([a-zA-Z0-9_-]+)["']?\)/);
  if (quotedMatch && quotedMatch[1] && !excludeIds.includes(quotedMatch[1])) {
    excludeIds.push(quotedMatch[1]);
  }

  // 1. Intent: Update Projects (To Do / Planned / Done / Completed / In Progress / Backlog)
  if (
    lower.includes("progett") ||
    lower.includes("project") ||
    lower.includes("stato") ||
    Boolean(targetId && targetId.toLowerCase().includes("pr"))
  ) {
    let targetStatus = "Planned";
    if (lower.includes("done") || lower.includes("complet") || lower.includes("chiud") || lower.includes("termina")) {
      targetStatus = "Completed";
    } else if (lower.includes("todo") || lower.includes("to do") || lower.includes("pianifica") || lower.includes("planned")) {
      targetStatus = "Planned";
    } else if (lower.includes("progress") || lower.includes("corso") || lower.includes("avvia") || lower.includes("sviluppo")) {
      targetStatus = "In Progress";
    } else if (lower.includes("backlog")) {
      targetStatus = "Backlog";
    }

    const isAll = lower.includes("tutti") || lower.includes("all") || !targetId || excludeIds.length > 0;
    const filter = isAll ? "all" : targetId;

    return {
      text: excludeIds.length > 0
        ? `Certamente! Ho impostato i progetti in stato **${targetStatus}**, escludendo ${excludeIds.join(", ")}.`
        : isAll
        ? `Perfetto! Ho aggiornato lo stato di tutti i progetti del workspace in **${targetStatus}**.`
        : `Certamente! Ho aggiornato lo stato del progetto selezionato (${targetId}) in **${targetStatus}**.`,
      actionResult: {
        type: "projects_updated",
        data: {
          filter,
          targetId,
          excludeIds: excludeIds.length > 0 ? excludeIds : undefined,
          status: targetStatus,
        },
      },
    };
  }

  // 2. Intent: Update Issues
  if (
    lower.includes("issue") ||
    lower.includes("task") ||
    Boolean(targetId && targetId.toLowerCase().includes("fir"))
  ) {
    let targetStatus = "todo";
    if (lower.includes("done") || lower.includes("complet") || lower.includes("chiud")) {
      targetStatus = "done";
    } else if (lower.includes("progress") || lower.includes("corso")) {
      targetStatus = "in_progress";
    } else if (lower.includes("backlog")) {
      targetStatus = "backlog";
    }

    const isAll = lower.includes("tutte") || lower.includes("tutti") || !targetId;
    const filter = isAll ? "all" : targetId;

    return {
      text: isAll
        ? `Fatto! Ho aggiornato tutte le issue del workspace allo stato **${targetStatus}**.`
        : `Fatto! Ho aggiornato l'issue ${targetId} allo stato **${targetStatus}**.`,
      actionResult: {
        type: "issues_updated",
        data: {
          filter,
          targetId,
          status: targetStatus,
        },
      },
    };
  }

  return {
    text: `Ho analizzato la richiesta per il team **${teamName}**. Come posso aiutarti con i progetti e le task?`,
    actionResult: null,
  };
}
