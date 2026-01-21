// FILE: src/components/ProductCard.jsx
import React from "react";

export default function ProductCard({ product, onImageClick, isAdmin, onEdit, onDelete }) {
  const {
    nome,
    immagine,
    prezzo_dettaglio,
    prezzo_10,
    prezzo_20,
    prezzo_50,
    prezzo_100,
    prezzo_100_plus
  } = product;

  return (
    <div className="card space-y-3">
      {immagine && (
        <img
          src={immagine}
          alt={nome}
          onClick={() => onImageClick(immagine)}
          className="w-full h-40 object-cover rounded cursor-pointer"
        />
      )}

      <h3 className="text-lg font-semibold">{nome}</h3>

      <div className="text-sm space-y-1">
        {prezzo_dettaglio && <div>💰 Dettaglio: {prezzo_dettaglio} €</div>}
        {prezzo_10 && <div>📦 x10: {prezzo_10} €</div>}
        {prezzo_20 && <div>📦 x20: {prezzo_20} €</div>}
        {prezzo_50 && <div>📦 x50: {prezzo_50} €</div>}
        {prezzo_100 && <div>📦 x100: {prezzo_100} €</div>}
        {prezzo_100_plus && <div>📦 100+: {prezzo_100_plus} €</div>}
      </div>

      {isAdmin && (
        <div className="flex gap-2 justify-end pt-2">
          <button onClick={() => onEdit(product)} className="btn-small">
            ✏️
          </button>
          <button onClick={() => onDelete(product.id)} className="btn-small bg-red-600 text-white">
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}
