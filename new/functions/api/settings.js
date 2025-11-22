import { corsHeaders, readJson, verifyAdmin } from '../_utils.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response('', { headers: corsHeaders() });
  if (request.method === 'GET') {
    const row = await env.DB.prepare('SELECT * FROM Settings WHERE id = 1').first();
    let theme = {};
    if (row && row.theme_json) {
      try { theme = JSON.parse(row.theme_json); } catch {}
    }
    return new Response(JSON.stringify({
      page_bg_color: row?.page_bg_color || null,
      page_bg_image: row?.page_bg_image || null,
      nav_bg_color: row?.nav_bg_color || null,
      nav_bg_image: row?.nav_bg_image || null,
      theme
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
  const ok = await verifyAdmin(request, env);
  if (!ok) return new Response(JSON.stringify({ error: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  if (request.method === 'PUT') {
    const { page_bg_color, page_bg_image, nav_bg_color, nav_bg_image, theme } = await readJson(request);
    const exists = await env.DB.prepare('SELECT id FROM Settings WHERE id = 1').first();
    if (exists) {
      await env.DB.prepare('UPDATE Settings SET page_bg_color = ?, page_bg_image = ?, nav_bg_color = ?, nav_bg_image = ?, theme_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
        .bind(page_bg_color || null, page_bg_image || null, nav_bg_color || null, nav_bg_image || null, theme ? JSON.stringify(theme) : null).run();
    } else {
      await env.DB.prepare('INSERT INTO Settings (id, page_bg_color, page_bg_image, nav_bg_color, nav_bg_image, theme_json) VALUES (1, ?, ?, ?, ?, ?)')
        .bind(page_bg_color || null, page_bg_image || null, nav_bg_color || null, nav_bg_image || null, theme ? JSON.stringify(theme) : null).run();
    }
    return new Response(JSON.stringify({
      id: 1,
      page_bg_color,
      page_bg_image,
      nav_bg_color,
      nav_bg_image,
      theme: theme || {}
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
}