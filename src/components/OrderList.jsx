// FILE: src/components/OrderList.jsx
import React from "react";
import StatusLed from "./StatusLed";

export default function OrderList({
  orders = [],
  onEdit,
  onView,
  onChangeStatus,
  onDelete,
  isAdmin = false
}) {
  if (!orders.length)
    return (
      <div className="text-center text-gray-500 py-6">
        Nessun ordine presente.
      </div>
    );

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const isDelivered = o.stato === "consegnato";

        return (
          <div
            key={o.id}
            className="p-3 border rounded flex items-center justify-between bg-white shadow-sm"
          >
            {/* Info Ordine */}
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

              {/* Visualizza */}
              {onView && (
                <button
                  onClick={() => onView(o)}
                  className="px-2 py-1 border rounded bg-white hover:bg-gray-100"
                >
                  👁️
                </button>
              )}

              {/* Cambia stato (solo se NON consegnato) */}
              {!isDelivered && onChangeStatus && (
                <select
                  className="border p-1 rounded"
                  value={o.stato}
                  onChange={(e) => onChangeStatus(o.id, e.target.value)}
                >
                  <option value="da_prendere">Da prendere</option>
                  <option value="in_lavorazione">In lavorazione</option>
                  <option value="pronto">Completato</option>
                  <option value="consegnato">Consegnato</option>
                </select>
              )}

              {/* Modifica 
                  - Utente locale: solo se NON è consegnato
                  - Admin: sempre possibile
               */}
              {onEdit &&
                ((isAdmin || !isDelivered) && (
                  <button
                    onClick={() => onEdit(o)}
                    className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                  >
                    ✏️
                  </button>
                ))}

              {/* Elimina — SOLO admin */}
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
        );
      })}
    </div>
  );
}
