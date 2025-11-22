import { corsHeaders, readJson, verifyAdmin } from '../_utils.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response('', { headers: corsHeaders() });
  if (request.method === 'GET') {
    const isAdmin = await verifyAdmin(request, env);
    try {
      const sql = `SELECT id, name, is_private, bg_color, bg_image, order_index FROM Groups ${isAdmin ? '' : 'WHERE is_private = FALSE'} ORDER BY order_index ASC, id ASC`;
      const rows = await env.DB.prepare(sql).all();
      return new Response(JSON.stringify(rows.results || []), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
    } catch (err) {
      const sql = `SELECT id, name, bg_color, bg_image, order_num as order_index FROM Groups ORDER BY order_num ASC, id ASC`;
      const rows = await env.DB.prepare(sql).all();
      return new Response(JSON.stringify(rows.results || []), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
    }
  }
  const ok = await verifyAdmin(request, env);
  if (!ok) return new Response(JSON.stringify({ error: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  if (request.method === 'POST') {
    const { name, is_private, bg_color, bg_image } = await readJson(request);
    const maxRow = await env.DB.prepare('SELECT COALESCE(MAX(order_index), 0) as max_order FROM Groups').first();
    const order_index = (maxRow?.max_order || 0) + 1;
    const result = await env.DB.prepare('INSERT INTO Groups (name, is_private, bg_color, bg_image, order_index) VALUES (?, ?, ?, ?, ?)').bind(name, !!is_private, bg_color || null, bg_image || null, order_index).run();
    const row = await env.DB.prepare('SELECT id, name, is_private, bg_color, bg_image, order_index FROM Groups WHERE id = ?').bind(result.lastRowId).first();
    return new Response(JSON.stringify(row), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
}