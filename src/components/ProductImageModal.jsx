// FILE: src/components/ProductImageModal.jsx
import React from "react";

export default function ProductImageModal({ image, onClose }) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded shadow-lg p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image}
          alt="Prodotto"
          className="rounded max-w-[50vw] max-h-[50vh] object-contain"
        />
      </div>
    </div>
  );
}
