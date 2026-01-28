import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import DeliveredList from "../components/DeliveredList";
import OrderForm from "../components/OrderForm";
import OrderView from "../components/OrderView";

import { fetchOrders, updateOrder, deleteOrder } from "../utils/supabase";
import Footer from "../components/Footer";

export default function Delivered({ user, onLogout }) {
  const isAdmin = user?.role === "admin";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState("list"); // list | view | form
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ✅ search persistente
  const [search, setSearch] = useState("");

  // ✅ scroll persistente
  const lastScrollYRef = useRef(0);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchOrders({ deliveredFlag: true });
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleView(order) {
    // salva scroll prima di aprire la view
    lastScrollYRef.current = window.scrollY;

    setSelectedOrder(order);
    setView("view");
  }

  function handleEdit(order) {
    if (!isAdmin)
      return alert("Solo l'admin può modificare un ordine consegnato.");

    // salva scroll prima di aprire il form
    lastScrollYRef.current = window.scrollY;

    setSelectedOrder(order);
    setView("form");
  }

  function handleCloseToList() {
    setView("list");
    setSelectedOrder(null);

    // ripristina scroll dopo il re-render della lista
    requestAnimationFrame(() => {
      window.scrollTo({ top: lastScrollYRef.current, behavior: "auto" });
    });
  }

  async function handleDelete(id) {
    if (!isAdmin) return alert("Solo l'admin può eliminare gli ordini.");
    if (!window.confirm("Vuoi davvero eliminare questo ordine?")) return;

    try {
      await deleteOrder(id);
      await load();
    } catch (err) {
      console.error(err);
      alert("Errore eliminazione ordine.");
    }
  }

  async function handleSave(order) {
    await updateOrder(order);
    await load();
    handleCloseToList();
  }

  return (
    <div className="main-content">
      <div>
        <Navbar onLogout={onLogout} />

        <div className="container-max mx-auto p-6">
          <h2 className="text-2xl font-bold mb-4">Ordini Consegnati</h2>

          {loading && (
            <div className="mb-3 text-gray-500">Caricamento...</div>
          )}

          {view === "list" && (
            <DeliveredList
              orders={orders}
              search={search}
              setSearch={setSearch}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          )}

          {view === "view" && selectedOrder && (
            <OrderView
              order={selectedOrder}
              onClose={handleCloseToList}
            />
          )}

          {view === "form" && selectedOrder && (
            <OrderForm
              initial={selectedOrder}
              onSave={handleSave}
              onCancel={handleCloseToList}
            />
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
