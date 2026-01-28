// FILE: src/pages/Products.jsx
import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import ProductForm from "../components/ProductForm";
import ProductImageModal from "../components/ProductImageModal";

import { fetchProducts, insertProduct, updateProduct, deleteProduct } from "../utils/supabase";

export default function Products({ user, onLogout }) {
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
      alert("Errore caricamento catalogo prodotti.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(product) {
    setLoading(true);
    try {
      if (product.id) await updateProduct(product);
      else await insertProduct(product);

      await load();
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert("Errore salvataggio prodotto (controlla policy Supabase).");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!isAdmin) return;
    if (!window.confirm("Eliminare il prodotto?")) return;

    setLoading(true);
    try {
      await deleteProduct(id);
      await load();
    } catch (e) {
      console.error(e);
      alert("Errore eliminazione prodotto (controlla policy Supabase).");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => (p.nome || "").toLowerCase().includes(q));
  }, [search, products]);

  const thumbSize = 72;

  return (
    <div>
      <Navbar onLogout={onLogout} />

      <div className="container-max mx-auto p-6">
        <h2 className="text-2xl font-bold mb-2">Catalogo Prodotti</h2>

        <div className="text-sm text-gray-600 mb-4">
          I prezzi possono variare in funzione del tipo di decorazione scelto dal cliente.
        </div>

        {isAdmin && (
          <button onClick={() => setEditing({})} className="btn-dark mb-4">
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
          className="w-full p-2 border rounded mb-4"
        />

        {loading && <div className="mb-3 text-gray-500">Caricamento...</div>}

        {/* ELENCO */}
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="p-3 border rounded bg-gray-50 flex items-start gap-3">
              {/* Immagine sx */}
              <div
                className="relative rounded overflow-hidden border bg-white flex-shrink-0"
                style={{ width: thumbSize, height: thumbSize }}
              >
                {p.immagine ? (
                  <img
                    src={p.immagine}
                    alt={p.nome || "Prodotto"}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setPreviewImage(p.immagine)}
                    title="Apri immagine"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Nessuna
                  </div>
                )}

                {p.immagine && (
                  <button
                    type="button"
                    className="absolute bottom-1 right-1 bg-white/90 border rounded-full w-7 h-7 flex items-center justify-center shadow"
                    onClick={() => setPreviewImage(p.immagine)}
                    title="Apri immagine"
                  >
                    📷
                  </button>
                )}
              </div>

              {/* Dettagli dx */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-lg">{p.nome || "-"}</div>
                    <div className="text-xs text-gray-500">ID: {p.id}</div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditing(p)} className="btn-small">
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div><span className="text-gray-500">Dettaglio:</span> {p.prezzo_dettaglio || "-"}</div>
                  <div><span className="text-gray-500">x10:</span> {p.prezzo_10 || "-"}</div>
                  <div><span className="text-gray-500">x20:</span> {p.prezzo_20 || "-"}</div>
                  <div><span className="text-gray-500">x50:</span> {p.prezzo_50 || "-"}</div>
                  <div><span className="text-gray-500">x100:</span> {p.prezzo_100 || "-"}</div>
                  <div><span className="text-gray-500">100+:</span> {p.prezzo_100_plus || "-"}</div>
                </div>
              </div>
            </div>
          ))}

          {!filtered.length && !loading && (
            <div className="py-10 text-center text-gray-500">Nessun prodotto trovato.</div>
          )}
        </div>
      </div>

      <ProductImageModal image={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
