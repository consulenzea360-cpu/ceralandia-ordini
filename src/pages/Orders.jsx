import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import OrderList from "../components/OrderList";
import OrderForm from "../components/OrderForm";
import OrderView from "../components/OrderView";

import { fetchOrders, insertOrder, updateOrder, deleteOrder } from "../utils/supabase";
import Footer from "../components/Footer";

/** ===== CSV helpers (robusti, con virgolette) ===== */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (c === "\r") {
        // ignore
      } else {
        field += c;
      }
    }
  }

  // last field
  row.push(field);
  rows.push(row);

  // rimuovi righe vuote
  return rows.filter((r) => r.some((x) => String(x || "").trim() !== ""));
}

function toCSVCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function downloadCSV(csvText, filename) {
  const bom = "\uFEFF"; // Excel-friendly UTF-8
  const blob = new Blob([bom + csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Serializzazione CSV “fedele” per reimport */
function ordersToCSV(orders) {
  const headers = [
    "id",
    "cliente",
    "telefono",
    "operatore",
    "lavoratore",
    "stato",
    "consegna_iso",
    "prodotti_json"
  ];

  const lines = [headers.map(toCSVCell).join(",")];

  for (const o of orders) {
    lines.push(
      [
        o.id ?? "",
        o.cliente ?? "",
        o.telefono ?? "",
        o.operatore ?? "",
        o.lavoratore ?? "",
        o.stato ?? "",
        o.consegna ? new Date(o.consegna).toISOString() : "",
        JSON.stringify(o.prodotti ?? [])
      ].map(toCSVCell).join(",")
    );
  }

  return lines.join("\n");
}

function csvToOrders(csvText) {
  const rows = parseCSV(csvText);
  if (!rows.length) return [];

  const header = rows[0].map((h) => String(h).trim());
  const idx = (name) => header.indexOf(name);

  const iCliente = idx("cliente");
  const iTelefono = idx("telefono");
  const iOperatore = idx("operatore");
  const iLavoratore = idx("lavoratore");
  const iStato = idx("stato");
  const iConsegna = idx("consegna_iso");
  const iProdotti = idx("prodotti_json");

  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];

    const prodottiRaw = iProdotti >= 0 ? row[iProdotti] : "[]";
    let prodotti = [];
    try {
      prodotti = prodottiRaw ? JSON.parse(prodottiRaw) : [];
    } catch {
      prodotti = [];
    }

    const consegnaIso = iConsegna >= 0 ? row[iConsegna] : "";
    const consegna = consegnaIso ? new Date(consegnaIso).toISOString() : null;

    out.push({
      cliente: iCliente >= 0 ? row[iCliente] : "",
      telefono: iTelefono >= 0 ? row[iTelefono] : "",
      operatore: iOperatore >= 0 ? row[iOperatore] : "",
      lavoratore: iLavoratore >= 0 ? row[iLavoratore] : "",
      stato: iStato >= 0 ? row[iStato] : "da_prendere",
      consegna,
      prodotti
    });
  }

  return out;
}

export default function Orders({ user, onLogout }) {
  const isAdmin = user?.role === "admin";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState("list"); // list | form | view
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  // ✅ search persistente
  const [search, setSearch] = useState("");

  // ✅ scroll persistente
  const lastScrollYRef = useRef(0);

  // ✅ file input import (nascosto)
  const importInputRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchOrders({ deliveredFlag: false });
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openInsert() {
    setEditing({
      cliente: "",
      telefono: "",
      operatore: user?.username,
      lavoratore: user?.username,
      prodotti: [],
      stato: "da_prendere",
      consegna: null
    });
    setView("form");
  }

  async function handleSave(order) {
    setLoading(true);
    try {
      if (order.id) await updateOrder(order);
      else await insertOrder(order);

      await load();
      setView("list");
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert("Errore durante il salvataggio.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(order) {
    if (!isAdmin && order.stato === "consegnato") {
      alert("Non puoi modificare un ordine consegnato.");
      return;
    }

    lastScrollYRef.current = window.scrollY;
    setEditing(order);
    setView("form");
  }

  function handleView(order) {
    lastScrollYRef.current = window.scrollY;
    setViewing(order);
    setView("view");
  }

  function restoreScrollAfterListRender() {
    requestAnimationFrame(() => {
      window.scrollTo({ top: lastScrollYRef.current, behavior: "auto" });
    });
  }

  function handleCloseView() {
    setView("list");
    setViewing(null);
    restoreScrollAfterListRender();
  }

  function handleCancelForm() {
    setView("list");
    setEditing(null);
    restoreScrollAfterListRender();
  }

  async function handleDelete(id) {
    if (!isAdmin) return alert("Solo l'admin può eliminare gli ordini.");
    if (!window.confirm("Sei sicuro di voler eliminare questo ordine?")) return;

    try {
      await deleteOrder(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Errore durante l'eliminazione.");
    }
  }

  /** ===== EXPORT / IMPORT (solo admin) ===== */
  async function handleExportCSV() {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const all = await fetchOrders({ deliveredFlag: false }); // prende tutto dal DB
      const csv = ordersToCSV(all);

      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      downloadCSV(csv, `ordini-in-lavorazione_${yyyy}-${mm}-${dd}.csv`);
    } catch (e) {
      console.error(e);
      alert("Errore export CSV.");
    } finally {
      setLoading(false);
    }
  }

  function handleImportClick() {
    if (!isAdmin) return;
    importInputRef.current?.click();
  }

 async function handleImportFile(e) {
  if (!isAdmin) return;

  const file = e.target.files?.[0];
  e.target.value = ""; // permette reimport dello stesso file
  if (!file) return;

  setLoading(true);
  try {
    const text = await file.text();
    const importedOrders = csvToOrders(text);

    const count = importedOrders.length;

    if (!count) {
      alert("Il CSV sembra vuoto oppure non contiene ordini importabili.");
      return;
    }

    const ok = window.confirm(
      `Stai per importare ${count} ordini in lavorazione.\n\n` +
      `ATTENZIONE: questa operazione sovrascrive gli ordini in lavorazione (cancella quelli attuali e importa quelli del CSV).\n\n` +
      `Continuare?`
    );
    if (!ok) return;

    // 1) prendi tutti gli ordini attuali di questa scheda
    const current = await fetchOrders({ deliveredFlag: false });

    // 2) elimina tutti
    await Promise.all(current.map((o) => deleteOrder(o.id)));

    // 3) inserisci tutti dal CSV
    for (const o of importedOrders) {
      await insertOrder(o);
    }

    await load();
    alert("Import CSV completato.");
  } catch (err) {
    console.error(err);
    alert("Errore import CSV. Controlla che il file sia un export del sistema.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="main-content">
      <div>
        <Navbar onLogout={onLogout} />

        <div className="container-max mx-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Ordini in lavorazione</h2>

            <button
              onClick={openInsert}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Inserisci ordine
            </button>
          </div>

          {loading && <div className="mb-3 text-gray-500">Caricamento...</div>}

          {view === "list" && (
            <>
              <OrderList
                orders={orders}
                search={search}
                setSearch={setSearch}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                isAdmin={isAdmin}
                onChangeStatus={async (id, stato) => {
                  const ord = orders.find((o) => o.id === id);
                  if (!ord) return;

                  await updateOrder({ ...ord, stato });
                  await load();
                }}
              />

              {/* ✅ link export/import sotto la scheda (solo admin) */}
              {isAdmin && (
                <div className="mt-4 flex gap-4 text-sm">
                  <button
                    type="button"
                    className="underline text-gray-700 hover:text-gray-900"
                    onClick={handleExportCSV}
                  >
                    Esporta CSV
                  </button>

                  <button
                    type="button"
                    className="underline text-gray-700 hover:text-gray-900"
                    onClick={handleImportClick}
                  >
                    Importa CSV
                  </button>

                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </div>
              )}
            </>
          )}

          {view === "form" && editing && (
            <OrderForm
              initial={editing}
              onSave={handleSave}
              onCancel={handleCancelForm}
            />
          )}

          {view === "view" && viewing && (
            <OrderView
              order={viewing}
              onClose={handleCloseView}
              onChangeStatus={async (id, stato) => {
                const ord = orders.find((o) => o.id === id);
                if (!ord) return;

                await updateOrder({ ...ord, stato });
                await load();
              }}
            />
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
