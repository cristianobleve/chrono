#!/usr/bin/env node

import { spawn } from "child_process";
import path from "path";
import readline from "readline";

const toolName = process.argv[2];
const rawArgs = process.argv[3];

if (!toolName) {
  console.log("Uso: npx tsx scripts/call-tool.ts <nome_tool> [argomenti_json]");
  console.log("\nEsempi:");
  console.log("  npx tsx scripts/call-tool.ts list_workspaces");
  console.log("  npx tsx scripts/call-tool.ts get_workspace_summary");
  console.log("  npx tsx scripts/call-tool.ts list_projects '{\"limit\": 3}'");
  console.log("  npx tsx scripts/call-tool.ts list_issues '{\"status\": \"todo\"}'");
  process.exit(0);
}

let args: Record<string, any> = {};
if (rawArgs) {
  try {
    args = JSON.parse(rawArgs);
  } catch (err) {
    console.error("Errore: gli argomenti devono essere in formato JSON valido.");
    process.exit(1);
  }
}

const projectRoot = path.resolve(__dirname, "..");
const serverScript = path.join(projectRoot, "src", "mcp", "server.ts");

const child = spawn("npx", ["tsx", serverScript], {
  cwd: projectRoot,
  stdio: ["pipe", "pipe", "pipe"],
  shell: true,
  env: { ...process.env },
});

const rl = readline.createInterface({
  input: child.stdout,
  terminal: false,
});

child.stderr.on("data", (data) => {
  // Stderr logs from the server
});

let messageId = 1;
const pendingRequests = new Map<number, (res: any) => void>();

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const json = JSON.parse(trimmed);
    if (json.id && pendingRequests.has(json.id)) {
      const resolver = pendingRequests.get(json.id)!;
      pendingRequests.delete(json.id);
      resolver(json);
    }
  } catch {
    // Non-json stdout lines
  }
});

function sendRequest(method: string, params: Record<string, any> = {}): Promise<any> {
  const id = messageId++;
  const payload = JSON.stringify({ jsonrpc: "2.0", id, method, params });
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Timeout per richiesta ${method}`));
    }, 10000);
    pendingRequests.set(id, (res) => {
      clearTimeout(timeout);
      resolve(res);
    });
    child.stdin.write(payload + "\n");
  });
}

function sendNotification(method: string, params: Record<string, any> = {}) {
  const payload = JSON.stringify({ jsonrpc: "2.0", method, params });
  child.stdin.write(payload + "\n");
}

async function run() {
  try {
    await sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "chrono-cli-caller", version: "1.0.0" },
    });
    sendNotification("notifications/initialized");

    const res = await sendRequest("tools/call", {
      name: toolName,
      arguments: args,
    });

    if (res.result?.content?.[0]?.text) {
      try {
        const parsed = JSON.parse(res.result.content[0].text);
        console.log(JSON.stringify(parsed, null, 2));
      } catch {
        console.log(res.result.content[0].text);
      }
    } else {
      console.log(JSON.stringify(res.result || res, null, 2));
    }
  } catch (err: any) {
    console.error("Errore durante l'esecuzione del tool:", err.message || err);
  } finally {
    child.kill();
    process.exit(0);
  }
}

run();
