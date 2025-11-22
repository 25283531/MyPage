import { corsHeaders, readJson, generateToken } from '../_utils.js';

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') {
    return new Response('', { headers: corsHeaders() });
  }
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
  }
  const { password } = await readJson(request);
  if (!password) {
    return new Response(JSON.stringify({ error: '缺少密码' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
  if (password !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: '密码错误' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
  const token = await generateToken(env);
  return new Response(JSON.stringify({ token }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
}