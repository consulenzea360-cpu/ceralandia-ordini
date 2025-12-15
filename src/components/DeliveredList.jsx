// FILE: src/components/DeliveredList.jsx
import React, { useMemo, useState } from "react";
import StatusLed from "./StatusLed";

export default function DeliveredList({
  orders = [],
  onView,
  onEdit,
  onDelete,
  isAdmin = false
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return orders;
    return orders.filter(
      (o) =>
        (o.cliente || "").toLowerCase().includes(t) ||
        (o.telefono || "").toLowerCase().includes(t)
    );
  }, [orders, search]);

  if (!orders.length)
    return (
      <div className="py-8 text-center text-gray-500">
        Nessun ordine consegnato.
      </div>
    );

  return (
    <div>
      {/* Barra ricerca */}
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

      {/* Lista */}
      <div className="space-y-3">
        {filtered.map((o) => (
          <div
            key={o.id}
            className="p-3 border rounded flex items-center justify-between bg-purple-50"
          >
            {/* Info */}
            <div>
              <div className="font-medium">{o.cliente || "-"}</div>
              <div className="text-sm text-gray-600">
                Tel: {o.telefono || "-"} • Consegna:{" "}
                {o.consegna
                  ? new Date(o.consegna).toLocaleDateString()
                  : "-"}
              </div>
            </div>

            {/* Azioni */}
            <div className="flex items-center gap-3">
              <StatusLed status={o.stato} />

              {/* Visualizza sempre */}
              {onView && (
                <button
                  onClick={() => onView(o)}
                  className="px-2 py-1 border rounded bg-white hover:bg-gray-100"
                >
                  👁️
                </button>
              )}

              {/* Modifica solo admin */}
              {isAdmin && onEdit && (
                <button
                  onClick={() => onEdit(o)}
                  className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                >
                  ✏️
                </button>
              )}

              {/* Elimina solo admin */}
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
