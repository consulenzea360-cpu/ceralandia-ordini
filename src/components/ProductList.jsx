import React, { useMemo, useState } from "react";
import ProductCard from "./ProductCard";

export default function ProductList({ products = [], isAdmin, onEdit, onDelete }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return products;
    return products.filter((p) => (p.nome || "").toLowerCase().includes(t));
  }, [products, search]);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca prodotto"
          className="flex-1 p-2 border rounded"
        />
        <button onClick={() => setSearch("")} className="btn-small">
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            isAdmin={isAdmin}
            onEdit={() => onEdit(p)}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
