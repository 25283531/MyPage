import { corsHeaders, readJson, verifyAdmin } from '../_utils.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') return new Response('', { headers: corsHeaders() });
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
  const ok = await verifyAdmin(request, env);
  if (!ok) return new Response(JSON.stringify({ error: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  const data = await readJson(request);
  const groups = Array.isArray(data.groups) ? data.groups : [];
  const links = Array.isArray(data.links) ? data.links : [];
  const settings = data.settings || {};
  await env.DB.prepare('BEGIN').run();
  try {
    await env.DB.prepare('DELETE FROM Links').run();
    await env.DB.prepare('DELETE FROM Groups').run();
    for (const g of groups) {
      const id = g.id != null ? Number(g.id) : undefined;
      const name = g.name;
      const is_private = g.is_private != null ? !!g.is_private : false;
      const bg_color = g.bg_color || null;
      const bg_image = g.bg_image || null;
      const order_index = g.order_index != null ? Number(g.order_index) : (g.order_num != null ? Number(g.order_num) : 0);
      if (id != null) {
        await env.DB.prepare('INSERT INTO Groups (id, name, is_private, bg_color, bg_image, order_index) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(id, name, is_private, bg_color, bg_image, order_index).run();
      } else {
        await env.DB.prepare('INSERT INTO Groups (name, is_private, bg_color, bg_image, order_index) VALUES (?, ?, ?, ?, ?)')
          .bind(name, is_private, bg_color, bg_image, order_index).run();
      }
    }
    for (const l of links) {
      const id = l.id != null ? Number(l.id) : undefined;
      const group_id = Number(l.group_id);
      const name = l.name;
      const url = l.url;
      const description = l.description || null;
      const logo = l.logo || null;
      const order_index = l.order_index != null ? Number(l.order_index) : (l.order_num != null ? Number(l.order_num) : 0);
      if (id != null) {
        await env.DB.prepare('INSERT INTO Links (id, group_id, name, url, description, logo, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(id, group_id, name, url, description, logo, order_index).run();
      } else {
        await env.DB.prepare('INSERT INTO Links (group_id, name, url, description, logo, order_index) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(group_id, name, url, description, logo, order_index).run();
      }
    }
    const theme_json = settings.theme ? JSON.stringify(settings.theme) : null;
    const exists = await env.DB.prepare('SELECT id FROM Settings WHERE id = 1').first();
    if (exists) {
      await env.DB.prepare('UPDATE Settings SET page_bg_color = ?, page_bg_image = ?, nav_bg_color = ?, nav_bg_image = ?, theme_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
        .bind(settings.page_bg_color || null, settings.page_bg_image || null, settings.nav_bg_color || null, settings.nav_bg_image || null, theme_json).run();
    } else {
      await env.DB.prepare('INSERT INTO Settings (id, page_bg_color, page_bg_image, nav_bg_color, nav_bg_image, theme_json) VALUES (1, ?, ?, ?, ?, ?)')
        .bind(settings.page_bg_color || null, settings.page_bg_image || null, settings.nav_bg_color || null, settings.nav_bg_image || null, theme_json).run();
    }
    await env.DB.prepare('COMMIT').run();
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  } catch (error) {
    await env.DB.prepare('ROLLBACK').run();
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
}