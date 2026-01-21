// FILE: src/components/ProductForm.jsx
import React, { useState } from "react";

export default function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      nome: "",
      immagine: "",
      prezzo_dettaglio: "",
      prezzo_10: "",
      prezzo_20: "",
      prezzo_50: "",
      prezzo_100: "",
      prezzo_100_plus: ""
    }
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value || null });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="card mb-6">
      <h3 className="text-xl font-semibold mb-4">
        {initial ? "Modifica Prodotto" : "Nuovo Prodotto"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="nome"
          placeholder="Nome prodotto"
          value={form.nome}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          name="immagine"
          placeholder="URL immagine"
          value={form.immagine || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <div className="grid grid-cols-2 gap-3">
          <input name="prezzo_dettaglio" placeholder="Prezzo dettaglio" onChange={handleChange} className="p-2 border rounded" />
          <input name="prezzo_10" placeholder="Prezzo x10" onChange={handleChange} className="p-2 border rounded" />
          <input name="prezzo_20" placeholder="Prezzo x20" onChange={handleChange} className="p-2 border rounded" />
          <input name="prezzo_50" placeholder="Prezzo x50" onChange={handleChange} className="p-2 border rounded" />
          <input name="prezzo_100" placeholder="Prezzo x100" onChange={handleChange} className="p-2 border rounded" />
          <input name="prezzo_100_plus" placeholder="Prezzo 100+" onChange={handleChange} className="p-2 border rounded" />
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="btn-dark">
            Annulla
          </button>
          <button type="submit" className="btn-dark">
            Salva
          </button>
        </div>
      </form>
    </div>
  );
}
