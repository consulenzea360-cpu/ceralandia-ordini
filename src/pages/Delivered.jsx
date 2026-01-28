import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import DeliveredList from "../components/DeliveredList";
import OrderForm from "../components/OrderForm";
import OrderView from "../components/OrderView";
import Footer from "../components/Footer";

import {
  fetchOrders,
  updateOrder,
  deleteOrder,
  insertOrder
} from "../utils/supabase";

/* ===================== CSV helpers ===================== */
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
      if (c === '"') inQuotes = true;
      else if (c === ",") {
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

  row.push(field);
  rows.push(row);

  return rows.filter((r) => r.some((x) => String(x || "").trim() !== ""));
}

function toCSVCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function downloadCSV(csvText, filename) {
  const bom = "\uFEFF"; // Excel UTF-8
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
      ]
        .map(toCSVCell)
        .join(",")
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
      stato: iStato >= 0 ? row[iStato] : "consegnato",
      consegna,
      prodotti
    });
  }

  return out;
}
/* ======================================================= */

export default function Delivered({ user, onLogout }) {
  const isAdmin = user?.role === "admin";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState("list"); // list | view | form
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ✅ search persistente
  const [search, setSearch] = useState("");

  // ✅ scroll persistente
  const lastScrollYRef = useRef(0);

  // ✅ import input
  const importInputRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchOrders({ deliveredFlag: true });
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleView(order) {
    lastScrollYRef.current = window.scrollY;
    setSelectedOrder(order);
    setView("view");
  }

  function handleEdit(order) {
    if (!isAdmin) {
      alert("Solo l'admin può modificare un ordine consegnato.");
      return;
    }

    lastScrollYRef.current = window.scrollY;
    setSelectedOrder(order);
    setView("form");
  }

  function backToList() {
    setView("list");
    setSelectedOrder(null);

    requestAnimationFrame(() => {
      window.scrollTo({ top: lastScrollYRef.current, behavior: "auto" });
    });
  }

  async function handleDelete(id) {
    if (!isAdmin) return alert("Solo l'admin può eliminare gli ordini.");
    if (!window.confirm("Vuoi davvero eliminare questo ordine?")) return;

    try {
      await deleteOrder(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Errore eliminazione ordine.");
    }
  }

  async function handleSave(order) {
    try {
      await updateOrder(order);
      await load();
      backToList();
    } catch (err) {
      console.error(err);
      alert("Errore salvataggio ordine.");
    }
  }

  /* ===== EXPORT / IMPORT (solo admin) ===== */
  async function handleExportCSV() {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const all = await fetchOrders({ deliveredFlag: true });
      const csv = ordersToCSV(all);

      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      downloadCSV(csv, `ordini-consegnati_${yyyy}-${mm}-${dd}.csv`);
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
    e.target.value = "";
    if (!file) return;

    const ok = window.confirm(
      "IMPORT CSV: questa operazione sovrascrive gli ordini consegnati (cancella quelli attuali e importa quelli del CSV). Continuare?"
    );
    if (!ok) return;

    setLoading(true);
    try {
      const text = await file.text();
      const importedOrders = csvToOrders(text);

      const current = await fetchOrders({ deliveredFlag: true });
      await Promise.all(current.map((o) => deleteOrder(o.id)));

      for (const o of importedOrders) {
        await insertOrder({ ...o, stato: "consegnato" });
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
          <h2 className="text-2xl font-bold mb-4">Ordini Consegnati</h2>

          {loading && <div className="mb-3 text-gray-500">Caricamento...</div>}

          {view === "list" && (
            <>
              <DeliveredList
                orders={orders}
                search={search}
                setSearch={setSearch}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />

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

          {view === "view" && selectedOrder && (
            <OrderView order={selectedOrder} onClose={backToList} />
          )}

          {view === "form" && selectedOrder && (
            <OrderForm initial={selectedOrder} onSave={handleSave} onCancel={backToList} />
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
