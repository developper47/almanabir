import { NextResponse } from 'next/server';

export const AUTH_COOKIE_NAME = 'auth_token';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing in production. Set it in your deployment settings.');
    }
    // Fallback solely for local development
    return 'almanabir-dev-only-secret-key-32-chars-min-change-in-env!';
  }
  if (secret.length < 32) {
    console.warn('SECURITY WARNING: JWT_SECRET should be at least 32 characters long for cryptographic security.');
  }
  return secret;
}

async function getSecretKey() {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(getJwtSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(pad);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function base64UrlDecodeToBytes(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(pad);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Sign a payload with HMAC-SHA256 (default 24h validity for security)
 */
export async function signToken(payload, expiresInSeconds = 24 * 3600) {
  const key = await getSecretKey();
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);

  const signature = await crypto.subtle.sign('HMAC', key, data);
  const sigBytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < sigBytes.byteLength; i++) {
    binary += String.fromCharCode(sigBytes[i]);
  }
  const sigB64 = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${headerB64}.${payloadB64}.${sigB64}`;
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const [headerB64, payloadB64, sigB64] = parts;
    const header = JSON.parse(base64UrlDecode(headerB64));
    
    // Explicitly verify expected algorithm to prevent algorithm confusion attacks
    if (header.alg !== 'HS256') {
      return null;
    }

    const key = await getSecretKey();
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const sigBytes = base64UrlDecodeToBytes(sigB64);

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, data);
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Extract authenticated user from Request (cookies or Authorization header)
 */
export async function getUserFromRequest(req) {
  try {
    // 1. Try Cookie
    let token = null;
    if (req.cookies && typeof req.cookies.get === 'function') {
      token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    } else {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
      if (match) token = match[1];
    }

    // 2. Try Authorization Bearer
    if (!token) {
      const authHeader = req.headers.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) return null;
    return await verifyToken(token);
  } catch (err) {
    return null;
  }
}

/**
 * Require valid logged-in user
 */
export async function requireAuth(req) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'غير مصرح بالدخول، يرجى تسجيل الدخول أولاً' },
        { status: 401 }
      )
    };
  }
  return { authorized: true, user };
}

/**
 * Require admin role
 */
export async function requireAdmin(req) {
  const auth = await requireAuth(req);
  if (!auth.authorized) return auth;

  if (auth.user.role !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'صلاحيات غير كافية، يتطلب حساب مدير' },
        { status: 403 }
      )
    };
  }
  return auth;
}

/**
 * Attach httpOnly auth cookie to response (maxAge: 24 hours)
 */
export function setAuthCookie(response, token) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 3600 // 24 hours
  });
  return response;
}

/**
 * Clear auth cookie from response
 */
export function clearAuthCookie(response) {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
  return response;
}
