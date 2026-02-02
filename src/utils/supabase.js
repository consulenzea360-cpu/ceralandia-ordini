// supabase utility JS
import { createClient } from "@supabase/supabase-js";
import { sortByConsegnaAsc, sortByConsegnaDesc } from "./datehelpers";

const SUPABASE_URL = "https://ekmehzzcrqcesycfxshq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbWVoenpjcnFjZXN5Y2Z4c2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDk3ODAsImV4cCI6MjA4MDQyNTc4MH0.si2ryCeyPQftwwEgdczzEMmigQRkDpvvrMggRinB-38";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --------------------------------------------------
// FETCH ORDERS
// --------------------------------------------------
export async function fetchOrders({ deliveredFlag = false } = {}) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  if (error) throw error;

  const filtered = deliveredFlag
    ? data.filter((o) => o.stato === "consegnato")
    : data.filter((o) => o.stato !== "consegnato");

  return deliveredFlag ? sortByConsegnaDesc(filtered) : sortByConsegnaAsc(filtered);
}

// --------------------------------------------------
// INSERT ORDER
// --------------------------------------------------
export async function insertOrder(order) {
  const payload = {
    cliente: order.cliente,
    telefono: order.telefono,
    operatore: order.operatore,
    lavoratore: order.lavoratore,
    prodotti: order.prodotti,
    stato: order.stato,
    numero: order.numero,
    created_at: order.created_at || new Date().toISOString(),
    consegna: order.consegna ? order.consegna.split("T")[0] : null
  };

  const { data, error } = await supabase
    .from("orders")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --------------------------------------------------
// UPDATE ORDER
// --------------------------------------------------
export async function updateOrder(order) {
  const payload = {
    cliente: order.cliente,
    telefono: order.telefono,
    operatore: order.operatore,
    lavoratore: order.lavoratore,
    prodotti: order.prodotti,
    stato: order.stato,
    consegna: order.consegna ? order.consegna.split("T")[0] : null
  };

  const { data, error } = await supabase
    .from("orders")
    .update(payload)
    .eq("id", order.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --------------------------------------------------
// DELETE ORDER (solo admin)
// --------------------------------------------------
export async function deleteOrder(id) {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}

// ==================================================
// PRODUCTS (CATALOGO) CRUD  -> tabella: products_catalog
// ==================================================

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products_catalog")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function insertProduct(product) {
  const payload = {
    nome: product?.nome ?? "",
    immagine: product?.immagine ?? "",
    prezzo_dettaglio: product?.prezzo_dettaglio ?? "",
    prezzo_10: product?.prezzo_10 ?? "",
    prezzo_20: product?.prezzo_20 ?? "",
    prezzo_50: product?.prezzo_50 ?? "",
    prezzo_100: product?.prezzo_100 ?? "",
    prezzo_100_plus: product?.prezzo_100_plus ?? ""
  };

  const { data, error } = await supabase
    .from("products_catalog")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(product) {
  if (!product?.id) throw new Error("updateProduct: missing id");

  const payload = {
    nome: product?.nome ?? "",
    immagine: product?.immagine ?? "",
    prezzo_dettaglio: product?.prezzo_dettaglio ?? "",
    prezzo_10: product?.prezzo_10 ?? "",
    prezzo_20: product?.prezzo_20 ?? "",
    prezzo_50: product?.prezzo_50 ?? "",
    prezzo_100: product?.prezzo_100 ?? "",
    prezzo_100_plus: product?.prezzo_100_plus ?? ""
  };

  const { data, error } = await supabase
    .from("products_catalog")
    .update(payload)
    .eq("id", product.id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from("products_catalog").delete().eq("id", id);
  if (error) throw error;
}
