import { spawn } from "child_process";
import path from "path";
import readline from "readline";

const projectRoot = path.resolve(__dirname, "..");
const serverScript = path.join(projectRoot, "src", "mcp", "server.ts");

console.log("[MCP Test] Launching Chrono MCP Server process...");
console.log(`[MCP Test] Script: ${serverScript}`);

// Use npx tsx to execute the server script
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
  const line = data.toString().trim();
  if (line) {
    console.log(`[MCP Server stderr] ${line}`);
  }
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
  } catch (err) {
    console.error("[MCP Test] Received non-JSON output from stdout:", trimmed);
  }
});

function sendRequest(method: string, params: Record<string, any> = {}): Promise<any> {
  const id = messageId++;
  const payload = JSON.stringify({
    jsonrpc: "2.0",
    id,
    method,
    params,
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Timeout waiting for response to ${method} (id=${id})`));
    }, 15000);

    pendingRequests.set(id, (res) => {
      clearTimeout(timeout);
      resolve(res);
    });

    child.stdin.write(payload + "\n");
  });
}

function sendNotification(method: string, params: Record<string, any> = {}) {
  const payload = JSON.stringify({
    jsonrpc: "2.0",
    method,
    params,
  });
  child.stdin.write(payload + "\n");
}

async function runTests() {
  try {
    // 1. Initialize
    console.log("\n--- TEST 1: Initialize Handshake ---");
    const initRes = await sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "chrono-mcp-test-runner", version: "1.0.0" },
    });

    if (initRes.result?.serverInfo?.name === "chrono-mcp") {
      console.log(`✅ Handshake successful. Server: ${initRes.result.serverInfo.name} v${initRes.result.serverInfo.version}`);
    } else {
      throw new Error(`Unexpected initialize response: ${JSON.stringify(initRes)}`);
    }

    sendNotification("notifications/initialized");

    // 2. List Tools
    console.log("\n--- TEST 2: tools/list ---");
    const toolsRes = await sendRequest("tools/list", {});
    const tools = toolsRes.result?.tools || [];
    console.log(`✅ Received ${tools.length} registered tools:`);
    for (const t of tools) {
      console.log(`   - ${t.name}: ${t.description.slice(0, 70)}...`);
    }

    if (tools.length < 15) {
      throw new Error(`Expected at least 15 tools, found ${tools.length}`);
    }

    // 3. Call list_workspaces
    console.log("\n--- TEST 3: tools/call -> list_workspaces ---");
    const wsRes = await sendRequest("tools/call", {
      name: "list_workspaces",
      arguments: {},
    });
    const wsData = JSON.parse(wsRes.result.content[0].text);
    console.log(`✅ Workspaces retrieved (${wsData.length}):`);
    for (const w of wsData) {
      console.log(`   - [${w.id}] ${w.name} (${w.slug})`);
    }

    // 4. Call list_projects
    console.log("\n--- TEST 4: tools/call -> list_projects ---");
    const prjRes = await sendRequest("tools/call", {
      name: "list_projects",
      arguments: { limit: 5 },
    });
    const prjData = JSON.parse(prjRes.result.content[0].text);
    console.log(`✅ Projects retrieved (${prjData.count} items in ${prjData.workspaceId}):`);
    for (const p of prjData.projects.slice(0, 3)) {
      console.log(`   - [${p.id}] ${p.name} (Status: ${p.status}, Priority: ${p.priority})`);
    }

    // 5. Call list_issues
    console.log("\n--- TEST 5: tools/call -> list_issues ---");
    const issuesRes = await sendRequest("tools/call", {
      name: "list_issues",
      arguments: { limit: 5 },
    });
    const issuesData = JSON.parse(issuesRes.result.content[0].text);
    console.log(`✅ Issues retrieved (${issuesData.count} items):`);
    for (const i of issuesData.issues.slice(0, 3)) {
      console.log(`   - [${i.identifier}] ${i.title} (${i.status} / ${i.priority})`);
    }

    // 6. Test Mutation: create_issue
    console.log("\n--- TEST 6: tools/call -> create_issue (Write Test) ---");
    const testTitle = `MCP Test Task - ${Date.now()}`;
    const createRes = await sendRequest("tools/call", {
      name: "create_issue",
      arguments: {
        title: testTitle,
        description: "Created via automated MCP test suite verification.",
        priority: "urgent",
        status: "todo",
        estimate: 3,
        labels: ["Test", "MCP"],
      },
    });
    const createdIssueResult = JSON.parse(createRes.result.content[0].text);
    const createdIssue = createdIssueResult.issue;
    console.log(`✅ Created test issue: [${createdIssue.identifier}] ${createdIssue.title} (ID: ${createdIssue.id})`);

    // 7. Verify get_issue
    console.log("\n--- TEST 7: tools/call -> get_issue ---");
    const getRes = await sendRequest("tools/call", {
      name: "get_issue",
      arguments: { issueId: createdIssue.id },
    });
    const fetchedIssue = JSON.parse(getRes.result.content[0].text);
    if (fetchedIssue.id === createdIssue.id && fetchedIssue.title === testTitle) {
      console.log(`✅ Verified issue fetched correctly by ID.`);
    } else {
      throw new Error(`Fetched issue mismatch: ${JSON.stringify(fetchedIssue)}`);
    }

    // 8. Test Mutation: update_issue
    console.log("\n--- TEST 8: tools/call -> update_issue ---");
    const updateRes = await sendRequest("tools/call", {
      name: "update_issue",
      arguments: {
        issueId: createdIssue.id,
        status: "in_progress",
        priority: "high",
      },
    });
    const updatedIssueResult = JSON.parse(updateRes.result.content[0].text);
    const updatedIssue = updatedIssueResult.issue;
    console.log(`✅ Updated test issue: Status=${updatedIssue.status}, Priority=${updatedIssue.priority}`);

    // 9. Clean up: delete_issue
    console.log("\n--- TEST 9: tools/call -> delete_issue (Cleanup) ---");
    const deleteRes = await sendRequest("tools/call", {
      name: "delete_issue",
      arguments: { issueId: createdIssue.id },
    });
    const deleteResult = JSON.parse(deleteRes.result.content[0].text);
    console.log(`✅ ${deleteResult.message}`);

    // 10. Call get_workspace_summary
    console.log("\n--- TEST 10: tools/call -> get_workspace_summary ---");
    const summaryRes = await sendRequest("tools/call", {
      name: "get_workspace_summary",
      arguments: {},
    });
    const summaryData = JSON.parse(summaryRes.result.content[0].text);
    console.log(`✅ Workspace summary:`);
    console.log(`   - Workspace: ${summaryData.workspace?.name}`);
    console.log(`   - Total Projects: ${summaryData.metrics?.totalProjects}`);
    console.log(`   - Active Projects: ${summaryData.metrics?.activeProjectsCount}`);
    console.log(`   - Total Issues: ${summaryData.metrics?.issuesByStatus?.total}`);
    console.log(`   - Urgent Open Issues: ${summaryData.metrics?.urgentOpenIssuesCount}`);

    console.log("\n==========================================");
    console.log("🎉 ALL 10 MCP TESTS PASSED SUCCESSFULLY!");
    console.log("==========================================\n");
  } catch (err: any) {
    console.error("\n❌ MCP Test failed:", err.message || err);
    process.exitCode = 1;
  } finally {
    child.kill();
    process.exit(process.exitCode || 0);
  }
}

runTests();
