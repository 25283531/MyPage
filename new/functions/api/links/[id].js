import { corsHeaders, readJson, verifyAdmin } from '../../_utils.js';

export async function onRequest({ request, env, params }) {
  if (request.method === 'OPTIONS') return new Response('', { headers: corsHeaders() });
  const ok = await verifyAdmin(request, env);
  if (!ok) return new Response(JSON.stringify({ error: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  const id = Number(params.id);
  if (request.method === 'PUT') {
    const { group_id, name, url, description, logo, order_index } = await readJson(request);
    await env.DB.prepare('UPDATE Links SET group_id = COALESCE(?, group_id), name = COALESCE(?, name), url = COALESCE(?, url), description = COALESCE(?, description), logo = COALESCE(?, logo), order_index = COALESCE(?, order_index), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(group_id || null, name || null, url || null, description || null, logo || null, order_index || null, id).run();
    const row = await env.DB.prepare('SELECT id, group_id, name, url, description, logo, order_index FROM Links WHERE id = ?').bind(id).first();
    return new Response(JSON.stringify(row), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM Links WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
}