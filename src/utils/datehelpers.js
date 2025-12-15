// date helpers placeholder
// Formattazione data in DD/MM/YYYY
export function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("it-IT");
}

export function formatDateTimeLocal(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("it-IT");
}

// Per ordinamento: estrai YYYY-MM
export function monthKeyFromISO(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  } catch {
    return null;
  }
}

// Nome mese IT
export function monthNameItalian(key) {
  const [y, m] = key.split("-");
  const mesi = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];
  return `${mesi[Number(m) - 1]} ${y}`;
}

// Ordinamento asc: consegne più vicine prima
export function sortByConsegnaAsc(arr) {
  return [...arr].sort((a, b) => {
    const da = a.consegna ? new Date(a.consegna) : new Date(8640000000000000);
    const db = b.consegna ? new Date(b.consegna) : new Date(8640000000000000);
    return da - db;
  });
}

// Ordinamento desc: consegne più recenti prima
export function sortByConsegnaDesc(arr) {
  return [...arr].sort((a, b) => {
    const da = a.consegna ? new Date(a.consegna) : new Date(0);
    const db = b.consegna ? new Date(b.consegna) : new Date(0);
    return db - da;
  });
}
