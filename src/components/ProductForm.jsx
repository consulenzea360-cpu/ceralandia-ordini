// FILE: src/components/ProductForm.jsx
import React, { useEffect, useRef, useState } from "react";
import ProductImageModal from "./ProductImageModal";

export default function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      id: null,
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

  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initial) {
      setForm({
        id: initial.id ?? null,
        nome: initial.nome ?? "",
        immagine: initial.immagine ?? "",
        prezzo_dettaglio: initial.prezzo_dettaglio ?? "",
        prezzo_10: initial.prezzo_10 ?? "",
        prezzo_20: initial.prezzo_20 ?? "",
        prezzo_50: initial.prezzo_50 ?? "",
        prezzo_100: initial.prezzo_100 ?? "",
        prezzo_100_plus: initial.prezzo_100_plus ?? ""
      });
    }
  }, [initial?.id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handlePickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Seleziona un file immagine valido.");
      return;
    }

    // Convertiamo l’immagine in base64 (DataURL) per usarla subito nel catalogo
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setForm((prev) => ({ ...prev, immagine: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  const thumbSizePx = 113; // ~3cm a 96dpi (riferimento visivo)

  return (
    <div className="card mb-6">
      <h3 className="text-xl font-semibold mb-4">
        {initial ? "Modifica Prodotto" : "Nuovo Prodotto"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="nome"
          placeholder="Nome prodotto"
          value={form.nome}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {/* IMMAGINE: upload + preview 3x3 cm + camera icon */}
        <div className="flex items-start gap-4">
          <div className="relative" style={{ width: thumbSizePx, height: thumbSizePx }}>
            <div
              className="border rounded overflow-hidden bg-gray-50"
              style={{ width: thumbSizePx, height: thumbSizePx }}
            >
              {form.immagine ? (
                <img
                  src={form.immagine}
                  alt="Anteprima"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Nessuna immagine
                </div>
              )}
            </div>

            {/* Icona fotocamera */}
            <button
              type="button"
              className="absolute bottom-1 right-1 bg-white/90 border rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-white"
              title="Visualizza immagine"
              onClick={() => {
                if (form.immagine) setPreviewImage(form.immagine);
              }}
              disabled={!form.immagine}
            >
              📷
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-small"
                onClick={() => fileInputRef.current?.click()}
              >
                Carica immagine da PC
              </button>

              {form.immagine && (
                <button
                  type="button"
                  className="btn-small"
                  onClick={() => setForm((prev) => ({ ...prev, immagine: "" }))}
                >
                  Rimuovi
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePickFile}
            />

            {/* Manteniamo anche URL manuale (se preferisci link) */}
            <input
              name="immagine"
              placeholder="URL immagine (opzionale) o incolla base64"
              value={form.immagine || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />

            <div className="text-xs text-gray-500">
              L’immagine viene mostrata in anteprima su un riquadro 3×3 cm (circa).
              Clicca sulla fotocamera per aprire il popup (50% schermo).
            </div>
          </div>
        </div>

        {/* PREZZI */}
        <div className="grid grid-cols-2 gap-3">
          <input
            name="prezzo_dettaglio"
            placeholder="Prezzo dettaglio"
            value={form.prezzo_dettaglio ?? ""}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            name="prezzo_10"
            placeholder="Prezzo x10"
            value={form.prezzo_10 ?? ""}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            name="prezzo_20"
            placeholder="Prezzo x20"
            value={form.prezzo_20 ?? ""}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            name="prezzo_50"
            placeholder="Prezzo x50"
            value={form.prezzo_50 ?? ""}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            name="prezzo_100"
            placeholder="Prezzo x100"
            value={form.prezzo_100 ?? ""}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            name="prezzo_100_plus"
            placeholder="Prezzo 100+"
            value={form.prezzo_100_plus ?? ""}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-dark">
            Salva
          </button>
          <button type="button" onClick={onCancel} className="btn-small">
            Annulla
          </button>
        </div>
      </form>

      <ProductImageModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}
