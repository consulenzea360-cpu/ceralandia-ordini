// FILE: src/components/OrderView.jsx
import React from "react";


export default function OrderView({ order, onClose }) {
  if (!order) return null; // evita errori se order non esiste

  return (
    <div className="bg-white p-5 border rounded shadow">
      <h2 className="text-xl font-bold mb-3">Dettaglio Ordine</h2>

      <div className="mb-3">
        <div><strong>Cliente:</strong> {order.cliente || "-"}</div>
        <div><strong>Telefono:</strong> {order.telefono || "-"}</div>
        <div><strong>Operatore:</strong> {order.operatore || "-"}</div>
        <div><strong>Lavoratore:</strong> {order.lavoratore || "-"}</div>
        <div><strong>Stato:</strong> {order.stato || "-"}</div>
        <div>
          <strong>Consegna:</strong>{" "}
          {order.consegna ? new Date(order.consegna).toLocaleDateString() : "-"}
        </div>
      </div>

      <h3 className="font-semibold mb-2">Prodotti</h3>
      <ul className="list-disc pl-6 mb-4">
        {order.prodotti?.map((p) => (
          <li key={p.id || Math.random()}>
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
    </div>
  );
}
