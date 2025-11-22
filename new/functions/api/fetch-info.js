import { corsHeaders, readJson } from '../_utils.js';

export async function onRequest({ request }) {
  if (request.method === 'OPTIONS') return new Response('', { headers: corsHeaders() });
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
  const { url } = await readJson(request);
  try {
    const resp = await fetch(url, { redirect: 'follow' });
    const html = await resp.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    const description = descMatch ? descMatch[1].trim() : '';
    const iconMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["'][^>]*>/i);
    let icon = iconMatch ? iconMatch[1] : '';
    if (icon && icon.startsWith('/')) {
      const u = new URL(url);
      icon = `${u.origin}${icon}`;
    }
    return new Response(JSON.stringify({ title, description, icon }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  } catch {
    return new Response(JSON.stringify({ error: '获取网页信息失败' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
}