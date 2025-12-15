// FILE: src/components/OrderForm.jsx
import React, { useEffect, useState } from "react";
import { OPERATORS, WORKERS } from "../constants";

export default function OrderForm({ initial, onCancel, onSave }) {
  const [order, setOrder] = useState(initial || { prodotti: [] });

  // Sincronizza dati quando si modifica un ordine
  useEffect(() => {
    setOrder(initial || { prodotti: [] });
  }, [initial]);

  function update(patch) {
    setOrder((prev) => ({ ...prev, ...patch }));
  }

  function addProduct() {
    const newProd = {
      id: Date.now() + Math.random(),
      nome: "",
      quantita: 1,
      note: "",
    };
    update({ prodotti: [...(order.prodotti || []), newProd] });
  }

  function updateProduct(id, patch) {
    update({
      prodotti: (order.prodotti || []).map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    });
  }

  function removeProduct(id) {
    update({
      prodotti: (order.prodotti || []).filter((p) => p.id !== id),
    });
  }

  function handleSave() {
    if (!order.cliente || !order.telefono) {
      alert("Inserire nome e telefono del cliente");
      return;
    }

    const cleaned = { ...order };
    if (cleaned.consegna === "") cleaned.consegna = null;

    onSave(cleaned);
  }

  return (
    <div className="bg-white p-5 rounded shadow border">
      <h2 className="text-xl font-bold mb-4">Compila Ordine</h2>

      {/* DATI CLIENTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-sm text-gray-600">Nome cliente</label>
          <input
            value={order.cliente || ""}
            onChange={(e) => update({ cliente: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Telefono</label>
          <input
            value={order.telefono || ""}
            onChange={(e) => update({ telefono: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Operatore (prende ordine)
          </label>
          <select
            value={order.operatore || OPERATORS[0]}
            onChange={(e) => update({ operatore: e.target.value })}
            className="w-full p-2 border rounded"
          >
            {OPERATORS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Operatore (lavora ordine)
          </label>
          <select
            value={order.lavoratore || WORKERS[0]}
            onChange={(e) => update({ lavoratore: e.target.value })}
            className="w-full p-2 border rounded"
          >
            {WORKERS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LISTA PRODOTTI */}
      <div className="border rounded p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Prodotti richiesti</div>
          <button onClick={addProduct} className="px-2 py-1 rounded border">
            ＋
          </button>
        </div>

        <ol className="list-decimal pl-6 space-y-3">
          {(order.prodotti || []).map((p) => (
            <li key={p.id} className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex gap-2">
                  <input
                    value={p.nome}
                    onChange={(e) =>
                      updateProduct(p.id, { nome: e.target.value })
                    }
                    placeholder="Nome prodotto"
                    className="p-1 border rounded flex-1"
                  />
                  <input
                    type="number"
                    value={p.quantita}
                    onChange={(e) =>
                      updateProduct(p.id, { quantita: Number(e.target.value) })
                    }
                    className="w-20 p-1 border rounded"
                  />
                </div>
                <input
                  value={p.note}
                  onChange={(e) => updateProduct(p.id, { note: e.target.value })}
                  placeholder="Note (opz.)"
                  className="mt-1 p-1 border rounded w-full"
                />
              </div>

              <button
                onClick={() => removeProduct(p.id)}
                className="px-2 py-1 rounded border text-sm bg-red-100 hover:bg-red-200"
              >
                Elimina
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* CONSEGNA E STATO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-sm text-gray-600">Data consegna</label>
          <input
            type="date"
            value={order.consegna ? order.consegna.split("T")[0] : ""}
            onChange={(e) =>
              update({
                consegna: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : null,
              })
            }
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Stato ordine</label>
          <select
            value={order.stato || "da_prendere"}
            onChange={(e) => update({ stato: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="da_prendere">Da prendere in carico</option>
            <option value="in_lavorazione">In lavorazione</option>
            <option value="pronto">Completato</option>
            <option value="consegnato">Consegnato</option>
          </select>
        </div>
      </div>

      {/* BOTTONI FINALI */}
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 border rounded">
          Annulla
        </button>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Salva ordine
        </button>
      </div>
    </div>
  );
}
