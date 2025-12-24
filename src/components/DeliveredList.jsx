// FILE: src/components/DeliveredList.jsx
import React, { useState, useMemo } from "react";
import StatusLed from "./StatusLed";

export default function DeliveredList({
  orders = [],
  onView,
  onEdit,
  onDelete,
  isAdmin = false
}) {
  const [search, setSearch] = useState("");

  // 🔍 FILTRO RICERCA
  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;

    return orders.filter(
      (o) =>
        (o.cliente || "").toLowerCase().includes(q) ||
        (o.telefono || "").toLowerCase().includes(q)
    );
  }, [orders, search]);

  if (!orders.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        Nessun ordine consegnato.
      </div>
    );
  }

  return (
    <div>
      {/* 🔍 BARRA RICERCA */}
      <div className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per cliente o telefono"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={() => setSearch("")}
          className="btn-small"
        >
          Reset
        </button>
      </div>

      {/* LISTA CONSEGNATI */}
      <div className="space-y-3">
        {filteredOrders.map((o) => (
          <div
            key={o.id}
            className="p-3 border rounded flex items-center justify-between bg-gray-50"
          >
            <div>
              <div className="font-medium">{o.cliente || "-"}</div>
              <div className="text-sm text-gray-600">
                Tel: {o.telefono || "-"} • Consegna:{" "}
                {o.consegna
                  ? new Date(o.consegna).toLocaleDateString()
                  : "-"}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusLed status={o.stato} />

              {/* VISUALIZZA */}
              {onView && (
                <button
                  onClick={() => onView(o)}
                  className="btn-small"
                >
                  👁️
                </button>
              )}

              {/* MODIFICA (solo admin) */}
              {isAdmin && onEdit && (
                <button
                  onClick={() => onEdit(o)}
                  className="btn-small"
                >
                  ✏️
                </button>
              )}

              {/* ELIMINA (solo admin) */}
              {isAdmin && onDelete && (
                <button
                  onClick={() => onDelete(o.id)}
                  className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
