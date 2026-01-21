import { supabase } from "./supabase";

// FETCH PRODOTTI (tutti possono leggere)
export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

// INSERT (solo admin)
export async function insertProduct(product) {
  const { error } = await supabase
    .from("products")
    .insert(product);

  if (error) throw error;
}

// UPDATE (solo admin)
export async function updateProduct(id, product) {
  const { error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id);

  if (error) throw error;
}

// DELETE (solo admin)
export async function deleteProduct(id) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
