<p align="left">
  <img src="assets/header.svg" alt="Chrono" width="100%" />
</p>

<p align="left">
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Gemini_AI-8E75FF?style=flat&logo=googlegemini&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/License-MIT-gray?style=flat" alt="MIT License" />
</p>

Chrono is an open source issue tracking and project management platform built for software engineering teams. The application integrates high performance client side interactions with real time data synchronization, offline resilience, and strict workspace level data isolation.

<p align="left">
  <img src="assets/app-preview.svg" alt="Chrono Interface Preview" width="100%" />
</p>

## <img src="assets/icons/shield.svg" width="20" height="20" align="absmiddle" /> Engineering Origin and Security Verification

Portions of this codebase were generated with generative artificial intelligence assistance during rapid prototyping phases. Every module, database schema, API route, and client state machine was subsequently reviewed, refactored, and audited by human engineers. All PostgreSQL tables are guarded by strict Row Level Security policies, inputs are validated with Zod schemas, and TypeScript runs in strict mode across the entire codebase to prevent regressions and unauthorized data access.

## Core Capabilities

### <img src="assets/icons/layers.svg" width="18" height="18" align="absmiddle" /> Issue Tracking and Workflow Management
Chrono provides structured task tracking with sequential alphanumeric identifiers for every recorded item. Each issue supports explicit priority rankings, numeric estimates, planned due dates, recurring schedules, and Markdown formatting for descriptions and comments. A persistent activity log records every modification, status shift, and property update with author timestamps.

### <img src="assets/icons/kanban.svg" width="18" height="18" align="absmiddle" /> Kanban Board and Workspace Views
The interactive Kanban surface organizes work into explicit lifecycle columns covering backlog, todo, in progress, done, and canceled states. Teams can reorder items by priority or manual position, filter by project, assignee, or label, and inspect full task details in a slide out drawer without navigating away from the active board.

### <img src="assets/icons/milestone.svg" width="18" height="18" align="absmiddle" /> Project Milestones and Roadmaps
Long term initiatives are structured through projects and associated milestones with target dates. Chrono automatically computes completion rates based on resolved issues, displays project progression across both timeline and tabular formats, and allows teams to review historical delivery logs.

### <img src="assets/icons/target.svg" width="18" height="18" align="absmiddle" /> Priority Matrix and Focus Queues
To manage daily work queues, Chrono implements a four quadrant Eisenhower matrix that separates urgent tasks from important objectives. Dedicated focus views aggregate overdue deadlines, high priority assignments, and items linked to the current signed in member.

### <img src="assets/icons/clock.svg" width="18" height="18" align="absmiddle" /> Personal Productivity Routines
A built in habit tracker allows developers to maintain recurring weekly development routines and track completion streaks over time. In addition, an integrated Pomodoro timer enables timed focus blocks linked directly to active issues, keeping track of completed sessions throughout the workday.

### <img src="assets/icons/command.svg" width="18" height="18" align="absmiddle" /> Global Command Palette and Design System
Navigation across the entire application is keyboard driven via a global command palette triggered by the Cmd+K or Ctrl+K shortcut. The user interface adheres to a high contrast dark aesthetic, featuring responsive layout structures, zero layout shift, and network status monitoring with automatic reconnection handling.

### <img src="assets/icons/globe.svg" width="18" height="18" align="absmiddle" /> Multilingual Support
Chrono includes full localization across five languages including English, Italian, German, French, and Russian. Interface labels, date formatting, and system messages adjust according to user preferences stored per account.

### <img src="assets/icons/bot.svg" width="18" height="18" align="absmiddle" /> Conversational Agent and Markdown Exchange
An embedded assistant connects to Google Gemini, OpenAI, or Groq models to analyze backlogs, draft implementation plans, and extract project structures. Teams can also import or export entire projects using structured Markdown files containing metadata, milestones, and issues.

## <img src="assets/icons/database.svg" width="20" height="20" align="absmiddle" /> Multi-Tenant Data Architecture

Data security relies on PostgreSQL Row Level Security on Supabase. Each workspace functions as an isolated tenancy boundary. Workspace memberships, projects, issues, comments, notifications, and uploaded files are verified directly inside the database query engine. No user can read, create, or alter records outside their assigned workspace memberships.

<p align="left">
  <img src="assets/architecture.svg" alt="Chrono System Architecture" width="100%" />
</p>

## <img src="assets/icons/cpu.svg" width="20" height="20" align="absmiddle" /> System Requirements

Running Chrono requires Node.js version 18.18 or higher, npm or pnpm package manager, and an active Supabase project instance either on Supabase Cloud or locally through the Supabase CLI.

## <img src="assets/icons/terminal.svg" width="20" height="20" align="absmiddle" /> Installation and Local Setup

First clone the git repository to your local workstation and change into the directory.

```bash
git clone https://github.com/cristianobleve/chrono.git
cd chrono
```

Install the project dependencies using npm.

```bash
npm install
```

Create a local environment file by copying the provided example template.

```bash
cp .env.example .env.local
```

## <img src="assets/icons/sliders.svg" width="20" height="20" align="absmiddle" /> Environment Variables

The application reads external connection parameters and API credentials from the `.env.local` file.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | HTTPS endpoint of the Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anonymous public key for client side Supabase requests |
| `SUPABASE_URL` | Yes | Supabase endpoint used by server side route handlers |
| `SUPABASE_SECRET_KEY` | Yes | Administrative service key for privileged backend operations |
| `DATABASE_URL` | Optional | Direct PostgreSQL connection string or local fallback |
| `GEMINI_API_KEY` | Optional | Google AI Studio API key used by the workspace agent |
| `OPENAI_API_KEY` | Optional | OpenAI API key for alternative LLM providers |
| `GROQ_API_KEY` | Optional | Groq API key for low latency model inference |
| `R2_BUCKET_NAME` | Optional | S3 or Cloudflare R2 bucket name for file attachments |
| `R2_PUBLIC_DOMAIN` | Optional | Public CDN domain for uploaded media assets |

## <img src="assets/icons/server.svg" width="20" height="20" align="absmiddle" /> Supabase Configuration

### Database Schema and Migrations
Database tables, indexes, and security functions are located in the `supabase/migrations/` directory.

To apply all migrations automatically using the Supabase CLI, run the database push command.

```bash
npx supabase db push
```

If you prefer applying migrations manually through the Supabase web dashboard SQL Editor, execute the migration files in ascending chronological order starting with the base schema, followed by performance indexes, Row Level Security rules, workspace invitation tables, and notification schemas.

### Authentication Setup
Open the Supabase dashboard and navigate to the Authentication provider settings. Enable the Email provider according to your team requirements. Under Authentication URL Configuration, define your primary application URL in the Site URL field, such as `http://localhost:3000` for local development. Add valid wildcards to the Redirect URLs list, including `http://localhost:3000/**` and your custom production domain. If third party OAuth login through GitHub or Google is desired, provide the corresponding Client ID and Client Secret in their respective provider tabs.

## <img src="assets/icons/code.svg" width="20" height="20" align="absmiddle" /> Development and Build Scripts

The repository provides standard npm scripts for development, testing, and production builds.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Starts the Next.js local development server with fast refresh |
| `npm run build` | Compiles the production application and runs TypeScript type checking |
| `npm run start` | Boots the compiled Next.js production server |
| `npm run lint` | Runs static analysis checks using ESLint |

## <img src="assets/icons/book.svg" width="20" height="20" align="absmiddle" /> License

Chrono is released under the MIT License.
