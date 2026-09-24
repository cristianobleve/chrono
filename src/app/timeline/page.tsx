import { Metadata } from "next";
import { TimelineView } from "@/components/timeline/TimelineView";

export const metadata: Metadata = {
  title: "Cronoprogramma & Timeline Storica | Chrono",
  description: "Visualizzazione cronologica e audit log di tutte le modifiche, creazioni e avanzamenti di progetti e issue.",
};

export default function TimelinePage() {
  return <TimelineView />;
}
