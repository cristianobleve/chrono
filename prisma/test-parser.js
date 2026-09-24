const { parseProjectMarkdown } = require("../src/lib/markdownProjectParser");
const { sampleProjectMarkdown } = require("../src/lib/projectTemplateExample");

function testParser() {
  console.log("Testing Markdown Project Parser...");

  const parsed = parseProjectMarkdown(sampleProjectMarkdown);

  console.log("Project Name:", parsed.name);
  console.log("Summary:", parsed.summary);
  console.log("Status:", parsed.status);
  console.log("Priority:", parsed.priority);
  console.log("Target Date:", parsed.targetDate);
  console.log("Milestones count:", parsed.milestones.length);
  console.log("Issues count:", parsed.issues.length);

  if (parsed.name.includes("Cloud Infrastructure") && parsed.issues.length >= 4 && parsed.milestones.length >= 3) {
    console.log("\n✓ PARSER TEST PASSED SUCCESSFULLY!");
  } else {
    console.error("\n✗ PARSER TEST FAILED");
    process.exit(1);
  }
}

testParser();
