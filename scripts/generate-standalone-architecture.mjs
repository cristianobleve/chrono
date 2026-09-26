import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import * as reicon from 'reicon';

// Helper to extract SVG inner paths from Reicon icons
const getSvgPath = (fn, color = '#f4f4f5') => {
  const svg = fn.toSvg({ size: 22, color });
  return svg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');
};

const layersSvg = getSvgPath(reicon.Layers, '#f4f4f5');
const cpuSvg = getSvgPath(reicon.Cpu, '#f4f4f5');
const databaseSvg = getSvgPath(reicon.Database, '#f4f4f5');
const serverSvg = getSvgPath(reicon.Server, '#f4f4f5');
const shieldSvg = getSvgPath(reicon.ShieldCheck, '#a1a1aa');

const buildStandaloneArchitectureSvg = (width = 1920, height = 960) => `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .t-title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; font-size: 26px; font-weight: 700; fill: #ffffff; letter-spacing: -0.025em; }
      .t-sub { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; font-size: 13px; font-weight: 400; fill: #a1a1aa; line-height: 1.4; }
      .t-kicker { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; font-size: 12px; font-weight: 600; fill: #71717a; letter-spacing: 0.02em; }
      .t-card-h { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; font-size: 16px; font-weight: 600; fill: #ffffff; letter-spacing: -0.015em; }
      .t-card-sub { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; font-size: 12px; font-weight: 400; fill: #71717a; }
      .t-item-title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; font-size: 12.5px; font-weight: 600; fill: #f4f4f5; }
      .t-item-desc { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; font-size: 11.5px; font-weight: 400; fill: #a1a1aa; line-height: 1.35; }
      .t-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; }
      .t-bus { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; font-weight: 500; fill: #a1a1aa; }
      .t-boundary { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; font-size: 11.5px; font-weight: 600; fill: #a1a1aa; letter-spacing: 0.02em; }
    </style>

    <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#14151a" />
      <stop offset="100%" stop-color="#0c0d10" />
    </linearGradient>

    <linearGradient id="boundaryBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f1115" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#08090b" stop-opacity="0.8" />
    </linearGradient>
  </defs>

  <!-- Canvas Background -->
  <rect width="${width}" height="${height}" rx="16" fill="#09090b" stroke="#27272a" stroke-width="1.5" />

  <!-- Subtle Blueprint Coordinate Grid (quiet zinc tone) -->
  <g opacity="0.12" stroke="#27272a" stroke-width="1">
    ${Array.from({ length: 31 }, (_, i) => `<line x1="${(i + 1) * 60}" y1="0" x2="${(i + 1) * 60}" y2="${height}" />`).join('')}
    ${Array.from({ length: 15 }, (_, i) => `<line x1="0" y1="${(i + 1) * 60}" x2="${width}" y2="${(i + 1) * 60}" />`).join('')}
  </g>

  <!-- ========================================================================= -->
  <!-- HEADER ROW                                                                -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 56)">
    <text x="0" y="0" class="t-kicker">Chrono Platform Architecture</text>
    <text x="0" y="30" class="t-title">End-to-End System Topology</text>
    <text x="0" y="54" class="t-sub">High-concurrency data flow across client runtime, MCP agent server, PostgreSQL engine, and media transport.</text>
  </g>

  <!-- Header Right Status Chip -->
  <g transform="translate(1490, 60)">
    <rect x="0" y="0" width="350" height="38" rx="8" fill="#121318" stroke="#27272a" stroke-width="1" />
    <circle cx="20" cy="19" r="4" fill="#10b981" />
    <text x="34" y="23" class="t-mono" fill="#d4d4d8">PostgreSQL 16 / Row Level Security</text>
  </g>

  <!-- ========================================================================= -->
  <!-- PROTECTED DATA PLANE (TENANT BOUNDARY) ENCLOSURE                          -->
  <!-- ========================================================================= -->
  <g transform="translate(950, 160)">
    <rect x="0" y="0" width="890" height="660" rx="12" fill="url(#boundaryBg)" stroke="#27272a" stroke-dasharray="6 6" stroke-width="1.5" />
    
    <!-- Boundary Pill Header -->
    <rect x="24" y="-14" width="240" height="28" rx="6" fill="#18181b" stroke="#27272a" stroke-width="1" />
    <g transform="translate(34, -8)">
      ${shieldSvg}
    </g>
    <text x="64" y="4.5" class="t-boundary">Workspace Tenant Boundary</text>
  </g>

  <!-- ========================================================================= -->
  <!-- CARD 1: PRESENTATION TIER (x: 80, y: 175)                                 -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 175)">
    <rect width="405" height="630" rx="12" fill="url(#cardBg)" stroke="#27272a" stroke-width="1" />
    
    <!-- Card Header -->
    <rect x="22" y="22" width="40" height="40" rx="8" fill="#18181b" stroke="#27272a" stroke-width="1" />
    <g transform="translate(31, 31)">
      ${layersSvg}
    </g>
    <text x="74" y="39" class="t-card-h">Presentation Tier</text>
    <text x="74" y="55" class="t-card-sub">Next.js 15 and React 19 Client</text>

    <line x1="22" y1="78" x2="383" y2="78" stroke="#27272a" stroke-width="1" />

    <!-- Feature 1 -->
    <g transform="translate(22, 102)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">App Router and Server Actions</text>
      <text x="18" y="27" class="t-item-desc">Type-safe route handlers with strict Zod validation</text>
    </g>

    <!-- Feature 2 -->
    <g transform="translate(22, 162)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Zustand Reactive Store</text>
      <text x="18" y="27" class="t-item-desc">Optimistic client cache and local offline resilience</text>
    </g>

    <!-- Feature 3 -->
    <g transform="translate(22, 222)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Reicon Vector Icon System</text>
      <text x="18" y="27" class="t-item-desc">2,600+ tree-shaken geometric SVG icons</text>
    </g>

    <!-- Feature 4 -->
    <g transform="translate(22, 282)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Keyboard Navigation Engine</text>
      <text x="18" y="27" class="t-item-desc">Global Cmd+K command palette and ticket hotkeys</text>
    </g>

    <!-- Feature 5 -->
    <g transform="translate(22, 342)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Productivity Workspaces</text>
      <text x="18" y="27" class="t-item-desc">Interactive Kanban, Eisenhower matrix, and Pomodoro</text>
    </g>

    <!-- Feature 6 -->
    <g transform="translate(22, 402)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Hardware-Throttled WebGL</text>
      <text x="18" y="27" class="t-item-desc">Ambient Silk shader canvas with low-power 24 FPS lock</text>
    </g>

    <!-- Bottom Specs Footer -->
    <rect x="22" y="566" width="361" height="40" rx="6" fill="#121318" stroke="#27272a" stroke-width="1" />
    <text x="36" y="591" class="t-mono" fill="#a1a1aa">Next.js 15 / Turbopack / Zustand / Reicon</text>
  </g>

  <!-- CONNECTOR 1: Client -> Edge -->
  <g transform="translate(485, 485)">
    <line x1="0" y1="0" x2="38" y2="0" stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="4 3" />
    <polygon points="38,-4 45,0 38,4" fill="#71717a" />
    
    <rect x="-2" y="-24" width="48" height="18" rx="4" fill="#18181b" stroke="#27272a" stroke-width="1" />
    <text x="4" y="-12" class="t-bus">RPC</text>
  </g>

  <!-- ========================================================================= -->
  <!-- CARD 2: EDGE INTELLIGENCE & MCP (x: 535, y: 175)                          -->
  <!-- ========================================================================= -->
  <g transform="translate(535, 175)">
    <rect width="405" height="630" rx="12" fill="url(#cardBg)" stroke="#27272a" stroke-width="1" />
    
    <!-- Card Header -->
    <rect x="22" y="22" width="40" height="40" rx="8" fill="#18181b" stroke="#27272a" stroke-width="1" />
    <g transform="translate(31, 31)">
      ${cpuSvg}
    </g>
    <text x="74" y="39" class="t-card-h">Edge Protocol &amp; AI</text>
    <text x="74" y="55" class="t-card-sub">MCP Server and Multi-LLM Gateway</text>

    <line x1="22" y1="78" x2="383" y2="78" stroke="#27272a" stroke-width="1" />

    <!-- Feature 1 -->
    <g transform="translate(22, 102)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Embedded MCP Server</text>
      <text x="18" y="27" class="t-item-desc">stdio JSON-RPC bridge for Claude Code and Cursor</text>
    </g>

    <!-- Feature 2 -->
    <g transform="translate(22, 162)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Multi-Provider LLM Router</text>
      <text x="18" y="27" class="t-item-desc">Dynamic fallback across Gemini 2.5, Groq, and OpenAI</text>
    </g>

    <!-- Feature 3 -->
    <g transform="translate(22, 222)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Markdown Roadmap Parser</text>
      <text x="18" y="27" class="t-item-desc">Automated ingestion of project specs and issue trees</text>
    </g>

    <!-- Feature 4 -->
    <g transform="translate(22, 282)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Real-Time Event Dispatcher</text>
      <text x="18" y="27" class="t-item-desc">Workspace state changes and collaborator notifications</text>
    </g>

    <!-- Feature 5 -->
    <g transform="translate(22, 342)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Native Internationalization</text>
      <text x="18" y="27" class="t-item-desc">Synchronized 5-language dictionary (EN, IT, DE, FR, RU)</text>
    </g>

    <!-- Feature 6 -->
    <g transform="translate(22, 402)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Audited Logic Boundaries</text>
      <text x="18" y="27" class="t-item-desc">Finite-state workflows with zero unverified mutations</text>
    </g>

    <!-- Bottom Specs Footer -->
    <rect x="22" y="566" width="361" height="40" rx="6" fill="#121318" stroke="#27272a" stroke-width="1" />
    <text x="36" y="591" class="t-mono" fill="#a1a1aa">MCP stdio / Gemini 2.5 / Groq / JSON-RPC</text>
  </g>

  <!-- CONNECTOR 2: Edge -> Data Plane -->
  <g transform="translate(940, 485)">
    <line x1="0" y1="0" x2="30" y2="0" stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="4 3" />
    <polygon points="30,-4 37,0 30,4" fill="#71717a" />
    
    <rect x="-4" y="-24" width="46" height="18" rx="4" fill="#18181b" stroke="#27272a" stroke-width="1" />
    <text x="2" y="-12" class="t-bus">QUERY</text>
  </g>

  <!-- ========================================================================= -->
  <!-- CARD 3: DATABASE & ACCESS MESH (x: 980, y: 195)                           -->
  <!-- ========================================================================= -->
  <g transform="translate(980, 195)">
    <rect width="405" height="595" rx="12" fill="url(#cardBg)" stroke="#27272a" stroke-width="1" />
    
    <!-- Card Header -->
    <rect x="22" y="22" width="40" height="40" rx="8" fill="#18181b" stroke="#27272a" stroke-width="1" />
    <g transform="translate(31, 31)">
      ${databaseSvg}
    </g>
    <text x="74" y="39" class="t-card-h">Relational Core &amp; RLS</text>
    <text x="74" y="55" class="t-card-sub">PostgreSQL 16 and Supabase Engine</text>

    <line x1="22" y1="78" x2="383" y2="78" stroke="#27272a" stroke-width="1" />

    <!-- Feature 1 -->
    <g transform="translate(22, 102)">
      <circle cx="4" cy="6" r="3" fill="#10b981" />
      <text x="18" y="10" class="t-item-title">Multi-Tenant Row Level Security</text>
      <text x="18" y="27" class="t-item-desc">Cryptographic tenant isolation across all tables</text>
    </g>

    <!-- Feature 2 -->
    <g transform="translate(22, 162)">
      <circle cx="4" cy="6" r="3" fill="#10b981" />
      <text x="18" y="10" class="t-item-title">Realtime WebSocket CDC</text>
      <text x="18" y="27" class="t-item-desc">Direct WAL stream for task and milestone changes</text>
    </g>

    <!-- Feature 3 -->
    <g transform="translate(22, 222)">
      <circle cx="4" cy="6" r="3" fill="#10b981" />
      <text x="18" y="10" class="t-item-title">Tokenized Workspace Access</text>
      <text x="18" y="27" class="t-item-desc">Signed invitation tokens with strict membership checks</text>
    </g>

    <!-- Feature 4 -->
    <g transform="translate(22, 282)">
      <circle cx="4" cy="6" r="3" fill="#10b981" />
      <text x="18" y="10" class="t-item-title">OAuth and Identity Federation</text>
      <text x="18" y="27" class="t-item-desc">Unified authentication via GitHub, Google, and Magic Link</text>
    </g>

    <!-- Feature 5 -->
    <g transform="translate(22, 342)">
      <circle cx="4" cy="6" r="3" fill="#10b981" />
      <text x="18" y="10" class="t-item-title">Immutable Activity Ledger</text>
      <text x="18" y="27" class="t-item-desc">Complete audit chronogram tracking all entity mutations</text>
    </g>

    <!-- Feature 6 -->
    <g transform="translate(22, 402)">
      <circle cx="4" cy="6" r="3" fill="#10b981" />
      <text x="18" y="10" class="t-item-title">Declarative Migrations</text>
      <text x="18" y="27" class="t-item-desc">Supabase CLI pipeline with automated schema versioning</text>
    </g>

    <!-- Bottom Specs Footer -->
    <rect x="22" y="535" width="361" height="40" rx="6" fill="#121318" stroke="#27272a" stroke-width="1" />
    <text x="36" y="560" class="t-mono" fill="#a1a1aa">PostgreSQL 16 / RLS Policies / WAL CDC</text>
  </g>

  <!-- CONNECTOR 3: Database -> Storage -->
  <g transform="translate(1385, 485)">
    <line x1="0" y1="0" x2="40" y2="0" stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="4 3" />
    <polygon points="40,-4 47,0 40,4" fill="#71717a" />
    
    <rect x="0" y="-24" width="46" height="18" rx="4" fill="#18181b" stroke="#27272a" stroke-width="1" />
    <text x="6" y="-12" class="t-bus">SYNC</text>
  </g>

  <!-- ========================================================================= -->
  <!-- CARD 4: STORAGE & MEDIA PIPELINE (x: 1435, y: 195)                        -->
  <!-- ========================================================================= -->
  <g transform="translate(1435, 195)">
    <rect width="405" height="595" rx="12" fill="url(#cardBg)" stroke="#27272a" stroke-width="1" />
    
    <!-- Card Header -->
    <rect x="22" y="22" width="40" height="40" rx="8" fill="#18181b" stroke="#27272a" stroke-width="1" />
    <g transform="translate(31, 31)">
      ${serverSvg}
    </g>
    <text x="74" y="39" class="t-card-h">Storage &amp; Transport</text>
    <text x="74" y="55" class="t-card-sub">Cloudflare R2 and Transactional SMTP</text>

    <line x1="22" y1="78" x2="383" y2="78" stroke="#27272a" stroke-width="1" />

    <!-- Feature 1 -->
    <g transform="translate(22, 102)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">S3-Compatible Object Store</text>
      <text x="18" y="27" class="t-item-desc">Cloudflare R2 bucket for covers, avatars, and assets</text>
    </g>

    <!-- Feature 2 -->
    <g transform="translate(22, 162)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Direct SSL SMTP Delivery</text>
      <text x="18" y="27" class="t-item-desc">Nodemailer with Resend SMTP on port 465</text>
    </g>

    <!-- Feature 3 -->
    <g transform="translate(22, 222)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Edge CDN Distribution</text>
      <text x="18" y="27" class="t-item-desc">Global caching headers for static assets and attachments</text>
    </g>

    <!-- Feature 4 -->
    <g transform="translate(22, 282)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Circuit Breaker Resiliency</text>
      <text x="18" y="27" class="t-item-desc">Graceful fallback handling for mail delivery and bucket tasks</text>
    </g>

    <!-- Feature 5 -->
    <g transform="translate(22, 342)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Secure Password Recovery</text>
      <text x="18" y="27" class="t-item-desc">Cryptographic token verification with rate limiting</text>
    </g>

    <!-- Feature 6 -->
    <g transform="translate(22, 402)">
      <circle cx="4" cy="6" r="3" fill="#71717a" />
      <text x="18" y="10" class="t-item-title">Structured Data Export</text>
      <text x="18" y="27" class="t-item-desc">Full workspace backups available in CSV and JSON formats</text>
    </g>

    <!-- Bottom Specs Footer -->
    <rect x="22" y="535" width="361" height="40" rx="6" fill="#121318" stroke="#27272a" stroke-width="1" />
    <text x="36" y="560" class="t-mono" fill="#a1a1aa">Cloudflare R2 / Nodemailer / Resend SSL 465</text>
  </g>

  <!-- ========================================================================= -->
  <!-- BOTTOM DATA PIPELINE FLOW                                                 -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 856)">
    <rect x="0" y="0" width="1760" height="44" rx="8" fill="#121318" stroke="#27272a" stroke-width="1" />
    
    <text x="24" y="27" class="t-kicker">DATA PIPELINE</text>
    
    <text x="150" y="27" class="t-mono" fill="#f4f4f5">Client View</text>
    <text x="240" y="27" class="t-mono" fill="#71717a">&gt;</text>
    <text x="265" y="27" class="t-mono" fill="#f4f4f5">Server Action / MCP</text>
    <text x="430" y="27" class="t-mono" fill="#71717a">&gt;</text>
    <text x="455" y="27" class="t-mono" fill="#10b981">Tenant RLS Guard</text>
    <text x="605" y="27" class="t-mono" fill="#71717a">&gt;</text>
    <text x="630" y="27" class="t-mono" fill="#f4f4f5">PostgreSQL 16 Engine</text>
    <text x="800" y="27" class="t-mono" fill="#71717a">&gt;</text>
    <text x="825" y="27" class="t-mono" fill="#f4f4f5">WebSocket CDC Sync</text>
    <text x="985" y="27" class="t-mono" fill="#71717a">&gt;</text>
    <text x="1010" y="27" class="t-mono" fill="#f4f4f5">R2 Storage &amp; SMTP Relay</text>

    <text x="1650" y="27" class="t-mono" fill="#71717a">Chrono Core</text>
  </g>
</svg>
`;

async function run() {
  const svgContent = buildStandaloneArchitectureSvg(1920, 960);
  
  // 1. Ensure assets/ and screenshots/ exist
  if (!fs.existsSync('assets')) fs.mkdirSync('assets', { recursive: true });
  if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots', { recursive: true });

  // 2. Save standalone vector SVG
  fs.writeFileSync('assets/architecture.svg', svgContent, 'utf-8');
  console.log('Saved assets/architecture.svg');

  // 3. Render directly to screenshots/architecture.png via sharp
  await sharp(Buffer.from(svgContent))
    .png({ quality: 95 })
    .toFile('screenshots/architecture.png');
  console.log('Rendered screenshots/architecture.png successfully');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
