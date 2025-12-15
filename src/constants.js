// constants placeholder
// Operatori che possono prendere ordini
export const OPERATORS = ["Ambra", "Salvo", "Ignazio", "Franco", "Alessandro", "Riccardo"];

// Operatori che possono lavorare ordini
export const WORKERS = ["Ambra", "Salvo", "Ignazio", "Franco", "Alessandro", "Riccardo"];

// Stati ordine
export const STATUS = [
  { key: "da_prendere", label: "Da prendere in carico", color: "red" },
  { key: "in_lavorazione", label: "In lavorazione", color: "yellow" },
  { key: "pronto", label: "Completato", color: "green" },
  { key: "consegnato", label: "Consegnato", color: "blue" }
];

// Permessi utente admin
export const ADMINS = ["riccardo"];
export const STATUS_COLORS = {
  da_prendere: "bg-red-500",
  in_lavorazione: "bg-yellow-500",
  pronto: "bg-green-500",
  consegnato: "bg-blue-500",
};
