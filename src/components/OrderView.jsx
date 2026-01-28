import React, { useEffect, useState } from "react";

export default function OrderView({ order, onClose, onChangeStatus }) {
  if (!order) return null;

  const [localStatus, setLocalStatus] = useState(order.stato || "");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null); // { prev, next }

  useEffect(() => {
    setLocalStatus(order.stato || "");
  }, [order?.id]);

  const handleStatusChange = (nextStatus) => {
    if (!onChangeStatus) return;

    if (nextStatus === "consegnato") {
      setPendingStatus({ prev: localStatus, next: nextStatus });
      setConfirmOpen(true);
      return;
    }

    setLocalStatus(nextStatus);
    Promise.resolve(onChangeStatus(order.id, nextStatus)).catch(() => {
      setLocalStatus(order.stato || "");
    });
  };

  const confirmYes = () => {
    if (!pendingStatus) return;

    setConfirmOpen(false);
    setLocalStatus(pendingStatus.next);

    Promise.resolve(onChangeStatus(order.id, pendingStatus.next)).catch(() => {
      setLocalStatus(pendingStatus.prev);
    });

    setPendingStatus(null);
  };

  const confirmNo = () => {
    if (pendingStatus?.prev !== undefined) {
      setLocalStatus(pendingStatus.prev);
    }
    setConfirmOpen(false);
    setPendingStatus(null);
  };

  return (
    <div className="bg-white p-5 border rounded shadow">
      <h2 className="text-xl font-bold mb-3">Dettaglio Ordine</h2>

      <div className="mb-3">
        <div><strong>Cliente:</strong> {order.cliente || "-"}</div>
        <div><strong>Telefono:</strong> {order.telefono || "-"}</div>
        <div><strong>Operatore:</strong> {order.operatore || "-"}</div>
        <div><strong>Lavoratore:</strong> {order.lavoratore || "-"}</div>

        {/* ✅ STATO: select SOLO se onChangeStatus è presente */}
        <div className="mt-2 flex items-center gap-2">
          <strong>Stato:</strong>

          {onChangeStatus ? (
            <select
              className="border p-1 rounded"
              value={localStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="da_prendere">Da prendere</option>
              <option value="in_lavorazione">In lavorazione</option>
              <option value="pronto">Completato</option>
              <option value="consegnato">Consegnato</option>
            </select>
          ) : (
            <span>{localStatus || "-"}</span>
          )}
        </div>

        <div className="mt-2">
          <strong>Consegna:</strong>{" "}
          {order.consegna
            ? new Date(order.consegna).toLocaleDateString()
            : "-"}
        </div>
      </div>

      <h3 className="font-semibold mb-2">Prodotti</h3>
      <ul className="list-disc pl-6 mb-4">
        {order.prodotti?.map((p) => (
          <li key={p.id || `${p.nome}-${p.quantita}`}>
            {p.nome || "—"} — {p.quantita || 0}
            {p.note ? ` (Note: ${p.note})` : ""}
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded bg-gray-200 hover:bg-gray-300"
        >
          Chiudi
        </button>
      </div>

      {/* ✅ POPUP conferma "Consegnato" */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded border bg-white p-4 shadow-lg">
            <div className="text-lg font-medium mb-2">
              Conferma consegna
            </div>
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
