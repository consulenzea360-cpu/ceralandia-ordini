import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import OrderList from "../components/OrderList";
import OrderForm from "../components/OrderForm";
import OrderView from "../components/OrderView";

import {
  fetchOrders,
  insertOrder,
  updateOrder,
  deleteOrder
} from "../utils/supabase";
import Footer from "../components/Footer";

export default function Orders({ user, onLogout }) {
  const isAdmin = user?.role === "admin";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState("list"); // list | form | view
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  // ✅ salva e ripristina scroll quando apri/chiudi OrderView
  const lastScrollYRef = useRef(0);

  // Carica ordini
  async function load() {
    setLoading(true);
    try {
      const data = await fetchOrders({ deliveredFlag: false });
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Apre form inserimento
  function openInsert() {
    setEditing({
      cliente: "",
      telefono: "",
      operatore: user.username,
      lavoratore: user.username,
      prodotti: [],
      stato: "da_prendere",
      consegna: null
    });
    setView("form");
  }

  async function handleSave(order) {
    setLoading(true);
    try {
      if (order.id) await updateOrder(order);
      else await insertOrder(order);
      await load();
      setView("list");
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert("Errore durante il salvataggio.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(order) {
    if (!isAdmin && order.stato === "consegnato") {
      alert("Non puoi modificare un ordine consegnato.");
      return;
    }
    setEditing(order);
    setView("form");
  }

  function handleView(order) {
    // ✅ salva scroll prima di passare alla view
    lastScrollYRef.current = window.scrollY;

    setViewing(order);
    setView("view");
  }

  function handleCloseView() {
    setView("list");
    setViewing(null);

    // ✅ ripristina scroll dopo che la lista è tornata visibile
    requestAnimationFrame(() => {
      window.scrollTo({ top: lastScrollYRef.current, behavior: "auto" });
    });
  }

  async function handleDelete(id) {
    if (!isAdmin) return alert("Solo l'admin può eliminare gli ordini.");

    if (!window.confirm("Sei sicuro di voler eliminare questo ordine?")) return;

    try {
      await deleteOrder(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Errore durante l'eliminazione.");
    }
  }

  return (
    <div className="main-content">
      <div>
        <Navbar onLogout={onLogout} />

        <div className="container-max mx-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Ordini in lavorazione</h2>

            <button
              onClick={openInsert}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Inserisci ordine
            </button>
          </div>

          {view === "list" && (
            <OrderList
              orders={orders}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              isAdmin={isAdmin}
              onChangeStatus={async (id, stato) => {
                const ord = orders.find((o) => o.id === id);
                if (!ord) return;

                await updateOrder({ ...ord, stato });
                load();
              }}
            />
          )}

          {view === "form" && editing && (
            <OrderForm
              initial={editing}
              onSave={handleSave}
              onCancel={() => setView("list")}
            />
          )}

          {view === "view" && viewing && (
            <OrderView order={viewing} onClose={handleCloseView} />
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
