export const STORAGE_KEY = 'ceralandia_orders'
export const COUNTER_KEY = 'ceralandia_order_counter'


export function nowISO(){ return new Date().toISOString() }
export function formatDateTimeLocal(iso){ const d=new Date(iso); return isNaN(d.getTime())?"-":d.toLocaleString() }


export function nextId(){
const cur = parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10)
const next = cur + 1
localStorage.setItem(COUNTER_KEY, String(next))
return next
}


export function loadOrders(){
try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : [] }catch(e){ return [] }
}


export function saveOrders(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) }