const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSupabase() {
  console.log("Seeding Supabase database with initial workspace, team, and projects...");

  // 1. Create Workspace
  const { data: wsData, error: wsError } = await supabase
    .from("workspaces")
    .upsert({
      name: "first",
      slug: "asdpallestragcc",
      icon: "first",
    }, { onConflict: "slug" })
    .select()
    .single();

  if (wsError) {
    console.error("Error creating workspace:", wsError);
    return;
  }
  console.log("✓ Workspace created/synced:", wsData.name);

  // 2. Create Team
  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .upsert({
      name: "First",
      key: "FIR",
      workspace_id: wsData.id,
    }, { onConflict: "key" })
    .select()
    .single();

  if (teamError) {
    console.error("Error creating team:", teamError);
    return;
  }
  console.log("✓ Team created/synced:", teamData.name);

  // 3. Create Project CASD
  const { data: projData, error: projError } = await supabase
    .from("projects")
    .upsert({
      name: "CASD",
      slug: "casd-7b27a4e7f59c",
      summary: "Add a short summary...",
      description: "adssadadsads",
      status: "Backlog",
      priority: "none",
      team_id: teamData.id,
    }, { onConflict: "team_id,slug" })
    .select()
    .single();

  if (projError) {
    console.error("Error creating project:", projError);
  } else {
    console.log("✓ Project created/synced:", projData.name);

    // 4. Create Issues
    const issuesToInsert = [
      {
        identifier: "FIR-1",
        title: "Implement Command+K Global Quick Search",
        description: "Build an ultra-fast modal for global search, shortcuts and action execution.",
        status: "in_progress",
        priority: "high",
        estimate: 3,
        team_id: teamData.id,
        project_id: projData.id,
        labels: ["Frontend", "UX"],
      },
      {
        identifier: "FIR-2",
        title: "Design System Hairline Borders and Surface Ladder",
        description: "Verify #010102 canvas and #0f1011 surface 1 token application across all cards.",
        status: "done",
        priority: "urgent",
        estimate: 2,
        team_id: teamData.id,
        project_id: projData.id,
        labels: ["Design System", "Core"],
      },
      {
        identifier: "FIR-3",
        title: "Linear Agent Conversational Workspace Assistant",
        description: "Support natural language queries, project summaries, and issue generation.",
        status: "todo",
        priority: "medium",
        estimate: 5,
        team_id: teamData.id,
        project_id: projData.id,
        labels: ["AI", "Agent"],
      },
      {
        identifier: "FIR-4",
        title: "Keyboard Shortcuts [N then P] and [C]",
        description: "Add keyboard listeners for instant project creation and issue logging.",
        status: "backlog",
        priority: "low",
        estimate: 1,
        team_id: teamData.id,
        project_id: projData.id,
        labels: ["Shortcuts"],
      },
    ];

    for (const issue of issuesToInsert) {
      const { error: issueErr } = await supabase
        .from("issues")
        .upsert(issue, { onConflict: "identifier" });
      if (issueErr) console.error("Error creating issue:", issueErr);
    }
    console.log("✓ Issues created/synced (4 issues)");
  }

  console.log("🚀 Supabase Database seeded successfully!");
}

seedSupabase();
