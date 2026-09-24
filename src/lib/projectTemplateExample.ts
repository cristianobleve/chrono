export const sampleProjectMarkdown = `# Cloud Infrastructure & Database Migration

> Migrazione completa dell'architettura dati su Supabase PostgreSQL e storage distribuito S3/R2.

## Metadata
- **Status**: In Progress
- **Priority**: High
- **Target Date**: 2026-11-30
- **Lead**: Cristiano Bleve

## Description
Questo progetto ha l'obiettivo di modernizzare l'intera pipeline di persistenza dati del workspace.
Include la creazione dello schema relazionale su PostgreSQL, l'abilitazione di Row Level Security (RLS) per la multi-tenancy e l'ottimizzazione degli indici composti per garantire latenze sotto i 10ms.

## Milestones
- [x] Milestone 1: Configurazione Progetto Supabase & Client SDK (Target: 2026-09-15)
- [ ] Milestone 2: Migrazione Tabelle e Script di Seed Relazionale (Target: 2026-10-15)
- [ ] Milestone 3: Benchmark Prestazioni & Rilascio in Produzione (Target: 2026-11-30)

## Issues
### Setup Client Supabase e Variabili d'Ambiente
- **Status**: Done
- **Priority**: Urgent
- **Estimate**: 2
- **Labels**: Backend, Security
Installare @supabase/supabase-js, impostare NEXT_PUBLIC_SUPABASE_URL e chiavi segrete nel file .env.local.

### Definizione Policy RLS per Multi-Tenancy e Isolamento
- **Status**: In Progress
- **Priority**: High
- **Estimate**: 5
- **Labels**: Security, PostgreSQL
Implementare le policy create policy "Workspace isolation" su tutte le tabelle basate su team_id e auth.uid().

### Ottimizzazione Indici Compositi per Latenza Query
- **Status**: Todo
- **Priority**: Medium
- **Estimate**: 3
- **Labels**: Database, Performance
Creare indici su issues e projects per velocizzare il caricamento della Kanban board.
`;

export const sampleBulkProjectsMarkdown = `# Cloud Infrastructure & Database Migration

> Migrazione completa dell'architettura dati su Supabase PostgreSQL e storage distribuito S3/R2.

## Metadata
- **Status**: In Progress
- **Priority**: High
- **Target Date**: 2026-11-30

## Description
Modernizzare l'intera pipeline di persistenza dati del workspace con indici e RLS multi-tenant.

## Milestones
- [x] Fase 1: Configurazione Supabase & Schema Relazionale (Target: 2026-09-15)
- [ ] Fase 2: Script di migrazione e benchmark latenza (Target: 2026-10-30)

## Issues
### Setup Client Supabase SDK e Connection Pooling
- **Status**: Done
- **Priority**: Urgent
- **Estimate**: 3
- **Labels**: Database, Infra
Configurazione di Supabase connection pooling per query concorrenti ad alta frequenza.

### Implementazione Row Level Security (RLS)
- **Status**: In Progress
- **Priority**: High
- **Estimate**: 5
- **Labels**: Security
Isolamento rigido dei dati per singolo workspace.

__sep

# AI Autonomous Agent & Neural Router

> Sistema integrato multi-modello per esecuzione autonoma di azioni, sintesi e pianificazione sprint.

## Metadata
- **Status**: Planned
- **Priority**: Urgent
- **Target Date**: 2026-12-15

## Description
Integrazione di modelli linguistici di frontiera (Gemini 2.5, Claude 3.7, DeepSeek R1, GPT-4o, Ollama locale) per orchestrare task e aggiornare lo stato dei progetti direttamente dalla chat.

## Milestones
- [ ] Milestone 1: Architettura Function Calling & Action Tags (Target: 2026-10-10)
- [ ] Milestone 2: Supporto Container Docker & Local LLM (Target: 2026-11-20)
- [ ] Milestone 3: Testing End-to-End & Voice Input (Target: 2026-12-15)

## Issues
### Parser Azioni di Massa e Aggiornamenti con Esclusione
- **Status**: In Progress
- **Priority**: High
- **Estimate**: 5
- **Labels**: AI, Core
Supporto per comandi naturali di massa e filtri di esclusione ("tutti tranne X").

### Multi-Provider API Key Hub & Custom Endpoints
- **Status**: Todo
- **Priority**: Medium
- **Estimate**: 3
- **Labels**: AI, Settings
Configurazione di token e endpoint Docker personalizzati (Ollama, vLLM).

__sep

# Design System Superquadrato & Dark Craft UI

> Refactoring completo dell'interfaccia con curve di Lamé, logo Chrono e font tipografico Söhne.

## Metadata
- **Status**: Completed
- **Priority**: Medium
- **Target Date**: 2026-09-30

## Description
Creazione del design system Chrono ad altissima precisione con angoli superquadrati continui, palette colori oled dark e tipografia Söhne Breit per i titoli.

## Milestones
- [x] Fase 1: Implementazione motore Superquadrato CSS (Target: 2026-08-30)
- [x] Fase 2: Integrazione Logo Vettoriale Chrono & Webfont Söhne (Target: 2026-08-31)

## Issues
### Integrazione Webfont Klim Söhne e Söhne Breit
- **Status**: Done
- **Priority**: High
- **Estimate**: 2
- **Labels**: Design, Typography
Setup di @font-face per i pesi Buch, Kräftig, Halbfett, Dreiviertelfett e Breit per titoli.

### Standardizzazione Badge ID e Micro-animazioni
- **Status**: Done
- **Priority**: Medium
- **Estimate**: 3
- **Labels**: UI, UX
Adozione del nuovo componente InternalIdBadge con copia istantanea e notifica Toast.
`;
