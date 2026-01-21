import { supabase } from "./supabase";

/* FETCH */
export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

/* INSERT */
export async function insertProduct(product) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      image_url: product.image_url,
      price_retail: product.price_retail,
      price_wh_10: product.price_wh_10,
      price_wh_20: product.price_wh_20,
      price_wh_50: product.price_wh_50,
      price_wh_100: product.price_wh_100,
      price_wh_100_plus: product.price_wh_100_plus
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* UPDATE */
export async function updateProduct(product) {
  const { data, error } = await supabase
    .from("products")
    .update({
      name: product.name,
      image_url: product.image_url,
      price_retail: product.price_retail,
      price_wh_10: product.price_wh_10,
      price_wh_20: product.price_wh_20,
      price_wh_50: product.price_wh_50,
      price_wh_100: product.price_wh_100,
      price_wh_100_plus: product.price_wh_100_plus,
      updated_at: new Date().toISOString()
    })
    .eq("id", product.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* DELETE */
export async function deleteProduct(id) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/* UPLOAD IMAGE */
export async function uploadProductImage(file) {
  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("products")
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("products")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
