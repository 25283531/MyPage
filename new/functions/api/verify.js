import { corsHeaders, verifyAdmin } from '../_utils.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') {
    return new Response('', { headers: corsHeaders() });
  }
  const ok = await verifyAdmin(request, env);
  if (!ok) {
    return new Response(JSON.stringify({ error: '未登录' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
}