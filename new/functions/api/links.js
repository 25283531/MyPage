import { corsHeaders, readJson, verifyAdmin } from '../_utils.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response('', { headers: corsHeaders() });
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const groupId = url.searchParams.get('group_id');
    const isAdmin = await verifyAdmin(request, env);
    let rows;
    try {
      let stmt = 'SELECT id, group_id, name, url, description, logo, order_index FROM Links';
      if (!isAdmin) stmt += ' WHERE group_id IN (SELECT id FROM Groups WHERE is_private = FALSE)';
      if (groupId) stmt += (stmt.includes('WHERE') ? ' AND' : ' WHERE') + ' group_id = ? ORDER BY order_index ASC, id ASC';
      else stmt += ' ORDER BY order_index ASC, id ASC';
      rows = groupId ? await env.DB.prepare(stmt).bind(Number(groupId)).all() : await env.DB.prepare(stmt).all();
    } catch (err) {
      let stmt = 'SELECT id, group_id, name, url, description, logo, order_num as order_index FROM Links';
      if (groupId) stmt += ' WHERE group_id = ? ORDER BY order_num ASC, id ASC';
      else stmt += ' ORDER BY order_num ASC, id ASC';
      rows = groupId ? await env.DB.prepare(stmt).bind(Number(groupId)).all() : await env.DB.prepare(stmt).all();
    }
    return new Response(JSON.stringify(rows.results || []), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
  const ok = await verifyAdmin(request, env);
  if (!ok) return new Response(JSON.stringify({ error: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  if (request.method === 'POST') {
    const { group_id, name, url, description, logo } = await readJson(request);
    const maxRow = await env.DB.prepare('SELECT COALESCE(MAX(order_index),0) as max_order FROM Links WHERE group_id = ?').bind(group_id).first();
    const order_index = (maxRow?.max_order || 0) + 1;
    const result = await env.DB.prepare('INSERT INTO Links (group_id, name, url, description, logo, order_index) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(group_id, name, url, description || null, logo || null, order_index).run();
    const row = await env.DB.prepare('SELECT id, group_id, name, url, description, logo, order_index FROM Links WHERE id = ?').bind(result.lastRowId).first();
    return new Response(JSON.stringify(row), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
}