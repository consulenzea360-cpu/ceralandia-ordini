// FILE: src/pages/Delivered.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DeliveredList from "../components/DeliveredList";
import OrderForm from "../components/OrderForm";
import OrderView from "../components/OrderView";

import {
  fetchOrders,
  updateOrder,
  deleteOrder
} from "../utils/supabase";
import Footer from "../components/Footer";
// ...
<Footer />


export default function Delivered({ user, onLogout }) {
  const isAdmin = user?.role === "admin";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState("list"); // list | view | form
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    setSelectedOrder(order);
    setView("view");
  }

  function handleEdit(order) {
    if (!isAdmin)
      return alert("Solo l'admin può modificare un ordine consegnato.");

    setSelectedOrder(order);
    setView("form");
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
    setView("list");
  }

  return (<div className="main-content">
    <div>
      <Navbar onLogout={onLogout} />

      <div className="container-max mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Ordini Consegnati</h2>

        {view === "list" && (
          <DeliveredList
            orders={orders}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        )}

        {view === "view" && selectedOrder && (
          <OrderView
            order={selectedOrder}
            onClose={() => setView("list")}
          />
        )}

        {view === "form" && selectedOrder && (
          <OrderForm
            initial={selectedOrder}
            onSave={handleSave}
            onCancel={() => setView("list")}
          />
        )}
      </div>
    </div></div>
  );
}
