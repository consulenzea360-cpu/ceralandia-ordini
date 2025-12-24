import React, { useMemo, useState } from "react";
import StatusLed from "./StatusLed";

export default function OrderList({
  orders = [],
  onEdit,
  onView,
  onDelete,
  isAdmin = false,
  onChangeStatus
}) {
  const [search, setSearch] = useState("");

  // 🔎 FILTRO COME DeliveredList
  const filteredOrders = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return orders;

    return orders.filter(
      (o) =>
        (o.cliente || "").toLowerCase().includes(t) ||
        (o.telefono || "").toLowerCase().includes(t)
    );
  }, [orders, search]);

  if (!orders.length) {
    return (
      <div className="text-center text-gray-500 py-6">
        Nessun ordine presente.
      </div>
    );
  }

  return (
    <div>
      {/* 🔍 SEARCH BAR */}
      <div className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per nome o telefono"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={() => setSearch("")}
          className="px-3 py-2 border rounded"
        >
          Reset
        </button>
      </div>

      {/* LISTA ORDINI */}
      <div className="space-y-3">
        {filteredOrders.map((o) => (
          <div
            key={o.id}
            className="p-3 border rounded flex items-center justify-between bg-white shadow-sm"
          >
            {/* INFO */}
            <div>
              <div className="font-medium">{o.cliente || "-"}</div>
              <div className="text-sm text-gray-600">
                Tel: {o.telefono || "-"} • Consegna:{" "}
                {o.consegna
                  ? new Date(o.consegna).toLocaleDateString()
                  : "-"}
              </div>
            </div>

            {/* AZIONI */}
            <div className="flex items-center gap-3">
              <StatusLed status={o.stato} />

              {/* VISUALIZZA */}
              {onView && (
                <button
                  onClick={() => onView(o)}
                  className="px-2 py-1 border rounded bg-white hover:bg-gray-100"
                >
                  👁️
                </button>
              )}

              {/* CAMBIO STATO */}
              {onChangeStatus && (
                <select
                  className="border p-1 rounded"
                  value={o.stato}
                  onChange={(e) =>
                    onChangeStatus(o.id, e.target.value)
                  }
                >
                  <option value="da_prendere">Da prendere</option>
                  <option value="in_lavorazione">In lavorazione</option>
                  <option value="pronto">Completato</option>
                  <option value="consegnato">Consegnato</option>
                </select>
              )}

              {/* MODIFICA */}
              {onEdit && (
                <button
                  onClick={() => onEdit(o)}
                  className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                >
                  ✏️
                </button>
              )}

              {/* ELIMINA — SOLO ADMIN */}
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
