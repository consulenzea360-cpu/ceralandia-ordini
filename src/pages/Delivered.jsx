import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import OrderList from "../components/OrderList";
import OrderView from "../components/OrderView";
import Footer from "../components/Footer";

import { fetchOrders, updateOrder, deleteOrder } from "../utils/supabase";

/** ✅ ELENCO OPERATORI FISSO (sempre visibile) */
const OPERATORI = ["ambra", "salvo", "franco", "ignazio", "alessandro", "admin"];

/** ===== SEARCH helpers ===== */
const normalize = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const coerceProdottiArray = (prodotti) => {
  if (Array.isArray(prodotti)) return prodotti;
  if (typeof prodotti === "string") {
    const s = prodotti.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.items)) return parsed.items;
      return [];
    } catch {
      return [s];
    }
  }
  if (prodotti && typeof prodotti === "object") return [prodotti];
  return [];
};

const extractProductText = (order) => {
  const arr = coerceProdottiArray(order?.prodotti);

  const names = arr
    .map((p) => {
      if (typeof p === "string") return p;
      return (
        p?.nome ||
        p?.name ||
        p?.titolo ||
        p?.title ||
        p?.prodotto ||
        p?.product ||
        p?.descrizione ||
        p?.description ||
        p?.categoria ||
        p?.variant ||
        ""
      );
    })
    .filter(Boolean)
    .join(" ");

  const fallbackJson = arr.length ? JSON.stringify(arr) : "";
  return `${names} ${fallbackJson}`.trim();
};

export default function Delivered({ user, onLogout }) {
  const isAdmin = user?.role === "admin";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState("list"); // list | view
  const [viewing, setViewing] = useState(null);

  const [search, setSearch] = useState("");

  const [operatorFilter, setOperatorFilter] = useState("ALL");

  const lastScrollYRef = useRef(0);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchOrders({ deliveredFlag: true });
      setOrders(data);
    } catch (e) {
      console.error(e);
      alert("Errore caricamento ordini consegnati.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const operatorOptions = useMemo(() => {
    const map = new Map();
    for (const op of OPERATORI) {
      const label = String(op).trim();
      if (!label) continue;
      const key = normalize(label);
      if (!map.has(key)) map.set(key, label);
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, "it"));
  }, []);

  const filteredOrders = useMemo(() => {
    const q = normalize(search);

    return orders.filter((o) => {
      const text = normalize(
        [
          o?.id,
          o?.cliente,
          o?.telefono,
          o?.operatore,
          o?.lavoratore,
          o?.stato,
          extractProductText(o),
        ]
          .filter(Boolean)
          .join(" ")
      );

      const textMatch = !q || text.includes(q);

      const operatorMatch =
        operatorFilter === "ALL" ||
        normalize(o?.operatore) === normalize(operatorFilter);

      return textMatch && operatorMatch;
    });
  }, [orders, search, operatorFilter]);

  function restoreScroll() {
    requestAnimationFrame(() => {
      window.scrollTo({ top: lastScrollYRef.current, behavior: "auto" });
    });
  }

  function handleView(order) {
    lastScrollYRef.current = window.scrollY;
    setViewing(order);
    setView("view");
  }

  function handleCloseView() {
    setView("list");
    setViewing(null);
    restoreScroll();
  }

  async function handleDelete(id) {
    if (!isAdmin) return alert("Solo l'admin può eliminare gli ordini.");
    if (!window.confirm("Sei sicuro di voler eliminare questo ordine?")) return;

    setLoading(true);
    try {
      await deleteOrder(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Errore durante l'eliminazione.");
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
            <h2 className="text-2xl font-bold">Ordini consegnati</h2>
          </div>

          {loading && <div className="mb-3 text-gray-500">Caricamento...</div>}

          {view === "list" && (
            <OrderList
              orders={filteredOrders}
              search={search}
              setSearch={setSearch}
              operatorFilter={operatorFilter}
              setOperatorFilter={setOperatorFilter}
              operatorOptions={operatorOptions}
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
