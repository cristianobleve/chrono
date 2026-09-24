/**
 * Cron Job Utility for Chrono Platform
 * Translates between visual schedule parameters, standard 5-part cron syntax (* * * * *),
 * and human-readable natural language in Italian.
 */

export interface CronPreset {
  id: string;
  label: string;
  description: string;
  cron: string;
}

export const CRON_PRESETS: CronPreset[] = [
  {
    id: "hourly",
    label: "Ogni ora",
    description: "Al minuto 0 di ogni ora",
    cron: "0 * * * *",
  },
  {
    id: "daily_morning",
    label: "Ogni giorno alle 09:00",
    description: "Dal lunedì alla domenica all'inizio giornata",
    cron: "0 9 * * *",
  },
  {
    id: "weekdays_morning",
    label: "Giorni lavorativi alle 09:00",
    description: "Da lunedì a venerdì alle 09:00",
    cron: "0 9 * * 1-5",
  },
  {
    id: "weekly_monday",
    label: "Ogni Lunedì alle 09:00",
    description: "All'apertura della settimana lavorativa",
    cron: "0 9 * * 1",
  },
  {
    id: "biweekly_1_15",
    label: "Bimensile (1° e 15°)",
    description: "Il primo e il quindicesimo giorno del mese alle 10:00",
    cron: "0 10 1,15 * *",
  },
  {
    id: "monthly_first",
    label: "Ogni mese (1° giorno)",
    description: "Il primo giorno di ogni mese alle 09:00",
    cron: "0 9 1 * *",
  },
  {
    id: "weekly_friday_wrap",
    label: "Venerdì Sprint Wrap (17:00)",
    description: "Ogni venerdì pomeriggio per retrospettiva o chiusura",
    cron: "0 17 * * 5",
  },
];

const WEEKDAY_NAMES = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
];

const MONTH_NAMES = [
  "",
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

/**
 * Validates a standard 5-part cron expression:
 * [minute: 0-59] [hour: 0-23] [day of month: 1-31] [month: 1-12] [day of week: 0-6 or 1-7]
 */
export function isValidCron(cron: string): boolean {
  if (!cron || typeof cron !== "string") return false;
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return false;

  // Basic regex check for valid characters in cron fields
  const fieldRegex = /^(\*|[0-9,\-\/]+)$/;
  return parts.every((p) => fieldRegex.test(p));
}

/**
 * Translates a 5-part cron expression into natural Italian
 */
export function describeCron(cron: string): string {
  if (!cron || !isValidCron(cron)) return "Espressione cron non valida";

  const parts = cron.trim().split(/\s+/);
  const [minute, hour, dom, month, dow] = parts;

  // Check against known presets first
  const match = CRON_PRESETS.find((p) => p.cron === cron.trim());
  if (match) return match.label;

  let timeDesc = "";
  if (minute === "*" && hour === "*") {
    timeDesc = "ogni minuto";
  } else if (minute.startsWith("*/") && hour === "*") {
    timeDesc = `ogni ${minute.replace("*/", "")} minuti`;
  } else if (minute === "0" && hour === "*") {
    timeDesc = "all'inizio di ogni ora";
  } else if (minute.startsWith("*/") && hour !== "*") {
    timeDesc = `ogni ${minute.replace("*/", "")} min alle ore ${hour}`;
  } else {
    const formattedMin = minute.padStart(2, "0");
    const formattedHour = hour === "*" ? "ogni ora" : hour.padStart(2, "0");
    timeDesc = hour === "*" ? `al minuto ${formattedMin}` : `alle ${formattedHour}:${formattedMin}`;
  }

  let daysDesc = "";
  if (dow === "*" && dom === "*") {
    daysDesc = "di ogni giorno";
  } else if (dow === "1-5") {
    daysDesc = "nei giorni feriali (Lun-Ven)";
  } else if (dow === "0,6" || dow === "6,0") {
    daysDesc = "nel weekend (Sab-Dom)";
  } else if (dow !== "*") {
    const dayIndices = dow.split(",").map((d) => parseInt(d.trim(), 10));
    const namedDays = dayIndices
      .filter((d) => !isNaN(d) && d >= 0 && d <= 6)
      .map((d) => WEEKDAY_NAMES[d]);
    daysDesc = namedDays.length > 0 ? `ogni ${namedDays.join(", ")}` : `nei giorni (${dow})`;
  }

  if (dom !== "*") {
    daysDesc += ` il giorno ${dom} del mese`;
  }

  let monthDesc = "";
  if (month !== "*") {
    const mIdx = parseInt(month, 10);
    monthDesc = ` in ${MONTH_NAMES[mIdx] || `mese ${month}`}`;
  }

  return `Eseguito ${timeDesc} ${daysDesc}${monthDesc}`.replace(/\s+/g, " ").trim();
}

/**
 * Calculates an approximate next run Date for preview
 */
export function getNextCronRun(cron: string): Date | null {
  if (!isValidCron(cron)) return null;
  const parts = cron.trim().split(/\s+/);
  const [minPart, hourPart, domPart, , dowPart] = parts;

  const now = new Date();
  const next = new Date(now.getTime() + 60000); // start at next minute

  const targetMin = minPart === "*" ? next.getMinutes() : minPart.includes("/") ? Math.ceil(next.getMinutes() / parseInt(minPart.split("/")[1], 10)) * parseInt(minPart.split("/")[1], 10) : parseInt(minPart, 10);
  const targetHour = hourPart === "*" ? next.getHours() : parseInt(hourPart, 10);

  if (!isNaN(targetMin) && !isNaN(targetHour)) {
    next.setHours(targetHour, targetMin, 0, 0);
    if (next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }
  }

  // Handle specific day of week if specified
  if (dowPart !== "*" && !dowPart.includes("-") && !dowPart.includes(",")) {
    const targetDow = parseInt(dowPart, 10);
    if (!isNaN(targetDow)) {
      while (next.getDay() !== targetDow) {
        next.setDate(next.getDate() + 1);
      }
    }
  }

  return next;
}
