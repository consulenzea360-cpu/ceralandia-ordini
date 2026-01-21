import React, { useState, useMemo } from "react";
import StatusLed from "./StatusLed";

export default function OrderList({
  orders = [],
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
  isAdmin = false
}) {
  const [search, setSearch] = useState("");

  // popup conferma consegnato
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(null);
  // pending = { id, prevStatus }

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

  const handleStatusChange = (order, nextStatus) => {
    if (!onChangeStatus) return;

    if (nextStatus === "consegnato") {
      setPending({ id: order.id, prevStatus: order.stato });
      setConfirmOpen(true);
      return;
    }

    onChangeStatus(order.id, nextStatus);
  };

  const confirmYes = () => {
    if (pending) {
      onChangeStatus(pending.id, "consegnato");
    }
    setConfirmOpen(false);
    setPending(null);
  };

  const confirmNo = () => {
    // nessuna azione → stato resta invariato
    setConfirmOpen(false);
    setPending(null);
  };

  if (!orders.length) {
    return (
      <div className="py-8 text-center text-gray-500">
        Nessun ordine presente.
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
        <button onClick={() => setSearch("")} className="btn-small">
          Reset
        </button>
      </div>

      {/* 📋 LISTA ORDINI */}
      <div className="space-y-3">
        {filteredOrders.map((o) => (
          <div
            key={o.id}
            className="p-3 border rounded flex items-center justify-between bg-gray-50"
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

              {/* 👁️ VISUALIZZA */}
              {onView && (
                <button onClick={() => onView(o)} className="btn-small">
                  👁️
                </button>
              )}

              {/* SELECT STATO */}
              {onChangeStatus && (
                <select
                  className="border p-1 rounded"
                  value={o.stato}
                  onChange={(e) =>
                    handleStatusChange(o, e.target.value)
                  }
                >
                  <option value="da_prendere">Da prendere</option>
                  <option value="in_lavorazione">In lavorazione</option>
                  <option value="pronto">Completato</option>
                  <option value="consegnato">Consegnato</option>
                </select>
              )}

              {/* ✏️ MODIFICA — ORA ABILITATA PER TUTTI */}
              {onEdit && (
                <button onClick={() => onEdit(o)} className="btn-small">
                  ✏️
                </button>
              )}

              {/* 🗑️ ELIMINA — SOLO ADMIN */}
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

      {/* 🔔 POPUP CONFERMA CONSEGNATO */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded border bg-white p-4 shadow-lg">
            <div className="text-lg font-medium mb-2">
              Conferma consegna
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Sei sicuro di voler impostare l’ordine come{" "}
              <b>Consegnato</b>?
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={confirmNo} className="btn-small">
                No
              </button>
              <button
                onClick={confirmYes}
                className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Sì
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
