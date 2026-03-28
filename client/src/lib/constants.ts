export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  wishlist: { label: "À postuler", color: "bg-gray-500" },
  applied: { label: "Postulée", color: "bg-blue-500" },
  followup: { label: "Relancée", color: "bg-yellow-500" },
  interview: { label: "Entretien", color: "bg-purple-500" },
  offer: { label: "Offre reçue", color: "bg-green-500" },
  accepted: { label: "Acceptée", color: "bg-green-700" },
  rejected: { label: "Refusée", color: "bg-red-500" },
  ghosted: { label: "Sans réponse", color: "bg-red-300" },
};

export const URGENCY_COLORS: Record<string, { border: string; bg: string; cssColor: string }> = {
  red:        { border: "border-l-red-500",    bg: "bg-red-500/5",    cssColor: "#ef4444" },
  darkOrange: { border: "border-l-orange-600", bg: "bg-orange-500/5", cssColor: "#ea580c" },
  orange:     { border: "border-l-orange-400", bg: "bg-orange-400/5", cssColor: "#fb923c" },
  yellow:     { border: "border-l-yellow-400", bg: "bg-yellow-400/5", cssColor: "#facc15" },
  neutral:    { border: "border-l-slate-300 dark:border-l-slate-600", bg: "", cssColor: "#94a3b8" },
  none:       { border: "border-l-slate-200 dark:border-l-slate-700", bg: "", cssColor: "#64748b" },
};

export const TABS = [
  { value: "active", label: "En cours", statuses: ["applied", "followup", "interview", "offer"] },
  { value: "wishlist", label: "À postuler", statuses: ["wishlist"] },
  { value: "archived", label: "Archivées", statuses: ["accepted", "rejected", "ghosted"] },
] as const;

export const SOURCES = [
  "LinkedIn",
  "Indeed",
  "HelloWork",
  "WelcomeToTheJungle",
  "Direct",
  "Cooptation",
  "Salon",
  "Autre",
] as const;

export const CONTRACT_TYPES = ["CDI", "CDD", "Freelance", "Stage", "Alternance"] as const;

export const TIMELINE_TYPES: Record<string, string> = {
  applied: "Candidature envoyée",
  followup: "Relance",
  phone_screen: "Appel téléphonique",
  interview_hr: "Entretien RH",
  interview_tech: "Entretien technique",
  test: "Test technique",
  offer: "Offre reçue",
  rejected: "Refus",
  ghosted: "Sans réponse",
};

export const FOLLOWUP_PRESETS = [
  { label: "4 jours", days: 4 },
  { label: "1 semaine", days: 7 },
  { label: "10 jours", days: 10 },
] as const;

export function getFollowupLabel(daysUntil: number | null | undefined): string {
  if (daysUntil === null || daysUntil === undefined) return "";
  if (daysUntil < -1) return `Dépassée de ${Math.abs(daysUntil)} jours`;
  if (daysUntil === -1) return "Dépassée d'hier";
  if (daysUntil === 0) return "Aujourd'hui";
  if (daysUntil === 1) return "Demain";
  return `Dans ${daysUntil} jours`;
}
