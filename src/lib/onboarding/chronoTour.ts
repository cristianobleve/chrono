import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import "@/styles/driver-theme.css";

const TOUR_STORAGE_KEY = "chrono_tour_completed_v2";

export function isTourCompleted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
}

export function resetTourStatus(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOUR_STORAGE_KEY);
}

export function startChronoTour(options?: { force?: boolean }): void {
  if (typeof window === "undefined") return;

  if (!options?.force && isTourCompleted()) {
    return;
  }

  const steps: DriveStep[] = [
    {
      element: '[data-tour="workspace-switcher"]',
      popover: {
        title: "Area di Lavoro",
        description: "Passa da un workspace all'altro o creane di nuovi con logo, tema e preferenze su misura.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: '[data-tour="main-nav"]',
      popover: {
        title: "Navigazione Principale",
        description: "Accedi rapidamente a Progetti, Issue Tracker, Cronologia temporale e Viste salvate.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour="search-command"]',
      popover: {
        title: "Command Palette & Ricerca",
        description: "Premi Cmd+K o Ctrl+K per cercare issue, navigare tra i progetti o eseguire comandi veloci senza mouse.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: '[data-tour="new-issue-btn"]',
      popover: {
        title: "Creazione Rapida",
        description: "Crea una nuova issue all'istante cliccando questo pulsante o premendo il tasto C da tastiera.",
        side: "bottom",
        align: "end",
      },
    },
  ];

  // Filtra solo gli step i cui elementi target sono presenti nel DOM attuale
  const validSteps = steps.filter((step) => {
    if (!step.element || typeof step.element !== "string") return true;
    return Boolean(document.querySelector(step.element));
  });

  if (validSteps.length === 0) return;

  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: "rgba(0, 0, 0, 0.75)",
    popoverClass: "chrono-driver-popover",
    nextBtnText: "Avanti",
    prevBtnText: "Indietro",
    doneBtnText: "Inizia",
    progressText: "{{current}} di {{total}}",
    onDestroyed: () => {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    },
    steps: validSteps,
  });

  driverObj.drive();
}
