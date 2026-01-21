// FILE: src/pages/Products.jsx
import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import ProductImageModal from "../components/ProductImageModal";

export default function Products({ user, onLogout }) {
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  function handleSave(product) {
    if (product.id) {
      setProducts(products.map(p => (p.id === product.id ? product : p)));
    } else {
      setProducts([...products, { ...product, id: Date.now() }]);
    }
    setEditing(null);
  }

  function handleDelete(id) {
    if (!window.confirm("Eliminare il prodotto?")) return;
    setProducts(products.filter(p => p.id !== id));
  }

  const filtered = useMemo(() => {
    return products.filter(p =>
      p.nome.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, products]);

  return (
    <div>
      <Navbar onLogout={onLogout} />

      <div className="container-max mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Catalogo Prodotti</h2>

        {isAdmin && (
          <button
            onClick={() => setEditing({})}
            className="btn-dark mb-4"
          >
            ➕ Inserisci Prodotto
          </button>
        )}

        {editing && (
          <ProductForm
            initial={editing.id ? editing : null}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        )}

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca prodotto..."
          className="w-full p-2 border rounded mb-6"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              isAdmin={isAdmin}
              onEdit={setEditing}
              onDelete={handleDelete}
              onImageClick={setPreviewImage}
            />
          ))}
        </div>
      </div>

      <ProductImageModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}
