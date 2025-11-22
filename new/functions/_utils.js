export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function base64Encode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function base64Decode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

export async function generateToken(env) {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    iat: Math.floor(Date.now() / 1000),
    admin: true
  };
  const encodedPayload = base64Encode(JSON.stringify(payload));
  const signature = base64Encode((env.JWT_SECRET || '') + encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifyToken(token, env) {
  try {
    const [encodedPayload, signature] = token.split('.');
    const expectedSignature = base64Encode((env.JWT_SECRET || '') + encodedPayload);
    if (signature !== expectedSignature) return false;
    const payload = JSON.parse(base64Decode(encodedPayload));
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    return payload.admin === true;
  } catch {
    return false;
  }
}

export async function verifyAdmin(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.split(' ')[1];
  return await verifyToken(token, env);
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}