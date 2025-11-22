import { corsHeaders, verifyAdmin } from '../_utils.js';

export async function onRequest({ request, env }) {
  const isAdmin = await verifyAdmin(request, env);
  let groups, links;
  try {
    const gsql = `SELECT id, name, is_private, bg_color, bg_image, order_index FROM Groups ${isAdmin ? '' : 'WHERE is_private = FALSE'} ORDER BY order_index ASC, id ASC`;
    groups = await env.DB.prepare(gsql).all();
  } catch (err) {
    const gsql = `SELECT id, name, bg_color, bg_image, order_num as order_index FROM Groups ORDER BY order_num ASC, id ASC`;
    groups = await env.DB.prepare(gsql).all();
  }
  try {
    const lsql = `SELECT id, group_id, name, url, description, logo, order_index FROM Links ${isAdmin ? '' : 'WHERE group_id IN (SELECT id FROM Groups WHERE is_private = FALSE)'} ORDER BY order_index ASC, id ASC`;
    links = await env.DB.prepare(lsql).all();
  } catch (err) {
    const lsql = `SELECT id, group_id, name, url, description, logo, order_num as order_index FROM Links ORDER BY order_num ASC, id ASC`;
    links = await env.DB.prepare(lsql).all();
  }
  return new Response(JSON.stringify({ groups: groups.results || [], links: links.results || [] }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
}