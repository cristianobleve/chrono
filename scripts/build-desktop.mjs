import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const apiDir = path.join(rootDir, "src", "app", "api");
const apiBak = path.join(rootDir, "src", "app", "_api_desktop_bak");
const authDir = path.join(rootDir, "src", "app", "auth");
const authBak = path.join(rootDir, "src", "app", "_auth_desktop_bak");

let movedApi = false;
let movedAuth = false;

try {
  if (fs.existsSync(apiDir)) {
    fs.renameSync(apiDir, apiBak);
    movedApi = true;
  }
  if (fs.existsSync(authDir)) {
    fs.renameSync(authDir, authBak);
    movedAuth = true;
  }

  console.log("[Desktop Build] Exporting Next.js static bundle for Tauri...");
  execSync("npx next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_IS_DESKTOP: "true",
    },
  });
  console.log("[Desktop Build] Static export completed successfully in /out.");
} finally {
  if (movedApi && fs.existsSync(apiBak)) {
    fs.renameSync(apiBak, apiDir);
  }
  if (movedAuth && fs.existsSync(authBak)) {
    fs.renameSync(authBak, authDir);
  }
}
