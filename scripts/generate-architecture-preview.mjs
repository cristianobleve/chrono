import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import * as reicon from 'reicon';

// Extract raw SVG paths for icons
const getSvgPath = (fn, color = '#60a5fa') => {
  const svg = fn.toSvg({ size: 24, color });
  return svg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');
};

const layersSvg = getSvgPath(reicon.Layers, '#60a5fa');
const sparkleSvg = getSvgPath(reicon.Sparkle, '#c084fc');
const shieldSvg = getSvgPath(reicon.ShieldCheck, '#34d399');
const serverSvg = getSvgPath(reicon.Server, '#38bdf8');

// Build modern architecture SVG
const buildArchitectureSvg = (width = 1860, height = 770) => `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .t-title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 26px; font-weight: 700; fill: #ffffff; letter-spacing: -0.03em; }
      .t-sub { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; font-weight: 400; fill: #a1a1aa; }
      .t-badge { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; font-weight: 600; }
      .t-card-h { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 16px; font-weight: 600; fill: #ffffff; letter-spacing: -0.02em; }
      .t-card-sub { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12px; font-weight: 500; fill: #71717a; }
      .t-body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 12.5px; font-weight: 400; fill: #d4d4d8; line-height: 1.6; }
      .t-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; }
      .t-bus { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; font-weight: 500; fill: #a1a1aa; }
    </style>

    <linearGradient id="cardGrad1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#161820" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#0e1014" stop-opacity="0.98" />
    </linearGradient>

    <linearGradient id="cardGrad2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#181524" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#0f0c18" stop-opacity="0.98" />
    </linearGradient>

    <linearGradient id="cardGrad3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#111c18" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#0a1210" stop-opacity="0.98" />
    </linearGradient>

    <linearGradient id="busGrad1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#a855f7" stop-opacity="0.8" />
    </linearGradient>

    <linearGradient id="busGrad2" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a855f7" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.8" />
    </linearGradient>

    <filter id="cardShadow" x="-10" y="-5" width="460" height="600" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.6" />
    </filter>

    <filter id="boundaryGlow" x="-20" y="-20" width="940" height="620" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#10b981" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="${width}" height="${height}" rx="14" fill="#090a0f" />

  <!-- Subtle Blueprint Grid Pattern -->
  <g opacity="0.04" stroke="#ffffff" stroke-width="1">
    ${Array.from({ length: 30 }, (_, i) => `<line x1="${i * 64}" y1="0" x2="${i * 64}" y2="${height}" />`).join('')}
    ${Array.from({ length: 15 }, (_, i) => `<line x1="0" y1="${i * 54}" x2="${width}" y2="${i * 54}" />`).join('')}
  </g>

  <!-- Top View Header -->
  <g transform="translate(60, 42)">
    <rect x="0" y="0" width="130" height="24" rx="6" fill="#1e2230" stroke="#3b82f6" stroke-opacity="0.3" />
    <circle cx="12" cy="12" r="3.5" fill="#3b82f6" />
    <text x="24" y="16" class="t-badge" fill="#93c5fd">SYSTEM TOPOLOGY</text>

    <text x="0" y="58" class="t-title">Chrono High-Concurrency Architecture</text>
    <text x="0" y="82" class="t-sub">Zero-trust multi-tenant boundary, reactive client sync, and edge AI orchestration</text>
  </g>

  <!-- Security Perimeter: Tenant Isolation Boundary enclosing Database & Storage -->
  <g transform="translate(860, 150)" filter="url(#boundaryGlow)">
    <rect x="0" y="0" width="940" height="560" rx="14" fill="#0a1210" fill-opacity="0.5" stroke="#10b981" stroke-opacity="0.35" stroke-dasharray="6 6" stroke-width="1.5" />
    <!-- Tenant Shield Pill -->
    <rect x="24" y="-12" width="230" height="24" rx="12" fill="#064e3b" stroke="#10b981" stroke-opacity="0.6" />
    <circle cx="38" cy="0" r="3.5" fill="#34d399" />
    <text x="50" y="4" class="t-badge" fill="#6ee7b7">STRICT TENANT ISOLATION</text>
  </g>

  <!-- ========================================================================= -->
  <!-- CARD 1: CLIENT RUNTIME (x: 60, y: 170)                                    -->
  <!-- ========================================================================= -->
  <g transform="translate(60, 170)" filter="url(#cardShadow)">
    <rect width="360" height="520" rx="12" fill="url(#cardGrad1)" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1" />
    
    <!-- Header Row -->
    <rect x="20" y="20" width="38" height="38" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-opacity="0.3" />
    <g transform="translate(27, 27) scale(1)">
      ${layersSvg}
    </g>
    <text x="70" y="36" class="t-card-h">Client Runtime</text>
    <text x="70" y="52" class="t-card-sub">Next.js 15 &amp; React 19</text>

    <!-- Divider -->
    <line x1="20" y1="72" x2="340" y2="72" stroke="#ffffff" stroke-opacity="0.06" />

    <!-- Feature Items -->
    <g transform="translate(20, 96)">
      <circle cx="5" cy="5" r="2.5" fill="#60a5fa" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">App Router &amp; Server Actions</tspan></text>
      <text x="18" y="27" class="t-sub">Zero-API boilerplate with Zod validation</text>
    </g>

    <g transform="translate(20, 150)">
      <circle cx="5" cy="5" r="2.5" fill="#60a5fa" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Zustand Realtime Store</tspan></text>
      <text x="18" y="27" class="t-sub">Optimistic cache &amp; offline state engine</text>
    </g>

    <g transform="translate(20, 204)">
      <circle cx="5" cy="5" r="2.5" fill="#60a5fa" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Reicon Vector System</tspan></text>
      <text x="18" y="27" class="t-sub">2,600+ tree-shaken geometric icons</text>
    </g>

    <g transform="translate(20, 258)">
      <circle cx="5" cy="5" r="2.5" fill="#60a5fa" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Keyboard Navigation Hub</tspan></text>
      <text x="18" y="27" class="t-sub">Global Cmd+K palette and ticket shortcuts</text>
    </g>

    <g transform="translate(20, 312)">
      <circle cx="5" cy="5" r="2.5" fill="#60a5fa" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Productivity Modules</tspan></text>
      <text x="18" y="27" class="t-sub">Kanban, Eisenhower matrix &amp; Pomodoro</text>
    </g>

    <!-- Bottom Specs Pill -->
    <rect x="20" y="460" width="320" height="38" rx="8" fill="#131620" stroke="#3b82f6" stroke-opacity="0.2" />
    <text x="34" y="484" class="t-mono" fill="#93c5fd">HTTP/3 · TURBOPACK · REACT 19</text>
  </g>

  <!-- CONNECTOR 1: Client -> Edge -->
  <g transform="translate(420, 420)">
    <line x1="0" y1="0" x2="60" y2="0" stroke="url(#busGrad1)" stroke-width="2.5" stroke-dasharray="5 4" />
    <polygon points="60,-4 68,0 60,4" fill="#a855f7" />
    <rect x="4" y="-22" width="56" height="16" rx="4" fill="#161228" stroke="#a855f7" stroke-opacity="0.4" />
    <text x="9" y="-10" class="t-bus" fill="#d8b4fe">REST/RPC</text>
  </g>

  <!-- ========================================================================= -->
  <!-- CARD 2: EDGE INTELLIGENCE & MCP (x: 488, y: 170)                          -->
  <!-- ========================================================================= -->
  <g transform="translate(488, 170)" filter="url(#cardShadow)">
    <rect width="360" height="520" rx="12" fill="url(#cardGrad2)" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1" />
    
    <!-- Header Row -->
    <rect x="20" y="20" width="38" height="38" rx="8" fill="#2a1848" stroke="#8b5cf6" stroke-opacity="0.4" />
    <g transform="translate(27, 27) scale(1)">
      ${sparkleSvg}
    </g>
    <text x="70" y="36" class="t-card-h">Edge &amp; AI Gateway</text>
    <text x="70" y="52" class="t-card-sub">MCP Protocol &amp; Multi-LLM</text>

    <!-- Divider -->
    <line x1="20" y1="72" x2="340" y2="72" stroke="#ffffff" stroke-opacity="0.06" />

    <!-- Feature Items -->
    <g transform="translate(20, 96)">
      <circle cx="5" cy="5" r="2.5" fill="#c084fc" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Embedded MCP Server</tspan></text>
      <text x="18" y="27" class="t-sub">stdio JSON-RPC for Claude and Cursor</text>
    </g>

    <g transform="translate(20, 150)">
      <circle cx="5" cy="5" r="2.5" fill="#c084fc" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Multi-Provider LLM Gateway</tspan></text>
      <text x="18" y="27" class="t-sub">Gemini 2.5 Flash, Groq and OpenAI</text>
    </g>

    <g transform="translate(20, 204)">
      <circle cx="5" cy="5" r="2.5" fill="#c084fc" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Markdown Roadmap Parser</tspan></text>
      <text x="18" y="27" class="t-sub">Instant import of milestones and issues</text>
    </g>

    <g transform="translate(20, 258)">
      <circle cx="5" cy="5" r="2.5" fill="#c084fc" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Event Broadcast Hub</tspan></text>
      <text x="18" y="27" class="t-sub">Real-time state and member notifications</text>
    </g>

    <g transform="translate(20, 312)">
      <circle cx="5" cy="5" r="2.5" fill="#c084fc" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Multilingual Localization</tspan></text>
      <text x="18" y="27" class="t-sub">Native EN, IT, DE, FR and RU support</text>
    </g>

    <!-- Bottom Specs Pill -->
    <rect x="20" y="460" width="320" height="38" rx="8" fill="#1b1428" stroke="#8b5cf6" stroke-opacity="0.25" />
    <text x="34" y="484" class="t-mono" fill="#d8b4fe">STDIO · MODEL CONTEXT PROTOCOL</text>
  </g>

  <!-- CONNECTOR 2: Edge -> Database -->
  <g transform="translate(848, 420)">
    <line x1="0" y1="0" x2="48" y2="0" stroke="url(#busGrad2)" stroke-width="2.5" stroke-dasharray="5 4" />
    <polygon points="48,-4 56,0 48,4" fill="#10b981" />
    <rect x="4" y="-22" width="46" height="16" rx="4" fill="#0d1c16" stroke="#10b981" stroke-opacity="0.4" />
    <text x="8" y="-10" class="t-bus" fill="#6ee7b7">RLS/CDC</text>
  </g>

  <!-- ========================================================================= -->
  <!-- CARD 3: DATABASE & SECURITY (x: 912, y: 170)                              -->
  <!-- ========================================================================= -->
  <g transform="translate(912, 170)" filter="url(#cardShadow)">
    <rect width="410" height="520" rx="12" fill="url(#cardGrad3)" stroke="#10b981" stroke-opacity="0.3" stroke-width="1.5" />
    
    <!-- Header Row -->
    <rect x="20" y="20" width="38" height="38" rx="8" fill="#093828" stroke="#10b981" stroke-opacity="0.5" />
    <g transform="translate(27, 27) scale(1)">
      ${shieldSvg}
    </g>
    <text x="70" y="36" class="t-card-h">Database &amp; Access Mesh</text>
    <text x="70" y="52" class="t-card-sub">PostgreSQL 16 &amp; Supabase</text>

    <!-- Divider -->
    <line x1="20" y1="72" x2="390" y2="72" stroke="#ffffff" stroke-opacity="0.06" />

    <!-- Feature Items -->
    <g transform="translate(20, 96)">
      <circle cx="5" cy="5" r="2.5" fill="#34d399" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Multi-Tenant Row Level Security</tspan></text>
      <text x="18" y="27" class="t-sub">Zero data bleed across organizations</text>
    </g>

    <g transform="translate(20, 150)">
      <circle cx="5" cy="5" r="2.5" fill="#34d399" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Realtime WebSocket CDC</tspan></text>
      <text x="18" y="27" class="t-sub">Automatic state sync on issue &amp; project changes</text>
    </g>

    <g transform="translate(20, 204)">
      <circle cx="5" cy="5" r="2.5" fill="#34d399" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Invite-Only Access Boundary</tspan></text>
      <text x="18" y="27" class="t-sub">Strict authentication and cryptographic tokens</text>
    </g>

    <g transform="translate(20, 258)">
      <circle cx="5" cy="5" r="2.5" fill="#34d399" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">OAuth &amp; Email Providers</tspan></text>
      <text x="18" y="27" class="t-sub">GitHub, Google, Discord and Magic links</text>
    </g>

    <g transform="translate(20, 312)">
      <circle cx="5" cy="5" r="2.5" fill="#34d399" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Immutable Audit Trails</tspan></text>
      <text x="18" y="27" class="t-sub">Author timestamps and chronograms</text>
    </g>

    <!-- Bottom Specs Pill -->
    <rect x="20" y="460" width="370" height="38" rx="8" fill="#082218" stroke="#10b981" stroke-opacity="0.3" />
    <text x="34" y="484" class="t-mono" fill="#6ee7b7">POSTGRESQL 16 · RLS POLICIES · WAL CDC</text>
  </g>

  <!-- ========================================================================= -->
  <!-- CARD 4: STORAGE & MEDIA PIPELINE (x: 1358, y: 170)                        -->
  <!-- ========================================================================= -->
  <g transform="translate(1358, 170)" filter="url(#cardShadow)">
    <rect width="400" height="520" rx="12" fill="url(#cardGrad1)" stroke="#38bdf8" stroke-opacity="0.25" stroke-width="1" />
    
    <!-- Header Row -->
    <rect x="20" y="20" width="38" height="38" rx="8" fill="#0c2438" stroke="#38bdf8" stroke-opacity="0.4" />
    <g transform="translate(27, 27) scale(1)">
      ${serverSvg}
    </g>
    <text x="70" y="36" class="t-card-h">Storage &amp; Transport</text>
    <text x="70" y="52" class="t-card-sub">Cloudflare R2 &amp; SMTP Relay</text>

    <!-- Divider -->
    <line x1="20" y1="72" x2="380" y2="72" stroke="#ffffff" stroke-opacity="0.06" />

    <!-- Feature Items -->
    <g transform="translate(20, 96)">
      <circle cx="5" cy="5" r="2.5" fill="#38bdf8" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">S3 / Cloudflare R2 Buckets</tspan></text>
      <text x="18" y="27" class="t-sub">Encrypted avatars, covers and attachments</text>
    </g>

    <g transform="translate(20, 150)">
      <circle cx="5" cy="5" r="2.5" fill="#38bdf8" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Nodemailer + Resend SMTP</tspan></text>
      <text x="18" y="27" class="t-sub">Direct SSL transactional invitation emails</text>
    </g>

    <g transform="translate(20, 204)">
      <circle cx="5" cy="5" r="2.5" fill="#38bdf8" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Global Edge CDN Delivery</tspan></text>
      <text x="18" y="27" class="t-sub">Zero-latency image and asset streaming</text>
    </g>

    <g transform="translate(20, 258)">
      <circle cx="5" cy="5" r="2.5" fill="#38bdf8" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Automated Failover Circuit</tspan></text>
      <text x="18" y="27" class="t-sub">Graceful fallback for cloud storage and mail</text>
    </g>

    <g transform="translate(20, 312)">
      <circle cx="5" cy="5" r="2.5" fill="#38bdf8" />
      <text x="18" y="9" class="t-body"><tspan font-weight="600" fill="#ffffff">Data Recovery Mesh</tspan></text>
      <text x="18" y="27" class="t-sub">Signed password resets and audit exports</text>
    </g>

    <!-- Bottom Specs Pill -->
    <rect x="20" y="460" width="360" height="38" rx="8" fill="#081e28" stroke="#38bdf8" stroke-opacity="0.3" />
    <text x="34" y="484" class="t-mono" fill="#7dd3fc">CLOUDFLARE R2 · RESEND SSL · TLS 1.3</text>
  </g>
</svg>
`;

async function run() {
  const svgContent = buildArchitectureSvg(1860, 770);
  
  // 1. Save standalone vector SVG
  fs.writeFileSync('assets/architecture.svg', svgContent, 'utf-8');
  console.log('Saved assets/architecture.svg');

  // 2. Composite onto screenshots/home.png frame to create matching 2028x960 screenshot
  const homeMeta = await sharp('screenshots/home.png').metadata();
  console.log('Home screenshot size:', homeMeta.width, 'x', homeMeta.height);

  // We crop the top header (y: 0 to 110) and bottom footer (y: 885 to 960) from home.png
  // and insert the architecture diagram in the center (y: 110 to 885, x: 84 to 1944)
  const svgBuffer = Buffer.from(svgContent);
  const renderedSvg = await sharp(svgBuffer)
    .resize(1860, 770)
    .png()
    .toBuffer();

  const finalImage = await sharp('screenshots/home.png')
    .composite([
      {
        input: renderedSvg,
        left: 84,
        top: 112
      }
    ])
    .png({ quality: 95 })
    .toFile('screenshots/architecture.png');

  console.log('Saved screenshots/architecture.png successfully:', finalImage);
}

run().catch(console.error);
