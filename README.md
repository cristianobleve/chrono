<p align="left">
  <img src="assets/header.svg" alt="Chrono" width="100%" />
</p>

Chrono è un software open source per il tracciamento delle issue, la pianificazione delle milestone e la gestione operativa dei team di sviluppo software. L'applicazione combina un'interfaccia ad alte prestazioni con sincronizzazione in tempo reale, supporto offline e isolamento dei dati a livello di workspace.

## Funzionalità principali

### Gestione issue e task
- Creazione e modifica rapida di task con identificatori alfanumerici progressivi
- Assegnazione priorità (urgent, high, medium, low, none) e stime numeriche
- Date di scadenza, promemoria e ricorrenze pianificate
- Supporto markdown completo per descrizioni e commenti
- Storico attività con tracciamento temporale di ogni mutazione

### Viste di lavoro e Kanban
- Tavola Kanban interattiva suddivisa per stati operativi (backlog, todo, in progress, done, canceled)
- Ordinamento manuale e filtri combinati per progetto, assegnatario ed etichette
- Modalità di visualizzazione compatta e densa per liste estese
- Navigazione rapida tramite drawer laterale senza perdita del contesto di navigazione

### Cronoprogramma e roadmap
- Gestione milestone collegate agli obiettivi di rilascio
- Calcolo automatico della percentuale di completamento in base alle issue risolte
- Visualizzazione tabellare e cronologica degli eventi di workspace
- Esportazione dei dati in formato tabellare per rendicontazione

### Matrice di priorità e focus
- Matrice Eisenhower a quattro quadranti per separare urgenza e importanza
- Coda di lavoro dedicata per task in scadenza e bloccanti
- Filtro rapido per issue assegnate all'utente attivo

### Strumenti di produttività personale
- Habit tracker settimanale per il consolidamento delle routine operative
- Pomodoro timer configurabile con associazione diretta all'issue in lavorazione
- Tracciamento visivo delle serie consecutive di completamento

### Architettura e interfaccia
- Command Palette globale accessibile da tastiera con la combinazione Cmd+K o Ctrl+K
- Supporto multilingua completo per 5 lingue (italiano, inglese, spagnolo, francese, tedesco)
- Modalità scura ad alto contrasto conforme alle specifiche del design system
- Monitoraggio della connettività con indicatori di stato e sincronizzazione dati

### Agente AI e importazione
- Assistente conversazionale per analisi del backlog e generazione bozze
- Supporto modelli Google Gemini, OpenAI e Groq
- Importazione diretta di strutture di progetto da file Markdown

---

## Architettura dati e multi-tenant

La piattaforma adotta un modello multi-tenant rigido basato su PostgreSQL e Supabase. Ogni workspace dispone di un perimetro isolato. L'accesso a team, progetti, issue e file allegati è regolato direttamente sul database tramite policy di Row Level Security (RLS). Nessun record può essere letto o mutato da utenti non appartenenti al workspace target.

---

## Requisiti di sistema

- Node.js versione 18.18 o superiore
- Gestore pacchetti npm oppure pnpm
- Istanza attiva di Supabase (cloud oppure locale via Supabase CLI)

---

## Installazione rapida

Clonare il repository in locale ed entrare nella cartella di progetto.

```bash
git clone https://github.com/cristianobleve/chrono.git
cd chrono
```

Installare i pacchetti necessari.

```bash
npm install
```

Configurare le variabili di ambiente creando il file `.env.local`.

```bash
cp .env.example .env.local
```

---

## Variabili di ambiente

Il file `.env.local` richiede i parametri di connessione e le chiavi dei servizi esterni.

| Variabile | Obbligatoria | Descrizione |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Sì | URL HTTPS del progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sì | Chiave pubblica anonima per le chiamate client Supabase |
| `SUPABASE_URL` | Sì | URL del backend Supabase per le route server |
| `SUPABASE_SECRET_KEY` | Sì | Chiave di servizio o segreto amministrativo per operazioni protette |
| `DATABASE_URL` | Opzionale | Stringa di connessione PostgreSQL diretta o fallback locale |
| `GEMINI_API_KEY` | Opzionale | Chiave API Google AI Studio per l'agente conversazionale |
| `OPENAI_API_KEY` | Opzionale | Chiave API OpenAI per modelli alternativi |
| `GROQ_API_KEY` | Opzionale | Chiave API Groq per inferenza rapida |
| `R2_BUCKET_NAME` | Opzionale | Nome del bucket S3 o Cloudflare R2 per file allegati |
| `R2_PUBLIC_DOMAIN` | Opzionale | Dominio pubblico per gli asset caricati su storage |

---

## Configurazione di Supabase

### 1. Creazione del database e tabelle

Le definizioni dello schema e le regole di sicurezza sono organizzate nella cartella `supabase/migrations/`.

Per applicare le migrazioni tramite Supabase CLI eseguire il comando seguente.

```bash
npx supabase db push
```

In alternativa è possibile aprire l'editor SQL nella dashboard di Supabase ed eseguire in sequenza i file delle migrazioni.
- `20260831000000_init_chrono.sql` (schema relazionale di base, tabelle e viste)
- `20260922000000_performance_indexes.sql` (indici di query per altezza e ordinamento)
- `20260923000000_security_rls.sql` (funzioni di controllo accesso e policy Row Level Security)
- `20260923010000_workspace_invitations.sql` (gestione inviti ai workspace)
- `20260923020000_workspace_invitations_accepted_by.sql` (tracciamento accettazione inviti)
- `20260923030000_workspace_notifications.sql` (notifiche e avvisi interni)
- `20260923040000_workspace_notifications_alter.sql` (ottimizzazioni per il feed notifiche)

### 2. Configurazione autenticazione (Auth)

1. Nel pannello di controllo di Supabase accedere alla sezione **Authentication > Providers**.
2. Abilitare il provider **Email** (abilitare o disabilitare la conferma email a seconda delle esigenze di sviluppo).
3. Nella sezione **Authentication > URL Configuration** effettuare le impostazioni seguenti.
   - Impostare **Site URL** con l'indirizzo dell'applicazione (es. `http://localhost:3000` in locale o il dominio di produzione).
   - Aggiungere ai **Redirect URLs** gli endpoint di ritorno per l'autenticazione.
     - `http://localhost:3000/**`
     - `https://tuodominio.com/**`
4. Se si desidera abilitare OAuth con GitHub o Google, inserire i rispettivi Client ID e Client Secret nelle schede fornitore dedicate.

---

## Avvio del progetto

Avviare il server locale di sviluppo.

```bash
npm run dev
```

L'applicazione sarà raggiungibile su `http://localhost:3000`.

---

## Script disponibili

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Avvia Next.js in modalità sviluppo con hot reload |
| `npm run build` | Compila l'applicazione per la produzione con verifica tipi TypeScript |
| `npm run start` | Avvia il server di produzione Next.js compilato |
| `npm run lint` | Esegue il controllo statico del codice con ESLint |

---

## Licenza

Distribuito sotto licenza MIT.
