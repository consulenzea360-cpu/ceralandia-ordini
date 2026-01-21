// FILE: src/components/ProductImageModal.jsx
import React from "react";

export default function ProductImageModal({ image, onClose }) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <img
        src={image}
        alt="Prodotto"
        className="max-w-full max-h-full rounded"
      />
    </div>
  );
}
