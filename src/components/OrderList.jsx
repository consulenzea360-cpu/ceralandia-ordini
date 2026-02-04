import React, { useState } from "react";
import StatusLed from "./StatusLed";

export default function OrderList({
  orders = [],
  search = "",
  setSearch = () => {},

  operatorFilter = "ALL",
  setOperatorFilter = () => {},
  operatorOptions = [],

  onView,
  onEdit,
  onChangeStatus,
  onDelete,
  isAdmin = false,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(null);

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
    if (pending) onChangeStatus(pending.id, "consegnato");
    setConfirmOpen(false);
    setPending(null);
  };

  const confirmNo = () => {
    setConfirmOpen(false);
    setPending(null);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per cliente, telefono o prodotto"
          className="flex-1 min-w-[220px] p-2 border rounded"
        />

        <select
          value={operatorFilter}
          onChange={(e) => setOperatorFilter(e.target.value)}
          className="p-2 border rounded min-w-[190px]"
          title="Filtra per operatore"
        >
          <option value="ALL">Tutti gli operatori</option>
          {operatorOptions.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearch("");
            setOperatorFilter("ALL");
          }}
          className="btn-small"
        >
          Reset
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="py-6 text-center text-gray-500">
          {search?.trim() || operatorFilter !== "ALL"
            ? "Nessun ordine corrisponde ai filtri."
            : "Nessun ordine presente."}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="p-3 border rounded flex items-center justify-between bg-gray-50"
            >
              <div>
                <div className="font-medium">{o.cliente || "-"}</div>
                <div className="text-sm text-gray-600">
                  Tel: {o.telefono || "-"} • Operatore: {o.operatore || "-"} • Consegna:{" "}
                  {o.consegna ? new Date(o.consegna).toLocaleDateString() : "-"}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusLed status={o.stato} />

                {onView && (
                  <button onClick={() => onView(o)} className="btn-small">
                    👁️
                  </button>
                )}

                {onChangeStatus && (
                  <select
                    className="border p-1 rounded"
                    value={o.stato}
                    onChange={(e) => handleStatusChange(o, e.target.value)}
                  >
                    <option value="da_prendere">Da prendere</option>
                    <option value="in_lavorazione">In lavorazione</option>
                    <option value="pronto">Completato</option>
                    <option value="consegnato">Consegnato</option>
                  </select>
                )}

                {onEdit && (
                  <button onClick={() => onEdit(o)} className="btn-small">
                    ✏️
                  </button>
                )}

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
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded border bg-white p-4 shadow-lg">
            <div className="text-lg font-medium mb-2">Conferma consegna</div>
            <div className="text-sm text-gray-600 mb-4">
              Sei sicuro di voler impostare l’ordine come <b>Consegnato</b>?
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
