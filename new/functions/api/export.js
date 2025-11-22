import { corsHeaders } from '../_utils.js';

export async function onRequest({ env }) {
  let groups;
  try {
    groups = await env.DB.prepare('SELECT id, name, is_private, bg_color, bg_image, order_index FROM Groups ORDER BY order_index ASC, id ASC').all();
  } catch {
    groups = await env.DB.prepare('SELECT id, name, is_private, bg_color, bg_image, order_num as order_index FROM Groups ORDER BY order_num ASC, id ASC').all();
  }
  const links = await env.DB.prepare('SELECT id, group_id, name, url, description, logo, order_index FROM Links ORDER BY order_index ASC, id ASC').all();
  const settingsRow = await env.DB.prepare('SELECT * FROM Settings WHERE id = 1').first();
  let theme = {};
  try { theme = settingsRow?.theme_json ? JSON.parse(settingsRow.theme_json) : {}; } catch {}
  const payload = {
    version: 'new',
    groups: groups.results || [],
    links: links.results || [],
    settings: {
      page_bg_color: settingsRow?.page_bg_color || null,
      page_bg_image: settingsRow?.page_bg_image || null,
      nav_bg_color: settingsRow?.nav_bg_color || null,
      nav_bg_image: settingsRow?.nav_bg_image || null,
      theme
    }
  };
  return new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
}