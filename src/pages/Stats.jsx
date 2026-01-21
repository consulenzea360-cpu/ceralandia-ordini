import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { fetchOrders } from "../utils/supabase";

import {
  monthKeyFromISO,
  monthNameItalian,
  sortByConsegnaAsc,
  formatDate
} from "../utils/datehelpers";
import Footer from "../components/Footer";
// ...
<Footer />


export default function Stats({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null); // es: "2025-02-in_lavorazione"
  const [loading, setLoading] = useState(false);

  // ---------------------------
  // LOAD ORDERS
  // ---------------------------
  async function load() {
    setLoading(true);
    try {
      const active = await fetchOrders({ deliveredFlag: false });
      const delivered = await fetchOrders({ deliveredFlag: true });

      setOrders([...active, ...delivered]);
    } catch (e) {
      console.error(e);
      alert("Errore durante il caricamento delle statistiche");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ---------------------------
  // GROUP BY MONTH
  // ---------------------------
  const grouped = useMemo(() => {
    const map = {};

    for (const o of orders) {
      const mk = monthKeyFromISO(o.consegna || o.created_at);
      if (!mk) continue;

      if (!map[mk]) map[mk] = [];
      map[mk].push(o);
    }
    return map;
  }, [orders]);

  return (<div className="main-content">
    <div>
      <Navbar user={user} onLogout={onLogout} />

      <div className="container-max mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Statistiche Mensili</h2>

        {loading && <div>Caricamento...</div>}

        {!loading && Object.keys(grouped).length === 0 && (
          <div>Nessun ordine registrato.</div>
        )}

        {!loading &&
          Object.keys(grouped)
            .sort() // Ordine mesi: dal più vecchio al più recente
            .map((ym) => {
              const list = grouped[ym];

              // COUNTERS
              const counts = {
                da_prendere: list.filter((o) => o.stato === "da_prendere").length,
                in_lavorazione: list.filter((o) => o.stato === "in_lavorazione").length,
                pronto: list.filter((o) => o.stato === "pronto").length,
                consegnato: list.filter((o) => o.stato === "consegnato").length
              };

              return (
                <div key={ym} className="border rounded p-4 mb-6 bg-white shadow">
                  <h3 className="text-xl font-semibold mb-3">
                    {monthNameItalian(ym)}
                  </h3>

                  {/* COUNTER GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {Object.entries(counts).map(([state, qty]) => {
                      const key = `${ym}-${state}`;

                      return (
                        <div
                          key={state}
                          className="cursor-pointer p-3 border rounded hover:bg-gray-100"
                          onClick={() =>
                            setExpanded(expanded === key ? null : key)
                          }
                        >
                          <div className="text-sm text-gray-600">
                            {state.replace("_", " ")}
                          </div>
                          <div className="text-2xl font-bold">{qty}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* EXPANDED DETAILS */}
                  {Object.entries(counts).map(([state]) => {
                    const key = `${ym}-${state}`;
                    if (expanded !== key) return null;

                    const filtered = sortByConsegnaAsc(
                      grouped[ym].filter((o) => o.stato === state)
                    );

                    return (
                      <div
                        key={key}
                        className="mt-4 p-3 border rounded bg-gray-50"
                      >
                        <h4 className="font-semibold mb-2">
                          Dettaglio – {state.replace("_", " ")}
                        </h4>

                        {filtered.length === 0 && (
                          <div className="text-gray-500">Nessun ordine</div>
                        )}

                        {filtered.map((o) => (
                          <div
                            key={o.id}
                            className="p-2 border rounded mb-2 bg-white"
                          >
                            <div className="font-medium">
                              {o.cliente || "-"}
                            </div>
                            <div className="text-sm text-gray-600">
                              Tel: {o.telefono || "-"} • Consegna:{" "}
                              {formatDate(o.consegna)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
      </div>
    </div></div>
  );
}
