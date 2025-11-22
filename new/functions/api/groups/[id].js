import { corsHeaders, readJson, verifyAdmin } from '../../_utils.js';

export async function onRequest({ request, env, params }) {
  if (request.method === 'OPTIONS') return new Response('', { headers: corsHeaders() });
  const ok = await verifyAdmin(request, env);
  if (!ok) return new Response(JSON.stringify({ error: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  const id = Number(params.id);
  if (request.method === 'PUT') {
    const { name, is_private, bg_color, bg_image, order_index } = await readJson(request);
    await env.DB.prepare('UPDATE Groups SET name = COALESCE(?, name), is_private = COALESCE(?, is_private), bg_color = ?, bg_image = ?, order_index = COALESCE(?, order_index), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(name || null, typeof is_private === 'boolean' ? is_private : null, bg_color || null, bg_image || null, order_index || null, id).run();
    const row = await env.DB.prepare('SELECT id, name, is_private, bg_color, bg_image, order_index FROM Groups WHERE id = ?').bind(id).first();
    return new Response(JSON.stringify(row), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM Links WHERE group_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM Groups WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
}